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

import "./add-helm-repo-dialog.scss";

import React from "react";
import type { FileFilter } from "electron";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Input } from "../input";
import { Checkbox } from "../checkbox";
import { Button } from "../button";
import { systemName, isUrl, isPath } from "../input/input_validators";
import { SubTitle } from "../layout/sub-title";
import { Icon } from "../icon";
import { Notifications } from "../notifications";
import { HelmRepo, HelmRepoManager } from "../../../main/helm/helm-repo-manager";
import { dialog } from "../../remote-helpers";

interface Props extends Partial<DialogProps> {
  onAddRepo: Function
}

enum FileType {
  CaFile = "caFile",
  KeyFile = "keyFile",
  CertFile = "certFile",
}

const dialogState = observable.object({
  isOpen: false,
});

@observer
export class AddHelmRepoDialog extends React.Component<Props> {
  private emptyRepo = { name: "", url: "", username: "", password: "", insecureSkipTlsVerify: false, caFile:"", keyFile: "", certFile: "" };

  private static keyExtensions = ["key", "keystore", "jks", "p12", "pfx", "pem"];
  private static certExtensions = ["crt", "cer", "ca-bundle", "p7b", "p7c", "p7s", "p12", "pfx", "pem"];

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  static open() {
    dialogState.isOpen = true;
  }

  static close() {
    dialogState.isOpen = false;
  }

  @observable helmRepo : HelmRepo = this.emptyRepo;
  @observable showOptions = false;

  close = () => {
    AddHelmRepoDialog.close();
    this.helmRepo = this.emptyRepo;
    this.showOptions = false;
  };

  setFilepath(type: FileType, value: string) {
    this.helmRepo[type] = value;
  }

  getFilePath(type: FileType) : string {
    return this.helmRepo[type];
  }

  async selectFileDialog(type: FileType, fileFilter: FileFilter) {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      defaultPath: this.getFilePath(type),
      properties: ["openFile", "showHiddenFiles"],
      message: `Select file`,
      buttonLabel: `Use file`,
      filters: [
        fileFilter,
        { name: "Any", extensions: ["*"] },
      ],
    });

    if (!canceled && filePaths.length) {
      this.setFilepath(type, filePaths[0]);
    }
  }

  async addCustomRepo() {
    try {
      await HelmRepoManager.addCustomRepo(this.helmRepo);
      Notifications.ok(<>Helm repository <b>{this.helmRepo.name}</b> has added</>);
      this.props.onAddRepo();
      this.close();
    } catch (err) {
      Notifications.error(<>Adding helm branch <b>{this.helmRepo.name}</b> has failed: {String(err)}</>);
    }
  }

  renderFileInput(placeholder:string, fileType:FileType, fileExtensions:string[]){
    return(
      <div className="flex gaps align-center">
        <Input
          placeholder={placeholder}
          validators = {isPath}
          className="box grow"
          value={this.getFilePath(fileType)}
          onChange={v => this.setFilepath(fileType, v)}
        />
        <Icon
          material="folder"
          onClick={() => this.selectFileDialog(fileType, { name: placeholder, extensions: fileExtensions })}
          tooltip="Browse"
        />
      </div>);
  }

  renderOptions() {
    return (
      <>
        <SubTitle title="Security settings" />
        <Checkbox
          label="Skip TLS certificate checks for the repository"
          value={this.helmRepo.insecureSkipTlsVerify}
          onChange={v => this.helmRepo.insecureSkipTlsVerify = v}
        />
        {this.renderFileInput(`Key file`, FileType.KeyFile, AddHelmRepoDialog.keyExtensions)}
        {this.renderFileInput(`Ca file`, FileType.CaFile, AddHelmRepoDialog.certExtensions)}
        {this.renderFileInput(`Certificate file`, FileType.CertFile, AddHelmRepoDialog.certExtensions)}
        <SubTitle title="Chart Repository Credentials" />
        <Input
          placeholder="Username"
          value={this.helmRepo.username} onChange= {v => this.helmRepo.username = v}
        />
        <Input
          type="password"
          placeholder="Password"
          value={this.helmRepo.password} onChange={v => this.helmRepo.password = v}
        />
      </>);
  }

  render() {
    const { ...dialogProps } = this.props;

    const header = <h5>Add custom Helm Repo</h5>;

    return (
      <Dialog
        {...dialogProps}
        className="AddHelmRepoDialog"
        isOpen={dialogState.isOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flow column" nextLabel="Add" next={()=>{this.addCustomRepo();}}>
            <div className="flex column gaps">
              <Input
                autoFocus required
                placeholder="Helm repo name"
                trim
                validators={systemName}
                value={this.helmRepo.name} onChange={v => this.helmRepo.name = v}
              />
              <Input
                required
                placeholder="URL"
                validators={isUrl}
                value={this.helmRepo.url} onChange={v => this.helmRepo.url = v}
              />
              <Button plain className="accordion" onClick={() => this.showOptions = !this.showOptions} >
                More
                <Icon
                  small
                  tooltip="More"
                  material={this.showOptions ? "remove" : "add"}
                />
              </Button>
              {this.showOptions && this.renderOptions()}
            </div>
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
