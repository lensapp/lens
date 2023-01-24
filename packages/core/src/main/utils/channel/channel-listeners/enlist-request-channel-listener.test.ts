/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import ipcMainInjectable from "../ipc-main/ipc-main.injectable";
import type { IpcMain, IpcMainInvokeEvent } from "electron";
import { getPromiseStatus } from "../../../../common/test-utils/get-promise-status";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { RequestChannel } from "../../../../common/utils/channel/request-channel-listener-injection-token";
import type { EnlistRequestChannelListener } from "./enlist-request-channel-listener.injectable";
import enlistRequestChannelListenerInjectable from "./enlist-request-channel-listener.injectable";
import type { RequestChannelHandler } from "./listener-tokens";

type TestRequestChannel = RequestChannel<unknown, unknown>;

const testRequestChannel: TestRequestChannel = {
  id: "some-channel-id",
};

describe("enlist request channel listener in main", () => {
  let enlistRequestChannelListener: EnlistRequestChannelListener;
  let ipcMainStub: IpcMain;
  let handleMock: jest.Mock;
  let offMock: jest.Mock;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    handleMock = jest.fn();
    offMock = jest.fn();

    ipcMainStub = {
      handle: handleMock,
      off: offMock,
    } as unknown as IpcMain;

    di.override(ipcMainInjectable, () => ipcMainStub);

    enlistRequestChannelListener = di.inject(enlistRequestChannelListenerInjectable);
  });

  describe("when called", () => {
    let handlerMock: AsyncFnMock<RequestChannelHandler<TestRequestChannel>>;
    let disposer: () => void;

    beforeEach(() => {
      handlerMock = asyncFn();

      disposer = enlistRequestChannelListener({
        channel: testRequestChannel,
        handler: handlerMock,
      });
    });

    it("does not call handler yet", () => {
      expect(handlerMock).not.toHaveBeenCalled();
    });

    it("registers the listener", () => {
      expect(handleMock).toHaveBeenCalledWith(
        "some-channel-id",
        expect.any(Function),
      );
    });

    it("does not de-register the listener yet", () => {
      expect(offMock).not.toHaveBeenCalled();
    });

    describe("when request arrives", () => {
      let actualPromise: Promise<any>;

      beforeEach(() => {
        actualPromise = handleMock.mock.calls[0][1](
          {} as IpcMainInvokeEvent,
          "some-request",
        );
      });

      it("calls the handler with the request", () => {
        expect(handlerMock).toHaveBeenCalledWith("some-request");
      });

      it("does not resolve yet", async () => {
        const promiseStatus = await getPromiseStatus(actualPromise);

        expect(promiseStatus.fulfilled).toBe(false);
      });

      describe("when handler resolves with response, listener resolves with the response", () => {
        beforeEach(async () => {
          await handlerMock.resolve("some-response");
        });

        it("resolves with the response", async () => {
          const actual = await actualPromise;

          expect(actual).toBe("some-response");
        });

        it("when disposing the listener, de-registers the listener", () => {
          disposer();

          expect(offMock).toHaveBeenCalledWith("some-channel-id", expect.any(Function));
        });
      });

      it("given number as response, when handler resolves with response, listener resolves with stringified response", async () => {
        await handlerMock.resolve(42);

        const actual = await actualPromise;

        expect(actual).toBe(42);
      });

      it("given boolean as response, when handler resolves with response, listener resolves with stringified response", async () => {
        await handlerMock.resolve(true);

        const actual = await actualPromise;

        expect(actual).toBe(true);
      });

      it("given object as response, when handler resolves with response, listener resolves with response", async () => {
        await handlerMock.resolve({ some: "object" });

        const actual = await actualPromise;

        expect(actual).toEqual({ some: "object" });
      });
    });

    it("given number as request, when request arrives, calls the handler with the request", () => {
      handleMock.mock.calls[0][1]({} as IpcMainInvokeEvent, 42);

      expect(handlerMock).toHaveBeenCalledWith(42);
    });

    it("given boolean as request, when request arrives, calls the handler with the request", () => {
      handleMock.mock.calls[0][1]({} as IpcMainInvokeEvent, true);

      expect(handlerMock).toHaveBeenCalledWith(true);
    });

    it("given object as request, when request arrives, calls the handler with the request", () => {
      handleMock.mock.calls[0][1]({} as IpcMainInvokeEvent, { some: "object" });

      expect(handlerMock).toHaveBeenCalledWith({ some: "object" });
    });
  });
});
