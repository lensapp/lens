import type { IpcRendererEvent, IpcRenderer } from "electron";
import ipcRendererInjectable from "../ipc/ipc-renderer.injectable";
import { EnlistMessageChannelListener, enlistMessageChannelListenerInjectionToken } from "@k8slens/messaging";
import { createContainer } from "@ogre-tools/injectable";
import { registerFeature } from "@k8slens/feature-core";
import { messagingFeatureForRenderer } from "../feature";

describe("enlist message channel listener in renderer", () => {
  let enlistMessageChannelListener: EnlistMessageChannelListener;
  let ipcRendererStub: IpcRenderer;
  let onMock: jest.Mock;
  let offMock: jest.Mock;

  beforeEach(() => {
    const di = createContainer("irrelevant");

    registerFeature(di, messagingFeatureForRenderer);

    onMock = jest.fn();
    offMock = jest.fn();

    ipcRendererStub = {
      on: onMock,
      off: offMock,
    } as unknown as IpcRenderer;

    di.override(ipcRendererInjectable, () => ipcRendererStub);

    enlistMessageChannelListener = di.inject(enlistMessageChannelListenerInjectionToken);
  });

  describe("when called", () => {
    let handlerMock: jest.Mock;
    let disposer: () => void;

    beforeEach(() => {
      handlerMock = jest.fn();

      disposer = enlistMessageChannelListener({
        id: "some-listener",
        channel: { id: "some-channel-id" },
        handler: handlerMock,
      });
    });

    it("does not call handler yet", () => {
      expect(handlerMock).not.toHaveBeenCalled();
    });

    it("registers the listener", () => {
      expect(onMock).toHaveBeenCalledWith("some-channel-id", expect.any(Function));
    });

    it("does not de-register the listener yet", () => {
      expect(offMock).not.toHaveBeenCalled();
    });

    describe("when message arrives", () => {
      beforeEach(() => {
        onMock.mock.calls[0][1]({} as IpcRendererEvent, "some-message");
      });

      it("calls the handler with the message", () => {
        expect(handlerMock).toHaveBeenCalledWith("some-message");
      });

      it("when disposing the listener, de-registers the listener", () => {
        disposer();

        expect(offMock).toHaveBeenCalledWith("some-channel-id", expect.any(Function));
      });
    });

    it("given number as message, when message arrives, calls the handler with the message", () => {
      onMock.mock.calls[0][1]({} as IpcRendererEvent, 42);

      expect(handlerMock).toHaveBeenCalledWith(42);
    });

    it("given boolean as message, when message arrives, calls the handler with the message", () => {
      onMock.mock.calls[0][1]({} as IpcRendererEvent, true);

      expect(handlerMock).toHaveBeenCalledWith(true);
    });

    it("given object as message, when message arrives, calls the handler with the message", () => {
      onMock.mock.calls[0][1]({} as IpcRendererEvent, { some: "object" });

      expect(handlerMock).toHaveBeenCalledWith({ some: "object" });
    });
  });
});
