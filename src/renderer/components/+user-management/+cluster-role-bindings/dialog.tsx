/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./dialog.scss";

import { action, computed, makeObservable, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";

import { serviceAccountStore } from "../+service-accounts/legacy-store";
import type { ClusterRole, ClusterRoleBinding, ServiceAccount } from "../../../../common/k8s-api/endpoints";
import type { DialogProps } from "../../dialog";
import { Dialog } from "../../dialog";
import { EditableList } from "../../editable-list";
import { Icon } from "../../icon";
import { showDetails } from "../../kube-detail-params";
import { SubTitle } from "../../layout/sub-title";
import { Notifications } from "../../notifications";
import { Select } from "../../select";
import { Wizard, WizardStep } from "../../wizard";
import { clusterRoleBindingStore } from "./legacy-store";
import { clusterRoleStore } from "../+cluster-roles/legacy-store";
import { ObservableHashSet, nFircate } from "../../../utils";
import { Input } from "../../input";
import { TooltipPosition } from "../../tooltip";
import type { Subject } from "../../../../common/k8s-api/endpoints/types/subject";

export interface ClusterRoleBindingDialogProps extends Partial<DialogProps> {
}

interface DialogState {
  isOpen: boolean;
  data?: ClusterRoleBinding;
}

const dialogState = observable.object<DialogState>({
  isOpen: false,
});

@observer
export class ClusterRoleBindingDialog extends React.Component<ClusterRoleBindingDialogProps> {
  constructor(props: ClusterRoleBindingDialogProps) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.isEditing, () => {
        this.bindingName = dialogState.data?.getName() ?? "";
      }),
    ]);
  }

  static open(roleBinding?: ClusterRoleBinding) {
    dialogState.isOpen = true;
    dialogState.data = roleBinding;
  }

  static close() {
    dialogState.isOpen = false;
  }

  get clusterRoleBinding() {
    return dialogState.data;
  }

  get isEditing() {
    return !!this.clusterRoleBinding;
  }

  @observable selectedRoleRef: ClusterRole | undefined = undefined;
  @observable bindingName = "";
  selectedAccounts = new ObservableHashSet<ServiceAccount>([], sa => sa.metadata.uid);
  selectedUsers = observable.set<string>([]);
  selectedGroups = observable.set<string>([]);

  @computed get selectedBindings(): Subject[] {
    const serviceAccounts = Array.from(this.selectedAccounts, sa => ({
      name: sa.getName(),
      kind: "ServiceAccount" as const,
      namespace: sa.getNs(),
    }));
    const users = Array.from(this.selectedUsers, user => ({
      name: user,
      kind: "User" as const,
    }));
    const groups = Array.from(this.selectedGroups, group => ({
      name: group,
      kind: "Group" as const,
    }));

    return [
      ...serviceAccounts,
      ...users,
      ...groups,
    ];
  }

  onOpen = action(() => {
    const binding = this.clusterRoleBinding;

    if (!binding) {
      return this.reset();
    }

    this.selectedRoleRef = clusterRoleStore
      .items
      .find(item => item.getName() === binding.roleRef.name);
    this.bindingName = binding.getName();

    const [saSubjects, uSubjects, gSubjects] = nFircate(binding.getSubjects(), "kind", ["ServiceAccount", "User", "Group"]);
    const accountNames = new Set(saSubjects.map(acc => acc.name));

    this.selectedAccounts.replace(
      serviceAccountStore.items
        .filter(sa => accountNames.has(sa.getName())),
    );
    this.selectedUsers.replace(uSubjects.map(user => user.name));
    this.selectedGroups.replace(gSubjects.map(group => group.name));
  });

  reset = action(() => {
    this.selectedRoleRef = undefined;
    this.bindingName = "";
    this.selectedAccounts.clear();
    this.selectedUsers.clear();
    this.selectedGroups.clear();
  });

  createBindings = async () => {
    const { selectedRoleRef, selectedBindings, bindingName, clusterRoleBinding } = this;

    if (!clusterRoleBinding || !selectedRoleRef) {
      return;
    }

    try {
      const { selfLink } = this.isEditing
        ? await clusterRoleBindingStore.updateSubjects(clusterRoleBinding, selectedBindings)
        : await clusterRoleBindingStore.create({ name: bindingName }, {
          subjects: selectedBindings,
          roleRef: {
            name: selectedRoleRef.getName(),
            kind: selectedRoleRef.kind,
          },
        });

      showDetails(selfLink);
      ClusterRoleBindingDialog.close();
    } catch (err) {
      Notifications.checkedError(err, `Unknown error occured while ${this.isEditing ? "editing the" : "creating a"} ClusterRoleBinding`);
    }
  };

  renderContents() {
    return (
      <>
        <SubTitle title="Cluster Role Reference" />
        <Select
          id="cluster-role-input"
          themeName="light"
          placeholder="Select cluster role ..."
          isDisabled={this.isEditing}
          options={clusterRoleStore.items.slice()}
          value={this.selectedRoleRef}
          autoFocus={!this.isEditing}
          formatOptionLabel={value => (
            <>
              <Icon
                small
                material={value.kind === "Role" ? "person" : "people"}
                tooltip={{
                  preferredPositions: TooltipPosition.LEFT,
                  children: value.kind,
                }}
              />
              {" "}
              {value.getName()}
            </>
          )}
          getOptionLabel={value => value.getName()}
          onChange={value => {
            this.selectedRoleRef = value ?? undefined;

            if (!this.selectedRoleRef || this.bindingName === this.selectedRoleRef.getName()) {
              this.bindingName = value?.getName() ?? "";
            }
          }}
        />

        <SubTitle title="Binding Name" />
        <Input
          placeholder="Name of ClusterRoleBinding ..."
          disabled={this.isEditing}
          value={this.bindingName}
          onChange={val => this.bindingName = val}
        />

        <SubTitle title="Binding targets" />

        <b>Users</b>
        <EditableList
          placeholder="Bind to User Account ..."
          add={(newUser) => this.selectedUsers.add(newUser)}
          items={Array.from(this.selectedUsers)}
          remove={({ oldItem }) => this.selectedUsers.delete(oldItem)}
        />

        <b>Groups</b>
        <EditableList
          placeholder="Bind to User Group ..."
          add={(newGroup) => this.selectedGroups.add(newGroup)}
          items={Array.from(this.selectedGroups)}
          remove={({ oldItem }) => this.selectedGroups.delete(oldItem)}
        />

        <b>Service Accounts</b>
        <Select
          id="service-account-input"
          isMulti
          themeName="light"
          placeholder="Select service accounts ..."
          options={serviceAccountStore.items.slice()}
          formatOptionLabel={value => (
            <>
              <Icon small material="account_box" />
              {` ${value.getName()} (${value.getNs()})`}
            </>
          )}
          getOptionLabel={value => `${value.getName()} (${value.getNs()})`}
          onChange={selected => {
            this.selectedAccounts.replace(selected);
          }}
          maxMenuHeight={200}
        />
      </>
    );
  }

  render() {
    const { ...dialogProps } = this.props;
    const [action, nextLabel] = this.isEditing ? ["Edit", "Update"] : ["Add", "Create"];
    const disableNext = !this.selectedRoleRef || !this.selectedBindings.length || !this.bindingName;

    return (
      <Dialog
        {...dialogProps}
        className="AddClusterRoleBindingDialog"
        isOpen={dialogState.isOpen}
        close={ClusterRoleBindingDialog.close}
        onClose={this.reset}
        onOpen={this.onOpen}
      >
        <Wizard
          header={(
            <h5>
              {`${action} ClusterRoleBinding`}
            </h5>
          )}
          done={ClusterRoleBindingDialog.close}
        >
          <WizardStep
            nextLabel={nextLabel}
            next={this.createBindings}
            disabledNext={disableNext}
          >
            {this.renderContents()}
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
