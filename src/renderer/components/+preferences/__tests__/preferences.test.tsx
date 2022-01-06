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
import Preferences from "../preferences";
import { DiRender, renderFor } from "../../test-utils/renderFor";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import userExtensionsInjectable from "../../+extensions/user-extensions/user-extensions.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import { AppPreferenceRegistry } from "../../../../extensions/registries";
import { computed } from "mobx";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";

describe("Preferences", () => {
  let di: ConfigurableDependencyInjectionContainer;
  let render: DiRender;

  beforeEach(async () => {
    di = getDiForUnitTesting();
    render = renderFor(di);

    AppPreferenceRegistry.createInstance();
  });

  it("renders w/o errors", () => {
    di.override(userExtensionsInjectable, () => {
      return computed(() => [] as any);
    });

    const { container } = render(<MemoryRouter><Preferences /></MemoryRouter>);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("doesn't render extension settings tabs if no extensions found", () => {
    di.override(userExtensionsInjectable, () => {
      return computed(() => [] as any);
    });

    const { queryByTestId } = render(<MemoryRouter><Preferences /></MemoryRouter>);

    expect(queryByTestId("custom-settings")).not.toBeInTheDocument();
  });
});
