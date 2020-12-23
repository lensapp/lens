import "./add-role-dialog.scss";

import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { _i18n } from "../../i18n";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Notifications } from "../notifications";
import { rolesStore } from "./roles.store";
import { Input } from "../input";
import { showDetails } from "../kube-object";

interface Props extends Partial<DialogProps> {
}

@observer
export class AddRoleDialog extends React.Component<Props> {
  @observable static isOpen = false;

  @observable roleName = "";

  static open() {
    AddRoleDialog.isOpen = true;
  }

  static close() {
    AddRoleDialog.isOpen = false;
  }

  close = () => {
    AddRoleDialog.close();
  };

  reset = () => {
    this.roleName = "";
  };

  createRole = async () => {
    try {
      const role = await rolesStore.create({ name: this.roleName });

      showDetails(role.selfLink);
      this.reset();
      this.close();
    } catch (err) {
      Notifications.error(err.toString());
    }
  };

  render() {
    const { ...dialogProps } = this.props;
    const header = <h5><Trans>Create Role</Trans></h5>;

    return (
      <Dialog
        {...dialogProps}
        className="AddRoleDialog"
        isOpen={AddRoleDialog.isOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep
            contentClass="flex gaps column"
            nextLabel={<Trans>Create</Trans>}
            next={this.createRole}
          >
            <Input
              required autoFocus
              placeholder={_i18n._(t`Role name`)}
              iconLeft="supervisor_account"
              value={this.roleName}
              onChange={v => this.roleName = v}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
