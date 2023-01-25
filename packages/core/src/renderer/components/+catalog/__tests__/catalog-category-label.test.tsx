/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { render, screen } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom/extend-expect";
import type { CatalogCategorySpec } from "../../../../common/catalog";
import { CatalogCategory } from "../../../../common/catalog";
import { CatalogCategoryLabel } from "../catalog-category-label";

class CatalogCategoryWithoutBadge extends CatalogCategory {
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

class CatalogCategoryWithBadge extends CatalogCategoryWithoutBadge {
  getBadge() {
    return (<div>Test Badge</div>);
  }
}

describe("CatalogCategoryLabel", () => {
  it("renders without a badge", async () => {
    const category = new CatalogCategoryWithoutBadge();

    render(<CatalogCategoryLabel category={category}/>);

    expect(await screen.findByText("Test Category")).toBeInTheDocument();
  });

  it("renders with a badge", async () => {
    const category = new CatalogCategoryWithBadge();

    render(<CatalogCategoryLabel category={category}/>);

    expect(await screen.findByText("Test Category")).toBeInTheDocument();
    expect(await screen.findByText("Test Badge")).toBeInTheDocument();
  });
});
