/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sentryDsn } from "../../../common/vars";

const sentryDnsUrlInjectable = getInjectable({
  id: "sentry-dns-url",
  instantiate: () => sentryDsn,
});

export default sentryDnsUrlInjectable;
