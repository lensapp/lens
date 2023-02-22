/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { applicationInformationToken } from "@k8slens/application";
import { getInjectable } from "@ogre-tools/injectable";

const sentryDataSourceNameInjectable = getInjectable({
  id: "sentry-data-source-name",
  instantiate: (di) => di.inject(applicationInformationToken).sentryDsn,
});

export default sentryDataSourceNameInjectable;
