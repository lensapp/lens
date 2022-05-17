/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import { ClusterLocalTerminalSetting } from "../cluster-local-terminal-settings";
import userEvent from "@testing-library/user-event";
import { stat } from "fs/promises";
import { Notifications } from "../../../notifications";
import type { Stats } from "fs";
import type { Cluster } from "../../../../../common/cluster/cluster";

const mockStat = stat as jest.MockedFunction<typeof stat>;

jest.mock("fs", () => {
  const actual = jest.requireActual("fs");

  actual.promises.stat = jest.fn();

  return actual;
});

jest.mock("../../../notifications");

describe("ClusterLocalTerminalSettings", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should render without errors", () => {
    const dom = render(<ClusterLocalTerminalSetting cluster={null as never}/>);

    expect(dom.container).toBeInstanceOf(HTMLElement);
  });

  it("should render the current settings", async () => {
    const cluster = {
      preferences: {
        terminalCWD: "/foobar",
        defaultNamespace: "kube-system",
      },
      getKubeconfig: jest.fn(() => ({
        getContextObject: jest.fn(() => ({})),
      })),
    } as unknown as Cluster;
    const dom = render(<ClusterLocalTerminalSetting cluster={cluster}/>);

    expect(await dom.findByDisplayValue("/foobar")).toBeDefined();
    expect(await dom.findByDisplayValue("kube-system")).toBeDefined();
  });

  it("should change placeholder for 'Default Namespace' to be the namespace from the kubeconfig", async () => {
    const cluster = {
      preferences: {
        terminalCWD: "/foobar",
      },
      getKubeconfig: jest.fn(() => ({
        getContextObject: jest.fn(() => ({
          namespace: "blat",
        })),
      })),
    } as unknown as Cluster;
    const dom = render(<ClusterLocalTerminalSetting cluster={cluster}/>);

    expect(await dom.findByDisplayValue("/foobar")).toBeDefined();
    expect(await dom.findByPlaceholderText("blat")).toBeDefined();
  });

  it("should save the new default namespace after clicking away", async () => {
    const cluster = {
      preferences: {
        terminalCWD: "/foobar",
      },
      getKubeconfig: jest.fn(() => ({
        getContextObject: jest.fn(() => ({})),
      })),
    } as unknown as Cluster;

    const dom = render(<ClusterLocalTerminalSetting cluster={cluster}/>);
    const dn = await dom.findByTestId("default-namespace");

    userEvent.click(dn);
    userEvent.type(dn, "kube-system");
    userEvent.click(dom.baseElement);

    await waitFor(() => expect(cluster.preferences.defaultNamespace).toBe("kube-system"));
  });

  it("should save the new CWD if path is a directory", async () => {
    mockStat.mockImplementation(async (path) => {
      expect(path).toBe("/foobar");

      return {
        isDirectory: () => true,
      } as Stats;
    });

    const cluster = {
      getKubeconfig: jest.fn(() => ({
        getContextObject: jest.fn(() => ({})),
      })),
    } as unknown as Cluster;

    const dom = render(<ClusterLocalTerminalSetting cluster={cluster}/>);
    const dn = await dom.findByTestId("working-directory");

    userEvent.click(dn);
    userEvent.type(dn, "/foobar");
    userEvent.click(dom.baseElement);

    await waitFor(() => expect(cluster.preferences?.terminalCWD).toBe("/foobar"));
  });

  it("should not save the new CWD if path is a file", async () => {
    mockStat.mockImplementation(async (path) => {
      expect(path).toBe("/foobar");

      return {
        isDirectory: () => false,
        isFile: () => true,
      } as Stats;
    });

    const cluster = {
      getKubeconfig: jest.fn(() => ({
        getContextObject: jest.fn(() => ({})),
      })),
    } as unknown as Cluster;

    const dom = render(<ClusterLocalTerminalSetting cluster={cluster}/>);
    const dn = await dom.findByTestId("working-directory");

    userEvent.click(dn);
    userEvent.type(dn, "/foobar");
    userEvent.click(dom.baseElement);

    await waitFor(() => expect(Notifications.error).toBeCalled());
  });
});
