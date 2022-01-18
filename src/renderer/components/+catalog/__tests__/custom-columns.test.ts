/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { CatalogCategorySpec } from "../../../../common/catalog";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import rendererExtensionsInjectable from "../../../../extensions/renderer-extensions.injectable";
import { CatalogCategory } from "../../../api/catalog-entity";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import type { AdditionalCategoryColumnRegistration, CategoryColumnRegistration } from "../custom-category-columns";
import getCategoryColumnsInjectable, { CategoryColumns, GetCategoryColumnsParams } from "../get-category-columns.injectable";

class TestCategory extends CatalogCategory {
  apiVersion: string;
  kind: string;
  metadata: { name: string; icon: string; };
  spec: CatalogCategorySpec = {
    group: "foo.bar.bat",
    names: {
      kind: "Test",
    },
    versions: [],
  };

  constructor(columns?: CategoryColumnRegistration[]) {
    super();
    this.spec.displayColumns = columns;
  }
}

describe("Custom Category Columns", () => {
  let di: ConfigurableDependencyInjectionContainer;

  beforeEach(() => {
    di = getDiForUnitTesting();
  });

  describe("without extensions", () => {
    let getCategoryColumns: (params: GetCategoryColumnsParams) => CategoryColumns;

    beforeEach(() => {
      di.override(rendererExtensionsInjectable, () => computed(() => [] as LensRendererExtension[]));
      getCategoryColumns = di.inject(getCategoryColumnsInjectable);
    });

    it("should contain a kind column if activeCategory is falsy", () => {
      expect(getCategoryColumns({ activeCategory: null }).renderTableHeader.find(elem => elem.title === "Kind")).toBeTruthy();
    });

    it("should not contain a kind column if activeCategory is truthy", () => {
      expect(getCategoryColumns({ activeCategory: new TestCategory() }).renderTableHeader.find(elem => elem.title === "Kind")).toBeFalsy();
    });

    it("should include the default columns if the provided category doesn't provide any", () => {
      expect(getCategoryColumns({ activeCategory: new TestCategory() }).renderTableHeader.find(elem => elem.title === "Source")).toBeTruthy();
    });

    it("should not include the default columns if the provided category provides any", () => {
      expect(getCategoryColumns({ activeCategory: new TestCategory([]) }).renderTableHeader.find(elem => elem.title === "Source")).toBeFalsy();
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

      expect(getCategoryColumns({ activeCategory: new TestCategory(columns) }).renderTableHeader.find(elem => elem.title === "Foo")).toBeTruthy();
    });
  });

  describe("with extensions", () => {
    let getCategoryColumns: (params: GetCategoryColumnsParams) => CategoryColumns;

    beforeEach(() => {
      di.override(rendererExtensionsInjectable, () => computed(() => [
        {
          name: "test-extension",
          additionalCategoryColumns: [
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
          ],
        } as LensRendererExtension,
      ]));
      getCategoryColumns = di.inject(getCategoryColumnsInjectable);
    });

    it("should include columns from extensions that match", () => {
      expect(getCategoryColumns({ activeCategory: new TestCategory() }).renderTableHeader.find(elem => elem.title === "High")).toBeTruthy();
    });

    it("should not include columns from extensions that don't match", () => {
      expect(getCategoryColumns({ activeCategory: new TestCategory() }).renderTableHeader.find(elem => elem.title === "High2")).toBeFalsy();
    });
  });
});
