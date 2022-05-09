/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

import quitAndInstallUpdateInjectable from "../../main/electron-app/features/quit-and-install-update.injectable";
import type { RenderResult } from "@testing-library/react";

describe("trigger updating using tray", () => {
  let applicationBuilder: ApplicationBuilder;
  let quitAndInstallUpdateMock: jest.Mock;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeApplicationStart(({ mainDi }) => {
      quitAndInstallUpdateMock = jest.fn();

      mainDi.override(quitAndInstallUpdateInjectable, () => quitAndInstallUpdateMock);
    });
  });

  describe("given no update available, when started", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      rendered = await applicationBuilder.render();
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("does not quit and install update yet", () => {
      expect(quitAndInstallUpdateMock).not.toHaveBeenCalled();
    });

    it("does not have possibility to trigger installation of an update", () => {
      const trayItem = applicationBuilder.tray.get("trigger-application-update");

      expect(trayItem).toBe(undefined);
    });

    describe("when an update becomes ready to be installed", () => {
      beforeEach(() => {
        applicationBuilder.applicationUpdater.setUpdateIsReadyToBeInstalled(true);
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("does not quit and install update yet", () => {
        expect(quitAndInstallUpdateMock).not.toHaveBeenCalled();
      });

      it("has possibility to trigger installation of the update", () => {
        const trayItem = applicationBuilder.tray.get("trigger-application-update");

        expect(trayItem).not.toBe(undefined);
      });

      describe("when triggering installation of the update", () => {
        beforeEach(() => {
          applicationBuilder.tray.click("trigger-application-update");
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        it("quits application and installs update", () => {
          expect(quitAndInstallUpdateMock).toHaveBeenCalled();
        });
      });

      describe("when update becomes unavailable", () => {
        beforeEach(async () => {
          applicationBuilder.applicationUpdater.setUpdateIsReadyToBeInstalled(false);
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        it("does not have possibility to trigger installation of the update anymore", () => {
          const trayItem = applicationBuilder.tray.get("trigger-application-update");

          expect(trayItem).toBe(undefined);
        });
      });
    });
  });
});
