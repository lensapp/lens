/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { PrefixCamelCasedProperties } from "../../common/utils/types";
import type { MonacoTheme } from "../components/monaco-editor";

export type ThemeType = "dark" | "light";
export type ThemeId = `${string}-${ThemeType}`;
export type ThemeColor = `#${string}`;
export type ThemeLengthUnit = "px" | "ch" | "em" | "ex" | "rem" | "vh" | "vw" | "vmin" | "vmax" | "cm" | "mm" | "in" | "pc" | "pt";
export type ThemeLength = `${string}${ThemeLengthUnit}`;

export interface TerminalColors {
  background: ThemeColor;
  foreground: ThemeColor;
  cursor: ThemeColor;
  cursorAccent: ThemeColor;
  selection: ThemeColor;
  black: ThemeColor;
  red: ThemeColor;
  green: ThemeColor;
  yellow: ThemeColor;
  blue: ThemeColor;
  magenta: ThemeColor;
  cyan: ThemeColor;
  white: ThemeColor;
  brightBlack: ThemeColor;
  brightRed: ThemeColor;
  brightGreen: ThemeColor;
  brightYellow: ThemeColor;
  brightBlue: ThemeColor;
  brightMagenta: ThemeColor;
  brightCyan: ThemeColor;
  brightWhite: ThemeColor;
}

export const terminalColorPrefix = "terminal";
export type PrefixedTerminalColors = PrefixCamelCasedProperties<TerminalColors, typeof terminalColorPrefix>;
export type PrefixedTerminalColorPair = [keyof PrefixedTerminalColors, ThemeColor];

export interface ThemeColors extends PrefixedTerminalColors {
  blue: ThemeColor;
  magenta: ThemeColor;
  golden: ThemeColor;
  halfGray: ThemeColor;
  primary: ThemeColor;
  textColorPrimary: ThemeColor;
  textColorSecondary: ThemeColor;
  textColorTertiary: ThemeColor;
  textColorAccent: ThemeColor;
  textColorDimmed: ThemeColor;
  borderColor: ThemeColor;
  borderFaintColor: ThemeColor;
  mainBackground: ThemeColor;
  secondaryBackground: ThemeColor;
  contentColor: ThemeColor;
  layoutBackground: ThemeColor;
  layoutTabsBackground: ThemeColor;
  layoutTabsActiveColor: ThemeColor;
  layoutTabsLineColor: ThemeColor;
  sidebarLogoBackground: ThemeColor;
  sidebarActiveColor: ThemeColor;
  sidebarSubmenuActiveColor: ThemeColor;
  sidebarBackground: ThemeColor;
  sidebarItemHoverBackground: ThemeColor;
  buttonPrimaryBackground: ThemeColor;
  buttonDefaultBackground: ThemeColor;
  buttonLightBackground: ThemeColor;
  buttonAccentBackground: ThemeColor;
  buttonDisabledBackground: ThemeColor;
  tableBgcStripe: ThemeColor;
  tableBgcSelected: ThemeColor;
  tableHeaderBackground: ThemeColor;
  tableHeaderBorderWidth: string;
  tableHeaderBorderColor: ThemeColor;
  tableHeaderColor: ThemeColor;
  tableSelectedRowColor: ThemeColor;
  helmLogoBackground: ThemeColor;
  helmImgBackground: ThemeColor;
  helmStableRepo: ThemeColor;
  helmIncubatorRepo: ThemeColor;
  helmDescriptionHr: ThemeColor;
  helmDescriptionBlockquoteColor: ThemeColor;
  helmDescriptionBlockquoteBorder: ThemeColor;
  helmDescriptionBlockquoteBackground: ThemeColor;
  helmDescriptionHeaders: ThemeColor;
  helmDescriptionH6: ThemeColor;
  helmDescriptionTdBorder: ThemeColor;
  helmDescriptionTrBackground: ThemeColor;
  helmDescriptionCodeBackground: ThemeColor;
  helmDescriptionPreBackground: ThemeColor;
  helmDescriptionPreColor: ThemeColor;
  colorSuccess: ThemeColor;
  colorOk: ThemeColor;
  colorInfo: ThemeColor;
  colorError: ThemeColor;
  colorSoftError: ThemeColor;
  colorWarning: ThemeColor;
  colorVague: ThemeColor;
  colorTerminated: ThemeColor;
  dockHeadBackground: ThemeColor;
  dockInfoBackground: ThemeColor;
  dockInfoBorderColor: ThemeColor;
  dockEditorBackground: ThemeColor;
  dockEditorTag: ThemeColor;
  dockEditorKeyword: ThemeColor;
  dockEditorComment: ThemeColor;
  dockEditorActiveLineBackground: ThemeColor;
  dockBadgeBackground: ThemeColor;
  dockTabBorderColor: ThemeColor;
  dockTabActiveBackground: ThemeColor;
  logsBackground: ThemeColor;
  logsForeground: ThemeColor;
  logRowHoverBackground: ThemeColor;
  dialogTextColor: ThemeColor;
  dialogBackground: ThemeColor;
  dialogHeaderBackground: ThemeColor;
  dialogFooterBackground: ThemeColor;
  drawerTogglerBackground: ThemeColor;
  drawerTitleText: ThemeColor;
  drawerSubtitleBackground: ThemeColor;
  drawerItemNameColor: ThemeColor;
  drawerItemValueColor: ThemeColor;
  clusterMenuBackground: ThemeColor;
  clusterMenuBorderColor: ThemeColor;
  clusterMenuCellBackground: ThemeColor;
  clusterSettingsBackground: ThemeColor;
  addClusterIconColor: ThemeColor;
  boxShadow: ThemeColor;
  iconActiveColor: ThemeColor;
  iconActiveBackground: ThemeColor;
  filterAreaBackground: ThemeColor;
  chartLiveBarBackground: ThemeColor;
  chartStripesColor: ThemeColor;
  chartCapacityColor: ThemeColor;
  pieChartDefaultColor: ThemeColor;
  inputOptionHoverColor: ThemeColor;
  inputControlBackground: ThemeColor;
  inputControlBorder: ThemeColor;
  inputControlHoverBorder: ThemeColor;
  lineProgressBackground: ThemeColor;
  radioActiveBackground: ThemeColor;
  menuActiveBackground: ThemeColor;
  menuSelectedOptionBgc: ThemeColor;
  canvasBackground: ThemeColor;
  scrollBarColor: ThemeColor;
  settingsBackground: ThemeColor;
  settingsColor: ThemeColor;
  navSelectedBackground: ThemeColor;
  navHoverColor: ThemeColor;
  hrColor: ThemeColor;
  tooltipBackground: ThemeColor;
}

export interface Theme {
  name: string;
  type: ThemeType;
  colors: ThemeColors;
  description: string;
  author: string;
  monacoTheme: MonacoTheme;
}
