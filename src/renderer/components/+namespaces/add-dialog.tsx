/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./add-dialog.scss";

import React, { useState } from "react";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import type { NamespaceStore } from "./store";
import type { Namespace } from "../../../common/k8s-api/endpoints";
import { Input } from "../input";
import { systemName } from "../input/input_validators";
import { Notifications } from "../notifications";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "./store.injectable";
import addNamespaceDialogStateInjectable, { AddNamespaceDialogState } from "./add-dialog.state.injectable";
import closeAddNamespaceDialogInjectable from "./add-dialog-close.injectable";
import { noop } from "../../utils";

export interface AddNamespaceDialogProps extends Omit<DialogProps, "isOpen"> {
  onSuccess?: (ns: Namespace) => void;
  onError?: (error: any) => void;
}

interface Dependencies {
  namespaceStore: NamespaceStore;
  state: AddNamespaceDialogState;
  closeAddNamespaceDialog: () => void;
}

const NonInjectedAddNamespaceDialog = observer(({ namespaceStore, state, closeAddNamespaceDialog, className, onSuccess = noop, onError = noop, ...dialogProps }: Dependencies & AddNamespaceDialogProps) => {
  const [namespace, setNamespace] = useState("");
  const { isOpen } = state;

  const addNamespace = async () => {
    try {
      const created = await namespaceStore.create({ name: namespace });

      onSuccess(created);
      closeAddNamespaceDialog();
    } catch (err) {
      Notifications.error(err);
      onError(err);
    }
  };
  const reset = () => {
    setNamespace("");
  };

  return (
    <Dialog
      {...dialogProps}
      isOpen={isOpen}
      className="AddNamespaceDialog"
      onOpen={reset}
      close={closeAddNamespaceDialog}
    >
      <Wizard header={<h5>Create Namespace</h5>} done={closeAddNamespaceDialog}>
        <WizardStep
          contentClass="flex gaps column"
          nextLabel="Create"
          next={addNamespace}
        >
          <Input
            required autoFocus
            iconLeft="layers"
            placeholder="Namespace"
            trim
            validators={systemName}
            value={namespace}
            onChange={setNamespace}
          />
        </WizardStep>
      </Wizard>
    </Dialog>
  );
});

export const AddNamespaceDialog = withInjectables<Dependencies, AddNamespaceDialogProps>(NonInjectedAddNamespaceDialog, {
  getProps: (di, props) => ({
    namespaceStore: di.inject(namespaceStoreInjectable),
    state: di.inject(addNamespaceDialogStateInjectable),
    closeAddNamespaceDialog: di.inject(closeAddNamespaceDialogInjectable),
    ...props,
  }),
});
