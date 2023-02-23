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
    expect(renderResult.queryByTestId("catalog-kind-column")).toBeInTheDocument();
  });

  it("should show the 'Status' column", () => {
    expect(renderResult.queryByTestId("catalog-status-column")).toBeInTheDocument();
  });

  it("should show the 'Labels' column", () => {
    expect(renderResult.queryByTestId("catalog-labels-column")).toBeInTheDocument();
  });

  it("should show the 'Source' column", () => {
    expect(renderResult.queryByTestId("catalog-source-column")).toBeInTheDocument();
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

    describe("when the Test category tab is clicked", () => {
      beforeEach(async () => {
        const testCategory = renderResult.getByTestId("foo.bar.bat/Test-tab");

        testCategory.click();
      });

      it("renders", () => {
        expect(renderResult.baseElement).toMatchSnapshot();
      });

      it("shows view for category", () => {
        expect(renderResult.queryByTestId("catalog-list-for-Test")).toBeInTheDocument();
      });

      it("does not show the 'Kind' column", () => {
        expect(renderResult.queryByTestId("catalog-kind-column")).not.toBeInTheDocument();
      });

      it("should show the 'Status' column", () => {
        expect(renderResult.queryByTestId("catalog-status-column")).toBeInTheDocument();
      });

      it("should show the 'Labels' column", () => {
        expect(renderResult.queryByTestId("catalog-labels-column")).toBeInTheDocument();
      });

      it("should show the 'Source' column", () => {
        expect(renderResult.queryByTestId("catalog-source-column")).toBeInTheDocument();
      });
    });

    describe("when an extension is registered with additional custom columns", () => {
      beforeEach(() => {
        builder.extensions.enable({
          id: "some-id",
          name: "some-name",
          rendererOptions: {
            additionalCategoryColumns: [
              {
                group: "foo.bar.bat",
                id: "high",
                kind: "Test",
                renderCell: () => "",
                titleProps: {
                  title: "High",
                  "data-testid": "my-high-column",
                },
              },
              {
                group: "foo.bar",
                id: "high",
                kind: "Test",
                renderCell: () => "",
                titleProps: {
                  title: "High2",
                  "data-testid": "my-high2-column",
                },
              },
            ],
          },
        });
      });

      describe("when the Test category tab is clicked", () => {
        beforeEach(async () => {
          const testCategory = renderResult.getByTestId("foo.bar.bat/Test-tab");

          testCategory.click();
        });

        it("renders", () => {
          expect(renderResult.baseElement).toMatchSnapshot();
        });

        it("shows view for category", () => {
          expect(renderResult.queryByTestId("catalog-list-for-Test")).toBeInTheDocument();
        });

        it("does not show the 'Kind' column", () => {
          expect(renderResult.queryByTestId("catalog-kind-column")).not.toBeInTheDocument();
        });

        it("should show the 'Status' column", () => {
          expect(renderResult.queryByTestId("catalog-status-column")).toBeInTheDocument();
        });

        it("should show the 'Labels' column", () => {
          expect(renderResult.queryByTestId("catalog-labels-column")).toBeInTheDocument();
        });

        it("should show the 'Source' column", () => {
          expect(renderResult.queryByTestId("catalog-source-column")).toBeInTheDocument();
        });

        it("should show the additional column that matches", () => {
          expect(renderResult.queryByTestId("my-high-column")).toBeInTheDocument();
        });

        it("should not show the additional column that does not match", () => {
          expect(renderResult.queryByTestId("my-high2-column")).not.toBeInTheDocument();
        });
      });
    });
  });

  describe("when category is added with custom columns", () => {
    beforeEach(() => {
      const catalogCategoryRegistry = builder.applicationWindow.only.di.inject(catalogCategoryRegistryInjectable);

      catalogCategoryRegistry.add(new TestCategory([{
        id: "foo",
        renderCell: () => null,
        titleProps: {
          title: "Foo",
          "data-testid": "my-custom-column",
        },
      }]));
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

    describe("when the Test category tab is clicked", () => {
      beforeEach(async () => {
        const testCategory = renderResult.getByTestId("foo.bar.bat/Test-tab");

        testCategory.click();
      });

      it("renders", () => {
        expect(renderResult.baseElement).toMatchSnapshot();
      });

      it("shows view for category", () => {
        expect(renderResult.queryByTestId("catalog-list-for-Test")).toBeInTheDocument();
      });

      it("does not show the 'Kind' column", () => {
        expect(renderResult.queryByTestId("catalog-kind-column")).not.toBeInTheDocument();
      });

      it("does not the 'Status' column", () => {
        expect(renderResult.queryByTestId("catalog-status-column")).not.toBeInTheDocument();
      });

      it("does not the 'Labels' column", () => {
        expect(renderResult.queryByTestId("catalog-labels-column")).not.toBeInTheDocument();
      });

      it("does not the 'Source' column", () => {
        expect(renderResult.queryByTestId("catalog-source-column")).not.toBeInTheDocument();
      });

      it("should show the custom column", () => {
        expect(renderResult.queryByTestId("my-custom-column")).toBeInTheDocument();
      });
    });
  });

  describe("when category is added without default columns", () => {
    beforeEach(() => {
      const catalogCategoryRegistry = builder.applicationWindow.only.di.inject(catalogCategoryRegistryInjectable);

      catalogCategoryRegistry.add(new TestCategory([]));
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

    describe("when the Test category tab is clicked", () => {
      beforeEach(async () => {
        const testCategory = renderResult.getByTestId("foo.bar.bat/Test-tab");

        testCategory.click();
      });

      it("renders", () => {
        expect(renderResult.baseElement).toMatchSnapshot();
      });

      it("shows view for category", () => {
        expect(renderResult.queryByTestId("catalog-list-for-Test")).toBeInTheDocument();
      });

      it("does not show the 'Kind' column", () => {
        expect(renderResult.queryByTestId("catalog-kind-column")).not.toBeInTheDocument();
      });

      it("does not the 'Status' column", () => {
        expect(renderResult.queryByTestId("catalog-status-column")).not.toBeInTheDocument();
      });

      it("does not the 'Labels' column", () => {
        expect(renderResult.queryByTestId("catalog-labels-column")).not.toBeInTheDocument();
      });

      it("does not the 'Source' column", () => {
        expect(renderResult.queryByTestId("catalog-source-column")).not.toBeInTheDocument();
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
