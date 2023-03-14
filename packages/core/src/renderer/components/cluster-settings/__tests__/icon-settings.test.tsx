/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import React from "react";
import { KubernetesCluster } from "../../../../common/catalog-entities";
import { Cluster } from "../../../../common/cluster/cluster";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { renderFor } from "../../test-utils/renderFor";
import { ClusterIconSetting } from "../icon-settings";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ClusterIconSettingComponentProps } from "@k8slens/cluster-settings";
import { clusterIconSettingsComponentInjectionToken, clusterIconSettingsMenuInjectionToken } from "@k8slens/cluster-settings";
import { runInAction } from "mobx";
import { getInjectable, type DiContainer } from "@ogre-tools/injectable";

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

function CustomSettingsComponent(props: ClusterIconSettingComponentProps) {
  return (
    <div data-testid="my-react-component">
      <span>Test React Component</span>
      <span>
        Cluster
        {props.preferences.clusterName}
      </span>
    </div>
  );
}

const newSettingsReactComponent = getInjectable({
  id: "cluster-icon-settings-react-component",

  instantiate: () => ({
    id: "test-react-component",
    Component: CustomSettingsComponent,
  }),

  injectionToken: clusterIconSettingsComponentInjectionToken,
});

describe("Icon settings", () => {
  let rendered: RenderResult;
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting();

    const render = renderFor(di);
    const cluster = new Cluster({
      contextName: "some-context",
      id: "some-id",
      kubeConfigPath: "/some/path/to/kubeconfig",
      preferences: {
        clusterName: "some-cluster-name",
      },
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

  describe("given no registrations for cluster settings component injection token", () => {
    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("does not have any external components", async () => {
      expect(rendered.queryByTestId("test-react-component")).not.toBeInTheDocument();
    });
  });

  describe("given registration for cluster settings component injection token", () => {
    beforeEach(() => {
      runInAction(() => {
        di.register(newSettingsReactComponent);
      });
    });

    it("renders external component", async () => {
      expect(rendered.queryByTestId("my-react-component")).toBeInTheDocument();
    });

    it("external component has cluster preferences in props", async () => {
      expect(rendered.getByText(/some-cluster-name/)).toBeInTheDocument();
    });
  });
});
