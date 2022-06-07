/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observe, runInAction } from "mobx";
import type { ApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import createSyncBoxInjectable from "./create-sync-box.injectable";
import { flushPromises } from "../../test-utils/flush-promises";
import type { SyncBox } from "./sync-box-injection-token";

describe("sync-box", () => {
  let applicationBuilder: ApplicationBuilder;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.dis.mainDi.register(someInjectable);
    applicationBuilder.dis.rendererDi.register(someInjectable);
  });

  // TODO: Separate starting for main application and starting of window in application builder
  xdescribe("given application is started, when value is set in main", () => {
    let valueInMain: string;
    let syncBoxInMain: SyncBox<string>;

    beforeEach(async () => {
      syncBoxInMain = applicationBuilder.dis.mainDi.inject(someInjectable);

      // await applicationBuilder.start();

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

      beforeEach(() => {
        // applicationBuilder.renderWindow()

        syncBoxInRenderer = applicationBuilder.dis.rendererDi.inject(someInjectable);

        observe(syncBoxInRenderer.value, ({ newValue }) => {
          valueInRenderer = newValue as string;
        }, true);
      });

      it("does not have the initial value yet", () => {
        expect(valueInRenderer).toBe(undefined);
      });

      describe("when getting initial value resolves", () => {
        beforeEach(async () => {
          await flushPromises();
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

      describe("when value is set from renderer before getting initial value from main resolves", () => {
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
      syncBoxInMain = applicationBuilder.dis.mainDi.inject(someInjectable);
      syncBoxInRenderer = applicationBuilder.dis.rendererDi.inject(someInjectable);

      await applicationBuilder.render();

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
});
