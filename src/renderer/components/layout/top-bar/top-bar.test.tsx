/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { TopBar } from "./top-bar";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import type { DiContainer } from "@ogre-tools/injectable";
import type { DiRender } from "../../test-utils/renderFor";
import { renderFor } from "../../test-utils/renderFor";
import topBarItemsInjectable from "./top-bar-items/top-bar-items.injectable";
import { computed } from "mobx";
import directoryForUserDataInjectable from "../../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import mockFs from "mock-fs";
import isLinuxInjectable from "../../../../common/vars/is-linux.injectable";
import isWindowsInjectable from "../../../../common/vars/is-windows.injectable";

jest.mock("../../../../common/vars", () => {
  const { SemVer } = require("semver");

  return {
    ...jest.requireActual<{}>("../../../../common/vars"),
    appSemVer: new SemVer("1.0.0"),
  };
});

const goBack = jest.fn();
const goForward = jest.fn();

jest.mock(
  "electron",
  () => ({
    ipcRenderer: {
      on: jest.fn(
        (channel: string, listener: (event: any, ...args: any[]) => void) => {
          if (channel === "history:can-go-back") {
            listener({}, true);
          }

          if (channel === "history:can-go-forward") {
            listener({}, true);
          }
        },
      ),
      invoke: jest.fn(
        (channel: string, action: string) => {
          console.log("channel", channel, action);

          if (channel !== "window:window-action") return;

          switch(action) {
            case "back": {
              goBack();
              break;
            }

            case "forward": {
              goForward();
              break;
            }
          }
        },
      ),
    },
  }),
);

jest.mock("../../+catalog", () => ({
  previousActiveTab: jest.fn(),
}));

describe("<TopBar/>", () => {
  let di: DiContainer;
  let render: DiRender;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    mockFs();

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");

    render = renderFor(di);
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("renders w/o errors", () => {
    const { container } = render(<TopBar/>);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("renders home button", async () => {
    const { findByTestId } = render(<TopBar/>);

    expect(await findByTestId("home-button")).toBeInTheDocument();
  });

  it("renders history arrows", async () => {
    const { findByTestId } = render(<TopBar/>);

    expect(await findByTestId("history-back")).toBeInTheDocument();
    expect(await findByTestId("history-forward")).toBeInTheDocument();
  });

  it("enables arrow by ipc event", async () => {
    const { findByTestId } = render(<TopBar/>);

    expect(await findByTestId("history-back")).not.toHaveClass("disabled");
    expect(await findByTestId("history-forward")).not.toHaveClass("disabled");
  });

  it("triggers browser history back and forward", async () => {
    const { findByTestId } = render(<TopBar/>);

    const prevButton = await findByTestId("history-back");
    const nextButton = await findByTestId("history-forward");

    fireEvent.click(prevButton);

    expect(goBack).toBeCalled();

    fireEvent.click(nextButton);

    expect(goForward).toBeCalled();
  });

  it("renders items", async () => {
    const testId = "testId";
    const text = "an item";

    di.override(topBarItemsInjectable, () => computed(() => [
      {
        components: {
          Item: () => <span data-testid={testId}>{text}</span>,
        },
      },
    ]));

    const { findByTestId } = render(<TopBar/>);

    expect(await findByTestId(testId)).toHaveTextContent(text);
  });

  it("doesn't show windows title buttons on macos", () => {
    di.override(isLinuxInjectable, () => false);
    di.override(isWindowsInjectable, () => false);

    const { queryByTestId } = render(<TopBar/>);

    expect(queryByTestId("window-menu")).not.toBeInTheDocument();
    expect(queryByTestId("window-minimize")).not.toBeInTheDocument();
    expect(queryByTestId("window-maximize")).not.toBeInTheDocument();
    expect(queryByTestId("window-close")).not.toBeInTheDocument();
  });

  it("does show windows title buttons on linux", () => {
    di.override(isLinuxInjectable, () => true);
    di.override(isWindowsInjectable, () => false);

    const { queryByTestId } = render(<TopBar/>);

    expect(queryByTestId("window-menu")).toBeInTheDocument();
    expect(queryByTestId("window-minimize")).toBeInTheDocument();
    expect(queryByTestId("window-maximize")).toBeInTheDocument();
    expect(queryByTestId("window-close")).toBeInTheDocument();
  });
});
