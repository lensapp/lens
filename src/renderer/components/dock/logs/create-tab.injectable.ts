/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../../utils";
import { DockTabCreate, DockTabData, TabKind, TabId, DockTabCreateOptions } from "../dock/store";
import type { LogTabData } from "./tab-store";
import * as uuid from "uuid";
import { runInAction } from "mobx";
import createDockTabInjectable from "../dock/create-tab.injectable";
import setLogTabDataInjectable from "./set-log-tab-data.injectable";

export type CreateLogsTabData = Pick<LogTabData, "owner" | "selectedPodId" | "selectedContainer" | "namespace"> & Omit<Partial<LogTabData>, "owner" | "selectedPodId" | "selectedContainer" | "namespace">;

interface Dependencies {
  createDockTab: (rawTabDesc: DockTabCreate, opts?: DockTabCreateOptions) => DockTabData;
  setLogTabData: (tabId: string, data: LogTabData) => void;
}

function createLogsTab({ createDockTab, setLogTabData }: Dependencies, title: string, data: CreateLogsTabData): TabId {
  const id = `log-tab-${uuid.v4()}`;

  runInAction(() => {
    createDockTab({
      id,
      title,
      kind: TabKind.POD_LOGS,
    });
    setLogTabData(id, {
      showTimestamps: false,
      showPrevious: false,
      ...data,
    });
  });

  return id;
}

const createLogsTabInjectable = getInjectable({
  instantiate: (di) => bind(createLogsTab, null, {
    createDockTab: di.inject(createDockTabInjectable),
    setLogTabData: di.inject(setLogTabDataInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default createLogsTabInjectable;
