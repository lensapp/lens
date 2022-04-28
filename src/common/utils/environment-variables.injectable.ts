/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const environmentVariablesInjectable = getInjectable({
  id: "environment-variables",

  instantiate: () => {
    // IMPORTANT: The syntax needs to be exactly this in order to make environment variable values
    // hard-coded at compile-time by Webpack.
    const NODE_ENV = process.env.NODE_ENV;
    const JEST_WORKER_ID = process.env.JEST_WORKER_ID;
    const CICD = process.env.CICD;

    return {
      // Compile-time environment variables
      NODE_ENV,
      JEST_WORKER_ID,
      CICD,

      // Runtime environment variables
      LENS_DISABLE_GPU: process.env.LENS_DISABLE_GPU,
    };
  },

  causesSideEffects: true,
});

export default environmentVariablesInjectable;
