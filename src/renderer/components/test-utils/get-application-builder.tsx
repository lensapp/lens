/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import currentlyInClusterFrameInjectable from "../../routes/currently-in-cluster-frame.injectable";
import type { IObservableArray, ObservableSet } from "mobx";
import { computed, observable, runInAction } from "mobx";
import React from "react";
import { Router } from "react-router";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import allowedResourcesInjectable from "../../cluster-frame-context/allowed-resources.injectable";
import type { RenderResult } from "@testing-library/react";
import { queryByText, fireEvent } from "@testing-library/react";
import type { KubeResource } from "../../../common/rbac";
import type { DiContainer } from "@ogre-tools/injectable";
import clusterStoreInjectable from "../../../common/cluster-store/cluster-store.injectable";
import type { ClusterStore } from "../../../common/cluster-store/cluster-store";
import mainExtensionsInjectable from "../../../extensions/main-extensions.injectable";
import { pipeline } from "@ogre-tools/fp";
import { flatMap, compact, join, get, filter, map, matches, last } from "lodash/fp";
import preferenceNavigationItemsInjectable from "../+preferences/preferences-navigation/preference-navigation-items.injectable";
import navigateToPreferencesInjectable from "../../../common/front-end-routing/routes/preferences/navigate-to-preferences.injectable";
import type { MenuItemOpts } from "../../../main/menu/application-menu-items.injectable";
import applicationMenuItemsInjectable from "../../../main/menu/application-menu-items.injectable";
import type { MenuItemConstructorOptions, MenuItem } from "electron";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import type { NavigateToHelmCharts } from "../../../common/front-end-routing/routes/cluster/helm/charts/navigate-to-helm-charts.injectable";
import navigateToHelmChartsInjectable from "../../../common/front-end-routing/routes/cluster/helm/charts/navigate-to-helm-charts.injectable";
import hostedClusterInjectable from "../../cluster-frame-context/hosted-cluster.injectable";
import { ClusterFrameContext } from "../../cluster-frame-context/cluster-frame-context";
import type { Cluster } from "../../../common/cluster/cluster";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import clusterFrameContextInjectable from "../../cluster-frame-context/cluster-frame-context.injectable";
import startMainApplicationInjectable from "../../../main/start-main-application/start-main-application.injectable";
import startFrameInjectable from "../../start-frame/start-frame.injectable";
import type { NamespaceStore } from "../+namespaces/store";
import namespaceStoreInjectable from "../+namespaces/store.injectable";
import historyInjectable from "../../navigation/history.injectable";
import type { MinimalTrayMenuItem } from "../../../main/tray/electron-tray/electron-tray.injectable";
import electronTrayInjectable from "../../../main/tray/electron-tray/electron-tray.injectable";
import applicationWindowInjectable from "../../../main/start-main-application/lens-window/application-window/application-window.injectable";
import { getDiForUnitTesting as getRendererDi } from "../../getDiForUnitTesting";
import { getDiForUnitTesting as getMainDi } from "../../../main/getDiForUnitTesting";
import { overrideChannels } from "../../../test-utils/channel-fakes/override-channels";
import assert from "assert";
import { openMenu } from "react-select-event";
import userEvent from "@testing-library/user-event";
import lensProxyPortInjectable from "../../../main/lens-proxy/lens-proxy-port.injectable";
import type { Route } from "../../../common/front-end-routing/front-end-route-injection-token";
import type { NavigateToRouteOptions } from "../../../common/front-end-routing/navigate-to-route-injection-token";
import { navigateToRouteInjectionToken } from "../../../common/front-end-routing/navigate-to-route-injection-token";
import type { LensMainExtension } from "../../../extensions/lens-main-extension";
import type { LensExtension } from "../../../extensions/lens-extension";

import extensionInjectable from "../../../extensions/extension-loader/extension/extension.injectable";
import { renderFor } from "./renderFor";
import { RootFrame } from "../../frames/root-frame/root-frame";
import { ClusterFrame } from "../../frames/cluster-frame/cluster-frame";
import hostedClusterIdInjectable from "../../cluster-frame-context/hosted-cluster-id.injectable";
import activeKubernetesClusterInjectable from "../../cluster-frame-context/active-kubernetes-cluster.injectable";
import { catalogEntityFromCluster } from "../../../main/cluster-manager";

