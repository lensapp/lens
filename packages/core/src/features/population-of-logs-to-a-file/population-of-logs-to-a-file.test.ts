/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { winstonLoggerInjectable } from "@k8slens/logger";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type winston from "winston";
import { MESSAGE } from "triple-beam";
import { noop } from "@k8slens/utilities";
import windowLocationInjectable from "../../common/k8s-api/window-location.injectable";
import closeRendererLogFileInjectable from "./renderer/close-renderer-log-file.injectable";
import createIpcFileLoggerTransportInjectable from "./main/create-ipc-file-transport.injectable";
import browserLoggerTransportInjectable from "../../renderer/logger/browser-transport.injectable";
import { runInAction } from "mobx";

describe("Population of logs to a file", () => {
  let builder: ApplicationBuilder;
  let windowDi: DiContainer;
  let logWarningInRenderer: (message: string, ...args: any) => void;
  let frameSpecificWinstonLogInMainMock: jest.Mock;
  let frameSpecificCloseLogInMainMock: jest.Mock;

  async function setUpTestApplication({
    testFileId,
    isClusterFrame,
  }: {
    testFileId: string;
    isClusterFrame: boolean;
  }) {
    builder = getApplicationBuilder();

    if (isClusterFrame) {
      builder.setEnvironmentToClusterFrame();
    }

    frameSpecificWinstonLogInMainMock = jest.fn();
    frameSpecificCloseLogInMainMock = jest.fn();

    builder.beforeApplicationStart(({ mainDi }) => {
      mainDi.override(
        createIpcFileLoggerTransportInjectable,
        () => (fileId: string) =>
          ({
            log:
              fileId === testFileId ? frameSpecificWinstonLogInMainMock : noop,
            close:
              fileId === testFileId ? frameSpecificCloseLogInMainMock : noop,
          } as unknown as winston.transport),
      );
    });

    builder.beforeWindowStart(({ windowDi }) => {
      windowDi.unoverride(winstonLoggerInjectable);

      // Now that we have the actual winston logger in use, let's not be noisy and deregister console transport
      runInAction(() => {
        windowDi.deregister(browserLoggerTransportInjectable);
      });

      if (isClusterFrame) {
        windowDi.override(windowLocationInjectable, () => ({
          host: "some-cluster.some-domain.localhost:irrelevant",
          port: "irrelevant",
        }));
      }
    });

    await builder.render();
    windowDi = builder.applicationWindow.only.di;
    const winstonLogger = windowDi.inject(winstonLoggerInjectable);

    logWarningInRenderer = winstonLogger.warn;
  }

  describe("given in root frame", () => {
    beforeEach(async () => {
      await setUpTestApplication({
        testFileId: "renderer-root-frame",
        isClusterFrame: false,
      });
    });

    it("when logging a warning in renderer, writes to frame specific Winston log", async () => {
      logWarningInRenderer("some-warning");
      expect(frameSpecificWinstonLogInMainMock).toHaveBeenCalledWith(
        {
          level: "warn",
          message: "some-warning",
          [MESSAGE]: "warn: some-warning",
        },
        expect.any(Function),
      );
    });

    it("when closing the renderer frame, closes specific log transport in main", () => {
      const closeRendererLogFile = windowDi.inject(
        closeRendererLogFileInjectable,
      );

      // Log something to create the transport to be closed
      logWarningInRenderer("irrelevant");

      closeRendererLogFile();

      expect(frameSpecificCloseLogInMainMock).toHaveBeenCalled();
    });
  });

  describe("given in cluster frame", () => {
    beforeEach(async () => {
      await setUpTestApplication({
        testFileId: "renderer-cluster-some-cluster-frame",
        isClusterFrame: true,
      });
    });

    it("when logging a warning in renderer, writes to frame specific Winston log", async () => {
      logWarningInRenderer("some-warning");
      expect(frameSpecificWinstonLogInMainMock).toHaveBeenCalledWith(
        {
          level: "warn",
          message: "some-warning",
          [MESSAGE]: "warn: some-warning",
        },
        expect.any(Function),
      );
    });
  });
});
