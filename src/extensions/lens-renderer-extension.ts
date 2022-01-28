/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type * as registries from "./registries";
import { Disposers, LensExtension } from "./lens-extension";
import { getExtensionPageUrl } from "./registries/page-registry";
import type { CatalogEntity, CategoryFilter } from "../common/catalog";
import type { Disposer } from "../common/utils";
import type { EntityFilter } from "../renderer/catalog/entity-registry";
import type { TopBarRegistration } from "../renderer/components/layout/top-bar/top-bar-registration";
import type { KubernetesCluster } from "../common/catalog-entities";
import type { WelcomeMenuRegistration } from "../renderer/components/+welcome/welcome-menu-items/welcome-menu-registration";
import type { WelcomeBannerRegistration } from "../renderer/components/+welcome/welcome-banner-items/welcome-banner-registration";
import type { CommandRegistration } from "../renderer/components/command-palette/registered-commands/commands";
import type { AppPreferenceRegistration } from "../renderer/components/+preferences/app-preferences/app-preference-registration";
import type { AdditionalCategoryColumnRegistration } from "../renderer/components/+catalog/custom-category-columns";
import type { KubeObjectDetailRegistration } from "../renderer/components/kube-object-details/kube-details-items/kube-detail-items";
import type { KubeObjectStatusRegistration } from "../renderer/components/kube-object-status-icon/kube-object-status";
import type { CatalogEntityDetailRegistration } from "../renderer/catalog/catalog-entity-details";
import { observable } from "mobx";
import { once } from "lodash";

export class LensRendererExtension extends LensExtension {
  globalPages: registries.PageRegistration[] = [];
  clusterPages: registries.PageRegistration[] = [];
  clusterPageMenus: registries.ClusterPageMenuRegistration[] = [];
  appPreferences: AppPreferenceRegistration[] = [];
  kubeObjectStatusTexts: KubeObjectStatusRegistration[] = [];
  entitySettings: registries.EntitySettingRegistration[] = [];
  statusBarItems: registries.StatusBarRegistration[] = [];
  kubeObjectDetailItems: KubeObjectDetailRegistration[] = [];
  kubeObjectMenuItems: registries.KubeObjectMenuRegistration[] = [];
  kubeWorkloadsOverviewItems: registries.WorkloadsOverviewDetailRegistration[] = [];
  commands: CommandRegistration[] = [];
  welcomeMenus: WelcomeMenuRegistration[] = [];
  welcomeBanners: WelcomeBannerRegistration[] = [];
  catalogEntityDetailItems: CatalogEntityDetailRegistration<CatalogEntity>[] = [];
  topBarItems: TopBarRegistration[] = [];
  additionalCategoryColumns: AdditionalCategoryColumnRegistration[] = [];

  @observable catalogFilters = observable.array<EntityFilter>();
  @observable catalogCategoryFilters = observable.array<CategoryFilter>();

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
   * Defines if extension is enabled for a given cluster. This method is only
   * called when the extension is created within a cluster frame.
   *
   * The default implementation is to return `true`
   */
  isEnabledForCluster(cluster: KubernetesCluster): Promise<Boolean> {
    return Promise.resolve((void cluster) || true);
  }

  /**
   * @deprecated Just push to `.catalogFilters` instead
   * Add a filtering function for the catalog entities. This will be removed if the extension is disabled.
   * @param fn The function which should return a truthy value for those entities which should be kept.
   * @returns A function to clean up the filter
   */
  addCatalogFilter(fn: EntityFilter): Disposer {
    const dispose = once(() => this.catalogFilters.remove(fn));

    this.catalogFilters.push(fn);
    this[Disposers].push(dispose);

    return dispose;
  }

  /**
   * @deprecated Just push to `.catalogCategoryFilters` instead
   * Add a filtering function for the catalog categories. This will be removed if the extension is disabled.
   * @param fn The function which should return a truthy value for those categories which should be kept.
   * @returns A function to clean up the filter
   */
  addCatalogCategoryFilter(fn: CategoryFilter): Disposer {
    const dispose = once(() => this.catalogCategoryFilters.remove(fn));

    this.catalogCategoryFilters.push(fn);
    this[Disposers].push(dispose);

    return dispose;
  }
}
