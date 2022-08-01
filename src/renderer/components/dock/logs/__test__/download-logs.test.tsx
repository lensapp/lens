/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import type { RenderResult } from "@testing-library/react";
import { SearchStore } from "../../../../search-store/search-store";
import { ApplicationBuilder, getApplicationBuilder } from "../../../test-utils/get-application-builder";
import type { TabId } from "../../dock/store";
import dockStoreInjectable from "../../dock/store.injectable";
import callForAllLogsInjectable from "../call-for-all-logs.injectable";
import createPodLogsTabInjectable from "../create-pod-logs-tab.injectable";
import getRandomIdForPodLogsTabInjectable from "../get-random-id-for-pod-logs-tab.injectable";
import { LogTabViewModel, LogTabViewModelDependencies } from "../logs-view-model";
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
      // logs: computed(() => ["some-logs"]),
      // timestampSplitLogs: logs,
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

  beforeEach(() => {
    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    builder.beforeApplicationStart(({ rendererDi }) => {
      rendererDi.override(callForAllLogsInjectable, () => () => Promise.resolve("all-logs"));
      rendererDi.override(logsViewModelInjectable, () => getOnePodViewModel("foobar"))
      rendererDi.override(getRandomIdForPodLogsTabInjectable, () =>
        jest
          .fn(() => "some-irrelevant-random-id")
          .mockReturnValueOnce("some-first-tab-id")
          .mockReturnValueOnce("some-second-tab-id"),
      );
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
        selectedContainer: container
      });
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("contains download dropdown button", () =>  {
      expect(rendered.getByTestId("download-logs-dropdown")).toBeInTheDocument();
    });
  });
});