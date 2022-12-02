/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import type { RenderResult } from "@testing-library/react";
import { KubernetesCluster, WebLink } from "../../common/catalog-entities";
import getClusterByIdInjectable from "../../common/cluster-store/get-by-id.injectable";
import type { Cluster } from "../../common/cluster/cluster";
import navigateToCatalogInjectable from "../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import catalogEntityRegistryInjectable from "../../renderer/api/catalog/entity/registry.injectable";
import { type ApplicationBuilder, getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import createClusterInjectable from "../../renderer/create-cluster/create-cluster.injectable";

describe("opening catalog entity details panel", () => {
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

  it("shouldn't show the details yet", () => {
    expect(rendered.queryByTestId("catalog-entity-details-drawer")).not.toBeInTheDocument();
  });

  describe("when navigated to the catalog", () => {
    beforeEach(async () => {
      const navigateToCatalog = windowDi.inject(navigateToCatalogInjectable);

      navigateToCatalog();
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("should show the 'Browse All' view", () => {
      expect(rendered.queryByTestId("catalog-list-for-browse-all")).toBeInTheDocument();
    });

    it("shouldn't show the details yet", () => {
      expect(rendered.queryByTestId("catalog-entity-details-drawer")).not.toBeInTheDocument();
    });

    describe("when opening the menu 'some-kubernetes-cluster'", () => {
      beforeEach(() => {
        rendered.getByTestId("icon-for-menu-actions-for-catalog-for-some-entity-id").click();
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("opens the menu", () => {
        expect(rendered.queryByTestId("menu-actions-for-catalog-for-some-entity-id")).toBeInTheDocument();
      });

      it("shouldn't show the details yet", () => {
        expect(rendered.queryByTestId("catalog-entity-details-drawer")).not.toBeInTheDocument();
      });

      describe("when clicking the 'View Details' menu item", () => {
        beforeEach(() => {
          rendered.getByTestId("open-details-menu-item-for-some-entity-id").click();
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        describe("when the panel opens", () => {
          beforeEach(async () => {
            await rendered.findAllByTestId("catalog-entity-details-drawer");
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("opens the detail panel for the correct item", () => {
            expect(rendered.queryByTestId("catalog-entity-details-content-for-some-entity-id")).toBeInTheDocument();
          });

          it("shows the registered items", () => {
            expect(rendered.queryByTestId("kubernetes-distro-for-some-entity-id")).toBeInTheDocument();
          });
        });
      });
    });

    describe("when opening the menu 'some-weblink'", () => {
      beforeEach(() => {
        rendered.getByTestId("icon-for-menu-actions-for-catalog-for-some-weblink-id").click();
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("opens the menu", () => {
        expect(rendered.queryByTestId("menu-actions-for-catalog-for-some-weblink-id")).toBeInTheDocument();
      });

      it("shouldn't show the details yet", () => {
        expect(rendered.queryByTestId("catalog-entity-details-drawer")).not.toBeInTheDocument();
      });

      describe("when clicking the 'View Details' menu item", () => {
        beforeEach(() => {
          rendered.getByTestId("open-details-menu-item-for-some-weblink-id").click();
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        describe("when the panel opens", () => {
          beforeEach(async () => {
            await rendered.findAllByTestId("catalog-entity-details-drawer");
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("opens the detail panel for the correct item", () => {
            expect(rendered.queryByTestId("catalog-entity-details-content-for-some-weblink-id")).toBeInTheDocument();
          });

          it("shows the registered items", () => {
            expect(rendered.queryByTestId("weblink-url-for-some-weblink-id")).toBeInTheDocument();
          });

          it("should not show registered items for different kinds", () => {
            expect(rendered.queryByTestId("kubernetes-distro-for-some-weblink-id")).not.toBeInTheDocument();
          });
        });
      });
    });
  });
});
