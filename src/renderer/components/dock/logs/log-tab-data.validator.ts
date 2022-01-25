/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import Joi from "joi";

export const logTabDataValidator = Joi.object({
  ownerId: Joi
    .string()
    .optional(),
  selectedPodId: Joi
    .string()
    .required(),
  namespace: Joi
    .string()
    .required(),
  selectedContainer: Joi
    .string()
    .optional(),
  showTimestamps: Joi
    .boolean()
    .required(),
  previous: Joi
    .boolean()
    .required(),
});
