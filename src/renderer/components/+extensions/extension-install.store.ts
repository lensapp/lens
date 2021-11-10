/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { action, computed, observable } from "mobx";
import logger from "../../../common/logger";
import { disposer } from "../../utils";
import type { ExtendableDisposer } from "../../utils";
import * as uuid from "uuid";
import { broadcastMessage } from "../../../common/ipc";
import { ipcRenderer } from "electron";

export enum ExtensionInstallationState {
  INSTALLING = "installing",
  UNINSTALLING = "uninstalling",
  IDLE = "idle",
}

const Prefix = "[ExtensionInstallationStore]";

export class ExtensionInstallationStateStore {
  private static InstallingFromMainChannel = "extension-installation-state-store:install";
  private static ClearInstallingFromMainChannel = "extension-installation-state-store:clear-install";
  private static PreInstallIds = observable.set<string>();
  private static UninstallingExtensions = observable.set<string>();
  private static InstallingExtensions = observable.set<string>();

  static bindIpcListeners() {
    ipcRenderer
      .on(ExtensionInstallationStateStore.InstallingFromMainChannel, (event, extId) => {
        ExtensionInstallationStateStore.setInstalling(extId);
      })
      .on(ExtensionInstallationStateStore.ClearInstallingFromMainChannel, (event, extId) => {
        ExtensionInstallationStateStore.clearInstalling(extId);
      });
  }

  @action static reset() {
    logger.warn(`${Prefix}: resetting, may throw errors`);
    ExtensionInstallationStateStore.InstallingExtensions.clear();
    ExtensionInstallationStateStore.UninstallingExtensions.clear();
    ExtensionInstallationStateStore.PreInstallIds.clear();
  }

  /**
   * Strictly transitions an extension from not installing to installing
   * @param extId the ID of the extension
   * @throws if state is not IDLE
   */
  @action static setInstalling(extId: string): void {
    logger.debug(`${Prefix}: trying to set ${extId} as installing`);

    const curState = ExtensionInstallationStateStore.getInstallationState(extId);

    if (curState !== ExtensionInstallationState.IDLE) {
      throw new Error(`${Prefix}: cannot set ${extId} as installing. Is currently ${curState}.`);
    }

    ExtensionInstallationStateStore.InstallingExtensions.add(extId);
  }

  /**
   * Broadcasts that an extension is being installed by the main process
   * @param extId the ID of the extension
   */
  static setInstallingFromMain(extId: string): void {
    broadcastMessage(ExtensionInstallationStateStore.InstallingFromMainChannel, extId);
  }

  /**
   * Broadcasts that an extension is no longer being installed by the main process
   * @param extId the ID of the extension
   */
  static clearInstallingFromMain(extId: string): void {
    broadcastMessage(ExtensionInstallationStateStore.ClearInstallingFromMainChannel, extId);
  }

  /**
   * Marks the start of a pre-install phase of an extension installation. The
   * part of the installation before the tarball has been unpacked and the ID
   * determined.
   * @returns a disposer which should be called to mark the end of the install phase
   */
  @action static startPreInstall(): ExtendableDisposer {
    const preInstallStepId = uuid.v4();

    logger.debug(`${Prefix}: starting a new preinstall phase: ${preInstallStepId}`);
    ExtensionInstallationStateStore.PreInstallIds.add(preInstallStepId);

    return disposer(() => {
      ExtensionInstallationStateStore.PreInstallIds.delete(preInstallStepId);
      logger.debug(`${Prefix}: ending a preinstall phase: ${preInstallStepId}`);
    });
  }

  /**
   * Strictly transitions an extension from not uninstalling to uninstalling
   * @param extId the ID of the extension
   * @throws if state is not IDLE
   */
  @action static setUninstalling(extId: string): void {
    logger.debug(`${Prefix}: trying to set ${extId} as uninstalling`);

    const curState = ExtensionInstallationStateStore.getInstallationState(extId);

    if (curState !== ExtensionInstallationState.IDLE) {
      throw new Error(`${Prefix}: cannot set ${extId} as uninstalling. Is currently ${curState}.`);
    }

    ExtensionInstallationStateStore.UninstallingExtensions.add(extId);
  }

