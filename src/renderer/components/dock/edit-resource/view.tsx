/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { autorun, makeObservable, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import yaml from "js-yaml";
import type { DockTab, TabId } from "../dock/store";
import type { EditingResource, EditResourceTabStore } from "./store";
import { InfoPanel } from "../info-panel";
import { Badge } from "../../badge";
import { EditorPanel } from "../editor-panel";
import { Spinner } from "../../spinner";
import type { KubeObject } from "../../../../common/k8s-api/kube-object";
import { createPatch } from "rfc6902";
import { withInjectables } from "@ogre-tools/injectable-react";
import editResourceTabStoreInjectable from "./store.injectable";
import { noop, onceDefined } from "../../../utils";
import closeDockTabInjectable from "../dock/close-dock-tab.injectable";
import type { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";

export interface EditResourceProps {
  tab: DockTab;
}

interface Dependencies {
  editResourceStore: EditResourceTabStore;
  closeTab: (tabId: TabId) => void;
}

interface SaveDraftArgs {
  tabData: EditingResource;
  resource: KubeObject;
  store: KubeObjectStore;
}

@observer
class NonInjectedEditResource extends React.Component<EditResourceProps & Dependencies> {
  @observable error = "";
  @observable draft = "";

  constructor(props: EditResourceProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount(): void {
    disposeOnUnmount(this, [
      onceDefined(
        () => {
          const tabData = this.tabData;
          const resource = this.resource;

          if (tabData && resource) {
            return { tabData, resource };
          }

          return undefined;
        },
        ({ tabData, resource }) => {
          if (typeof tabData.draft === "string") {
            this.draft = tabData.draft;
          } else {
            this.draft = tabData.firstDraft = yaml.dump(resource.toPlainObject());
          }
        },
      ),
      autorun(() => {
        const store = this.store;
        const tabData = this.tabData;
        const resource = this.resource;

        if (!resource && store && tabData) {
          if (store.isLoaded) {
            // auto-close tab when resource removed from store
            this.props.closeTab(this.props.tab.id);
          } else if (!store.isLoading) {
            // preload resource for editing
            store.loadFromPath(tabData.resource).catch(noop);
          }
        }
      }),
    ]);
  }

  get tabId() {
    return this.props.tab.id;
  }

  get store() {
    return this.props.editResourceStore.getStore(this.props.tab.id);
  }

  get resource() {
    return this.props.editResourceStore.getResource(this.tabId);
  }

  get tabData() {
    return this.props.editResourceStore.getData(this.tabId);
  }

  async save({ resource, store, tabData }: SaveDraftArgs) {
    if (this.error) {
      return null;
    }

    const currentVersion = yaml.load(this.draft);
    const firstVersion = yaml.load(tabData.firstDraft ?? this.draft);
    const patches = createPatch(firstVersion, currentVersion);
    const updatedResource = await store.patch(resource, patches);

    this.props.editResourceStore.clearInitialDraft(this.tabId);

    return (
      <p>
        {updatedResource.kind}
        {" "}
        <b>{updatedResource.getName()}</b>
        {" updated."}
      </p>
    );
  }

  render() {
    const { tabId, error, draft, tabData, resource, store } = this;

    if (!tabData || !resource || !store) {
      return <Spinner center />;
    }

    return (
      <div className="EditResource flex column">
        <InfoPanel
          tabId={tabId}
          error={error}
          submit={() => this.save({ resource, store, tabData })}
          submitLabel="Save"
          submittingMessage="Applying.."
          controls={(
            <div className="resource-info flex gaps align-center">
              <span>Kind:</span>
              <Badge label={resource.kind} />
              <span>Name:</span>
              <Badge label={resource.getName()} />
              <span>Namespace:</span>
              <Badge label={resource.getNs() || "global"} />
            </div>
          )}
        />
        <EditorPanel
          tabId={tabId}
          value={draft}
          onChange={draft => {
            this.error = "";
            tabData.draft = draft;
          }}
          onError={error => this.error = String(error)}
        />
      </div>
    );
  }
}

export const EditResource = withInjectables<Dependencies, EditResourceProps>(NonInjectedEditResource, {
  getProps: (di, props) => ({
    editResourceStore: di.inject(editResourceTabStoreInjectable),
    closeTab: di.inject(closeDockTabInjectable),
    ...props,
  }),
});
