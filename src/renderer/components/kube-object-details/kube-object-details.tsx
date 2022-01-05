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

import "./kube-object-details.scss";

import React, { ReactNode, useEffect, useState } from "react";
import { observer } from "mobx-react";
import { reaction, IComputedValue } from "mobx";
import { Drawer } from "../drawer";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { Spinner } from "../spinner";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { crdStore } from "../+custom-resources/crd.store";
import { KubeObjectMenu } from "../kube-object-menu";
import { CrdResourceDetails } from "../+custom-resources";
import { KubeObjectMeta } from "../kube-object-meta";
import { hideDetails, kubeDetailsUrlParam } from "../kube-detail-params";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { KubeObjectDetailComponents } from "./kube-details-items/kube-detail-items";
import kubeDetailItemsInjectable from "./kube-details-items/kube-details.injectable";


export interface KubeObjectDetailsProps<T extends KubeObject = KubeObject> {
  className?: string;
  object: T;
}

interface Dependencies {
  kubeDetailItems: IComputedValue<Map<string, Map<string, KubeObjectDetailComponents<KubeObject>[]>>>;
}

function getKubeObjectByPath(path: string): KubeObject | undefined {
  try {
    return apiManager
      .getStore(path)
      ?.getByPath(path);
  } catch (error) {
    console.error(`[KUBE-OBJECT-DETAILS]: failed to get store or object: ${error}`, { path });

    return undefined;
  }
}

const NonInjectedKubeObjectDetails = observer(({ kubeDetailItems }: Dependencies) => {
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<ReactNode>("");

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
  const details = kubeDetailItems.get()
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
      details.push(<CrdResourceDetails key={kubeObject.getId()} object={kubeObject} crd={crd} />);
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
      toolbar={<KubeObjectMenu object={kubeObject} toolbar={true}/>}
      onClose={hideDetails}
    >
      {loading && <Spinner center/>}
      {loadingError && <div className="box center">{loadingError}</div>}
      {details}
    </Drawer>
  );
});

export const KubeObjectDetails = withInjectables<Dependencies>(NonInjectedKubeObjectDetails, {
  getProps: (di, props) => ({
    kubeDetailItems: di.inject(kubeDetailItemsInjectable),
    ...props,
  }),
});
