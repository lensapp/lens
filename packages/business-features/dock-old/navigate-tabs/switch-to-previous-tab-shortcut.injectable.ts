import { getInjectable } from "@ogre-tools/injectable";
import { keyboardShortcutInjectionToken } from "@k8slens/keyboard-shortcuts";

const switchToPreviousTabShortcutInjectable = getInjectable({
  id: "switch-to-previous-tab-shortcut",

  instantiate: () => ({
    scope: "dock",

    binding: {
      ctrl: true,
      code: "Comma",
    },

    invoke: () => {
      // Previous tab
    },
  }),

  injectionToken: keyboardShortcutInjectionToken,
});

export default switchToPreviousTabShortcutInjectable;
