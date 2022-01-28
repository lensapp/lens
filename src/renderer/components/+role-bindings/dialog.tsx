/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./dialog.scss";

import { observable, action } from "mobx";
import { observer } from "mobx-react";
import React, { useState } from "react";

import type { RoleStore } from "../+roles/store";
import type { ServiceAccountStore } from "../+service-accounts/store";
import { NamespaceSelect } from "../+namespaces/namespace-select";
import type { ClusterRole, Role, RoleApi, RoleBindingSubject, ServiceAccount } from "../../../common/k8s-api/endpoints";
import { Dialog, DialogProps } from "../dialog";
import { EditableList } from "../editable-list";
import { Icon } from "../icon";
import { showDetails } from "../kube-detail-params";
import { SubTitle } from "../layout/sub-title";
import { Notifications } from "../notifications";
import { Select, SelectOption } from "../select";
import { Wizard, WizardStep } from "../wizard";
import type { RoleBindingStore } from "./store";
import type { ClusterRoleStore } from "../+cluster-roles/store";
import { Input } from "../input";
import { ObservableHashSet, nFircate, cssNames } from "../../utils";
import { withInjectables } from "@ogre-tools/injectable-react";
import roleBindingStoreInjectable from "./store.injectable";
import clusterRoleStoreInjectable from "../+cluster-roles/store.injectable";
import roleBindingDialogStateInjectable, { RoleBindingDialogState } from "./dialog.state.injectable";
import closeRoleBindingDialogInjectable from "./close-dialog.injectable";
import roleApiInjectable from "../../../common/k8s-api/endpoints/role.api.injectable";
import roleStoreInjectable from "../+roles/store.injectable";
import serviceAccountStoreInjectable from "../+service-accounts/store.injectable";

export interface RoleBindingDialogProps extends Partial<DialogProps> {
}

interface Dependencies {
  roleBindingStore: RoleBindingStore;
  clusterRoleStore: ClusterRoleStore;
  roleApi: RoleApi;
  roleStore: RoleStore;
  serviceAccountStore: ServiceAccountStore;
  state: RoleBindingDialogState;
  closeRoleBindingDialog: () => void;
}

