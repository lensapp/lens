import { pipeline } from "@ogre-tools/fp";
import { filter, isString } from "lodash/fp";
import { getInjectable } from "@ogre-tools/injectable";
import { Binding, KeyboardShortcut, keyboardShortcutInjectionToken } from "./keyboard-shortcut-injection-token";
import platformInjectable from "./platform.injectable";

export type InvokeShortcut = (event: KeyboardEvent) => void;

const toShortcutsWithMatchingScope = (shortcut: KeyboardShortcut) => {
  const activeScopeElement = document.activeElement?.closest("[data-keyboard-shortcut-scope]");

  if (!activeScopeElement) {
    const shortcutIsRootLevel = !shortcut.scope;

    return shortcutIsRootLevel;
  }

  const castedActiveScopeElementHtml = activeScopeElement as HTMLDivElement;

  // eslint-disable-next-line xss/no-mixed-html
  const activeScope = castedActiveScopeElementHtml.dataset.keyboardShortcutScope;

  return shortcut.scope === activeScope;
};

const toBindingWithDefaults = (binding: Binding) =>
  isString(binding)
    ? {
        code: binding,
        shift: false,
        ctrl: false,
        altOrOption: false,
        meta: false,
        ctrlOrCommand: false,
      }
    : {
        ctrl: false,
        shift: false,
        altOrOption: false,
        meta: false,
        ctrlOrCommand: false,
        ...binding,
      };

const toShortcutsWithMatchingBinding = (event: KeyboardEvent, platform: string) => (shortcut: KeyboardShortcut) => {
  const binding = toBindingWithDefaults(shortcut.binding);

  const shiftModifierMatches = binding.shift === event.shiftKey;
  const altModifierMatches = binding.altOrOption === event.altKey;

  const isMac = platform === "darwin";

  const ctrlModifierMatches = binding.ctrl === event.ctrlKey || (!isMac && binding.ctrlOrCommand === event.ctrlKey);

  const metaModifierMatches = binding.meta === event.metaKey || (isMac && binding.ctrlOrCommand === event.metaKey);

  return (
    event.code === binding.code &&
    shiftModifierMatches &&
    ctrlModifierMatches &&
    altModifierMatches &&
    metaModifierMatches
  );
};

const invokeShortcutInjectable = getInjectable({
  id: "invoke-shortcut",

  instantiate: (di): InvokeShortcut => {
    const getShortcuts = () => di.injectMany(keyboardShortcutInjectionToken);
    const platform = di.inject(platformInjectable);

    return (event) => {
      const shortcutsToInvoke = pipeline(
        getShortcuts(),
        filter(toShortcutsWithMatchingBinding(event, platform)),
        filter(toShortcutsWithMatchingScope),
      );

      if (shortcutsToInvoke.length) {
        shortcutsToInvoke.forEach((shortcut) => shortcut.invoke());
      }
    };
  },
});

export default invokeShortcutInjectable;
