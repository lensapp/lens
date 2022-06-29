/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import assert from "assert";
import React, { useEffect, useState } from "react";
import { Spinner } from "../spinner";
import type { ProgressOfUpdateDownload } from "../../../common/application-update/progress-of-update-download/progress-of-update-download.injectable";
import progressOfUpdateDownloadInjectable from "../../../common/application-update/progress-of-update-download/progress-of-update-download.injectable";
import type { DiscoveredUpdateVersion } from "../../../common/application-update/discovered-update-version/discovered-update-version.injectable";
import discoveredUpdateVersionInjectable from "../../../common/application-update/discovered-update-version/discovered-update-version.injectable";
import type { UpdateIsBeingDownloaded } from "../../../common/application-update/update-is-being-downloaded/update-is-being-downloaded.injectable";
import updateIsBeingDownloadedInjectable from "../../../common/application-update/update-is-being-downloaded/update-is-being-downloaded.injectable";
import type { UpdatesAreBeingDiscovered } from "../../../common/application-update/updates-are-being-discovered/updates-are-being-discovered.injectable";
import updatesAreBeingDiscoveredInjectable from "../../../common/application-update/updates-are-being-discovered/updates-are-being-discovered.injectable";

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

const EndNote = ({ version, note }: EndNoteProps) => {
  const [idling, setIdling] = useState(false);

  useEffect(() => {
    const timerId = setTimeout(() => setIdling(true), 5000);

    return () => clearTimeout(timerId);
  });

  if (idling) {
    return idle();
  }

  return note(version ?? "");
};

const DivWithTestId = (text: string) => <div data-testid="auto-update-component">{text}</div>;

const checking = () => (
  <>
    <Spinner/>
    {DivWithTestId("Checking for updates..." )}
  </>
);

const available = (version: string) => DivWithTestId(`${version ?? "Update"} is available`);

const notAvailable = () => DivWithTestId("No new updates available");

const downloading = (version: string, percentDone: number) => {
  if ( percentDone === 0 ) {
    return (
      <>
        {DivWithTestId(`Download for version ${version} started...`)}
        <Spinner/>
      </>
    );
  }

  return DivWithTestId(`Download for version ${version} ${percentDone}%...`);
};

const downloadFailed = (errMsg: string) => DivWithTestId(errMsg);

const idle = () => DivWithTestId("");


export const NonInjectedAutoUpdateComponent = observer(({
  progressOfUpdateDownload,
  discoveredVersionState,
  downloadingUpdateState,
  checkingForUpdatesState,
}: Dependencies) => {
  const discoveredVersion = discoveredVersionState.value.get();

  const { percentage, failed } = progressOfUpdateDownload.value.get();

  if (downloadingUpdateState.value.get()) {

    assert(discoveredVersion);

    const roundedPercentage = Math.round(percentage);

    return downloading(discoveredVersion.version, roundedPercentage);
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
