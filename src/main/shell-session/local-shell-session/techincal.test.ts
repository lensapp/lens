/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import { WebSocket } from "ws";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import pathExistsSyncInjectable from "../../../common/fs/path-exists-sync.injectable";
import pathExistsInjectable from "../../../common/fs/path-exists.injectable";
import readJsonSyncInjectable from "../../../common/fs/read-json-sync.injectable";
import statInjectable from "../../../common/fs/stat.injectable";
import writeJsonSyncInjectable from "../../../common/fs/write-json-sync.injectable";
import platformInjectable from "../../../common/vars/platform.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import createKubectlInjectable from "../../kubectl/create-kubectl.injectable";
import type { Kubectl } from "../../kubectl/kubectl";
import buildVersionInjectable from "../../vars/build-version/build-version.injectable";
import type { OpenShellSession } from "../create-shell-session.injectable";
import type { SpawnPty } from "../spawn-pty.injectable";
import spawnPtyInjectable from "../spawn-pty.injectable";
import openLocalShellSessionInjectable from "./open.injectable";

describe("technical unit tests for local shell sessions", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting({
      doGeneralOverrides: true,
    });

    di.override(directoryForUserDataInjectable, () => "/some-directory-for-user-data");
    di.override(buildVersionInjectable, () => ({
      get: () => "1.1.1",
    }));
    di.override(pathExistsInjectable, () => () => { throw new Error("tried call pathExists without override"); });
    di.override(pathExistsSyncInjectable, () => () => { throw new Error("tried call pathExistsSync without override"); });
    di.override(readJsonSyncInjectable, () => () => { throw new Error("tried call readJsonSync without override"); });
    di.override(writeJsonSyncInjectable, () => () => { throw new Error("tried call writeJsonSync without override"); });
    di.override(statInjectable, () => () => { throw new Error("tried call stat without override"); });
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