  /**
   * Strictly clears the INSTALLING state of an extension
   * @param extId The ID of the extension
   * @throws if state is not INSTALLING
   */
  @action static clearInstalling(extId: string): void {
    logger.debug(`${Prefix}: trying to clear ${extId} as installing`);

    const curState = ExtensionInstallationStateStore.getInstallationState(extId);

    switch (curState) {
      case ExtensionInstallationState.INSTALLING:
        return void ExtensionInstallationStateStore.InstallingExtensions.delete(extId);
      default:
        throw new Error(`${Prefix}: cannot clear INSTALLING state for ${extId}, it is currently ${curState}`);
    }
  }

  /**
   * Strictly clears the UNINSTALLING state of an extension
   * @param extId The ID of the extension
   * @throws if state is not UNINSTALLING
   */
  @action static clearUninstalling(extId: string): void {
    logger.debug(`${Prefix}: trying to clear ${extId} as uninstalling`);

    const curState = ExtensionInstallationStateStore.getInstallationState(extId);

    switch (curState) {
      case ExtensionInstallationState.UNINSTALLING:
        return void ExtensionInstallationStateStore.UninstallingExtensions.delete(extId);
      default:
        throw new Error(`${Prefix}: cannot clear UNINSTALLING state for ${extId}, it is currently ${curState}`);
    }
  }

  /**
   * Returns the current state of the extension. IDLE is default value.
   * @param extId The ID of the extension
   */
  static getInstallationState(extId: string): ExtensionInstallationState {
    if (ExtensionInstallationStateStore.InstallingExtensions.has(extId)) {
      return ExtensionInstallationState.INSTALLING;
    }

    if (ExtensionInstallationStateStore.UninstallingExtensions.has(extId)) {
      return ExtensionInstallationState.UNINSTALLING;
    }

    return ExtensionInstallationState.IDLE;
  }

  /**
   * Returns true if the extension is currently INSTALLING
   * @param extId The ID of the extension
   */
  static isExtensionInstalling(extId: string): boolean {
    return ExtensionInstallationStateStore.getInstallationState(extId) === ExtensionInstallationState.INSTALLING;
  }

  /**
   * Returns true if the extension is currently UNINSTALLING
   * @param extId The ID of the extension
   */
  static isExtensionUninstalling(extId: string): boolean {
    return ExtensionInstallationStateStore.getInstallationState(extId) === ExtensionInstallationState.UNINSTALLING;
  }

  /**
   * Returns true if the extension is currently IDLE
   * @param extId The ID of the extension
   */
  static isExtensionIdle(extId: string): boolean {
    return ExtensionInstallationStateStore.getInstallationState(extId) === ExtensionInstallationState.IDLE;
  }

  /**
   * The current number of extensions installing
   */
  @computed static get installing(): number {
    return ExtensionInstallationStateStore.InstallingExtensions.size;
  }

  /**
   * The current number of extensions uninstalling
   */
  static get uninstalling(): number {
    return ExtensionInstallationStateStore.UninstallingExtensions.size;
  }

  /**
   * If there is at least one extension currently installing
   */
  static get anyInstalling(): boolean {
    return ExtensionInstallationStateStore.installing > 0;
  }

  /**
   * If there is at least one extension currently uninstalling
   */
  static get anyUninstalling(): boolean {
    return ExtensionInstallationStateStore.uninstalling > 0;
  }

  /**
   * The current number of extensions preinstalling
   */
  static get preinstalling(): number {
    return ExtensionInstallationStateStore.PreInstallIds.size;
  }

  /**
   * If there is at least one extension currently downloading
   */
  static get anyPreinstalling(): boolean {
    return ExtensionInstallationStateStore.preinstalling > 0;
  }

  /**
    * If there is at least one installing or preinstalling step taking place
    */
  static get anyPreInstallingOrInstalling(): boolean {
    return ExtensionInstallationStateStore.anyInstalling || ExtensionInstallationStateStore.anyPreinstalling;
  }
}
