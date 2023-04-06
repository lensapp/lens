import userEvent from "@testing-library/user-event";
import type { RenderResult } from "@testing-library/react";
import { render } from "@testing-library/react";
import { createContainer, DiContainer, getInjectable } from "@ogre-tools/injectable";
import { registerInjectableReact } from "@ogre-tools/injectable-react";
import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";
import { keyboardShortcutInjectionToken } from "./keyboard-shortcut-injection-token";
import { registerFeature } from "@k8slens/feature-core";
import { keyboardShortcutsFeature } from "./feature";
import React from "react";
import { computed, runInAction } from "mobx";
import { KeyboardShortcutScope } from "./keyboard-shortcut-scope";
import { Discover, discoverFor } from "@k8slens/react-testing-library-discovery";
import { startApplicationInjectionToken } from "@k8slens/application";
import { renderInjectionToken } from "@k8slens/react-application";
import { reactApplicationChildrenInjectionToken } from "@k8slens/react-application";
import platformInjectable from "./platform.injectable";

describe("keyboard-shortcuts", () => {
  let di: DiContainer;
  let invokeMock: jest.Mock;
  let rendered: RenderResult;

  beforeEach(() => {
    di = createContainer("irrelevant");

    registerInjectableReact(di);
    registerMobX(di);

    runInAction(() => {
      registerFeature(di, keyboardShortcutsFeature);
    });

    invokeMock = jest.fn();

    const someKeyboardShortcutInjectable = getInjectable({
      id: "some-keyboard-shortcut",

      instantiate: () => ({
        binding: "Escape",
        invoke: () => invokeMock("esc-in-root"),
      }),

      injectionToken: keyboardShortcutInjectionToken,
    });

    const someScopedKeyboardShortcutInjectable = getInjectable({
      id: "some-scoped-keyboard-shortcut",

      instantiate: () => ({
        binding: "Escape",
        invoke: () => invokeMock("esc-in-scope"),
        scope: "some-scope",
      }),

      injectionToken: keyboardShortcutInjectionToken,
    });

    const someOtherKeyboardShortcutInjectable = getInjectable({
      id: "some-other-keyboard-shortcut",

      instantiate: () => ({
        binding: "something-else-than-esc",
        invoke: () => invokeMock("something-else-than-esc"),
      }),

      injectionToken: keyboardShortcutInjectionToken,
    });

    const childComponentForScopeInjectable = getInjectable({
      id: "some-child-component-for-scope",

      instantiate: () => ({
        id: "some-child-component-for-scope",

        enabled: computed(() => true),

        Component: () => (
          <KeyboardShortcutScope id="some-scope">
            <div />
          </KeyboardShortcutScope>
        ),
      }),

      injectionToken: reactApplicationChildrenInjectionToken,
    });

    runInAction(() => {
      di.register(
        someKeyboardShortcutInjectable,
        someScopedKeyboardShortcutInjectable,
        someOtherKeyboardShortcutInjectable,
        childComponentForScopeInjectable,
      );
    });

    di.override(renderInjectionToken, () => (application) => {
      rendered = render(application);
    });
  });

  describe("when application is started", () => {
    let discover: Discover;

    beforeEach(async () => {
      const startApplication = di.inject(startApplicationInjectionToken);

      await startApplication();

      discover = discoverFor(() => rendered);
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("given focus is in the body, when pressing the shortcut, calls shortcut in global scope", () => {
      userEvent.keyboard("{Escape}");

      expect(invokeMock.mock.calls).toEqual([["esc-in-root"]]);
    });

    it("given focus inside a nested scope, when pressing the shortcut, calls only the callback for the scope", () => {
      const result = discover.getSingleElement("keyboard-shortcut-scope", "some-scope");

      const discoveredHtml = result.discovered as HTMLDivElement;

      discoveredHtml.focus();

      userEvent.keyboard("{Escape}");

      expect(invokeMock.mock.calls).toEqual([["esc-in-scope"]]);
    });

    it("given conflicting shortcut, when pressing the shortcut, calls both callbacks", () => {
      const conflictingShortcutInjectable = getInjectable({
        id: "some-conflicting-keyboard-shortcut",

        instantiate: () => ({
          binding: "Escape",
          invoke: () => invokeMock("conflicting-esc-in-root"),
        }),

        injectionToken: keyboardShortcutInjectionToken,
      });

      runInAction(() => {
        di.register(conflictingShortcutInjectable);
      });

      userEvent.keyboard("{Escape}");

      expect(invokeMock.mock.calls).toEqual([["esc-in-root"], ["conflicting-esc-in-root"]]);
    });

    [
      {
        scenario: "given shortcut without modifiers, when shortcut is pressed, calls the callback",
        binding: { code: "Escape" },
        keyboard: "{Escape}",
        shouldCallCallback: true,
      },
      {
        scenario:
          "given shortcut without modifiers, when shortcut is pressed but with modifier, does not call the callback",
        binding: { code: "F1" },
        keyboard: "{Meta>}[F1]",
        shouldCallCallback: false,
      },
      {
        scenario: "given shortcut with meta modifier, when shortcut is pressed, calls the callback",

        binding: { meta: true, code: "F1" },
        keyboard: "{Meta>}[F1]",
        shouldCallCallback: true,
      },
      {
        scenario: "given shortcut with shift modifier, when shortcut is pressed, calls the callback",

        binding: { shift: true, code: "F1" },
        keyboard: "{Shift>}[F1]",
        shouldCallCallback: true,
      },
      {
        scenario: "given shortcut with alt modifier, when shortcut is pressed, calls the callback",
        binding: { altOrOption: true, code: "F1" },
        keyboard: "{Alt>}[F1]",
        shouldCallCallback: true,
      },
      {
        scenario: "given shortcut with ctrl modifier, when shortcut is pressed, calls the callback",
        binding: { ctrl: true, code: "F1" },
        keyboard: "{Control>}[F1]",
        shouldCallCallback: true,
      },
      {
        scenario: "given shortcut with all modifiers, when shortcut is pressed, calls the callback",

        binding: { ctrl: true, altOrOption: true, shift: true, meta: true, code: "F1" },
        keyboard: "{Meta>}{Shift>}{Alt>}{Control>}[F1]",
        shouldCallCallback: true,
      },
    ].forEach(({ binding, keyboard, scenario, shouldCallCallback }) => {
      // eslint-disable-next-line jest/valid-title
      it(scenario, () => {
        const invokeMock = jest.fn();

        const shortcutInjectable = getInjectable({
          id: "shortcut",

          instantiate: () => ({
            binding,
            invoke: invokeMock,
          }),

          injectionToken: keyboardShortcutInjectionToken,
        });

        runInAction(() => {
          di.register(shortcutInjectable);
        });

        userEvent.keyboard(keyboard);

        if (shouldCallCallback) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(invokeMock).toHaveBeenCalled();
        } else {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(invokeMock).not.toHaveBeenCalled();
        }
      });
    });
  });

  describe("given in mac and keyboard shortcut with modifier for ctrl or command", () => {
    beforeEach(async () => {
      di.override(platformInjectable, () => "darwin");

      invokeMock = jest.fn();

      const shortcutInjectable = getInjectable({
        id: "shortcut",

        instantiate: () => ({
          binding: { code: "KeyK", ctrlOrCommand: true },
          invoke: invokeMock,
        }),

        injectionToken: keyboardShortcutInjectionToken,
      });

      runInAction(() => {
        di.register(shortcutInjectable);
      });

      const startApplication = di.inject(startApplicationInjectionToken);

      await startApplication();
    });

    it("when pressing the keyboard shortcut with command, calls the callback", () => {
      userEvent.keyboard("{Meta>}[KeyK]");

      expect(invokeMock).toHaveBeenCalled();
    });

    it("when pressing the keyboard shortcut with ctrl, does not call the callback", () => {
      userEvent.keyboard("{Control>}[KeyK]");

      expect(invokeMock).not.toHaveBeenCalled();
    });
  });

  describe("given in windows and keyboard shortcut with modifier for ctrl or command", () => {
    beforeEach(async () => {
      di.override(platformInjectable, () => "win32");

      invokeMock = jest.fn();

      const shortcutInjectable = getInjectable({
        id: "shortcut",

        instantiate: () => ({
          binding: { code: "KeyK", ctrlOrCommand: true },
          invoke: invokeMock,
        }),

        injectionToken: keyboardShortcutInjectionToken,
      });

      runInAction(() => {
        di.register(shortcutInjectable);
      });

      const startApplication = di.inject(startApplicationInjectionToken);

      await startApplication();
    });

    it("when pressing the keyboard shortcut with windows, does not call the callback", () => {
      userEvent.keyboard("{Meta>}[KeyK]");

      expect(invokeMock).not.toHaveBeenCalled();
    });

    it("when pressing the keyboard shortcut with ctrl, calls the callback", () => {
      userEvent.keyboard("{Control>}[KeyK]");

      expect(invokeMock).toHaveBeenCalled();
    });
  });

  describe("given in any other platform and keyboard shortcut with modifier for ctrl or command", () => {
    beforeEach(async () => {
      di.override(platformInjectable, () => "some-other-platform");

      invokeMock = jest.fn();

      const shortcutInjectable = getInjectable({
        id: "shortcut",

        instantiate: () => ({
          binding: { code: "KeyK", ctrlOrCommand: true },
          invoke: invokeMock,
        }),

        injectionToken: keyboardShortcutInjectionToken,
      });

      runInAction(() => {
        di.register(shortcutInjectable);
      });

      const startApplication = di.inject(startApplicationInjectionToken);

      await startApplication();
    });

    it("when pressing the keyboard shortcut with meta, does not call the callback", () => {
      userEvent.keyboard("{Meta>}[KeyK]");

      expect(invokeMock).not.toHaveBeenCalled();
    });

    it("when pressing the keyboard shortcut with ctrl, calls the callback", () => {
      userEvent.keyboard("{Control>}[KeyK]");

      expect(invokeMock).toHaveBeenCalled();
    });
  });
});
