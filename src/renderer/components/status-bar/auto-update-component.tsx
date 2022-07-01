/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import assert from "assert";
import React, { useState } from "react";
import { Spinner } from "../spinner";
import type { ProgressOfUpdateDownload } from "../../../common/application-update/progress-of-update-download/progress-of-update-download.injectable";
import progressOfUpdateDownloadInjectable from "../../../common/application-update/progress-of-update-download/progress-of-update-download.injectable";
import type { DiscoveredUpdateVersion } from "../../../common/application-update/discovered-update-version/discovered-update-version.injectable";
import discoveredUpdateVersionInjectable from "../../../common/application-update/discovered-update-version/discovered-update-version.injectable";
import type { UpdateIsBeingDownloaded } from "../../../common/application-update/update-is-being-downloaded/update-is-being-downloaded.injectable";
import updateIsBeingDownloadedInjectable from "../../../common/application-update/update-is-being-downloaded/update-is-being-downloaded.injectable";
import type { UpdatesAreBeingDiscovered } from "../../../common/application-update/updates-are-being-discovered/updates-are-being-discovered.injectable";
import updatesAreBeingDiscoveredInjectable from "../../../common/application-update/updates-are-being-discovered/updates-are-being-discovered.injectable";
import { reactiveNow } from "../../../common/utils/reactive-now/reactive-now";

interface Dependencies {
  progressOfUpdateDownload: ProgressOfUpdateDownload;
  discoveredVersionState: DiscoveredUpdateVersion;
  downloadingUpdateState: UpdateIsBeingDownloaded;
  checkingForUpdatesState: UpdatesAreBeingDiscovered;
}

interface EndNoteProps {
  version?: string;
  note: (version: string) => JSX.Element;
}

const EndNote = observer(({ version, note }: EndNoteProps) => {
  const [start] = useState(Date.now());

  if (start + 5000 <= reactiveNow()) {
    return idle();
  }

  return note(version ?? "");
});

const checking = () => (
  <>
    <Spinner/>
    <div data-testid="app-update-checking">Checking for updates...</div>
  </>
);

const available = (version: string) => <div data-testid="app-update-available">{`${version ?? "Update"} is available`}</div>;

const notAvailable = () => <div data-testid="app-update-not-available">No new updates available</div>;

const downloading = (version: string) => {
  return (
    <>
      <div data-testid="app-update-downloading">{`Downloading version ${version}...`}</div>
      <Spinner/>
    </>
  );
};

const downloadFailed = (errMsg: string) => <div data-testid="app-update-download-failed">{errMsg}</div>;

const idle = () => <div data-testid="app-update-idle"></div>;


export const NonInjectedAutoUpdateComponent = observer(({
  progressOfUpdateDownload,
  discoveredVersionState,
  downloadingUpdateState,
  checkingForUpdatesState,
}: Dependencies) => {
  const discoveredVersion = discoveredVersionState.value.get();

  const { failed } = progressOfUpdateDownload.value.get();

  if (downloadingUpdateState.value.get()) {

    assert(discoveredVersion);

    return downloading(discoveredVersion.version);
  }

  if (checkingForUpdatesState.value.get()) {
    return checking();
  }

  if ( discoveredVersion) {
    return <EndNote note={available} version={discoveredVersion.version} />;
  }

  if ( failed ) {
    return <EndNote note={downloadFailed} version={failed} />;
  }

  return <EndNote note={notAvailable} />;
});

export const AutoUpdateComponent = withInjectables<Dependencies>(NonInjectedAutoUpdateComponent, {
  getProps: (di, props) => ({
    progressOfUpdateDownload: di.inject(progressOfUpdateDownloadInjectable),
    discoveredVersionState: di.inject(discoveredUpdateVersionInjectable),
    downloadingUpdateState: di.inject(updateIsBeingDownloadedInjectable),
    checkingForUpdatesState: di.inject(updatesAreBeingDiscoveredInjectable),
    ...props,
  }),
});
