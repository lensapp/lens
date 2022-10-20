/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { HorizontalLine } from "../../../../renderer/components/horizontal-line/horizontal-line";
import type { RootComposite } from "../../../../common/utils/composite/interfaces";
import type { Discriminable } from "../../../../common/utils/composable-responsibilities/discriminable/discriminable";
import type { Showable } from "../../../../common/utils/composable-responsibilities/showable/showable";

export type PreferenceTabsRoot =
  & Discriminable<"preference-tabs-root">
  & RootComposite
  & Showable<true>
  & { childSeparator: () => React.ReactElement };

export const preferenceTabsRoot: PreferenceTabsRoot = {
  kind: "preference-tabs-root" as const,
  id: "preference-tabs",
  parentId: undefined,
  isShown: true as const,

  childSeparator: () => (
    <div style={{ padding: "0 10px" }}>
      <HorizontalLine size="sm" />
    </div>
  ),
};
