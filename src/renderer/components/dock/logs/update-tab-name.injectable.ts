/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { Pod } from "../../../../common/k8s-api/endpoints";
import { bind } from "../../../utils";
import type { TabId } from "../dock/store";
import renameTabInjectable from "../dock/rename-tab.injectable";

interface Dependencies {
  renameTab: (tabId: TabId, title: string) => void;
}

function updateTabName({ renameTab }: Dependencies, tabId: string, pod: Pod): void {
  renameTab(tabId, `Pod ${pod.getName()}`);
}

const updateTabNameInjectable = getInjectable({
  instantiate: (di) => bind(updateTabName, null, {
    renameTab: di.inject(renameTabInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default updateTabNameInjectable;
