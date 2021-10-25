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

import React from "react";
import yaml from "js-yaml";
import { makeObservable, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { editResourceStore } from "./edit-resource.store";
import { InfoPanel } from "./info-panel";
import { Badge } from "../badge";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { TabKind } from "./dock.store";
import { dockViewsManager } from "./dock.views-manager";
import { createPatch } from "rfc6902";
import { DockTabContent, DockTabContentProps } from "./dock-tab-content";

interface Props extends DockTabContentProps {
}

@observer
export class EditResource extends React.Component<Props> {
  @observable.ref resource?: KubeObject;

  constructor(props: Props) {
    super(props);
    makeObservable(this);

    disposeOnUnmount(this, [
      reaction(() => this.tabId, async (tabId) => {
        this.resource = null;
        this.resource = await editResourceStore.getResource(tabId);

        const { draft } = editResourceStore.getData(tabId);

        if (!draft) {
          this.saveDraft(this.resource.toPlainObject(), tabId);
        }
      }, {
        fireImmediately: true,
      }),
    ]);
  }

  get tabId() {
    return this.props.tabId;
  }

  private saveDraft(draft: string | object, tabId = this.tabId) {
    if (typeof draft === "object") {
      draft = yaml.dump(draft);
    }

    editResourceStore.getData(tabId).draft = draft;
  }

  save = async () => {
    const resource = await editResourceStore.getResource(this.tabId); // get latest resource version
    const { draft } = editResourceStore.getData(this.tabId);
    const currentVersion = resource.toPlainObject() as KubeObject;
    const editedVersion = yaml.load(draft) as KubeObject;
    const patches = createPatch(currentVersion, editedVersion);
    const editingVersion = editedVersion.metadata.resourceVersion;

    if (editingVersion != resource.getResourceVersion()) {
      throw (
        <div className="resource-outdated flex column gaps">
          <p>
            {resource.kind} version <b>{resource.getName()}</b> is updated on the server while editing.
          </p>
          <p>
            Please backup your changes and{" "}
            <a onClick={() => this.saveDraft(resource.toPlainObject())}>refresh resource</a> to the editor.
          </p>
        </div>
      );
    }

    const updatedResource = await this.resource.patch(patches);

    this.saveDraft(updatedResource); // dump latest version for editing

    return (
      <p>
        {updatedResource.kind} <b>{updatedResource.metadata.name}</b> updated.
      </p>
    );
  };

  render() {
    const { resource, tabId } = this;
    const tabData = editResourceStore.getData(tabId);

    if (!resource) return null;

    return (
      <DockTabContent
        tabId={tabId}
        withEditor
        editorValue={tabData?.draft}
        editorOnChange={v => tabData.draft = v}
      >
        <InfoPanel
          tabId={tabId}
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
      </DockTabContent>
    );
  }
}

dockViewsManager.register(TabKind.EDIT_RESOURCE, {
  Content: EditResource,
});
