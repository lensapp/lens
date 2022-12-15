/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { useState } from "react";

export function useJumpToBottomButton(scrolledParent: HTMLDivElement | null): [isVisible: boolean, setVisibility: () => void] {
  const [isVisible, setToBottomVisible] = useState(false);

  const setVisibility = () => {
    if (!scrolledParent) return;

    const { scrollTop, scrollHeight } = scrolledParent;

    if (scrollHeight - scrollTop > 4000) {
      setToBottomVisible(true);
    } else {
      setToBottomVisible(false);
    }
  };

  return [isVisible, setVisibility];
}
