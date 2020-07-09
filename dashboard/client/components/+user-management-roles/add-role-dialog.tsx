import "./add-role-dialog.scss";

import * as React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { _i18n } from "../../i18n";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Notifications } from "../notifications";
import { rolesStore } from "./roles.store";
import { Input } from "../input";
import { showDetails } from "../../navigation";

interface Props extends Partial<DialogProps> {
}

@observer
export class AddRoleDialog extends React.Component<Props> {
  @observable static isOpen = false;

  @observable roleName = "";

  static open(): void {
    AddRoleDialog.isOpen = true;
  }

  static close(): void {
    AddRoleDialog.isOpen = false;
  }

  close = (): void => {
    AddRoleDialog.close();
  }

  reset = (): void => {
    this.roleName = "";
  }

  createRole = async (): Promise<void> => {
    try {
      const role = await rolesStore.create({ name: this.roleName });
      showDetails(role.selfLink);
      this.reset();
      this.close();
    } catch (err) {
      Notifications.error(err.toString());
    }
  }

  render(): JSX.Element {
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
              onChange={(v): void => {
                this.roleName = v;
              }}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
