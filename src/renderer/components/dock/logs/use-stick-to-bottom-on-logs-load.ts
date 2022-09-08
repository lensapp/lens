/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RefObject } from "react";
import { useEffect } from "react";
import useIntersectionObserver from "../../../hooks/useIntersectionObserver";
import type { LogTabViewModel } from "./logs-view-model";

interface UseStickToBottomProps {
  bottomLineRef: RefObject<HTMLDivElement>;
  model: LogTabViewModel;
  scrollToBottom: () => void;
}

export function useStickToBottomOnLogsLoad({ bottomLineRef, model, scrollToBottom }: UseStickToBottomProps) {
  const bottomLineEntry = useIntersectionObserver(bottomLineRef.current, {});

  useEffect(() => {
    if (bottomLineEntry?.isIntersecting) {
      scrollToBottom();
    }
  }, [model.visibleLogs.get().length]);
}
