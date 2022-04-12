/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import moment from "moment-timezone";
import path from "path";
import os from "os";
import { getAppVersion } from "../utils";
import type { editor } from "monaco-editor";
import merge from "lodash/merge";
import { SemVer } from "semver";
import { defaultTheme, defaultEditorFontFamily, defaultFontSize, defaultTerminalFontFamily } from "../vars";
import type { ObservableMap } from "mobx";
import { observable } from "mobx";
import { readonly } from "../utils/readonly";

export interface KubeconfigSyncEntry extends KubeconfigSyncValue {
  filePath: string;
}

export interface KubeconfigSyncValue {
}
export interface TerminalConfig {
  fontSize: number;
  fontFamily: string;
}

export const defaultTerminalConfig: TerminalConfig = {
  fontSize: defaultFontSize,
  fontFamily: defaultTerminalFontFamily,
};

interface BaseEditorConfiguration extends Required<Pick<editor.IStandaloneEditorConstructionOptions, "minimap" | "tabSize" | "fontSize" | "fontFamily">> {
  lineNumbers: NonNullable<Exclude<editor.IStandaloneEditorConstructionOptions["lineNumbers"], Function>>;
}

export type EditorConfiguration = Required<BaseEditorConfiguration>;

export const defaultEditorConfig: EditorConfiguration = {
  tabSize: 2,
  lineNumbers: "on",
  fontSize: defaultFontSize,
  fontFamily: defaultEditorFontFamily,
  minimap: {
    enabled: true,
    side: "right",
  },
};

export type StoreType<P> = P extends PreferenceDescription<unknown, infer Store>
  ? Store
  : never;

export interface PreferenceDescription<T, R = T> {
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
    return val || defaultTheme;
  },
  toStore(val) {
    if (!val || val === defaultTheme) {
      return undefined;
    }

    return val;
  },
};

const terminalTheme: PreferenceDescription<string> = {
  fromStore(val) {
    return val || "";
  },
  toStore(val) {
    return val || undefined;
  },
};

export const defaultLocaleTimezone = "UTC";

const localeTimezone: PreferenceDescription<string> = {
  fromStore(val) {
    return val || moment.tz.guess(true) || defaultLocaleTimezone;
  },
  toStore(val) {
    if (!val || val === moment.tz.guess(true) || val === defaultLocaleTimezone) {
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
const defaultDownloadMirrorData: DownloadMirror = {
  url: "https://storage.googleapis.com/kubernetes-release/release",
  label: "Default (Google)",
  platforms: new Set(["darwin", "win32", "linux"]),
};

export const packageMirrors = new Map<string, DownloadMirror>([
  [defaultPackageMirror, defaultDownloadMirrorData],
  ["china", {
    url: "https://mirror.azure.cn/kubernetes/kubectl",
    label: "China (Azure)",
    platforms: new Set(["win32", "linux"]),
  }],
]);

const downloadMirror: PreferenceDescription<string> = {
  fromStore(val) {
    return !val || !packageMirrors.has(val)
      ? defaultPackageMirror
      : val;
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

const hiddenTableColumns: PreferenceDescription<[string, string[]][], Map<string, Set<string>>> = {
  fromStore(val) {
    return new Map(
      (val ?? []).map(([tableId, columnIds]) => [tableId, new Set(columnIds)]),
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

const syncKubeconfigEntries: PreferenceDescription<KubeconfigSyncEntry[], ObservableMap<string, KubeconfigSyncValue>> = {
  fromStore(val) {
    return observable.map(
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

const editorConfiguration: PreferenceDescription<Partial<EditorConfiguration> | undefined, EditorConfiguration> = {
  fromStore(val) {
    return merge(defaultEditorConfig, val);
  },
  toStore(val) {
    return val;
  },
};

const terminalConfig: PreferenceDescription<TerminalConfig, TerminalConfig> = {
  fromStore(val) {
    return merge(defaultTerminalConfig, val);
  },
  toStore(val) {
    return val;
  },
};

export interface UpdateChannelInfo {
  label: string;
}

export const updateChannels = readonly(new Map<string, UpdateChannelInfo>([
  ["latest", {
    label: "Stable",
  }],
  ["beta", {
    label: "Beta",
  }],
  ["alpha", {
    label: "Alpha",
  }],
]));
export const defaultUpdateChannel = new SemVer(getAppVersion()).prerelease[0]?.toString() || "latest";

const updateChannel: PreferenceDescription<string> = {
  fromStore(val) {
    return !val || !updateChannels.has(val)
      ? defaultUpdateChannel
      : val;
  },
  toStore(val) {
    if (!updateChannels.has(val) || val === defaultUpdateChannel) {
      return undefined;
    }

    return val;
  },
};

export type ExtensionRegistryLocation = "default" | "npmrc" | "custom";

export type ExtensionRegistry = {
  location: "default" | "npmrc";
  customUrl?: undefined;
} | {
  location: "custom";
  customUrl: string;
};

export const defaultExtensionRegistryUrlLocation = "default";
export const defaultExtensionRegistryUrl = "https://registry.npmjs.org";

const extensionRegistryUrl: PreferenceDescription<ExtensionRegistry> = {
  fromStore(val) {
    return val ?? {
      location: defaultExtensionRegistryUrlLocation,
    };
  },
  toStore(val) {
    if (val.location === defaultExtensionRegistryUrlLocation) {
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
  terminalTheme,
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
  terminalConfig,
  updateChannel,
  extensionRegistryUrl,
};
