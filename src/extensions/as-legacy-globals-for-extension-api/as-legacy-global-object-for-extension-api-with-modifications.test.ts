/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import {
  createContainer,
  DiContainer,
  getInjectable,
  Injectable,
} from "@ogre-tools/injectable";
import { setLegacyGlobalDiForExtensionApi } from "./legacy-global-di-for-extension-api";
import { asLegacyGlobalObjectForExtensionApiWithModifications } from "./as-legacy-global-object-for-extension-api-with-modifications";

describe("asLegacyGlobalObjectForExtensionApiWithModifications", () => {
  describe("given legacy global object", () => {
    let di: DiContainer;
    let someInjectable: Injectable<{ someProperty: string }, unknown, void>;
    let actual: { someProperty: string } & {
      someModificationProperty: string;
    };

    beforeEach(() => {
      di = createContainer();

      jest.spyOn(di, "inject");

      setLegacyGlobalDiForExtensionApi(di);

      someInjectable = getInjectable({
        id: "some-injectable",
        instantiate: () => ({
          someProperty: "some-property-value",
        }),
      });

      di.register(someInjectable);

      actual = asLegacyGlobalObjectForExtensionApiWithModifications(
        someInjectable,
        { someModificationProperty: "some-modification-value" },
      );
    });

    it("when not accessed, does not inject yet", () => {
      expect(di.inject).not.toHaveBeenCalled();
    });

    describe("when a property of global is accessed, ", () => {
      let actualPropertyValue: string;

      beforeEach(() => {
        actualPropertyValue = actual.someProperty;
      });

      it("injects the injectable for global", () => {
        expect(di.inject).toHaveBeenCalledWith(someInjectable, undefined);
      });

      it("global has property of injectable", () => {
        expect(actualPropertyValue).toBe("some-property-value");
      });
    });

    describe("when a property of modification is accessed, ", () => {
      let actualModificationValue: string;

      beforeEach(() => {
        actualModificationValue = actual.someModificationProperty;
      });

      it("injects the injectable for global", () => {
        expect(di.inject).toHaveBeenCalledWith(someInjectable, undefined);
      });

      it("global has property of modification", () => {
        expect(actualModificationValue).toBe("some-modification-value");
      });
    });
  });
});
