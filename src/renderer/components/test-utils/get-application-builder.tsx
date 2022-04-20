/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import currentlyInClusterFrameInjectable from "../../routes/currently-in-cluster-frame.injectable";
import { extensionRegistratorInjectionToken } from "../../../extensions/extension-loader/extension-registrator-injection-token";
import type { IObservableArray } from "mobx";
import { computed, observable, runInAction } from "mobx";
import { renderFor } from "./renderFor";
import observableHistoryInjectable from "../../navigation/observable-history.injectable";
import React from "react";
import { Router } from "react-router";
import { Observer } from "mobx-react";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import allowedResourcesInjectable from "../../../common/cluster-store/allowed-resources.injectable";
import type { RenderResult } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import type { KubeResource } from "../../../common/rbac";
import directoryForLensLocalStorageInjectable from "../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import { Sidebar } from "../layout/sidebar";
import { getDisForUnitTesting } from "../../../test-utils/get-dis-for-unit-testing";
import type { DiContainer } from "@ogre-tools/injectable";
import clusterStoreInjectable from "../../../common/cluster-store/cluster-store.injectable";
import type { ClusterStore } from "../../../common/cluster-store/cluster-store";
import mainExtensionsInjectable from "../../../extensions/main-extensions.injectable";
import currentRouteComponentInjectable from "../../routes/current-route-component.injectable";
import { pipeline } from "@ogre-tools/fp";
import { flatMap, compact, join, get, filter } from "lodash/fp";
import preferenceNavigationItemsInjectable from "../+preferences/preferences-navigation/preference-navigation-items.injectable";
import navigateToPreferencesInjectable from "../../../common/front-end-routing/routes/preferences/navigate-to-preferences.injectable";
import type { MenuItemOpts } from "../../../main/menu/application-menu-items.injectable";
import applicationMenuItemsInjectable from "../../../main/menu/application-menu-items.injectable";
import type { MenuItemConstructorOptions } from "electron";
import { MenuItem } from "electron";

type Callback = (dis: DiContainers) => void | Promise<void>;

export interface ApplicationBuilder {
  dis: DiContainers;
  setEnvironmentToClusterFrame: () => ApplicationBuilder;
  addExtensions: (...extensions: LensRendererExtension[]) => Promise<ApplicationBuilder>;
  allowKubeResource: (resourceName: KubeResource) => ApplicationBuilder;
  beforeSetups: (callback: Callback) => ApplicationBuilder;
  beforeRender: (callback: Callback) => ApplicationBuilder;
  render: () => Promise<RenderResult>;

  applicationMenu: {
    click: (path: string) => void;
  };

  preferences: {
    close: () => void;
    navigate: () => void;
    navigation: {
      click: (id: string) => void;
    };
  };
}

interface DiContainers {
  rendererDi: DiContainer;
  mainDi: DiContainer;
}

interface Environment {
  renderSidebar: () => React.ReactNode;
  onAllowKubeResource: () => void;
}

