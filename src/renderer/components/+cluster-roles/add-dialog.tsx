/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./add-dialog.scss";

import { observer } from "mobx-react";
import React, { useState } from "react";

import { Dialog, DialogProps } from "../dialog";
import { Input } from "../input";
import { showDetails } from "../kube-detail-params";
import { SubTitle } from "../layout/sub-title";
import { Notifications } from "../notifications";
import { Wizard, WizardStep } from "../wizard";
import type { ClusterRoleStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import clusterRoleStoreInjectable from "./store.injectable";
import addClusterRoleDialogStateInjectable, { ClusterRoleAddDialogState } from "./add-dialog.state.injectable";
import { cssNames } from "../../utils";
import closeAddClusterRoleDialogInjectable from "./close-add-dialog.injectable";

export interface AddClusterRoleDialogProps extends Partial<DialogProps> {
}

interface Dependencies {
  clusterRoleStore: ClusterRoleStore;
  state: ClusterRoleAddDialogState;
  closeAddClusterRoleDialog: () => void;
}

const NonInjectedAddClusterRoleDialog = observer(({ state, clusterRoleStore, closeAddClusterRoleDialog, className, ...dialogProps }: Dependencies & AddClusterRoleDialogProps) => {
  const { isOpen } = state;
  const [clusterRoleName, setClusterRoleName] = useState("");

  const reset = () => {
    setClusterRoleName("");
  };
  const createRole = async () => {
    try {
      const role = await clusterRoleStore.create({ name: clusterRoleName });

      showDetails(role.selfLink);
      reset();
      closeAddClusterRoleDialog();
    } catch (err) {
      Notifications.error(err.toString());
    }
  };

  return (
    <Dialog
      {...dialogProps}
      isOpen={isOpen}
      className={cssNames("AddClusterRoleDialog", className)}
      close={closeAddClusterRoleDialog}
    >
      <Wizard
        header={<h5>Create ClusterRole</h5>}
        done={closeAddClusterRoleDialog}
      >
        <WizardStep
          contentClass="flex gaps column"
          nextLabel="Create"
          next={createRole}
        >
          <SubTitle title="ClusterRole Name" />
          <Input
            required autoFocus
            placeholder="Name"
            iconLeft="supervisor_account"
            value={clusterRoleName}
            onChange={setClusterRoleName}
          />
        </WizardStep>
      </Wizard>
    </Dialog>
  );
});

export const AddClusterRoleDialog = withInjectables<Dependencies, AddClusterRoleDialogProps>(NonInjectedAddClusterRoleDialog, {
  getProps: (di, props) => ({
    clusterRoleStore: di.inject(clusterRoleStoreInjectable),
    closeAddClusterRoleDialog: di.inject(closeAddClusterRoleDialogInjectable),
    state: di.inject(addClusterRoleDialogStateInjectable),
    ...props,
  }),
});
