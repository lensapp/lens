/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import React from "react";
import type { IComputedValue } from "mobx";
import { computed, observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import type { DialogProps } from "../../dialog";
import { Dialog } from "../../dialog";
import { Wizard, WizardStep } from "../../wizard";
import { Input } from "../../input";
import { systemName } from "../../input/input_validators";
import type { ResourceQuotaValues } from "@k8slens/kube-object";
import type { ResourceQuotaApi } from "../../../../common/k8s-api/endpoints";
import { Select } from "../../select";
import { Icon } from "../../icon";
import { Button } from "@k8slens/button";
import { NamespaceSelect } from "../../namespaces/namespace-select";
import { SubTitle } from "../../layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import closeAddQuotaDialogInjectable from "./close.injectable";
import isAddQuotaDialogOpenInjectable from "./is-open.injectable";
import resourceQuotaApiInjectable from "../../../../common/k8s-api/endpoints/resource-quota.api.injectable";
import type { ShowCheckedErrorNotification } from "../../notifications/show-checked-error.injectable";
import showCheckedErrorNotificationInjectable from "../../notifications/show-checked-error.injectable";

export interface AddQuotaDialogProps extends DialogProps {
}

interface Dependencies {
  resourceQuotaApi: ResourceQuotaApi;
  isAddQuotaDialogOpen: IComputedValue<boolean>;
  closeAddQuotaDialog: () => void;
  showCheckedErrorNotification: ShowCheckedErrorNotification;
}

const getDefaultQuotas = (): ResourceQuotaValues => ({
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
});

@observer
class NonInjectedAddQuotaDialog extends React.Component<AddQuotaDialogProps & Dependencies> {

  public defaultNamespace = "default";

  @observable quotaName = "";
  @observable quotaSelectValue: string | null = null;
  @observable quotaInputValue = "";
  @observable namespace: string | null = this.defaultNamespace;
  readonly quotas = observable.box(getDefaultQuotas());

  constructor(props: AddQuotaDialogProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  @computed get quotaEntries() {
    return Object.entries(this.quotas.get())
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

  setQuota = () => {
    if (!this.quotaSelectValue) return;
    this.quotas.get()[this.quotaSelectValue] = this.quotaInputValue;
    this.quotaInputValue = "";
  };

  close = () => {
    this.props.closeAddQuotaDialog();
  };

  reset = () => {
    this.quotaName = "";
    this.quotaSelectValue = "";
    this.quotaInputValue = "";
    this.namespace = this.defaultNamespace;
    this.quotas.set(getDefaultQuotas());
  };

  addQuota = async () => {
    const { quotaName, namespace } = this;

    if (!quotaName || !namespace) {
      return;
    }

    try {
      const quotas = Object.fromEntries(this.quotaEntries);

      await this.props.resourceQuotaApi.create({ namespace, name: quotaName }, {
        spec: {
          hard: quotas,
        },
      });
      this.close();
    } catch (err) {
      this.props.showCheckedErrorNotification(err, "Unknown error occurred while creating ResourceQuota");
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
    const { closeAddQuotaDialog, isAddQuotaDialogOpen, resourceQuotaApi, ...dialogProps } = this.props;
    const header = <h5>Create ResourceQuota</h5>;

    void closeAddQuotaDialog;
    void resourceQuotaApi;

    return (
      <Dialog
        {...dialogProps}
        className="AddQuotaDialog"
        isOpen={isAddQuotaDialogOpen.get()}
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
              onChange={option => this.namespace = option?.value ?? null}
            />

            <SubTitle title="Values" />
            <div className="flex gaps align-center">
              <Select
                id="quota-input"
                className="quota-select"
                themeName="light"
                placeholder="Select a quota.."
                options={Object.keys(this.quotas).map(quota => ({
                  value: quota,
                  label: quota,
                }))}
                value={this.quotaSelectValue}
                onChange={option => this.quotaSelectValue = option?.value ?? null}
                formatOptionLabel={({ value }) => {
                  const iconMaterial = this.getQuotaOptionLabelIconMaterial(value);

                  return iconMaterial
                    ? (
                      <span className="nobr">
                        <Icon material={iconMaterial} />
                        {" "}
                        {value}
                      </span>
                    )
                    : value;
                }}
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
                  material={this.quotaSelectValue && this.quotas.get()[this.quotaSelectValue] ? "edit" : "add"}
                  tooltip="Set quota"
                />
              </Button>
            </div>
            <div className="quota-entries">
              {this.quotaEntries.map(([quota, value]) => (
                <div key={quota} className="quota gaps inline align-center">
                  <div className="name">{quota}</div>
                  <div className="value">{value}</div>
                  <Icon material="clear" onClick={() => this.quotas.get()[quota] = ""} />
                </div>
              ))}
            </div>
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}

export const AddQuotaDialog = withInjectables<Dependencies, AddQuotaDialogProps>(NonInjectedAddQuotaDialog, {
  getProps: (di, props) => ({
    ...props,
    closeAddQuotaDialog: di.inject(closeAddQuotaDialogInjectable),
    isAddQuotaDialogOpen: di.inject(isAddQuotaDialogOpenInjectable),
    resourceQuotaApi: di.inject(resourceQuotaApiInjectable),
    showCheckedErrorNotification: di.inject(showCheckedErrorNotificationInjectable),
  }),
});
