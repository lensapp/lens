/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationInformationToken from "./application-information-token";

const applicationCopyrightInjectable = getInjectable({
  id: "application-copyright",
  instantiate: (di) => di.inject(applicationInformationToken).copyright,
});

export default applicationCopyrightInjectable;
