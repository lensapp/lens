import "./create-resource.scss";

import React from "react";
import fs from "fs-extra";
import {Select, GroupSelectOption, SelectOption} from "../select";
import jsYaml from "js-yaml";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { cssNames } from "../../utils";
import { createResourceStore, BadgedGroupSelectOption } from "./create-resource.store";
import { IDockTab } from "./dock.store";
import { EditorPanel } from "./editor-panel";
import { InfoPanel } from "./info-panel";
import { resourceApplierApi } from "../../api/endpoints/resource-applier.api";
import { JsonApiErrorParsed } from "../../api/json-api";
import { Notifications } from "../notifications";
import { Badge } from "../badge";

interface Props {
  className?: string;
  tab: IDockTab;
}

@observer
export class CreateResource extends React.Component<Props> {
  @observable error = "";
  @observable templates:GroupSelectOption<SelectOption>[] = [];

  async componentDidMount(){
    createResourceStore.watchUserTemplates(()=> {
      this.templates = [];
      createResourceStore.getMergedTemplates().then(
        badgedTemplates => {
          badgedTemplates.map((group) => {
            this.templates.push(this.convertBadgedGroup(group));
          })
        })
    })
  }


  convertBadgedGroup(badgedGroup: BadgedGroupSelectOption):GroupSelectOption {
    const options = badgedGroup.options.map(({label, badge, value }) => ({
      label: this.renderSelectOption(label.toString(), badge),
      value,
    }));
    return ({
      label: this.renderSelectGroup(badgedGroup.label.toString(), badgedGroup.badge),
      options
    });
  }

  get tabId() {
    return this.props.tab.id;
  }

  get data() {
    return createResourceStore.getData(this.tabId);
  }

  onChange = (value: string, error?: string) => {
    createResourceStore.setData(this.tabId, value);
    this.error = error;
  };

  onSelectTemplate = (item: SelectOption) => {
    fs.readFile(item.value,"utf8").then(v => createResourceStore.setData(this.tabId,v));
  };

  create = async () => {
    if (this.error) return;
    if (!this.data.trim()) return; // do not save when field is empty
    const resources = jsYaml.safeLoadAll(this.data)
      .filter(v => !!v); // skip empty documents if "---" pasted at the beginning or end
    const createdResources: string[] = [];
    const errors: string[] = [];

    await Promise.all(
      resources.map(data => {
        return resourceApplierApi.update(data)
          .then(item => createdResources.push(item.getName()))
          .catch((err: JsonApiErrorParsed) => errors.push(err.toString()));
      })
    );

    if (errors.length) {
      errors.forEach(error => Notifications.error(error));
      if (!createdResources.length) throw errors[0];
    }
    const successMessage = (
      <p>
        {createdResources.length === 1 ? "Resource" : "Resources"}{" "}
        <b>{createdResources.join(", ")}</b> successfully created
      </p>
    );

    Notifications.ok(successMessage);

    return successMessage;
  };

  renderSelectOption(label: string, badge?: string){
    return this.renderSelectItem(label,"select-template-option", badge );
  }

  renderSelectGroup(label: string, badge?: string){
    return this.renderSelectItem(label,"select-template-group", badge );
  }

  renderSelectItem(label: string, className: string, badge?: string) {
    return(
      <div className={cssNames("flex select-template-item", className)}>
        <span>{label}</span>
        {badge && <Badge className="select-template-badge" label={badge} />}
      </div>
    );
  }

  renderControls(){
    return (
      <div className="flex gaps align-center">
        <Select
          autoConvertOptions = {false}
          className="TemplateSelect"
          placeholder="Select Template ..."
          options={this.templates}
          menuPlacement="top"
          themeName="outlined"
          onChange={v => this.onSelectTemplate(v)}
        />
      </div>
    );
  }


  render() {
    const { tabId, data, error, create, onChange } = this;
    const { className } = this.props;

    return (
      <div className={cssNames("CreateResource flex column", className)}>
        <InfoPanel
          tabId={tabId}
          error={error}
          controls={this.renderControls()}
          submit={create}
          submitLabel="Create"
          showNotifications={false}
        />
        <EditorPanel
          tabId={tabId}
          value={data}
          onChange={onChange}
        />
      </div>
    );
  }
}
