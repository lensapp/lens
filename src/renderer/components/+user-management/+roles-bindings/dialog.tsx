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

import { computed, observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import React from "react";

import { rolesStore } from "../+roles/store";
import { serviceAccountsStore } from "../+service-accounts/store";
import { NamespaceSelect } from "../../+namespaces/namespace-select";
import { ClusterRole, Role, roleApi, RoleBinding, RoleBindingSubject, ServiceAccount } from "../../../api/endpoints";
import { Dialog, DialogProps } from "../../dialog";
import { EditableList } from "../../editable-list";
import { Icon } from "../../icon";
import { showDetails } from "../../kube-object";
import { SubTitle } from "../../layout/sub-title";
import { Notifications } from "../../notifications";
import { Select, SelectOption } from "../../select";
import { Wizard, WizardStep } from "../../wizard";
import { roleBindingsStore } from "./store";
import { clusterRolesStore } from "../+cluster-roles/store";
import { Input } from "../../input";
import { getRoleRefSelectOption } from "../role-ref-select-option";
import { ObservableHashSet, hashKubeObject, nFircate } from "../../../utils";

interface Props extends Partial<DialogProps> {
}

interface DialogState {
  isOpen: boolean;
  data?: RoleBinding;
}

@observer
export class RoleBindingDialog extends React.Component<Props> {
  static state = observable.object<DialogState>({
    isOpen: false,
  });

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  static open(roleBinding?: RoleBinding) {
    RoleBindingDialog.state.isOpen = true;
    RoleBindingDialog.state.data = roleBinding;
  }

  static close() {
    RoleBindingDialog.state.isOpen = false;
    RoleBindingDialog.state.data = undefined;
  }

  get roleBinding(): RoleBinding {
    return RoleBindingDialog.state.data;
  }

  @computed get isEditing() {
    return !!this.roleBinding;
  }

  @observable.ref selectedRoleRef: Role | ClusterRole | undefined = undefined;
  @observable bindingName = "";
  @observable bindingNamespace = "";
  selectedAccounts = new ObservableHashSet<ServiceAccount>([], hashKubeObject);
  selectedUsers = observable.set<string>([]);
  selectedGroups = observable.set<string>([]);

  @computed get selectedBindings(): RoleBindingSubject[] {
    const serviceAccounts = Array.from(this.selectedAccounts, sa => ({
      name: sa.getName(),
      kind: "ServiceAccount" as const,
      namespace: this.bindingNamespace,
    }));
    const users = Array.from(this.selectedUsers, user => ({
      name: user,
      kind: "User" as const,
      namespace: this.bindingNamespace,
    }));
    const groups = Array.from(this.selectedGroups, group => ({
      name: group,
      kind: "Group" as const,
      namespace: this.bindingNamespace,
    }));

    return [
      ...serviceAccounts,
      ...users,
      ...groups,
    ];
  }

  @computed get roleRefOptions(): SelectOption<Role | ClusterRole>[] {
    const roles = rolesStore.items
      .filter(role => role.getNs() === this.bindingNamespace)
      .map(getRoleRefSelectOption);
    const clusterRoles = clusterRolesStore.items
      .map(getRoleRefSelectOption);

    return [
      ...roles,
      ...clusterRoles,
    ];
  }

  @computed get serviceAccountOptions(): SelectOption<ServiceAccount>[] {
    return serviceAccountsStore.items
      .filter(role => role.getNs() === this.bindingNamespace)
      .map(account => ({
        value: account,
        label: <><Icon small material="account_box" /> {account.getName()}</>
      }));
  }

  onOpen = () => {
    const binding = this.roleBinding;

    if (!binding) {
      return this.reset();
    }

    this.selectedRoleRef = (binding.roleRef.kind === roleApi.kind ? rolesStore : clusterRolesStore)
      .items
      .find(item => item.getName() === binding.roleRef.name);

    this.bindingName = binding.getName();
    this.bindingNamespace = binding.getNs();

    const [saSubjects, uSubjects, gSubjects] = nFircate(binding.getSubjects(), "kind", ["ServiceAccount", "User", "Group"]);
    const accountNames = new Set(saSubjects.map(acc => acc.name));

    this.selectedAccounts.replace(
      serviceAccountsStore.items
        .filter(sa => accountNames.has(sa.getName()))
    );
    this.selectedUsers.replace(uSubjects.map(user => user.name));
    this.selectedGroups.replace(gSubjects.map(group => group.name));
  };

  reset = () => {
    this.selectedRoleRef = undefined;
    this.bindingName = "";
    this.bindingNamespace = "";
    this.selectedAccounts.clear();
    this.selectedUsers.clear();
    this.selectedGroups.clear();
  };

  createBindings = async () => {
    const { selectedRoleRef, bindingNamespace: namespace, selectedBindings } = this;

    try {
      const roleBinding = this.isEditing
        ? await roleBindingsStore.updateSubjects({
          roleBinding: this.roleBinding,
          addSubjects: selectedBindings,
        })
        : await roleBindingsStore.create({ name: this.bindingName, namespace }, {
          subjects: selectedBindings,
          roleRef: {
            name: selectedRoleRef.getName(),
            kind: selectedRoleRef.kind,
          }
        });

      showDetails(roleBinding.selfLink);
      RoleBindingDialog.close();
    } catch (err) {
      Notifications.error(err);
    }
  };

  renderContents() {
    return (
      <>
        <SubTitle title="Namespace" />
        <NamespaceSelect
          themeName="light"
          isDisabled={this.isEditing}
          value={this.bindingNamespace}
          onChange={({ value }) => this.bindingNamespace = value}
        />

        <SubTitle title="RoleRef" />
        <Select
          themeName="light"
          placeholder="Select role or cluster role ..."
          isDisabled={this.isEditing}
          options={this.roleRefOptions}
          value={this.selectedRoleRef}
          onChange={({ value }) => {
            this.selectedRoleRef = value;

            if (this.selectedRoleRef.kind === "Role") {
              this.bindingNamespace = this.selectedRoleRef.getNs();
            }
          }}
        />

        {!this.isEditing && (
          <>
            <SubTitle title="Role Binding Name" />
            <Input
              value={this.bindingName}
              onChange={value => this.bindingName = value}
            />
          </>
        )}

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
          placeholder="Bind to Service Accounts ..."
          autoConvertOptions={false}
          options={this.serviceAccountOptions}
          onChange={([{ value }]: SelectOption<ServiceAccount>[]) => {
            this.selectedAccounts.toggle(value);
          }}
          maxMenuHeight={200}
        />
      </>
    );
  }

  render() {
    const { ...dialogProps } = this.props;
    const { isEditing, roleBinding, selectedRoleRef, selectedBindings } = this;
    const roleBindingName = roleBinding ? roleBinding.getName() : "";
    const header = (
      <h5>
        {roleBindingName
          ? <>Edit RoleBinding <span className="name">{roleBindingName}</span></>
          : "Add RoleBinding"
        }
      </h5>
    );
    const disableNext = !selectedRoleRef || !selectedBindings.length;
    const nextLabel = isEditing ? "Update" : "Create";

    return (
      <Dialog
        {...dialogProps}
        className="AddRoleBindingDialog"
        isOpen={RoleBindingDialog.state.isOpen}
        close={RoleBindingDialog.close}
        onClose={this.reset}
        onOpen={this.onOpen}
      >
        <Wizard
          header={header}
          done={RoleBindingDialog.close}
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
