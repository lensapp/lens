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

jest.mock("../../common/ipc");
jest.mock("../context-handler");
jest.mock("request");
jest.mock("request-promise-native");

import { Console } from "console";
import mockFs from "mock-fs";
import { Cluster } from "../cluster";
import { Kubectl } from "../kubectl";

console = new Console(process.stdout, process.stderr); // fix mockFS

describe("create clusters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  let c: Cluster;

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
      }),
    };

    mockFs(mockOpts);
    jest.spyOn(Kubectl.prototype, "ensureKubectl").mockReturnValue(Promise.resolve(true));
    c = new Cluster({
      id: "foo",
      contextName: "minikube",
      kubeConfigPath: "minikube-config.yml",
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("should be able to create a cluster from a cluster model and apiURL should be decoded", () => {
    expect(c.apiUrl).toBe("https://192.168.64.3:8443");
  });

  it("reconnect should not throw if contextHandler is missing", () => {
    expect(() => c.reconnect()).not.toThrowError();
  });

  it("disconnect should not throw if contextHandler is missing", () => {
    expect(() => c.disconnect()).not.toThrowError();
  });

  it("activating cluster should try to connect to cluster and do a refresh", async () => {

    const c = new class extends Cluster {
      // only way to mock protected methods, without these we leak promises
      protected bindEvents() {
        return;
      }
      async ensureKubectl() {
        return Promise.resolve(null);
      }
    }({
      id: "foo",
      contextName: "minikube",
      kubeConfigPath: "minikube-config.yml",
    });

    c.contextHandler = {
      ensureServer: jest.fn(),
      stopServer: jest.fn(),
    } as any;

    jest.spyOn(c, "reconnect");
    jest.spyOn(c, "canI");
    jest.spyOn(c, "refreshConnectionStatus");

    await c.activate();

    expect(c.reconnect).toBeCalled();
    expect(c.refreshConnectionStatus).toBeCalled();

    c.disconnect();
    jest.resetAllMocks();
  });
});
