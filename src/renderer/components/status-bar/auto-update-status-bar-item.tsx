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

const checking = () => (
  <>
    <Spinner/>
    <div>{"Checking for updates..."}</div>
  </>
);

const available = (version: string) => <div>{`${version ?? "Update"} is available`}</div>;

const notAvailable = () => <div>{"No new updates available"}</div>;

const downloading = (version: string, percentDone: number) => {
  if ( percentDone === 0 ) {
    return (
      <>
        <div>{`Download for version ${version} started `}</div>
        <Spinner/>
      </>
    );
  }

  return <div>{`Download for version ${version} ${percentDone}%...`}</div>;
};

const downloadSucceeded = (version: string) => <div>{`Download for version ${version} complete`}</div>;

const idle = () => <></>;


export const NonInjectedAutoUpdateComponent = observer(({
  progressOfUpdateDownload,
  discoveredVersionState,
  downloadingUpdateState,
  checkingForUpdatesState,
}: Dependencies) => {
  const discoveredVersion = discoveredVersionState.value.get();

  if (downloadingUpdateState.value.get()) {

    assert(discoveredVersion);

    const roundedPercentage = Math.round(progressOfUpdateDownload.value.get().percentage);

    if ( roundedPercentage > 99 ) {
      return <EndNote note={downloadSucceeded} version={discoveredVersion.version} />;
    }

    return downloading(discoveredVersion.version, roundedPercentage);
  }

  if (checkingForUpdatesState.value.get()) {
    return checking();
  }

  if ( discoveredVersion) {
    return <EndNote note={available} version={discoveredVersion.version} />;
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
