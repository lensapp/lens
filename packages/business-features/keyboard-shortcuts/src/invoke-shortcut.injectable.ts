import { pipeline } from "@ogre-tools/fp";
import { filter, isString } from "lodash/fp";
import { getInjectable } from "@ogre-tools/injectable";
import {
  Binding,
  KeyboardShortcut,
  keyboardShortcutInjectionToken,
} from "./keyboard-shortcut-injection-token";

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
    ? { code: binding, shift: false, ctrl: false, altOrOption: false, meta: false }
    : { ctrl: false, shift: false, altOrOption: false, meta: false, ...binding };

const toShortcutsWithMatchingBinding = (event: KeyboardEvent) => (shortcut: KeyboardShortcut) => {
  const binding = toBindingWithDefaults(shortcut.binding);

  const shiftModifierMatches = binding.shift === event.shiftKey;
  const ctrlModifierMatches = binding.ctrl === event.ctrlKey;
  const altModifierMatches = binding.altOrOption === event.altKey;
  const metaModifierMatches = binding.meta === event.metaKey;

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

    return (event) => {
      const shortcutsToInvoke = pipeline(
        getShortcuts(),
        filter(toShortcutsWithMatchingBinding(event)),
        filter(toShortcutsWithMatchingScope),
      );

      if (shortcutsToInvoke.length) {
        shortcutsToInvoke.forEach((shortcut) => shortcut.invoke());
      }
    };
  },
});

export default invokeShortcutInjectable;
