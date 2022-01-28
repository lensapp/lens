/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./kube-object-details.scss";

import React, { ReactNode, useEffect, useState } from "react";
import { observer } from "mobx-react";
import { reaction, IComputedValue } from "mobx";
import { Drawer } from "../drawer";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { Spinner } from "../spinner";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import type { CustomResourceDefinitionStore } from "../+custom-resource/store";
import { KubeObjectMenu } from "../kube-object-menu";
import { CustomResourceDetails } from "../+custom-resource";
import { KubeObjectMeta } from "../kube-object-meta";
import { hideDetails, kubeDetailsUrlParam } from "../kube-detail-params";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { KubeObjectDetailComponents } from "./kube-details-items/kube-detail-items";
import kubeDetailItemsInjectable from "./kube-details-items/kube-details.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import crdStoreInjectable from "../+custom-resource/store.injectable";

export interface KubeObjectDetailsProps<T extends KubeObject = KubeObject> {
  className?: string;
  object: T;
}

interface Dependencies {
  kubeDetailItems: IComputedValue<Map<string, Map<string, KubeObjectDetailComponents<KubeObject>[]>>>;
  apiManager: ApiManager;
  crdStore: CustomResourceDefinitionStore;
}

const NonInjectedKubeObjectDetails = observer(({ kubeDetailItems, apiManager, crdStore }: Dependencies) => {
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<ReactNode>("");

  const getKubeObjectByPath = (path: string): KubeObject | undefined => {
    try {
      return apiManager
        .getStore(path)
        ?.getByPath(path);
    } catch (error) {
      return void console.error(`[KUBE-OBJECT-DETAILS]: failed to get store or object: ${error}`, { path });
    }
  };

  useEffect(() => reaction(
    () => [
      kubeDetailsUrlParam.get(),
      getKubeObjectByPath(kubeDetailsUrlParam.get()), // resource might be updated via watch-event or from already opened details
      crdStore.items.length, // crd stores initialized after loading
    ] as const, async ([path, kubeObject]) => {
      setLoadingError("");

      if (!kubeObject) {
        const store = apiManager.getStore(path);

        if (store) {
          setLoading(true);

          try {
            await store.loadFromPath(path);
          } catch (err) {
            setLoadingError(<>Resource loading has failed: <b>{err.toString()}</b></>);
          } finally {
            setLoading(false);
          }
        }
      }
    },
  ), []);

  const detailsPath = kubeDetailsUrlParam.get();
  const kubeObject = getKubeObjectByPath(detailsPath);

  const isOpen = !!(kubeObject || loading || loadingError);

  if (!kubeObject) {
    return (
      <Drawer
        className="KubeObjectDetails flex column"
        open={isOpen}
        title=""
        toolbar={<KubeObjectMenu object={kubeObject} toolbar={true} />}
        onClose={hideDetails}
      >
        {loading && <Spinner center />}
        {loadingError && <div className="box center">{loadingError}</div>}
      </Drawer>
    );
  }

  const { kind, getName } = kubeObject;
  const title = `${kind}: ${getName()}`;
  const details: React.ReactElement<any, any>[] = kubeDetailItems.get()
    .get(kubeObject.kind)
    .get(kubeObject.apiVersion)
    .map(({ Details }, index) => (
      <Details object={kubeObject} key={`object-details-${index}`} />
    ));

  if (details.length === 0) {
    const crd = crdStore.getByObject(kubeObject);

    /**
     * This is a fallback so that if a custom resource object doesn't have
     * any defined details we should try and display at least some details
     */
    if (crd) {
      details.push(<CustomResourceDetails key={kubeObject.getId()} object={kubeObject} crd={crd} />);
    }
  }

  if (details.length === 0) {
    // if we still don't have any details to show, just show the standard object metadata
    details.push(<KubeObjectMeta key={kubeObject.getId()} object={kubeObject} />);
  }

  return (
    <Drawer
      className="KubeObjectDetails flex column"
      open={isOpen}
      title={title}
      toolbar={<KubeObjectMenu object={kubeObject} toolbar={true} />}
      onClose={hideDetails}
    >
      {loading && <Spinner center />}
      {loadingError && <div className="box center">{loadingError}</div>}
      <>{details}</>
    </Drawer>
  );
});

export const KubeObjectDetails = withInjectables<Dependencies>(NonInjectedKubeObjectDetails, {
  getProps: (di, props) => ({
    kubeDetailItems: di.inject(kubeDetailItemsInjectable),
    apiManager: di.inject(apiManagerInjectable),
    crdStore: di.inject(crdStoreInjectable),
    ...props,
  }),
});
