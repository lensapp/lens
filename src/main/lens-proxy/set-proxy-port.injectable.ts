/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IObservableValue } from "mobx";
import { bind } from "../../common/utils";
import proxyPortStateInjectable from "./proxy-port.state.injectable";

interface Dependencies {
  state: IObservableValue<number | undefined>;
}

function setProxyPort({ state }: Dependencies, newPort: number): void {
  state.set(newPort);
}

const setProxyPortInjectable = getInjectable({
  instantiate: (di) => bind(setProxyPort, null, {
    state: di.inject(proxyPortStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default setProxyPortInjectable;
