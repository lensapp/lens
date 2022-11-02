/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import { WebSocket } from "ws";
import type { Cluster } from "../../../common/cluster/cluster";
import { runManyFor } from "../../../common/runnable/run-many-for";
import { runManySyncFor } from "../../../common/runnable/run-many-sync-for";
import platformInjectable from "../../../common/vars/platform.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import createKubectlInjectable from "../../kubectl/create-kubectl.injectable";
import type { Kubectl } from "../../kubectl/kubectl";
import { beforeApplicationIsLoadingInjectionToken } from "../../start-main-application/runnable-tokens/before-application-is-loading-injection-token";
import { beforeElectronIsReadyInjectionToken } from "../../start-main-application/runnable-tokens/before-electron-is-ready-injection-token";
import type { OpenShellSession } from "../create-shell-session.injectable";
import type { SpawnPty } from "../spawn-pty.injectable";
import spawnPtyInjectable from "../spawn-pty.injectable";
import openLocalShellSessionInjectable from "./open.injectable";

describe("technical unit tests for local shell sessions", () => {
  let di: DiContainer;

  beforeEach(async () => {
    di = getDiForUnitTesting({
      doGeneralOverrides: true,
    });

    const runManySync = runManySyncFor(di);
    const runMany = runManyFor(di);
    const runAllBeforeElectronIsReady = runManySync(beforeElectronIsReadyInjectionToken);
    const runAllBeforeApplicationIsLoading = runMany(beforeApplicationIsLoadingInjectionToken);

    runAllBeforeElectronIsReady();
    await runAllBeforeApplicationIsLoading();
  });

  describe("when on windows", () => {
    let openLocalShellSession: OpenShellSession;
    let spawnPtyMock: jest.MockedFunction<SpawnPty>;

    beforeEach(() => {
      di.override(platformInjectable, () => "win32");

      spawnPtyMock = jest.fn();
      di.override(spawnPtyInjectable, () => spawnPtyMock);

      di.override(createKubectlInjectable, () => () => ({
        binDir: async () => "/some-kubectl-binary-dir",
        getBundledPath: () => "/some-bundled-kubectl-path",
      }) as Partial<Kubectl> as Kubectl);

      openLocalShellSession = di.inject(openLocalShellSessionInjectable);
    });

    describe("when opening a local shell session", () => {
      it("should pass through all environment variables to shell", async () => {
        process.env.MY_TEST_ENV_VAR = "true";

        spawnPtyMock.mockImplementationOnce((file, args, options) => {
          expect(options.env).toMatchObject({
            MY_TEST_ENV_VAR: "true",
          });

          return {
            cols: 80,
            rows: 40,
            pid: 12343,
            handleFlowControl: false,
            kill: jest.fn(),
            onData: jest.fn(),
            onExit: jest.fn(),
            pause: jest.fn(),
            process: "my-pty",
            resize: jest.fn(),
            resume: jest.fn(),
            write: jest.fn(),
            on: jest.fn(),

          };
        });

        await openLocalShellSession({
          cluster: {
            getProxyKubeconfigPath: async () => "/some-proxy-kubeconfig",
            preferences: {},
          } as Partial<Cluster> as Cluster,
          tabId: "my-tab-id",
          websocket: new WebSocket(null),
        });
      });
    });
  });
});
