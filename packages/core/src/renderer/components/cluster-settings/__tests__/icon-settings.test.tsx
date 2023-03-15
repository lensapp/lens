/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { RenderResult } from "@testing-library/react";
import React from "react";
import { KubernetesCluster } from "../../../../common/catalog-entities";
import { Cluster } from "../../../../common/cluster/cluster";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { renderFor } from "../../test-utils/renderFor";
import { ClusterIconSetting } from "../icon-settings";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { clusterIconSettingsMenuInjectionToken } from "../cluster-settings-menu-injection-token";
import { runInAction } from "mobx";

const cluster = new Cluster({
  contextName: "some-context",
  id: "some-id",
  kubeConfigPath: "/some/path/to/kubeconfig",
}, {
  clusterServerUrl: "https://localhost:9999",
});

const clusterEntity = new KubernetesCluster({
  metadata: {
    labels: {},
    name: "some-kubernetes-cluster",
    uid: "some-entity-id",
  },
  spec: {
    kubeconfigContext: "some-context",
    kubeconfigPath: "/some/path/to/kubeconfig",
  },
  status: {
    phase: "connecting",
  },
});

const newMenuItem = getInjectable({
  id: "cluster-icon-settings-menu-test-item",

  instantiate: () => ({
    id: "test-menu-item",
    title: "Hello World",
    onClick: (preferences) => {
      preferences.clusterName = "Hello World";
    },
  }),

  injectionToken: clusterIconSettingsMenuInjectionToken,
});

describe("Icon settings", () => {
  let rendered: RenderResult;
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting();
    
    const render = renderFor(di);

    rendered = render(
      <ClusterIconSetting cluster={cluster} entity={clusterEntity} />,
    );
  });

  describe("given no external registrations for cluster settings menu injection token", () => {
    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("has predefined menu item", async () => {
      userEvent.click(await screen.findByTestId("icon-for-menu-actions-for-cluster-icon-settings-for-some-entity-id"));

      expect(rendered.getByText("Upload Icon")).toBeInTheDocument();
    });

    it("has menu item from build-in registration", async () => {
      userEvent.click(await screen.findByTestId("icon-for-menu-actions-for-cluster-icon-settings-for-some-entity-id"));

      expect(rendered.getByText("Clear")).toBeInTheDocument();
    });
  });

  describe("given external registrations for cluster settings menu injection token", () => {
    beforeEach(() => {
      runInAction(() => {
        di.register(newMenuItem);
      });
    });

    it("has menu item from external registration", async () => {
      userEvent.click(await screen.findByTestId("icon-for-menu-actions-for-cluster-icon-settings-for-some-entity-id"));

      expect(rendered.getByText("Hello World")).toBeInTheDocument();
    });
  });
});