type Callback = (dis: DiContainers) => void | Promise<void>;

type EnableExtensions<T> = (...extensions: T[]) => void;
type DisableExtensions<T> = (...extensions: T[]) => void;

export interface ApplicationBuilder {
  dis: DiContainers;
  setEnvironmentToClusterFrame: () => ApplicationBuilder;

  extensions: {
    renderer: {
      enable: EnableExtensions<LensRendererExtension>;
      disable: DisableExtensions<LensRendererExtension>;
    };

    main: {
      enable: EnableExtensions<LensMainExtension>;
      disable: DisableExtensions<LensMainExtension>;
    };

    enable: (...extensions: { renderer: LensRendererExtension; main: LensMainExtension }[]) => void;
    disable: (...extensions: { renderer: LensRendererExtension; main: LensMainExtension }[]) => void;
  };

  allowKubeResource: (resourceName: KubeResource) => ApplicationBuilder;
  beforeApplicationStart: (callback: Callback) => ApplicationBuilder;
  beforeRender: (callback: Callback) => ApplicationBuilder;
  render: () => Promise<RenderResult>;

  tray: {
    click: (id: string) => Promise<void>;
    get: (id: string) => MinimalTrayMenuItem | null;
    getIconPath: () => string;
  };

  applicationMenu: {
    click: (path: string) => void;
  };

  preferences: {
    close: () => void;
    navigate: () => void;
    navigateTo: (route: Route<any>, params: Partial<NavigateToRouteOptions<any>>) => void;
    navigation: {
      click: (id: string) => void;
    };
  };

  helmCharts: {
    navigate: NavigateToHelmCharts;
  };

  select: {
    openMenu: (id: string) => ({ selectOption: (labelText: string) => void });
    selectOption: (menuId: string, labelText: string) => void;
    getValue: (menuId: string) => string;
  };
}

interface DiContainers {
  rendererDi: DiContainer;
  mainDi: DiContainer;
}

interface Environment {
  RootComponent: React.ElementType;
  onAllowKubeResource: () => void;
}

