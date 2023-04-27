/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import React from "react";
import type { IComputedValue } from "mobx";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import type { DialogProps } from "../../dialog";
import { Dialog } from "../../dialog";
import { Wizard, WizardStep } from "../../wizard";
import { Input } from "../../input";
import { systemName } from "../../input/input_validators";
import type { SecretApi } from "../../../../common/k8s-api/endpoints";
import { reverseSecretTypeMap, SecretType } from "@k8slens/kube-object";
import { SubTitle } from "../../layout/sub-title";
import { NamespaceSelect } from "../../namespaces/namespace-select";
import { Select } from "../../select";
import { Icon } from "../../icon";
import { base64, iter, object } from "@k8slens/utilities";
import upperFirst from "lodash/upperFirst";
import type { ShowDetails } from "../../kube-detail-params/show-details.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import closeAddSecretDialogInjectable from "./close.injectable";
import secretApiInjectable from "../../../../common/k8s-api/endpoints/secret.api.injectable";
import showDetailsInjectable from "../../kube-detail-params/show-details.injectable";
import isAddSecretDialogOpenInjectable from "./is-open.injectable";
import type { ShowCheckedErrorNotification } from "../../notifications/show-checked-error.injectable";
import showCheckedErrorNotificationInjectable from "../../notifications/show-checked-error.injectable";

export interface AddSecretDialogProps extends Partial<DialogProps> {
}

interface SecretTemplateField {
  key: string;
  value?: string;
  required?: boolean;
}

interface SecretTemplate {
  [field: string]: SecretTemplateField[] | undefined;
  annotations?: SecretTemplateField[];
  labels?: SecretTemplateField[];
  data?: SecretTemplateField[];
}

type ISecretField = keyof SecretTemplate;

interface Dependencies {
  secretApi: SecretApi;
  isAddSecretDialogOpen: IComputedValue<boolean>;
  closeAddSecretDialog: () => void;
  showDetails: ShowDetails;
  showCheckedErrorNotification: ShowCheckedErrorNotification;
}

@observer
class NonInjectedAddSecretDialog extends React.Component<AddSecretDialogProps & Dependencies> {
  constructor(props: AddSecretDialogProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  private secretTemplate: Partial<Record<SecretType, SecretTemplate>> = {
    [SecretType.Opaque]: {},
    [SecretType.ServiceAccountToken]: {
      annotations: [
        { key: "kubernetes.io/service-account.name", required: true },
        { key: "kubernetes.io/service-account.uid", required: true },
      ],
    },
  };

  @observable secret = this.secretTemplate;
  @observable name = "";
  @observable namespace = "default";
  @observable type = SecretType.Opaque;

  reset = () => {
    this.name = "";
    this.secret = this.secretTemplate;
  };

  close = () => {
    this.props.closeAddSecretDialog();
  };

  private getDataFromFields = (fields: SecretTemplateField[] = [], processValue: (val: string) => string = (val => val)) => {
    return iter.chain(fields.values())
      .filterMap(({ key, value }) => (
        value
          ? [key, processValue(value)] as const
          : undefined
      ))
      .collect(object.fromEntries);
  };

  createSecret = async () => {
    const { name, namespace, type } = this;
    const { data = [], labels = [], annotations = [] } = this.secret[type] ?? {};

    try {
      const newSecret = await this.props.secretApi.create({ namespace, name }, {
        type,
        data: this.getDataFromFields(data, val => val ? base64.encode(val) : ""),
        metadata: {
          name,
          namespace,
          annotations: this.getDataFromFields(annotations),
          labels: this.getDataFromFields(labels),
        },
      });

      this.props.showDetails(newSecret?.selfLink);
      this.close();
    } catch (err) {
      this.props.showCheckedErrorNotification(err, "Unknown error occurred while creating a Secret");
    }
  };

  private getFields(field: ISecretField) {
    return (this.secret[this.type] ??= {})[field] ??= [];
  }

  addField = (field: ISecretField) => {
    this.getFields(field).push({ key: "", value: "" });
  };

  removeField = (field: ISecretField, index: number) => {
    this.getFields(field).splice(index, 1);
  };

  renderFields(field: ISecretField) {
    return (
      <>
        <SubTitle
          compact
          className="fields-title"
          title={upperFirst(field.toString())}
        >
          <Icon
            small
            tooltip="Add field"
            material="add_circle_outline"
            onClick={() => this.addField(field)}
          />
        </SubTitle>
        <div className="secret-fields">
          {this.getFields(field)
            .map((item, index) => (
              <div key={index} className="secret-field flex gaps auto align-center">
                <Input
                  className="key"
                  placeholder="Name"
                  title={item.key}
                  tabIndex={item.required ? -1 : 0}
                  readOnly={item.required}
                  value={item.key}
                  onChange={v => item.key = v}
                />
                <Input
                  multiLine
                  maxRows={5}
                  required={item.required}
                  className="value"
                  placeholder="Value"
                  value={item.value}
                  onChange={v => item.value = v}
                />
                <Icon
                  small
                  disabled={item.required}
                  tooltip={item.required ? "Required field" : "Remove field"}
                  className="remove-icon"
                  material="remove_circle_outline"
                  onClick={() => this.removeField(field, index)}
                />
              </div>
            ))}
        </div>
      </>
    );
  }

  render() {
    const { closeAddSecretDialog, isAddSecretDialogOpen, secretApi, showDetails, ...dialogProps } = this.props;
    const { namespace, name, type } = this;
    const header = <h5>Create Secret</h5>;

    void closeAddSecretDialog;
    void secretApi;
    void showDetails;

    return (
      <Dialog
        {...dialogProps}
        className="AddSecretDialog"
        isOpen={isAddSecretDialogOpen.get()}
        onOpen={this.reset}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep
            contentClass="flow column"
            nextLabel="Create"
            next={this.createSecret}
          >
            <div className="secret-name">
              <SubTitle title="Secret name" />
              <Input
                autoFocus
                required
                placeholder="Name"
                trim
                validators={systemName}
                value={name}
                onChange={v => this.name = v}
              />
            </div>
            <div className="flex auto gaps">
              <div className="secret-namespace">
                <SubTitle title="Namespace" />
                <NamespaceSelect
                  id="secret-namespace-input"
                  themeName="light"
                  value={namespace}
                  onChange={option => this.namespace = option?.value ?? "default"}
                />
              </div>
              <div className="secret-type">
                <SubTitle title="Secret type" />
                <Select
                  id="secret-input"
                  themeName="light"
                  options={Object.keys(this.secretTemplate) as SecretType[]}
                  value={type}
                  onChange={option => this.type = option?.value ?? SecretType.Opaque}
                  getOptionLabel={option => reverseSecretTypeMap[option.value]}
                />
              </div>
            </div>
            {this.renderFields("annotations")}
            {this.renderFields("labels")}
            {this.renderFields("data")}
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}

export const AddSecretDialog = withInjectables<Dependencies, AddSecretDialogProps>(NonInjectedAddSecretDialog, {
  getProps: (di, props) => ({
    ...props,
    closeAddSecretDialog: di.inject(closeAddSecretDialogInjectable),
    secretApi: di.inject(secretApiInjectable),
    showDetails: di.inject(showDetailsInjectable),
    isAddSecretDialogOpen: di.inject(isAddSecretDialogOpenInjectable),
    showCheckedErrorNotification: di.inject(showCheckedErrorNotificationInjectable),
  }),
});
