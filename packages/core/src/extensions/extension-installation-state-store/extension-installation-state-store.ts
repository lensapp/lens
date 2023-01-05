/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, computed, observable } from "mobx";
import logger from "../../main/logger";
import { disposer } from "../../renderer/utils";
import type { ExtendableDisposer } from "../../renderer/utils";
import * as uuid from "uuid";
import { broadcastMessage } from "../../common/ipc";
import { ipcRenderer } from "electron";

export enum ExtensionInstallationState {
  INSTALLING = "installing",
  UNINSTALLING = "uninstalling",
  IDLE = "idle",
}

const Prefix = "[ExtensionInstallationStore]";

export class ExtensionInstallationStateStore {
  private InstallingFromMainChannel =
    "extension-installation-state-store:install";

  private ClearInstallingFromMainChannel =
    "extension-installation-state-store:clear-install";

  private PreInstallIds = observable.set<string>();
  private UninstallingExtensions = observable.set<string>();
  private InstallingExtensions = observable.set<string>();

  bindIpcListeners = () => {
    ipcRenderer
      .on(this.InstallingFromMainChannel, (event, extId) => {
        this.setInstalling(extId);
      })

      .on(this.ClearInstallingFromMainChannel, (event, extId) => {
        this.clearInstalling(extId);
      });
  };

  /**
   * Strictly transitions an extension from not installing to installing
   * @param extId the ID of the extension
   * @throws if state is not IDLE
   */
  @action setInstalling = (extId: string): void => {
    logger.debug(`${Prefix}: trying to set ${extId} as installing`);

    const curState = this.getInstallationState(extId);

    if (curState !== ExtensionInstallationState.IDLE) {
      throw new Error(
        `${Prefix}: cannot set ${extId} as installing. Is currently ${curState}.`,
      );
    }

    this.InstallingExtensions.add(extId);
  };

  /**
   * Broadcasts that an extension is being installed by the main process
   * @param extId the ID of the extension
   */
  setInstallingFromMain = (extId: string): void => {
    broadcastMessage(this.InstallingFromMainChannel, extId);
  };

  /**
   * Broadcasts that an extension is no longer being installed by the main process
   * @param extId the ID of the extension
   */
  clearInstallingFromMain = (extId: string): void => {
    broadcastMessage(this.ClearInstallingFromMainChannel, extId);
  };

  /**
   * Marks the start of a pre-install phase of an extension installation. The
   * part of the installation before the tarball has been unpacked and the ID
   * determined.
   * @returns a disposer which should be called to mark the end of the install phase
   */
  @action startPreInstall = (): ExtendableDisposer => {
    const preInstallStepId = uuid.v4();

    logger.debug(
      `${Prefix}: starting a new preinstall phase: ${preInstallStepId}`,
    );
    this.PreInstallIds.add(preInstallStepId);

    return disposer(() => {
      this.PreInstallIds.delete(preInstallStepId);
      logger.debug(`${Prefix}: ending a preinstall phase: ${preInstallStepId}`);
    });
  };

  /**
   * Strictly transitions an extension from not uninstalling to uninstalling
   * @param extId the ID of the extension
   * @throws if state is not IDLE
   */
  @action setUninstalling = (extId: string): void => {
    logger.debug(`${Prefix}: trying to set ${extId} as uninstalling`);

    const curState = this.getInstallationState(extId);

    if (curState !== ExtensionInstallationState.IDLE) {
      throw new Error(
        `${Prefix}: cannot set ${extId} as uninstalling. Is currently ${curState}.`,
      );
    }

    this.UninstallingExtensions.add(extId);
  };

  /**
   * Strictly clears the INSTALLING state of an extension
   * @param extId The ID of the extension
   * @throws if state is not INSTALLING
   */
  @action clearInstalling = (extId: string): void => {
    logger.debug(`${Prefix}: trying to clear ${extId} as installing`);

    const curState = this.getInstallationState(extId);

    switch (curState) {
      case ExtensionInstallationState.INSTALLING:
        return void this.InstallingExtensions.delete(extId);
      default:
        throw new Error(
          `${Prefix}: cannot clear INSTALLING state for ${extId}, it is currently ${curState}`,
        );
    }
  };

  /**
   * Strictly clears the UNINSTALLING state of an extension
   * @param extId The ID of the extension
   * @throws if state is not UNINSTALLING
   */
  @action clearUninstalling = (extId: string): void => {
    logger.debug(`${Prefix}: trying to clear ${extId} as uninstalling`);

    const curState = this.getInstallationState(extId);

    switch (curState) {
      case ExtensionInstallationState.UNINSTALLING:
        return void this.UninstallingExtensions.delete(extId);
      default:
        throw new Error(
          `${Prefix}: cannot clear UNINSTALLING state for ${extId}, it is currently ${curState}`,
        );
    }
  };

  /**
   * Returns the current state of the extension. IDLE is default value.
   * @param extId The ID of the extension
   */
  getInstallationState = (extId: string): ExtensionInstallationState => {
    if (this.InstallingExtensions.has(extId)) {
      return ExtensionInstallationState.INSTALLING;
    }

    if (this.UninstallingExtensions.has(extId)) {
      return ExtensionInstallationState.UNINSTALLING;
    }

    return ExtensionInstallationState.IDLE;
  };

  /**
   * Returns true if the extension is currently INSTALLING
   * @param extId The ID of the extension
   */
  isExtensionInstalling = (extId: string): boolean =>
    this.getInstallationState(extId) === ExtensionInstallationState.INSTALLING;

  /**
   * Returns true if the extension is currently UNINSTALLING
   * @param extId The ID of the extension
   */
  isExtensionUninstalling = (extId: string): boolean =>
    this.getInstallationState(extId) ===
    ExtensionInstallationState.UNINSTALLING;

  /**
   * Returns true if the extension is currently IDLE
   * @param extId The ID of the extension
   */
  isExtensionIdle = (extId: string): boolean =>
    this.getInstallationState(extId) === ExtensionInstallationState.IDLE;

  /**
   * The current number of extensions installing
   */
  @computed get installing(): number {
    return this.InstallingExtensions.size;
  }

  /**
   * The current number of extensions uninstalling
   */
  get uninstalling(): number {
    return this.UninstallingExtensions.size;
  }

  /**
   * If there is at least one extension currently installing
   */
  get anyInstalling(): boolean {
    return this.installing > 0;
  }

  /**
   * If there is at least one extension currently uninstalling
   */
  get anyUninstalling(): boolean {
    return this.uninstalling > 0;
  }

  /**
   * The current number of extensions preinstalling
   */
  get preinstalling(): number {
    return this.PreInstallIds.size;
  }

  /**
   * If there is at least one extension currently downloading
   */
  get anyPreinstalling(): boolean {
    return this.preinstalling > 0;
  }

  /**
   * If there is at least one installing or preinstalling step taking place
   */
  get anyPreInstallingOrInstalling(): boolean {
    return this.anyInstalling || this.anyPreinstalling;
  }
}
