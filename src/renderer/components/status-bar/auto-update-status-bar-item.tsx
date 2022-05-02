/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import AutoUpdateStateInjectable from "../../../common/auto-update/auto-update-state.injectable";
import type { AutoUpdateState } from "../../../common/auto-update/auto-update-state.injectable";
import { Spinner } from "../spinner";

interface Dependencies {
  state: AutoUpdateState;
}

const checking = () => <><Spinner/><div>{"Checking for updates"}</div></>;
const available = () => <div>{"Update is available"}</div>;

const notAvailable = () => {

  return <div>{"Update is currently not available"}</div>;
};

const downloading = () => <div>{"Downloading update"}</div>;
const done = () => <div>{"Done checking for updates"}</div>;

const idle = () => <></>;

export const NonInjectedAutoUpdateComponent = observer(({ state }: Dependencies) => {

  switch(state.name) {
    case "checking":
      return checking();

    case "available":
      return available();

    case "not-available":
      return notAvailable();

    case "downloading":
      return downloading();

    case "done":
      return done();

    default:
    case "idle":
      return idle();
  }

});

export const AutoUpdateComponent = withInjectables<Dependencies>(NonInjectedAutoUpdateComponent, {
  getProps: (di, props) => ({
    state: di.inject(AutoUpdateStateInjectable),
    ...props,
  }),
});
