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
import { CatalogEntityDetails } from "./catalog-entity-details";
import { CatalogEntityItem } from "./catalog-entity-item";
import { CatalogEntityDetailRegistry } from "../../../extensions/registries";

// avoid TypeError: window.requestIdleCallback is not a function
import { mockWindow } from "../../../../__mocks__/windowMock";

mockWindow();

describe("<CatalogEntityDetails />", () => {

  beforeEach(() => {
    CatalogEntityDetailRegistry.createInstance();
  });

  it("trigger onRun when click on detail panel icon", () => {
    const onRun = jest.fn();

    const item = new CatalogEntityItem({
      enabled: true,
      apiVersion: "",
      kind: "",
      metadata: {
        uid: "",
        name: "",
        labels: {},
      },
      status: {
        phase: "",
      },
      spec: {},
      getId: () => "",
      getName: () => "",
      onContextMenuOpen: () => {},
      onSettingsOpen: () => {},
      onRun,
    });

    render(
      <CatalogEntityDetails
			  item={item}
        hideDetails={() => {}}
      />
    );

    userEvent.click(screen.getByTestId("detail-panel-hot-bar-icon"));

    expect(onRun).toHaveBeenCalledTimes(1);
  });

  it("prioritize onClickDetailIcon over onRun", () => {
    const onRun = jest.fn();
    const onClickDetailIcon = jest.fn();

    const item = new CatalogEntityItem({
      enabled: true,
      apiVersion: "",
      kind: "",
      metadata: {
        uid: "",
        name: "",
        labels: {},
      },
      status: {
        phase: "",
      },
      spec: {},
      getId: () => "",
      getName: () => "",
      onContextMenuOpen: () => {},
      onSettingsOpen: () => {},
      onRun,
      onClickDetailIcon,
    });

    render(
      <CatalogEntityDetails
			  item={item}
        hideDetails={() => {}}
      />
    );

    userEvent.click(screen.getByTestId("detail-panel-hot-bar-icon"));

    expect(onRun).toHaveBeenCalledTimes(0);
    expect(onClickDetailIcon).toHaveBeenCalledTimes(1);
  });
});

