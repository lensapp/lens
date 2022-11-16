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

    expect(result.queryByTestId("my-icon")).toBeInTheDocument();
  });

  it("should render an <Icon> with https href", () => {
    const result = render((
      <Icon
        data-testid="my-icon"
        href="https://localhost"
      />
    ));

    expect(result.queryByTestId("my-icon")).toBeInTheDocument();
  });

  it("should warn about ws hrefs", () => {
    const result = render((
      <Icon
        data-testid="my-icon"
        href="ws://localhost"
      />
    ));

    expect(result.queryByTestId("my-icon")).not.toBeInTheDocument();
    expect(logger.warn).toBeCalled();
  });

  it("should warn about javascript: hrefs", () => {
    const result = render((
      <Icon
        data-testid="my-icon"
        href="javascript:void 0"
      />
    ));

    expect(result.queryByTestId("my-icon")).not.toBeInTheDocument();
    expect(logger.warn).toBeCalled();
  });
});
