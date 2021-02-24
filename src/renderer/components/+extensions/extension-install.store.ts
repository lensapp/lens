import { action, computed, observable } from "mobx";
import logger from "../../../main/logger";
import { disposer, Disposer } from "../../utils";
import * as uuid from "uuid";

export enum ExtensionInstallationState {
  INSTALLING = "installing",
  UNINSTALLING = "uninstalling",
  IDLE = "IDLE",
}

const Prefix = "[ExtensionInstallationStore]";
const installingExtensions = observable.set<string>();
const uninstallingExtensions = observable.set<string>();
const preInstallIds = observable.set<string>();

export class ExtensionInstallationStateStore {
  @action static reset() {
    logger.warn(`${Prefix}: resetting, may throw errors`);
    installingExtensions.clear();
    uninstallingExtensions.clear();
    preInstallIds.clear();
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

    installingExtensions.add(extId);
  }

  /**
   * Marks the start of a pre-install phase of an extension installation. The
   * part of the installation before the tarball has been unpacked and the ID
   * determined.
   * @returns a disposer which should be called to mark the end of the install phase
   */
  @action static startPreInstall(): Disposer {
    const preInstallStepId = uuid.v4();

    logger.debug(`${Prefix}: starting a new preinstall phase: ${preInstallStepId}`);
    preInstallIds.add(preInstallStepId);

    return disposer(() => {
      preInstallIds.delete(preInstallStepId);
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

    uninstallingExtensions.add(extId);
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
        return void installingExtensions.delete(extId);
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
        return void uninstallingExtensions.delete(extId);
      default:
        throw new Error(`${Prefix}: cannot clear UNINSTALLING state for ${extId}, it is currently ${curState}`);
    }
  }

  /**
   * Returns the current state of the extension. IDLE is default value.
   * @param extId The ID of the extension
   */
  static getInstallationState(extId: string): ExtensionInstallationState {
    if (installingExtensions.has(extId)) {
      return ExtensionInstallationState.INSTALLING;
    }

    if (uninstallingExtensions.has(extId)) {
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
    return installingExtensions.size;
  }

  /**
   * If there is at least one extension currently installing
   */
  @computed static get anyInstalling(): boolean {
    return ExtensionInstallationStateStore.installing > 0;
  }

  /**
   * The current number of extensions preinstallig
   */
  @computed static get preinstalling(): number {
    return preInstallIds.size;
  }

  /**
   * If there is at least one extension currently downloading
   */
  @computed static get anyPreinstalling(): boolean {
    return ExtensionInstallationStateStore.preinstalling > 0;
  }

  /**
   * If there is at least one installing or preinstalling step taking place
   */
  @computed static get anyPreInstallingOrInstalling(): boolean {
    return ExtensionInstallationStateStore.anyInstalling || ExtensionInstallationStateStore.anyPreinstalling;
  }
}
