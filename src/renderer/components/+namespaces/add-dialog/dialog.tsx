/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./dialog.scss";

import React from "react";
import type { IObservableValue } from "mobx";
import { action, observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import type { DialogProps } from "../../dialog";
import { Dialog } from "../../dialog";
import { Wizard, WizardStep } from "../../wizard";
import type { Namespace } from "../../../../common/k8s-api/endpoints";
import { Input } from "../../input";
import { systemName } from "../../input/input_validators";
import { Notifications } from "../../notifications";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "../store.injectable";
import addNamespaceDialogStateInjectable
  from "./state.injectable";
import type { NamespaceStore } from "../store";
import { autoBind } from "../../../utils";

export interface AddNamespaceDialogProps extends DialogProps {
  onSuccess?(ns: Namespace): void;
  onError?(error: unknown): void;
}

interface Dependencies {
  namespaceStore: NamespaceStore;
  state: IObservableValue<boolean>;
}

@observer
class NonInjectedAddNamespaceDialog extends React.Component<AddNamespaceDialogProps & Dependencies> {
  @observable namespace = "";

  constructor(props: AddNamespaceDialogProps & Dependencies) {
    super(props);
    makeObservable(this);
    autoBind(this);
  }

  @action
  close() {
    this.props.state.set(false);
  }

  @action
  reset() {
    this.namespace = "";
  }

  async addNamespace() {
    const { namespace } = this;
    const { onSuccess, onError, namespaceStore } = this.props;

    try {
      const created = await namespaceStore.create({ name: namespace });

      onSuccess?.(created);
      this.close();
    } catch (err) {
      Notifications.checkedError(err, "Unknown error occured while creating the namespace");
      onError?.(err);
    }
  }

  render() {
    const { state, namespaceStore, ...dialogProps } = this.props;
    const { namespace } = this;
    const isOpen = state.get();

    return (
      <Dialog
        {...dialogProps}
        className="AddNamespaceDialog"
        isOpen={isOpen}
        onClose={this.reset}
        close={this.close}
      >
        <Wizard
          header={<h5>Create Namespace</h5>}
          done={this.close}
        >
          <WizardStep
            contentClass="flex gaps column"
            nextLabel="Create"
            next={this.addNamespace}
          >
            <Input
              required
              autoFocus
              iconLeft="layers"
              placeholder="Namespace"
              trim
              validators={systemName}
              value={namespace}
              onChange={v => this.namespace = v.toLowerCase()}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}

export const AddNamespaceDialog = withInjectables<Dependencies, AddNamespaceDialogProps>(NonInjectedAddNamespaceDialog, {
  getProps: (di, props) => ({
    ...props,
    namespaceStore: di.inject(namespaceStoreInjectable),
    state: di.inject(addNamespaceDialogStateInjectable),
  }),
});
