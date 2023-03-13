import { createContainer, DiContainer } from "@ogre-tools/injectable";
import { registerFeature } from "@k8slens/feature-core";
import ipcRendererInjectable from "./ipc-renderer.injectable";
import { messagingFeatureForRenderer } from "../feature";
import { ipcRenderer } from "electron";

describe("ipc-renderer", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = createContainer("irrelevant");

    registerFeature(di, messagingFeatureForRenderer);
  });

  it("is not undefined", () => {
    const actual = di.inject(ipcRendererInjectable);

    expect(actual).not.toBeUndefined();
  });

  it("is IPC-renderer of Electron", () => {
    const actual = di.inject(ipcRendererInjectable);

    expect(actual).toBe(ipcRenderer);
  });
});
