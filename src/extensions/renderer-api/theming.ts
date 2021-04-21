import { ThemeStore } from "../../renderer/theme.store";

export function getActiveTheme() {
  return ThemeStore.getInstance().activeTheme;
}
