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

import { observer } from "mobx-react";
import moment from "moment";
import React from "react";
import { getDefaultKubectlDownloadPath, UserStore } from "../../common/user-store";
import { isWindows, sentryDsn } from "../../common/vars";
import { AppPreferenceKind, AppPreferenceRegistry } from "../../extensions/registries";
import { bundledKubectlPath, downloadMirrorOptions } from "../../main/kubectl";
import { HelmCharts } from "../components/+preferences/helm-charts";
import { KubeconfigSyncs } from "../components/+preferences/kubeconfig-syncs";
import { Button } from "../components/button";
import { Checkbox } from "../components/checkbox";
import { Input } from "../components/input";
import { PathPicker } from "../components/path-picker";
import { Select, SelectOption } from "../components/select";
import { FormSwitch, Switcher } from "../components/switch";
import { ThemeStore } from "../theme.store";

export function initAppPreferenceRegistry() {
  AppPreferenceRegistry.getInstance()
    .add([
      {
        id: "appearance",
        title: "Theme",
        components: {
          Input: observer(() => (
            <Select
              options={ThemeStore.getInstance().themeOptions}
              value={UserStore.getInstance().colorTheme}
              onChange={({ value }: SelectOption<string>) => UserStore.getInstance().colorTheme = value}
              themeName="lens"
            />
          )),
        },
        showInPreferencesTab: AppPreferenceKind.Application,
      },
      {
        id: "shell",
        title: "Terminal Shell Path",
        components: {
          Input: observer(() => (
            <Input
              theme="round-black"
              placeholder={(
                process.env.SHELL
                || process.env.PTYSHELL
                || (
                  isWindows
                    ? "powershell.exe"
                    : "System default shell"
                )
              )}
              onBlur={(evt) => UserStore.getInstance().shell = evt.target.innerText}
            />
          )),
        },
        showInPreferencesTab: AppPreferenceKind.Application,
      },
      {
        id: "start-up",
        title: "Start-up",
        components: {
          Input: observer(() => (
            <FormSwitch
              control={
                <Switcher
                  checked={UserStore.getInstance().openAtLogin}
                  onChange={v => UserStore.getInstance().openAtLogin = v.target.checked}
                  name="startup"
                />
              }
              label="Automatically start Lens on login"
            />
          )),
        },
        showInPreferencesTab: AppPreferenceKind.Application,
      },
      {
        id: "locale",
        title: "Locale Timezone",
        components: {
          Input: observer(() => (
            <Select
              options={moment.tz.names()}
              value={UserStore.getInstance().localeTimezone}
              onChange={({ value }: SelectOption) => UserStore.getInstance().setLocaleTimezone(value)}
              themeName="lens"
            />
          )),
        },
        showInPreferencesTab: AppPreferenceKind.Application,
      },
      {
        id: "http-proxy",
        title: "HTTP Proxy",
        components: {
          Input: observer(() => (
            <Input
              theme="round-black"
              placeholder="Type HTTP proxy url (example: http://proxy.acme.org:8080)"
              onBlur={(evt) => UserStore.getInstance().httpsProxy = evt.target.innerText}
            />
          )),
          Hint: () => <>Proxy is used only for non-cluster communication.</>,
        },
        showInPreferencesTab: AppPreferenceKind.Proxy,
      },
      {
        id: "certificate-trust",
        title: "Certificate Trust",
        components: {
          Input: observer(() => (
            <FormSwitch
              control={
                <Switcher
                  checked={UserStore.getInstance().allowUntrustedCAs}
                  onChange={v => UserStore.getInstance().allowUntrustedCAs = v.target.checked}
                  name="startup"
                />
              }
              label="Allow untrusted Certificate Authorities"
            />
          )),
          Hint: () => (
            <>
              This will make Lens to trust ANY certificate authority without any validations.{" "}
              Needed with some corporate proxies that do certificate re-writing.{" "}
              Does not affect cluster communications!
            </>
          ),
        },
        showInPreferencesTab: AppPreferenceKind.Proxy,
      },
      {
        id: "kubectl-binary-download",
        title: "Kubectl binary download",
        components: {
          Input: observer(() => (
            <FormSwitch
              control={
                <Switcher
                  checked={UserStore.getInstance().downloadKubectlBinaries}
                  onChange={v => UserStore.getInstance().downloadKubectlBinaries = v.target.checked}
                  name="kubectl-download"
                />
              }
              label="Download kubectl binaries matching the Kubernetes cluster version"
            />
          )),
        },
        showInPreferencesTab: AppPreferenceKind.Kubernetes,
      },
      {
        id: "kubectl-download-mirror",
        title: "Kubectl Download mirror",
        components: {
          Input: observer(() => (
            <Select
              placeholder="Download mirror for kubectl"
              options={downloadMirrorOptions}
              value={UserStore.getInstance().downloadMirror}
              onChange={({ value }: SelectOption) => UserStore.getInstance().downloadMirror = value}
              disabled={!UserStore.getInstance().downloadKubectlBinaries}
              themeName="lens"
            />
          )),
        },
        showInPreferencesTab: AppPreferenceKind.Kubernetes,
      },
      {
        id: "kubectl-download-directory",
        title: "Directory for Kubectl binaries",
        components: {
          Input: observer(() => (
            <>
              <p>Current Directory:</p>
              <code className="overflow-x-scroll whitespace-nowrap">
                {UserStore.getInstance().downloadBinariesPath || getDefaultKubectlDownloadPath()}
              </code>
              <div className="flex gaps align-center">
                <PathPicker
                  className="box grow"
                  label="Select target directory"
                  onPick={([dirPath]) => UserStore.getInstance().downloadBinariesPath = dirPath}
                  buttonLabel="Select"
                  properties={["showHiddenFiles", "openDirectory"]}
                  disabled={!UserStore.getInstance().downloadKubectlBinaries}
                />
                <Button
                  className="box"
                  accent
                  label="Clear"
                  onClick={() => UserStore.getInstance().downloadBinariesPath = undefined}
                  disabled={!UserStore.getInstance().downloadKubectlBinaries || !UserStore.getInstance().downloadBinariesPath}
                />
              </div>
            </>
          )),
          Hint: () => <>The directory to download binaries into.</>,
        },
        showInPreferencesTab: AppPreferenceKind.Kubernetes,
      },
      {
        id: "kubectl-path",
        title: "Path to kubectl binary",
        components: {
          Input: observer(() => (
            <>
              <p>Current kubectl path:</p>
              <code className="overflow-x-scroll whitespace-nowrap">
                {UserStore.getInstance().kubectlBinariesPath || bundledKubectlPath()}
              </code>
              <label>{UserStore.getInstance().kubectlBinariesPath}</label>
              <div className="flex gaps align-center">
                <PathPicker
                  className="box grow"
                  label="Select kubectl binary"
                  onPick={([binPath]) => UserStore.getInstance().kubectlBinariesPath = binPath}
                  buttonLabel="Select"
                  properties={["showHiddenFiles", "openFile"]}
                  disabled={UserStore.getInstance().downloadKubectlBinaries}
                />
                <Button
                  className="box"
                  accent
                  label="Clear"
                  onClick={() => UserStore.getInstance().kubectlBinariesPath = undefined}
                  disabled={UserStore.getInstance().downloadKubectlBinaries || !UserStore.getInstance().kubectlBinariesPath}
                />
              </div>
            </>
          )),
        },
        showInPreferencesTab: AppPreferenceKind.Kubernetes,
      },
      {
        id: "kube-sync",
        title: "Kubeconfig Syncs",
        components: {
          Input: KubeconfigSyncs,
          Hint: () => (
            <>
              Sync an individual file or all files in a folder (non-recursive).
            </>
          )
        },
        showInPreferencesTab: AppPreferenceKind.Kubernetes,
      },
      {
        id: "helm",
        title: "Helm Charts",
        components: {
          Input: HelmCharts,
        },
        showInPreferencesTab: AppPreferenceKind.Kubernetes,
      },
      {
        id: "sentry",
        title: "Automatic Error Reporting",
        components: {
          Input: () => (
            <Checkbox
              label="Allow automatic error reporting"
              value={UserStore.getInstance().allowErrorReporting}
              onChange={value => {
                UserStore.getInstance().allowErrorReporting = value;
              }}
            />
          ),
          Hint: () => (
            <>
              Automatic error reports provide vital information about issues and application crashes.{" "}
              It is highly recommended to keep this feature enabled to ensure fast turnaround for issues you might encounter.
            </>
          )
        },
        showInPreferencesTab: AppPreferenceKind.Telemetry,
        hide: Boolean(sentryDsn),
      }
    ]);
}
