/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { jobStore } from "./job.store";

const jobsStoreInjectable = getInjectable({
  id: "jobs-store",
  instantiate: () => jobStore,
  causesSideEffects: true,
});

export default jobsStoreInjectable;
