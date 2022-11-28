/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import type { CatalogCategorySpec } from "../../../../common/catalog";
import { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import { CatalogCategory } from "../../../api/catalog-entity";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import type { AdditionalCategoryColumnRegistration, CategoryColumnRegistration } from "../custom-category-columns";
import type { CategoryColumns, GetCategoryColumnsParams } from "../columns/get.injectable";
import getCategoryColumnsInjectable from "../columns/get.injectable";
import hotbarStoreInjectable from "../../../../common/hotbars/store.injectable";
import extensionInjectable from "../../../../extensions/extension-loader/extension/extension.injectable";

class TestCategory extends CatalogCategory {
  apiVersion = "catalog.k8slens.dev/v1alpha1";
  kind = "CatalogCategory";
  metadata = {
    name: "Test",
    icon: "question_mark",
  };
  spec: CatalogCategorySpec = {
    group: "foo.bar.bat",
    names: {
      kind: "Test",
    },
    versions: [],
  };

  constructor(columns?: CategoryColumnRegistration[]) {
    super();
    this.spec = {
      displayColumns: columns,
      ...this.spec,
    };
  }
}

describe("Custom Category Columns", () => {
  let di: DiContainer;
  let getCategoryColumns: (params: GetCategoryColumnsParams) => CategoryColumns;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(hotbarStoreInjectable, () => ({}));
    getCategoryColumns = di.inject(getCategoryColumnsInjectable);
  });

  describe("without extensions", () => {
    it("should contain a kind column if activeCategory is falsy", () => {
      expect(getCategoryColumns({ activeCategory: null }).renderTableHeader.find(elem => elem?.title === "Kind")).toBeTruthy();
    });

    it("should not contain a kind column if activeCategory is truthy", () => {
      expect(getCategoryColumns({ activeCategory: new TestCategory() }).renderTableHeader.find(elem => elem?.title === "Kind")).toBeFalsy();
    });

    it("should include the default columns if the provided category doesn't provide any", () => {
      expect(getCategoryColumns({ activeCategory: new TestCategory() }).renderTableHeader.find(elem => elem?.title === "Source")).toBeTruthy();
    });

    it("should not include the default columns if the provided category provides any", () => {
      expect(getCategoryColumns({ activeCategory: new TestCategory([]) }).renderTableHeader.find(elem => elem?.title === "Source")).toBeFalsy();
    });

    it("should include the displayColumns from the provided category", () => {
      const columns: CategoryColumnRegistration[] = [
        {
          id: "foo",
          renderCell: () => null,
          titleProps: {
            title: "Foo",
          },
        },
      ];

      expect(getCategoryColumns({ activeCategory: new TestCategory(columns) }).renderTableHeader.find(elem => elem?.title === "Foo")).toBeTruthy();
    });
  });

  describe("with extensions", () => {
    beforeEach(() => {
      const ext = di.inject(extensionInjectable, new (class extends LensRendererExtension {
        additionalCategoryColumns = [
            {
              group: "foo.bar.bat",
              id: "high",
              kind: "Test",
              renderCell: () => "",
              titleProps: {
                title: "High",
              },
            } as AdditionalCategoryColumnRegistration,
            {
              group: "foo.bar",
              id: "high",
              kind: "Test",
              renderCell: () => "",
              titleProps: {
                title: "High2",
              },
            } as AdditionalCategoryColumnRegistration,
        ];
      })({
        absolutePath: "/some-absolute-path",
        id: "some-id",
        isBundled: false,
        isCompatible: true,
        isEnabled: true,
        manifest: {
          engines: {
            lens: "",
          },
          name: "some-extension-name",
          version: "1.0.0",
        },
        manifestPath: "/some-manifest-path",
      }));

      ext.register();
    });

    it("should include columns from extensions that match", () => {
      expect(getCategoryColumns({ activeCategory: new TestCategory() }).renderTableHeader.find(elem => elem?.title === "High")).toBeTruthy();
    });

    it("should not include columns from extensions that don't match", () => {
      expect(getCategoryColumns({ activeCategory: new TestCategory() }).renderTableHeader.find(elem => elem?.title === "High2")).toBeFalsy();
    });
  });
});
