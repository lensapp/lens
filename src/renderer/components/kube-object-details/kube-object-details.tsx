/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./kube-object-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import type { IComputedValue } from "mobx";
import { observable, reaction, makeObservable } from "mobx";
import { Drawer } from "../drawer";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { Spinner } from "../spinner";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { KubeObjectMenu } from "../kube-object-menu";
import { CustomResourceDetails } from "../+custom-resources";
import { KubeObjectMeta } from "../kube-object-meta";
import type { PageParam } from "../../navigation";
import type { HideDetails } from "../kube-detail-params/hide-details.injectable";
import type { CustomResourceDefinitionStore } from "../+custom-resources/definition.store";
import { withInjectables } from "@ogre-tools/injectable-react";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import customResourceDefinitionStoreInjectable from "../+custom-resources/definition.store.injectable";
import hideDetailsInjectable from "../kube-detail-params/hide-details.injectable";
import kubeDetailsUrlParamInjectable from "../kube-detail-params/kube-details-url.injectable";
import kubeObjectDetailItemsInjectable from "./kube-object-detail-items/kube-object-detail-items.injectable";
import currentKubeObjectInDetailsInjectable from "./current-kube-object-in-details.injectable";

export interface KubeObjectDetailsProps<Kube extends KubeObject = KubeObject> {
  className?: string;
  object: Kube;
}

interface Dependencies {
  detailComponents: IComputedValue<React.ElementType[]>;
  kubeObject: IComputedValue<KubeObject | undefined>;
  kubeDetailsUrlParam: PageParam<string>;
  apiManager: ApiManager;
  hideDetails: HideDetails;
  customResourceDefinitionStore: CustomResourceDefinitionStore;
}

@observer
class NonInjectedKubeObjectDetails extends React.Component<Dependencies> {
  @observable isLoading = false;
  @observable.ref loadingError: React.ReactNode;

  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
  }

  get path() {
    return this.props.kubeDetailsUrlParam.get();
  }

  get object() {
    return this.props.kubeObject.get();
  }

  componentDidMount(): void {
    disposeOnUnmount(this, [
      reaction(() => [
        this.path,
        this.object, // resource might be updated via watch-event or from already opened details
        this.props.customResourceDefinitionStore.items.length, // crd stores initialized after loading
      ], async () => {
        this.loadingError = "";
        const { path, object } = this;

        if (!object) {
          const store = this.props.apiManager.getStore(path);

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
    const details = this.props.detailComponents.get();

    if (details.length === 0) {
      const crd = this.props.customResourceDefinitionStore.getByObject(object);

      /**
       * This is a fallback so that if a custom resource object doesn't have
       * any defined details we should try and display at least some details
       */
      if (crd) {
        return (
          <CustomResourceDetails
            key={object.getId()}
            object={object}
            crd={crd}
          />
        );
      } else {
        // if we still don't have any details to show, just show the standard object metadata
        return <KubeObjectMeta key={object.getId()} object={object} />;
      }
    }

    return details.map((DetailComponent, index) => (
      <DetailComponent key={index} object={object} />
    ));
  }

  render() {
    const { object, isLoading, loadingError } = this;

    return (
      <Drawer
        className="KubeObjectDetails flex column"
        open={!!(object || isLoading || loadingError)}
        title={this.renderTitle(object)}
        toolbar={object && <KubeObjectMenu object={object} toolbar={true}/>}
        onClose={this.props.hideDetails}
      >
        {isLoading && <Spinner center/>}
        {loadingError && <div className="box center">{loadingError}</div>}
        {object && this.renderContents(object)}
      </Drawer>
    );
  }
}

export const KubeObjectDetails = withInjectables<Dependencies>(NonInjectedKubeObjectDetails, {
  getProps: (di, props) => ({
    ...props,
    apiManager: di.inject(apiManagerInjectable),
    customResourceDefinitionStore: di.inject(customResourceDefinitionStoreInjectable),
    hideDetails: di.inject(hideDetailsInjectable),
    kubeDetailsUrlParam: di.inject(kubeDetailsUrlParamInjectable),
    detailComponents: di.inject(kubeObjectDetailItemsInjectable),
    kubeObject: di.inject(currentKubeObjectInDetailsInjectable),
  }),
});
