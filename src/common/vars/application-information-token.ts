/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type packageJson from "../../../package.json";

export type ApplicationInformation = Pick<typeof packageJson, "version" | "productName" | "copyright" | "description" | "name"> & {
  build: Partial<typeof packageJson["build"]> & { publish?: unknown[] };
  config: typeof packageJson["config"] & { extensions?: string[] };
};

const applicationInformationToken = getInjectionToken<ApplicationInformation>({
  id: "application-information-token",
});

export default applicationInformationToken;
