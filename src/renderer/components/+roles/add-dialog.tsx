/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./add-dialog.scss";

import React, { useState } from "react";
import { observer } from "mobx-react";

import { NamespaceSelect } from "../+namespaces/namespace-select";
import { Dialog, DialogProps } from "../dialog";
import { Input } from "../input";
import { showDetails } from "../kube-detail-params";
import { SubTitle } from "../layout/sub-title";
import { Notifications } from "../notifications";
import { Wizard, WizardStep } from "../wizard";
import type { RoleStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import roleStoreInjectable from "./store.injectable";
import addRoleDialogStateInjectable, { RoleAddDialogState } from "./add-dialog.state.injectable";
import closeAddRoleDialogInjectable from "./close-add-dialog.injectable";
import { cssNames } from "../../utils";

export interface AddRoleDialogProps extends Partial<DialogProps> {
}

interface Dependencies {
  roleStore: RoleStore;
  state: RoleAddDialogState;
  closeAddRoleDialog: () => void;
}

const NonInjectedAddRoleDialog = observer(({ roleStore, state, closeAddRoleDialog, className, ...dialogProps }: Dependencies & AddRoleDialogProps) => {
  const [roleName, setRoleName] = useState("");
  const [namespace, setNamespace] = useState("");
  const { isOpen } = state;

  const reset = () => {
    setRoleName("");
    setNamespace("");
  };

  const createRole = async () => {
    try {
      const role = await roleStore.create({ name: roleName, namespace });

      showDetails(role.selfLink);
      reset();
      closeAddRoleDialog();
    } catch (err) {
      Notifications.error(err.toString());
    }
  };

  return (
    <Dialog
      {...dialogProps}
      className={cssNames("AddRoleDialog", className)}
      isOpen={isOpen}
      close={closeAddRoleDialog}
    >
      <Wizard header={<h5>Create Role</h5>} done={closeAddRoleDialog}>
        <WizardStep
          contentClass="flex gaps column"
          nextLabel="Create"
          next={createRole}
        >
          <SubTitle title="Role Name" />
          <Input
            required autoFocus
            placeholder="Name"
            iconLeft="supervisor_account"
            value={roleName}
            onChange={setRoleName}
          />
          <SubTitle title="Namespace" />
          <NamespaceSelect
            themeName="light"
            value={namespace}
            onChange={({ value }) => setNamespace(value)}
          />
        </WizardStep>
      </Wizard>
    </Dialog>
  );
});

export const AddRoleDialog = withInjectables<Dependencies, AddRoleDialogProps>(NonInjectedAddRoleDialog, {
  getProps: (di, props) => ({
    roleStore: di.inject(roleStoreInjectable),
    closeAddRoleDialog: di.inject(closeAddRoleDialogInjectable),
    state: di.inject(addRoleDialogStateInjectable),
    ...props,
  }),
});
