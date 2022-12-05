/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { getDiForUnitTesting } from "../../../../getDiForUnitTesting";
import { SearchStore } from "../../../../search-store/search-store";
import type { DiRender } from "../../../test-utils/renderFor";
import { renderFor } from "../../../test-utils/renderFor";
import type { TabId } from "../../dock/store";
import { LogList } from "../log-list";
import type { LogTabViewModelDependencies } from "../logs-view-model";
import { LogTabViewModel } from "../logs-view-model";
import type { LogTabData } from "../tab-store";
import { dockerPod } from "./pod.mock";

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
    unobserve: jest.fn(),
  })),
});

function mockLogTabViewModel(tabId: TabId, deps: Partial<LogTabViewModelDependencies>): LogTabViewModel {
  return new LogTabViewModel(tabId, {
    getLogs: jest.fn(),
    getLogsWithoutTimestamps: jest.fn(),
    getVisibleLogs: jest.fn(),
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
    downloadLogs: jest.fn(),
    downloadAllLogs: jest.fn(),
    ...deps,
  });
}

const getOnePodViewModel = (tabId: TabId, deps: Partial<LogTabViewModelDependencies> = {}, logTabData?: Partial<LogTabData>): LogTabViewModel => {
  const selectedPod = dockerPod;

  return mockLogTabViewModel(tabId, {
    getLogTabData: () => ({
      selectedPodId: selectedPod.getId(),
      selectedContainer: selectedPod.getContainers()[0].name,
      namespace: selectedPod.getNs(),
      showPrevious: false,
      showTimestamps: false,
      wrap: false,
      ...logTabData,
    }),
    getPodById: (id) => {
      if (id === selectedPod.getId()) {
        return selectedPod;
      }

      return undefined;
    },
    ...deps,
  });
};

describe("<LogList />", () => {
  let render: DiRender;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    render = renderFor(di);
  });

  it("renders empty list", () => {
    const { container } = render(<LogList model={getOnePodViewModel("tabId", {
      getVisibleLogs: () => [],
    })} />);

    expect(container.getElementsByClassName(".LogRow")).toHaveLength(0);
  });

  it("renders logs", () => {
    const model = getOnePodViewModel("foobar", {
      getVisibleLogs: () => [
        "hello",
        "world",
      ],
    });

    const list = render(<LogList model={model} />);

    expect(list.container).toMatchSnapshot();
  });

  describe("when user selected to wrap log lines", () => {
    const model = getOnePodViewModel("foobar", {
      getVisibleLogs: () => [
        "hello",
        "world",
      ]
    }, {
      wrap: true,
    });

    it("renders logs with wrapping", () => {
      const list = render(<LogList model={model} />);

      expect(list.container).toMatchSnapshot();
    });

    it("has specific class applied for log row wrappers", () => {
      const list = render(<LogList model={model} />);

      expect(list.container.getElementsByClassName("rowWrapper wrap")).toHaveLength(2);
    });
  });
});
