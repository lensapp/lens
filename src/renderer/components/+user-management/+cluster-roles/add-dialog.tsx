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
import "./add-dialog.scss";

import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";

import { Dialog, DialogProps } from "../../dialog";
import { Input } from "../../input";
import { showDetails } from "../../kube-details";
import { SubTitle } from "../../layout/sub-title";
import { Notifications } from "../../notifications";
import { Wizard, WizardStep } from "../../wizard";
import { clusterRolesStore } from "./store";

interface Props extends Partial<DialogProps> {
}

@observer
export class AddClusterRoleDialog extends React.Component<Props> {
  static isOpen = observable.box(false);

  @observable clusterRoleName = "";

  constructor(props: Props) {
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
      const role = await clusterRolesStore.create({ name: this.clusterRoleName });

      showDetails(role.selfLink);
      this.reset();
      AddClusterRoleDialog.close();
    } catch (err) {
      Notifications.error(err.toString());
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
              required autoFocus
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
