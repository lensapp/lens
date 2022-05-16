/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import type { Cluster } from "../../../../common/cluster/cluster";
import { Input } from "../../input";
import { SubTitle } from "../../layout/sub-title";
import { stat } from "fs/promises";
import { Notifications } from "../../notifications";
import { isErrnoException, resolveTilde } from "../../../utils";
import { Icon } from "../../icon";
import { PathPicker } from "../../path-picker";
import { isWindows } from "../../../../common/vars";
import type { Stats } from "fs";
import logger from "../../../../common/logger";
import { lowerFirst } from "lodash";

export interface ClusterLocalTerminalSettingProps {
  cluster: Cluster;
}

function getUserReadableFileType(stats: Stats): string {
  if (stats.isFile()) {
    return "a file";
  }

  if (stats.isFIFO()) {
    return "a pipe";
  }

  if (stats.isSocket()) {
    return "a socket";
  }

  if (stats.isBlockDevice()) {
    return "a block device";
  }

  if (stats.isCharacterDevice()) {
    return "a character device";
  }

  return "an unknown file type";
}

/**
 * Validate that `dir` currently points to a directory. If so return `false`.
 * Otherwise, return a user readable error message string for displaying.
 * @param dir The path to be validated
 */
async function validateDirectory(dir: string): Promise<string | false> {
  try {
    const stats = await stat(dir);

    if (stats.isDirectory()) {
      return false;
    }

    return `the provided path is ${getUserReadableFileType(stats)} and not a directory.`;
  } catch (error) {
    switch (isErrnoException(error) ? error.code : undefined) {
      case "ENOENT":
        return `the provided path does not exist.`;
      case "EACCES":
        return `search permissions is denied for one of the directories in the prefix of the provided path.`;
      case "ELOOP":
        return `the provided path is a sym-link which points to a chain of sym-links that is too long to resolve. Perhaps it is cyclic.`;
      case "ENAMETOOLONG":
        return `the pathname is too long to be used.`;
      case "ENOTDIR":
        return `a prefix of the provided path is not a directory.`;
      default:
        logger.warn(`[CLUSTER-LOCAL-TERMINAL-SETTINGS]: unexpected error in validateDirectory for resolved path=${dir}`, error);

        return error ? lowerFirst(String(error)) : "of an unknown error, please try again.";
    }
  }
}

export const ClusterLocalTerminalSetting = observer(({ cluster }: ClusterLocalTerminalSettingProps) => {
  if (!cluster) {
    return null;
  }

  const [directory, setDirectory] = useState<string>(cluster.preferences?.terminalCWD || "");
  const [defaultNamespace, setDefaultNamespaces] = useState<string>(cluster.preferences?.defaultNamespace || "");
  const [placeholderDefaultNamespace, setPlaceholderDefaultNamespace] = useState("default");

  useEffect(() => {
    (async () => {
      const kubeconfig = await cluster.getKubeconfig();
      const { namespace } = kubeconfig.getContextObject(cluster.contextName) ?? {};

      if (namespace) {
        setPlaceholderDefaultNamespace(namespace);
      }
    })();
    setDirectory(cluster.preferences?.terminalCWD || "");
    setDefaultNamespaces(cluster.preferences?.defaultNamespace || "");
  }, [cluster]);

  const commitDirectory = async (directory: string) => {
    cluster.preferences ??= {};

    if (!directory) {
      cluster.preferences.terminalCWD = undefined;
    } else {
      const dir = resolveTilde(directory);
      const errorMessage = await validateDirectory(dir);

      if (errorMessage) {
        Notifications.error(
          <>
            <b>Terminal Working Directory</b>
            <p>
              {"Your changes were not saved because "}
              {errorMessage}
            </p>
          </>,
        );
      } else {
        cluster.preferences.terminalCWD = dir;
        setDirectory(dir);
      }
    }
  };

  const commitDefaultNamespace = () => {
    cluster.preferences ??= {};
    cluster.preferences.defaultNamespace = defaultNamespace || undefined;
  };

  const setAndCommitDirectory = (newPath: string) => {
    setDirectory(newPath);
    commitDirectory(newPath);
  };

  const openFilePicker = () => {
    PathPicker.pick({
      label: "Choose Working Directory",
      buttonLabel: "Pick",
      properties: ["openDirectory", "showHiddenFiles"],
      onPick: ([directory]) => setAndCommitDirectory(directory),
    });
  };

  return (
    <>
      <section className="working-directory">
        <SubTitle title="Working Directory"/>
        <Input
          theme="round-black"
          value={directory}
          data-testid="working-directory"
          onChange={setDirectory}
          onBlur={() => commitDirectory(directory)}
          placeholder={isWindows ? "$USERPROFILE" : "$HOME"}
          iconRight={(
            <>
              {
                directory && (
                  <Icon
                    material="close"
                    title="Clear"
                    onClick={() => setAndCommitDirectory("")}
                  />
                )
              }
              <Icon
                material="folder"
                title="Pick from filesystem"
                onClick={openFilePicker}
              />
            </>
          )}
        />
        <small className="hint">
          An explicit start path where the terminal will be launched,
          {" "}
          this is used as the current working directory (cwd) for the shell process.
        </small>
      </section>
      <section className="default-namespace">
        <SubTitle title="Default Namespace"/>
        <Input
          theme="round-black"
          data-testid="default-namespace"
          value={defaultNamespace}
          onChange={setDefaultNamespaces}
          onBlur={commitDefaultNamespace}
          placeholder={placeholderDefaultNamespace}
        />
        <small className="hint">
          Default namespace used for kubectl.
        </small>
      </section>
    </>
  );
});
