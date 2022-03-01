/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./dialog.scss";

import { action, computed, makeObservable, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";

import { serviceAccountsStore } from "../+service-accounts/store";
import { ClusterRole, ClusterRoleBinding, ClusterRoleBindingSubject, ServiceAccount } from "../../../../common/k8s-api/endpoints";
import { Dialog, DialogProps } from "../../dialog";
import { EditableList } from "../../editable-list";
import { Icon } from "../../icon";
import { showDetails } from "../../kube-detail-params";
import { SubTitle } from "../../layout/sub-title";
import { Notifications } from "../../notifications";
import { Select, SelectOption } from "../../select";
import { Wizard, WizardStep } from "../../wizard";
import { clusterRoleBindingsStore } from "./store";
import { clusterRolesStore } from "../+cluster-roles/store";
import { ObservableHashSet, nFircate } from "../../../utils";
import { Input } from "../../input";
import { TooltipPosition } from "../../tooltip";

export interface ClusterRoleBindingDialogProps extends Partial<DialogProps> {
}

interface DialogState {
  isOpen: boolean;
  data?: ClusterRoleBinding;
}

@observer
export class ClusterRoleBindingDialog extends React.Component<ClusterRoleBindingDialogProps> {
  static state = observable.object<DialogState>({
    isOpen: false,
  });

  constructor(props: ClusterRoleBindingDialogProps) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.isEditing, () => {
        this.bindingName = ClusterRoleBindingDialog.state.data?.getName();
      }),
    ]);
  }

  static open(roleBinding?: ClusterRoleBinding) {
    ClusterRoleBindingDialog.state.isOpen = true;
    ClusterRoleBindingDialog.state.data = roleBinding;
  }

  static close() {
    ClusterRoleBindingDialog.state.isOpen = false;
  }

  get clusterRoleBinding(): ClusterRoleBinding {
    return ClusterRoleBindingDialog.state.data;
  }

  @computed get isEditing() {
    return !!this.clusterRoleBinding;
  }

  @observable selectedRoleRef: ClusterRole | undefined = undefined;
  @observable bindingName = "";
  selectedAccounts = new ObservableHashSet<ServiceAccount>([], sa => sa.metadata.uid);
  selectedUsers = observable.set<string>([]);
  selectedGroups = observable.set<string>([]);

  @computed get selectedBindings(): ClusterRoleBindingSubject[] {
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

  @computed get clusterRoleRefoptions(): SelectOption<ClusterRole>[] {
    return clusterRolesStore.items.map(value => ({
      value,
      label: value.getName(),
    }));
  }

  @computed get serviceAccountOptions(): SelectOption<ServiceAccount>[] {
    return serviceAccountsStore.items.map(account => ({
      value: account,
      label: `${account.getName()} (${account.getNs()})`,
    }));
  }

  @computed get selectedServiceAccountOptions(): SelectOption<ServiceAccount>[] {
    return this.serviceAccountOptions.filter(({ value }) => this.selectedAccounts.has(value));
  }

  onOpen = action(() => {
    const binding = this.clusterRoleBinding;

    if (!binding) {
      return this.reset();
    }

    this.selectedRoleRef = clusterRolesStore
      .items
      .find(item => item.getName() === binding.roleRef.name);
    this.bindingName = this.clusterRoleBinding.getName();

    const [saSubjects, uSubjects, gSubjects] = nFircate(binding.getSubjects(), "kind", ["ServiceAccount", "User", "Group"]);
    const accountNames = new Set(saSubjects.map(acc => acc.name));

    this.selectedAccounts.replace(
      serviceAccountsStore.items
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
    const { selectedRoleRef, selectedBindings, bindingName } = this;

    try {
      const { selfLink } = this.isEditing
        ? await clusterRoleBindingsStore.updateSubjects(this.clusterRoleBinding, selectedBindings)
        : await clusterRoleBindingsStore.create({ name: bindingName }, {
          subjects: selectedBindings,
          roleRef: {
            name: selectedRoleRef.getName(),
            kind: selectedRoleRef.kind,
          },
        });

      showDetails(selfLink);
      ClusterRoleBindingDialog.close();
    } catch (err) {
      Notifications.error(err);
    }
  };

  renderContents() {
    return (
      <>
        <SubTitle title="Cluster Role Reference" />
        <Select
          themeName="light"
          placeholder="Select cluster role ..."
          isDisabled={this.isEditing}
          options={this.clusterRoleRefoptions}
          value={this.selectedRoleRef}
          autoFocus={!this.isEditing}
          formatOptionLabel={({ value }: SelectOption<ClusterRole>) => (
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
          onChange={({ value }: SelectOption<ClusterRole> ) => {
            if (!this.selectedRoleRef || this.bindingName === this.selectedRoleRef.getName()) {
              this.bindingName = value.getName();
            }

            this.selectedRoleRef = value;
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
          isMulti
          themeName="light"
          placeholder="Select service accounts ..."
          autoConvertOptions={false}
          options={this.serviceAccountOptions}
          value={this.selectedServiceAccountOptions}
          formatOptionLabel={({ value }: SelectOption<ServiceAccount>) => (
            <><Icon small material="account_box" /> {value.getName()} ({value.getNs()})</>
          )}
          onChange={(selected: SelectOption<ServiceAccount>[] | null) => {
            if (selected) {
              this.selectedAccounts.replace(selected.map(opt => opt.value));
            } else {
              this.selectedAccounts.clear();
            }
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
        isOpen={ClusterRoleBindingDialog.state.isOpen}
        close={ClusterRoleBindingDialog.close}
        onClose={this.reset}
        onOpen={this.onOpen}
      >
        <Wizard
          header={<h5>{action} ClusterRoleBinding</h5>}
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
