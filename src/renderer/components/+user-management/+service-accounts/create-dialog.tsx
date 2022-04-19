/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./create-dialog.scss";

import React from "react";
import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";

import { NamespaceSelect } from "../../+namespaces/namespace-select";
import type { DialogProps } from "../../dialog";
import { Dialog } from "../../dialog";
import { Input } from "../../input";
import { systemName } from "../../input/input_validators";
import { showDetails } from "../../kube-detail-params";
import { SubTitle } from "../../layout/sub-title";
import { Notifications } from "../../notifications";
import { Wizard, WizardStep } from "../../wizard";
import { serviceAccountStore } from "./legacy-store";

export interface CreateServiceAccountDialogProps extends Partial<DialogProps> {
}

@observer
export class CreateServiceAccountDialog extends React.Component<CreateServiceAccountDialogProps> {
  static isOpen = observable.box(false);

  @observable name = "";
  @observable namespace = "default";

  constructor(props: CreateServiceAccountDialogProps) {
    super(props);
    makeObservable(this);
  }

  static open() {
    CreateServiceAccountDialog.isOpen.set(true);
  }

  static close() {
    CreateServiceAccountDialog.isOpen.set(false);
  }

  createAccount = async () => {
    const { name, namespace } = this;

    try {
      const serviceAccount = await serviceAccountStore.create({ namespace, name });

      this.name = "";
      showDetails(serviceAccount.selfLink);
      CreateServiceAccountDialog.close();
    } catch (err) {
      Notifications.checkedError(err, "Unknown error occured while creating service account");
    }
  };

  render() {
    const { ...dialogProps } = this.props;
    const { name, namespace } = this;
    const header = <h5>Create Service Account</h5>;

    return (
      <Dialog
        {...dialogProps}
        className="CreateServiceAccountDialog"
        isOpen={CreateServiceAccountDialog.isOpen.get()}
        close={CreateServiceAccountDialog.close}
      >
        <Wizard header={header} done={CreateServiceAccountDialog.close}>
          <WizardStep nextLabel="Create" next={this.createAccount}>
            <SubTitle title="Account Name" />
            <Input
              autoFocus
              required
              placeholder="Enter a name"
              trim
              validators={systemName}
              value={name}
              onChange={v => this.name = v.toLowerCase()}
            />
            <SubTitle title="Namespace" />
            <NamespaceSelect
              id="create-dialog-namespace-select-input"
              themeName="light"
              value={namespace}
              onChange={option => this.namespace = option?.value ?? "default"}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
