/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { computed, observable, makeObservable, action } from "mobx";
import type { HelmRelease } from "../../../../common/k8s-api/endpoints/helm-releases.api";

export class ReleaseRollbackDialogModel {
  release: HelmRelease | null = null;

  constructor() {
    makeObservable(this, {
      isOpen: computed,
      release: observable,
      open: action,
      close: action,
    });
  }

  get isOpen() {
    return !!this.release;
  }

  open = (release: HelmRelease) => {
    this.release = release;
  };

  close = () => {
    this.release = null;
  };
}
