/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { screen } from "@testing-library/react";
import { dockerPod } from "./pod.mock";
import { getDiForUnitTesting } from "../../../../getDiForUnitTesting";
import type { DiRender } from "../../../test-utils/renderFor";
import { renderFor } from "../../../test-utils/renderFor";
import type { LogTabViewModelDependencies } from "../logs-view-model";
import { LogTabViewModel } from "../logs-view-model";
import type { TabId } from "../../dock/store";
import { LogSearch } from "../search";
import userEvent from "@testing-library/user-event";
import { SearchStore } from "../../../../search-store/search-store";

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

  return mockLogTabViewModel(tabId, {
    getLogTabData: () => ({
      selectedPodId: selectedPod.getId(),
      selectedContainer: selectedPod.getContainers()[0].name,
      namespace: selectedPod.getNs(),
      showPrevious: false,
      showTimestamps: false,
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

describe("LogSearch tests", () => {
  let render: DiRender;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    render = renderFor(di);

    await di.runSetups();
  });

  it("renders w/o errors", () => {
    const model = getOnePodViewModel("foobar");
    const { container } = render(
      <LogSearch
        model={model}
        scrollToOverlay={jest.fn()}
      />,
    );

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("should scroll to new active overlay when clicking the previous button", async () => {
    const scrollToOverlay = jest.fn();
    const model = getOnePodViewModel("foobar", {
      getLogsWithoutTimestamps: () => [
        "hello",
        "world",
      ],
    });

    render(
      <LogSearch
        model={model}
        scrollToOverlay={scrollToOverlay}
      />,
    );

    userEvent.click(await screen.findByPlaceholderText("Search..."));
    userEvent.keyboard("o");
    userEvent.click(await screen.findByText("keyboard_arrow_up"));
    expect(scrollToOverlay).toBeCalled();
  });

  it("should scroll to new active overlay when clicking the next button", async () => {
    const scrollToOverlay = jest.fn();
    const model = getOnePodViewModel("foobar", {
      getLogsWithoutTimestamps: () => [
        "hello",
        "world",
      ],
    });

    render(
      <LogSearch
        model={model}
        scrollToOverlay={scrollToOverlay}
      />,
    );

    userEvent.click(await screen.findByPlaceholderText("Search..."));
    userEvent.keyboard("o");
    userEvent.click(await screen.findByText("keyboard_arrow_down"));
    expect(scrollToOverlay).toBeCalled();
  });

  it("next and previous should be disabled initially", async () => {
    const scrollToOverlay = jest.fn();
    const model = getOnePodViewModel("foobar", {
      getLogsWithoutTimestamps: () => [
        "hello",
        "world",
      ],
    });

    render(
      <LogSearch
        model={model}
        scrollToOverlay={scrollToOverlay}
      />,
    );

    userEvent.click(await screen.findByText("keyboard_arrow_down"));
    userEvent.click(await screen.findByText("keyboard_arrow_up"));
    expect(scrollToOverlay).not.toBeCalled();
  });
});
