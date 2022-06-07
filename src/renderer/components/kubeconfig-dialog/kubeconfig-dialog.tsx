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
import { cssNames, saveFileDialog } from "../../utils";
import { Button } from "../button";
import type { DialogProps } from "../dialog";
import { Dialog } from "../dialog";
import { Icon } from "../icon";
import { Notifications } from "../notifications";
import { Wizard, WizardStep } from "../wizard";
import { apiBase } from "../../api";
import { MonacoEditor } from "../monaco-editor";
import { clipboard } from "electron";

export interface KubeconfigDialogData {
  title?: React.ReactNode;
  loader: () => Promise<any>;
}

export interface KubeConfigDialogProps extends Partial<DialogProps> {
}

const dialogState = observable.box<KubeconfigDialogData | undefined>();

@observer
export class KubeConfigDialog extends React.Component<KubeConfigDialogProps> {
  @observable config = ""; // parsed kubeconfig in yaml format

  constructor(props: KubeConfigDialogProps) {
    super(props);
    makeObservable(this);
  }

  static open(data: KubeconfigDialogData) {
    dialogState.set(data);
  }

  static close() {
    dialogState.set(undefined);
  }

  close = () => {
    KubeConfigDialog.close();
  };

  onOpen = (data: KubeconfigDialogData) => {
    this.loadConfig(data);
  };

  async loadConfig(data: KubeconfigDialogData) {
    const config = await data.loader().catch(err => {
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

  renderContents(data: KubeconfigDialogData) {
    const yamlConfig = this.config;

    return (
      <Wizard header={<h5>{data.title || "Kubeconfig File"}</h5>}>
        <WizardStep
          customButtons={(
            <div className="actions flex gaps">
              <Button plain onClick={this.copyToClipboard}>
                <Icon material="assignment"/>
                {" Copy to clipboard"}
              </Button>
              <Button plain onClick={this.download}>
                <Icon material="cloud_download"/>
                {" Download file"}
              </Button>
              <Button
                plain
                className="box right"
                onClick={this.close}
              >
                Close
              </Button>
            </div>
          )}
          prev={this.close}
        >
          <MonacoEditor
            readOnly
            className={styles.editor}
            value={yamlConfig}
          />
        </WizardStep>
      </Wizard>
    );
  }

  render() {
    const { className, ...dialogProps } = this.props;
    const data = dialogState.get();

    return (
      <Dialog
        {...dialogProps}
        className={cssNames(styles.KubeConfigDialog, className)}
        isOpen={Boolean(data)}
        onOpen={data && (() => this.onOpen(data))}
        close={this.close}
      >
        {data && this.renderContents(data)}
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
