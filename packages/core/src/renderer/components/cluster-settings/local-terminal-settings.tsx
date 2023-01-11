/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import type { Cluster } from "../../../common/cluster/cluster";
import { Input } from "../input";
import { SubTitle } from "../layout/sub-title";
import type { ShowNotification } from "../notifications";
import { Icon } from "../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import showErrorNotificationInjectable from "../notifications/show-error-notification.injectable";
import type { ValidateDirectory } from "../../../common/fs/validate-directory.injectable";
import validateDirectoryInjectable from "../../../common/fs/validate-directory.injectable";
import type { ResolveTilde } from "../../../common/path/resolve-tilde.injectable";
import resolveTildeInjectable from "../../../common/path/resolve-tilde.injectable";
import Gutter from "../gutter/gutter";
import isWindowsInjectable from "../../../common/vars/is-windows.injectable";
import type { OpenPathPickingDialog } from "../../../features/path-picking-dialog/renderer/pick-paths.injectable";
import openPathPickingDialogInjectable from "../../../features/path-picking-dialog/renderer/pick-paths.injectable";

export interface ClusterLocalTerminalSettingProps {
  cluster: Cluster;
}
interface Dependencies {
  showErrorNotification: ShowNotification;
  validateDirectory: ValidateDirectory;
  resolveTilde: ResolveTilde;
  openPathPickingDialog: OpenPathPickingDialog;
  isWindows: boolean;
}

const NonInjectedClusterLocalTerminalSetting = observer(({
  cluster,
  showErrorNotification,
  validateDirectory,
  resolveTilde,
  isWindows,
  openPathPickingDialog,
}: Dependencies & ClusterLocalTerminalSettingProps) => {
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
      const result = await validateDirectory(dir);

      if (!result.callWasSuccessful) {
        showErrorNotification(
          <>
            <b>Terminal Working Directory</b>
            <p>
              {"Your changes were not saved because "}
              {result.error}
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
    openPathPickingDialog({
      message: "Choose Working Directory",
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
                    smallest
                    style={{ marginRight: "var(--margin)" }}
                  />
                )
              }
              <Icon
                material="folder"
                title="Pick from filesystem"
                onClick={openFilePicker}
                smallest
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
      <Gutter />
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

export const ClusterLocalTerminalSetting = withInjectables<Dependencies, ClusterLocalTerminalSettingProps>(NonInjectedClusterLocalTerminalSetting, {
  getProps: (di, props) => ({
    ...props,
    showErrorNotification: di.inject(showErrorNotificationInjectable),
    validateDirectory: di.inject(validateDirectoryInjectable),
    resolveTilde: di.inject(resolveTildeInjectable),
    isWindows: di.inject(isWindowsInjectable),
    openPathPickingDialog: di.inject(openPathPickingDialogInjectable),
  }),
});
