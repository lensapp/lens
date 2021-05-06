import "./add-role-dialog.scss";

import React from "react";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { SubTitle } from "../layout/sub-title";
import { Notifications } from "../notifications";
import { rolesStore } from "./roles.store";
import { Input } from "../input";
import { NamespaceSelect } from "../+namespaces/namespace-select";
import { showDetails } from "../kube-object";

interface Props extends Partial<DialogProps> {
}

const dialogState = observable.object({
  isOpen: false,
});

@observer
export class AddRoleDialog extends React.Component<Props> {
  @observable roleName = "";
  @observable namespace = "";

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  static open() {
    dialogState.isOpen = true;
  }

  static close() {
    dialogState.isOpen = false;
  }

  close = () => {
    AddRoleDialog.close();
  };

  reset = () => {
    this.roleName = "";
    this.namespace = "";
  };

  createRole = async () => {
    try {
      const role = await rolesStore.create({ name: this.roleName, namespace: this.namespace });

      showDetails(role.selfLink);
      this.reset();
      this.close();
    } catch (err) {
      Notifications.error(err.toString());
    }
  };

  render() {
    const { ...dialogProps } = this.props;
    const header = <h5>Create Role</h5>;

    return (
      <Dialog
        {...dialogProps}
        className="AddRoleDialog"
        isOpen={dialogState.isOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep
            contentClass="flex gaps column"
            nextLabel="Create"
            next={this.createRole}
          >
            <SubTitle title="Role Name" />
            <Input
              required autoFocus
              placeholder="Name"
              iconLeft="supervisor_account"
              value={this.roleName}
              onChange={v => this.roleName = v}
            />
            <SubTitle title="Namespace" />
            <NamespaceSelect
              themeName="light"
              value={this.namespace}
              onChange={({ value }) => this.namespace = value}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