export const getApplicationBuilder = () => {
  const mainDi = getMainDi({
    doGeneralOverrides: true,
  });

  const overrideChannelsForWindow = overrideChannels(mainDi);

  const rendererDi = getRendererDi({
    doGeneralOverrides: true,
  });

  overrideChannelsForWindow(rendererDi);

  const dis = { rendererDi, mainDi };

  const clusterStoreStub = {
    provideInitialFromMain: () => {},
    getById: (): null => null,
  } as unknown as ClusterStore;

  rendererDi.override(clusterStoreInjectable, () => clusterStoreStub);
  rendererDi.override(storesAndApisCanBeCreatedInjectable, () => true);
  mainDi.override(clusterStoreInjectable, () => clusterStoreStub);

  const beforeApplicationStartCallbacks: Callback[] = [];
  const beforeRenderCallbacks: Callback[] = [];

  const rendererExtensionsState = observable.set<LensRendererExtension>();
  const mainExtensionsState = observable.set<LensMainExtension>();

  rendererDi.override(subscribeStoresInjectable, () => () => () => {});

  const environments = {
    application: {
      RootComponent: RootFrame,

      onAllowKubeResource: () => {
        throw new Error(
          "Tried to allow kube resource when environment is not cluster frame.",
        );
      },
    } as Environment,

    clusterFrame: {
      RootComponent: ClusterFrame,
      onAllowKubeResource: () => {},
    } as Environment,
  };

  let environment = environments.application;

  rendererDi.override(
    currentlyInClusterFrameInjectable,
    () => environment === environments.clusterFrame,
  );

  rendererDi.override(rendererExtensionsInjectable, () =>
    computed(() => [...rendererExtensionsState]),
  );

  mainDi.override(mainExtensionsInjectable, () =>
    computed(() => [...mainExtensionsState]),
  );

  let trayMenuIconPath: string;

  const traySetMenuItemsMock = jest.fn<any, [MinimalTrayMenuItem[]]>();

  mainDi.override(electronTrayInjectable, () => ({
    start: () => {},
    stop: () => {},
    setMenuItems: traySetMenuItemsMock,
    setIconPath: (path) => {
      trayMenuIconPath = path;
    },
  }));

  let allowedResourcesState: IObservableArray<KubeResource>;
  let rendered: RenderResult;

  const enableExtensionsFor = <T extends ObservableSet>(
    extensionState: T,
    di: DiContainer,
  ) => {
    const getExtension = (extension: LensExtension) =>
      di.inject(extensionInjectable, extension);

    return (...extensionInstances: LensExtension[]) => {
      const addAndEnableExtensions = () => {
        extensionInstances.forEach(instance => {
          const extension = getExtension(instance);

          extension.register();
        });

        runInAction(() => {
          extensionInstances.forEach((extension) => {
            extensionState.add(extension);
          });
        });
      };

      if (rendered) {
        addAndEnableExtensions();
      } else {
        builder.beforeRender(addAndEnableExtensions);
      }
    };
  };

  const enableRendererExtension = enableExtensionsFor(rendererExtensionsState, rendererDi);
  const enableMainExtension = enableExtensionsFor(mainExtensionsState, mainDi);
  const disableRendererExtension = disableExtensionsFor(rendererExtensionsState, rendererDi);
  const disableMainExtension = disableExtensionsFor(mainExtensionsState, mainDi);

  const selectOptionFor = (menuId: string) => (labelText: string) => {
    const menuOptions = rendered.baseElement.querySelector<HTMLElement>(
      `.${menuId}-options`,
    );

    assert(menuOptions, `Could not find select options for menu with ID "${menuId}"`);

    const option = queryByText(menuOptions, labelText);

    assert(option, `Could not find select option with label "${labelText}" for menu with ID "${menuId}"`);

    userEvent.click(option);
  };

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

        menuItem.click?.(
          {
            menu: null as never,
            commandId: 0,
            userAccelerator: null,
            ...menuItem,
          } as MenuItem,
          undefined,
          {},
        );
      },
    },

    tray: {
      get: (id: string) => {
        const lastCall = last(traySetMenuItemsMock.mock.calls);

        assert(lastCall);

        return lastCall[0].find(matches({ id })) ?? null;
      },

      getIconPath: () => trayMenuIconPath,

      click: async (id: string) => {
        const lastCall = last(traySetMenuItemsMock.mock.calls);

        assert(lastCall);

        const trayMenuItems = lastCall[0];

        const menuItem = trayMenuItems.find(matches({ id })) ?? null;

        if (!menuItem) {
          const availableIds = pipeline(
            trayMenuItems,
            filter(item => !!item.click),
            map(item => item.id),
            join(", "),
          );

          throw new Error(`Tried to click tray menu item with ID ${id} which does not exist. Available IDs are: "${availableIds}"`);
        }

        if (!menuItem.enabled) {
          throw new Error(`Tried to click tray menu item with ID ${id} which is disabled.`);
        }

        await menuItem.click?.();
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

      navigateTo: (route: Route<any>, params: Partial<NavigateToRouteOptions<any>>) => {
        const navigateToRoute = rendererDi.inject(navigateToRouteInjectionToken);

        navigateToRoute(route, params);
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

    helmCharts: {
      navigate: (parameters) => {
        const navigateToHelmCharts = rendererDi.inject(navigateToHelmChartsInjectable);

        navigateToHelmCharts(parameters);
      },
    },

    setEnvironmentToClusterFrame: () => {
      environment = environments.clusterFrame;

      allowedResourcesState = observable.array();

      rendererDi.override(allowedResourcesInjectable, () =>
        computed(() => new Set([...allowedResourcesState])),
      );

      const clusterStub = {
        accessibleNamespaces: [],
      } as unknown as Cluster;

      rendererDi.override(activeKubernetesClusterInjectable, () =>
        computed(() => catalogEntityFromCluster(clusterStub)),
      );

      const namespaceStoreStub = {
        contextNamespaces: [],
        items: [],
        selectNamespaces: () => {},
      } as unknown as NamespaceStore;

      const clusterFrameContextFake = new ClusterFrameContext(
        clusterStub,

        {
          namespaceStore: namespaceStoreStub,
        },
      );

      rendererDi.override(namespaceStoreInjectable, () => namespaceStoreStub);
      rendererDi.override(hostedClusterInjectable, () => clusterStub);
      rendererDi.override(hostedClusterIdInjectable, () => "irrelevant-hosted-cluster-id");
      rendererDi.override(clusterFrameContextInjectable, () => clusterFrameContextFake);

      // Todo: get rid of global state.
      KubeObjectStore.defaultContext.set(clusterFrameContextFake);

      return builder;
    },

    extensions: {
      renderer: {
        enable: enableRendererExtension,
        disable: disableRendererExtension,
      },

      main: {
        enable: enableMainExtension,
        disable: disableMainExtension,
      },

      enable: (...extensions) => {
        const rendererExtensions = extensions.map(extension => extension.renderer);
        const mainExtensions = extensions.map(extension => extension.main);

        enableRendererExtension(...rendererExtensions);
        enableMainExtension(...mainExtensions);
      },

      disable: (...extensions) => {
        const rendererExtensions = extensions.map(extension => extension.renderer);
        const mainExtensions = extensions.map(extension => extension.main);

        disableRendererExtension(...rendererExtensions);
        disableMainExtension(...mainExtensions);
      },
    },

    allowKubeResource: (resourceName) => {
      environment.onAllowKubeResource();

      runInAction(() => {
        allowedResourcesState.push(resourceName);
      });

      return builder;
    },

    beforeApplicationStart(callback: (dis: DiContainers) => void) {
      beforeApplicationStartCallbacks.push(callback);

      return builder;
    },

    beforeRender(callback: (dis: DiContainers) => void) {
      beforeRenderCallbacks.push(callback);

      return builder;
    },

    async render() {
      mainDi.inject(lensProxyPortInjectable).set(42);

      for (const callback of beforeApplicationStartCallbacks) {
        await callback(dis);
      }

      const startMainApplication = mainDi.inject(startMainApplicationInjectable);

      await startMainApplication();

      const applicationWindow = mainDi.inject(applicationWindowInjectable);

      await applicationWindow.start();

      const startFrame = rendererDi.inject(startFrameInjectable);

      await startFrame();

      for (const callback of beforeRenderCallbacks) {
        await callback(dis);
      }

      const history = rendererDi.inject(historyInjectable);

      const render = renderFor(rendererDi);

      rendered = render(
        <Router history={history}>
          <environment.RootComponent />
        </Router>,
      );

      return rendered;
    },

    select: {
      openMenu: (menuId) => {
        const select = rendered.baseElement.querySelector<HTMLElement>(
          `#${menuId}`,
        );

        assert(select, `Could not find select with ID "${menuId}"`);

        openMenu(select);

        return {
          selectOption: selectOptionFor(menuId),
        };
      },

      selectOption: (menuId, labelText) => selectOptionFor(menuId)(labelText),

      getValue: (menuId) => {
        const select = rendered.baseElement.querySelector<HTMLInputElement>(
          `#${menuId}`,
        );

        assert(select, `Could not find select with ID "${menuId}"`);

        const controlElement = select.closest(".Select__control");

        assert(controlElement, `Could not find select value for menu with ID "${menuId}"`);

        return controlElement.textContent || "";
      },
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

const disableExtensionsFor = <T extends ObservableSet>(
  extensionState: T,
  di: DiContainer,
) => {
  const getExtension = (instance: LensExtension) =>
    di.inject(extensionInjectable, instance);

  return (...extensionInstances: LensExtension[]) => {
    extensionInstances.forEach((instance) => {
      const extension = getExtension(instance);

      runInAction(() => {
        extension.deregister();

        extensionState.delete(instance);
      });
    });
  };
};
