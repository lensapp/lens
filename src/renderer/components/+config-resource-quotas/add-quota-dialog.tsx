/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./add-quota-dialog.scss";

import React from "react";
import { computed, observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import type { DialogProps } from "../dialog";
import { Dialog } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Input } from "../input";
import { systemName } from "../input/input_validators";
import type { IResourceQuotaValues } from "../../../common/k8s-api/endpoints/resource-quota.api";
import { resourceQuotaApi } from "../../../common/k8s-api/endpoints/resource-quota.api";
import { Select } from "../select";
import { Icon } from "../icon";
import { Button } from "../button";
import { Notifications } from "../notifications";
import { NamespaceSelect } from "../+namespaces/namespace-select";
import { SubTitle } from "../layout/sub-title";

export interface AddQuotaDialogProps extends DialogProps {
}

const dialogState = observable.object({
  isOpen: false,
});

@observer
export class AddQuotaDialog extends React.Component<AddQuotaDialogProps> {
  static defaultQuotas: IResourceQuotaValues = {
    "limits.cpu": "",
    "limits.memory": "",
    "requests.cpu": "",
    "requests.memory": "",
    "requests.storage": "",
    "persistentvolumeclaims": "",
    "count/pods": "",
    "count/persistentvolumeclaims": "",
    "count/services": "",
    "count/secrets": "",
    "count/configmaps": "",
    "count/replicationcontrollers": "",
    "count/deployments.apps": "",
    "count/replicasets.apps": "",
    "count/statefulsets.apps": "",
    "count/jobs.batch": "",
    "count/cronjobs.batch": "",
    "count/deployments.extensions": "",
  };

  public defaultNamespace = "default";

  @observable quotaName = "";
  @observable quotaSelectValue: string | null = null;
  @observable quotaInputValue = "";
  @observable namespace: string | null = this.defaultNamespace;
  @observable quotas = AddQuotaDialog.defaultQuotas;

  constructor(props: AddQuotaDialogProps) {
    super(props);
    makeObservable(this);
  }

  static open() {
    dialogState.isOpen = true;
  }

  static close() {
    dialogState.isOpen = false;
  }

  @computed get quotaEntries() {
    return Object.entries(this.quotas)
      .filter(([, value]) => !!value?.trim());
  }

  private getQuotaOptionLabelIconMaterial(quota: string) {
    if (quota.endsWith(".cpu") || quota.endsWith(".memory")) {
      return "memory";
    }

    if (quota.endsWith(".storage") || quota === "persistentvolumeclaims") {
      return "storage";
    }

    if (quota.startsWith("count/")) {
      return "looks_one";
    }

    return undefined;
  }

  private formatQuotaOptionLabel = (quota: string) => {
    const iconMaterial = this.getQuotaOptionLabelIconMaterial(quota);

    return iconMaterial
      ? (
        <span className="nobr">
          <Icon material={iconMaterial} /> 
          {" "}
          {quota}
        </span>
      )
      : quota;
  };

  setQuota = () => {
    if (!this.quotaSelectValue) return;
    this.quotas[this.quotaSelectValue] = this.quotaInputValue;
    this.quotaInputValue = "";
  };

  close = () => {
    AddQuotaDialog.close();
  };

  reset = () => {
    this.quotaName = "";
    this.quotaSelectValue = "";
    this.quotaInputValue = "";
    this.namespace = this.defaultNamespace;
    this.quotas = AddQuotaDialog.defaultQuotas;
  };

  addQuota = async () => {
    const { quotaName, namespace } = this;

    if (!quotaName || !namespace) {
      return;
    }

    try {
      const quotas = Object.fromEntries(this.quotaEntries);

      await resourceQuotaApi.create({ namespace, name: quotaName }, {
        spec: {
          hard: quotas,
        },
      });
      this.close();
    } catch (err) {
      Notifications.checkedError(err, "Unknown error occured while creating ResourceQuota");
    }
  };

  onInputQuota = (evt: React.KeyboardEvent) => {
    switch (evt.key) {
      case "Enter":
        this.setQuota();
        evt.preventDefault(); // don't submit form
        break;
    }
  };

  render() {
    const { ...dialogProps } = this.props;
    const header = <h5>Create ResourceQuota</h5>;

    return (
      <Dialog
        {...dialogProps}
        className="AddQuotaDialog"
        isOpen={dialogState.isOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep
            contentClass="flex gaps column"
            disabledNext={!this.namespace || !this.quotaName}
            nextLabel="Create"
            next={this.addQuota}
          >
            <div className="flex gaps">
              <Input
                required
                autoFocus
                placeholder="ResourceQuota name"
                trim
                validators={systemName}
                value={this.quotaName}
                onChange={v => this.quotaName = v.toLowerCase()}
                className="box grow"
              />
            </div>

            <SubTitle title="Namespace" />
            <NamespaceSelect
              id="namespace-input"
              value={this.namespace}
              placeholder="Namespace"
              themeName="light"
              className="box grow"
              onChange={value => this.namespace = value}
            />

            <SubTitle title="Values" />
            <div className="flex gaps align-center">
              <Select
                id="quota-input"
                className="quota-select"
                themeName="light"
                placeholder="Select a quota.."
                options={Object.keys(this.quotas)}
                isMulti={false}
                value={this.quotaSelectValue}
                onChange={value => this.quotaSelectValue = value}
                formatOptionLabel={this.formatQuotaOptionLabel}
              />
              <Input
                maxLength={10}
                placeholder="Value"
                value={this.quotaInputValue}
                onChange={v => this.quotaInputValue = v}
                onKeyDown={this.onInputQuota}
                className="box grow"
              />
              <Button
                round
                primary
                onClick={this.setQuota}
              >
                <Icon
                  material={this.quotaSelectValue && this.quotas[this.quotaSelectValue] ? "edit" : "add"}
                  tooltip="Set quota"
                />
              </Button>
            </div>
            <div className="quota-entries">
              {this.quotaEntries.map(([quota, value]) => (
                <div key={quota} className="quota gaps inline align-center">
                  <div className="name">{quota}</div>
                  <div className="value">{value}</div>
                  <Icon material="clear" onClick={() => this.quotas[quota] = ""} />
                </div>
              ))}
            </div>
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
