import { getInjectable } from "@ogre-tools/injectable";
import { keyboardShortcutInjectionToken } from "@k8slens/keyboard-shortcuts";

const closeDockShortcutInjectable = getInjectable({
  id: "close-dock-shortcut",

  instantiate: () => ({
    scope: "dock",

    binding: {
      shift: true,
      code: "Escape",
    },

    invoke: () => {
      // Close Dock
    },
  }),

  injectionToken: keyboardShortcutInjectionToken,
});

export default closeDockShortcutInjectable;
