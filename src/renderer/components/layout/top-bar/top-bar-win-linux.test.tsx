/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { TopBar } from "./top-bar";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { DiRender, renderFor } from "../../test-utils/renderFor";
import directoryForUserDataInjectable from "../../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import mockFs from "mock-fs";
import { emitOpenAppMenuAsContextMenu, requestWindowAction } from "../../../ipc";
import isLinuxInjectable from "../../../../common/vars/is-linux.injectable";
import isMacInjectable from "../../../../common/vars/is-mac.injectable";
import isWindowsInjectable from "../../../../common/vars/is-windows.injectable";
import type { DiContainer } from "@ogre-tools/injectable";

jest.mock("../../../../common/ipc");
jest.mock("../../../ipc");

describe("<TopBar/> in Windows and Linux", () => {
  let render: DiRender;
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(isMacInjectable, () => false);

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");

    mockFs();

    render = renderFor(di);
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("shows window controls on Windows", () => {
    di.override(isWindowsInjectable, () => true);

    const { getByTestId } = render(<TopBar />);

    expect(getByTestId("window-menu")).toBeInTheDocument();
    expect(getByTestId("window-minimize")).toBeInTheDocument();
    expect(getByTestId("window-maximize")).toBeInTheDocument();
    expect(getByTestId("window-close")).toBeInTheDocument();
  });

  it("shows window controls on Linux", () => {
    di.override(isLinuxInjectable, () => true);

    const { getByTestId } = render(<TopBar />);

    expect(getByTestId("window-menu")).toBeInTheDocument();
    expect(getByTestId("window-minimize")).toBeInTheDocument();
    expect(getByTestId("window-maximize")).toBeInTheDocument();
    expect(getByTestId("window-close")).toBeInTheDocument();
  });

  it("triggers ipc events on click", () => {
    di.override(isWindowsInjectable, () => true);

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
