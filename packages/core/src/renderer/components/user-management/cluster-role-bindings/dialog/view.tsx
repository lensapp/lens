/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import type { IObservableValue } from "mobx";
import { action, computed, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";

import type { ClusterRole, ServiceAccount, Subject } from "@k8slens/kube-object";
import type { DialogProps } from "../../../dialog";
import { Dialog } from "../../../dialog";
import { EditableList } from "../../../editable-list";
import { Icon } from "../../../icon";
import { SubTitle } from "../../../layout/sub-title";
import { onMultiSelectFor, Select } from "../../../select";
import { Wizard, WizardStep } from "../../../wizard";
import { ObservableHashSet, iter } from "@k8slens/utilities";
import { Input } from "../../../input";
import { TooltipPosition } from "@k8slens/tooltip";
import type { ClusterRoleBindingDialogState } from "./state.injectable";
import type { ClusterRoleStore } from "../../cluster-roles/store";
import type { ServiceAccountStore } from "../../service-accounts/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import clusterRoleStoreInjectable from "../../cluster-roles/store.injectable";
import editClusterRoleBindingNameStateInjectable from "./edit-name-state.injectable";
import serviceAccountStoreInjectable from "../../service-accounts/store.injectable";
import clusterRoleBindingDialogStateInjectable from "./state.injectable";
import type { CloseClusterRoleBindingDialog } from "./close.injectable";
import type { OpenClusterRoleBindingDialog } from "./open.injectable";
import openClusterRoleBindingDialogInjectable from "./open.injectable";
import closeClusterRoleBindingDialogInjectable from "./close.injectable";
import type { ShowDetails } from "../../../kube-detail-params/show-details.injectable";
import type { ClusterRoleBindingStore } from "../store";
import clusterRoleBindingStoreInjectable from "../store.injectable";
import showDetailsInjectable from "../../../kube-detail-params/show-details.injectable";
import type { ShowCheckedErrorNotification } from "../../../notifications/show-checked-error.injectable";
import showCheckedErrorNotificationInjectable from "../../../notifications/show-checked-error.injectable";

export interface ClusterRoleBindingDialogProps extends Partial<DialogProps> {
}

interface Dependencies {
  state: IObservableValue<ClusterRoleBindingDialogState>;
  editBindingNameState: IObservableValue<string>;
  clusterRoleStore: ClusterRoleStore;
  serviceAccountStore: ServiceAccountStore;
  clusterRoleBindingStore: ClusterRoleBindingStore;
  closeClusterRoleBindingDialog: CloseClusterRoleBindingDialog;
  openClusterRoleBindingDialog: OpenClusterRoleBindingDialog;
  showDetails: ShowDetails;
  showCheckedErrorNotification: ShowCheckedErrorNotification;
}

@observer
class NonInjectedClusterRoleBindingDialog extends React.Component<ClusterRoleBindingDialogProps & Dependencies> {
  constructor(props: ClusterRoleBindingDialogProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  @computed get clusterRoleOptions() {
    return this.props.clusterRoleStore.items.map(clusterRole => ({
      value: clusterRole,
      label: clusterRole.getName(),
    }));
  }

  @computed get serviceAccountOptions() {
    return this.props.serviceAccountStore.items.map(serviceAccount => ({
      value: serviceAccount,
      label: `${serviceAccount.getName()} (${serviceAccount.getNs()})`,
      isSelected: this.selectedAccounts.has(serviceAccount),
    }));
  }

  get clusterRoleBinding() {
    return this.props.state.get().clusterRoleBinding;
  }

  get isEditing() {
    return !!this.clusterRoleBinding;
  }

  @observable selectedRoleRef: ClusterRole | undefined = undefined;
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

    this.selectedRoleRef = this.props.clusterRoleStore
      .items
      .find(item => item.getName() === binding.roleRef.name);

    const [saSubjects, uSubjects, gSubjects] = iter.nFircate(binding.getSubjects(), "kind", ["ServiceAccount", "User", "Group"]);
    const accountNames = new Set(saSubjects.map(acc => acc.name));

    this.selectedAccounts.replace(
      this.props.serviceAccountStore.items
        .filter(sa => accountNames.has(sa.getName())),
    );
    this.selectedUsers.replace(uSubjects.map(user => user.name));
    this.selectedGroups.replace(gSubjects.map(group => group.name));
  });

  reset = action(() => {
    this.selectedRoleRef = undefined;
    this.selectedAccounts.clear();
    this.selectedUsers.clear();
    this.selectedGroups.clear();
  });

  createBindings = async () => {
    const {
      closeClusterRoleBindingDialog,
      clusterRoleBindingStore,
      editBindingNameState,
      showDetails,
    } = this.props;
    const { selectedRoleRef, selectedBindings, clusterRoleBinding } = this;

    if (!clusterRoleBinding || !selectedRoleRef) {
      return;
    }

    try {
      const { selfLink } = this.isEditing
        ? await clusterRoleBindingStore.updateSubjects(clusterRoleBinding, selectedBindings)
        : await clusterRoleBindingStore.create({ name: editBindingNameState.get() }, {
          subjects: selectedBindings,
          roleRef: {
            name: selectedRoleRef.getName(),
            kind: selectedRoleRef.kind,
          },
        });

      showDetails(selfLink);
      closeClusterRoleBindingDialog();
    } catch (err) {
      this.props.showCheckedErrorNotification(err, `Unknown error occurred while ${this.isEditing ? "editing the" : "creating a"} ClusterRoleBinding`);
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
          options={this.clusterRoleOptions}
          value={this.selectedRoleRef}
          autoFocus={!this.isEditing}
          formatOptionLabel={option => (
            <>
              <Icon
                small
                material="people"
                tooltip={{
                  preferredPositions: TooltipPosition.LEFT,
                  children: option.value.kind,
                }}
              />
              {" "}
              {option.value.getName()}
            </>
          )}
          onChange={option => {
            this.selectedRoleRef = option?.value;
            const bindingName = this.props.editBindingNameState.get();

            if (!this.selectedRoleRef || bindingName === this.selectedRoleRef.getName()) {
              this.props.editBindingNameState.set(option?.value?.getName() ?? "");
            }
          }}
        />

        <SubTitle title="Binding Name" />
        <Input
          placeholder="Name of ClusterRoleBinding ..."
          disabled={this.isEditing}
          value={this.props.editBindingNameState.get()}
          onChange={val => this.props.editBindingNameState.set(val)}
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
          options={this.serviceAccountOptions}
          formatOptionLabel={option => (
            <>
              <Icon small material="account_box" />
              {" "}
              {option.label}
            </>
          )}
          onChange={onMultiSelectFor(this.selectedAccounts)}
          maxMenuHeight={200}
        />
      </>
    );
  }

  render() {
    const {
      closeClusterRoleBindingDialog,
      openClusterRoleBindingDialog,
      clusterRoleStore,
      editBindingNameState,
      serviceAccountStore,
      state,
      ...dialogProps
    } = this.props;
    const [action, nextLabel] = this.isEditing ? ["Edit", "Update"] : ["Add", "Create"];
    const disableNext = !this.selectedRoleRef || !this.selectedBindings.length || !editBindingNameState.get();

    void openClusterRoleBindingDialog;
    void clusterRoleStore;
    void serviceAccountStore;

    return (
      <Dialog
        {...dialogProps}
        className="AddClusterRoleBindingDialog"
        isOpen={state.get().isOpen}
        close={closeClusterRoleBindingDialog}
        onClose={this.reset}
        onOpen={this.onOpen}
      >
        <Wizard
          header={(
            <h5>
              {`${action} ClusterRoleBinding`}
            </h5>
          )}
          done={closeClusterRoleBindingDialog}
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

export const ClusterRoleBindingDialog = withInjectables<Dependencies, ClusterRoleBindingDialogProps>(NonInjectedClusterRoleBindingDialog, {
  getProps: (di, props) => ({
    ...props,
    clusterRoleStore: di.inject(clusterRoleStoreInjectable),
    editBindingNameState: di.inject(editClusterRoleBindingNameStateInjectable),
    serviceAccountStore: di.inject(serviceAccountStoreInjectable),
    state: di.inject(clusterRoleBindingDialogStateInjectable),
    clusterRoleBindingStore: di.inject(clusterRoleBindingStoreInjectable),
    openClusterRoleBindingDialog: di.inject(openClusterRoleBindingDialogInjectable),
    closeClusterRoleBindingDialog: di.inject(closeClusterRoleBindingDialogInjectable),
    showDetails: di.inject(showDetailsInjectable),
    showCheckedErrorNotification: di.inject(showCheckedErrorNotificationInjectable),
  }),
});
