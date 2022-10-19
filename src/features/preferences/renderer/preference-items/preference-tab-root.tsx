/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import React from "react";

export interface PreferenceTabsRoot {
  kind: "preference-tabs-root";
  id: string;
  parentId: undefined;
  isShown: IComputedValue<true>;
  childrenSeparator: () => React.ReactElement;
}

export const preferenceTabsRoot: PreferenceTabsRoot = {
  kind: "preference-tabs-root" as const,
  id: "preference-tabs",
  parentId: undefined,
  isShown: computed(() => true as const),
  childrenSeparator: () => <hr />,
};
