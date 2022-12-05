/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { MonacoTheme } from "../components/monaco-editor";

export type ThemeId = string;
export type LensThemeType = "dark" | "light";
export interface LensTheme {
  name: string;
  type: LensThemeType;
  colors: Record<LensColorName, string>;
  terminalColors: Partial<Record<TerminalColorName, string>>;
  description: string;
  author: string;
  monacoTheme: MonacoTheme;
  isDefault?: boolean;
}

export type TerminalColorName =
  | "foreground"
  | "background"
  | "cursor"
  | "cursorAccent"
  | "selection"
  | "selectionForeground"
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "brightBlack"
  | "brightRed"
  | "brightGreen"
  | "brightYellow"
  | "brightBlue"
  | "brightMagenta"
  | "brightCyan"
  | "brightWhite";

export type LensColorName =
  | "blue"
  | "magenta"
  | "golden"
  | "halfGray"
  | "primary"
  | "textColorPrimary"
  | "textColorSecondary"
  | "textColorTertiary"
  | "textColorAccent"
  | "textColorDimmed"
  | "borderColor"
  | "borderFaintColor"
  | "mainBackground"
  | "secondaryBackground"
  | "contentColor"
  | "layoutBackground"
  | "layoutTabsBackground"
  | "layoutTabsActiveColor"
  | "layoutTabsLineColor"
  | "sidebarLogoBackground"
  | "sidebarActiveColor"
  | "sidebarSubmenuActiveColor"
  | "sidebarBackground"
  | "sidebarItemHoverBackground"
  | "badgeBackgroundColor"
  | "buttonPrimaryBackground"
  | "buttonDefaultBackground"
  | "buttonLightBackground"
  | "buttonAccentBackground"
  | "buttonDisabledBackground"
  | "tableBgcStripe"
  | "tableBgcSelected"
  | "tableHeaderBackground"
  | "tableHeaderBorderWidth"
  | "tableHeaderBorderColor"
  | "tableHeaderColor"
  | "tableSelectedRowColor"
  | "helmLogoBackground"
  | "helmStableRepo"
  | "helmIncubatorRepo"
  | "helmDescriptionHr"
  | "helmDescriptionBlockquoteColor"
  | "helmDescriptionBlockquoteBorder"
  | "helmDescriptionBlockquoteBackground"
  | "helmDescriptionHeaders"
  | "helmDescriptionH6"
  | "helmDescriptionTdBorder"
  | "helmDescriptionTrBackground"
  | "helmDescriptionCodeBackground"
  | "helmDescriptionPreBackground"
  | "helmDescriptionPreColor"
  | "colorSuccess"
  | "colorOk"
  | "colorInfo"
  | "colorError"
  | "colorSoftError"
  | "colorWarning"
  | "colorVague"
  | "colorTerminated"
  | "dockHeadBackground"
  | "dockInfoBackground"
  | "dockInfoBorderColor"
  | "dockEditorBackground"
  | "dockEditorTag"
  | "dockEditorKeyword"
  | "dockEditorComment"
  | "dockEditorActiveLineBackground"
  | "dockBadgeBackground"
  | "dockTabBorderColor"
  | "dockTabActiveBackground"
  | "logsBackground"
  | "logsForeground"
  | "logRowHoverBackground"
  | "dialogTextColor"
  | "dialogBackground"
  | "dialogHeaderBackground"
  | "dialogFooterBackground"
  | "drawerTogglerBackground"
  | "drawerTitleText"
  | "drawerSubtitleBackground"
  | "drawerItemNameColor"
  | "drawerItemValueColor"
  | "clusterMenuBackground"
  | "clusterMenuBorderColor"
  | "clusterMenuCellBackground"
  | "clusterSettingsBackground"
  | "addClusterIconColor"
  | "boxShadow"
  | "iconActiveColor"
  | "iconActiveBackground"
  | "filterAreaBackground"
  | "chartLiveBarBackground"
  | "chartStripesColor"
  | "chartCapacityColor"
  | "pieChartDefaultColor"
  | "inputOptionHoverColor"
  | "inputControlBackground"
  | "inputControlBorder"
  | "inputControlHoverBorder"
  | "lineProgressBackground"
  | "radioActiveBackground"
  | "menuActiveBackground"
  | "menuSelectedOptionBgc"
  | "canvasBackground"
  | "scrollBarColor"
  | "settingsBackground"
  | "settingsColor"
  | "navSelectedBackground"
  | "navHoverColor"
  | "hrColor"
  | "tooltipBackground";
