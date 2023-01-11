/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import type { ObservableMap } from "mobx";
import { computed } from "mobx";
import type { HelmRelease } from "../../../common/k8s-api/endpoints/helm-releases.api";

interface Dependencies {
  releases: IAsyncComputed<HelmRelease[]>;
  releaseSelectionStatus: ObservableMap<string, boolean>;
  deleteRelease: (release: HelmRelease) => Promise<any>;
}

export interface RemovableHelmRelease extends HelmRelease {
  toggle: () => void;
  isSelected: boolean;
  delete: () => Promise<void>;
}

export const removableReleases = ({
  releases,
  releaseSelectionStatus,
  deleteRelease,
}: Dependencies) => {
  const isSelected = (release: HelmRelease) =>
    releaseSelectionStatus.get(release.getId()) || false;

  return computed(() =>
    releases.value.get().map(
      (release): RemovableHelmRelease => ({
        ...release,

        toggle: () => {
          releaseSelectionStatus.set(release.getId(), !isSelected(release));
        },

        get isSelected() {
          return isSelected(release);
        },

        delete: async () => {
          await deleteRelease(release);
        },
      }),
    ),
  );
};
