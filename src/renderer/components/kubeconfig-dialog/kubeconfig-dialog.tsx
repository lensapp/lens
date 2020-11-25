import "./kubeconfig-dialog.scss";

import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import jsYaml from "js-yaml";
import { Trans } from "@lingui/macro";
import { AceEditor } from "../ace-editor";
import { ServiceAccount } from "../../api/endpoints";
import { copyToClipboard, cssNames, saveFileDialog } from "../../utils";
import { Button } from "../button";
import { Dialog, DialogProps } from "../dialog";
import { Icon } from "../icon";
import { Notifications } from "../notifications";
import { Wizard, WizardStep } from "../wizard";
import { apiBase } from "../../api";

interface IKubeconfigDialogData {
  title?: React.ReactNode;
  loader?: () => Promise<any>;
}

interface Props extends Partial<DialogProps> {
}

@observer
export class KubeConfigDialog extends React.Component<Props> {
  @observable static isOpen = false;
  @observable static data: IKubeconfigDialogData = null;

  @observable.ref configTextArea: HTMLTextAreaElement; // required for coping config text
  @observable config = ""; // parsed kubeconfig in yaml format

  static open(data: IKubeconfigDialogData) {
    KubeConfigDialog.isOpen = true;
    KubeConfigDialog.data = data;
  }

  static close() {
    KubeConfigDialog.isOpen = false;
  }

  get data(): IKubeconfigDialogData {
    return KubeConfigDialog.data;
  }

  close = () => {
    KubeConfigDialog.close();
  };

  onOpen = () => {
    this.loadConfig();
  };

  async loadConfig() {
    const config = await this.data.loader().catch(err => {
      Notifications.error(err);
      this.close();
    });
    this.config = config ? jsYaml.dump(config) : "";
  }

  copyToClipboard = () => {
    if (this.config && copyToClipboard(this.configTextArea)) {
      Notifications.ok(<Trans>Config copied to clipboard</Trans>);
    }
  };

  download = () => {
    saveFileDialog("config", this.config, "text/yaml");
  };

  render() {
    const { isOpen, data = {} } = KubeConfigDialog;
    const { ...dialogProps } = this.props;
    const yamlConfig = this.config;
    const header = <h5>{data.title || <Trans>Kubeconfig File</Trans>}</h5>;
    const buttons = (
      <div className="actions flex gaps">
        <Button plain onClick={this.copyToClipboard}>
          <Icon material="assignment"/> <Trans>Copy to clipboard</Trans>
        </Button>
        <Button plain onClick={this.download}>
          <Icon material="cloud_download"/> <Trans>Download file</Trans>
        </Button>
        <Button plain className="box right" onClick={this.close}>
          <Trans>Close</Trans>
        </Button>
      </div>
    );
    return (
      <Dialog
        {...dialogProps}
        className={cssNames("KubeConfigDialog")}
        isOpen={isOpen}
        onOpen={this.onOpen}
        close={this.close}
      >
        <Wizard header={header}>
          <WizardStep customButtons={buttons} prev={this.close}>
            <AceEditor mode="yaml" value={yamlConfig} readOnly/>
            <textarea
              className="config-copy"
              readOnly defaultValue={yamlConfig}
              ref={e => this.configTextArea = e}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}

export function openServiceAccountKubeConfig(account: ServiceAccount) {
  const accountName = account.getName();
  const namespace = account.getNs();
  KubeConfigDialog.open({
    title: <Trans>{accountName} kubeconfig</Trans>,
    loader: () => apiBase.get(`/kubeconfig/service-account/${namespace}/${accountName}`)
  });
}