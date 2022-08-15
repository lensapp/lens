/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import type { RenderResult } from "@testing-library/react";
import { act, waitFor } from "@testing-library/react";
import getPodByIdInjectable from "../../../+workloads-pods/get-pod-by-id.injectable";
import getPodsByOwnerIdInjectable from "../../../+workloads-pods/get-pods-by-owner-id.injectable";
import { SearchStore } from "../../../../search-store/search-store";
import searchStoreInjectable from "../../../../search-store/search-store.injectable";
import openSaveFileDialogInjectable from "../../../../utils/save-file.injectable";
import type { ApplicationBuilder } from "../../../test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../test-utils/get-application-builder";
import dockStoreInjectable from "../../dock/store.injectable";
import areLogsPresentInjectable from "../are-logs-present.injectable";
import callForLogsInjectable, { CallForLogs } from "../call-for-logs.injectable";
import createPodLogsTabInjectable from "../create-pod-logs-tab.injectable";
import getLogTabDataInjectable from "../get-log-tab-data.injectable";
import getLogsWithoutTimestampsInjectable from "../get-logs-without-timestamps.injectable";
import getLogsInjectable from "../get-logs.injectable";
import getRandomIdForPodLogsTabInjectable from "../get-random-id-for-pod-logs-tab.injectable";
import getTimestampSplitLogsInjectable from "../get-timestamp-split-logs.injectable";
import loadLogsInjectable from "../load-logs.injectable";
import reloadLogsInjectable from "../reload-logs.injectable";
import setLogTabDataInjectable from "../set-log-tab-data.injectable";
import stopLoadingLogsInjectable from "../stop-loading-logs.injectable";
import { dockerPod } from "./pod.mock";

describe("download logs options in pod logs dock tab", () => {
  let rendered: RenderResult;
  let rendererDi: DiContainer;
  let builder: ApplicationBuilder;
  let openSaveFileDialogMock: jest.MockedFunction<() => void>;
  let callForLogsMock: jest.MockedFunction<CallForLogs>;
  const logs = new Map([["timestamp", "some-logs"]]);

  beforeEach(() => {
    const selectedPod = dockerPod;

    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    callForLogsMock = jest.fn();

    builder.beforeApplicationStart(({ rendererDi }) => {
      rendererDi.override(callForLogsInjectable, () => callForLogsMock);

      // Overriding internals of logsViewModelInjectable
      rendererDi.override(getLogsInjectable, () => () => ["some-logs"]);
      rendererDi.override(getLogsWithoutTimestampsInjectable, () => () => ["some-logs"]);
      rendererDi.override(getTimestampSplitLogsInjectable, () => () => [...logs]);
      rendererDi.override(reloadLogsInjectable, () => jest.fn());
      rendererDi.override(getLogTabDataInjectable, () => () => ({
        selectedPodId: selectedPod.getId(),
        selectedContainer: selectedPod.getContainers()[0].name,
        namespace: "default",
        showPrevious: true,
        showTimestamps: false,
      }));
      rendererDi.override(setLogTabDataInjectable, () => jest.fn());
      rendererDi.override(loadLogsInjectable, () => jest.fn());
      rendererDi.override(stopLoadingLogsInjectable, () => jest.fn());
      rendererDi.override(areLogsPresentInjectable, () => jest.fn());
      rendererDi.override(getPodByIdInjectable, () => (id) => id === selectedPod.getId() ? selectedPod : undefined),
      rendererDi.override(getPodsByOwnerIdInjectable, () => jest.fn());
      rendererDi.override(searchStoreInjectable, () => new SearchStore());
      
      rendererDi.override(getRandomIdForPodLogsTabInjectable, () => jest.fn(() => "some-irrelevant-random-id"));

      openSaveFileDialogMock = jest.fn();
      rendererDi.override(openSaveFileDialogInjectable, () => openSaveFileDialogMock);
    });

  });

  describe("when opening pod logs", () => {
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

      describe("when call for logs resolves with logs", () => {
        beforeEach(() => {
          callForLogsMock.mockResolvedValue("all-logs");
        })

        describe("when selected 'download visible logs'", () => {
          beforeEach(() => {
            const button = rendered.getByTestId("download-visible-logs");
            button.click();
          });

          it("shows save dialog with proper attributes", () => {
            expect(openSaveFileDialogMock).toHaveBeenCalledWith("dockerExporter.log", "some-logs", "text/plain")
          });
        })

        describe("when selected 'download all logs'", () => {
          beforeEach(async () => {
            await act(async () => {
              const button = rendered.getByTestId("download-all-logs");
              button.click();
            });
          });

          it("logs have been called with query", () => {
            expect(callForLogsMock).toHaveBeenCalledWith(
              { name: "dockerExporter", namespace: "default" },
              { "previous": true, "timestamps": false }
            );
          })

          it("shows save dialog with proper attributes", async () => {
            expect(openSaveFileDialogMock).toHaveBeenCalledWith("dockerExporter.log", "all-logs", "text/plain")
          });

          it("doesn't block download dropdown for interaction after click", async () => {
            expect(rendered.getByTestId("download-logs-dropdown")).not.toHaveAttribute("disabled")
          });
        })

        describe("blocking user interaction", () => {
          it("block download dropdown for interaction when selected 'download all logs'", async () => {
            const downloadMenuItem = rendered.getByTestId("download-all-logs");

            act(() => downloadMenuItem.click());

            await waitFor(() => {
              expect(rendered.getByTestId("download-logs-dropdown")).toHaveAttribute("disabled")
            })
          });

          it("doesn't block dropdown for interaction when selected 'download visible logs'", () => {
            const downloadMenuItem = rendered.getByTestId("download-visible-logs");

            act(() => downloadMenuItem.click());

            expect(rendered.getByTestId("download-logs-dropdown")).not.toHaveAttribute("disabled")
          })
        })
      })

      describe("when call for logs rejects", () => {
        beforeEach(() => {
          callForLogsMock.mockRejectedValue("error");
        })

        describe("when selected 'download visible logs'", () => {
          beforeEach(async () => {
            await act(async () => {
              const button = rendered.getByTestId("download-visible-logs");
              button.click();
            });
          });

          it("shows save dialog with proper attributes", () => {
            expect(openSaveFileDialogMock).toHaveBeenCalledWith("dockerExporter.log", "some-logs", "text/plain")
          });
        })

        describe("when selected 'download all logs'", () => {
          beforeEach(async () => {
            await act(async () => {
              const button = rendered.getByTestId("download-all-logs");
              button.click();
            });
          });

          it("logs have been called", () => {
            expect(callForLogsMock).toHaveBeenCalledWith(
              { name: "dockerExporter", namespace: "default" },
              { "previous": true, "timestamps": false }
            );
          })

          it("doesn't show save dialog", async () => {
            expect(openSaveFileDialogMock).not.toHaveBeenCalled()
          });
        })
      })
    });
  });
});
