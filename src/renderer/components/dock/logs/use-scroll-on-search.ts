/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { useEffect } from "react";
import type { SearchStore } from "../../../search-store/search-store";

export function useScrollOnSearch(store: SearchStore, scrollTo: (index: number) => void) {
  const { occurrences, searchQuery, activeOverlayIndex } = store;

  useEffect(() => {
    if (!occurrences.length) return;

    scrollTo(occurrences[activeOverlayIndex]);
  }, [searchQuery, activeOverlayIndex]);
}
