/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./installed-extensions.module.scss";
import React from "react";
import { Icon } from "@k8slens/icon";
import { List } from "../list/list";
import { MenuActions, MenuItem } from "../menu";
import { Spinner } from "@k8slens/spinner";
import { cssNames } from "@k8slens/utilities";
import { observer } from "mobx-react";
import type { Row } from "react-table";
import extensionDiscoveryInjectable from "../../../extensions/extension-discovery/extension-discovery.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import extensionInstallationStateStoreInjectable from "../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import type { ExtensionInstallationStateStore } from "../../../extensions/extension-installation-state-store/extension-installation-state-store";
import type { InstalledExtension } from "@k8slens/legacy-extensions";
import type { IComputedValue } from "mobx";
import type { ConfirmUninstallExtension } from "./confirm-uninstall-extension.injectable";
import confirmUninstallExtensionInjectable from "./confirm-uninstall-extension.injectable";
import type { DisableExtension } from "./disable-extension.injectable";
import disableExtensionInjectable from "./disable-extension.injectable";
import type { EnableExtension } from "./enable-extension.injectable";
import enableExtensionInjectable from "./enable-extension.injectable";
import userExtensionsInjectable from "./user-extensions/user-extensions.injectable";
import type { ExtensionDiscovery } from "../../../extensions/extension-discovery/extension-discovery";

export interface InstalledExtensionsProps {
}

interface Dependencies {
  extensionDiscovery: ExtensionDiscovery;
  extensionInstallationStateStore: ExtensionInstallationStateStore;
  userExtensions: IComputedValue<InstalledExtension[]>;
  enableExtension: EnableExtension;
  disableExtension: DisableExtension;
  confirmUninstallExtension: ConfirmUninstallExtension;
}

function getStatus(extension: InstalledExtension) {
  if (!extension.isCompatible) {
    return "Incompatible";
  }

  return extension.isEnabled ? "Enabled" : "Disabled";
}

const NonInjectedInstalledExtensions = observer(({
  extensionDiscovery,
  extensionInstallationStateStore,
  userExtensions,
  confirmUninstallExtension,
  enableExtension,
  disableExtension,
}: Dependencies & InstalledExtensionsProps) => {
  if (!extensionDiscovery.isLoaded) {
    return <div><Spinner center /></div>;
  }

  const extensions = userExtensions.get();

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

  const toggleExtensionWith = (enabled: boolean) => (
    enabled
      ? disableExtension
      : enableExtension
  );

  return (
    <section data-testid="extensions-table">
      <List
        title={<h2 className={styles.title}>Installed extensions</h2>}
        columns={[
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
          },
        ]}
        data={extensions.map(extension => {
          const { id, isEnabled, isCompatible, manifest } = extension;
          const { name, description, version } = manifest;
          const isUninstalling = extensionInstallationStateStore.isExtensionUninstalling(id);
          const toggleExtension = toggleExtensionWith(isEnabled);

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
                  <MenuItem
                    disabled={isUninstalling}
                    onClick={() => toggleExtension(id)}
                  >
                    <Icon material={isEnabled ? "unpublished" : "check_circle"} />
                    <span className="title" aria-disabled={isUninstalling}>
                      {isEnabled ? "Disable" : "Enabled"}
                    </span>
                  </MenuItem>
                )}

                <MenuItem
                  disabled={isUninstalling}
                  onClick={() => confirmUninstallExtension(extension)}
                >
                  <Icon material="delete" />
                  <span className="title" aria-disabled={isUninstalling}>Uninstall</span>
                </MenuItem>
              </MenuActions>
            ),
          };
        })}
        items={userExtensions.get()}
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
    extensionDiscovery: di.inject(extensionDiscoveryInjectable),
    extensionInstallationStateStore: di.inject(extensionInstallationStateStoreInjectable),
    userExtensions: di.inject(userExtensionsInjectable),
    enableExtension: di.inject(enableExtensionInjectable),
    disableExtension: di.inject(disableExtensionInjectable),
    confirmUninstallExtension: di.inject(confirmUninstallExtensionInjectable),
  }),
});
