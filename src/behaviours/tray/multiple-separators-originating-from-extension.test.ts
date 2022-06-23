/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { LensMainExtension } from "../../extensions/lens-main-extension";
import type { TrayMenuRegistration } from "../../main/tray/tray-menu-registration";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import getRandomIdInjectable from "../../common/utils/get-random-id.injectable";

describe("multiple separators originating from extension", () => {
  let applicationBuilder: ApplicationBuilder;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeApplicationStart(({ mainDi }) => {
      mainDi.unoverride(getRandomIdInjectable);
      mainDi.permitSideEffects(getRandomIdInjectable);
    });

    await applicationBuilder.render();
  });

  it("given extension with multiple separators, when extension is enabled, does not throw", () => {
    const someExtension = new SomeTestExtension({
      id: "some-extension-id",
      trayMenus: [{ type: "separator" }, { type: "separator" } ],
    });

    expect(() => {
      applicationBuilder.extensions.main.enable(someExtension);
    }).not.toThrow();
  });
});

class SomeTestExtension extends LensMainExtension {
  constructor({ id, trayMenus }: {
     id: string;
     trayMenus: TrayMenuRegistration[];
   }) {
    super({
      id,
      absolutePath: "irrelevant",
      isBundled: false,
      isCompatible: false,
      isEnabled: false,
      manifest: { name: id, version: "some-version", engines: { lens: "^5.5.0" }},
      manifestPath: "irrelevant",
    });

    this.trayMenus = trayMenus;
  }
}
