/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const environmentVariablesInjectable = getInjectable({
  id: "environment-variables",

  instantiate: () => {
    const JEST_WORKER_ID = process.env.JEST_WORKER_ID;
    const CICD = process.env.CICD;

    return {
      // Compile-time environment variables
      JEST_WORKER_ID,
      CICD,

      // Runtime environment variables
      LENS_DISABLE_GPU: process.env.LENS_DISABLE_GPU,
    };
  },

  causesSideEffects: true,
});

export default environmentVariablesInjectable;
