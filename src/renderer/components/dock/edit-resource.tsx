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
import { action, autorun, makeObservable, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import jsYaml from "js-yaml";
import type { DockTab } from "./dock.store";
import { cssNames } from "../../utils";
import { editResourceStore } from "./edit-resource.store";
import { InfoPanel } from "./info-panel";
import { Badge } from "../badge";
import { MonacoEditor } from "../monaco-editor";
import { Spinner } from "../spinner";
import type { KubeObject } from "../../../common/k8s-api/kube-object";

interface Props {
  className?: string;
  tab: DockTab;
}

@observer
export class EditResource extends React.Component<Props> {
  @observable error = "";

  constructor(props: Props) {
    super(props);
    makeObservable(this);

    disposeOnUnmount(this, [
      autorun(() => editResourceStore.loadResource(this.tabId)),
    ]);
  }

  get tabId() {
    return this.props.tab.id;
  }

  get resource(): KubeObject | undefined {
    return editResourceStore.getResource(this.tabId);
  }

  get draft(): string {
    const { draft } = editResourceStore.getData(this.tabId);

    if (typeof draft === "string") {
      return draft; // get previously edited draft
    }

    if (this.resource) {
      return jsYaml.safeDump(this.resource.toPlainObject()); // dump resource first time
    }

    return "";
  }

  @action
  saveDraft(draft: string | object) {
    if (typeof draft === "object") {
      draft = draft ? jsYaml.safeDump(draft) : undefined;
    }

    editResourceStore.setData(this.tabId, {
      ...editResourceStore.getData(this.tabId),
      draft,
    });
  }

  onChange = (draft: string) => {
    this.saveDraft(draft);
  };

  onError = (error: string) => {
    this.error = error;
  };

  save = async () => {
    if (this.error) {
      return null;
    }
    const store = editResourceStore.getStore(this.tabId);
    const updatedResource: KubeObject = await store.update(this.resource, jsYaml.safeLoad(this.draft));

    this.saveDraft(updatedResource.toPlainObject()); // update with new resourceVersion to avoid further errors on save
    const resourceType = updatedResource.kind;
    const resourceName = updatedResource.getName();

    return (
      <p>
        {resourceType} <b>{resourceName}</b> updated.
      </p>
    );
  };

  render() {
    if (!editResourceStore.dataReady || !this.resource) {
      return <Spinner center/>;
    }

    const { tabId, error, draft, resource } = this;

    return (
      <div className={cssNames("EditResource flex column", this.props.className)}>
        <InfoPanel
          tabId={tabId}
          error={error}
          submit={this.save}
          submitLabel="Save"
          submittingMessage="Applying.."
          controls={(
            <div className="resource-info flex gaps align-center">
              <span>Kind:</span> <Badge label={resource.kind}/>
              <span>Name:</span><Badge label={resource.getName()}/>
              <span>Namespace:</span> <Badge label={resource.getNs() || "global"}/>
            </div>
          )}
        />
        <MonacoEditor
          id={tabId}
          value={draft}
          onChange={this.onChange}
          onError={this.onError}
        />
      </div>
    );
  }
}
