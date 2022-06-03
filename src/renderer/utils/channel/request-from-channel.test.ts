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

    it("sends stringified message", () => {
      expect(invokeMock).toHaveBeenCalledWith("some-channel-id", '"some-message"');
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

    it("when invoking resolves with stringified string, resolves with string", async () => {
      await invokeMock.resolve('"some-response"');

      const actual = await actualPromise;

      expect(actual).toBe("some-response");
    });

    it("when invoking resolves with stringified boolean, resolves with boolean", async () => {
      await invokeMock.resolve("true");

      const actual = await actualPromise;

      expect(actual).toBe(true);
    });

    it("when invoking resolves with stringified number, resolves with number", async () => {
      await invokeMock.resolve("42");

      const actual = await actualPromise;

      expect(actual).toBe(42);
    });

    it("when invoking resolves with stringified object, resolves with object", async () => {
      await invokeMock.resolve(JSON.stringify({ some: "object" }));

      const actual = await actualPromise;

      expect(actual).toEqual({ some: "object" });
    });
  });

  it("given string as message, when messaging to channel, sends stringified message", () => {
    requestFromChannel(someChannel, "some-message");

    expect(invokeMock).toHaveBeenCalledWith("some-channel-id", '"some-message"');
  });

  it("given boolean as message, when messaging to channel, sends stringified message", () => {
    requestFromChannel(someChannel, true);

    expect(invokeMock).toHaveBeenCalledWith("some-channel-id", "true");
  });

  it("given number as message, when messaging to channel, sends stringified message", () => {
    requestFromChannel(someChannel, 42);

    expect(invokeMock).toHaveBeenCalledWith("some-channel-id", "42");
  });

  it("given object as message, when messaging to channel, sends stringified message", () => {
    requestFromChannel(someChannel, { some: "object" });

    expect(invokeMock).toHaveBeenCalledWith(
      "some-channel-id",
      JSON.stringify({ some: "object" }),
    );
  });
});

const someChannel: MessageChannel<any> = { id: "some-channel-id" };
