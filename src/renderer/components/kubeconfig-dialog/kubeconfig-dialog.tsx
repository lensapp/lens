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

import "./kubeconfig-dialog.scss";

import React from "react";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import yaml from "js-yaml";
import type { ServiceAccount } from "../../../common/k8s-api/endpoints";
import { copyToClipboard, cssNames, saveFileDialog } from "../../utils";
import { Button } from "../button";
import { Dialog, DialogProps } from "../dialog";
import { Icon } from "../icon";
import { Notifications } from "../notifications";
import { Wizard, WizardStep } from "../wizard";
import { apiBase } from "../../api";
import MonacoEditor from "react-monaco-editor";
import { ThemeStore } from "../../theme.store";
import { UserStore } from "../../../common/user-store";

interface IKubeconfigDialogData {
  title?: React.ReactNode;
  loader?: () => Promise<any>;
}

interface Props extends Partial<DialogProps> {
}

const dialogState = observable.object({
  isOpen: false,
  data: null as IKubeconfigDialogData,
});

@observer
export class KubeConfigDialog extends React.Component<Props> {
  @observable.ref configTextArea: HTMLTextAreaElement; // required for coping config text
  @observable config = ""; // parsed kubeconfig in yaml format

  constructor(props: Props) {
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
    if (this.config && copyToClipboard(this.configTextArea)) {
      Notifications.ok("Config copied to clipboard");
    }
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
        className={cssNames("KubeConfigDialog")}
        isOpen={dialogState.isOpen}
        onOpen={this.onOpen}
        close={this.close}
      >
        <Wizard header={header}>
          <WizardStep customButtons={buttons} prev={this.close}>
            <MonacoEditor
              language="yaml"
              value={yamlConfig}
              theme={ThemeStore.getInstance().activeTheme.monacoTheme}
              className={cssNames( "MonacoEditor")}
              options={{ readOnly: true, ...UserStore.getInstance().getEditorOptions() }}
            />
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
    title: `${accountName} kubeconfig`,
    loader: () => apiBase.get(`/kubeconfig/service-account/${namespace}/${accountName}`),
  });
}
