/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationInformationInjectable from "./application-information.injectable";

const applicationCopyrightInjectable = getInjectable({
  id: "application-copyright",
  instantiate: (di) => di.inject(applicationInformationInjectable).copyright,
});

export default applicationCopyrightInjectable;
