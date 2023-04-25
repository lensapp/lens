/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { GetSingleElement } from "@k8slens/react-testing-library-discovery";
import { getSingleElement } from "@k8slens/react-testing-library-discovery";
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import navigateToPreferencesInjectable from "../preferences/common/navigate-to-preferences.injectable";
import updatingIsEnabledInjectable from "./child-features/updating-is-enabled/main/updating-is-enabled.injectable";

describe("hiding Update Channel preference with updating is not enabled", () => {
  let builder: ApplicationBuilder;
  let result: RenderResult;
  let getElement: GetSingleElement;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    builder.mainDi.override(updatingIsEnabledInjectable, () => false);

    result = await builder.render();

    getElement = getSingleElement(() => result);
    builder.navigateWith(navigateToPreferencesInjectable);
  });

  it("renders", () => {
    expect(result.baseElement).toMatchSnapshot();
  });

  it("shows the application settings", () => {
    expect(getElement("preference-page", "application-page").discovered).toBeInTheDocument();
  });

  it("does not show the update channel preference", () => {
    expect(() => getElement("preference-item", "update-channel")).toThrowError(`Couldn't find HTML-element with attribute "data-preference-item-test" with value "update-channel".`);
  });
});

describe("showing Update Channel preference with updating is enabled", () => {
  let builder: ApplicationBuilder;
  let result: RenderResult;
  let getElement: GetSingleElement;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    builder.mainDi.override(updatingIsEnabledInjectable, () => true);

    result = await builder.render();

    getElement = getSingleElement(() => result);
    builder.navigateWith(navigateToPreferencesInjectable);
  });

  it("renders", () => {
    expect(result.baseElement).toMatchSnapshot();
  });

  it("shows the application settings", () => {
    expect(getElement("preference-page", "application-page").discovered).toBeInTheDocument();
  });

  it("does show the update channel preference", () => {
    expect(getElement("preference-item", "update-channel").discovered).toBeInTheDocument();
  });
});
