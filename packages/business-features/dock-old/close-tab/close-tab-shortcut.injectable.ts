import { getInjectable } from "@ogre-tools/injectable";
import { keyboardShortcutInjectionToken } from "@k8slens/keyboard-shortcuts";

const closeTabShortcutInjectable = getInjectable({
  id: "close-tab-shortcut",

  instantiate: () => ({
    scope: "dock",

    binding: {
      ctrlOrCommand: true,
      code: "KeyW",
    },

    invoke: () => {
      // Close Tab
      // Focus the Dock to avoid losing the focus
    },
  }),

  injectionToken: keyboardShortcutInjectionToken,
});

export default closeTabShortcutInjectable;
