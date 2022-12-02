/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Disposers, LensExtension, lensExtensionDependencies } from "./lens-extension";
import type { CatalogEntity } from "../common/catalog";
import type { Disposer } from "../common/utils";
import type { EntityFilter } from "../renderer/api/catalog/entity/registry";
import type { CategoryFilter } from "../renderer/api/catalog-category-registry";
import type { TopBarRegistration } from "../renderer/components/layout/top-bar/top-bar-registration";
import type { KubernetesCluster } from "../common/catalog-entities";
import type { WelcomeMenuRegistration } from "../renderer/components/+welcome/welcome-menu-items/welcome-menu-registration";
import type { WelcomeBannerRegistration } from "../renderer/components/+welcome/welcome-banner-items/welcome-banner-registration";
import type { CommandRegistration } from "../renderer/components/command-palette/registered-commands/commands";
import type { AppPreferenceRegistration } from "../features/preferences/renderer/compliance-for-legacy-extension-api/app-preference-registration";
import type { AdditionalCategoryColumnRegistration } from "../renderer/components/+catalog/custom-category-columns";
import type { CustomCategoryViewRegistration } from "../renderer/components/+catalog/custom-views";
import type { StatusBarRegistration } from "../renderer/components/status-bar/status-bar-registration";
import type { KubeObjectMenuRegistration } from "../renderer/components/kube-object-menu/kube-object-menu-registration";
import type { WorkloadsOverviewDetailRegistration } from "../renderer/components/+workloads-overview/workloads-overview-detail-registration";
import type { KubeObjectStatusRegistration } from "../renderer/components/kube-object-status-icon/kube-object-status-registration";
import { fromPairs, map, matches, toPairs } from "lodash/fp";
import { pipeline } from "@ogre-tools/fp";
import { getExtensionRoutePath } from "../renderer/routes/for-extension";
import type { LensRendererExtensionDependencies } from "./lens-extension-set-dependencies";
import type { KubeObjectHandlerRegistration } from "../renderer/kube-object/handler";
import type { AppPreferenceTabRegistration } from "../features/preferences/renderer/compliance-for-legacy-extension-api/app-preference-tab-registration";
import type { KubeObjectDetailRegistration } from "../renderer/components/kube-object-details/kube-object-detail-registration";
import type { ClusterFrameChildComponent } from "../renderer/frames/cluster-frame/cluster-frame-child-component-injection-token";
import type { EntitySettingRegistration } from "../renderer/components/+entity-settings/extension-registrator.injectable";
import type { CatalogEntityDetailRegistration } from "../renderer/components/+catalog/entity-details/token";
import type { ClusterPageMenuRegistration, PageRegistration } from "./common-api/registrations";

export class LensRendererExtension extends LensExtension<LensRendererExtensionDependencies> {
  globalPages: PageRegistration[] = [];
  clusterPages: PageRegistration[] = [];
  clusterPageMenus: ClusterPageMenuRegistration[] = [];
  clusterFrameComponents: ClusterFrameChildComponent[] = [];
  kubeObjectStatusTexts: KubeObjectStatusRegistration[] = [];
  appPreferences: AppPreferenceRegistration[] = [];
  appPreferenceTabs: AppPreferenceTabRegistration[] = [];
  entitySettings: EntitySettingRegistration[] = [];
  statusBarItems: StatusBarRegistration[] = [];
  kubeObjectDetailItems: KubeObjectDetailRegistration[] = [];
  kubeObjectMenuItems: KubeObjectMenuRegistration[] = [];
  kubeWorkloadsOverviewItems: WorkloadsOverviewDetailRegistration[] = [];
  commands: CommandRegistration[] = [];
  welcomeMenus: WelcomeMenuRegistration[] = [];
  welcomeBanners: WelcomeBannerRegistration[] = [];
  catalogEntityDetailItems: CatalogEntityDetailRegistration<CatalogEntity>[] = [];
  topBarItems: TopBarRegistration[] = [];
  additionalCategoryColumns: AdditionalCategoryColumnRegistration[] = [];
  customCategoryViews: CustomCategoryViewRegistration[] = [];
  kubeObjectHandlers: KubeObjectHandlerRegistration[] = [];

  async navigate(pageId?: string, params: object = {}) {
    const routes = this[lensExtensionDependencies].routes.get();
    const targetRegistration = [...this.globalPages, ...this.clusterPages]
      .find(registration => registration.id === (pageId || undefined));

    if (!targetRegistration) {
      return;
    }

    const targetRoutePath = getExtensionRoutePath(this, targetRegistration.id);
    const targetRoute = routes.find(matches({ path: targetRoutePath }));

    if (!targetRoute) {
      return;
    }

    const normalizedParams = this[lensExtensionDependencies].getExtensionPageParameters({
      extension: this,
      registration: targetRegistration,
    });
    const query = pipeline(
      params,
      toPairs,
      map(([key, value]) => [
        key,
        normalizedParams[key].stringify(value),
      ]),
      fromPairs,
    );

    this[lensExtensionDependencies].navigateToRoute(targetRoute, {
      query,
    });
  }

  /**
   * Defines if extension is enabled for a given cluster. This method is only
   * called when the extension is created within a cluster frame.
   *
   * The default implementation is to return `true`
   *
   * @deprecated Switch to using "enabled" or "visible" properties in each registration together with `activeCluster`
   */
  async isEnabledForCluster(cluster: KubernetesCluster): Promise<Boolean> {
    return (void cluster) || true;
  }

  /**
   * Add a filtering function for the catalog entities. This will be removed if the extension is disabled.
   * @param fn The function which should return a truthy value for those entities which should be kept.
   * @returns A function to clean up the filter
   */
  addCatalogFilter(fn: EntityFilter): Disposer {
    const dispose = this[lensExtensionDependencies].entityRegistry.addCatalogFilter(fn);

    this[Disposers].push(dispose);

    return dispose;
  }

  /**
   * Add a filtering function for the catalog categories. This will be removed if the extension is disabled.
   * @param fn The function which should return a truthy value for those categories which should be kept.
   * @returns A function to clean up the filter
   */
  addCatalogCategoryFilter(fn: CategoryFilter): Disposer {
    const dispose = this[lensExtensionDependencies].categoryRegistry.addCatalogCategoryFilter(fn);

    this[Disposers].push(dispose);

    return dispose;
  }
}
