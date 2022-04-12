/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./add-dialog.scss";

import React from "react";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";

import { NamespaceSelect } from "../../+namespaces/namespace-select";
import type { DialogProps } from "../../dialog";
import { Dialog } from "../../dialog";
import { Input } from "../../input";
import { showDetails } from "../../kube-detail-params";
import { SubTitle } from "../../layout/sub-title";
import { Notifications } from "../../notifications";
import { Wizard, WizardStep } from "../../wizard";
import { roleStore } from "./legacy-store";

export interface AddRoleDialogProps extends Partial<DialogProps> {
}

@observer
export class AddRoleDialog extends React.Component<AddRoleDialogProps> {
  static isOpen = observable.box(false);

  @observable roleName = "";
  @observable namespace = "";

  constructor(props: AddRoleDialogProps) {
    super(props);
    makeObservable(this);
  }

  static open() {
    AddRoleDialog.isOpen.set(true);
  }

  static close() {
    AddRoleDialog.isOpen.set(false);
  }

  reset = () => {
    this.roleName = "";
    this.namespace = "";
  };

  createRole = async () => {
    try {
      const role = await roleStore.create({ name: this.roleName, namespace: this.namespace });

      showDetails(role.selfLink);
      this.reset();
      AddRoleDialog.close();
    } catch (err) {
      Notifications.checkedError(err, "Unknown error occured while creating role");
    }
  };

  render() {
    const { ...dialogProps } = this.props;
    const header = <h5>Create Role</h5>;

    return (
      <Dialog
        {...dialogProps}
        className="AddRoleDialog"
        isOpen={AddRoleDialog.isOpen.get()}
        close={AddRoleDialog.close}
      >
        <Wizard header={header} done={AddRoleDialog.close}>
          <WizardStep
            contentClass="flex gaps column"
            nextLabel="Create"
            next={this.createRole}
          >
            <SubTitle title="Role Name" />
            <Input
              required
              autoFocus
              placeholder="Name"
              iconLeft="supervisor_account"
              value={this.roleName}
              onChange={v => this.roleName = v}
            />
            <SubTitle title="Namespace" />
            <NamespaceSelect
              id="add-dialog-namespace-select-input"
              themeName="light"
              value={this.namespace}
              onChange={option => this.namespace = option?.namespace ?? "default"}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
