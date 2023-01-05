/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./add-dialog.scss";

import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";

import type { DialogProps } from "../../dialog";
import { Dialog } from "../../dialog";
import { Input } from "../../input";
import { showDetails } from "../../kube-detail-params";
import { SubTitle } from "../../layout/sub-title";
import { Notifications } from "../../notifications";
import { Wizard, WizardStep } from "../../wizard";
import { clusterRoleStore } from "./legacy-store";

export interface AddClusterRoleDialogProps extends Partial<DialogProps> {
}

@observer
export class AddClusterRoleDialog extends React.Component<AddClusterRoleDialogProps> {
  static isOpen = observable.box(false);

  @observable clusterRoleName = "";

  constructor(props: AddClusterRoleDialogProps) {
    super(props);
    makeObservable(this);
  }

  static open() {
    AddClusterRoleDialog.isOpen.set(true);
  }

  static close() {
    AddClusterRoleDialog.isOpen.set(false);
  }

  reset = () => {
    this.clusterRoleName = "";
  };

  createRole = async () => {
    try {
      const role = await clusterRoleStore.create({ name: this.clusterRoleName });

      showDetails(role.selfLink);
      this.reset();
      AddClusterRoleDialog.close();
    } catch (error) {
      Notifications.checkedError(error, "Unknown error occured while creating the role");
    }
  };

  render() {
    const { ...dialogProps } = this.props;

    return (
      <Dialog
        {...dialogProps}
        className="AddClusterRoleDialog"
        isOpen={AddClusterRoleDialog.isOpen.get()}
        close={AddClusterRoleDialog.close}
      >
        <Wizard
          header={<h5>Create ClusterRole</h5>}
          done={AddClusterRoleDialog.close}
        >
          <WizardStep
            contentClass="flex gaps column"
            nextLabel="Create"
            next={this.createRole}
          >
            <SubTitle title="ClusterRole Name" />
            <Input
              required
              autoFocus
              placeholder="Name"
              iconLeft="supervisor_account"
              value={this.clusterRoleName}
              onChange={v => this.clusterRoleName = v}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
