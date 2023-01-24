/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import writeJsonFileInjectable from "../../common/fs/write-json-file.injectable";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("shows custom entity names", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    const writeJsonFile = builder.mainDi.inject(writeJsonFileInjectable);

    // Sets up the files
    writeJsonFile("/some-directory-for-app-data/some-product-name/lens-entity-preferences-store.json", {
      entities: [
        ["some-cluster-id", {
          shortName: "some-custom-short-name",
        }],
      ],
    });
    // Sets up the files
    writeJsonFile("/some-directory-for-app-data/some-product-name/lens-hotbar-store.json", {
      hotbars: [
        {
          id: "default",
          name: "Default",
          items: [
            {
              entity: {
                uid: "some-cluster-id",
                name: "some-cluster-name",
              },
            },
            {
              entity: {
                uid: "some-non-existant-cluster-id",
                name: "some-other-cluster-name",
              },
            },
          ],
        },
      ],
      activeHotbarId: "default",
      __internal__: {
        migrations: {
          version: "6.0.0",
        },
      },
    });

    rendered = await builder.render();
  });

  it("renders", () => {
    expect(rendered.baseElement).toMatchSnapshot();
  });

  it("shows the short name from the preferences for the entity that exists", () => {
    expect(rendered.getByText("some-custom-short-name")).toBeInTheDocument();
  });

  it("shows the default short name from the preferences for the entity that does not exist", () => {
    expect(rendered.getByText("soc")).toBeInTheDocument();
  });
});
