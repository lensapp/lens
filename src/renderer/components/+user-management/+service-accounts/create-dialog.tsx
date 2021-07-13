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

import "./create-dialog.scss";

import React from "react";
import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";

import { NamespaceSelect } from "../../+namespaces/namespace-select";
import { Dialog, DialogProps } from "../../dialog";
import { Input } from "../../input";
import { systemName } from "../../input/input_validators";
import { showDetails } from "../../kube-object";
import { SubTitle } from "../../layout/sub-title";
import { Notifications } from "../../notifications";
import { Wizard, WizardStep } from "../../wizard";
import { serviceAccountsStore } from "./store";

interface Props extends Partial<DialogProps> {
}

@observer
export class CreateServiceAccountDialog extends React.Component<Props> {
  static isOpen = observable.box(false);

  @observable name = "";
  @observable namespace = "default";

  constructor(props: Props) {
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
      const serviceAccount = await serviceAccountsStore.create({ namespace, name });

      this.name = "";
      showDetails(serviceAccount.selfLink);
      CreateServiceAccountDialog.close();
    } catch (err) {
      Notifications.error(err);
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
              value={name} onChange={v => this.name = v.toLowerCase()}
            />
            <SubTitle title="Namespace" />
            <NamespaceSelect
              themeName="light"
              value={namespace}
              onChange={({ value }) => this.namespace = value}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
