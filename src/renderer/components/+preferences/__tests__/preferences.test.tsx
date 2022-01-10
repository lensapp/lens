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
import { LensExtension } from "../../../../extensions/lens-extension";

const extension = {
  id: "/absolute/path/test",
  manifest: {
    name: "@k8slens/test",
    version: "1.2.3",
  },
  absolutePath: "/absolute/path",
  manifestPath: "/symlinked/path/package.json",
  isBundled: false,
  isEnabled: true,
  isCompatible: true,
}

const crdExtension = {
  id: "/absolute/path/crd",
  manifest: {
    name: "@k8slens/crd-example",
    version: "1.2.3",
  },
  absolutePath: "/absolute/path/crd",
  manifestPath: "/symlinked/path/package.json",
  isBundled: false,
  isEnabled: true,
  isCompatible: true,
}

const sampleExtension = {
  id: "/absolute/path/sample",
  manifest: {
    name: "@k8slens/sample",
    version: "1.2.3",
  },
  absolutePath: "/absolute/path/sample",
  manifestPath: "/symlinked/path/package.json",
  isBundled: false,
  isEnabled: true,
  isCompatible: true,
}

describe("Preferences", () => {
  let di: ConfigurableDependencyInjectionContainer;
  let render: DiRender;

  beforeEach(async () => {
    di = getDiForUnitTesting();
    render = renderFor(di);

    AppPreferenceRegistry.createInstance();
    AppPreferenceRegistry.getInstance().add([
      {
        components: {
          Input: () => <div>input</div>,
          Hint: () => <div>hint</div>
        },
        extensionId: "@k8slens/test",
        id: "example-preferences",
        title: "Example Preferences",
      }
    ], new LensExtension(extension));
    AppPreferenceRegistry.getInstance().add([
      {
        components: {
          Input: () => <div>crd input</div>,
          Hint: () => <div>crd hint</div>
        },
        extensionId: "@k8slens/crd-example",
        title: "Example Preferences",
      }
    ], new LensExtension(crdExtension));
    AppPreferenceRegistry.getInstance().add([
      {
        components: {
          Input: () => <div>sample input</div>,
          Hint: () => <div>sample hint</div>
        },
        extensionId: "@k8slens/crd-example",
        title: "Extension with duplicated name",
      }
    ], new LensExtension(crdExtension))
  });

  afterEach(() => {
    AppPreferenceRegistry.resetInstance();
  });

  it("renders w/o errors", () => {
    const { container } = render(<MemoryRouter><Preferences /></MemoryRouter>);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  describe("Extension custom settings", () => {
    it("doesn't render custom settings tabs if no extensions found", () => {
      const { queryByTestId } = render(<MemoryRouter><Preferences /></MemoryRouter>);

      expect(queryByTestId("custom-settings")).not.toBeInTheDocument();
    });

    it("renders custom settings tabs if registered extensions found", () => {
      di.override(userExtensionsInjectable, () => {
        return computed(() => [extension]);
      });

      const { getByTestId } = render(<MemoryRouter><Preferences /></MemoryRouter>);

      expect(getByTestId("custom-settings")).toBeInTheDocument();
    })

    it("renders tabs for each extension having custom settings", () => {
      di.override(userExtensionsInjectable, () => {
        return computed(() => [extension, crdExtension, sampleExtension]);
      });

      const { getByText, queryByText } = render(<MemoryRouter><Preferences /></MemoryRouter>);

      expect(getByText("@k8slens/test")).toBeInTheDocument();
      expect(getByText("@k8slens/crd-example")).toBeInTheDocument();
      expect(queryByText("@k8slens/sample")).not.toBeInTheDocument();
    });

    it("renders extension tab only once", () => {
      di.override(userExtensionsInjectable, () => {
        return computed(() => [crdExtension]);
      });

      const { getAllByText } = render(<MemoryRouter><Preferences /></MemoryRouter>);

      expect(getAllByText("@k8slens/crd-example").length).toBe(1);
    })
  });
});
