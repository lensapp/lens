/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import appVersionInjectable from "../../../common/get-configuration-file-model/app-version/app-version.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import appPublishDateInjectable from "../app-publish-date.injectable";

describe("appPublishDate", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });
  });

  it("should return empty string if appVersion is not provided", () => {
    di.override(appVersionInjectable, () => "");

    const appPublishDate = di.inject(appPublishDateInjectable);

    expect(appPublishDate).toBe("");
  });

  it("should return empty string if version without date provided", () => {
    di.override(appVersionInjectable, () => "5.6.0-alpha.0");

    const appPublishDate = di.inject(appPublishDateInjectable);

    expect(appPublishDate).toBe("");
  });

  it("should return empty string if invalid version date provided", () => {
    di.override(appVersionInjectable, () => "5.6.0-alpha.2021-23-1.0");

    const appPublishDate = di.inject(appPublishDateInjectable);

    expect(appPublishDate).toBe("");
  });

  it("should return proper date if version with date provided", () => {
    di.override(appVersionInjectable, () => "5.4.6-latest.20220428.1");

    const appPublishDate = di.inject(appPublishDateInjectable);

    expect(appPublishDate).toBe("2022-04-28");
  });
});
