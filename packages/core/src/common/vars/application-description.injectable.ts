/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationInformationToken from "./application-information-token";

const applicationDescriptionInjectable = getInjectable({
  id: "application-description",
  instantiate: (di) => di.inject(applicationInformationToken).description,
});

export default applicationDescriptionInjectable;
