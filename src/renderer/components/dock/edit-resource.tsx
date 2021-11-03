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

import "./edit-resource.scss";

import React from "react";
import { action, computed, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import yaml from "js-yaml";
import type { DockTab } from "./dock.store";
import { editResourceStore } from "./edit-resource.store";
import { InfoPanel } from "./info-panel";
import { Badge } from "../badge";
import { EditorPanel } from "./editor-panel";
import { Spinner } from "../spinner";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { createPatch } from "rfc6902";

interface Props {
  tab: DockTab;
}

@observer
export class EditResource extends React.Component<Props> {
  @observable error = "";

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  get tabId() {
    return this.props.tab.id;
  }

  get isReadyForEditing() {
    return editResourceStore.isReady(this.tabId);
  }

  get resource(): KubeObject | undefined {
    return editResourceStore.getResource(this.tabId);
  }

  @computed get draft(): string {
    if (!this.isReadyForEditing) {
      return ""; // wait until tab's data and kube-object resource are loaded
    }

    const { draft } = editResourceStore.getData(this.tabId);

    if (typeof draft === "string") {
      return draft;
    }

    return yaml.dump(this.resource.toPlainObject()); // dump resource first time
  }

  @action
  saveDraft(draft: string | object) {
    if (typeof draft === "object") {
      draft = draft ? yaml.dump(draft) : undefined;
    }

    editResourceStore.setData(this.tabId, {
      firstDraft: draft, // this must be before the next line
      ...editResourceStore.getData(this.tabId),
      draft,
    });
  }

  onChange = (draft: string) => {
    this.error = ""; // reset first
    this.saveDraft(draft);
  };

  onError = (error?: Error | string) => {
    this.error = error.toString();
  };

  save = async () => {
    if (this.error) {
      return null;
    }

    const store = editResourceStore.getStore(this.tabId);
    const currentVersion = yaml.load(this.draft);
    const firstVersion = yaml.load(editResourceStore.getData(this.tabId).firstDraft ?? this.draft);
    const patches = createPatch(firstVersion, currentVersion);
    const updatedResource = await store.patch(this.resource, patches);

    editResourceStore.clearInitialDraft(this.tabId);

    return (
      <p>
        {updatedResource.kind} <b>{updatedResource.getName()}</b> updated.
      </p>
    );
  };

  render() {
    const { tabId, error, onChange, onError, save, draft, isReadyForEditing, resource } = this;

    if (!isReadyForEditing) {
      return <Spinner center/>;
    }

    return (
      <div className="EditResource flex column">
        <InfoPanel
          tabId={tabId}
          error={error}
          submit={save}
          submitLabel="Save"
          submittingMessage="Applying.."
          controls={(
            <div className="resource-info flex gaps align-center">
              <span>Kind:</span><Badge label={resource.kind}/>
              <span>Name:</span><Badge label={resource.getName()}/>
              <span>Namespace:</span><Badge label={resource.getNs() || "global"}/>
            </div>
          )}
        />
        <EditorPanel
          tabId={tabId}
          value={draft}
          onChange={onChange}
          onError={onError}
        />
      </div>
    );
  }
}
