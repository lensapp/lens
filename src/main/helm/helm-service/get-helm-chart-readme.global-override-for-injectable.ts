/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../../../common/test-utils/get-global-override";
import getHelmChartReadmeInjectable from "./get-helm-chart-readme.injectable";

export default getGlobalOverride(getHelmChartReadmeInjectable, () => () => {
  throw new Error("tried to get a helm chart's readme without overriding");
});
