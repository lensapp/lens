/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./kube-object-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { computed, observable, reaction, makeObservable } from "mobx";
import { Drawer } from "../drawer";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { Spinner } from "../spinner";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { customResourceDefinitionStore } from "../+custom-resources/legacy-store";
import { KubeObjectMenu } from "../kube-object-menu";
import { KubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";
import { CustomResourceDetails } from "../+custom-resources";
import { KubeObjectMeta } from "../kube-object-meta";
import { hideDetails, kubeDetailsUrlParam } from "../kube-detail-params";


export interface KubeObjectDetailsProps<T extends KubeObject = KubeObject> {
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
    try {
      return apiManager
        .getStore(this.path)
        ?.getByPath(this.path);
    } catch (error) {
      console.error(`[KUBE-OBJECT-DETAILS]: failed to get store or object: ${error}`, { path: this.path });

      return undefined;
    }
  }

  componentDidMount(): void {
    disposeOnUnmount(this, [
      reaction(() => [
        this.path,
        this.object, // resource might be updated via watch-event or from already opened details
        customResourceDefinitionStore.items.length, // crd stores initialized after loading
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
              this.loadingError = (
                <>
                  Resource loading has failed:
                  <b>{String(err)}</b>
                </>
              );
            } finally {
              this.isLoading = false;
            }
          }
        }
      }),
    ]);
  }

  renderTitle(object: KubeObject | null | undefined) {
    if (!object) {
      return "";
    }

    return `${object.kind}: ${object.getName()}`;
  }

  renderContents(object: KubeObject) {
    const { isLoading, loadingError } = this;
    const details = KubeObjectDetailRegistry
      .getInstance()
      .getItemsForKind(object.kind, object.apiVersion)
      .map((item, index) => (
        <item.components.Details object={object} key={`object-details-${index}`} />
      ));

    if (details.length === 0) {
      const crd = customResourceDefinitionStore.getByObject(object);

      /**
       * This is a fallback so that if a custom resource object doesn't have
       * any defined details we should try and display at least some details
       */
      if (crd) {
        details.push(<CustomResourceDetails
          key={object.getId()}
          object={object}
          crd={crd}
        />);
      }
    }

    if (details.length === 0) {
      // if we still don't have any details to show, just show the standard object metadata
      details.push(<KubeObjectMeta key={object.getId()} object={object} />);
    }

    return (
      <>
        {isLoading && <Spinner center/>}
        {loadingError && <div className="box center">{loadingError}</div>}
        {details}
      </>
    );
  }

  render() {
    const { object, isLoading, loadingError } = this;

    return (
      <Drawer
        className="KubeObjectDetails flex column"
        open={!!(object || isLoading || loadingError)}
        title={this.renderTitle(object)}
        toolbar={object && <KubeObjectMenu object={object} toolbar={true}/>}
        onClose={hideDetails}
      >
        {object && this.renderContents(object)}
      </Drawer>
    );
  }
}
