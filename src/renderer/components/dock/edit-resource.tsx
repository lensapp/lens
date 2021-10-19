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
import { observer } from "mobx-react";
import yaml from "js-yaml";
import { editResourceStore } from "./edit-resource.store";
import { InfoPanel, InfoPanelProps } from "./info-panel";
import { Badge } from "../badge";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { TabKind } from "./dock.store";
import { dockViewsManager } from "./dock.views-manager";
import { createPatch } from "rfc6902";

interface Props extends InfoPanelProps {
}

@observer
export class EditResourceInfoPanel extends React.Component<Props> {
  get tabId() {
    return this.props.tabId;
  }

  get resource(): KubeObject | undefined {
    return editResourceStore.getResource(this.tabId);
  }

  get draft(): string {
    return editResourceStore.getData(this.tabId)?.draft;
  }

  private saveDraft(draft: string | KubeObject) {
    if (typeof draft === "object") {
      draft = draft ? yaml.dump(draft.toPlainObject()) : undefined;
    }

    editResourceStore.getData(this.tabId).draft = draft;
  }

  save = async () => {
    const store = editResourceStore.getStore(this.tabId);
    const { resource: resourcePath, draft } = editResourceStore.getData(this.tabId);
    const resource = store.getByPath(resourcePath) ?? await store.loadFromPath(resourcePath);
    const currentVersion = resource.toPlainObject();
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
            Please backup your changes and <a onClick={() => this.saveDraft(resource)}>refresh resource</a> to the editor.
          </p>
        </div>
      );
    }

    const updatedResource = await store.patch(this.resource, patches);

    this.saveDraft(updatedResource); // dump latest resource version for editing

    return (
      <p>
        {updatedResource.kind} <b>{updatedResource.getName()}</b> updated.
      </p>
    );
  };

  render() {
    const { resource } = this;

    if (!resource) return null;

    return (
      <InfoPanel
        {...this.props}
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
    );
  }
}

dockViewsManager.register(TabKind.EDIT_RESOURCE, {
  InfoPanel: EditResourceInfoPanel,
  editor: {
    getValue(tabId) {
      return editResourceStore.getData(tabId)?.draft ?? "";
    },
    setValue(tabId, value) {
      editResourceStore.getData(tabId).draft = value;
    },
  }
});