export const getApplicationBuilder = () => {
  const { rendererDi, mainDi, runSetups } = getDisForUnitTesting({
    doGeneralOverrides: true,
  });

  const dis = { rendererDi, mainDi };

  const clusterStoreStub = {
    getById: (): null => null,
  } as unknown as ClusterStore;

  rendererDi.override(clusterStoreInjectable, () => clusterStoreStub);
  mainDi.override(clusterStoreInjectable, () => clusterStoreStub);

  const beforeSetupsCallbacks: Callback[] = [];
  const beforeRenderCallbacks: Callback[] = [];

  const extensionsState = observable.array<LensRendererExtension>();

  rendererDi.override(subscribeStoresInjectable, () => () => () => {});

  const environments = {
    application: {
      renderSidebar: () => null,

      onAllowKubeResource: () => {
        throw new Error(
          "Tried to allow kube resource when environment is not cluster frame.",
        );
      },
    } as Environment,

    clusterFrame: {
      renderSidebar: () => <Sidebar />,
      onAllowKubeResource: () => {},
    } as Environment,
  };

  let environment = environments.application;

  rendererDi.override(
    currentlyInClusterFrameInjectable,
    () => environment === environments.clusterFrame,
  );

  rendererDi.override(rendererExtensionsInjectable, () =>
    computed(() => extensionsState),
  );

  mainDi.override(mainExtensionsInjectable, () =>
    computed(() => []),
  );

  let allowedResourcesState: IObservableArray<KubeResource>;
  let rendered: RenderResult;

  const builder: ApplicationBuilder = {
    dis,

    applicationMenu: {
      click: (path: string) => {
        const applicationMenuItems = mainDi.inject(
          applicationMenuItemsInjectable,
        );

        const menuItems = pipeline(
          applicationMenuItems.get(),
          flatMap(toFlatChildren(null)),
          filter((menuItem) => !!menuItem.click),
        );

        const menuItem = menuItems.find((menuItem) => menuItem.path === path);

        if (!menuItem) {
          const availableIds = menuItems.map(get("path")).join('", "');

          throw new Error(
            `Tried to click application menu item with ID "${path}" which does not exist. Available IDs are: "${availableIds}"`,
          );
        }

        menuItem.click?.(new MenuItem(menuItem), undefined, {});
      },
    },

    preferences: {
      close: () => {
        const link = rendered.getByTestId("close-preferences");

        fireEvent.click(link);
      },

      navigate: () => {
        const navigateToPreferences = rendererDi.inject(navigateToPreferencesInjectable);

        navigateToPreferences();
      },

      navigation: {
        click: (id: string) => {
          const link = rendered.queryByTestId(`tab-link-for-${id}`);

          if (!link) {
            const preferencesNavigationItems = rendererDi.inject(
              preferenceNavigationItemsInjectable,
            );

            const availableIds = preferencesNavigationItems
              .get()
              .map(get("id"));

            throw new Error(
              `Tried to click navigation item "${id}" which does not exist in preferences. Available IDs are "${availableIds.join('", "')}"`,
            );
          }

          fireEvent.click(link);
        },
      },
    },

    setEnvironmentToClusterFrame: () => {
      environment = environments.clusterFrame;

      allowedResourcesState = observable.array();

      rendererDi.override(allowedResourcesInjectable, () =>
        computed(() => new Set([...allowedResourcesState])),
      );

      rendererDi.override(
        directoryForLensLocalStorageInjectable,
        () => "/irrelevant",
      );

      return builder;
    },

    addExtensions: async (...extensions) => {
      const extensionRegistrators = rendererDi.injectMany(
        extensionRegistratorInjectionToken,
      );

      const addAndEnableExtensions = async () => {
        const registratorPromises = extensions.flatMap((extension) =>
          extensionRegistrators.map((registrator) => registrator(extension, 1)),
        );

        await Promise.all(registratorPromises);

        runInAction(() => {
          extensions.forEach((extension) => {
            extensionsState.push(extension);
          });
        });
      };

      if (rendered) {
        await addAndEnableExtensions();
      } else {
        builder.beforeRender(addAndEnableExtensions);
      }

      return builder;
    },

    allowKubeResource: (resourceName) => {
      environment.onAllowKubeResource();

      runInAction(() => {
        allowedResourcesState.push(resourceName);
      });

      return builder;
    },

    beforeSetups(callback: (dis: DiContainers) => void) {
      beforeSetupsCallbacks.push(callback);

      return builder;
    },

    beforeRender(callback: (dis: DiContainers) => void) {
      beforeRenderCallbacks.push(callback);

      return builder;
    },

    async render() {
      for (const callback of beforeSetupsCallbacks) {
        await callback(dis);
      }

      await runSetups();

      const render = renderFor(rendererDi);
      const history = rendererDi.inject(observableHistoryInjectable);
      const currentRouteComponent = rendererDi.inject(currentRouteComponentInjectable);

      for (const callback of beforeRenderCallbacks) {
        await callback(dis);
      }

      rendered = render(
        <Router history={history}>
          {environment.renderSidebar()}

          <Observer>
            {() => {
              const Component = currentRouteComponent.get();

              if (!Component) {
                return null;
              }

              return <Component />;
            }}
          </Observer>
        </Router>,
      );

      return rendered;
    },
  };

  return builder;
};

export type ToFlatChildren = (opts: MenuItemConstructorOptions) => (MenuItemOpts & { path: string })[];

function toFlatChildren(parentId: string | null | undefined): ToFlatChildren {
  return ({ submenu = [], ...menuItem }) => [
    {
      ...menuItem,
      path: pipeline([parentId, menuItem.id], compact, join(".")),
    },
    ...(
      Array.isArray(submenu)
        ? submenu.flatMap(toFlatChildren(menuItem.id))
        : [{
          ...submenu,
          path: pipeline([parentId, menuItem.id], compact, join(".")),
        }]
    ),
  ];
}
