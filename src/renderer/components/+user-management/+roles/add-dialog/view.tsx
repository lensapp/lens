/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import React from "react";
import type { IObservableValue } from "mobx";
import { observer } from "mobx-react";

import { NamespaceSelect } from "../../../+namespaces/namespace-select";
import type { DialogProps } from "../../../dialog";
import { Dialog } from "../../../dialog";
import { Input } from "../../../input";
import { SubTitle } from "../../../layout/sub-title";
import { Wizard, WizardStep } from "../../../wizard";
import type { AddRoleDialogState } from "./state.injectable";
import type { RoleStore } from "../store";
import type { ShowDetails } from "../../../kube-detail-params/show-details.injectable";
import type { ShowCheckedErrorNotification } from "../../../notifications/show-checked-error.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import roleStoreInjectable from "../store.injectable";
import showCheckedErrorNotificationInjectable from "../../../notifications/show-checked-error.injectable";
import showDetailsInjectable from "../../../kube-detail-params/show-details.injectable";
import addRoleDialogStateInjectable from "./state.injectable";

export interface AddRoleDialogProps extends Partial<DialogProps> {
}

interface Dependencies {
  state: IObservableValue<AddRoleDialogState | undefined>;
  roleStore: RoleStore;
  showDetails: ShowDetails;
  showCheckedErrorNotification: ShowCheckedErrorNotification;
}

const NonInjectedAddRoleDialog = observer(({
  state,
  roleStore,
  showDetails,
  showCheckedErrorNotification,
  ...dialogProps
}: Dependencies & AddRoleDialogProps) => {
  const close = () => state.set(undefined);
  const createRole = async (roleDescriptor: AddRoleDialogState) => {
    try {
      const role = await roleStore.create(roleDescriptor);

      close();
      showDetails(role.selfLink);
    } catch (err) {
      showCheckedErrorNotification(err, "Unknown error occured while creating role");
    }
  };

  const currentState = state.get();

  return (
    <Dialog
      {...dialogProps}
      className="AddRoleDialog"
      isOpen={Boolean(currentState)}
      close={close}
      data-testid={currentState && "add-role-dialog"}
    >
      {currentState && (
        <Wizard
          header={<h5>Create Role</h5>}
          done={close}
        >
          <WizardStep
            contentClass="flex gaps column"
            nextLabel="Create"
            disabledNext={!currentState.namespace || !currentState.name}
            next={() => createRole(currentState)}
            testIdForNext="add-role-dialog-create-step"
          >
            <SubTitle title="Role Name" />
            <Input
              required
              autoFocus
              placeholder="Name"
              iconLeft="supervisor_account"
              value={currentState.name}
              onChange={v => currentState.name = v}
              data-testid="add-role-dialog-name-input"
            />
            <SubTitle title="Namespace" />
            <NamespaceSelect
              id="add-dialog-namespace-select-input"
              themeName="light"
              value={currentState.namespace}
              onChange={option => currentState.namespace = option?.value ?? ""}
            />
          </WizardStep>
        </Wizard>
      )}
    </Dialog>
  );
});

export const AddRoleDialog = withInjectables<Dependencies, AddRoleDialogProps>(NonInjectedAddRoleDialog, {
  getProps: (di, props) => ({
    ...props,
    roleStore: di.inject(roleStoreInjectable),
    showCheckedErrorNotification: di.inject(showCheckedErrorNotificationInjectable),
    showDetails: di.inject(showDetailsInjectable),
    state: di.inject(addRoleDialogStateInjectable),
  }),
});
