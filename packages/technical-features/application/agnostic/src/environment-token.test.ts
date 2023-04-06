import { createContainer, DiContainer, getInjectable } from "@ogre-tools/injectable";
import { lensBuildEnvironmentInjectionToken } from "./environment-token";

describe("environment-token coverage tests", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = createContainer("irrelevant");
  });

  it("should be able to specify a build environment", () => {
    di.register(
      getInjectable({
        id: "some-id",
        instantiate: () => "some-value",
        injectionToken: lensBuildEnvironmentInjectionToken,
      }),
    );

    expect(di.inject(lensBuildEnvironmentInjectionToken)).toBe("some-value");
  });
});
