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
import { getAppVersion, ObservableToggleSet } from "../utils";
import type { monaco } from "react-monaco-editor";
import merge from "lodash/merge";
import { SemVer } from "semver";

export interface KubeconfigSyncEntry extends KubeconfigSyncValue {
  filePath: string;
}

export interface KubeconfigSyncValue { }

export interface EditorConfiguration {
  miniMap?: monaco.editor.IEditorMinimapOptions;
  lineNumbers?: monaco.editor.LineNumbersType;
  tabSize?: number;
}

export const defaultEditorConfig: EditorConfiguration = {
  lineNumbers: "on",
  miniMap: {
    enabled: true,
  },
  tabSize: 2,
};

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

export interface DownloadMirror {
  url: string;
  label: string;
  platforms: Set<NodeJS.Platform>;
}

export const defaultPackageMirror = "default";
export const packageMirrors = new Map<string, DownloadMirror>([
  [defaultPackageMirror, {
    url: "https://storage.googleapis.com/kubernetes-release/release",
    label: "Default (Google)",
    platforms: new Set(["darwin", "win32", "linux"]),
  }],
  ["china", {
    url: "https://mirror.azure.cn/kubernetes/kubectl",
    label: "China (Azure)",
    platforms: new Set(["win32", "linux"]),
  }],
]);

const downloadMirror: PreferenceDescription<string> = {
  fromStore(val) {
    return packageMirrors.has(val) ? val : defaultPackageMirror;
  },
  toStore(val) {
    if (!val || val === defaultPackageMirror) {
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

const terminalCopyOnSelect: PreferenceDescription<boolean> = {
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
      (val ?? []).map(([tableId, columnIds]) => [tableId, new ObservableToggleSet(columnIds)]),
    );
  },
  toStore(val) {
    const res: [string, string[]][] = [];

    for (const [table, columns] of val) {
      if (columns.size) {
        res.push([table, Array.from(columns)]);
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
      ?? [[mainKubeFolder, {}]],
    );
  },
  toStore(val) {
    if (val.size === 1 && val.has(mainKubeFolder)) {
      return undefined;
    }

    return Array.from(val, ([filePath, rest]) => ({ filePath, ...rest }));
  },
};

const editorConfiguration: PreferenceDescription<EditorConfiguration, EditorConfiguration> = {
  fromStore(val) {
    return merge(defaultEditorConfig, val);
  },
  toStore(val) {
    return val;
  },
};

const updateChannels = new Map([
  ["latest", {
    label: "Stable",
  }],
  ["beta", {
    label: "Beta",
  }],
  ["alpha", {
    label: "Alpha",
  }],
]);
const defaultUpdateChannel = new SemVer(getAppVersion()).prerelease[0]?.toString() || "latest";

const updateChannel: PreferenceDescription<string> = {
  fromStore(val) {
    return updateChannels.has(val) ? val : defaultUpdateChannel;
  },
  toStore(val) {
    if (!updateChannels.has(val) || val === defaultUpdateChannel) {
      return undefined;
    }

    return val;
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
  terminalCopyOnSelect,
  updateChannel,
};

export const CONSTANTS = {
  updateChannels,
};
