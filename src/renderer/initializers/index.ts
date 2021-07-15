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

import { initCatalogEntityDetailRegistry } from "./catalog-entity-detail-registry";
import { initCatalog } from "./catalog";
import { initCommandRegistry } from "./command-registry";
import { initEntitySettingsRegistry } from "./entity-settings-registry";
import { initIpcRendererListeners } from "./ipc";
import { initKubeObjectDetailRegistry } from "./kube-object-detail-registry";
import { initKubeObjectMenuRegistry } from "./kube-object-menu-registry";
import { initRegistries } from "./registries";
import { initWelcomeMenuRegistry } from "./welcome-menu-registry";
import { initWorkloadsOverviewDetailRegistry } from "./workloads-overview-detail-registry";
import { initCatalogCategoryRegistryEntries } from "./catalog-category-registry";
import { initStatusBarRegistry } from "./status-bar-registry";

export const initializers: [string, () => void][] = [
  ["Registries", initRegistries], // This line must be must be first
  ["CommandRegistry", initCommandRegistry],
  ["EntitySettingsRegistry", initEntitySettingsRegistry],
  ["KubeObjectMenuRegistry", initKubeObjectMenuRegistry],
  ["KubeObjectDetailRegistry", initKubeObjectDetailRegistry],
  ["WelcomeMenuRegistry", initWelcomeMenuRegistry],
  ["WorkloadsOverviewDetailRegistry", initWorkloadsOverviewDetailRegistry],
  ["CatalogEntityDetailRegistry", initCatalogEntityDetailRegistry],
  ["CatalogCategoryRegistryEntries", initCatalogCategoryRegistryEntries],
  ["Catalog", initCatalog],
  ["IpcRendererListeners", initIpcRendererListeners],
  ["StatusBarRegistry", initStatusBarRegistry],
];
