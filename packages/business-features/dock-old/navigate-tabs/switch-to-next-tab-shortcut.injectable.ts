import { getInjectable } from "@ogre-tools/injectable";
import { keyboardShortcutInjectionToken } from "@k8slens/keyboard-shortcuts";

const switchToNextTabShortcutInjectable = getInjectable({
  id: "switch-to-next-tab-shortcut",

  instantiate: () => ({
    scope: "dock",

    binding: {
      ctrl: true,
      code: "Period",
    },

    invoke: () => {
      // Next tab
    },
  }),

  injectionToken: keyboardShortcutInjectionToken,
});

export default switchToNextTabShortcutInjectable;
