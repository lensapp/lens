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

import { CatalogCategory, CatalogCategoryRegistry, CatalogCategorySpec } from "../catalog";

class TestCatalogCategoryRegistry extends CatalogCategoryRegistry { }

class TestCatalogCategory extends CatalogCategory {
  public readonly apiVersion = "catalog.k8slens.dev/v1alpha1";
  public readonly kind = "CatalogCategory";
  public metadata = {
    name: "Test Category",
    icon: "",
  };
  public spec: CatalogCategorySpec = {
    group: "entity.k8slens.dev",
    versions: [],
    names: {
      kind: "Test",
    },
  };
}

class TestCatalogCategory2 extends CatalogCategory {
  public readonly apiVersion = "catalog.k8slens.dev/v1alpha1";
  public readonly kind = "CatalogCategory";
  public metadata = {
    name: "Test Category 2",
    icon: "",
  };
  public spec: CatalogCategorySpec = {
    group: "entity.k8slens.dev",
    versions: [],
    names: {
      kind: "Test2",
    },
  };
}

describe("CatalogCategoryRegistry", () => {
  it("should remove only the category registered when running the disposer", () => {
    const registry = new TestCatalogCategoryRegistry();

    expect(registry.items.length).toBe(0);

    const d1 = registry.add(new TestCatalogCategory());
    const d2 = registry.add(new TestCatalogCategory2());

    expect(registry.items.length).toBe(2);

    d1();
    expect(registry.items.length).toBe(1);

    d2();
    expect(registry.items.length).toBe(0);
  });

  it("doesn't return items that are filtered out", () => {
    const registry = new TestCatalogCategoryRegistry();

    registry.add(new TestCatalogCategory());
    registry.add(new TestCatalogCategory2());

    expect(registry.items.length).toBe(2);
    expect(registry.filteredItems.length).toBe(2);

    const disposer = registry.addCatalogCategoryFilter(category => category.metadata.name === "Test Category");

    expect(registry.items.length).toBe(2);
    expect(registry.filteredItems.length).toBe(1);

    const disposer2 = registry.addCatalogCategoryFilter(category => category.metadata.name === "foo");

    expect(registry.items.length).toBe(2);
    expect(registry.filteredItems.length).toBe(0);

    disposer();

    expect(registry.items.length).toBe(2);
    expect(registry.filteredItems.length).toBe(0);

    disposer2();

    expect(registry.items.length).toBe(2);
    expect(registry.filteredItems.length).toBe(2);
  });
});
