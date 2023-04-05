/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { kebabCase } from "lodash";
import { getGlobalOverride } from "@k8slens/test-utils";
import electronAppInjectable from "./electron-app.injectable";
import EventEmitter from "events";
import { getOrInsert } from "@k8slens/utilities";

export default getGlobalOverride(electronAppInjectable, () => {
  const commandLineArgs: string[] = [];
  const chromiumArgs = new Map<string, string | undefined>();
  const appPaths = new Map<string, string>();

  return new class extends EventEmitter implements Electron.App {
    addRecentDocument(path: string): void {
      void path;
      throw new Error("Method not implemented.");
    }
    clearRecentDocuments(): void {
      throw new Error("Method not implemented.");
    }
    configureHostResolver(options: Electron.ConfigureHostResolverOptions): void {
      void options;
      throw new Error("Method not implemented.");
    }
    disableDomainBlockingFor3DAPIs(): void {
      throw new Error("Method not implemented.");
    }
    enableSandbox(): void {
      throw new Error("Method not implemented.");
    }
    getApplicationInfoForProtocol(url: string): Promise<Electron.ApplicationInfoForProtocolReturnValue> {
      void url;
      throw new Error("Method not implemented.");
    }
    getApplicationNameForProtocol(url: string): string {
      void url;
      throw new Error("Method not implemented.");
    }
    getAppMetrics(): Electron.ProcessMetric[] {
      throw new Error("Method not implemented.");
    }
    getBadgeCount(): number {
      throw new Error("Method not implemented.");
    }
    getCurrentActivityType(): string {
      throw new Error("Method not implemented.");
    }
    getFileIcon(path: string, options?: Electron.FileIconOptions | undefined): Promise<Electron.NativeImage> {
      void path;
      void options;
      throw new Error("Method not implemented.");
    }
    getGPUFeatureStatus(): Electron.GPUFeatureStatus {
      throw new Error("Method not implemented.");
    }
    getGPUInfo(infoType: "basic" | "complete"): Promise<unknown> {
      void infoType;
      throw new Error("Method not implemented.");
    }
    getJumpListSettings(): Electron.JumpListSettings {
      throw new Error("Method not implemented.");
    }
    getLocale(): string {
      throw new Error("Method not implemented.");
    }
    getLocaleCountryCode(): string {
      throw new Error("Method not implemented.");
    }
    getName(): string {
      throw new Error("Method not implemented.");
    }
    getPreferredSystemLanguages(): ("app.getLocale()" | "app.getSystemLocale()" | "app.getPreferredSystemLanguages()")[] {
      throw new Error("Method not implemented.");
    }
    getSystemLocale(): string {
      throw new Error("Method not implemented.");
    }
    hasSingleInstanceLock(): boolean {
      throw new Error("Method not implemented.");
    }
    hide(): void {
      throw new Error("Method not implemented.");
    }
    importCertificate(options: Electron.ImportCertificateOptions, callback: (result: number) => void): void {
      void options;
      void callback;
      throw new Error("Method not implemented.");
    }
    invalidateCurrentActivity(): void {
      throw new Error("Method not implemented.");
    }
    isAccessibilitySupportEnabled(): boolean {
      throw new Error("Method not implemented.");
    }
    isDefaultProtocolClient(protocol: string, path?: string | undefined, args?: string[] | undefined): boolean {
      void protocol;
      void path;
      void args;
      throw new Error("Method not implemented.");
    }
    isEmojiPanelSupported(): boolean {
      throw new Error("Method not implemented.");
    }
    isHidden(): boolean {
      throw new Error("Method not implemented.");
    }
    isInApplicationsFolder(): boolean {
      throw new Error("Method not implemented.");
    }
    isReady(): boolean {
      throw new Error("Method not implemented.");
    }
    isSecureKeyboardEntryEnabled(): boolean {
      throw new Error("Method not implemented.");
    }
    isUnityRunning(): boolean {
      throw new Error("Method not implemented.");
    }
    moveToApplicationsFolder(options?: Electron.MoveToApplicationsFolderOptions | undefined): boolean {
      void options;
      throw new Error("Method not implemented.");
    }
    relaunch(options?: Electron.RelaunchOptions | undefined): void {
      void options;
      throw new Error("Method not implemented.");
    }
    releaseSingleInstanceLock(): void {
      throw new Error("Method not implemented.");
    }
    removeAsDefaultProtocolClient(protocol: string, path?: string | undefined, args?: string[] | undefined): boolean {
      void protocol;
      void path;
      void args;
      throw new Error("Method not implemented.");
    }
    resignCurrentActivity(): void {
      throw new Error("Method not implemented.");
    }
    setAboutPanelOptions(options: Electron.AboutPanelOptionsOptions): void {
      void options;
      throw new Error("Method not implemented.");
    }
    setAccessibilitySupportEnabled(enabled: boolean): void {
      void enabled;
      throw new Error("Method not implemented.");
    }
    setActivationPolicy(policy: "regular" | "accessory" | "prohibited"): void {
      void policy;
      throw new Error("Method not implemented.");
    }
    setAppLogsPath(path?: string | undefined): void {
      void path;
      throw new Error("Method not implemented.");
    }
    setAppUserModelId(id: string): void {
      void id;
      throw new Error("Method not implemented.");
    }
    setAsDefaultProtocolClient(protocol: string, path?: string | undefined, args?: string[] | undefined): boolean {
      void protocol;
      void path;
      void args;
      throw new Error("Method not implemented.");
    }
    setBadgeCount(count?: number | undefined): boolean {
      void count;
      throw new Error("Method not implemented.");
    }
    setJumpList(categories: Electron.JumpListCategory[] | null): "error" | "ok" | "invalidSeparatorError" | "fileTypeRegistrationError" | "customCategoryAccessDeniedError" {
      void categories;
      throw new Error("Method not implemented.");
    }
    setName(name: string): void {
      void name;
      throw new Error("Method not implemented.");
    }
    setSecureKeyboardEntryEnabled(enabled: boolean): void {
      void enabled;
      throw new Error("Method not implemented.");
    }
    setUserActivity(type: string, userInfo: any, webpageURL?: string | undefined): void {
      void type;
      void userInfo;
      void webpageURL;
      throw new Error("Method not implemented.");
    }
    setUserTasks(tasks: Electron.Task[]): boolean {
      void tasks;
      throw new Error("Method not implemented.");
    }
    show(): void {
      throw new Error("Method not implemented.");
    }
    showAboutPanel(): void {
      throw new Error("Method not implemented.");
    }
    showEmojiPanel(): void {
      throw new Error("Method not implemented.");
    }
    startAccessingSecurityScopedResource(bookmarkData: string): Function {
      void bookmarkData;
      throw new Error("Method not implemented.");
    }
    updateCurrentActivity(type: string, userInfo: any): void {
      void type;
      void userInfo;
      throw new Error("Method not implemented.");
    }

    accessibilitySupportEnabled = false;
    applicationMenu: Electron.Menu | null = null;
    badgeCount = 0;
    dock!: Electron.Dock;
    isPackaged = false;
    name = "some-application-name";
    runningUnderARM64Translation = false;
    runningUnderRosettaTranslation = false;
    userAgentFallback = "some-user-agent-fallback";

    getVersion() {
      return "6.0.0";
    }

    requestSingleInstanceLock() {
      return true;
    }

    setLoginItemSettings() {}
    quit() {}
    exit() {}
    focus() {}
    disableHardwareAcceleration() {}
    async whenReady() {}

    getPath(name: string) {
      return getOrInsert(appPaths, name, `/some-directory-for-${kebabCase(name)}`);
    }

    setPath(name: string, value: string) {
      appPaths.set(name, value);
    }

    getAppPath() {
      return "/some-path-to-the-application-binary";
    }

    commandLine = {
      appendArgument: (value) => commandLineArgs.push(value),
      appendSwitch: (key, value) => chromiumArgs.set(key, value),
      getSwitchValue: (key) => chromiumArgs.get(key),
      hasSwitch: (key) => chromiumArgs.has(key),
      removeSwitch: (key) => chromiumArgs.delete(key),
    } as Electron.CommandLine;

    getLoginItemSettings() {
      return {
        executableWillLaunchAtLogin: false,
        openAtLogin: false,
        openAsHidden: false,
        wasOpenedAtLogin: false,
        wasOpenedAsHidden: false,
        restoreState: false,
        launchItems: [],
      };
    }
  };
});
