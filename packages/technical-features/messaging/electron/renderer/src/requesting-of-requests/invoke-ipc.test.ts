import { createContainer, DiContainer } from "@ogre-tools/injectable";
import { registerFeature } from "@k8slens/feature-core";
import { messagingFeatureForRenderer } from "../feature";
import { ipcRenderer } from "electron";
import invokeIpcInjectable from "./invoke-ipc.injectable";
import { runInAction } from "mobx";

describe("ipc-renderer", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = createContainer("irrelevant");

    runInAction(() => {
      registerFeature(di, messagingFeatureForRenderer);
    });
  });

  it("is IPC-renderer invoke of Electron", () => {
    const actual = di.inject(invokeIpcInjectable);

    expect(actual).toBe(ipcRenderer.invoke);
  });
});
