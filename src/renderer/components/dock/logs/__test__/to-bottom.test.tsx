/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render } from "@testing-library/react";
import { ToBottom } from "../to-bottom";
import { noop } from "../../../../utils";

describe("<ToBottom/>", () => {
  it("renders w/o errors", () => {
    const { container } = render(<ToBottom onClick={noop}/>);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("has 'To bottom' label", () => {
    const { getByText } = render(<ToBottom onClick={noop}/>);

    expect(getByText("To bottom")).toBeInTheDocument();
  });

  it("has a arrow down icon", () => {
    const { getByText } = render(<ToBottom onClick={noop}/>);

    expect(getByText("expand_more")).toBeInTheDocument();
  });

  it("fires an onclick event", () => {
    const callback = jest.fn();
    const { getByText } = render(<ToBottom onClick={callback}/>);

    fireEvent.click(getByText("To bottom"));
    expect(callback).toBeCalled();
  });
});
