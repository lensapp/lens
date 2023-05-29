/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import "@testing-library/jest-dom/extend-expect";
import type { RenderResult } from "@testing-library/react";
import React from "react";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import kubeSelectedUrlParamInjectable from "../kube-detail-params/kube-selected-url.injectable";
import toggleKubeDetailsPaneInjectable from "../kube-detail-params/toggle-details.injectable";
import type { DiRender } from "../test-utils/renderFor";
import { renderFor } from "../test-utils/renderFor";
import { KubeObjectListLayout } from "./index";
import appPathsStateInjectable from "../../../common/app-paths/app-paths-state.injectable";
import podStoreInjectable from "../workloads-pods/store.injectable";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import hostedClusterInjectable from "../../cluster-frame-context/hosted-cluster.injectable";
import type { PodStore } from "../workloads-pods/store";
import { Cluster } from "../../../common/cluster/cluster";
import isTableColumnHiddenInjectable from "../../../features/user-preferences/common/is-table-column-hidden.injectable";
import { podListLayoutColumnInjectionToken } from "@k8slens/list-layout";

describe("kube-object-list-layout", () => {
  let di: DiContainer;
  let render: DiRender;
  let podStore: PodStore;

  beforeEach(() => {
    di = getDiForUnitTesting();

    di.override(directoryForUserDataInjectable, () => "/some-user-store-path");
    di.override(directoryForKubeConfigsInjectable, () => "/some-kube-configs");
    di.override(storesAndApisCanBeCreatedInjectable, () => true);
    di.override(isTableColumnHiddenInjectable, () => () => false);

    di.override(hostedClusterInjectable, () => new Cluster({
      contextName: "some-context-name",
      id: "some-cluster-id",
      kubeConfigPath: "/some-path-to-a-kubeconfig",
    }));

    render = renderFor(di);

    di.override(subscribeStoresInjectable, () => jest.fn().mockImplementation(() => jest.fn()));
    di.override(kubeSelectedUrlParamInjectable, () => ({
      get: () => "path",
    }));
    di.override(toggleKubeDetailsPaneInjectable, () => null);
    di.override(appPathsStateInjectable, () => ({
      get: () => ({}),
    }));

    podStore = di.inject(podStoreInjectable);
  });

  describe("given pod store", () => {
    let result: RenderResult;

    it("renders", () => {
      result = render((
        <div>
          <KubeObjectListLayout
            className="Pods"
            store={podStore}
            tableId = "workloads_pods"
            isConfigurable
            renderHeaderTitle="Pods"
            renderTableContents={pod => [
              <div key={pod.getName()}>{pod.getName()}</div>,
            ]}
            columns={di.injectMany(podListLayoutColumnInjectionToken)}
          />
        </div>
      ));

      expect(result.baseElement).toMatchSnapshot();
    });

    describe("given resourcename", () => {
      it("uses resourcename in search placeholder", () => {
        result = render((
          <div>
            <KubeObjectListLayout
              className="Pods"
              store={podStore}
              tableId = "workloads_pods"
              isConfigurable
              renderHeaderTitle="Pods"
              renderTableContents={pod => [
                <div key={pod.getName()}>{pod.getName()}</div>,
              ]}
              resourceName="My Custom Items"
              searchFilters={[() => null]}
            />
          </div>
        ));

        expect(result.getByPlaceholderText("Search My Custom Items...")).toBeInTheDocument();
      });
    });
  });
});


