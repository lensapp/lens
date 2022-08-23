/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { observe, runInAction } from "mobx";
import type { ApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import createSyncBoxInjectable from "./create-sync-box.injectable";
import type { SyncBox } from "./sync-box-injection-token";
import { syncBoxInjectionToken } from "./sync-box-injection-token";

describe("sync-box", () => {
  let applicationBuilder: ApplicationBuilder;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeApplicationStart(mainDi => {
      mainDi.register(someInjectable);
    });

    applicationBuilder.beforeWindowStart((windowDi) => {
      windowDi.register(someInjectable);
    });
  });

  describe("given application is started, when value is set in main", () => {
    let valueInMain: string;
    let syncBoxInMain: SyncBox<string>;

    beforeEach(async () => {
      await applicationBuilder.startHidden();

      syncBoxInMain = applicationBuilder.mainDi.inject(someInjectable);

      observe(syncBoxInMain.value, ({ newValue }) => {
        valueInMain = newValue as string;
      }, true);

      runInAction(() => {
        syncBoxInMain.set("some-value-from-main");
      });
    });

    it("knows value in main", () => {
      expect(valueInMain).toBe("some-value-from-main");
    });

    describe("when window starts", () => {
      let valueInRenderer: string;
      let syncBoxInRenderer: SyncBox<string>;
      let rendererDi: DiContainer;

      beforeEach(async () => {
        const applicationWindow =
          applicationBuilder.applicationWindow.create("some-window-id");

        await applicationWindow.start();

        rendererDi = applicationWindow.di;

        syncBoxInRenderer = rendererDi.inject(someInjectable);

        observe(syncBoxInRenderer.value, ({ newValue }) => {
          valueInRenderer = newValue as string;
        }, true);
      });

      it("has the value from main", () => {
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

  describe("when application starts with a window", () => {
    let valueInRenderer: string;
    let valueInMain: string;
    let syncBoxInMain: SyncBox<string>;
    let syncBoxInRenderer: SyncBox<string>;

    beforeEach(async () => {
      await applicationBuilder.render();

      const applicationWindow = applicationBuilder.applicationWindow.only;

      syncBoxInMain = applicationBuilder.mainDi.inject(someInjectable);
      syncBoxInRenderer = applicationWindow.di.inject(someInjectable);

      observe(syncBoxInRenderer.value, ({ newValue }) => {
        valueInRenderer = newValue as string;
      }, true);

      observe(syncBoxInMain.value, ({ newValue }) => {
        valueInMain = newValue as string;
      }, true);
    });

    it("knows initial value in main", () => {
      expect(valueInMain).toBe("some-initial-value");
    });

    it("knows initial value in renderer", () => {
      expect(valueInRenderer).toBe("some-initial-value");
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

const someInjectable = getInjectable({
  id: "some-injectable",

  instantiate: (di) => {
    const createSyncBox = di.inject(createSyncBoxInjectable);

    return createSyncBox("some-sync-box", "some-initial-value");
  },

  injectionToken: syncBoxInjectionToken,
});
