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
import { computed, observable } from "mobx";
import rendererExtensionsInjectable from "../../../../extensions/renderer-extensions.injectable";
import closeWindowInjectable from "./close-window.injectable";
import goBackInjectable from "./go-back.injectable";
import goForwardInjectable from "./go-forward.injectable";
import maximizeWindowInjectable from "./maximize-window.injectable";
import openAppContextMenuInjectable from "./open-app-context-menu.injectable";
import toggleMaximizeWindowInjectable from "./toggle-maximize-window.injectable";
import topBarStateInjectable from "./state.injectable";
import platformInjectable from "../../../../common/vars/platform.injectable";

describe("<TopBar/>", () => {
  let di: DiContainer;
  let render: DiRender;
  let goBack: jest.MockedFunction<() => void>;
  let goForward: jest.MockedFunction<() => void>;
  let openAppContextMenu: jest.MockedFunction<() => void>;
  let closeWindow: jest.MockedFunction<() => void>;
  let maximizeWindow: jest.MockedFunction<() => void>;
  let toggleMaximizeWindow: jest.MockedFunction<() => void>;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(rendererExtensionsInjectable, () => computed(() => []));
    di.override(openAppContextMenuInjectable, () => openAppContextMenu = jest.fn());
    di.override(goBackInjectable, () => goBack = jest.fn());
    di.override(goForwardInjectable, () => goForward = jest.fn());
    di.override(closeWindowInjectable, () => closeWindow = jest.fn());
    di.override(maximizeWindowInjectable, () => maximizeWindow = jest.fn());
    di.override(toggleMaximizeWindowInjectable, () => toggleMaximizeWindow = jest.fn());

    render = renderFor(di);
  });

  describe("with both previous and next history enabled", () => {
    beforeEach(() => {
      di.override(topBarStateInjectable, () => observable.object({
        prevEnabled: true,
        nextEnabled: true,
      }));
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

    describe("on macos", () => {
      beforeEach(() => {
        di.override(platformInjectable, () => "darwin");
      });

      it("doesn't show windows title", () => {
        const { queryByTestId } = render(<TopBar/>);

        expect(queryByTestId("window-menu")).not.toBeInTheDocument();
        expect(queryByTestId("window-minimize")).not.toBeInTheDocument();
        expect(queryByTestId("window-maximize")).not.toBeInTheDocument();
        expect(queryByTestId("window-close")).not.toBeInTheDocument();
      });
    });

    describe("on linux", () => {
      beforeEach(() => {
        di.override(platformInjectable, () => "linux");
      });

      it("does show windows title buttons", () => {
        const { queryByTestId } = render(<TopBar/>);

        expect(queryByTestId("window-menu")).toBeInTheDocument();
        expect(queryByTestId("window-minimize")).toBeInTheDocument();
        expect(queryByTestId("window-maximize")).toBeInTheDocument();
        expect(queryByTestId("window-close")).toBeInTheDocument();
      });

      it("triggers ipc events on click", () => {
        const { getByTestId } = render(<TopBar />);

        const menu = getByTestId("window-menu");
        const minimize = getByTestId("window-minimize");
        const maximize = getByTestId("window-maximize");
        const close = getByTestId("window-close");

        fireEvent.click(menu);
        expect(openAppContextMenu).toBeCalled();

        fireEvent.click(minimize);
        expect(maximizeWindow).toBeCalled();

        fireEvent.click(maximize);
        expect(toggleMaximizeWindow).toBeCalled();

        fireEvent.click(close);
        expect(closeWindow).toBeCalled();
      });
    });

    describe("on windows", () => {
      beforeEach(() => {
        di.override(platformInjectable, () => "win32");
      });

      it("does show windows title buttons", () => {
        const { queryByTestId } = render(<TopBar/>);

        expect(queryByTestId("window-menu")).toBeInTheDocument();
        expect(queryByTestId("window-minimize")).toBeInTheDocument();
        expect(queryByTestId("window-maximize")).toBeInTheDocument();
        expect(queryByTestId("window-close")).toBeInTheDocument();
      });

      it("triggers ipc events on click", () => {
        const { getByTestId } = render(<TopBar />);

        const menu = getByTestId("window-menu");
        const minimize = getByTestId("window-minimize");
        const maximize = getByTestId("window-maximize");
        const close = getByTestId("window-close");

        fireEvent.click(menu);
        expect(openAppContextMenu).toBeCalled();

        fireEvent.click(minimize);
        expect(maximizeWindow).toBeCalled();

        fireEvent.click(maximize);
        expect(toggleMaximizeWindow).toBeCalled();

        fireEvent.click(close);
        expect(closeWindow).toBeCalled();
      });
    });
  });
});
