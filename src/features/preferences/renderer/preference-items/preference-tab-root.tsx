/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";

export interface PreferenceTabsRoot {
  kind: "preference-tabs-root";
  id: string;
  parentId: undefined;
  isShown: true;
  childrenSeparator: () => React.ReactElement;
}

export const preferenceTabsRoot: PreferenceTabsRoot = {
  kind: "preference-tabs-root" as const,
  id: "preference-tabs",
  parentId: undefined,
  isShown: true,
  childrenSeparator: () => <hr />,
};
