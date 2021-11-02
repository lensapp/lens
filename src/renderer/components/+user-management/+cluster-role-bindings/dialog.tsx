/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
import { getRoleRefSelectOption, ServiceAccountOption } from "../select-options";
import { ObservableHashSet, nFircate } from "../../../utils";
import { Input } from "../../input";

interface Props extends Partial<DialogProps> {
}

interface DialogState {
  isOpen: boolean;
  data?: ClusterRoleBinding;
}

@observer
export class ClusterRoleBindingDialog extends React.Component<Props> {
  static state = observable.object<DialogState>({
    isOpen: false,
  });

  constructor(props: Props) {
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
    return clusterRolesStore.items.map(getRoleRefSelectOption);
  }

  @computed get serviceAccountOptions(): ServiceAccountOption[] {
    return serviceAccountsStore.items.map(account => {
      const name = account.getName();
      const namespace = account.getNs();

      return {
        value: `${account.getName()}%${account.getNs()}`,
        account,
        label: <><Icon small material="account_box" /> {name} ({namespace})</>,
      };
    });
  }

  @computed get selectedServiceAccountOptions(): ServiceAccountOption[] {
    return this.serviceAccountOptions.filter(({ account }) => this.selectedAccounts.has(account));
  }

  @action
  onOpen = () => {
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
  };

  @action
  reset = () => {
    this.selectedRoleRef = undefined;
    this.bindingName = "";
    this.selectedAccounts.clear();
    this.selectedUsers.clear();
    this.selectedGroups.clear();
  };

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
          onChange={(selected: ServiceAccountOption[] | null) => {
            if (selected) {
              this.selectedAccounts.replace(selected.map(opt => opt.account));
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
