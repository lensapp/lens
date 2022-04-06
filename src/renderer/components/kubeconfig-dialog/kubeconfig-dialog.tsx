/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./kubeconfig-dialog.module.scss";
import React from "react";
import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import yaml from "js-yaml";
import type { ServiceAccount } from "../../../common/k8s-api/endpoints";
import { saveFileDialog } from "../../utils";
import { Button } from "../button";
import type { DialogProps } from "../dialog";
import { Dialog } from "../dialog";
import { Icon } from "../icon";
import { Notifications } from "../notifications";
import { Wizard, WizardStep } from "../wizard";
import { apiBase } from "../../api";
import { MonacoEditor } from "../monaco-editor";
import { clipboard } from "electron";

interface IKubeconfigDialogData {
  title?: React.ReactNode;
  loader?: () => Promise<any>;
}

export interface KubeConfigDialogProps extends Partial<DialogProps> {
}

const dialogState = observable.object({
  isOpen: false,
  data: null as IKubeconfigDialogData,
});

@observer
export class KubeConfigDialog extends React.Component<KubeConfigDialogProps> {
  @observable config = ""; // parsed kubeconfig in yaml format

  constructor(props: KubeConfigDialogProps) {
    super(props);
    makeObservable(this);
  }

  static open(data: IKubeconfigDialogData) {
    dialogState.isOpen = true;
    dialogState.data = data;
  }

  static close() {
    dialogState.isOpen = false;
    dialogState.data = null;
  }

  get data(): IKubeconfigDialogData {
    return dialogState.data;
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

    this.config = config ? yaml.dump(config) : "";
  }

  copyToClipboard = () => {
    clipboard.writeText(this.config);
    Notifications.ok("Config copied to clipboard");
  };

  download = () => {
    saveFileDialog("config", this.config, "text/yaml");
  };

  render() {
    const { ...dialogProps } = this.props;
    const yamlConfig = this.config;
    const header = <h5>{this.data?.title || "Kubeconfig File"}</h5>;
    const buttons = (
      <div className="actions flex gaps">
        <Button plain onClick={this.copyToClipboard}>
          <Icon material="assignment"/> Copy to clipboard
        </Button>
        <Button plain onClick={this.download}>
          <Icon material="cloud_download"/> Download file
        </Button>
        <Button plain className="box right" onClick={this.close}>
          Close
        </Button>
      </div>
    );

    return (
      <Dialog
        {...dialogProps}
        className={styles.KubeConfigDialog}
        isOpen={dialogState.isOpen}
        onOpen={this.onOpen}
        close={this.close}
      >
        <Wizard header={header}>
          <WizardStep customButtons={buttons} prev={this.close}>
            <MonacoEditor
              readOnly
              className={styles.editor}
              value={yamlConfig}
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
    title: `${accountName} kubeconfig`,
    loader: () => apiBase.get(`/kubeconfig/service-account/${namespace}/${accountName}`),
  });
}
