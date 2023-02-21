/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import extensionApiVersionInjectable from "../../common/vars/extension-api-version.injectable";
import type { IsCompatibleExtension } from "../../features/extensions/discovery/main/is-compatible-extension.injectable";
import isCompatibleExtensionInjectable from "../../features/extensions/discovery/main/is-compatible-extension.injectable";
import { getDiForUnitTesting } from "../../renderer/getDiForUnitTesting";

describe("Extension/App versions compatibility checks", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });
  });

  describe("when extension API version is 5.5.0", () => {
    let isCompatibleExtension: IsCompatibleExtension;

    beforeEach(() => {
      di.override(extensionApiVersionInjectable, () => "5.5.0");

      isCompatibleExtension = di.inject(isCompatibleExtensionInjectable);
    });

    it("an extension specifying '5.5.0' is compatible", () => {
      expect(isCompatibleExtension("5.5.0")).toBe(true);
    });

    it("an extension specifying '5.5' is compatible", () => {
      expect(isCompatibleExtension("5.5")).toBe(true);
    });

    it("an extension specifying '6.0.0' is not compatible", () => {
      expect(isCompatibleExtension("6.0.0")).toBe(false);
    });
  });

  describe("when extension API version is 5.5.5", () => {
    let isCompatibleExtension: IsCompatibleExtension;

    beforeEach(() => {
      di.override(extensionApiVersionInjectable, () => "5.5.5");

      isCompatibleExtension = di.inject(isCompatibleExtensionInjectable);
    });

    it("an extension specifying '5.5.0' is compatible", () => {
      expect(isCompatibleExtension("5.5.0")).toBe(true);
    });

    it("an extension specifying '5.5' is compatible", () => {
      expect(isCompatibleExtension("5.5")).toBe(true);
    });

    it("an extension specifying '6.0.0' is not compatible", () => {
      expect(isCompatibleExtension("6.0.0")).toBe(false);
    });
  });

  describe("when extension API version is 5.6.0", () => {
    let isCompatibleExtension: IsCompatibleExtension;

    beforeEach(() => {
      di.override(extensionApiVersionInjectable, () => "5.6.0");

      isCompatibleExtension = di.inject(isCompatibleExtensionInjectable);
    });

    it("an extension specifying '5.5.0' is compatible", () => {
      expect(isCompatibleExtension("5.5.0")).toBe(true);
    });

    it("an extension specifying '5.5' is compatible", () => {
      expect(isCompatibleExtension("5.5")).toBe(true);
    });
  });

  describe("when extension API version is 6.0.0", () => {
    let isCompatibleExtension: IsCompatibleExtension;

    beforeEach(() => {
      di.override(extensionApiVersionInjectable, () => "6.0.0");

      isCompatibleExtension = di.inject(isCompatibleExtensionInjectable);
    });

    it("an extension specifying '5.5.0' is not compatible", () => {
      expect(isCompatibleExtension("5.5.0")).toBe(false);
    });

    it("an extension specifying '5.5' is not compatible", () => {
      expect(isCompatibleExtension("5.5")).toBe(false);
    });

    it("throws an error when the manifest lens version is invalid format", () => {
      expect(() => isCompatibleExtension(">=2.0")).toThrow(/Invalid format/i);
      expect(() => isCompatibleExtension("~2.0")).toThrow(/Invalid format/i);
      expect(() => isCompatibleExtension("*")).toThrow(/Invalid format/i);
    });
  });
});
