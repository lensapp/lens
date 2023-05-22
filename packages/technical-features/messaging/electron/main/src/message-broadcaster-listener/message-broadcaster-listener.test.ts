import { registerFeature } from "@k8slens/feature-core";
import { createContainer } from "@ogre-tools/injectable";
import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";
import { messagingFeatureForMain } from "../feature";
import sendMessageToChannelInjectable from "../send-message-to-channel/send-message-to-channel.injectable";
import { startApplicationInjectionToken } from "@k8slens/application";
import { runInAction } from "mobx";
import ipcMainInjectable from "../ipc-main/ipc-main.injectable";
import type { IpcMainEvent } from "electron";

describe("message-broadcaster-listener", () => {
  let sendMessageToChannelMock: jest.Mock;
  let onMock: jest.Mock;

  beforeEach(async () => {
    const di = createContainer("irrelevant");

    registerMobX(di);

    runInAction(() => {
      registerFeature(di, messagingFeatureForMain);
    });

    sendMessageToChannelMock = jest.fn();

    onMock = jest.fn();

    di.override(
      ipcMainInjectable,

      () =>
        ({
          on: onMock,
          off: () => {},
        } as unknown),
    );

    di.override(sendMessageToChannelInjectable, () => sendMessageToChannelMock);

    const startApplication = di.inject(startApplicationInjectionToken);

    await startApplication();
  });

  describe("when message to broadcaster channel arrives", () => {
    beforeEach(() => {
      onMock.mock.calls[0][1]({ frameId: 42, processId: 84 } as IpcMainEvent, {
        targetChannelId: "some-target-channel-id",
        message: "some-message",
      });
    });

    it("rebroadcasts message to the target channel", () => {
      expect(sendMessageToChannelMock).toHaveBeenCalledWith({ id: "some-target-channel-id" }, "some-message");
    });
  });
});
