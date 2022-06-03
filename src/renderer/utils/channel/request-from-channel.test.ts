/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { MessageChannel } from "../../../common/utils/channel/message-channel-injection-token";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import ipcRendererInjectable from "./ipc-renderer.injectable";
import type { IpcRenderer } from "electron";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { RequestFromChannel } from "../../../common/utils/channel/request-from-channel-injection-token";
import { requestFromChannelInjectionToken } from "../../../common/utils/channel/request-from-channel-injection-token";
import requestFromChannelInjectable from "./request-from-channel.injectable";
import { getPromiseStatus } from "../../../common/test-utils/get-promise-status";

describe("request from channel in renderer", () => {
  let requestFromChannel: RequestFromChannel;
  let invokeMock: AsyncFnMock<(channelId: string, request: any) => any>;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.unoverride(requestFromChannelInjectable);

    invokeMock = asyncFn();

    di.override(ipcRendererInjectable, () => ({
      invoke: invokeMock,
    }) as unknown as IpcRenderer);

    requestFromChannel = di.inject(requestFromChannelInjectionToken);
  });

  describe("when messaging to channel", () => {
    let actualPromise: Promise<any>;

    beforeEach(() => {
      actualPromise = requestFromChannel(someChannel, "some-message");
    });

    it("does not resolve yet", async () => {
      const promiseStatus = await getPromiseStatus(actualPromise);

      expect(promiseStatus.fulfilled).toBe(false);
    });

    it("when invoking resolves, resolves", async () => {
      await invokeMock.resolve("some-response");

      const actual = await actualPromise;

      expect(actual).toBe("some-response");
    });

    it("when resolving with number, resolves with number", async () => {
      await invokeMock.resolve(10);

      const actual = await actualPromise;

      expect(actual).toBe(10);
    });

    it("when resolving with number 0, resolves with number 0", async () => {
      await invokeMock.resolve(0);

      const actual = await actualPromise;

      expect(actual).toBe(0);
    });

    it("when resolving with true, resolves with true", async () => {
      await invokeMock.resolve(true);

      const actual = await actualPromise;

      expect(actual).toBe(true);
    });

    it("when resolving with false, resolves with false", async () => {
      await invokeMock.resolve(false);

      const actual = await actualPromise;

      expect(actual).toBe(false);
    });

    it("when resolving with object, resolves with object", async () => {
      await invokeMock.resolve({ myField: true });

      const actual = await actualPromise;

      expect(actual).toEqual({ myField: true });
    });
  });
});

const someChannel: MessageChannel<any> = { id: "some-channel-id" };
