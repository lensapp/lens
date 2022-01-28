/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DependencyInjectionContainer } from "@ogre-tools/injectable";
import mockFs from "mock-fs";
import { getDisForUnitTesting } from "../../../test-utils/get-dis-for-unit-testing";
import directoryForUserDataInjectable from "../../app-paths/directory-for-user-data.injectable";
import type { HotbarStore } from "../store";

describe("HotbarStore", () => {
  let hotbarStore: HotbarStore;
  let mainDi: DependencyInjectionContainer;

  beforeEach(async () => {
    const dis = getDisForUnitTesting({ doGeneralOverrides: true });

    mockFs();

    mainDi = dis.mainDi;

    mainDi.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");

    await dis.runSetups();
  });

  beforeEach(() => {
    mockFs({
      "some-directory-for-user-data": {
        "lens-hotbar-store.json": JSON.stringify({}),
      },
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe("load", () => {
    it("loads one hotbar by default", () => {
      expect(hotbarStore.hotbars.length).toEqual(1);
    });
  });

  describe("add", () => {
    it("adds a hotbar", () => {
      hotbarStore.add({ name: "hottest" });
      expect(hotbarStore.hotbars.length).toEqual(2);
    });
  });

  describe("hotbar items", () => {
    it("initially creates 12 empty cells", () => {
      expect(hotbarStore.getActive().items.length).toEqual(12);
    });

    it("initially adds catalog entity as first item", () => {
      expect(hotbarStore.getActive().items[0].entity.name).toEqual("Catalog");
    });
  });

  describe("pre beta-5 migrations", () => {
    beforeEach(() => {
      const mockOpts = {
        "some-directory-for-user-data": {
          "lens-hotbar-store.json": JSON.stringify({
            __internal__: {
              migrations: {
                version: "5.0.0-beta.3",
              },
            },
            "hotbars": [
              {
                "id": "3caac17f-aec2-4723-9694-ad204465d935",
                "name": "myhotbar",
                "items": [
                  {
                    "entity": {
                      "uid": "1dfa26e2ebab15780a3547e9c7fa785c",
                    },
                  },
                  {
                    "entity": {
                      "uid": "55b42c3c7ba3b04193416cda405269a5",
                    },
                  },
                  {
                    "entity": {
                      "uid": "176fd331968660832f62283219d7eb6e",
                    },
                  },
                  {
                    "entity": {
                      "uid": "61c4fb45528840ebad1badc25da41d14",
                      "name": "user1-context",
                      "source": "local",
                    },
                  },
                  {
                    "entity": {
                      "uid": "27d6f99fe9e7548a6e306760bfe19969",
                      "name": "foo2",
                      "source": "local",
                    },
                  },
                  null,
                  {
                    "entity": {
                      "uid": "c0b20040646849bb4dcf773e43a0bf27",
                      "name": "multinode-demo",
                      "source": "local",
                    },
                  },
                  null,
                  null,
                  null,
                  null,
                  null,
                ],
              },
            ],
          }),
        },
      };

      mockFs(mockOpts);
    });

    afterEach(() => {
      mockFs.restore();
    });

    it("allows to retrieve a hotbar", () => {
      const hotbar = hotbarStore.getById("3caac17f-aec2-4723-9694-ad204465d935");

      expect(hotbar.id).toBe("3caac17f-aec2-4723-9694-ad204465d935");
    });

    it("clears cells without entity", () => {
      const items = hotbarStore.hotbars[0].items;

      expect(items[2]).toBeNull();
    });

    it("adds extra data to cells with according entity", () => {
      const items = hotbarStore.hotbars[0].items;

      expect(items[0]).toEqual({
        entity: {
          name: "mycluster",
          source: "local",
          uid: "1dfa26e2ebab15780a3547e9c7fa785c",
        },
      });

      expect(items[1]).toEqual({
        entity: {
          name: "my_shiny_cluster",
          source: "remote",
          uid: "55b42c3c7ba3b04193416cda405269a5",
        },
      });
    });
  });
});
