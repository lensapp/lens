/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { CatalogCategorySpec } from "../../../../common/catalog";
import { CatalogCategory } from "../../../../common/catalog";
import { CatalogAddButton } from "../catalog-add-button";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { type DiRender, renderFor } from "../../test-utils/renderFor";

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

describe("CatalogAddButton", () => {
  let render: DiRender;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    render = renderFor(di);
  });

  it("opens Add menu", async () => {
    const category = new TestCatalogCategory();

    category.on("catalogAddMenu", ctx => {
      ctx.menuItems.push(
        {
          icon: "text_snippet",
          title: "Add from kubeconfig",
          onClick: () => {},
        },
      );
    });

    render(<CatalogAddButton category={category}/>);

    userEvent.hover(screen.getByLabelText("SpeedDial CatalogAddButton"));
    await screen.findByTitle("Add from kubeconfig");
  });

  it("filters menu items", async () => {
    const category = new TestCatalogCategory();

    category.on("catalogAddMenu", ctx => {
      ctx.menuItems.push(
        {
          icon: "text_snippet",
          title: "foobar",
          onClick: () => {},
        },
      );
      ctx.menuItems.push(
        {
          icon: "text_snippet",
          title: "Add from kubeconfig",
          onClick: () => {},
        },
      );
    });

    category.addMenuFilter(item => item.title === "foobar");

    render(<CatalogAddButton category={category}/>);

    userEvent.hover(screen.getByLabelText("SpeedDial CatalogAddButton"));

    await expect(screen.findByTitle("Add from kubeconfig"))
      .rejects
      .toThrow();
    await screen.findByTitle("foobar");
  });
});
