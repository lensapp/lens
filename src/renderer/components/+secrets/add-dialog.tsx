/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./add-dialog.scss";

import React, { useEffect, useState } from "react";
import { action, observable } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Input } from "../input";
import { systemName } from "../input/input_validators";
import { SecretApi, SecretType } from "../../../common/k8s-api/endpoints";
import { SubTitle } from "../layout/sub-title";
import { NamespaceSelect } from "../+namespaces/namespace-select";
import { Select, SelectOption } from "../select";
import { Icon } from "../icon";
import type { KubeObjectMetadata } from "../../../common/k8s-api/kube-object";
import { base64, cssNames } from "../../utils";
import { Notifications } from "../notifications";
import upperFirst from "lodash/upperFirst";
import { showDetails } from "../kube-detail-params";
import { withInjectables } from "@ogre-tools/injectable-react";
import addSecretDialogStateInjectable, { AddSecretDialogState } from "./add-dialog.state.injectable";
import closeAddSecretDialogInjectable from "./add-dialog-close.injectable";
import secretApiInjectable from "../../../common/k8s-api/endpoints/secret.api.injectable";

export interface AddSecretDialogProps extends Partial<DialogProps> {
}

interface ISecretTemplateField {
  key: string;
  value?: string;
  required?: boolean;
}

interface ISecretTemplate {
  [field: string]: ISecretTemplateField[];
  annotations?: ISecretTemplateField[];
  labels?: ISecretTemplateField[];
  data?: ISecretTemplateField[];
}

type ISecretField = keyof ISecretTemplate;

interface Dependencies {
  state: AddSecretDialogState;
  closeAddSecretDialog: () => void;
  secretApi: SecretApi;
}

const NonInjectedAddSecretDialog = observer(({ secretApi, state, closeAddSecretDialog, className, ...dialogProps }: Dependencies & AddSecretDialogProps) => {
  const [secret] = useState(observable.map<SecretType, ISecretTemplate>());
  const [name, setName] = useState("");
  const [namespace, setNamespace] = useState("default");
  const [type, setType] = useState(SecretType.Opaque);
  const secretTypes = [...secret.keys()];
  const { isOpen } = state;

  const reset = action(() => {
    setName("");
    secret.clear();
    secret
      .set(SecretType.Opaque, {})
      .set(SecretType.ServiceAccountToken, {
        annotations: [
          { key: "kubernetes.io/service-account.name", required: true },
          { key: "kubernetes.io/service-account.uid", required: true },
        ],
      });
  });

  useEffect(() => reset(), []); // initialize secret map

  const getDataFromFields = (fields: ISecretTemplateField[] = [], processValue?: (val: string) => string) => {
    return fields.reduce<any>((data, field) => {
      const { key, value } = field;

      if (key) {
        data[key] = processValue ? processValue(value) : value;
      }

      return data;
    }, {});
  };

  const createSecret = async () => {
    const { data = [], labels = [], annotations = [] } = secret.get(type);

    try {
      const newSecret = await secretApi.create({ namespace, name }, {
        type,
        data: getDataFromFields(data, val => val ? base64.encode(val) : ""),
        metadata: {
          name,
          namespace,
          annotations: getDataFromFields(annotations),
          labels: getDataFromFields(labels),
        } as KubeObjectMetadata,
      });

      showDetails(newSecret.selfLink);
      close();
    } catch (err) {
      Notifications.error(err);
    }
  };

  const addField = (field: ISecretField) => {
    (secret.get(type)[field] ??= []).push({ key: "", value: "" });
  };

  const removeField = (field: ISecretField, index: number) => {
    (secret.get(type)[field] ??= []).splice(index, 1);
  };

  const renderFields = (field: ISecretField) => (
    <>
      <SubTitle compact className="fields-title" title={upperFirst(field.toString())}>
        <Icon
          small
          tooltip="Add field"
          material="add_circle_outline"
          onClick={() => addField(field)}
        />
      </SubTitle>
      <div className="secret-fields">
        {secret.get(type)[field]?.map((item, index) => {
          const { key = "", value = "", required } = item;

          return (
            <div key={index} className="secret-field flex gaps auto align-center">
              <Input
                className="key"
                placeholder="Name"
                title={key}
                tabIndex={required ? -1 : 0}
                readOnly={required}
                value={key}
                onChange={v => item.key = v}
              />
              <Input
                multiLine maxRows={5}
                required={required}
                className="value"
                placeholder="Value"
                value={value}
                onChange={v => item.value = v}
              />
              <Icon
                small
                disabled={required}
                tooltip={required ? "Required field" : "Remove field"}
                className="remove-icon"
                material="remove_circle_outline"
                onClick={() => removeField(field, index)}
              />
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <Dialog
      {...dialogProps}
      className={cssNames("AddSecretDialog", className)}
      isOpen={isOpen}
      onOpen={reset}
      close={closeAddSecretDialog}
    >
      <Wizard header={<h5>Create Secret</h5>} done={closeAddSecretDialog}>
        <WizardStep contentClass="flow column" nextLabel="Create" next={createSecret}>
          <div className="secret-name">
            <SubTitle title="Secret name" />
            <Input
              autoFocus required
              placeholder="Name"
              trim
              validators={systemName}
              value={name}
              onChange={setName}
            />
          </div>
          <div className="flex auto gaps">
            <div className="secret-namespace">
              <SubTitle title="Namespace" />
              <NamespaceSelect
                themeName="light"
                value={namespace}
                onChange={({ value }) => setNamespace(value)}
              />
            </div>
            <div className="secret-type">
              <SubTitle title="Secret type" />
              <Select
                themeName="light"
                options={secretTypes}
                value={type}
                onChange={({ value }: SelectOption) => setType(value)}
              />
            </div>
          </div>
          {renderFields("annotations")}
          {renderFields("labels")}
          {renderFields("data")}
        </WizardStep>
      </Wizard>
    </Dialog>
  );
});

export const AddSecretDialog = withInjectables<Dependencies, AddSecretDialogProps>(NonInjectedAddSecretDialog, {
  getProps: (di, props) => ({
    state: di.inject(addSecretDialogStateInjectable),
    closeAddSecretDialog: di.inject(closeAddSecretDialogInjectable),
    secretApi: di.inject(secretApiInjectable),
    ...props,
  }),
});
