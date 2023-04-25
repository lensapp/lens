/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Disposers, LensExtension } from "./lens-extension";
import type { Disposer } from "@k8slens/utilities";
import type { LensExtensionDependencies } from "./lens-extension";
import type { CatalogEntity, CategoryFilter, CatalogCategoryRegistry } from "../common/catalog";
import type { EntityFilter, CatalogEntityRegistry } from "../renderer/api/catalog/entity/registry";
import type { TopBarRegistration } from "../renderer/components/layout/top-bar/top-bar-registration";
import type { KubernetesCluster } from "../common/catalog-entities";
import type { WelcomeMenuRegistration } from "../renderer/components/welcome/welcome-menu-items/welcome-menu-registration";
import type { WelcomeBannerRegistration } from "../renderer/components/welcome/welcome-banner-items/welcome-banner-registration";
import type { CommandRegistration } from "../renderer/components/command-palette/registered-commands/commands";
import type { AppPreferenceRegistration } from "../features/preferences/renderer/compliance-for-legacy-extension-api/app-preference-registration";
import type { AdditionalCategoryColumnRegistration } from "../renderer/components/catalog/custom-category-columns";
import type { CustomCategoryViewRegistration } from "../renderer/components/catalog/custom-views";
import type { StatusBarRegistration } from "../renderer/components/status-bar/status-bar-registration";
import type { KubeObjectMenuRegistration } from "../renderer/components/kube-object-menu/kube-object-menu-registration";
import type { WorkloadsOverviewDetailRegistration } from "../renderer/components/workloads-overview/workloads-overview-detail-registration";
import type { KubeObjectStatusRegistration } from "../renderer/components/kube-object-status-icon/kube-object-status-registration";
import { fromPairs, map, matches, toPairs } from "lodash/fp";
import { pipeline } from "@ogre-tools/fp";
import { getExtensionRoutePath } from "../renderer/routes/for-extension";
import type { KubeObjectHandlerRegistration } from "../renderer/kube-object/handler";
import type { AppPreferenceTabRegistration } from "../features/preferences/renderer/compliance-for-legacy-extension-api/app-preference-tab-registration";
import type { KubeObjectDetailRegistration } from "../renderer/components/kube-object-details/kube-object-detail-registration";
import type { ClusterFrameChildComponent } from "../renderer/frames/cluster-frame/cluster-frame-child-component-injection-token";
import type { EntitySettingRegistration } from "../renderer/components/entity-settings/extension-registrator.injectable";
import type { CatalogEntityDetailRegistration } from "../renderer/components/catalog/entity-details/token";
import type { PageRegistration } from "../renderer/routes/page-registration";
import type { ClusterPageMenuRegistration } from "../renderer/components/layout/cluster-page-menu";
import type { IComputedValue } from "mobx";
import type { NavigateToRoute } from "../common/front-end-routing/navigate-to-route-injection-token";
import type { Route } from "../common/front-end-routing/front-end-route-injection-token";
import type { GetExtensionPageParameters } from "../renderer/routes/get-extension-page-parameters.injectable";
import type { InstalledExtension } from "./common-api";
import { getEnvironmentSpecificLegacyGlobalDiForExtensionApi } from "@k8slens/legacy-global-di";
import catalogCategoryRegistryInjectable from "../common/catalog/category-registry.injectable";
import catalogEntityRegistryInjectable from "../renderer/api/catalog/entity/registry.injectable";
import loggerInjectable from "../common/logger.injectable";
import getExtensionPageParametersInjectable from "../renderer/routes/get-extension-page-parameters.injectable";
import navigateToRouteInjectable from "../renderer/routes/navigate-to-route.injectable";
import routesInjectable from "../renderer/routes/routes.injectable";
import ensureHashedDirectoryForExtensionInjectable from "./extension-loader/file-system-provisioner-store/ensure-hashed-directory-for-extension.injectable";

interface LensRendererExtensionDependencies extends LensExtensionDependencies {
  navigateToRoute: NavigateToRoute;
  getExtensionPageParameters: GetExtensionPageParameters;
  readonly routes: IComputedValue<Route<unknown>[]>;
  readonly entityRegistry: CatalogEntityRegistry;
  readonly categoryRegistry: CatalogCategoryRegistry;
}

export class LensRendererExtension extends LensExtension {
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

  /**
   * @ignore
   */
  declare protected readonly dependencies: LensRendererExtensionDependencies;

  constructor(extension: InstalledExtension) {
    const di = getEnvironmentSpecificLegacyGlobalDiForExtensionApi("renderer");
    const deps: LensRendererExtensionDependencies = {
      getExtensionPageParameters: di.inject(getExtensionPageParametersInjectable),
      navigateToRoute: di.inject(navigateToRouteInjectable),
      ensureHashedDirectoryForExtension: di.inject(ensureHashedDirectoryForExtensionInjectable),
      categoryRegistry: di.inject(catalogCategoryRegistryInjectable),
      entityRegistry: di.inject(catalogEntityRegistryInjectable),
      routes: di.inject(routesInjectable),
      logger: di.inject(loggerInjectable),
    };

    super(deps, extension);
  }

  async navigate(pageId?: string, params: object = {}) {
    const routes = this.dependencies.routes.get();
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

    const normalizedParams = this.dependencies.getExtensionPageParameters({
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

    this.dependencies.navigateToRoute(targetRoute, {
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
    const dispose = this.dependencies.entityRegistry.addCatalogFilter(fn);

    this[Disposers].push(dispose);

    return dispose;
  }

  /**
   * Add a filtering function for the catalog categories. This will be removed if the extension is disabled.
   * @param fn The function which should return a truthy value for those categories which should be kept.
   * @returns A function to clean up the filter
   */
  addCatalogCategoryFilter(fn: CategoryFilter): Disposer {
    const dispose = this.dependencies.categoryRegistry.addCatalogCategoryFilter(fn);

    this[Disposers].push(dispose);

    return dispose;
  }
}
