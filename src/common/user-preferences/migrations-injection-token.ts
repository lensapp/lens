/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Migrations } from "conf/dist/source/types";
import type { UserPreferencesStoreModel } from "./store";

export const userPreferencesStoreMigrationsInjectionToken = getInjectionToken<Migrations<UserPreferencesStoreModel> | undefined>();
