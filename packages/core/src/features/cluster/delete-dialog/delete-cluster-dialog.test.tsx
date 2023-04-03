/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "@testing-library/jest-dom/extend-expect";
import { KubeConfig } from "@kubernetes/client-node";
import type { RenderResult } from "@testing-library/react";
import normalizedPlatformInjectable from "../../../common/vars/normalized-platform.injectable";
import kubectlBinaryNameInjectable from "../../../main/kubectl/binary-name.injectable";
import kubectlDownloadingNormalizedArchInjectable from "../../../main/kubectl/normalized-arch.injectable";
import openDeleteClusterDialogInjectable, { type OpenDeleteClusterDialog } from "../../../renderer/components/delete-cluster-dialog/open.injectable";
import { type ApplicationBuilder, getApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { Cluster } from "../../../common/cluster/cluster";
import navigateToCatalogInjectable from "../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import joinPathsInjectable from "../../../common/path/join-paths.injectable";
import { advanceFakeTime } from "../../../test-utils/use-fake-time";

const currentClusterServerUrl = "https://localhost";
const nonCurrentClusterServerUrl = "http://localhost";
const multiClusterConfig = `
apiVersion: v1
clusters:
- cluster:
    server: ${currentClusterServerUrl}
  name: some-current-context-cluster
- cluster:
    server: ${nonCurrentClusterServerUrl}
  name: some-non-current-context-cluster
contexts:
- context:
    cluster: some-current-context-cluster
    user: some-user
  name: some-current-context
- context:
    cluster: some-non-current-context-cluster
    user: some-user
  name: some-non-current-context
current-context: some-current-context
kind: Config
preferences: {}
users:
- name: some-user
  user:
    token: kubeconfig-user-q4lm4:xxxyyyy
`;

const singleClusterServerUrl = "http://localhost";
const singleClusterConfig = `
apiVersion: v1
clusters:
- cluster:
    server: ${singleClusterServerUrl}
  name: some-cluster
contexts:
- context:
    cluster: some-cluster
    user: some-user
  name: some-context
current-context: some-context
kind: Config
preferences: {}
users:
- name: some-user
  user:
    token: kubeconfig-user-q4lm4:xxxyyyy
`;

describe("Deleting a cluster", () => {
  let builder: ApplicationBuilder;
  let openDeleteClusterDialog: OpenDeleteClusterDialog;
  let rendered: RenderResult;
  let config: KubeConfig;

  beforeEach(async () => {
    config = new KubeConfig();
    builder = getApplicationBuilder();

    builder.beforeApplicationStart(({ mainDi }) => {
      mainDi.override(kubectlBinaryNameInjectable, () => "kubectl");
      mainDi.override(kubectlDownloadingNormalizedArchInjectable, () => "amd64");
      mainDi.override(normalizedPlatformInjectable, () => "darwin");
    });

    builder.beforeWindowStart(({ windowDi }) => {
      openDeleteClusterDialog = windowDi.inject(openDeleteClusterDialogInjectable);
    });

    builder.afterWindowStart(({ windowDi }) => {
      const navigateToCatalog = windowDi.inject(navigateToCatalogInjectable);

      navigateToCatalog();
    });

    rendered = await builder.render();
  });

  describe("when the kubeconfig has multiple clusters", () => {
    let currentCluster: Cluster;
    let nonCurrentCluster: Cluster;

    beforeEach(() => {
      config.loadFromString(multiClusterConfig);

      currentCluster = new Cluster({
        id: "some-current-context-cluster",
        contextName: "some-current-context",
        preferences: {
          clusterName: "some-current-context-cluster",
        },
        kubeConfigPath: "./temp-kube-config",
      });
      nonCurrentCluster = new Cluster({
        id: "some-non-current-context-cluster",
        contextName: "some-non-current-context",
        preferences: {
          clusterName: "some-non-current-context-cluster",
        },
        kubeConfigPath: "./temp-kube-config",
      });
    });

    describe("when the dialog is opened for the current cluster", () => {
      // TODO: replace with actual behaviour instead of technical use
      beforeEach(async () => {
        openDeleteClusterDialog(config, currentCluster);
        advanceFakeTime(1000);
        await rendered.findByTestId("delete-cluster-dialog");
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("shows context switcher", () => {
        expect(rendered.queryByText("Select new context...")).toBeInTheDocument();
      });

      it("shows warning", () => {
        expect(rendered.queryByTestId("current-context-warning")).toBeInTheDocument();
      });
    });

    describe("when the dialog is opened for not the current cluster", () => {
      // TODO: replace with actual behaviour instead of technical use
      beforeEach(async () => {
        openDeleteClusterDialog(config, nonCurrentCluster);
        advanceFakeTime(1000);
        await rendered.findByTestId("delete-cluster-dialog");
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("shows warning", () => {
        expect(rendered.queryByTestId("kubeconfig-change-warning")).toBeInTheDocument();
      });

      it("does not show context switcher", () => {
        expect(rendered.queryByText("Select new context...")).not.toBeInTheDocument();
      });

      describe("when context switching checkbox is clicked", () => {
        beforeEach(() => {
          rendered.getByTestId("delete-cluster-dialog-context-switch").click();
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        it("shows context switcher", () => {
          expect(rendered.queryByText("Select new context...")).toBeInTheDocument();
        });
      });
    });
  });

  describe("when an internal kubeconfig cluster is used", () => {
    let currentCluster: Cluster;

    beforeEach(() => {
      config.loadFromString(singleClusterConfig);

      const directoryForKubeConfigs = builder.applicationWindow.only.di.inject(directoryForKubeConfigsInjectable);
      const joinPaths = builder.applicationWindow.only.di.inject(joinPathsInjectable);

      currentCluster = new Cluster({
        id: "some-cluster",
        contextName: "some-context",
        preferences: {
          clusterName: "some-cluster",
        },
        kubeConfigPath: joinPaths(directoryForKubeConfigs, "some-cluster.json"),
      });
    });

    describe("when the dialog is opened", () => {
      // TODO: replace with actual behaviour instead of technical use
      beforeEach(async () => {
        openDeleteClusterDialog(config, currentCluster);
        advanceFakeTime(1000);
        await rendered.findByTestId("delete-cluster-dialog");
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("shows warning", () => {
        expect(rendered.queryByTestId("internal-kubeconfig-warning")).toBeInTheDocument();
      });
    });
  });

  describe("when the kubeconfig has only one cluster", () => {
    let currentCluster: Cluster;

    beforeEach(() => {
      config.loadFromString(singleClusterConfig);

      currentCluster = new Cluster({
        id: "some-cluster",
        contextName: "some-context",
        preferences: {
          clusterName: "some-cluster",
        },
        kubeConfigPath: "./temp-kube-config",
      });
    });

    describe("when the dialog is opened", () => {
      // TODO: replace with actual behaviour instead of technical use
      beforeEach(async () => {
        openDeleteClusterDialog(config, currentCluster);
        advanceFakeTime(1000);
        await rendered.findByTestId("delete-cluster-dialog");
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("shows warning", () => {
        expect(rendered.queryByTestId("no-more-contexts-warning")).toBeInTheDocument();
      });
    });
  });
});
