import { createContainer, DiContainer } from "@ogre-tools/injectable";
import { registerFeature } from "@k8slens/feature-core";
import { joinPathsInjectionToken } from "./join-paths.injectable";
import { appPathsFeature } from "../feature";
import path from "path";

describe("join-paths", () => {
  let di: DiContainer;
  let joinPaths: (...args: string[]) => string;

  beforeEach(() => {
    di = createContainer("irrelevant");
    registerFeature(di, appPathsFeature);
    joinPaths = di.inject(joinPathsInjectionToken);
  });

  it("is the native function", () => {
    expect(joinPaths).toBe(path.join);
  });
});
