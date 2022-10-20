/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import { render } from "@testing-library/react";
import React from "react";
import { Map } from "./map";

describe("Map", () => {
  describe("given no items and placeholder", () => {
    let rendered: RenderResult;

    beforeEach(() => {
      rendered = render(
        <Map
          items={[]}
          getPlaceholder={() => (
            <div data-testid="some-placeholder">Some placeholder</div>
          )}
        >
          {() => <div data-testid="some-row">Irrelevant</div>}
        </Map>,
      );
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("renders placeholder", () => {
      expect(rendered.getByTestId("some-placeholder")).toBeInTheDocument();
    });

    it("does not render rows", () => {
      expect(rendered.queryByTestId("some-row")).not.toBeInTheDocument();
    });
  });

  describe("given no items but no placeholder", () => {
    let rendered: RenderResult;

    beforeEach(() => {
      rendered = render(
        <Map items={[]}>
          {() => <div data-testid="some-row">Irrelevant</div>}
        </Map>,
      );
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("does not render rows", () => {
      expect(rendered.queryByTestId("some-row")).not.toBeInTheDocument();
    });
  });

  describe("given items and placeholder but no separator", () => {
    let rendered: RenderResult;

    beforeEach(() => {
      rendered = render(
        <Map
          items={[{ id: "some-item-id" }, { id: "some-other-item-id" }]}
          getPlaceholder={() => (
            <div data-testid="some-placeholder">Some placeholder</div>
          )}
        >
          {(item) => <div data-testid={item.id} />}
        </Map>,
      );
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("does not render placeholder", () => {
      expect(
        rendered.queryByTestId("some-placeholder"),
      ).not.toBeInTheDocument();
    });

    it("renders items", () => {
      expect(rendered.getByTestId("some-item-id")).toBeInTheDocument();
    });
  });

  describe("given more than one item and separator", () => {
    let rendered: RenderResult;

    beforeEach(() => {
      rendered = render(
        <Map
          items={[
            { id: "some-item-id" },
            { id: "some-other-item-id" },
            { id: "some-another-item-id" },
          ]}
          getSeparator={() => <div data-testid="separator">Some separator</div>}
        >
          {(item) => <div data-testid={item.id} />}
        </Map>,
      );
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("renders items", () => {
      expect(rendered.getByTestId("some-item-id")).toBeInTheDocument();
    });

    it("renders separator", () => {
      expect(rendered.getAllByTestId("separator")).toHaveLength(2);
    });
  });

  describe("given more than one item and separator using left and right", () => {
    let rendered: RenderResult;

    beforeEach(() => {
      rendered = render(
        <Map
          items={[
            { id: "some-item-id" },
            { id: "some-other-item-id" },
            { id: "some-another-item-id" },
          ]}
          getSeparator={(left, right) => (
            <div data-testid={`separator-between-${left.id}-and-${right.id}`}>
              Some separator between
              {left.id}
              and
              {right.id}
            </div>
          )}
        >
          {(item) => <div data-testid={item.id} />}
        </Map>,
      );
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("renders items", () => {
      expect(rendered.getByTestId("some-item-id")).toBeInTheDocument();
    });

    it("renders separator", () => {
      expect(rendered.getByTestId("separator-between-some-item-id-and-some-other-item-id")).toBeInTheDocument();
    });
  });
});
