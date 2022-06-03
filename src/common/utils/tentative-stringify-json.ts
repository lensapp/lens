/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { defaultTo } from "lodash/fp";
import { withErrorSuppression } from "./with-error-suppression/with-error-suppression";

export const tentativeStringifyJson = (toBeParsed: any) => pipeline(
  toBeParsed,
  withErrorSuppression(JSON.stringify),
  defaultTo(toBeParsed),
);


