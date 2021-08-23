/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import "@testing-library/jest-dom/extend-expect";
import { KubeConfig } from "@kubernetes/client-node";
import { fireEvent, render } from "@testing-library/react";
import mockFs from "mock-fs";
import React from "react";
import selectEvent from "react-select-event";

import { Cluster } from "../../../../main/cluster";
import { DeleteClusterDialog } from "../delete-cluster-dialog";

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

let config: KubeConfig;

describe("<DeleteClusterDialog />", () => {
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

  it("shows warning when deleting non-current-context cluster", () => {
    const cluster = new Cluster({
      id: "test",
      contextName: "test",
      preferences: {
        clusterName: "minikube"
      },
      kubeConfigPath: "./temp-kube-config",
    });

    DeleteClusterDialog.open({ cluster, config });
    const { getByText } = render(<DeleteClusterDialog />);

    const message = "The contents of your kubeconfig file will be changed!";

    expect(getByText(message)).toBeInstanceOf(HTMLElement);
  });

  it("shows warning when deleting current-context cluster", () => {
    const cluster = new Cluster({
      id: "other-cluster",
      contextName: "other-context",
      preferences: {
        clusterName: "other-cluster"
      },
      kubeConfigPath: "./temp-kube-config",
    });

    DeleteClusterDialog.open({ cluster, config });

    const { getByTestId } = render(<DeleteClusterDialog />);

    expect(getByTestId("context-warning")).toBeInstanceOf(HTMLElement);
  });

  it("shows context switcher", async () => {
    const cluster = new Cluster({
      id: "other-cluster",
      contextName: "other-context",
      preferences: {
        clusterName: "other-cluster"
      },
      kubeConfigPath: "./temp-kube-config",
    });

    DeleteClusterDialog.open({ cluster, config });

    const { getByText } = render(<DeleteClusterDialog />);
    const link = getByText("Replace current context");

    expect(link).toBeInstanceOf(HTMLElement);
    fireEvent.click(link);

    expect(getByText("Select...")).toBeInTheDocument();
    selectEvent.openMenu(getByText("Select..."));

    expect(getByText("test")).toBeInTheDocument();
    expect(getByText("test2")).toBeInTheDocument();
  });
});
