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
import progressOfUpdateDownloadInjectable from "../../../common/application-update/progress-of-update-download/progress-of-update-download.injectable";
import type { ProgressOfDownload } from "../../../common/application-update/progress-of-update-download/progress-of-update-download.injectable";
import type { SyncBox } from "../../../common/utils/sync-box/sync-box-injection-token";

interface Dependencies {
  state: AutoUpdateState;
  progressOfUpdateDownload: SyncBox<ProgressOfDownload>;
}

const checking = () => (
  <>
    <Spinner/>
    <div>{"Checking for updates..."}</div>
  </>
);
const available = () => <div>{"Update is available"}</div>;
const notAvailable = () => <div>{"No new updates available"}</div>;
const downloading = (state: AutoUpdateState, percentDone: number) => {
  const { version } = state;

  if ( percentDone === 0 ) {
    return (
      <>
        <div>{`Download for version ${version} started `}</div>
        <Spinner/>
      </>
    );
  }

  if ( percentDone < 100 ) {
    return <div>{`Download for version ${version} ${percentDone}%...`}</div>;
  }

  state.name = "download-succeeded";

  return null;
};

const done = () => <div>{"Done checking for updates"}</div>;
const downloadFailed = (version: string | undefined) => <div>{`Download for version ${version} failed`}</div>;
const downloadSucceeded = (version: string | undefined) => <div>{`Download for version ${version} complete`}</div>;
const idle = () => <></>;

export const NonInjectedAutoUpdateComponent = observer(({ state, progressOfUpdateDownload }: Dependencies) => {

  switch(state.name) {
    case "checking":
      return checking();

    case "available":
      return available();

    case "not-available":
      return notAvailable();

    case "downloading": {
      const roundedPercentage = Math.round(progressOfUpdateDownload.value.get().percentage);
      
      return downloading(state, roundedPercentage);
    }

    case "done":
      return done();

    case "download-failed":
      return downloadFailed(state.version);

    case "download-succeeded":
      return downloadSucceeded(state.version);

    case "idle":
      return idle();
  }

});

export const AutoUpdateComponent = withInjectables<Dependencies>(NonInjectedAutoUpdateComponent, {
  getProps: (di, props) => ({
    state: di.inject(AutoUpdateStateInjectable),
    progressOfUpdateDownload: di.inject(progressOfUpdateDownloadInjectable),
    ...props,
  }),
});
