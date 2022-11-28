/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import packageJson from "../../../package.json";

export type ApplicationInformation = Pick<typeof packageJson, "version" | "config" | "productName" | "copyright" | "description" | "name"> & {
  build: Partial<typeof packageJson["build"]> & { publish?: unknown[] };
};

const applicationInformationInjectable = getInjectable({
  id: "application-information",
  instantiate: (): ApplicationInformation => {
    const { version, config, productName, build, copyright, description, name } = packageJson;

    return { version, config, productName, build, copyright, description, name };
  },
  causesSideEffects: true,
});

export default applicationInformationInjectable;
