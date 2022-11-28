/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import type { RenderResult } from "@testing-library/react";
import { KubernetesCluster, WebLink } from "../../common/catalog-entities";
import getClusterByIdInjectable from "../../common/cluster-store/get-by-id.injectable";
import type { Cluster } from "../../common/cluster/cluster";
import navigateToEntitySettingsInjectable from "../../common/front-end-routing/routes/entity-settings/navigate-to-entity-settings.injectable";
import catalogEntityRegistryInjectable from "../../renderer/api/catalog/entity/registry.injectable";
import { type ApplicationBuilder, getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import createClusterInjectable from "../../renderer/create-cluster/create-cluster.injectable";

describe("Showing correct entity settings", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;
  let windowDi: DiContainer;
  let clusterEntity: KubernetesCluster;
  let localClusterEntity: KubernetesCluster;
  let otherEntity: WebLink;
  let cluster: Cluster;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    builder.afterWindowStart((windowDi) => {
      const createCluster = windowDi.inject(createClusterInjectable);

      clusterEntity = new KubernetesCluster({
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
      localClusterEntity = new KubernetesCluster({
        metadata: {
          labels: {},
          name: "some-local-kubernetes-cluster",
          uid: "some-entity-id-2",
          source: "local",
        },
        spec: {
          kubeconfigContext: "some-context",
          kubeconfigPath: "/some/path/to/local/kubeconfig",
        },
        status: {
          phase: "connecting",
        },
      });
      otherEntity = new WebLink({
        metadata: {
          labels: {},
          name: "some-weblink",
          uid: "some-weblink-id",
        },
        spec: {
          url: "https://my-websome.com",
        },
        status: {
          phase: "available",
        },
      });
      cluster = createCluster({
        contextName: clusterEntity.spec.kubeconfigContext,
        id: clusterEntity.getId(),
        kubeConfigPath: clusterEntity.spec.kubeconfigPath,
      }, {
        clusterServerUrl: "https://localhost:9999",
      });

      // TODO: remove once ClusterStore can be used without overriding it
      windowDi.override(getClusterByIdInjectable, () => (clusterId) => {
        if (clusterId === cluster.id) {
          return cluster;
        }

        return undefined;
      });

      // TODO: replace with proper entity source once syncing entities between main and windows is injectable
      const catalogEntityRegistry = windowDi.inject(catalogEntityRegistryInjectable);

      catalogEntityRegistry.updateItems([clusterEntity, otherEntity, localClusterEntity]);
    });

    rendered = await builder.render();
    windowDi = builder.applicationWindow.only.di;
  });

  it("renders", () => {
    expect(rendered.baseElement).toMatchSnapshot();
  });

  it("does not show entity settings page yet", () => {
    expect(rendered.queryByTestId("entity-settings")).not.toBeInTheDocument();
  });

  describe("when navigating to non-local cluster entity settings", () => {
    beforeEach(() => {
      const navigateToEntitySettings = windowDi.inject(navigateToEntitySettingsInjectable);

      navigateToEntitySettings(clusterEntity.getId());
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("shows entity settings page", () => {
      expect(rendered.queryByTestId("entity-settings")).toBeInTheDocument();
    });

    it("does not show the General setting tab header for non-local cluster", () => {
      expect(rendered.queryByTestId("general-tab")).not.toBeInTheDocument();
    });

    it("shows Proxy setting tab header", () => {
      expect(rendered.queryByTestId("proxy-tab")).toBeInTheDocument();
    });

    it("shows Terminal setting tab header", () => {
      expect(rendered.queryByTestId("terminal-tab")).toBeInTheDocument();
    });

    it("shows Namespaces setting tab header", () => {
      expect(rendered.queryByTestId("namespace-tab")).toBeInTheDocument();
    });

    it("shows Metrics setting tab header", () => {
      expect(rendered.queryByTestId("metrics-tab")).toBeInTheDocument();
    });

    it("shows Node Shell setting tab header", () => {
      expect(rendered.queryByTestId("node-shell-tab")).toBeInTheDocument();
    });

    it("shows the setting tabs in the correct order", () => {
      expect(rendered.getByTestId("proxy-tab").nextSibling).toHaveAttribute("data-testid", "terminal-tab");
      expect(rendered.getByTestId("terminal-tab").nextSibling).toHaveAttribute("data-testid", "namespace-tab");
      expect(rendered.getByTestId("namespace-tab").nextSibling).toHaveAttribute("data-testid", "metrics-tab");
      expect(rendered.getByTestId("metrics-tab").nextSibling).toHaveAttribute("data-testid", "node-shell-tab");
    });
  });

  describe("when navigating to local cluster entity settings", () => {
    beforeEach(() => {
      const navigateToEntitySettings = windowDi.inject(navigateToEntitySettingsInjectable);

      navigateToEntitySettings(localClusterEntity.getId());
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("shows entity settings page", () => {
      expect(rendered.queryByTestId("entity-settings")).toBeInTheDocument();
    });

    it("shows the General setting tab header", () => {
      expect(rendered.queryByTestId("general-tab")).toBeInTheDocument();
    });

    it("shows Proxy setting tab header", () => {
      expect(rendered.queryByTestId("proxy-tab")).toBeInTheDocument();
    });

    it("shows Terminal setting tab header", () => {
      expect(rendered.queryByTestId("terminal-tab")).toBeInTheDocument();
    });

    it("shows Namespaces setting tab header", () => {
      expect(rendered.queryByTestId("namespace-tab")).toBeInTheDocument();
    });

    it("shows Metrics setting tab header", () => {
      expect(rendered.queryByTestId("metrics-tab")).toBeInTheDocument();
    });

    it("shows Node Shell setting tab header", () => {
      expect(rendered.queryByTestId("node-shell-tab")).toBeInTheDocument();
    });

    it("shows the setting tabs in the correct order", () => {
      expect(rendered.getByTestId("general-tab").nextSibling).toHaveAttribute("data-testid", "proxy-tab");
      expect(rendered.getByTestId("proxy-tab").nextSibling).toHaveAttribute("data-testid", "terminal-tab");
      expect(rendered.getByTestId("terminal-tab").nextSibling).toHaveAttribute("data-testid", "namespace-tab");
      expect(rendered.getByTestId("namespace-tab").nextSibling).toHaveAttribute("data-testid", "metrics-tab");
      expect(rendered.getByTestId("metrics-tab").nextSibling).toHaveAttribute("data-testid", "node-shell-tab");
    });
  });

  describe("when navigating to weblink entity settings", () => {
    beforeEach(() => {
      const navigateToEntitySettings = windowDi.inject(navigateToEntitySettingsInjectable);

      navigateToEntitySettings(otherEntity.getId());
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("shows entity settings page", () => {
      expect(rendered.queryByTestId("entity-settings")).toBeInTheDocument();
    });

    it("does not show the unrelated settings", () => {
      expect(rendered.queryByTestId("general-tab")).not.toBeInTheDocument();
    });

    it("shows no settings page info", () => {
      expect(rendered.baseElement.querySelector("[data-preference-page-does-not-exist-test='true']")).toBeInTheDocument();
    });
  });
});
