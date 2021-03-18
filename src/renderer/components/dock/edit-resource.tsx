import "./edit-resource.scss";

import React from "react";
import { observable, when } from "mobx";
import { observer } from "mobx-react";
import jsYaml from "js-yaml";
import { IDockTab } from "./dock.store";
import { cssNames } from "../../utils";
import { editResourceStore } from "./edit-resource.store";
import { InfoPanel } from "./info-panel";
import { Badge } from "../badge";
import { EditorPanel } from "./editor-panel";
import { Spinner } from "../spinner";

interface Props {
  className?: string;
  tab: IDockTab;
}

@observer
export class EditResource extends React.Component<Props> {
  @observable error = "";

  async componentDidMount() {
    await when(() => this.isReady);

    if (!this.tabData.draft) {
      this.saveDraft(this.resource); // make initial dump to editor
    }
  }

  get tabId() {
    return this.props.tab.id;
  }

  get isReady() {
    return editResourceStore.isReady(this.tabId);
  }

  get tabData() {
    return editResourceStore.getData(this.tabId);
  }

  get resource() {
    return editResourceStore.getResource(this.tabId);
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
    const { draft } = this.tabData;
    const store = editResourceStore.getStore(this.tabId);
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
    if (!this.isReady) {
      return <Spinner center/>;
    }

    const { tabId, error, onChange, save } = this;
    const { kind, getNs, getName } = this.resource;
    const { draft } = this.tabData;

    return (
      <div className={cssNames("EditResource flex column", this.props.className)}>
        <InfoPanel
          tabId={tabId}
          error={error}
          submit={save}
          submitLabel="Save"
          submittingMessage="Applying.."
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
