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
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CatalogCategory, CatalogCategorySpec } from "../../../../common/catalog";
import { CatalogAddButton } from "../catalog-add-button";

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
