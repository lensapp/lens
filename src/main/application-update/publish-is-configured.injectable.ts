/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationInformationInjectable from "../../common/vars/application-information.injectable";

const publishIsConfiguredInjectable = getInjectable({
  id: "publish-is-configured",
  instantiate: (di) => Boolean(di.inject(applicationInformationInjectable).build.publish?.length),
});

export default publishIsConfiguredInjectable;
