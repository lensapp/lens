/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import { render } from "@testing-library/react";
import React from "react";
import { VirtualList } from "./virtual-list";

const generateListOfIdObjects = (count: number) => [...new Array(count)].map((v, index) => ({
  getId() {
    return `some-id-${index}`;
  },
}));
const generateListOfRowHeights = (count: number, size: number) => [...new Array(count)].map(() => size);
const renderList = (selectedId?: string) => (
  <VirtualList
    items={generateListOfIdObjects(100)}
    rowHeights={generateListOfRowHeights(100, 15)}
    fixedHeight={45}
    selectedItemId={selectedId}
    getRow={(id) => <div data-testid={id}>{id}</div>}
  />
);

describe("VirtualList", () => {
  let result: RenderResult;

  beforeEach(() => {
    result = render(renderList());
  });

  it("renders", () => {
    expect(result.baseElement).toMatchSnapshot();
  });

  it("shows the first item", () => {
    expect(result.queryByTestId("some-id-0")).toBeInTheDocument();
  });

  it("shows the second item", () => {
    expect(result.queryByTestId("some-id-1")).toBeInTheDocument();
  });

  it("shows the third item", () => {
    expect(result.queryByTestId("some-id-2")).toBeInTheDocument();
  });

  describe("when non-visable item is selected", () => {
    beforeEach(() => {
      result.rerender(renderList("some-id-30"));
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });

    it("shows selected item", () => {
      expect(result.queryByTestId("some-id-30")).toBeInTheDocument();
    });

    it("does not show the first item", () => {
      expect(result.queryByTestId("some-id-0")).not.toBeInTheDocument();
    });
  });

  describe("when visible item is selected", () => {
    beforeEach(() => {
      result.rerender(renderList("some-id-2"));
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });

    it("shows selected item", () => {
      expect(result.queryByTestId("some-id-2")).toBeInTheDocument();
    });
  });
});
