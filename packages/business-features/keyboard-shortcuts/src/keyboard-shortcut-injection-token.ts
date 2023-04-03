import { getInjectionToken } from "@ogre-tools/injectable";

export type Binding =
  | string
  | {
      code: string;
      shift?: boolean;
      ctrl?: boolean;
      altOrOption?: boolean;
      meta?: boolean;
      ctrlOrCommand?: boolean;
    };

export type KeyboardShortcut = {
  binding: Binding;
  invoke: () => void;
  scope?: string;
};

export const keyboardShortcutInjectionToken = getInjectionToken<KeyboardShortcut>({
  id: "keyboard-shortcut-injection-token",
});
