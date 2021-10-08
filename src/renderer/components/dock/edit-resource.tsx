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
import { observer } from "mobx-react";
import jsYaml from "js-yaml";
import { editResourceStore } from "./edit-resource.store";
import { InfoPanel } from "./info-panel";
import { Badge } from "../badge";
import { Spinner } from "../spinner";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import type { DockTabContentProps } from "./dock-tab-content";
import { TabKind } from "./dock.store";
import { dockViewsManager } from "./dock.views-manager";

interface Props extends DockTabContentProps {
}

@observer
export class EditResource extends React.Component<Props> {
  get tabId() {
    return this.props.tab.id;
  }

  get resource(): KubeObject | undefined {
    return editResourceStore.getResource(this.tabId);
  }

  get draft(): string {
    return editResourceStore.getData(this.tabId)?.draft;
  }

  saveDraft(draft: string | object) {
    if (typeof draft === "object") {
      draft = draft ? jsYaml.safeDump(draft) : undefined;
    }

    editResourceStore.getData(this.tabId).draft = draft;
  }

  save = async () => {
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
    const { tabId, resource } = this;

    if (!editResourceStore.dataReady || !resource) {
      return <Spinner center/>;
    }

    return (
      <div className="EditResource">
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
      </div>
    );
  }
}

dockViewsManager.register(TabKind.EDIT_RESOURCE, {
  Content: EditResource,
  editor: {
    getValue(tabId) {
      return editResourceStore.getData(tabId).draft;
    },
    setValue(tabId, value) {
      editResourceStore.getData(tabId).draft = value;
    },
  }
});
