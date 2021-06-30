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

import moment from "moment-timezone";
import path from "path";
import os from "os";
import { ThemeStore } from "../../renderer/theme.store";
import { ObservableToggleSet } from "../utils";
import type {monaco} from "react-monaco-editor";

export interface KubeconfigSyncEntry extends KubeconfigSyncValue {
  filePath: string;
}

export interface KubeconfigSyncValue { }

export interface EditorConfiguration {
  miniMap?: monaco.editor.IEditorMinimapOptions;
  lineNumbers?: monaco.editor.LineNumbersType;
  tabSize?: number;
}


export enum EditorType {
  TABS = "tabs",
  DETAILS = "details",
  KUBECONFIG = "kubeconfig",
  ADD_CLUSTER = "add-cluster"
}

const defaultEditorConfig :[EditorType, EditorConfiguration][] = [
  [EditorType.TABS, {miniMap: {enabled: true}, lineNumbers: "on", tabSize: 4}],
  [EditorType.DETAILS, {miniMap: {enabled: false}, lineNumbers: "on", tabSize: 2}],
  [EditorType.ADD_CLUSTER, {miniMap: {enabled: false}, lineNumbers: "on", tabSize: 2}],
  [EditorType.KUBECONFIG, {miniMap: {enabled: false}, lineNumbers: "off", tabSize: 2}]];

interface PreferenceDescription<T, R = T> {
  fromStore(val: T | undefined): R;
  toStore(val: R): T | undefined;
}

const httpsProxy: PreferenceDescription<string | undefined> = {
  fromStore(val) {
    return val;
  },
  toStore(val) {
    return val || undefined;
  },
};

const shell: PreferenceDescription<string | undefined> = {
  fromStore(val) {
    return val;
  },
  toStore(val) {
    return val || undefined;
  },
};

const colorTheme: PreferenceDescription<string> = {
  fromStore(val) {
    return val || ThemeStore.defaultTheme;
  },
  toStore(val) {
    if (!val || val === ThemeStore.defaultTheme) {
      return undefined;
    }

    return val;
  },
};

const localeTimezone: PreferenceDescription<string> = {
  fromStore(val) {
    return val || moment.tz.guess(true) || "UTC";
  },
  toStore(val) {
    if (!val || val === moment.tz.guess(true) || val === "UTC") {
      return undefined;
    }

    return val;
  },
};

const allowUntrustedCAs: PreferenceDescription<boolean> = {
  fromStore(val) {
    return val ?? false;
  },
  toStore(val) {
    if (!val) {
      return undefined;
    }

    return val;
  },
};

const allowTelemetry: PreferenceDescription<boolean> = {
  fromStore(val) {
    return val ?? true;
  },
  toStore(val) {
    if (val === true) {
      return undefined;
    }

    return val;
  },
};

const allowErrorReporting: PreferenceDescription<boolean> = {
  fromStore(val) {
    return val ?? true;
  },
  toStore(val) {
    if (val === true) {
      return undefined;
    }

    return val;
  },
};

const downloadMirror: PreferenceDescription<string> = {
  fromStore(val) {
    return val ?? "default";
  },
  toStore(val) {
    if (!val || val === "default") {
      return undefined;
    }

    return val;
  },
};

const downloadKubectlBinaries: PreferenceDescription<boolean> = {
  fromStore(val) {
    return val ?? true;
  },
  toStore(val) {
    if (val === true) {
      return undefined;
    }

    return val;
  },
};

const downloadBinariesPath: PreferenceDescription<string | undefined> = {
  fromStore(val) {
    return val;
  },
  toStore(val) {
    if (!val) {
      return undefined;
    }

    return val;
  },
};

const kubectlBinariesPath: PreferenceDescription<string | undefined> = {
  fromStore(val) {
    return val;
  },
  toStore(val) {
    if (!val) {
      return undefined;
    }

    return val;
  },
};

const openAtLogin: PreferenceDescription<boolean> = {
  fromStore(val) {
    return val ?? false;
  },
  toStore(val) {
    if (!val) {
      return undefined;
    }

    return val;
  },
};

const hiddenTableColumns: PreferenceDescription<[string, string[]][], Map<string, ObservableToggleSet<string>>> = {
  fromStore(val) {
    return new Map(
      (val ?? []).map(([tableId, columnIds]) => [tableId, new ObservableToggleSet(columnIds)])
    );
  },
  toStore(val) {
    const res: [string, string[]][] = [];

    for (const [table, columnes] of val) {
      if (columnes.size) {
        res.push([table, Array.from(columnes)]);
      }
    }

    return res.length ? res : undefined;
  },
};

const mainKubeFolder = path.join(os.homedir(), ".kube");

const syncKubeconfigEntries: PreferenceDescription<KubeconfigSyncEntry[], Map<string, KubeconfigSyncValue>> = {
  fromStore(val) {
    return new Map(
      val
        ?.map(({ filePath, ...rest }) => [filePath, rest])
      ?? [[mainKubeFolder, {}]]
    );
  },
  toStore(val) {
    if (val.size === 1 && val.has(mainKubeFolder)) {
      return undefined;
    }

    return Array.from(val, ([filePath, rest]) => ({ filePath, ...rest }));
  },
};

const editorConfiguration: PreferenceDescription<[EditorType, EditorConfiguration][], Map<EditorType, EditorConfiguration>> = {
  fromStore(val) {
    return new Map(
      (val??defaultEditorConfig).map(([type, config]) => [type, config])
    );
  },
  toStore(val) {
    return Array.from(val, ([type, config]) => ([ type, config ]));
  },
};

type PreferencesModelType<field extends keyof typeof DESCRIPTORS> = typeof DESCRIPTORS[field] extends PreferenceDescription<infer T, any> ? T : never;
type UserStoreModelType<field extends keyof typeof DESCRIPTORS> = typeof DESCRIPTORS[field] extends PreferenceDescription<any, infer T> ? T : never;

export type UserStoreFlatModel = {
  [field in keyof typeof DESCRIPTORS]: UserStoreModelType<field>;
};

export type UserPreferencesModel = {
  [field in keyof typeof DESCRIPTORS]: PreferencesModelType<field>;
};

export const DESCRIPTORS = {
  httpsProxy,
  shell,
  colorTheme,
  localeTimezone,
  allowUntrustedCAs,
  allowTelemetry,
  allowErrorReporting,
  downloadMirror,
  downloadKubectlBinaries,
  downloadBinariesPath,
  kubectlBinariesPath,
  openAtLogin,
  hiddenTableColumns,
  syncKubeconfigEntries,
  editorConfiguration,
};
