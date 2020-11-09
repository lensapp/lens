# Theme color reference
You can use CSS variables generated from theme `.json` files to style an extension with respect of active theme.

## Base colors
- `blue`: blue color.
- `magenta`: magenta color.
- `golden`: gold/yellow color.
- `halfGray`: gray with some apacity applied.
- `primary`: Lens brand (blue) color.
- `colorSuccess`: successfull operations color.
- `colorOk`: successfull operations (bright version) color.
- `colorInfo`: informational, in-progress color.
- `colorError`: critical error color.
- `colorSoftError`: error color.
- `colorWarning`: warning color.
- `colorVague`: soft gray color for notices, hints etc.
- `colorTerminated`: terminated, closed, stale color.
- `boxShadow`: semi-transparent box-shadow color.

## Text colors
- `textColorPrimary`: foreground text color.
- `textColorSecondary`: foreground text color for different paragraps, parts of text.
- `textColorAccent`: foreground text color to highlight its parts.

## Border colors
- `borderColor`: border color.
- `borderFaintColor`: fainted (lighter or darker, which depends on the theme) border color.

## Layout colors
- `mainBackground`: main background color for the app.
- `contentColor`: background color for panels contains some data.
- `layoutBackground`: background color for layout parts.
- `layoutTabsBackground`: background color for general tabs.
- `layoutTabsActiveColor`: foreground color for general tabs.
- `layoutTabsLineColor`: background color for lines under general tabs.

## Sidebar colors
- `sidebarLogoBackground`: background color behind logo in sidebar.
- `sidebarActiveColor`: foreground color for active menu items in sidebar.
- `sidebarSubmenuActiveColor`: foreground color for active submenu items in sidebar.
- `sidebarBackground`: background color for sidebar.

## Button colors
- `buttonPrimaryBackground`: button background color for primary actions.
- `buttonDefaultBackground`: default button background color.
- `buttonAccentBackground`: accent button background color.
- `buttonDisabledBackground`: disabled button background color.

## Table colors
- `tableBgcStripe`: background color for odd rows in table.
- `tableBgcSelected`: background color for selected row in table.
- `tableHeaderBackground`: background color for table header.
- `tableHeaderBorderWidth`: border width under table header.
- `tableHeaderBorderColor`: border color for line under table header.
- `tableHeaderColor`: foreground color for table header.
- `tableSelectedRowColor`: foreground color for selected row in table.

## Dock colors
- `dockHeadBackground`: background color for dock's header.
- `dockInfoBackground`: background color for dock's info panel.
- `dockInfoBorderColor`: border color for dock's info panel.

## Helm chart colors
- `helmLogoBackground`: background color for chart logo.
- `helmImgBackground`: background color for chart image.
- `helmStableRepo`: background color for stable repo.
- `helmIncubatorRepo`: background color for incubator repo.
- `helmDescriptionHr`: Helm chart description separator line color.
- `helmDescriptionBlockqouteColor`: Helm chart description blockquote color.
- `helmDescriptionBlockqouteBorder`: Helm chart description blockquote border color.
- `helmDescriptionBlockquoteBackground`: Helm chart description blockquote background color.
- `helmDescriptionHeaders`: Helm chart description headers color.
- `helmDescriptionH6`: Helm chart description header foreground color.
- `helmDescriptionTdBorder`: Helm chart description table cell border color.
- `helmDescriptionTrBackground`: Helm chart description table row background color.
- `helmDescriptionCodeBackground`: Helm chart description code background color.
- `helmDescriptionPreBackground`: Helm chart description pre background color.
- `helmDescriptionPreColor`: Helm chart description pre foreground color.

## Terminal colors
- `terminalBackground`: Terminal background color.
- `terminalForeground`: Terminal foreground color.
- `terminalCursor`: Terminal cursor color.
- `terminalCursorAccent`: Terminal cursor accent color.
- `terminalSelection`: Terminal selection background color.
- `terminalBlack`: Terminal black color.
- `terminalRed`: Terminal red color.
- `terminalGreen`: Terminal green color.
- `terminalYellow`: Terminal yellow color.
- `terminalBlue`: Terminal blue color.
- `terminalMagenta`: Terminal magenta color.
- `terminalCyan`: Terminal cyan color.
- `terminalWhite`: Terminal white color.
- `terminalBrightBlack`: Terminal bright black color.
- `terminalBrightRed`: Terminal bright red color.
- `terminalBrightGreen`: Terminal bright green color.
- `terminalBrightYellow`: Terminal bright yellow color.
- `terminalBrightBlue`: Terminal bright blue color.
- `terminalBrightMagenta`: Terminal bright magenta color.
- `terminalBrightCyan`: Terminal bright cyan color.
- `terminalBrightWhite`: Terminal bright white color.

## Dialog colors
- `dialogHeaderBackground`: background color for dialog header.
- `dialogFooterBackground`: background color for dialog footer.

## Detail panel (Drawer) colors
- `drawerTitleText`: drawer title foreground color.
- `drawerSubtitleBackground`: drawer subtitle foreground color.
- `drawerItemNameColor`: foreground color for item name in drawer.
- `drawerItemValueColor`: foreground color for item value in drawer.

## Misc colors
- `logsBackground`: background color for pod logs.
- `clusterMenuBackground`: background color for cluster menu.
- `clusterMenuBorderColor`: border color for cluster menu.
- `clusterSettingsBackground`: background color for cluster settings.
- `addClusterIconColor`: add cluster button background color.
- `iconActiveColor`: active cluster icon foreground color.
- `iconActiveBackground`: active cluster icon background color.
- `filterAreaBackground`: page filter area (where selected namespaces are lister) background color.
- `chartStripesColor`: bar chart zebra stripes background color.
- `chartCapacityColor`: background color for capacity values in bar charts.
- `pieChartDefaultColor`: default background color for pie chart values.
- `selectOptionHoveredColor`: foregrond color for selected element in dropdown list.
- `lineProgressBackground`: background color for progress line.
- `radioActiveBackground`: background color for active radio buttons.
- `menuActiveBackground`: background color for active menu items.

In most cases you would only need base, text and some of the layout colors.