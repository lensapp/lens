/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RefObject } from "react";
import { useEffect } from "react";
import { useIntersectionObserver } from "../../../hooks";
import type { LogTabViewModel } from "./logs-view-model";

interface UseStickToBottomProps {
  topLineRef: RefObject<HTMLDivElement>;
  model: LogTabViewModel;
  scrollTo: (index: number) => void;
}

export function useOnScrollTop({ topLineRef, model, scrollTo }: UseStickToBottomProps) {
  const topLineEntry = useIntersectionObserver(topLineRef.current, {});

  function getPreviouslyFirstLogIndex(firstLog: string) {
    return model.logs.get().findIndex(log => log === firstLog);
  }

  async function onScrolledTop() {
    const firstLog = model.logs.get()[0];
    const scrollIndex = () => getPreviouslyFirstLogIndex(firstLog);

    await model.loadLogs();
    scrollTo(scrollIndex());
  }

  useEffect(() => {
    if (topLineEntry?.isIntersecting) {
      onScrolledTop();
    }
  }, [topLineEntry?.isIntersecting]);
}
