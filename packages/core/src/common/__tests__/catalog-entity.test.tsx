/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { CatalogCategory } from "../catalog";
import type { CatalogCategorySpec } from "../catalog";

class TestCatalogCategoryWithoutBadge extends CatalogCategory {
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

class TestCatalogCategoryWithBadge extends TestCatalogCategoryWithoutBadge {
  getBadge() {
    return (<div>Test Badge</div>);
  }
}

describe("CatalogCategory", () => {
  it("returns name", () => {
    const category = new TestCatalogCategoryWithoutBadge();

    expect(category.getName()).toEqual("Test Category");
  });

  it("doesn't return badge by default", () => {
    const category = new TestCatalogCategoryWithoutBadge();

    expect(category.getBadge()).toEqual(null);
  });

  it("returns a badge", () => {
    const category = new TestCatalogCategoryWithBadge();

    expect(category.getBadge()).toBeTruthy();
  });
});
