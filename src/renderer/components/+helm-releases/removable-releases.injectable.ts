/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed, observable } from "mobx";
import type { HelmRelease } from "../../k8s/helm-release";
import deleteHelmReleaseInjectable from "../../k8s/helm-releases.api/delete.injectable";
import { toggle } from "../../utils";
import releasesInjectable from "./releases.injectable";

export interface RemovableHelmRelease extends HelmRelease {
  toggle: () => void;
  isSelected: boolean;
  delete: () => Promise<void>;
}

const removableReleasesInjectable = getInjectable({
  id: "removable-releases",

  instantiate: (di) => {
    const releases = di.inject(releasesInjectable);
    const deleteHelmRelease = di.inject(deleteHelmReleaseInjectable);
    const selectedReleaseIds = observable.set<string>();
    const isSelected = (release: HelmRelease) => selectedReleaseIds.has(release.getId());

    return computed(() =>
      releases.value.get().map(
        (release): RemovableHelmRelease => ({
          ...release,

          toggle: () => {
            toggle(selectedReleaseIds, release.getId());
          },

          get isSelected() {
            return isSelected(release);
          },

          delete: async () => {
            await deleteHelmRelease(release.name, release.namespace);
          },
        }),
      ),
    );
  },
});

export default removableReleasesInjectable;
