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
import React from "react";
import { Router } from "react-router";
import { Observer } from "mobx-react";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import allowedResourcesInjectable from "../../../common/cluster-store/allowed-resources.injectable";
import type { RenderResult } from "@testing-library/react";
import { getByText, fireEvent } from "@testing-library/react";
import type { KubeResource } from "../../../common/rbac";
import { Sidebar } from "../layout/sidebar";
import type { DiContainer } from "@ogre-tools/injectable";
import clusterStoreInjectable from "../../../common/cluster-store/cluster-store.injectable";
import type { ClusterStore } from "../../../common/cluster-store/cluster-store";
import mainExtensionsInjectable from "../../../extensions/main-extensions.injectable";
import currentRouteComponentInjectable from "../../routes/current-route-component.injectable";
import { pipeline } from "@ogre-tools/fp";
import { flatMap, compact, join, get, filter, map, matches, find } from "lodash/fp";
import preferenceNavigationItemsInjectable from "../+preferences/preferences-navigation/preference-navigation-items.injectable";
import navigateToPreferencesInjectable from "../../../common/front-end-routing/routes/preferences/navigate-to-preferences.injectable";
import type { MenuItemOpts } from "../../../main/menu/application-menu-items.injectable";
import applicationMenuItemsInjectable from "../../../main/menu/application-menu-items.injectable";
import type { MenuItemConstructorOptions, MenuItem } from "electron";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import navigateToHelmChartsInjectable from "../../../common/front-end-routing/routes/cluster/helm/charts/navigate-to-helm-charts.injectable";
import hostedClusterInjectable from "../../../common/cluster-store/hosted-cluster.injectable";
import { ClusterFrameContext } from "../../cluster-frame-context/cluster-frame-context";
import type { Cluster } from "../../../common/cluster/cluster";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import clusterFrameContextInjectable from "../../cluster-frame-context/cluster-frame-context.injectable";
import startMainApplicationInjectable from "../../../main/start-main-application/start-main-application.injectable";
import startFrameInjectable from "../../start-frame/start-frame.injectable";
import type { NamespaceStore } from "../+namespaces/store";
import namespaceStoreInjectable from "../+namespaces/store.injectable";
import historyInjectable from "../../navigation/history.injectable";
import electronTrayInjectable from "../../../main/tray/electron-tray/electron-tray.injectable";
import applicationWindowInjectable from "../../../main/start-main-application/lens-window/application-window/application-window.injectable";
import { Notifications } from "../notifications/notifications";
import broadcastThatRootFrameIsRenderedInjectable from "../../frames/root-frame/broadcast-that-root-frame-is-rendered.injectable";
import { getDiForUnitTesting as getRendererDi } from "../../getDiForUnitTesting";
import { getDiForUnitTesting as getMainDi } from "../../../main/getDiForUnitTesting";
import { overrideChannels } from "../../../test-utils/channel-fakes/override-channels";
import type { TrayMenuItem } from "../../../main/tray/tray-menu-item/tray-menu-item-injection-token";
import trayIconPathsInjectable from "../../../main/tray/tray-icon-path.injectable";
import assert from "assert";
import { openMenu } from "react-select-event";
import userEvent from "@testing-library/user-event";
import { StatusBar } from "../status-bar/status-bar";
import lensProxyPortInjectable from "../../../main/lens-proxy/lens-proxy-port.injectable";

type Callback = (dis: DiContainers) => void | Promise<void>;

export interface ApplicationBuilder {
  dis: DiContainers;
  setEnvironmentToClusterFrame: () => ApplicationBuilder;
  addExtensions: (...extensions: LensRendererExtension[]) => Promise<ApplicationBuilder>;
  allowKubeResource: (resourceName: KubeResource) => ApplicationBuilder;
  beforeApplicationStart: (callback: Callback) => ApplicationBuilder;
  beforeRender: (callback: Callback) => ApplicationBuilder;
  render: () => Promise<RenderResult>;

  tray: {
    click: (id: string) => Promise<void>;
    get: (id: string) => TrayMenuItem | null;
    getIconPath: () => string;
  };

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

  helmCharts: {
    navigate: () => void;
  };

