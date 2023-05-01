/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { z } from "zod";

export const logTabDataSchema = z.object({
  owner: z.object({
    uid: z.string(),
    name: z.string(),
    kind: z.string(),
  })
    .catchall(z.any())
    .optional(),
  selectedPodId: z.string(),
  namespace: z.string(),
  selectedContainer: z.string().optional(),
  showTimestamps: z.boolean(),
  showPrevious: z.boolean(),
});
