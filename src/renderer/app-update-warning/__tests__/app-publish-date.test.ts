/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import appVersionInjectable from "../../../common/get-configuration-file-model/app-version/app-version.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import appPublishDateInjectable from "../app-publish-date.injectable";

describe("appPublishDate", () => {
  const di = getDiForUnitTesting({ doGeneralOverrides: true });

  it("should return empty string if appVersion is not provided", () => {
    di.override(appVersionInjectable, () => "");

    const appPublishDate = di.inject(appPublishDateInjectable);

    expect(appPublishDate).toBe("");
  });
});