  select: {
    openMenu: (id: string) => void;
    selectOption: (menuId: string, labelText: string) => void;
  };
}

interface DiContainers {
  rendererDi: DiContainer;
  mainDi: DiContainer;
}

interface Environment {
  renderSidebar: () => React.ReactNode;
  renderStatusBar: () => React.ReactNode;
  beforeRender: () => void;
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

  const extensionsState = observable.array<LensRendererExtension>();

  rendererDi.override(subscribeStoresInjectable, () => () => () => {});

  const environments = {
    application: {
      renderSidebar: () => null,

      renderStatusBar: () => <StatusBar />,

      beforeRender: () => {
        const nofifyThatRootFrameIsRendered = rendererDi.inject(broadcastThatRootFrameIsRenderedInjectable);

        nofifyThatRootFrameIsRendered();
      },

      onAllowKubeResource: () => {
        throw new Error(
          "Tried to allow kube resource when environment is not cluster frame.",
        );
      },
    } as Environment,

    clusterFrame: {
      renderSidebar: () => <Sidebar />,
      renderStatusBar: () => null,
      beforeRender: () => {},
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

  let trayMenuItemsStateFake: TrayMenuItem[];
  let trayMenuIconPath: string;

  mainDi.override(electronTrayInjectable, () => ({
    start: () => {
      const iconPaths = mainDi.inject(trayIconPathsInjectable);

      trayMenuIconPath = iconPaths.normal;
    },
    stop: () => {},
    setMenuItems: (items) => {
      trayMenuItemsStateFake = items;
    },
    setIconPath: (path) => {
      trayMenuIconPath = path;
    },
  }));

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
        return trayMenuItemsStateFake.find(matches({ id })) ?? null;
      },
      getIconPath: () => trayMenuIconPath,
      click: async (id: string) => {
        const menuItem = pipeline(
          trayMenuItemsStateFake,
          find((menuItem) => menuItem.id === id),
        );

        if (!menuItem) {
          const availableIds = pipeline(
            trayMenuItemsStateFake,
            filter(item => !!item.click),
            map(item => item.id),
            join(", "),
          );

          throw new Error(`Tried to click tray menu item with ID ${id} which does not exist. Available IDs are: "${availableIds}"`);
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
      navigate: () => {
        const navigateToHelmCharts = rendererDi.inject(navigateToHelmChartsInjectable);

        navigateToHelmCharts();
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

      const namespaceStoreStub = {
        contextNamespaces: [],
      } as unknown as NamespaceStore;

      const clusterFrameContextFake = new ClusterFrameContext(
        clusterStub,

        {
          namespaceStore: namespaceStoreStub,
        },
      );

      rendererDi.override(namespaceStoreInjectable, () => namespaceStoreStub);
      rendererDi.override(hostedClusterInjectable, () => clusterStub);
      rendererDi.override(clusterFrameContextInjectable, () => clusterFrameContextFake);

      // Todo: get rid of global state.
      KubeObjectStore.defaultContext.set(clusterFrameContextFake);

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

      const render = renderFor(rendererDi);
      const history = rendererDi.inject(historyInjectable);
      const currentRouteComponent = rendererDi.inject(currentRouteComponentInjectable);

      for (const callback of beforeRenderCallbacks) {
        await callback(dis);
      }

      environment.beforeRender();

      rendered = render(
        <Router history={history}>
          {environment.renderSidebar()}
          {environment.renderStatusBar()}

          <Observer>
            {() => {
              const Component = currentRouteComponent.get();

              if (!Component) {
                return null;
              }

              return <Component />;
            }}
          </Observer>

          <Notifications />
        </Router>,
      );

      return rendered;
    },

    select: {
      openMenu: (menuId) => {
        const selector = rendered.container.querySelector<HTMLElement>(
          `#${menuId}`,
        );

        assert(selector);

        openMenu(selector);
      },

      selectOption: (menuId, labelText) => {
        const menuOptions = rendered.baseElement.querySelector<HTMLElement>(
          `.${menuId}-options`,
        );

        assert(menuOptions);

        const option = getByText(menuOptions, labelText);

        userEvent.click(option);
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
