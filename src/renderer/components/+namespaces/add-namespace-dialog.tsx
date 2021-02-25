import "./add-namespace-dialog.scss";

import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { namespaceStore } from "./namespace.store";
import { Namespace } from "../../api/endpoints";
import { Input } from "../input";
import { systemName } from "../input/input_validators";
import { Notifications } from "../notifications";

interface Props extends DialogProps {
  onSuccess?(ns: Namespace): void;
  onError?(error: any): void;
}

@observer
export class AddNamespaceDialog extends React.Component<Props> {
  @observable static isOpen = false;
  @observable namespace = "";

  static open() {
    AddNamespaceDialog.isOpen = true;
  }

  static close() {
    AddNamespaceDialog.isOpen = false;
  }

  reset = () => {
    this.namespace = "";
  };

  close = () => {
    AddNamespaceDialog.close();
  };

  addNamespace = async () => {
    const { namespace } = this;
    const { onSuccess, onError } = this.props;

    try {
      await namespaceStore.create({ name: namespace }).then(onSuccess);
      this.close();
    } catch (err) {
      Notifications.error(err);
      onError && onError(err);
    }
  };

  render() {
    const { ...dialogProps } = this.props;
    const { namespace } = this;
    const header = <h5>Create Namespace</h5>;

    return (
      <Dialog
        {...dialogProps}
        className="AddNamespaceDialog"
        isOpen={AddNamespaceDialog.isOpen}
        onOpen={this.reset}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep
            contentClass="flex gaps column"
            nextLabel="Create"
            next={this.addNamespace}
          >
            <Input
              required autoFocus
              iconLeft="layers"
              placeholder="Namespace"
              validators={systemName}
              value={namespace} onChange={v => this.namespace = v.toLowerCase()}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
