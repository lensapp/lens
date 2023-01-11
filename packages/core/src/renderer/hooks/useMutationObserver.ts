/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { useEffect } from "react";

const config: MutationObserverInit = {
  subtree: true,
  childList: true,
  attributes: false,
  characterData: false,
};

export function useMutationObserver(
  root: Element | undefined | null,
  callback: MutationCallback,
  options: MutationObserverInit = config,
) {

  useEffect(() => {
    if (root) {
      const observer = new MutationObserver(callback);

      observer.observe(root, options);

      return () => {
        observer.disconnect();
      };
    }

    return undefined;
  }, [callback, options]);
}
