import { createContainer, DiContainer } from "@ogre-tools/injectable";
import { registerFeature } from "@k8slens/feature-core";
import { sendMessageToChannelInjectionToken } from "@k8slens/messaging";
import { messagingFeatureForRenderer } from "../feature";
import type { MessageChannel } from "@k8slens/messaging";
import sendToIpcInjectable from "./send-to-ipc.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";

describe("message-from-channel", () => {
  let di: DiContainer;
  let sendToIpcMock: AsyncFnMock<() => Promise<number>>;

  beforeEach(() => {
    di = createContainer("irrelevant");

    registerFeature(di, messagingFeatureForRenderer);

    sendToIpcMock = asyncFn();
    di.override(sendToIpcInjectable, () => sendToIpcMock);
  });

  describe("when called", () => {
    beforeEach(() => {
      const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

      const someChannel: MessageChannel<number> = {
        id: "some-channel-id",
      };

      sendMessageToChannel(someChannel, 42);
    });

    it("sends message to broadcasting channel using IPC", () => {
      expect(sendToIpcMock).toHaveBeenCalledWith("messaging-broadcaster-in-main", {
        targetChannelId: "some-channel-id",
        message: 42,
      });
    });
  });
});
