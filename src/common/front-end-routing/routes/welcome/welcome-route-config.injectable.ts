/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationInformationToken from "../../../vars/application-information-token";

const welcomeRouteConfigInjectable = getInjectable({
  id: "welcome-route-config",

  instantiate: (di) => di.inject(applicationInformationToken).config.welcomeRoute,
});

export default welcomeRouteConfigInjectable;
