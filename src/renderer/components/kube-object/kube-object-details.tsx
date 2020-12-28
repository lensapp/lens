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

export const kubeDetailsUrlParam = createPageParam({
  name: "kube-details",
  isSystem: true,
});

export const kubeSelectedUrlParam = createPageParam({
  name: "kube-selected",
  isSystem: true,
  get defaultValue() {
    return kubeDetailsUrlParam.get();
  }
});

export function showDetails(details = "", resetSelected = true) {
  const detailsUrl = getDetailsUrl(details, resetSelected);

  navigation.merge({ search: detailsUrl });
}

export function hideDetails() {
  showDetails();
}

export function getDetailsUrl(details: string, resetSelected = false) {
  const detailsUrl = kubeDetailsUrlParam.toSearchString({ value: details });

  if (resetSelected) {
    const params = new URLSearchParams(detailsUrl);

    params.delete(kubeSelectedUrlParam.name);

    return `?${params.toString()}`;
  }

  return detailsUrl;
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
