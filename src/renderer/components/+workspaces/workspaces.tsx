import "./workspaces.scss"
import React, { Fragment } from "react";
import { observer } from "mobx-react";
import { computed, observable, toJS } from "mobx";
import { t, Trans } from "@lingui/macro";
import { WizardLayout } from "../layout/wizard-layout";
import { Workspace, WorkspaceId, workspaceStore } from "../../../common/workspace-store";
import { v4 as uuid } from "uuid"
import { _i18n } from "../../i18n";
import { ConfirmDialog } from "../confirm-dialog";
import { Icon } from "../icon";
import { Input } from "../input";
import { cssNames, prevDefault } from "../../utils";
import { Button } from "../button";
import { isRequired, InputValidator } from "../input/input_validators";

@observer
export class Workspaces extends React.Component {
  @observable editingWorkspaces = observable.map<WorkspaceId, Workspace>();

  @computed get workspaces(): Workspace[] {
    const currentWorkspaces: Map<WorkspaceId, Workspace> = new Map()
    workspaceStore.enabledWorkspacesList.forEach((w) => {
      currentWorkspaces.set(w.id, w)
    })
    const allWorkspaces = new Map([
      ...currentWorkspaces,
      ...this.editingWorkspaces,
    ]);
    return Array.from(allWorkspaces.values());
  }

  renderInfo() {
    return (
      <Fragment>
        <h2><Trans>What is a Workspace?</Trans></h2>
        <p className="info">
          <Trans>Workspaces are used to organize number of clusters into logical groups.</Trans>
        </p>
        <p>
          <Trans>A single workspaces contains a list of clusters and their full configuration.</Trans>
        </p>
      </Fragment>
    )
  }

  saveWorkspace = (id: WorkspaceId) => {
    const draft = toJS(this.editingWorkspaces.get(id));
    const workspace = workspaceStore.addWorkspace(draft);
    if (workspace) {
      this.clearEditing(id);
    }
  }

  addWorkspace = () => {
    const workspaceId = uuid();
    this.editingWorkspaces.set(workspaceId, new Workspace({
      id: workspaceId,
      name: "",
      description: ""
    }))
  }

  editWorkspace = (id: WorkspaceId) => {
    const workspace = workspaceStore.getById(id);
    this.editingWorkspaces.set(id, toJS(workspace));
  }

  clearEditing = (id: WorkspaceId) => {
    this.editingWorkspaces.delete(id);
  }

  removeWorkspace = (id: WorkspaceId) => {
    const workspace = workspaceStore.getById(id);
    ConfirmDialog.open({
      okButtonProps: {
        label: _i18n._(t`Remove Workspace`),
        primary: false,
        accent: true,
      },
      ok: () => {
        this.clearEditing(id);
        workspaceStore.removeWorkspace(workspace);
      },
      message: (
        <div className="confirm flex column gaps">
          <p>
            <Trans>Are you sure you want remove workspace <b>{workspace.name}</b>?</Trans>
          </p>
          <p className="info">
            <Trans>All clusters within workspace will be cleared as well</Trans>
          </p>
        </div>
      ),
    })
  }

  onInputKeypress = (evt: React.KeyboardEvent<any>, workspaceId: WorkspaceId) => {
    if (evt.key == 'Enter') {
      // Trigget input validation
      evt.currentTarget.blur();
      evt.currentTarget.focus();
      this.saveWorkspace(workspaceId);
    }
  }

  render() {
    return (
      <WizardLayout className="Workspaces" infoPanel={this.renderInfo()}>
        <h2>
          <Trans>Workspaces</Trans>
        </h2>
        <div className="items flex column gaps">
          {this.workspaces.map(({ id: workspaceId, name, description, ownerRef }) => {
            const isActive = workspaceStore.currentWorkspaceId === workspaceId;
            const isDefault = workspaceStore.isDefault(workspaceId);
            const isEditing = this.editingWorkspaces.has(workspaceId);
            const editingWorkspace = this.editingWorkspaces.get(workspaceId);
            const managed = !!ownerRef
            const className = cssNames("workspace flex gaps", {
              active: isActive,
              editing: isEditing,
              default: isDefault,
            });
            const existenceValidator: InputValidator = {
              message: () => `Workspace '${name}' already exists`,
              validate: value => !workspaceStore.getByName(value.trim())
            }
            return (
              <div key={workspaceId} className={className}>
                {!isEditing && (
                  <Fragment>
                    <span className="name flex gaps align-center">
                      <a href="#" onClick={prevDefault(() => workspaceStore.setActive(workspaceId))}>{name}</a>
                      {isActive && <span> <Trans>(current)</Trans></span>}
                    </span>
                    <span className="description">{description}</span>
                    {!isDefault && !managed && (
                      <Fragment>
                        <Icon
                          material="edit"
                          tooltip={<Trans>Edit</Trans>}
                          onClick={() => this.editWorkspace(workspaceId)}
                        />
                        <Icon
                          material="delete"
                          tooltip={<Trans>Delete</Trans>}
                          onClick={() => this.removeWorkspace(workspaceId)}
                        />
                      </Fragment>
                    )}
                  </Fragment>
                )}
                {isEditing && (
                  <Fragment>
                    <Input
                      className="name"
                      placeholder={_i18n._(t`Name`)}
                      value={editingWorkspace.name}
                      onChange={v => editingWorkspace.name = v}
                      onKeyPress={(e) => this.onInputKeypress(e, workspaceId)}
                      validators={[isRequired, existenceValidator]}
                      autoFocus
                    />
                    <Input
                      className="description"
                      placeholder={_i18n._(t`Description`)}
                      value={editingWorkspace.description}
                      onChange={v => editingWorkspace.description = v}
                      onKeyPress={(e) => this.onInputKeypress(e, workspaceId)}
                    />
                    <Icon
                      material="save"
                      tooltip={<Trans>Save</Trans>}
                      onClick={() => this.saveWorkspace(workspaceId)}
                    />
                    <Icon
                      material="cancel"
                      tooltip={<Trans>Cancel</Trans>}
                      onClick={() => this.clearEditing(workspaceId)}
                    />
                  </Fragment>
                )}
              </div>
            )
          })}
        </div>
        <Button
          primary
          className="box left"
          label={<Trans>Add Workspace</Trans>}
          onClick={this.addWorkspace}
        />
      </WizardLayout>
    );
  }
}
