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
import { DiRender, renderFor } from "../../test-utils/renderFor";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import { AppPreferenceRegistry } from "../../../../extensions/registries";
import "@testing-library/jest-dom/extend-expect";
import { LensExtension } from "../../../../extensions/lens-extension";
import { ExtensionSettingsPage } from "../extension-settings-page";
import { createMemoryHistory, createLocation } from "history";
import type { match } from "react-router";
import { extensionSettingsRoute, extensionSettingsURL } from "../../../../common/routes";

const history = createMemoryHistory();
const url = extensionSettingsURL({
  params: {
    extensionId: encodeURIComponent("@k8slens/crd-example"),
  },
});
const routeMatch: match<{ extensionId: string }> = {
  isExact: true,
  path: extensionSettingsRoute.path as string,
  url,
  params: { extensionId: "@k8slens/crd-example" },
};
const location = createLocation(routeMatch.url);

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
};

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
};

describe("<ExtensionSettingsPage/>", () => {
  let di: ConfigurableDependencyInjectionContainer;
  let render: DiRender;

  beforeEach(() => {
    di = getDiForUnitTesting();
    render = renderFor(di);

    AppPreferenceRegistry.createInstance();
    AppPreferenceRegistry.getInstance().add([
      {
        components: {
          Input: () => <input data-testid="crd-name"/>,
          Hint: () => <div>choose crd name</div>,
        },
        extensionId: "@k8slens/crd-example",
        title: "CRD Preferences",
      },
      {
        components: {
          Input: () => <input type="checkbox" data-testid="save-to-file"/>,
          Hint: () => <div>save to file</div>,
        },
        extensionId: "@k8slens/crd-example",
        title: "Filesystem",
      },
    ], new LensExtension(crdExtension));
    AppPreferenceRegistry.getInstance().add([
      {
        components: {
          Input: () => <input data-testid="sample-entity-name"/>,
          Hint: () => <div>sample hint</div>,
        },
        extensionId: "@k8slens/sample",
        title: "Sample preferences",
      },
    ], new LensExtension(sampleExtension));
  });

  afterEach(() => {
    AppPreferenceRegistry.resetInstance();
  });

  it("renders w/o errors", () => {
    const { container } = render(<ExtensionSettingsPage history={history} location={location} match={routeMatch}/>);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("gets extension id from the URL", () => {
    const { getByText } = render(<ExtensionSettingsPage history={history} location={location} match={routeMatch}/>);

    expect(getByText("@k8slens/crd-example settings")).toBeInTheDocument();
  });

  it("renders only settings from specified extension", () => {
    const { getByText, getByTestId, queryByTestId, queryByText } = render(<ExtensionSettingsPage history={history} location={location} match={routeMatch}/>);

    expect(getByText("CRD Preferences")).toBeInTheDocument();
    expect(getByText("Filesystem")).toBeInTheDocument();
    expect(getByText("choose crd name")).toBeInTheDocument();
    expect(getByText("save to file")).toBeInTheDocument();
    expect(getByTestId("crd-name")).toBeInTheDocument();
    expect(getByTestId("save-to-file")).toBeInTheDocument();

    expect(queryByTestId("sample-entity-name")).not.toBeInTheDocument();
    expect(queryByText("Sample preferences")).not.toBeInTheDocument();
    expect(queryByText("sample hint")).not.toBeInTheDocument();
  });

  it("renders error message if no settings found by id", () => {
    const location = createLocation("/preferences/extension-settings/invalid-url");
    const { getByText } = render(<ExtensionSettingsPage history={history} location={location} match={routeMatch}/>);

    expect(getByText("No settings found")).toBeInTheDocument();
  });

  it("renders error message if no extension id passed in URL", () => {
    const location = createLocation("/preferences/extension-settings");
    const { getByText } = render(<ExtensionSettingsPage history={history} location={location} match={routeMatch}/>);

    expect(getByText("No extension id provided in URL")).toBeInTheDocument();
  });
});
