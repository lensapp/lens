/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { SingleOrMany } from "@k8slens/utilities";
import { render } from "@testing-library/react";
import React from "react";
import { withTooltip } from "./withTooltip";

type MyComponentProps = {
  text: string;
  id?: string;
  children?: SingleOrMany<React.ReactNode>;
};

const MyComponent = withTooltip(({ text }: MyComponentProps) => <div>{text}</div>);

describe("withTooltip tests", () => {
  it("does not render a tooltip when not specified", () => {
    const result = render(<MyComponent text="foobar" />);

    expect(result.baseElement).toMatchSnapshot();
  });

  it("renders a tooltip when specified", () => {
    const result = render(<MyComponent text="foobar" tooltip="my-tooltip" id="bat" />);

    expect(result.baseElement).toMatchSnapshot();
  });

  it("renders a tooltip when specified via tooltip props", () => {
    const result = render(
      <MyComponent text="foobar" tooltip={{ children: "my-tooltip" }} id="bat" />,
    );

    expect(result.baseElement).toMatchSnapshot();
  });

  it("renders a tooltip when specified without id", () => {
    const result = render(<MyComponent text="foobar" tooltip="my-tooltip" />);

    expect(result.baseElement).toMatchSnapshot();
  });
});
