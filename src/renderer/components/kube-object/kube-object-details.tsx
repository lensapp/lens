import "./kube-object-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { computed, observable, reaction } from "mobx";
import { createPageParam, navigation } from "../../navigation";
import { Drawer } from "../drawer";
import { KubeObject } from "../../api/kube-object";
import { Spinner } from "../spinner";
import { apiManager } from "../../api/api-manager";
import { crdStore } from "../+custom-resources/crd.store";
import { CrdResourceDetails } from "../+custom-resources";
import { KubeObjectMenu } from "./kube-object-menu";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

/**
 * Used to store `object.selfLink` to show more info about resource in the details panel.
 */
export const kubeDetailsUrlParam = createPageParam({
  name: "kube-details",
  isSystem: true,
});

/**
 * Used to highlight last active/selected table row with the resource.
 *
 * @example
 * If we go to "Nodes (page) -> Node (details) -> Pod (details)",
 * last clicked Node should be "active" while Pod details are shown).
 */
export const kubeSelectedUrlParam = createPageParam({
  name: "kube-selected",
  isSystem: true,
  get defaultValue() {
    return kubeDetailsUrlParam.get();
  }
});

export function showDetails(selfLink = "", resetSelected = true) {
  const detailsUrl = getDetailsUrl(selfLink, resetSelected);

  navigation.merge({ search: detailsUrl });
}

export function hideDetails() {
  showDetails();
}

export function getDetailsUrl(selfLink: string, resetSelected = false, mergeGlobals = true) {
  const params = new URLSearchParams(mergeGlobals ? navigation.searchParams : "");

  params.set(kubeDetailsUrlParam.urlName, selfLink);

  if (resetSelected) {
    params.delete(kubeSelectedUrlParam.urlName);
  } else {
    params.set(kubeSelectedUrlParam.urlName, kubeSelectedUrlParam.get());
  }

  return `?${params}`;
}

export interface KubeObjectDetailsProps<T = KubeObject> {
  className?: string;
  object: T;
}

@observer
export class KubeObjectDetails extends React.Component {
  @observable isLoading = false;
  @observable.ref loadingError: React.ReactNode;

  @computed get path() {
    return kubeDetailsUrlParam.get();
  }

  @computed get object() {
    const store = apiManager.getStore(this.path);

    if (store) {
      return store.getByPath(this.path);
    }
  }

  @computed get isCrdInstance() {
    return !!crdStore.getByObject(this.object);
  }

  @disposeOnUnmount
  loader = reaction(() => [
    this.path,
    this.object, // resource might be updated via watch-event or from already opened details
    crdStore.items.length, // crd stores initialized after loading
  ], async () => {
    this.loadingError = "";
    const { path, object } = this;

    if (!object) {
      const store = apiManager.getStore(path);

      if (store) {
        this.isLoading = true;

        try {
          await store.loadFromPath(path);
        } catch (err) {
          this.loadingError = <>Resource loading has failed: <b>{err.toString()}</b></>;
        } finally {
          this.isLoading = false;
        }
      }
    }
  });

  render() {
    const { object, isLoading, loadingError, isCrdInstance } = this;
    const isOpen = !!(object || isLoading || loadingError);
    let title = "";
    let details: React.ReactNode[];

    if (object) {
      const { kind, getName } = object;

      title = `${kind}: ${getName()}`;
      details = kubeObjectDetailRegistry.getItemsForKind(object.kind, object.apiVersion).map((item, index) => {
        return <item.components.Details object={object} key={`object-details-${index}`}/>;
      });

      if (isCrdInstance && details.length === 0) {
        details.push(<CrdResourceDetails object={object}/>);
      }
    }

    return (
      <Drawer
        className="KubeObjectDetails flex column"
        open={isOpen}
        title={title}
        toolbar={<KubeObjectMenu object={object} toolbar={true}/>}
        onClose={hideDetails}
      >
        {isLoading && <Spinner center/>}
        {loadingError && <div className="box center">{loadingError}</div>}
        {details}
      </Drawer>
    );
  }
}
