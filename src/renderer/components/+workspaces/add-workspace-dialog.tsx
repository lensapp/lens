import "./add-workspace-dialog.scss";

import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
//import { namespaceStore } from "./namespace.store";
import { Workspace, WorkspaceId } from "../../../common/workspace-store";
import { Input } from "../input";
import { systemName } from "../input/input_validators";
import { Notifications } from "../notifications";

interface Props extends DialogProps {
  onSuccess?(ws: Workspace): void;
  onError?(error: any): void;
}

@observer
export class AddWorkspaceDialog extends React.Component<Props> {
  @observable static isOpen = false;
  @observable workspace = "";

  static open() {
    AddWorkspaceDialog.isOpen = true;
  }

  static close() {
    AddWorkspaceDialog.isOpen = false;
  }

  reset = () => {
    this.workspace = "";
  };

  close = () => {
    AddWorkspaceDialog.close();
  };

  addWorkspace = async () => {
    const { workspace } = this;
    const { onSuccess, onError } = this.props;

    try {
//      await namespaceStore.create({ name: workspace }).then(onSuccess);
      this.close();
    } catch (err) {
      Notifications.error(err);
      onError && onError(err);
    }
  };

  render() {
    const { ...dialogProps } = this.props;
    const { workspace } = this;
    const header = <h5>Create Workspace</h5>;

    return (
      <Dialog
        {...dialogProps}
        className="AddWorkspaceDialog"
        isOpen={AddWorkspaceDialog.isOpen}
        onOpen={this.reset}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep
            contentClass="flex gaps column"
            nextLabel="Create"
            next={this.addWorkspace}
          >
            <Input
              required autoFocus
              iconLeft="layers"
              placeholder={`Workspace`}
              validators={systemName}
              value={workspace} onChange={v => this.workspace = v.toLowerCase()}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
