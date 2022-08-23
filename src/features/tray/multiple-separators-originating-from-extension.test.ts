/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import getRandomIdInjectable from "../../common/utils/get-random-id.injectable";

describe("multiple separators originating from extension", () => {
  let builder: ApplicationBuilder;

  beforeEach(async () => {
    builder = getApplicationBuilder();

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
