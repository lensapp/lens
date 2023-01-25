/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { Logger } from "../../../common/logger";
import loggerInjectable from "../../../common/logger.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { DiRender } from "../test-utils/renderFor";
import { renderFor } from "../test-utils/renderFor";
import { Icon } from "./icon";

describe("<Icon> href technical tests", () => {
  let render: DiRender;
  let logger: jest.MockedObject<Logger>;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    logger = {
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      silly: jest.fn(),
      warn: jest.fn(),
    };

    di.override(loggerInjectable, () => logger);

    render = renderFor(di);
  });

  it("should render an <Icon> with http href", () => {
    const result = render((
      <Icon
        data-testid="my-icon"
        href="http://localhost"
      />
    ));

    const icon = result.queryByTestId("my-icon");

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("href", "http://localhost");
    expect(logger.warn).not.toBeCalled();
  });

  it("should render an <Icon> with https href", () => {
    const result = render((
      <Icon
        data-testid="my-icon"
        href="https://localhost"
      />
    ));

    const icon = result.queryByTestId("my-icon");

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("href", "https://localhost");
    expect(logger.warn).not.toBeCalled();
  });

  it("should warn about ws hrefs", () => {
    const result = render((
      <Icon
        data-testid="my-icon"
        href="ws://localhost"
      />
    ));

    const icon = result.queryByTestId("my-icon");

    expect(icon).toBeInTheDocument();
    expect(icon).not.toHaveAttribute("href", "ws://localhost");
    expect(logger.warn).toBeCalled();
  });

  it("should warn about javascript: hrefs", () => {
    const result = render((
      <Icon
        data-testid="my-icon"
        href="javascript:void 0"
      />
    ));

    const icon = result.queryByTestId("my-icon");

    expect(icon).toBeInTheDocument();
    expect(icon).not.toHaveAttribute("href", "javascript:void 0");
    expect(logger.warn).toBeCalled();
  });
});
