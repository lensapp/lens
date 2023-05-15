/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { Avatar } from "../avatar";
import { Icon } from "@k8slens/icon";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { type DiRender, renderFor } from "../../test-utils/renderFor";

describe("<Avatar/>", () => {
  let render: DiRender;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    render = renderFor(di);
  });

  test("renders w/o errors", () => {
    const { container } = render(<Avatar title="John Ferguson"/>);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  test("shows capital letters from title", () => {
    const { getByText } = render(<Avatar title="John Ferguson"/>);

    expect(getByText("JF")).toBeInTheDocument();
  });

  test("shows custom icon passed as children", () => {
    const { getByTestId } = render(<Avatar title="John Ferguson"><Icon material="alarm" data-testid="alarm-icon"/></Avatar>);

    expect(getByTestId("alarm-icon")).toBeInTheDocument();
  });

  test("shows <img/> element if src prop passed", () => {
    const { getByAltText } = render(<Avatar title="John Ferguson" src="someurl"/>);

    expect(getByAltText("John Ferguson")).toBeInTheDocument();
  });
});
