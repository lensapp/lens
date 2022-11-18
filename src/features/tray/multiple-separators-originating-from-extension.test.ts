/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ApplicationBuilder } from "../test-utils/application-builder";
import { setupInitializingApplicationBuilder } from "../test-utils/application-builder";
import getRandomIdInjectable from "../../common/utils/get-random-id.injectable";

describe("multiple separators originating from extension", () => {
  let builder: ApplicationBuilder;

  setupInitializingApplicationBuilder(b => builder = b);

  beforeEach(async () => {
    builder.beforeApplicationStart((mainDi) => {
      mainDi.unoverride(getRandomIdInjectable);
      mainDi.permitSideEffects(getRandomIdInjectable);
    });

    await builder.render();
  });

  it("given extension with multiple separators, when extension is enabled, does not throw", () => {
    const someExtension = {
      id: "some-extension-id",
      name: "some-extension",

      mainOptions: {
        trayMenus: [{ type: "separator" as const }, { type: "separator" as const } ],
      },
    };

    expect(() => {
      builder.extensions.enable(someExtension);
    }).not.toThrow();
  });
});
