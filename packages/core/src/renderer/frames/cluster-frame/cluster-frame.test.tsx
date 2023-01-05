/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import type { RenderResult } from "@testing-library/react";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import { render as testingLibraryRender } from "@testing-library/react";
import React from "react";
import { DiContextProvider } from "@ogre-tools/injectable-react";
import { Router } from "react-router";
import { DefaultProps } from "../../mui-base-theme";
import { ClusterFrame } from "./cluster-frame";
import historyInjectable from "../../navigation/history.injectable";
import { computed } from "mobx";
import type { Cluster } from "../../../common/cluster/cluster";
import createClusterInjectable from "../../cluster/create-cluster.injectable";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import legacyOnChannelListenInjectable from "../../ipc/legacy-channel-listen.injectable";
import currentRouteComponentInjectable from "../../routes/current-route-component.injectable";
import hostedClusterIdInjectable from "../../cluster-frame-context/hosted-cluster-id.injectable";
import hostedClusterInjectable from "../../cluster-frame-context/hosted-cluster.injectable";
import { useFakeTime } from "../../../common/test-utils/use-fake-time";
import currentlyInClusterFrameInjectable from "../../routes/currently-in-cluster-frame.injectable";

describe("<ClusterFrame />", () => {
  let render: () => RenderResult;
  let di: DiContainer;
  let cluster: Cluster;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });
    render = () => testingLibraryRender((
      <DiContextProvider value={{ di }}>
        <Router history={di.inject(historyInjectable)}>
          {DefaultProps(ClusterFrame)}
        </Router>
      </DiContextProvider>
    ));

    di.override(subscribeStoresInjectable, () => jest.fn().mockImplementation(() => jest.fn()));
    di.override(legacyOnChannelListenInjectable, () => jest.fn().mockImplementation(() => jest.fn()));
    di.override(directoryForUserDataInjectable, () => "/some/irrelavent/path");
    di.override(storesAndApisCanBeCreatedInjectable, () => true);
    di.override(currentlyInClusterFrameInjectable, () => true);

    useFakeTime("2000-01-01 12:00:00am");

    const createCluster = di.inject(createClusterInjectable);

    cluster = createCluster(
      {
        contextName: "my-cluster",
        id: "123456",
        kubeConfigPath: "/irrelavent",
      },
      {
        clusterServerUrl: "https://localhost",
      },
    );

    di.override(hostedClusterInjectable, () => cluster);
    di.override(hostedClusterIdInjectable, () => cluster.id);
  });

  describe("given cluster with list nodes and namespaces permissions", () => {
    beforeEach(() => {
      // TODO: replace with not using private info
      (cluster as any).allowedResources.replace(["v1/nodes", "v1/namespaces"]);
    });

    it("renders", () => {
      const result = render();

      expect(result.container).toMatchSnapshot();
    });

    it("shows cluster overview sidebar item as active", () => {
      const result = render();
      const clusterOverviewSidebarItem = result.getByTestId("sidebar-item-cluster-overview");

      expect(clusterOverviewSidebarItem.getAttribute("data-is-active-test")).toBe("true");
    });

    describe("given no matching component", () => {
      beforeEach(() => {
        di.override(currentRouteComponentInjectable, () => computed(() => undefined));
      });

      describe("given current url is starting url", () => {
        it("renders", () => {
          const result = render();

          expect(result.container).toMatchSnapshot();
        });

        it("shows warning message", () => {
          const result = render();

          expect(
            result.getByText("An error has occured. No route can be found matching the current route, which is also the starting route."),
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe("given cluster without list nodes, but with namespaces permissions", () => {
    beforeEach(() => {
      (cluster as any).allowedResources.replace(["v1/namespaces"]);
    });

    it("renders", () => {
      const result = render();

      expect(result.container).toMatchSnapshot();
    });

    it("shows workloads overview sidebar item as active", () => {
      const result = render();
      const workloadsOverviewSidebarItem = result.getByTestId("sidebar-item-workloads");

      expect(workloadsOverviewSidebarItem.getAttribute("data-is-active-test")).toBe("true");
    });
  });
});
