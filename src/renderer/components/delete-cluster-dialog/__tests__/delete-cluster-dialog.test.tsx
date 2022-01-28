/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "@testing-library/jest-dom/extend-expect";
import { KubeConfig } from "@kubernetes/client-node";
import { fireEvent } from "@testing-library/react";
import mockFs from "mock-fs";
import React from "react";
import * as selectEvent from "react-select-event";

import type { Cluster } from "../../../../common/cluster/cluster";
import { DeleteClusterDialog } from "../delete-cluster-dialog";

import type { ClusterModel } from "../../../../common/cluster-types";
import { getDisForUnitTesting } from "../../../../test-utils/get-dis-for-unit-testing";
import { createClusterInjectionToken } from "../../../../common/cluster/create-cluster-injection-token";
import type { DependencyInjectionContainer } from "@ogre-tools/injectable";
import { type DiRender, renderFor } from "../../test-utils/renderFor";
import deleteClusterDialogStateInjectable from "../state.injectable";

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
  let di: DependencyInjectionContainer;
  let render: DiRender;

  beforeEach(async () => {
    const { mainDi, runSetups } = getDisForUnitTesting({ doGeneralOverrides: true });

    mockFs();

    await runSetups();

    createCluster = mainDi.inject(createClusterInjectionToken);
    render = renderFor(di);
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe("Kubeconfig with different clusters", () => {
    beforeEach(() => {
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

    it("shows warning when deleting non-current-context cluster", () => {
      const cluster = createCluster({
        id: "test",
        contextName: "test",
        preferences: {
          clusterName: "minikube",
        },
        kubeConfigPath: "./temp-kube-config",
      });

      di.override(deleteClusterDialogStateInjectable, () => ({ cluster, config }));

      const { getByText } = render(<DeleteClusterDialog />);

      const message = "The contents of kubeconfig file will be changed!";

      expect(getByText(message)).toBeInstanceOf(HTMLElement);
    });

    it("shows warning when deleting current-context cluster", () => {
      const cluster = createCluster({
        id: "other-cluster",
        contextName: "other-context",
        preferences: {
          clusterName: "other-cluster",
        },
        kubeConfigPath: "./temp-kube-config",
      });

      di.override(deleteClusterDialogStateInjectable, () => ({ cluster, config }));

      const { getByTestId } = render(<DeleteClusterDialog />);

      expect(getByTestId("current-context-warning")).toBeInstanceOf(HTMLElement);
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

      di.override(deleteClusterDialogStateInjectable, () => ({ cluster, config }));

      const { findByText } = render(<DeleteClusterDialog />);

      expect(await findByText("Select...")).toBeInTheDocument();
      selectEvent.openMenu(await findByText("Select..."));

      expect(await findByText("test")).toBeInTheDocument();
      expect(await findByText("test2")).toBeInTheDocument();
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

      di.override(deleteClusterDialogStateInjectable, () => ({ cluster, config }));


      const { findByText, findByTestId } = render(<DeleteClusterDialog />);
      const link = await findByTestId("context-switch");

      expect(link).toBeInstanceOf(HTMLElement);
      fireEvent.click(link);

      expect(await findByText("Select...")).toBeInTheDocument();
      selectEvent.openMenu(await findByText("Select..."));

      expect(await findByText("test")).toBeInTheDocument();
      expect(await findByText("test2")).toBeInTheDocument();
    });

    it("shows warning for internal kubeconfig cluster", () => {
      const cluster = createCluster({
        id: "some-cluster",
        contextName: "test",
        preferences: {
          clusterName: "test",
        },
        kubeConfigPath: "./temp-kube-config",
      });

      const spy = jest.spyOn(cluster, "isInLocalKubeconfig").mockImplementation(() => true);

      di.override(deleteClusterDialogStateInjectable, () => ({ cluster, config }));

      const { getByTestId } = render(<DeleteClusterDialog />);

      expect(getByTestId("internal-kubeconfig-warning")).toBeInstanceOf(HTMLElement);

      spy.mockRestore();
    });
  });

  describe("Kubeconfig with single cluster", () => {
    beforeEach(() => {
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

    it("shows warning if no other contexts left", () => {
      const cluster = createCluster({
        id: "other-cluster",
        contextName: "other-context",
        preferences: {
          clusterName: "other-cluster",
        },
        kubeConfigPath: "./temp-kube-config",
      });

      di.override(deleteClusterDialogStateInjectable, () => ({ cluster, config }));

      const { getByTestId } = render(<DeleteClusterDialog />);

      expect(getByTestId("no-more-contexts-warning")).toBeInstanceOf(HTMLElement);
    });
  });
});
