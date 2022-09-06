import { useEffect } from "react";
import type { LogTabViewModel } from "./logs-view-model";

export function useInitialScrollToBottom(model: LogTabViewModel, callback: () => void) {
  useEffect(() => {
    setTimeout(() => {
      callback();
    }, 300) // Giving some time virtual library to render its rows
  }, [model.logTabData.get()?.selectedPodId])
}