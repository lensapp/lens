/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./add-helm-repo-dialog.scss";

import React from "react";
import type { FileFilter } from "electron";
import { observable, makeObservable, action } from "mobx";
import { observer } from "mobx-react";
import type { DialogProps } from "../dialog";
import { Dialog } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Input } from "../input";
import { Checkbox } from "../checkbox";
import { Button } from "../button";
import { systemName, isUrl, isPath } from "../input/input_validators";
import { SubTitle } from "../layout/sub-title";
import { Icon } from "../icon";
import { Notifications } from "../notifications";
import { type HelmRepo, HelmRepoManager } from "../../../main/helm/helm-repo-manager";
import { requestOpenFilePickingDialog } from "../../ipc";

export interface AddHelmRepoDialogProps extends Partial<DialogProps> {
  onAddRepo: () => void;
}

enum FileType {
  CaFile = "caFile",
  KeyFile = "keyFile",
  CertFile = "certFile",
}

const dialogState = observable.object({
  isOpen: false,
});

function getEmptyRepo(): HelmRepo {
  return { name: "", url: "", username: "", password: "", insecureSkipTlsVerify: false, caFile: "", keyFile: "", certFile: "" };
}
@observer
export class AddHelmRepoDialog extends React.Component<AddHelmRepoDialogProps> {
  private static keyExtensions = ["key", "keystore", "jks", "p12", "pfx", "pem"];
  private static certExtensions = ["crt", "cer", "ca-bundle", "p7b", "p7c", "p7s", "p12", "pfx", "pem"];

  constructor(props: AddHelmRepoDialogProps) {
    super(props);
    makeObservable(this);
  }

  static open() {
    dialogState.isOpen = true;
  }

  static close() {
    dialogState.isOpen = false;
  }

  @observable helmRepo = getEmptyRepo();
  @observable showOptions = false;

  @action
    close = () => {
      AddHelmRepoDialog.close();
      this.helmRepo = getEmptyRepo();
      this.showOptions = false;
    };

  setFilepath(type: FileType, value: string) {
    this.helmRepo[type] = value;
  }

  getFilePath(type: FileType) {
    return this.helmRepo[type];
  }

  async selectFileDialog(type: FileType, fileFilter: FileFilter) {
    const { canceled, filePaths } = await requestOpenFilePickingDialog({
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
      await HelmRepoManager.getInstance().addRepo(this.helmRepo);
      Notifications.ok((
        <>
          {"Helm repository "}
          <b>{this.helmRepo.name}</b>
          {" has been added."}
        </>
      ));
      this.props.onAddRepo();
      this.close();
    } catch (err) {
      Notifications.error((
        <>
          {"Adding helm branch "}
          <b>{this.helmRepo.name}</b>
          {" has failed: "}
          {String(err)}
        </>
      ));
    }
  }

  renderFileInput(placeholder:string, fileType:FileType, fileExtensions:string[]){
    return (
      <div className="flex gaps align-center">
        <Input
          placeholder={placeholder}
          validators={isPath}
          className="box grow"
          value={this.getFilePath(fileType)}
          onChange={v => this.setFilepath(fileType, v)}
        />
        <Icon
          material="folder"
          onClick={() => this.selectFileDialog(fileType, { name: placeholder, extensions: fileExtensions })}
          tooltip="Browse"
        />
      </div>
    );
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
        {this.renderFileInput("Key file", FileType.KeyFile, AddHelmRepoDialog.keyExtensions)}
        {this.renderFileInput("Ca file", FileType.CaFile, AddHelmRepoDialog.certExtensions)}
        {this.renderFileInput("Certificate file", FileType.CertFile, AddHelmRepoDialog.certExtensions)}
        <SubTitle title="Chart Repository Credentials" />
        <Input
          placeholder="Username"
          value={this.helmRepo.username}
          onChange= {v => this.helmRepo.username = v}
        />
        <Input
          type="password"
          placeholder="Password"
          value={this.helmRepo.password}
          onChange={v => this.helmRepo.password = v}
        />
      </>
    );
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
          <WizardStep
            contentClass="flow column"
            nextLabel="Add"
            next={() => this.addCustomRepo()}
          >
            <div className="flex column gaps">
              <Input
                autoFocus
                required
                placeholder="Helm repo name"
                trim
                validators={systemName}
                value={this.helmRepo.name}
                onChange={v => this.helmRepo.name = v}
              />
              <Input
                required
                placeholder="URL"
                validators={isUrl}
                value={this.helmRepo.url}
                onChange={v => this.helmRepo.url = v}
              />
              <Button
                plain
                className="accordion"
                onClick={() => this.showOptions = !this.showOptions}
              >
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
