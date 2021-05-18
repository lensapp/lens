import styles from "./installed-extensions.module.css";
import React, { useMemo } from "react";
import { ExtensionDiscovery, InstalledExtension } from "../../../extensions/extension-discovery";
import { Icon } from "../icon";
import { List } from "../list/list";
import { MenuActions, MenuItem } from "../menu";
import { Spinner } from "../spinner";
import { ExtensionInstallationStateStore } from "./extension-install.store";
import { cssNames } from "../../utils";
import { observer } from "mobx-react";
import type { Column, Row } from "react-table";
import type { LensExtensionId } from "../../../extensions/lens-extension";

interface Props {
  extensions: InstalledExtension[];
  enable: (id: LensExtensionId) => void;
  disable: (id: LensExtensionId) => void;
  uninstall: (extension: InstalledExtension) => void;
}

function getStatus(isEnabled: boolean) {
  return isEnabled ? "Enabled" : "Disabled";
}

export const InstalledExtensions = observer(({ extensions, uninstall, enable, disable }: Props) => {
  if (!ExtensionDiscovery.getInstance().isLoaded) {
    return <div><Spinner center /></div>;
  }

  if (extensions.length == 0) {
    return (
      <div className="flex column h-full items-center justify-center">
        <Icon material="extension" className={styles.noItemsIcon}/>
        <h3 className="font-medium text-3xl mt-5 mb-2">
          There are no extensions installed.
        </h3>
        <p>Please use the form above to install or drag tarbar-file here.</p>
      </div>
    );
  }

  const filters = [
    (extension: InstalledExtension) => extension.manifest.name,
    (extension: InstalledExtension) => getStatus(extension.isEnabled),
    (extension: InstalledExtension) => extension.manifest.version,
  ];

  const columns: Column<any>[] = useMemo(
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
        accessor: "status"
      },
      {
        Header: "",
        accessor: "actions",
        disableSortBy: true,
        width: 20,
        className: "actions"
      }
    ], []
  );

  const data = useMemo(
    () => {
      return extensions.map(extension => {
        const { id, isEnabled, manifest } = extension;
        const { name, description, version } = manifest;
        const isUninstalling = ExtensionInstallationStateStore.isExtensionUninstalling(id);

        return {
          extension: (
            <div className={cssNames("flex items-start", { [styles.frozenRow]: isUninstalling })}>
              <div>
                <div className={styles.extensionName}>{name}</div>
                <div className={styles.extensionDescription}>{description}</div>
              </div>
            </div>
          ),
          version,
          status: (
            <div className={cssNames({[styles.enabled]: getStatus(isEnabled) == "Enabled"})}>
              {getStatus(isEnabled)}
            </div>
          ),
          actions: (
            <MenuActions usePortal toolbar={false}>
              {isEnabled ? (
                <MenuItem
                  disabled={isUninstalling}
                  onClick={() => disable(id)}
                >
                  <Icon material="unpublished"/>
                  <span className="title">Disable</span>
                </MenuItem>
              ) : (
                <MenuItem
                  disabled={isUninstalling}
                  onClick={() => enable(id)}
                >
                  <Icon material="check_circle"/>
                  <span className="title">Enable</span>
                </MenuItem>
              )}
              <MenuItem
                disabled={isUninstalling}
                onClick={() => uninstall(extension)}
              >
                <Icon material="delete"/>
                <span className="title">Uninstall</span>
              </MenuItem>
            </MenuActions>
          )
        };
      });
    }, [extensions]
  );

  return (
    <section>
      <List
        title={<h2 className={styles.title}>Installed extensions</h2>}
        columns={columns}
        data={data}
        items={extensions}
        filters={filters}
      />
    </section>
  );
});
