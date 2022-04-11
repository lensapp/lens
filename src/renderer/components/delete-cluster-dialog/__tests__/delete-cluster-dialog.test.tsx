/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "@testing-library/jest-dom/extend-expect";
import { KubeConfig } from "@kubernetes/client-node";
import { fireEvent, screen } from "@testing-library/react";
import mockFs from "mock-fs";
import React from "react";
import * as selectEvent from "react-select-event";
import type { Cluster } from "../../../../common/cluster/cluster";
import { DeleteClusterDialog } from "../view";
import type { ClusterModel } from "../../../../common/cluster-types";
import { getDisForUnitTesting } from "../../../../test-utils/get-dis-for-unit-testing";
import { createClusterInjectionToken } from "../../../../common/cluster/create-cluster-injection-token";
import createContextHandlerInjectable from "../../../../main/context-handler/create-context-handler.injectable";
import type { DiRender } from "../../test-utils/renderFor";
import { renderFor } from "../../test-utils/renderFor";
import type { OpenDeleteClusterDialog } from "../open.injectable";
import openDeleteClusterDialogInjectable from "../open.injectable";
import createStoresAndApisInjectable from "../../../create-stores-apis.injectable";
import createKubeconfigManagerInjectable from "../../../../main/kubeconfig-manager/create-kubeconfig-manager.injectable";

jest.mock("electron", () => ({
  app: {
    getVersion: () => "99.99.99",
    getName: () => "lens",
    setName: jest.fn(),
    setPath: jest.fn(),
    getPath: () => "tmp",
    getLocale: () => "en",
    setLoginItemSettings: jest.fn(),
  },
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn(),
  },
}));

const kubeconfig = `
apiVersion: v1
clusters:
- cluster:
    server: https://localhost
  name: test
- cluster:
    server: http://localhost
  name: other-cluster
contexts:
- context:
    cluster: test
    user: test
  name: test
- context:
    cluster: test
    user: test
  name: test2
- context:
    cluster: other-cluster
    user: test
  name: other-context
current-context: other-context
kind: Config
preferences: {}
users:
- name: test
  user:
    token: kubeconfig-user-q4lm4:xxxyyyy
`;

const singleClusterConfig = `
apiVersion: v1
clusters:
- cluster:
    server: http://localhost
  name: other-cluster
contexts:
- context:
    cluster: other-cluster
    user: test
  name: other-context
current-context: other-context
kind: Config
preferences: {}
users:
- name: test
  user:
    token: kubeconfig-user-q4lm4:xxxyyyy
`;

let config: KubeConfig;

describe("<DeleteClusterDialog />", () => {
  let createCluster: (model: ClusterModel) => Cluster;
  let openDeleteClusterDialog: OpenDeleteClusterDialog;
  let render: DiRender;

  beforeEach(async () => {
    const { mainDi, rendererDi, runSetups } = getDisForUnitTesting({ doGeneralOverrides: true });

    render = renderFor(rendererDi);
    mainDi.override(createContextHandlerInjectable, () => () => undefined);
    mainDi.override(createKubeconfigManagerInjectable, () => () => undefined);
    mockFs();

    rendererDi.override(createStoresAndApisInjectable, () => true);

    await runSetups();

    openDeleteClusterDialog = rendererDi.inject(openDeleteClusterDialogInjectable);
    createCluster = mainDi.inject(createClusterInjectionToken);
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe("Kubeconfig with different clusters", () => {
    beforeEach(async () => {
      const mockOpts = {
        "temp-kube-config": kubeconfig,
      };

      mockFs(mockOpts);

      config = new KubeConfig();
      config.loadFromString(kubeconfig);
    });

    afterEach(() => {
      mockFs.restore();
    });

    it("renders w/o errors", () => {
      const { container } = render(<DeleteClusterDialog />);

      expect(container).toBeInstanceOf(HTMLElement);
    });

    it("shows warning when deleting non-current-context cluster", async () => {
      const cluster = createCluster({
        id: "test",
        contextName: "test",
        preferences: {
          clusterName: "minikube",
        },
        kubeConfigPath: "./temp-kube-config",
      });

      openDeleteClusterDialog({ cluster, config });

      render(<DeleteClusterDialog />);
      const message = "The contents of kubeconfig file will be changed!";

      expect(await screen.findByText(message)).toBeInstanceOf(HTMLElement);
    });

    it("shows warning when deleting current-context cluster", async () => {
      const cluster = createCluster({
        id: "other-cluster",
        contextName: "other-context",
        preferences: {
          clusterName: "other-cluster",
        },
        kubeConfigPath: "./temp-kube-config",
      });

      openDeleteClusterDialog({ cluster, config });
      render(<DeleteClusterDialog />);

      expect(await screen.findByTestId("current-context-warning")).toBeInstanceOf(HTMLElement);
    });

    it("shows context switcher when deleting current cluster", async () => {
      const cluster = createCluster({
        id: "other-cluster",
        contextName: "other-context",
        preferences: {
          clusterName: "other-cluster",
        },
        kubeConfigPath: "./temp-kube-config",
      });

      openDeleteClusterDialog({ cluster, config });
      render(<DeleteClusterDialog />);

      const menu = await screen.findByText("Select new context...");

      expect(menu).toBeInTheDocument();
      selectEvent.openMenu(menu);

      expect(await screen.findByText("test")).toBeInTheDocument();
      expect(await screen.findByText("test2")).toBeInTheDocument();
    });

    it("shows context switcher after checkbox click", async () => {
      const cluster = createCluster({
        id: "some-cluster",
        contextName: "test",
        preferences: {
          clusterName: "test",
        },
        kubeConfigPath: "./temp-kube-config",
      });

      openDeleteClusterDialog({ cluster, config });
      render(<DeleteClusterDialog />);

      const link = await screen.findByTestId("context-switch");

      expect(link).toBeInstanceOf(HTMLElement);
      fireEvent.click(link);

      const menu = await screen.findByText("Select new context...");

      expect(menu).toBeInTheDocument();
      selectEvent.openMenu(menu);

      expect(await screen.findByText("test")).toBeInTheDocument();
      expect(await screen.findByText("test2")).toBeInTheDocument();
    });

    it("shows warning for internal kubeconfig cluster", async () => {
      const cluster = createCluster({
        id: "some-cluster",
        contextName: "test",
        preferences: {
          clusterName: "test",
        },
        kubeConfigPath: "./temp-kube-config",
      });

      const spy = jest.spyOn(cluster, "isInLocalKubeconfig").mockImplementation(() => true);

      openDeleteClusterDialog({ cluster, config });
      render(<DeleteClusterDialog />);

      expect(await screen.findByTestId("internal-kubeconfig-warning")).toBeInstanceOf(HTMLElement);

      spy.mockRestore();
    });
  });

  describe("Kubeconfig with single cluster", () => {
    beforeEach(async () => {
      const mockOpts = {
        "temp-kube-config": singleClusterConfig,
      };

      mockFs(mockOpts);

      config = new KubeConfig();
      config.loadFromString(singleClusterConfig);
    });

    afterEach(() => {
      mockFs.restore();
    });

    it("shows warning if no other contexts left", async () => {
      const cluster = createCluster({
        id: "other-cluster",
        contextName: "other-context",
        preferences: {
          clusterName: "other-cluster",
        },
        kubeConfigPath: "./temp-kube-config",
      });

      openDeleteClusterDialog({ cluster, config });
      render(<DeleteClusterDialog />);

      expect(await screen.findByTestId("no-more-contexts-warning")).toBeInstanceOf(HTMLElement);
    });
  });
});
