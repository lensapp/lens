/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./dialog.scss";

import { action, observable } from "mobx";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";

import type { ServiceAccountStore } from "../+service-accounts/store";
import type { ClusterRole, ServiceAccount } from "../../../common/k8s-api/endpoints";
import { Dialog, DialogProps } from "../dialog";
import { EditableList } from "../editable-list";
import { Icon } from "../icon";
import { showDetails } from "../kube-detail-params";
import { SubTitle } from "../layout/sub-title";
import { Notifications } from "../notifications";
import { Select, SelectOption } from "../select";
import { Wizard, WizardStep } from "../wizard";
import type { ClusterRoleBindingStore } from "./store";
import type { ClusterRoleStore } from "../+cluster-roles/store";
import { ObservableHashSet, nFircate, cssNames } from "../../utils";
import { Input } from "../input";
import { TooltipPosition } from "../tooltip";
import { withInjectables } from "@ogre-tools/injectable-react";
import clusterRoleBindingStoreInjectable from "./store.injectable";
import clusterRoleStoreInjectable from "../+cluster-roles/store.injectable";
import clusterRoleBindingDialogStateInjectable, { ClusterRoleBindingDialogState } from "./dialog.state.injectable";
import serviceAccountStoreInjectable from "../+service-accounts/store.injectable";
import closeClusterRoleBindingDialogInjectable from "./close-dialog.injectable";

export interface ClusterRoleBindingDialogProps extends Partial<DialogProps> {
}

interface Dependencies {
  clusterRoleBindingStore: ClusterRoleBindingStore;
  clusterRoleStore: ClusterRoleStore;
  serviceAccountStore: ServiceAccountStore;
  state: ClusterRoleBindingDialogState;
  closeClusterRoleBindingDialog: () => void;
}

const NonInjectedClusterRoleBindingDialog = observer(({ serviceAccountStore, clusterRoleBindingStore, clusterRoleStore, state, closeClusterRoleBindingDialog, className, ...dialogProps }: Dependencies & ClusterRoleBindingDialogProps) => {
  const [selectedRoleRef, setSelectedRoleRef] = useState<ClusterRole | null>(null);
  const [bindingName, setBindingName] = useState("");
  const [selectedAccounts] = useState(new ObservableHashSet<ServiceAccount>([], sa => sa.metadata.uid));
  const [selectedUsers] = useState(observable.set<string>([]));
  const [selectedGroups] = useState(observable.set<string>([]));
  const { clusterRoleBinding, isOpen } = state;

  useEffect(() => setBindingName(clusterRoleBinding?.getName() ?? ""), [clusterRoleBinding]);

  const isEditing = Boolean(clusterRoleBinding);
  const selectedBindings = [
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

  const clusterRoleRefoptions = clusterRoleStore.items.map(value => ({
    value,
    label: value.getName(),
  }));

  const serviceAccountOptions = serviceAccountStore.items.map(account => ({
    value: account,
    label: `${account.getName()} (${account.getNs()})`,
  }));

  const selectedServiceAccountOptions = serviceAccountOptions.filter(({ value }) => selectedAccounts.has(value));

  const onOpen = action(() => {
    if (!clusterRoleBinding) {
      return reset();
    }

    setSelectedRoleRef(clusterRoleStore.getByName(clusterRoleBinding.roleRef.name));
    setBindingName(clusterRoleBinding.getName());

    const [saSubjects, uSubjects, gSubjects] = nFircate(clusterRoleBinding.getSubjects(), "kind", ["ServiceAccount", "User", "Group"]);
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
    selectedAccounts.clear();
    selectedUsers.clear();
    selectedGroups.clear();
  });

  const createBindings = async () => {
    try {
      const { selfLink } = isEditing
        ? await clusterRoleBindingStore.updateSubjects(clusterRoleBinding, selectedBindings)
        : await clusterRoleBindingStore.create({ name: bindingName }, {
          subjects: selectedBindings,
          roleRef: {
            name: selectedRoleRef.getName(),
            kind: selectedRoleRef.kind,
          },
        });

      showDetails(selfLink);
      closeClusterRoleBindingDialog();
    } catch (err) {
      Notifications.error(err);
    }
  };

  const renderContents = () => {
    return (
      <>
        <SubTitle title="Cluster Role Reference" />
        <Select
          themeName="light"
          placeholder="Select cluster role ..."
          isDisabled={isEditing}
          options={clusterRoleRefoptions}
          value={selectedRoleRef}
          autoFocus={!isEditing}
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
            if (!selectedRoleRef || bindingName === selectedRoleRef.getName()) {
              setBindingName(value.getName());
            }

            setSelectedRoleRef(value);
          }}
        />

        <SubTitle title="Binding Name" />
        <Input
          placeholder="Name of ClusterRoleBinding ..."
          disabled={isEditing}
          value={bindingName}
          onChange={setBindingName}
        />

        <SubTitle title="Binding targets" />

        <b>Users</b>
        <EditableList
          placeholder="Bind to User Account ..."
          add={(newUser) => selectedUsers.add(newUser)}
          items={Array.from(selectedUsers)}
          remove={({ oldItem }) => selectedUsers.delete(oldItem)}
        />

        <b>Groups</b>
        <EditableList
          placeholder="Bind to User Group ..."
          add={(newGroup) => selectedGroups.add(newGroup)}
          items={Array.from(selectedGroups)}
          remove={({ oldItem }) => selectedGroups.delete(oldItem)}
        />

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
          maxMenuHeight={200}
        />
      </>
    );
  };

  const [actionLabel, nextLabel] = isEditing ? ["Edit", "Update"] : ["Add", "Create"];
  const disableNext = !selectedRoleRef || !selectedBindings.length || !bindingName;

  return (
    <Dialog
      {...dialogProps}
      isOpen={isOpen}
      className={cssNames("AddClusterRoleBindingDialog", className)}
      close={closeClusterRoleBindingDialog}
      onClose={reset}
      onOpen={onOpen}
    >
      <Wizard
        header={<h5>{actionLabel} ClusterRoleBinding</h5>}
        done={closeClusterRoleBindingDialog}
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

export const ClusterRoleBindingDialog = withInjectables<Dependencies, ClusterRoleBindingDialogProps>(NonInjectedClusterRoleBindingDialog, {
  getProps: (di, props) => ({
    clusterRoleBindingStore: di.inject(clusterRoleBindingStoreInjectable),
    clusterRoleStore: di.inject(clusterRoleStoreInjectable),
    serviceAccountStore: di.inject(serviceAccountStoreInjectable),
    closeClusterRoleBindingDialog: di.inject(closeClusterRoleBindingDialogInjectable),
    state: di.inject(clusterRoleBindingDialogStateInjectable),
    ...props,
  }),
});
