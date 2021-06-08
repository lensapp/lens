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
import { computed, observable, reaction, makeObservable } from "mobx";
import { Drawer } from "../drawer";
import type { KubeObject } from "../../api/kube-object";
import { Spinner } from "../spinner";
import { apiManager } from "../../api/api-manager";
import { crdStore } from "../+custom-resources/crd.store";
import { CrdResourceDetails } from "../+custom-resources";
import { KubeObjectMenu } from "../kube-object-menu/kube-object-menu";
import type { CustomResourceDefinition } from "../../api/endpoints";
import { KubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";
import { kubeDetailsUrlParam, hideDetails } from "../kube-details";

export interface KubeObjectDetailsProps<T = KubeObject> {
  className?: string;
  object: T;
}

@observer
export class KubeObjectDetails extends React.Component {
  @observable isLoading = false;
  @observable.ref loadingError: React.ReactNode;

  constructor(props: {}) {
    super(props);
    makeObservable(this);
  }

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

    if (!object) {
      return (
        <Drawer
          className="KubeObjectDetails flex column"
          open={isOpen}
          title=""
          toolbar={<KubeObjectMenu object={object} toolbar={true} />}
          onClose={hideDetails}
        >
          {isLoading && <Spinner center />}
          {loadingError && <div className="box center">{loadingError}</div>}
        </Drawer>
      );
    }

    const { kind, getName } = object;
    const title = `${kind}: ${getName()}`;
    const details = KubeObjectDetailRegistry
      .getInstance()
      .getItemsForKind(object.kind, object.apiVersion)
      .map((item, index) => (
        <item.components.Details object={object} key={`object-details-${index}`} />
      ));

    if (isCrdInstance && details.length === 0) {
      details.push(<CrdResourceDetails object={object as CustomResourceDefinition}/>);
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
