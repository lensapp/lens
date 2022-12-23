/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { createContainer } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import applicationInformationInjectable from "../common/vars/application-information-injectable";

export const getDi = () => {
  const di = createContainer("renderer");

  runInAction(() => {
    di.register(applicationInformationInjectable);
  });

  return di;
};
