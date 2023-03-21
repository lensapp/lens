/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import assert from "assert";
import path from "path";
import { getGlobalOverride } from "@k8slens/test-utils";
import getConfigurationFileModelInjectable from "./get-configuration-file-model.injectable";
import type Config from "conf";
import readJsonSyncInjectable from "../fs/read-json-sync.injectable";
import writeJsonSyncInjectable from "../fs/write-json-sync.injectable";
import { get, has, set } from "lodash";
import semver from "semver";

const MIGRATION_KEY = `__internal__.migrations.version`;

const _isVersionInRangeFormat = (version: string) => {
  return semver.clean(version) === null;
};

const _shouldPerformMigration = (candidateVersion: string, previousMigratedVersion: string, versionToMigrate: string) => {
  if (_isVersionInRangeFormat(candidateVersion)) {
    if (previousMigratedVersion !== "0.0.0" && semver.satisfies(previousMigratedVersion, candidateVersion)) {
      return false;
    }

    return semver.satisfies(versionToMigrate, candidateVersion);
  }

  if (semver.lte(candidateVersion, previousMigratedVersion)) {
    return false;
  }

  if (semver.gt(candidateVersion, versionToMigrate)) {
    return false;
  }

  return true;
};

export default getGlobalOverride(getConfigurationFileModelInjectable, (di) => {
  const readJsonSync = di.inject(readJsonSyncInjectable);
  const writeJsonSync = di.inject(writeJsonSyncInjectable);

  return (options) => {
    assert(options.cwd, "Missing options.cwd");
    assert(options.configName, "Missing options.configName");
    assert(options.projectVersion, "Missing options.projectVersion");

    const configFilePath = path.posix.join(options.cwd, `${options.configName}.json`);
    let store: object = {};

    try {
      store = readJsonSync(configFilePath);
    } catch {
      // ignore
    }

    const config = {
      get store() {
        return store;
      },
      path: configFilePath,
      get: (key: string) => get(store, key),
      set: (key: string, value: unknown) => {
        let currentState: Partial<Record<string, unknown>>;

        try {
          currentState = readJsonSync(configFilePath);
        } catch {
          currentState = {};
        }

        writeJsonSync(configFilePath, {
          ...currentState,
          [key]: value,
        });
        store = readJsonSync(configFilePath);
      },
      delete: (key: string) => {
        let currentState: Partial<Record<string, unknown>>;

        try {
          currentState = readJsonSync(configFilePath);
        } catch {
          currentState = {};
        }

        delete currentState[key];

        writeJsonSync(configFilePath, currentState);
        store = readJsonSync(configFilePath);
      },
      has: (key: string) => has(store, key),
      clear: () => {
        writeJsonSync(configFilePath, {});
        store = readJsonSync(configFilePath);
      },
    } as Partial<Config> as Config<any>;

    // Migrate
    {
      const migrations = options.migrations ?? [];
      const versionToMigrate = options.projectVersion;
      let previousMigratedVersion = get(store, MIGRATION_KEY) || "0.0.0";
      const newerVersions = Object.entries(migrations)
        .filter(([candidateVersion]) => _shouldPerformMigration(candidateVersion, previousMigratedVersion, versionToMigrate));

      let storeBackup = { ...store };

      for (const [version, migration] of newerVersions) {
        try {
          migration(config);
          set(store, MIGRATION_KEY, version);
          previousMigratedVersion = version;
          storeBackup = { ...store };
        }
        catch (error) {
          store = storeBackup;
          throw new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${error}`);
        }
      }

      if (_isVersionInRangeFormat(previousMigratedVersion) || !semver.eq(previousMigratedVersion, versionToMigrate)) {
        set(store, MIGRATION_KEY, versionToMigrate);
      }
    }

    return config;
  };
});
