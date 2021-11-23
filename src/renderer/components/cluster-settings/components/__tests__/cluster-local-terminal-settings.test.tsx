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

import React from "react";
import { render, waitFor } from "@testing-library/react";
import { ClusterLocalTerminalSetting } from "../cluster-local-terminal-settings";
import userEvent from "@testing-library/user-event";
import { stat } from "fs/promises";
import { Notifications } from "../../../notifications";

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
    const dom = render(<ClusterLocalTerminalSetting cluster={null}/>);

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
    } as any;
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
    } as any;
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
    } as any;

    const dom = render(<ClusterLocalTerminalSetting cluster={cluster}/>);
    const dn = await dom.findByTestId("default-namespace");

    userEvent.click(dn);
    userEvent.type(dn, "kube-system");
    userEvent.click(dom.baseElement);

    await waitFor(() => expect(cluster.preferences.defaultNamespace).toBe("kube-system"));
  });

  it("should save the new CWD if path is a directory", async () => {
    mockStat.mockImplementation(async (path: string) => {
      expect(path).toBe("/foobar");

      return {
        isDirectory: () => true,
      } as any;
    });

    const cluster = {
      getKubeconfig: jest.fn(() => ({
        getContextObject: jest.fn(() => ({})),
      })),
    } as any;

    const dom = render(<ClusterLocalTerminalSetting cluster={cluster}/>);
    const dn = await dom.findByTestId("working-directory");

    userEvent.click(dn);
    userEvent.type(dn, "/foobar");
    userEvent.click(dom.baseElement);

    await waitFor(() => expect(cluster.preferences?.terminalCWD).toBe("/foobar"));
  });

  it("should not save the new CWD if path is a file", async () => {
    mockStat.mockImplementation(async (path: string) => {
      expect(path).toBe("/foobar");

      return {
        isDirectory: () => false,
        isFile: () => true,
      } as any;
    });

    const cluster = {
      getKubeconfig: jest.fn(() => ({
        getContextObject: jest.fn(() => ({})),
      })),
    } as any;

    const dom = render(<ClusterLocalTerminalSetting cluster={cluster}/>);
    const dn = await dom.findByTestId("working-directory");

    userEvent.click(dn);
    userEvent.type(dn, "/foobar");
    userEvent.click(dom.baseElement);

    await waitFor(() => expect(Notifications.error).toBeCalled());
  });
});
