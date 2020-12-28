import "./edit-resource.scss";

import React from "react";
import { autorun, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import jsYaml from "js-yaml";
import { IDockTab } from "./dock.store";
import { cssNames } from "../../utils";
import { editResourceStore } from "./edit-resource.store";
import { InfoPanel } from "./info-panel";
import { Badge } from "../badge";
import { EditorPanel } from "./editor-panel";
import { Spinner } from "../spinner";
import { apiManager } from "../../api/api-manager";
import { KubeObject } from "../../api/kube-object";

interface Props {
  className?: string;
  tab: IDockTab;
}

@observer
export class EditResource extends React.Component<Props> {
  @observable error = "";

  @disposeOnUnmount
  autoDumpResourceOnInit = autorun(() => {
    if (!this.tabData) return;

    if (this.tabData.draft === undefined && this.resource) {
      this.saveDraft(this.resource);
    }
  });

  get tabId() {
    return this.props.tab.id;
  }

  get tabData() {
    return editResourceStore.getData(this.tabId);
  }

  get resource(): KubeObject {
    const { resource } = this.tabData;
    const store = apiManager.getStore(resource);

    if (store) {
      return store.getByPath(resource);
    }
  }

  saveDraft(draft: string | object) {
    if (typeof draft === "object") {
      draft = draft ? jsYaml.dump(draft) : undefined;
    }
    editResourceStore.setData(this.tabId, {
      ...this.tabData,
      draft,
    });
  }

  onChange = (draft: string, error?: string) => {
    this.error = error;
    this.saveDraft(draft);
  };

  save = async () => {
    if (this.error) {
      return;
    }
    const { resource, draft } = this.tabData;
    const store = apiManager.getStore(resource);
    const updatedResource = await store.update(this.resource, jsYaml.safeLoad(draft));

    this.saveDraft(updatedResource); // update with new resourceVersion to avoid further errors on save
    const resourceType = updatedResource.kind;
    const resourceName = updatedResource.getName();

    return (
      <p>
        {resourceType} <b>{resourceName}</b> updated.
      </p>
    );
  };

  render() {
    const { tabId, resource, tabData, error, onChange, save } = this;
    const { draft } = tabData;

    if (!resource || draft === undefined) {
      return <Spinner center/>;
    }
    const { kind, getNs, getName } = resource;

    return (
      <div className={cssNames("EditResource flex column", this.props.className)}>
        <InfoPanel
          tabId={tabId}
          error={error}
          submit={save}
          submitLabel={`Save`}
          submittingMessage={`Applying..`}
          controls={(
            <div className="resource-info flex gaps align-center">
              <span>Kind:</span> <Badge label={kind}/>
              <span>Name:</span><Badge label={getName()}/>
              <span>Namespace:</span> <Badge label={getNs() || "global"}/>
            </div>
          )}
        />
        <EditorPanel
          tabId={tabId}
          value={draft}
          onChange={onChange}
        />
      </div>
    );
  }
}
