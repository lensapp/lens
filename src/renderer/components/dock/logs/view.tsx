/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { InfoPanel } from "../info-panel";
import { LogResourceSelector } from "./resource-selector";
import { LogSearch } from "./search";
import { LogControls } from "./controls";
import { withInjectables } from "@ogre-tools/injectable-react";
import logsViewModelInjectable from "./logs-view-model.injectable";
import type { LogTabViewModel } from "./logs-view-model";
import type { DockTab } from "../dock/store";
import { cssNames } from "../../../utils";
import type { SubscribeStores } from "../../../kube-watch-api/kube-watch-api";
import subscribeStoresInjectable from "../../../kube-watch-api/subscribe-stores.injectable";
import type { PodStore } from "../../+workloads-pods/store";
import podStoreInjectable from "../../+workloads-pods/store.injectable";
import { LogList } from "./log-list";

export interface LogsDockTabProps {
  className?: string;
  tab: DockTab;
}

interface Dependencies {
  model: LogTabViewModel;
  subscribeStores: SubscribeStores;
  podStore: PodStore;
}

const NonInjectedLogsDockTab = observer(({
  className,
  tab,
  model,
  subscribeStores,
  podStore,
}: Dependencies & LogsDockTabProps) => {
  const data = model.logTabData.get();

  useEffect(() => {
    model.reloadLogs();

    return model.stopLoadingLogs;
  }, [tab.id]);
  useEffect(() => subscribeStores([
    podStore,
  ], {
    namespaces: data ? [data.namespace] : [],
  }), [data?.namespace]);

  return (
    <div className={cssNames("PodLogs flex column", className)}>
      <InfoPanel
        tabId={tab.id}
        controls={(
          <div className="flex gaps">
            <LogResourceSelector model={model} />
            <LogSearch model={model}/>
          </div>
        )}
        showSubmitClose={false}
        showButtons={false}
        showStatusPanel={false}
      />
      <LogList model={model} />
      <LogControls model={model} />
    </div>
  );
});


export const LogsDockTab = withInjectables<Dependencies, LogsDockTabProps>(NonInjectedLogsDockTab, {
  getProps: (di, props) => ({
    ...props,
    model: di.inject(logsViewModelInjectable, {
      tabId: props.tab.id,
    }),
    subscribeStores: di.inject(subscribeStoresInjectable),
    podStore: di.inject(podStoreInjectable),
  }),
});
