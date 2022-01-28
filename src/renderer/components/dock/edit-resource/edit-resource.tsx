/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./edit-resource.scss";

import React, { useState } from "react";
import { observer } from "mobx-react";
import yaml from "js-yaml";
import type { DockTabData } from "../dock/store";
import { InfoPanel } from "../info-panel/info-panel";
import { Badge } from "../../badge";
import { EditorPanel } from "../editor/editor/editor-panel";
import { Spinner } from "../../spinner";
import { createPatch } from "rfc6902";
import type { EditResourceStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import editResourceStoreInjectable from "./store.injectable";

export interface EditResourceProps {
  tab: DockTabData;
}

interface Dependencies {
  editResourceStore: EditResourceStore;
}

const NonInjectedEditResource = observer(({ tab, editResourceStore }: Dependencies & EditResourceProps) => {
  const [error, setError] = useState("");

  if (!editResourceStore.isReady(tab.id)) {
    return <Spinner center />;
  }

  const resource = editResourceStore.getResource(tab.id);
  const draft = (() => {
    const editData = editResourceStore.getData(tab.id);

    if (typeof editData.draft === "string") {
      return editData.draft;
    }

    // dump resource first time and save
    return editData.firstDraft = yaml.dump(resource.toPlainObject());
  })();

  const save = async () => {
    if (error) {
      return null;
    }

    const store = editResourceStore.getStore(tab.id);
    const currentVersion = yaml.load(draft);
    const firstVersion = yaml.load(editResourceStore.getData(tab.id).firstDraft ?? draft);
    const patches = createPatch(firstVersion, currentVersion);
    const updatedResource = await store.patch(resource, patches);

    editResourceStore.clearInitialDraft(tab.id);

    return (
      <p>
        {updatedResource.kind} <b>{updatedResource.getName()}</b> updated.
      </p>
    );
  };

  return (
    <div className="EditResource flex column">
      <InfoPanel
        tabId={tab.id}
        error={error}
        submit={save}
        submitLabel="Save"
        submittingMessage="Applying.."
        controls={(
          <div className="resource-info flex gaps align-center">
            <span>Kind:</span><Badge label={resource.kind} />
            <span>Name:</span><Badge label={resource.getName()} />
            <span>Namespace:</span><Badge label={resource.getNs() || "global"} />
          </div>
        )}
      />
      <EditorPanel
        tabId={tab.id}
        value={draft}
        onChange={draft => {
          setError("");
          editResourceStore.getData(tab.id).draft = draft;
        }}
        onError={error => setError(error.toString())}
      />
    </div>
  );
});

export const EditResource = withInjectables<Dependencies, EditResourceProps>(NonInjectedEditResource, {
  getProps: (di, props) => ({
    editResourceStore: di.inject(editResourceStoreInjectable),
    ...props,
  }),
});
