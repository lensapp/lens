/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./installed-extensions.module.scss";
import React, { useMemo } from "react";
import type { InstalledExtension } from "../../../extensions/extension-discovery/extension-discovery";
import { Icon } from "../icon";
import { List } from "../list/list";
import { MenuActions, MenuItem } from "../menu";
import { Spinner } from "../spinner";
import { cssNames, toJS } from "../../utils";
import { observer } from "mobx-react";
import type { Row } from "react-table";
import type { LensExtensionId } from "../../../extensions/lens-extension";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import initialDiscoveryLoadCompletedInjectable from "../../../features/extensions/discovery/common/initial-load-completed.injectable";
import type { GetExtensionInstallationPhase } from "../../../features/extensions/installation-states/renderer/get-phase.injectable";
import getExtensionInstallationPhaseInjectable from "../../../features/extensions/installation-states/renderer/get-phase.injectable";
import extensionsUninstallingCountInjectable from "../../../features/extensions/installation-states/renderer/uninstalling-count.injectable";

export interface InstalledExtensionsProps {
  extensions: InstalledExtension[];
  enable: (id: LensExtensionId) => void;
  disable: (id: LensExtensionId) => void;
  uninstall: (extension: InstalledExtension) => void;
}

interface Dependencies {
  initialDiscoveryLoadCompleted: IComputedValue<boolean>;
  getExtensionInstallationPhase: GetExtensionInstallationPhase;
  extensionsUninstallingCount: IComputedValue<number>;
}

function getStatus(extension: InstalledExtension) {
  if (!extension.isCompatible) {
    return "Incompatible";
  }

  return extension.isEnabled ? "Enabled" : "Disabled";
}

const NonInjectedInstalledExtensions = observer(({
  initialDiscoveryLoadCompleted,
  getExtensionInstallationPhase,
  extensions,
  uninstall,
  enable,
  disable,
  extensionsUninstallingCount,
}: Dependencies & InstalledExtensionsProps) => {
  const columns = useMemo(
    () => [
      {
        Header: "Name",
        accessor: "extension",
        width: 200,
        sortType: (rowA: Row, rowB: Row) => { // Custom sorting for extension name
          const nameA = extensions[rowA.index].manifest.name;
          const nameB = extensions[rowB.index].manifest.name;

          if (nameA > nameB) return -1;
          if (nameB > nameA) return 1;

          return 0;
        },
      },
      {
        Header: "Version",
        accessor: "version",
      },
      {
        Header: "Status",
        accessor: "status",
      },
      {
        Header: "",
        accessor: "actions",
        disableSortBy: true,
        width: 20,
        className: "actions",
      },
    ], [],
  );

  const data = useMemo(
    () => extensions.map(extension => {
      const { id, isEnabled, isCompatible, manifest } = extension;
      const { name, description, version } = manifest;
      const isUninstalling = getExtensionInstallationPhase(id) === "uninstalling";

      return {
        extension: (
          <div className={"flex items-start"}>
            <div>
              <div className={styles.extensionName}>{name}</div>
              <div className={styles.extensionDescription}>{description}</div>
            </div>
          </div>
        ),
        version,
        status: (
          <div className={cssNames({ [styles.enabled]: isEnabled, [styles.invalid]: !isCompatible })}>
            {getStatus(extension)}
          </div>
        ),
        actions: (
          <MenuActions
            id={`menu-actions-for-installed-extensions-for-${id}`}
            usePortal
            toolbar={false}>
            {isCompatible && (
              <>
                {isEnabled ? (
                  <MenuItem
                    disabled={isUninstalling}
                    onClick={() => disable(id)}
                  >
                    <Icon material="unpublished" />
                    <span className="title" aria-disabled={isUninstalling}>Disable</span>
                  </MenuItem>
                ) : (
                  <MenuItem
                    disabled={isUninstalling}
                    onClick={() => enable(id)}
                  >
                    <Icon material="check_circle" />
                    <span className="title" aria-disabled={isUninstalling}>Enable</span>
                  </MenuItem>
                )}
              </>
            )}

            <MenuItem
              disabled={isUninstalling}
              onClick={() => uninstall(extension)}
            >
              <Icon material="delete" />
              <span className="title" aria-disabled={isUninstalling}>Uninstall</span>
            </MenuItem>
          </MenuActions>
        ),
      };
    }), [toJS(extensions), extensionsUninstallingCount.get() > 0],
  );

  if (!initialDiscoveryLoadCompleted.get()) {
    return <div><Spinner center /></div>;
  }

  if (extensions.length == 0) {
    return (
      <div className="flex column h-full items-center justify-center">
        <Icon material="extension" className={styles.noItemsIcon}/>
        <h3 className="font-medium text-3xl mt-5 mb-2">
          There are no extensions installed.
        </h3>
        <p>Please use the form above to install or drag a tarball file here.</p>
      </div>
    );
  }

  return (
    <section data-testid="extensions-table">
      <List
        title={<h2 className={styles.title}>Installed extensions</h2>}
        columns={columns}
        data={data}
        items={extensions}
        filters={[
          (extension) => extension.manifest.name,
          (extension) => getStatus(extension),
          (extension) => extension.manifest.version,
        ]}
      />
    </section>
  );
});

export const InstalledExtensions = withInjectables<Dependencies, InstalledExtensionsProps>(NonInjectedInstalledExtensions, {
  getProps: (di, props) => ({
    ...props,
    initialDiscoveryLoadCompleted: di.inject(initialDiscoveryLoadCompletedInjectable).value,
    getExtensionInstallationPhase: di.inject(getExtensionInstallationPhaseInjectable),
    extensionsUninstallingCount: di.inject(extensionsUninstallingCountInjectable),
  }),
});
