/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";

export function getSidebarItem(rendered: RenderResult, itemId: string) {
  return rendered
    .queryAllByTestId("sidebar-item")
    .find((x) => x.dataset.idTest === itemId);
}
