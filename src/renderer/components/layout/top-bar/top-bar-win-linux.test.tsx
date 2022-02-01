/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { TopBar } from "./top-bar";
import * as vars from "../../../../common/vars";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { DiRender, renderFor } from "../../test-utils/renderFor";
import directoryForUserDataInjectable from "../../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import mockFs from "mock-fs";
import { emitOpenAppMenuAsContextMenu, requestWindowAction } from "../../../ipc";

const mockConfig = vars as { isWindows: boolean; isLinux: boolean };

jest.mock("../../../../common/ipc");
jest.mock("../../../ipc");

jest.mock("../../../../common/vars", () => {
  const { SemVer } = require("semver");

  return {
    ...jest.requireActual<{}>("../../../../common/vars"),
    __esModule: true,
    isWindows: null,
    isLinux: null,
    appSemVer: new SemVer("1.0.0"),
  };
});

describe("<TopBar/> in Windows and Linux", () => {
  let render: DiRender;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    mockFs();

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");

    await di.runSetups();

    render = renderFor(di);
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("shows window controls on Windows", () => {
    mockConfig.isWindows = true;
    mockConfig.isLinux = false;

    const { getByTestId } = render(<TopBar />);

    expect(getByTestId("window-menu")).toBeInTheDocument();
    expect(getByTestId("window-minimize")).toBeInTheDocument();
    expect(getByTestId("window-maximize")).toBeInTheDocument();
    expect(getByTestId("window-close")).toBeInTheDocument();
  });

  it("shows window controls on Linux", () => {
    mockConfig.isWindows = false;
    mockConfig.isLinux = true;

    const { getByTestId } = render(<TopBar />);

    expect(getByTestId("window-menu")).toBeInTheDocument();
    expect(getByTestId("window-minimize")).toBeInTheDocument();
    expect(getByTestId("window-maximize")).toBeInTheDocument();
    expect(getByTestId("window-close")).toBeInTheDocument();
  });

  it("triggers ipc events on click", () => {
    mockConfig.isWindows = true;

    const { getByTestId } = render(<TopBar />);

    const menu = getByTestId("window-menu");
    const minimize = getByTestId("window-minimize");
    const maximize = getByTestId("window-maximize");
    const close = getByTestId("window-close");

    fireEvent.click(menu);
    expect(emitOpenAppMenuAsContextMenu).toHaveBeenCalledWith();

    fireEvent.click(minimize);
    expect(requestWindowAction).toHaveBeenCalledWith("minimize");

    fireEvent.click(maximize);
    expect(requestWindowAction).toHaveBeenCalledWith("toggle-maximize");

    fireEvent.click(close);
    expect(requestWindowAction).toHaveBeenCalledWith("close");
  });
});
