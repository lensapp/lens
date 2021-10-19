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
import jsYaml from "js-yaml";
import { editResourceStore } from "./edit-resource.store";
import { InfoPanel, InfoPanelProps } from "./info-panel";
import { Badge } from "../badge";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { TabKind } from "./dock.store";
import { dockViewsManager } from "./dock.views-manager";

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

  onChange = (draft: string, error?: string) => {
    this.error = error;
    this.saveDraft(draft);
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
