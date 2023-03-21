import { createContainer, DiContainer } from "@ogre-tools/injectable";
import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";
import { startApplicationInjectionToken } from "@k8slens/application";
import { registerFeature } from "@k8slens/feature-core";
import { messagingFeatureForRenderer } from "./feature";
import { runInAction } from "mobx";
import ipcRendererInjectable from "./ipc/ipc-renderer.injectable";
import { sendMessageToChannelInjectionToken } from "@k8slens/messaging";
import { frameCommunicationAdminChannel } from "./allow-communication-to-iframe.injectable";

describe("allow communication to iframe", () => {
  let di: DiContainer;
  let sendMessageToChannelMock: jest.Mock;

  beforeEach(() => {
    di = createContainer("irrelevant");

    registerMobX(di);

    runInAction(() => {
      registerFeature(di, messagingFeatureForRenderer);
    });

    di.override(ipcRendererInjectable, () => ({ on: () => {} } as unknown));

    sendMessageToChannelMock = jest.fn();
    di.override(sendMessageToChannelInjectionToken, () => sendMessageToChannelMock);
  });

  it("when application starts, sends message to communication channel to register the frame ID and process ID for further usage", async () => {
    await di.inject(startApplicationInjectionToken)();

    expect(sendMessageToChannelMock).toHaveBeenCalledWith(frameCommunicationAdminChannel);
  });
});
