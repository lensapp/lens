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

jest.mock("../../../../common/ipc");

import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import { MainLayoutHeader } from "../main-layout-header";
import { Cluster } from "../../../../main/cluster";
import { ClusterStore } from "../../../../common/cluster-store";
import mockFs from "mock-fs";
import { ThemeStore } from "../../../theme.store";
import { UserStore } from "../../../../common/user-store";

jest.mock("electron", () => {
  return {
    app: {
      getVersion: () => "99.99.99",
      getPath: () => "tmp",
      getLocale: () => "en",
      setLoginItemSettings: jest.fn(),
    },
  };
});

describe("<MainLayoutHeader />", () => {
  let cluster: Cluster;

  beforeEach(() => {
    const mockOpts = {
      "minikube-config.yml": JSON.stringify({
        apiVersion: "v1",
        clusters: [{
          name: "minikube",
          cluster: {
            server: "https://192.168.64.3:8443",
          },
        }],
        contexts: [{
          context: {
            cluster: "minikube",
            user: "minikube",
          },
          name: "minikube",
        }],
        users: [{
          name: "minikube",
        }],
        kind: "Config",
        preferences: {},
      })
    };

    mockFs(mockOpts);

    UserStore.createInstance();
    ThemeStore.createInstance();
    ClusterStore.createInstance();

    cluster = new Cluster({
      id: "foo",
      contextName: "minikube",
      kubeConfigPath: "minikube-config.yml",
    });
  });

  afterEach(() => {
    ClusterStore.resetInstance();
    ThemeStore.resetInstance();
    UserStore.resetInstance();
    mockFs.restore();
  });

  it("renders w/o errors", () => {
    const { container } = render(<MainLayoutHeader cluster={cluster} />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("renders cluster name", () => {
    const { getByText } = render(<MainLayoutHeader cluster={cluster} />);

    expect(getByText("minikube")).toBeInTheDocument();
  });
});
