/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import type { RenderResult } from "@testing-library/react";
import { act, waitFor } from "@testing-library/react";
import { SearchStore } from "../../../../search-store/search-store";
import openSaveFileDialogInjectable from "../../../../utils/save-file.injectable";
import type { ApplicationBuilder } from "../../../test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../test-utils/get-application-builder";
import type { TabId } from "../../dock/store";
import dockStoreInjectable from "../../dock/store.injectable";
import callForAllLogsInjectable from "../call-for-all-logs.injectable";
import createPodLogsTabInjectable from "../create-pod-logs-tab.injectable";
import getRandomIdForPodLogsTabInjectable from "../get-random-id-for-pod-logs-tab.injectable";
import type { LogTabViewModelDependencies } from "../logs-view-model";
import { LogTabViewModel } from "../logs-view-model";
import logsViewModelInjectable from "../logs-view-model.injectable";
import { dockerPod } from "./pod.mock";

function mockLogTabViewModel(tabId: TabId, deps: Partial<LogTabViewModelDependencies>): LogTabViewModel {
  return new LogTabViewModel(tabId, {
    getLogs: jest.fn(),
    getLogsWithoutTimestamps: jest.fn(),
    getTimestampSplitLogs: jest.fn(),
    getLogTabData: jest.fn(),
    setLogTabData: jest.fn(),
    loadLogs: jest.fn(),
    reloadLogs: jest.fn(),
    renameTab: jest.fn(),
    stopLoadingLogs: jest.fn(),
    getPodById: jest.fn(),
    getPodsByOwnerId: jest.fn(),
    areLogsPresent: jest.fn(),
    searchStore: new SearchStore(),
    ...deps,
  });
}

const getOnePodViewModel = (tabId: TabId, deps: Partial<LogTabViewModelDependencies> = {}): LogTabViewModel => {
  const selectedPod = dockerPod;

  const logs = new Map([["timestamp", "some-logs"]]);

  return mockLogTabViewModel(tabId, {
    getLogTabData: () => ({
      selectedPodId: selectedPod.getId(),
      selectedContainer: selectedPod.getContainers()[0].name,
      namespace: "sadsadaasdad",
      showPrevious: false,
      showTimestamps: false,
    }),
    getPodById: (id) => {
      if (id === selectedPod.getId()) {
        return selectedPod;
      }

      return undefined;
    },
    getTimestampSplitLogs: () => [...logs],
    getLogs: () => ["some-logs"],
    getLogsWithoutTimestamps: () => ["some-logs"],
    ...deps,
  });
};

describe("download logs options in pod logs dock tab", () => {
  let builder: ApplicationBuilder;
  let openSaveFileDialogMock: jest.MockedFunction<() => void>;

  beforeEach(() => {
    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    builder.beforeApplicationStart(({ rendererDi }) => {
      rendererDi.override(callForAllLogsInjectable, () => () => Promise.resolve("all-logs"));
      rendererDi.override(logsViewModelInjectable, () => getOnePodViewModel("foobar"));
      rendererDi.override(getRandomIdForPodLogsTabInjectable, () => jest.fn(() => "some-irrelevant-random-id"));

      openSaveFileDialogMock = jest.fn();
      rendererDi.override(openSaveFileDialogInjectable, () => openSaveFileDialogMock);
    });

  });

  describe("when opening pod logs", () => {
    let rendered: RenderResult;
    let rendererDi: DiContainer;
    
    beforeEach(async () => {
      rendered = await builder.render();
      rendererDi = builder.dis.rendererDi;

      const pod = dockerPod;
      const createLogsTab = rendererDi.inject(createPodLogsTabInjectable);
      const container = {
        name: "docker-exporter",
        image: "docker.io/prom/node-exporter:v1.0.0-rc.0",
        imagePullPolicy: "pull",
      };

      const dockStore = rendererDi.inject(dockStoreInjectable);

      dockStore.closeTab("terminal");

      createLogsTab({
        selectedPod: pod,
        selectedContainer: container,
      });
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("contains download dropdown button", () =>  {
      expect(rendered.getByTestId("download-logs-dropdown")).toBeInTheDocument();
    });

    describe("when clicking on button", () => {
      beforeEach(() => {
        const button = rendered.getByTestId("download-logs-dropdown");

        act(() => button.click());
      });

      it("shows download visible logs menu item", () => {
        expect(rendered.getByTestId("download-visible-logs")).toBeInTheDocument();
      });

      it("shows download all logs menu item", () => {
        expect(rendered.getByTestId("download-all-logs")).toBeInTheDocument();
      });

      it("when selected 'download visible logs', shows save dialog with proper attributes", async () => {
        const downloadMenuItem = rendered.getByTestId("download-visible-logs");

        downloadMenuItem.click();
        
        await waitFor(() =>
          expect(openSaveFileDialogMock).toHaveBeenCalledWith("dockerExporter.log", "some-logs", "text/plain"),
        );
      });

      it("when selected 'download all logs', shows save dialog with proper attributes", async () => {
        const downloadMenuItem = rendered.getByTestId("download-all-logs");

        downloadMenuItem.click();

        await waitFor(() =>
          expect(openSaveFileDialogMock).toHaveBeenCalledWith("dockerExporter.log", "all-logs", "text/plain"),
        );
      });

      it("when selected 'download all logs', block download dropdown for interaction", async () => {
        const downloadMenuItem = rendered.getByTestId("download-all-logs");
        
        downloadMenuItem.click();

        await waitFor(() =>
          expect(rendered.getByTestId("download-logs-dropdown")).toHaveAttribute("disabled"),
        );
      });

      it("when save file dialog opens, restore download button for interaction", async () => {
        const downloadMenuItem = rendered.getByTestId("download-all-logs");

        downloadMenuItem.click();

        await waitFor(() =>
          expect(openSaveFileDialogMock).toHaveBeenCalled(),
        );
          
        expect(rendered.getByTestId("download-logs-dropdown")).not.toHaveAttribute("disabled");
      });
    });
  });
});
