/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./create-dialog.scss";

import React, { useState } from "react";
import { observer } from "mobx-react";

import { NamespaceSelect } from "../+namespaces/namespace-select";
import { Dialog, DialogProps } from "../dialog";
import { Input } from "../input";
import { systemName } from "../input/input_validators";
import { showDetails } from "../kube-detail-params";
import { SubTitle } from "../layout/sub-title";
import { Notifications } from "../notifications";
import { Wizard, WizardStep } from "../wizard";
import type { ServiceAccountStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import createServiceAccountDialogStateInjectable, { ServiceAccountCreateDialogState } from "./create-dialog.state.injectable";
import serviceAccountStoreInjectable from "./store.injectable";
import closeCreateServiceAccountDialogInjectable from "./close-create-dialog.injectable";
import { cssNames } from "../../utils";

export interface CreateServiceAccountDialogProps extends Partial<DialogProps> {
}

interface Dependencies {
  state: ServiceAccountCreateDialogState;
  serviceAccountStore: ServiceAccountStore;
  closeCreateServiceAccountDialog: () => void;
}

const NonInjectedCreateServiceAccountDialog = observer(({ state, serviceAccountStore, closeCreateServiceAccountDialog, className, ...dialogProps }: Dependencies & CreateServiceAccountDialogProps) => {
  const [name, setName] = useState("");
  const [namespace, setNamespace] = useState("default");
  const { isOpen } = state;

  const reset = () => {
    setName("");
    setNamespace("default");
  };

  const createAccount = async () => {
    try {
      const serviceAccount = await serviceAccountStore.create({ namespace, name });

      reset();
      showDetails(serviceAccount.selfLink);
      closeCreateServiceAccountDialog();
    } catch (err) {
      Notifications.error(err);
    }
  };

  return (
    <Dialog
      {...dialogProps}
      className={cssNames("CreateServiceAccountDialog", className)}
      isOpen={isOpen}
      close={closeCreateServiceAccountDialog}
    >
      <Wizard header={<h5>Create Service Account</h5>} done={closeCreateServiceAccountDialog}>
        <WizardStep nextLabel="Create" next={createAccount}>
          <SubTitle title="Account Name" />
          <Input
            autoFocus
            required
            placeholder="Enter a name"
            trim
            validators={systemName}
            value={name}
            onChange={setName}
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

export const CreateServiceAccountDialog = withInjectables<Dependencies, CreateServiceAccountDialogProps>(NonInjectedCreateServiceAccountDialog, {
  getProps: (di, props) => ({
    serviceAccountStore: di.inject(serviceAccountStoreInjectable),
    closeCreateServiceAccountDialog: di.inject(closeCreateServiceAccountDialogInjectable),
    state: di.inject(createServiceAccountDialogStateInjectable),
    ...props,
  }),
});

