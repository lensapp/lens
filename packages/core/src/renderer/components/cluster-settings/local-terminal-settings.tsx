/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import type { Cluster } from "../../../common/cluster/cluster";
import { Input } from "../input";
import { SubTitle } from "../layout/sub-title";
import type { ShowNotification } from "@k8slens/notifications";
import { Icon } from "@k8slens/icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import { showErrorNotificationInjectable } from "@k8slens/notifications";
import type { ValidateDirectory } from "../../../common/fs/validate-directory.injectable";
import validateDirectoryInjectable from "../../../common/fs/validate-directory.injectable";
import type { ResolveTilde } from "../../../common/path/resolve-tilde.injectable";
import resolveTildeInjectable from "../../../common/path/resolve-tilde.injectable";
import Gutter from "../gutter/gutter";
import isWindowsInjectable from "../../../common/vars/is-windows.injectable";
import type { OpenPathPickingDialog } from "../../../features/path-picking-dialog/renderer/pick-paths.injectable";
import openPathPickingDialogInjectable from "../../../features/path-picking-dialog/renderer/pick-paths.injectable";
import type { LocalTerminalSettingPresenter } from "./local-terminal-setting-presenter.injectable";
import localTerminalSettingPresenterInjectable from "./local-terminal-setting-presenter.injectable";
import { Spinner } from "@k8slens/spinner";
import { action, runInAction } from "mobx";

export interface ClusterLocalTerminalSettingProps {
  cluster: Cluster;
}
interface Dependencies {
  showErrorNotification: ShowNotification;
  validateDirectory: ValidateDirectory;
  resolveTilde: ResolveTilde;
  openPathPickingDialog: OpenPathPickingDialog;
  isWindows: boolean;
  presenter: LocalTerminalSettingPresenter;
}

const NonInjectedClusterLocalTerminalSetting = observer((props: Dependencies & ClusterLocalTerminalSettingProps) => {
  const {
    cluster,
    showErrorNotification,
    validateDirectory,
    resolveTilde,
    isWindows,
    openPathPickingDialog,
    presenter,
  } = props;
  const commitDirectory = async (directory: string) => {
    if (!directory) {
      runInAction(() => {
        cluster.preferences.terminalCWD = undefined;
      });

      return;
    }

    const dir = resolveTilde(directory);
    const result = await validateDirectory(dir);

    if (result.callWasSuccessful) {
      runInAction(() => {
        cluster.preferences.terminalCWD = dir;
        presenter.directory.set(dir);
      });

      return;
    }

    showErrorNotification(
      <>
        <b>Terminal Working Directory</b>
        <p>
          {"Your changes were not saved because "}
          {result.error}
        </p>
      </>,
    );
  };

  const commitDefaultNamespace = action(() => {
    cluster.preferences.defaultNamespace = presenter.defaultNamespace.get() || undefined;
  });

  const setAndCommitDirectory = (newPath: string) => {
    presenter.directory.set(newPath);
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
          value={presenter.directory.get()}
          data-testid="working-directory"
          onChange={value => presenter.directory.set(value)}
          onBlur={() => commitDirectory(presenter.directory.get())}
          placeholder={isWindows ? "$USERPROFILE" : "$HOME"}
          iconRight={(
            <>
              {
                presenter.directory.get() && (
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
          value={presenter.defaultNamespace.get()}
          onChange={value => presenter.defaultNamespace.set(value)}
          onBlur={commitDefaultNamespace}
          placeholder={presenter.placeholderDefaultNamespace}
        />
        <small className="hint">
          Default namespace used for kubectl.
        </small>
      </section>
    </>
  );
});

export const ClusterLocalTerminalSetting = withInjectables<Dependencies, ClusterLocalTerminalSettingProps>(NonInjectedClusterLocalTerminalSetting, {
  getPlaceholder: () => <Spinner center />,
  getProps: async (di, props) => ({
    ...props,
    showErrorNotification: di.inject(showErrorNotificationInjectable),
    validateDirectory: di.inject(validateDirectoryInjectable),
    resolveTilde: di.inject(resolveTildeInjectable),
    isWindows: di.inject(isWindowsInjectable),
    openPathPickingDialog: di.inject(openPathPickingDialogInjectable),
    presenter: await di.inject(localTerminalSettingPresenterInjectable, props.cluster),
  }),
});
