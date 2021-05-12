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

import "./add-role-dialog.scss";

import React from "react";
import { observable } from "mobx";
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

@observer
export class AddRoleDialog extends React.Component<Props> {
  @observable static isOpen = false;

  @observable roleName = "";
  @observable namespace = "";

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
        isOpen={AddRoleDialog.isOpen}
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
