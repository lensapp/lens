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
import type { Row } from "react-table";
import type { LensExtensionId } from "../../../extensions/lens-extension";

interface Props {
  extensions: InstalledExtension[];
  enable: (id: LensExtensionId) => void;
  disable: (id: LensExtensionId) => void;
  uninstall: (extension: InstalledExtension) => void;
}

function getStatus(extension: InstalledExtension) {
  if (!extension.isCompatible) {
    return "Incompatible";
  }

  return extension.isEnabled ? "Enabled" : "Disabled";
}

export const InstalledExtensions = observer(({ extensions, uninstall, enable, disable }: Props) => {
  const filters = [
    (extension: InstalledExtension) => extension.manifest.name,
    (extension: InstalledExtension) => getStatus(extension),
    (extension: InstalledExtension) => extension.manifest.version,
  ];

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
    () => {
      return extensions.map(extension => {
        const { id, isEnabled, isCompatible, manifest } = extension;
        const { name, description, version } = manifest;
        const isUninstalling = ExtensionInstallationStateStore.isExtensionUninstalling(id);

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
            <MenuActions usePortal toolbar={false}>
              { isCompatible && (
                <>
                  {isEnabled ? (
                    <MenuItem
                      disabled={isUninstalling}
                      onClick={() => disable(id)}
                    >
                      <Icon material="unpublished"/>
                      <span className="title" aria-disabled={isUninstalling}>Disable</span>
                    </MenuItem>
                  ) : (
                    <MenuItem
                      disabled={isUninstalling}
                      onClick={() => enable(id)}
                    >
                      <Icon material="check_circle"/>
                      <span className="title" aria-disabled={isUninstalling}>Enable</span>
                    </MenuItem>
                  )}
                </>
              )}

              <MenuItem
                disabled={isUninstalling}
                onClick={() => uninstall(extension)}
              >
                <Icon material="delete"/>
                <span className="title" aria-disabled={isUninstalling}>Uninstall</span>
              </MenuItem>
            </MenuActions>
          ),
        };
      });
    }, [extensions, ExtensionInstallationStateStore.anyUninstalling],
  );

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

  return (
    <section data-testid="extensions-table">
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
