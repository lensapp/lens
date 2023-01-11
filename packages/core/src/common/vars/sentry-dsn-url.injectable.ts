/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationInformationToken from "./application-information-token";

const sentryDataSourceNameInjectable = getInjectable({
  id: "sentry-data-source-name",
  instantiate: (di) => di.inject(applicationInformationToken).config.sentryDsn,
});

export default sentryDataSourceNameInjectable;
