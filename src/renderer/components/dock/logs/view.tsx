/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { createRef, useEffect } from "react";
import { observer } from "mobx-react";
import { InfoPanel } from "../info-panel";
import { LogResourceSelector } from "./resource-selector";
import type { LogListRef } from "./list";
import { LogList } from "./list";
import { LogSearch } from "./search";
import { LogControls } from "./controls";
import { withInjectables } from "@ogre-tools/injectable-react";
import logsViewModelInjectable from "./logs-view-model.injectable";
import type { LogTabViewModel } from "./logs-view-model";
import type { DockTab } from "../dock/store";
import { cssNames } from "../../../utils";
import type { SubscribeStores } from "../../../kube-watch-api/kube-watch-api";
import subscribeStoresInjectable from "../../../kube-watch-api/subscribe-stores.injectable";
import { podsStore } from "../../+workloads-pods/pods.store";

export interface LogsDockTabProps {
  className?: string;
  tab: DockTab;
}

interface Dependencies {
  model: LogTabViewModel;
  subscribeStores: SubscribeStores;
}

const NonInjectedLogsDockTab = observer(({ className, tab, model, subscribeStores }: Dependencies & LogsDockTabProps) => {
  const logListElement = createRef<LogListRef>();
  const data = model.logTabData.get();

  useEffect(() => {
    model.reloadLogs();

    return model.stopLoadingLogs;
  }, [tab.id]);
  useEffect(() => subscribeStores([
    podsStore,
  ], {
    namespaces: data ? [data.namespace] : [],
  }), [data?.namespace]);

  const scrollToOverlay = (overlayLine: number | undefined) => {
    if (!logListElement.current || overlayLine === undefined) {
      return;
    }

    // Scroll vertically
    logListElement.current.scrollToItem(overlayLine, "center");
    // Scroll horizontally in timeout since virtual list need some time to prepare its contents
    setTimeout(() => {
      const overlay = document.querySelector(".PodLogs .list span.active");

      if (!overlay) return;
      // Note: .scrollIntoViewIfNeeded() is non-standard and thus not present in js-dom.
      overlay?.scrollIntoViewIfNeeded?.();
    }, 100);
  };

  if (!data) {
    return null;
  }

  return (
    <div className={cssNames("PodLogs flex column", className)}>
      <InfoPanel
        tabId={tab.id}
        controls={(
          <div className="flex gaps">
            <LogResourceSelector model={model} />
            <LogSearch
              model={model}
              scrollToOverlay={scrollToOverlay}
            />
          </div>
        )}
        showSubmitClose={false}
        showButtons={false}
        showStatusPanel={false}
      />
      <LogList model={model} ref={logListElement} />
      <LogControls model={model} />
    </div>
  );
});


export const LogsDockTab = withInjectables<Dependencies, LogsDockTabProps>(NonInjectedLogsDockTab, {
  getProps: (di, props) => ({
    model: di.inject(logsViewModelInjectable, {
      tabId: props.tab.id,
    }),
    subscribeStores: di.inject(subscribeStoresInjectable),
    ...props,
  }),
});
