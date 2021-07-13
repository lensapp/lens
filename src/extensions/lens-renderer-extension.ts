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

import type * as registries from "./registries";
import type { Cluster } from "../main/cluster";
import { LensExtension } from "./lens-extension";
import { getExtensionPageUrl } from "./registries/page-registry";

export class LensRendererExtension extends LensExtension {
  globalPages: registries.PageRegistration[] = [];
  clusterPages: registries.PageRegistration[] = [];
  clusterPageMenus: registries.ClusterPageMenuRegistration[] = [];
  kubeObjectStatusTexts: registries.KubeObjectStatusRegistration[] = [];
  appPreferences: registries.AppPreferenceRegistration[] = [];
  appPreferenceKinds: registries.AppPreferenceKindRegistration[] = [];
  entitySettings: registries.EntitySettingRegistration[] = [];
  statusBarItems: registries.StatusBarRegistration[] = [];
  kubeObjectDetailItems: registries.KubeObjectDetailRegistration[] = [];
  kubeObjectMenuItems: registries.KubeObjectMenuRegistration[] = [];
  kubeWorkloadsOverviewItems: registries.WorkloadsOverviewDetailRegistration[] = [];
  commands: registries.CommandRegistration[] = [];
  welcomeMenus: registries.WelcomeMenuRegistration[] = [];
  catalogEntityDetailItems: registries.CatalogEntityDetailRegistration[] = [];
  topBarItems: registries.TopBarRegistration[] = [];

  async navigate<P extends object>(pageId?: string, params?: P) {
    const { navigate } = await import("../renderer/navigation");
    const pageUrl = getExtensionPageUrl({
      extensionId: this.name,
      pageId,
      params: params ?? {}, // compile to url with params
    });

    navigate(pageUrl);
  }

  /**
   * Defines if extension is enabled for a given cluster. Defaults to `true`.
   */
  async isEnabledForCluster(cluster: Cluster): Promise<Boolean> {
    return (void cluster) || true;
  }
}
