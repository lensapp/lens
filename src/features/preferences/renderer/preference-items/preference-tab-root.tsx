/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { HorizontalLine } from "../../../../renderer/components/horizontal-line/horizontal-line";
import type { RootComposite } from "../../../../common/utils/composite/interfaces";
import type { Discriminable } from "../../../../common/utils/composable-responsibilities/discriminable/discriminable";
import styles from "./preference-tab-root.module.scss";
import type { ChildrenAreSeparated } from "@lensapp/preferences";

export type PreferenceTabsRoot =
  & Discriminable<"preference-tabs-root">
  & RootComposite
  & ChildrenAreSeparated;

export const preferenceTabsRoot: PreferenceTabsRoot = {
  kind: "preference-tabs-root" as const,
  id: "preference-tabs",
  parentId: undefined,

  childSeparator: () => (
    <div className={styles.TabSeparator}>
      <HorizontalLine size="sm" />
    </div>
  ),
};
