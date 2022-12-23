/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import packageJson from "../../../package.json";
import applicationInformationToken from "../../common/vars/application-information-token";

const applicationInformationInjectable = getInjectable({
  id: "application-information",
  injectionToken: applicationInformationToken,
  instantiate: () => {
    const { version, config, productName, build, copyright, description, name } = packageJson;

    return { version, config, productName, build, copyright, description, name };
  },
  causesSideEffects: true,
});

export default applicationInformationInjectable;
