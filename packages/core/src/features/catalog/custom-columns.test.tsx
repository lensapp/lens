/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import { CatalogCategory, type CatalogCategorySpec, type CategoryColumnRegistration } from "../../common/catalog";
import catalogCategoryRegistryInjectable from "../../common/catalog/category-registry.injectable";
import navigateToCatalogInjectable from "../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("custom category columns for catalog", () => {
  let builder: ApplicationBuilder;
  let renderResult: RenderResult;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    renderResult = await builder.render();

    const navigateToCatalog = builder.applicationWindow.only.di.inject(navigateToCatalogInjectable);

    navigateToCatalog();
  });

  it("renders", () => {
    expect(renderResult.baseElement).toMatchSnapshot();
  });

  it("shows 'Browse All' view", () => {
    expect(renderResult.queryByTestId("catalog-list-for-browse-all")).toBeInTheDocument();
  });

  it("should show the 'Kind' column", () => {
    expect(renderResult.queryByTestId("browse-all-category-column")).toBeInTheDocument();
  });

  describe("when category is added using default colemns", () => {
    beforeEach(() => {
      const catalogCategoryRegistry = builder.applicationWindow.only.di.inject(catalogCategoryRegistryInjectable);

      catalogCategoryRegistry.add(new TestCategory());
    });

    it("renders", () => {
      expect(renderResult.baseElement).toMatchSnapshot();
    });

    it("shows category in sidebar", () => {
      expect(renderResult.queryByTestId("foo.bar.bat/Test-tab")).toBeInTheDocument();
    });

    it("still shows 'Browse All' view", () => {
      expect(renderResult.queryByTestId("catalog-list-for-browse-all")).toBeInTheDocument();
    });

    describe.only("when the Test category tab is clicked", () => {
      beforeEach(async () => {
        const testCategory = renderResult.getByTestId("foo.bar.bat/Test-tab");

        testCategory.click();
      });

      it("renders", () => {
        expect(renderResult.baseElement).toMatchSnapshot();
      });

      it.only("shows view for category", () => {
        expect(renderResult.queryByTestId("catalog-list-for-Test")).toBeInTheDocument();
      });
    });
  });
});

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
