/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BundledExtensionParser } from "../bundled-extension-parser";
import fetchMock from "fetch-mock";

fetchMock.config.overwriteRoutes = true;

describe("BundledExtensionParser", () => {
  afterAll(() => {
    fetchMock.reset();
  });

  it("Should return empty arrays if no url passed", async () => {
    const lists = await new BundledExtensionParser("5.4.0-latest12345", "").getExtensionLists();

    expect(lists).toEqual({
      release: [],
      available: [],
    });
  });

  it("Should return empty releases array if no release json found", async () => {
    fetchMock
      .get("http://my-example-url.com/versions.json", [ { "node-menu": "0.0.1" } ] )
      .get("http://my-example-url.com/5.4.0-latest12345.json", 408 );


    const lists = await new BundledExtensionParser("5.4.0-latest12345", "http://my-example-url.com").getExtensionLists();

    expect(lists).toEqual({
      release: [],
      available: [{ "node-menu": "0.0.1" }],
    });
  });

  it("Should return empty available array if no versions json found", async () => {
    fetchMock
      .get("http://my-example-url.com/versions.json", 408 )
      .get("http://my-example-url.com/5.4.0-latest12345.json", [ { "node-menu": "0.0.1" } ]);


    const lists = await new BundledExtensionParser("5.4.0-latest12345", "http://my-example-url.com").getExtensionLists();

    expect(lists).toEqual({
      release: [{ "node-menu": "0.0.1" }],
      available: [],
    });
  });

  it("Should return proper lists for both release.json and version.json files", async () => {
    fetchMock
      .get("http://my-example-url.com/versions.json", [
        { "node-menu": "0.0.1" },
        { "survey": "0.1.1" },
      ])
      .get("http://my-example-url.com/5.4.0-latest12345.json", [
        { "node-menu": "0.0.1" },
        { "survey": "0.0.1" },
      ]);


    const lists = await new BundledExtensionParser("5.4.0-latest12345", "http://my-example-url.com").getExtensionLists();

    expect(lists).toEqual({
      release: [
        { "node-menu": "0.0.1" },
        { "survey": "0.0.1" },
      ],
      available: [
        { "node-menu": "0.0.1" },
        { "survey": "0.1.1" },
      ],
    });
  });
});
