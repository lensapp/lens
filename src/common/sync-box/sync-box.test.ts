/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observe, runInAction } from "mobx";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { SyncBox } from "./create-sync-box.injectable";
import createSyncBoxInjectable from "./create-sync-box.injectable";
import applicationWindowInjectable from "../../main/start-main-application/lens-window/application-window/application-window.injectable";

describe("sync-box", () => {
  let syncBoxInMain: SyncBox<string>;
  let syncBoxInRenderer: SyncBox<string>;
  let applicationBuilder: ApplicationBuilder;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();

    const someInjectable = getInjectable({
      id: "some-injectable",

      instantiate: (di) => {
        const createSyncBox = di.inject(createSyncBoxInjectable);

        return createSyncBox<string>("some-state");
      },
    });

    applicationBuilder.dis.mainDi.register(someInjectable);
    applicationBuilder.dis.rendererDi.register(someInjectable);

    syncBoxInMain = applicationBuilder.dis.mainDi.inject(someInjectable);
    syncBoxInRenderer = applicationBuilder.dis.rendererDi.inject(someInjectable);
  });

  describe("when application starts", () => {
    beforeEach(() => {

    });

    it("", () => {

    });

    describe("when window starts", () => {
      it("", () => {

      });
    });
  });

  describe("when application starts with a window", () => {
    let valueInRenderer: string;
    let valueInMain: string;

    beforeEach(async () => {
      await applicationBuilder.render();

      const applicationWindow = applicationBuilder.dis.mainDi.inject(
        applicationWindowInjectable,
      );

      await applicationWindow.show();

      observe(syncBoxInRenderer.value, ({ newValue }) => {
        valueInRenderer = newValue as string;
      }, true);

      observe(syncBoxInMain.value, ({ newValue }) => {
        valueInMain = newValue as string;
      }, true);
    });

    it("does not know default value in main", () => {
      expect(valueInMain).toBeUndefined();
    });

    it("does not know default value in renderer", () => {
      expect(valueInRenderer).toBeUndefined();
    });

    describe("when value is set from main", () => {
      beforeEach(() => {
        runInAction(() => {
          syncBoxInMain.set("some-value-from-main");
        });
      });

      it("has value in main", () => {
        expect(valueInMain).toBe("some-value-from-main");
      });

      it("has value in renderer", () => {
        expect(valueInRenderer).toBe("some-value-from-main");
      });

      describe("when value is set from renderer", () => {
        beforeEach(() => {
          runInAction(() => {
            syncBoxInRenderer.set("some-value-from-renderer");
          });
        });

        it("has value in main", () => {
          expect(valueInMain).toBe("some-value-from-renderer");
        });

        it("has value in renderer", () => {
          expect(valueInRenderer).toBe("some-value-from-renderer");
        });
      });
    });
  });
});
