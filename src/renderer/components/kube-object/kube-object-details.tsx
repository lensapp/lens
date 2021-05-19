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

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { computed, observable, reaction } from "mobx";
import { Drawer } from "../drawer";
import type { KubeObject } from "../../api/kube-object";
import { Spinner } from "../spinner";
import { ApiManager } from "../../api/api-manager";
import { CrdResourceDetails } from "../+custom-resources/crd-resource-details";
import type { CrdStore } from "../+custom-resources/crd.store";
import { KubeObjectMenu } from "./kube-object-menu";
import { KubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";
import { crdApi, CustomResourceDefinition } from "../../api/endpoints";
import { kubeDetailsUrlParam, hideDetails } from "./params";

export interface KubeObjectDetailsProps<T extends KubeObject = KubeObject> {
  className?: string;
  object: T;
}

@observer
export class KubeObjectDetails extends React.Component {
  private get crdStore() {
    return ApiManager.getInstance().getStore<CrdStore>(crdApi);
  }

  @observable isLoading = false;
  @observable.ref loadingError: React.ReactNode;

  @computed get path() {
    return kubeDetailsUrlParam.get();
  }

  @computed get object() {
    return ApiManager.getInstance()
      .getStore(this.path)
      ?.getByPath(this.path);
  }

  @computed get isCrdInstance() {
    return !!this.crdStore.getByObject(this.object);
  }

  @disposeOnUnmount
  loader = reaction(() => [
    this.path,
    this.object, // resource might be updated via watch-event or from already opened details
    this.crdStore.items.length, // crd stores initialized after loading
  ], async () => {
    this.loadingError = "";
    const { path, object } = this;

    if (!object) {
      const store = ApiManager.getInstance().getStore(path);

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
      details = KubeObjectDetailRegistry.getInstance().getItemsForKind(object.kind, object.apiVersion).map((item, index) => {
        return <item.components.Details object={object} key={`object-details-${index}`}/>;
      });

      if (isCrdInstance && details.length === 0) {
        details.push(<CrdResourceDetails object={object as CustomResourceDefinition}/>);
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
