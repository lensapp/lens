/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./installed-extensions.module.scss";
import React, { useMemo } from "react";
import type {
  ExtensionDiscovery,
  InstalledExtension,
} from "../../../extensions/extension-discovery/extension-discovery";
import { Icon } from "../icon";
import { MenuActions, MenuItem } from "../menu";
import { Spinner } from "../spinner";
import { cssNames } from "../../utils";
import { observer } from "mobx-react";
import { ColumnDef, useReactTable, getCoreRowModel, getSortedRowModel } from "@tanstack/react-table";
import type { LensExtensionId } from "../../../extensions/lens-extension";
import extensionDiscoveryInjectable
  from "../../../extensions/extension-discovery/extension-discovery.injectable";

import { withInjectables } from "@ogre-tools/injectable-react";
import extensionInstallationStateStoreInjectable
  from "../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import type { ExtensionInstallationStateStore } from "../../../extensions/extension-installation-state-store/extension-installation-state-store";
import { Table } from "../table/react-table";

export interface InstalledExtensionsProps {
  extensions: InstalledExtension[];
  enable: (id: LensExtensionId) => void;
  disable: (id: LensExtensionId) => void;
  uninstall: (extension: InstalledExtension) => void;
}

interface Dependencies {
  extensionDiscovery: ExtensionDiscovery;
  extensionInstallationStateStore: ExtensionInstallationStateStore;
}

function getStatus(extension: InstalledExtension) {
  if (!extension.isCompatible) {
    return "Incompatible";
  }

  return extension.isEnabled ? "Enabled" : "Disabled";
}

const NonInjectedInstalledExtensions = observer(({ extensionDiscovery, extensionInstallationStateStore, extensions, uninstall, enable, disable }: Dependencies & InstalledExtensionsProps) => {
  const cols = useMemo<ColumnDef<InstalledExtension>[]>(() => ([
    {
      id: "name",
      header: "Name",
      size: 200,
      sortingFn: (a, b) => { // Custom sorting for extension name
        const nameA = extensions[a.index].manifest.name;
        const nameB = extensions[b.index].manifest.name;

        if (nameA > nameB) return -1;
        if (nameB > nameA) return 1;

        return 0;
      },
      cell: (cell) => (
        <div className={"flex items-start"}>
          <div>
            <div className={styles.extensionName}>{cell.row.original.manifest.name}</div>
            <div className={styles.extensionDescription}></div>
          </div>
        </div>
      )
    },
    {
      id: "version",
      header: "Version",
      cell: (cell) => cell.row.original.manifest.version
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (row) => row,
      cell: (cell) => {
        const extension = cell.row.original;
        const { isEnabled, isCompatible } = extension;
        
        return (
          <div className={cssNames({ [styles.enabled]: isEnabled, [styles.invalid]: !isCompatible })}>
            {getStatus(extension)}
          </div>
        )
      }
    },
    {
      id: "actions",
      enableSorting: false,
      size: 30,
      cell: (cell) => {
        const extension = cell.row.original;
        const { id, isEnabled, isCompatible } = extension;
        const isUninstalling = extensionInstallationStateStore.isExtensionUninstalling(id);
        return (
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
        )
      }
    }
  ]), []);

  const table = useReactTable({
    data: extensions,
    columns: cols,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (!extensionDiscovery.isLoaded) {
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
      <div>
        <h2 className={styles.title}>Installed extensions</h2> 
      </div>
      <Table table={table} />
    </section>
  );
});

export const InstalledExtensions = withInjectables<Dependencies, InstalledExtensionsProps>(NonInjectedInstalledExtensions, {
  getProps: (di, props) => ({
    extensionDiscovery: di.inject(extensionDiscoveryInjectable),
    extensionInstallationStateStore: di.inject(extensionInstallationStateStoreInjectable),
    ...props,
  }),
});
