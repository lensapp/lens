/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import platformInjectable from "../../common/vars/platform.injectable";
import { type ApplicationBuilder, getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("Command Pallet: keyboard shortcut tests", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;

  beforeEach(async () => {
    builder = getApplicationBuilder();
  });

  describe("when on macOS", () => {
    beforeEach(async () => {
      builder.beforeWindowStart((windowDi) => {
        windowDi.override(platformInjectable, () => "darwin");
      });

      rendered = await builder.render();
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("does not show the command pallet yet", () => {
      const actual = rendered.queryByTestId("command-container");

      expect(actual).toBeNull();
    });

    describe("when pressing ESC", () => {
      beforeEach(() => {
        userEvent.keyboard("{Escape}");
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("does not show the command pallet yet", () => {
        const actual = rendered.queryByTestId("command-container");

        expect(actual).toBeNull();
      });
    });

    describe("when pressing SHIFT+CMD+P", () => {
      beforeEach(() => {
        userEvent.keyboard("{Shift>}{Meta>}P{/Meta}{/Shift}");
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("shows the command pallet", () => {
        const actual = rendered.queryByTestId("command-container");

        expect(actual).toBeInTheDocument();
      });

      describe("when pressing ESC", () => {
        beforeEach(() => {
          userEvent.keyboard("{Escape}");
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        it("no longer shows the command pallet", () => {
          const actual = rendered.queryByTestId("command-container");

          expect(actual).toBeNull();
        });
      });
    });
  });

  describe("when on linux", () => {
    beforeEach(async () => {
      builder.beforeWindowStart((windowDi) => {
        windowDi.override(platformInjectable, () => "linux");
      });

      rendered = await builder.render();
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("does not show the command pallet yet", () => {
      const actual = rendered.queryByTestId("command-container");

      expect(actual).toBeNull();
    });

    describe("when pressing ESC", () => {
      beforeEach(() => {
        userEvent.keyboard("{Escape}");
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("does not show the command pallet yet", () => {
        const actual = rendered.queryByTestId("command-container");

        expect(actual).toBeNull();
      });
    });

    describe("when pressing SHIFT+CTRL+P", () => {
      beforeEach(() => {
        userEvent.keyboard("{Shift>}{Control>}P{/Control}{/Shift}");
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("shows the command pallet", () => {
        const actual = rendered.queryByTestId("command-container");

        expect(actual).toBeInTheDocument();
      });

      describe("when pressing ESC", () => {
        beforeEach(() => {
          userEvent.keyboard("{Escape}");
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        it("no longer shows the command pallet", () => {
          const actual = rendered.queryByTestId("command-container");

          expect(actual).toBeNull();
        });
      });
    });
  });
});
