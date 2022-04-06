/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { MetricBar } from ".";

describe("<MetricBar/>", () => {
  it("renders <MetricBar /> w/o errors", async () => {

    const { container } = render(<MetricBar value={50} max={100} />);

    expect(container.querySelector("[data-testid='metric-bar']")).toBeInTheDocument();
  });

  it("shows percent values", () => {
    const { getByText } = render(<MetricBar value={590} max={1589} />);

    expect(getByText("37.13%")).toBeInTheDocument();
  });

  it("doesn't show percent values if no 'showPercent' flag set", () => {
    const { queryByText } = render(<MetricBar value={15} max={100} showPercent={false} />);

    expect(queryByText("15%")).not.toBeInTheDocument();
  });

  it("adds 'warning' class to <VerticalBar/> line", () => {
    const { container } = render(<MetricBar value={86} max={100} warningPercentage={85} />);

    expect(container.querySelector("[data-testid='vertical-bar'] > div")).toHaveClass("warning");
  });

  it("does not adds 'warning' class if 'changeColorOnWarning' not set", () => {
    const { container } = render(<MetricBar value={86} max={100} changeColorOnWarning={false} />);

    expect(container.querySelector("[data-testid='vertical-bar'] > div")).not.toHaveClass("warning");
  });
});
