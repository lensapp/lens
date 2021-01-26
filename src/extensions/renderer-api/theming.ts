import { themeStore } from "../../renderer/theme.store";

export function getActiveTheme() {
  return themeStore.activeTheme;
}
