/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import React from "react";
import { HorizontalLine } from "../../../../renderer/components/horizontal-line/horizontal-line";

export interface PreferenceTabsRoot {
  kind: "preference-tabs-root";
  id: string;
  parentId: undefined;
  isShown: IComputedValue<true>;
  childSeparator: () => React.ReactElement;
}

export const preferenceTabsRoot: PreferenceTabsRoot = {
  kind: "preference-tabs-root" as const,
  id: "preference-tabs",
  parentId: undefined,
  isShown: computed(() => true as const),

  childSeparator: () => (
    <div style={{ padding: "0 10px" }}>
      <HorizontalLine small />
    </div>
  ),
};