const NonInjectedRoleBindingDialog = observer(({ roleApi, roleStore, serviceAccountStore, roleBindingStore, clusterRoleStore, state, className, closeRoleBindingDialog, ...dialogProps }: Dependencies & RoleBindingDialogProps) => {
  const [selectedRoleRef, setSelectedRoleRef] = useState<Role | ClusterRole | null>(null);
  const [bindingName, setBindingName] = useState("");
  const [bindingNamespace, setBindingNamespace] = useState("");
  const [selectedAccounts] = useState(new ObservableHashSet<ServiceAccount>([], sa => sa.metadata.uid));
  const [selectedUsers] = useState(observable.set<string>([]));
  const [selectedGroups] = useState(observable.set<string>([]));
  const { isOpen, roleBinding } = state;
  const isEditing = Boolean(roleBinding);

  const selectedBindings: RoleBindingSubject[] = [
    ...Array.from(selectedAccounts, sa => ({
      name: sa.getName(),
      kind: "ServiceAccount" as const,
      namespace: sa.getNs(),
    })),
    ...Array.from(selectedUsers, user => ({
      name: user,
      kind: "User" as const,
    })),
    ...Array.from(selectedGroups, group => ({
      name: group,
      kind: "Group" as const,
    })),
  ];
  const roleRefOptions: SelectOption<Role | ClusterRole>[] = [
    ...roleStore.items
      .filter(role => role.getNs() === bindingNamespace)
      .map(value => ({ value, label: value.getName() })),
    ...clusterRoleStore.items
      .map(value => ({ value, label: value.getName() })),
  ];
  const serviceAccountOptions: SelectOption<ServiceAccount>[] = (
    serviceAccountStore.items
      .map(account => ({
        value: account,
        label: `${account.getName()} (${account.getNs()})`,
      }))
  );

  const selectedServiceAccountOptions = serviceAccountOptions.filter(({ value }) => selectedAccounts.has(value));

  const onOpen = action(() => {
    if (!roleBinding) {
      return reset();
    }

    setSelectedRoleRef(
      (
        roleBinding.roleRef.kind === roleApi.kind
          ? roleStore
          : clusterRoleStore
      )
        .getByName(roleBinding.roleRef.name),
    );
    setBindingName(roleBinding.getName());
    setBindingNamespace(roleBinding.getNs());

    const [saSubjects, uSubjects, gSubjects] = nFircate(roleBinding.getSubjects(), "kind", ["ServiceAccount", "User", "Group"]);
    const accountNames = new Set(saSubjects.map(acc => acc.name));

    selectedAccounts.replace(
      serviceAccountStore.items
        .filter(sa => accountNames.has(sa.getName())),
    );
    selectedUsers.replace(uSubjects.map(user => user.name));
    selectedGroups.replace(gSubjects.map(group => group.name));
  });

  const reset = action(() => {
    setSelectedRoleRef(null);
    setBindingName("");
    setBindingNamespace("");
    selectedAccounts.clear();
    selectedUsers.clear();
    selectedGroups.clear();
  });

  const createBindings = async () => {
    try {
      const { selfLink } = isEditing
        ? await roleBindingStore.updateSubjects(roleBinding, selectedBindings)
        : await roleBindingStore.create({ name: bindingName, namespace: bindingNamespace }, {
          subjects: selectedBindings,
          roleRef: {
            name: selectedRoleRef.getName(),
            kind: selectedRoleRef.kind,
          },
        });

      showDetails(selfLink);
      closeRoleBindingDialog();
    } catch (err) {
      Notifications.error(err);
    }
  };

  const renderContents = () => (
    <>
      <SubTitle title="Namespace" />
      <NamespaceSelect
        themeName="light"
        isDisabled={isEditing}
        value={bindingNamespace}
        autoFocus={!isEditing}
        onChange={({ value }) => setBindingNamespace(value)} />

      <SubTitle title="Role Reference" />
      <Select
        themeName="light"
        placeholder="Select role or cluster role ..."
        isDisabled={isEditing}
        options={roleRefOptions}
        value={selectedRoleRef}
        onChange={({ value }: SelectOption<Role | ClusterRole>) => {
          if (!selectedRoleRef || bindingName === selectedRoleRef.getName()) {
            setBindingName(value.getName());
          }

          setSelectedRoleRef(value);
        } } />

      <SubTitle title="Binding Name" />
      <Input
        disabled={isEditing}
        value={bindingName}
        onChange={setBindingName} />

      <SubTitle title="Binding targets" />

      <b>Users</b>
      <EditableList
        placeholder="Bind to User Account ..."
        add={(newUser) => selectedUsers.add(newUser)}
        items={Array.from(selectedUsers)}
        remove={({ oldItem }) => selectedUsers.delete(oldItem)} />

      <b>Groups</b>
      <EditableList
        placeholder="Bind to User Group ..."
        add={(newGroup) => selectedGroups.add(newGroup)}
        items={Array.from(selectedGroups)}
        remove={({ oldItem }) => selectedGroups.delete(oldItem)} />

      <b>Service Accounts</b>
      <Select
        isMulti
        themeName="light"
        placeholder="Select service accounts ..."
        autoConvertOptions={false}
        options={serviceAccountOptions}
        value={selectedServiceAccountOptions}
        formatOptionLabel={({ value }: SelectOption<ServiceAccount>) => (
          <><Icon small material="account_box" /> {value.getName()} ({value.getNs()})</>
        )}
        onChange={(selected: SelectOption<ServiceAccount>[] | null) => {
          if (selected) {
            selectedAccounts.replace(selected.map(opt => opt.value));
          } else {
            selectedAccounts.clear();
          }
        }}
        maxMenuHeight={200} />
    </>
  );

  const [actionLabel, nextLabel] = isEditing ? ["Edit", "Update"] : ["Add", "Create"];
  const disableNext = !selectedRoleRef || !selectedBindings.length || !bindingNamespace || !bindingName;

  return (
    <Dialog
      {...dialogProps}
      className={cssNames("AddRoleBindingDialog", className)}
      isOpen={isOpen}
      close={closeRoleBindingDialog}
      onClose={reset}
      onOpen={onOpen}
    >
      <Wizard
        header={<h5>{actionLabel} RoleBinding</h5>}
        done={closeRoleBindingDialog}
      >
        <WizardStep
          nextLabel={nextLabel}
          next={createBindings}
          disabledNext={disableNext}
        >
          {renderContents()}
        </WizardStep>
      </Wizard>
    </Dialog>
  );
});

export const RoleBindingDialog = withInjectables<Dependencies, RoleBindingDialogProps>(NonInjectedRoleBindingDialog, {
  getProps: (di, props) => ({
    roleBindingStore: di.inject(roleBindingStoreInjectable),
    clusterRoleStore: di.inject(clusterRoleStoreInjectable),
    closeRoleBindingDialog: di.inject(closeRoleBindingDialogInjectable),
    roleApi: di.inject(roleApiInjectable),
    roleStore: di.inject(roleStoreInjectable),
    serviceAccountStore: di.inject(serviceAccountStoreInjectable),
    state: di.inject(roleBindingDialogStateInjectable),
    ...props,
  }),
});

