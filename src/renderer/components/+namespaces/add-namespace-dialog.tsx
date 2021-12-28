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

import "./add-namespace-dialog.scss";

import React from "react";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import type { Namespace } from "../../../common/k8s-api/endpoints";
import { Input } from "../input";
import { systemName } from "../input/input_validators";
import { Notifications } from "../notifications";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "./namespace-store/namespace-store.injectable";
import type { AddNamespaceDialogModel } from "./add-namespace-dialog-model/add-namespace-dialog-model";
import addNamespaceDialogModelInjectable
  from "./add-namespace-dialog-model/add-namespace-dialog-model.injectable";

interface Props extends DialogProps {
  onSuccess?(ns: Namespace): void;
  onError?(error: any): void;
}

interface Dependencies {
  createNamespace: (params: { name: string }) => Promise<Namespace>,
  model: AddNamespaceDialogModel
}

@observer
class NonInjectedAddNamespaceDialog extends React.Component<Props & Dependencies> {
  @observable namespace = "";

  constructor(props: Props & Dependencies) {
    super(props);
    makeObservable(this);
  }

  reset = () => {
    this.namespace = "";
  };

  addNamespace = async () => {
    const { namespace } = this;
    const { onSuccess, onError } = this.props;

    try {
      const created = await this.props.createNamespace({ name: namespace });

      onSuccess?.(created);
      this.props.close();
    } catch (err) {
      Notifications.error(err);
      onError?.(err);
    }
  };

  render() {
    const { model, createNamespace, ...dialogProps } = this.props;
    const { namespace } = this;
    const header = <h5>Create Namespace</h5>;

    return (
      <Dialog
        {...dialogProps}
        className="AddNamespaceDialog"
        isOpen={this.props.model.isOpen}
        onOpen={this.reset}
        close={this.props.model.close}
      >
        <Wizard header={header} done={this.props.model.close}>
          <WizardStep
            contentClass="flex gaps column"
            nextLabel="Create"
            next={this.addNamespace}
          >
            <Input
              required autoFocus
              iconLeft="layers"
              placeholder="Namespace"
              trim
              validators={systemName}
              value={namespace} onChange={v => this.namespace = v.toLowerCase()}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}

export const AddNamespaceDialog = withInjectables<Dependencies, Props>(
  NonInjectedAddNamespaceDialog,

  {
    getProps: (di, props) => ({
      createNamespace: di.inject(namespaceStoreInjectable).create,
      model: di.inject(addNamespaceDialogModelInjectable),

      ...props,
    }),
  },
);
