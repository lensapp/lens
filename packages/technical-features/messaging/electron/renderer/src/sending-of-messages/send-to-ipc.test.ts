import { createContainer, DiContainer } from "@ogre-tools/injectable";
import { registerFeature } from "@k8slens/feature-core";
import { messagingFeatureForRenderer } from "../feature";
import { ipcRenderer } from "electron";
import sendToIpcInjectable from "./send-to-ipc.injectable";

describe("ipc-renderer", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = createContainer("irrelevant");

    registerFeature(di, messagingFeatureForRenderer);
  });

  it("is IPC-renderer send of Electron", () => {
    const actual = di.inject(sendToIpcInjectable);

    expect(actual).toBe(ipcRenderer.send);
  });
});
