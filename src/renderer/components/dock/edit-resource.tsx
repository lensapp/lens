import "./edit-resource.scss";

import React from "react";
import { autorun, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import jsYaml from "js-yaml"
import { t, Trans } from "@lingui/macro";
import { IDockTab } from "./dock.store";
import { cssNames } from "../../utils";
import { editResourceStore } from "./edit-resource.store";
import { InfoPanel } from "./info-panel";
import { Badge } from "../badge";
import { EditorPanel } from "./editor-panel";
import { Spinner } from "../spinner";
import { _i18n } from "../../i18n";
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
      draft: draft,
    });
  }

  onChange = (draft: string, error?: string) => {
    this.error = error;
    this.saveDraft(draft);
  }

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
        <Trans>{resourceType} <b>{resourceName}</b> updated.</Trans>
      </p>
    );
  }

  render() {
    const { tabId, resource, tabData, error, onChange, save } = this;
    const { draft } = tabData;
    if (!resource || draft === undefined) {
      return <Spinner center/>;
    }
    const { kind, getNs, getName } = resource;
    return (
      <div className={cssNames("EditResource flex column", this.props.className)}>
        <EditorPanel
          tabId={tabId}
          value={draft}
          onChange={onChange}
        />
        <InfoPanel
          tabId={tabId}
          error={error}
          submit={save}
          submitLabel={_i18n._(t`Save`)}
          submittingMessage={_i18n._(t`Applying..`)}
          controls={(
            <div className="resource-info flex gaps align-center">
              <span><Trans>Kind</Trans>:</span> <Badge label={kind}/>
              <span><Trans>Name</Trans>:</span><Badge label={getName()}/>
              <span><Trans>Namespace</Trans>:</span> <Badge label={getNs() || "global"}/>
            </div>
          )}
        />
      </div>
    )
  }
}
