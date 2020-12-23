import "./add-secret-dialog.scss";

import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { _i18n } from "../../i18n";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Input } from "../input";
import { systemName } from "../input/input_validators";
import { Secret, secretsApi, SecretType } from "../../api/endpoints";
import { SubTitle } from "../layout/sub-title";
import { NamespaceSelect } from "../+namespaces/namespace-select";
import { Select, SelectOption } from "../select";
import { Icon } from "../icon";
import { IKubeObjectMetadata } from "../../api/kube-object";
import { base64 } from "../../utils";
import { Notifications } from "../notifications";
import upperFirst from "lodash/upperFirst";
import { showDetails } from "../kube-object";

interface Props extends Partial<DialogProps> {
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

@observer
export class AddSecretDialog extends React.Component<Props> {
  @observable static isOpen = false;

  static open() {
    AddSecretDialog.isOpen = true;
  }

  static close() {
    AddSecretDialog.isOpen = false;
  }

  private secretTemplate: { [p: string]: ISecretTemplate } = {
    [SecretType.Opaque]: {},
    [SecretType.ServiceAccountToken]: {
      annotations: [
        { key: "kubernetes.io/service-account.name", required: true },
        { key: "kubernetes.io/service-account.uid", required: true }
      ],
    },
  };

  get types() {
    return Object.keys(this.secretTemplate) as SecretType[];
  }

  @observable secret = this.secretTemplate;
  @observable name = "";
  @observable namespace = "default";
  @observable type = SecretType.Opaque;

  reset = () => {
    this.name = "";
    this.secret = this.secretTemplate;
  };

  close = () => {
    AddSecretDialog.close();
  };

  private getDataFromFields = (fields: ISecretTemplateField[] = [], processValue?: (val: string) => string) => {
    return fields.reduce<any>((data, field) => {
      const { key, value } = field;

      if (key) {
        data[key] = processValue ? processValue(value) : value;
      }

      return data;
    }, {});
  };

  createSecret = async () => {
    const { name, namespace, type } = this;
    const { data = [], labels = [], annotations = [] } = this.secret[type];
    const secret: Partial<Secret> = {
      type,
      data: this.getDataFromFields(data, val => val ? base64.encode(val) : ""),
      metadata: {
        name,
        namespace,
        annotations: this.getDataFromFields(annotations),
        labels: this.getDataFromFields(labels),
      } as IKubeObjectMetadata
    };

    try {
      const newSecret = await secretsApi.create({ namespace, name }, secret);

      showDetails(newSecret.selfLink);
      this.reset();
      this.close();
    } catch (err) {
      Notifications.error(err);
    }
  };

  addField = (field: ISecretField) => {
    const fields = this.secret[this.type][field] || [];

    fields.push({ key: "", value: "" });
    this.secret[this.type][field] = fields;
  };

  removeField = (field: ISecretField, index: number) => {
    const fields = this.secret[this.type][field] || [];

    fields.splice(index, 1);
  };

  renderFields(field: ISecretField) {
    const fields = this.secret[this.type][field] || [];

    return (
      <>
        <SubTitle compact className="fields-title" title={upperFirst(field.toString())}>
          <Icon
            small
            tooltip={_i18n._(t`Add field`)}
            material="add_circle_outline"
            onClick={() => this.addField(field)}
          />
        </SubTitle>
        <div className="secret-fields">
          {fields.map((item, index) => {
            const { key = "", value = "", required } = item;

            return (
              <div key={index} className="secret-field flex gaps auto align-center">
                <Input
                  className="key"
                  placeholder={_i18n._(t`Name`)}
                  title={key}
                  tabIndex={required ? -1 : 0}
                  readOnly={required}
                  value={key} onChange={v => item.key = v}
                />
                <Input
                  multiLine maxRows={5}
                  required={required}
                  className="value"
                  placeholder={_i18n._(t`Value`)}
                  value={value} onChange={v => item.value = v}
                />
                <Icon
                  small
                  disabled={required}
                  tooltip={required ? <Trans>Required field</Trans> : <Trans>Remove field</Trans>}
                  className="remove-icon"
                  material="remove_circle_outline"
                  onClick={() => this.removeField(field, index)}
                />
              </div>
            );
          })}
        </div>
      </>
    );
  }

  render() {
    const { ...dialogProps } = this.props;
    const { namespace, name, type } = this;
    const header = <h5><Trans>Create Secret</Trans></h5>;

    return (
      <Dialog
        {...dialogProps}
        className="AddSecretDialog"
        isOpen={AddSecretDialog.isOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flow column" nextLabel={<Trans>Create</Trans>} next={this.createSecret}>
            <div className="secret-name">
              <SubTitle title={<Trans>Secret name</Trans>} />
              <Input
                autoFocus required
                placeholder={_i18n._(t`Name`)}
                validators={systemName}
                value={name} onChange={v => this.name = v}
              />
            </div>
            <div className="flex auto gaps">
              <div className="secret-namespace">
                <SubTitle title={<Trans>Namespace</Trans>} />
                <NamespaceSelect
                  themeName="light"
                  value={namespace}
                  onChange={({ value }) => this.namespace = value}
                />
              </div>
              <div className="secret-type">
                <SubTitle title={<Trans>Secret type</Trans>} />
                <Select
                  themeName="light"
                  options={this.types}
                  value={type} onChange={({ value }: SelectOption) => this.type = value}
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
