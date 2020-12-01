# Theme Color Reference
You can use theme-based CSS Variables to style an extension according to the active theme.

## Base Colours
- `--blue`: blue colour.
- `--magenta`: magenta colour.
- `--golden`: gold/yellow colour.
- `--halfGray`: grey with some opacity applied.
- `--primary`: Lens brand (blue) colour.
- `--colorSuccess`: successful operations colour.
- `--colorOk`: successful operations (bright version) colour.
- `--colorInfo`: informational, in-progress colour.
- `--colorError`: critical error colour.
- `--colorSoftError`: error colour.
- `--colorWarning`: warning colour.
- `--colorVague`: soft grey colour for notices, hints etc.
- `--colorTerminated`: terminated, closed, stale colour.
- `--boxShadow`: semi-transparent box-shadow colour.

## Text Colours
- `--textColorPrimary`: foreground text colour.
- `--textColorSecondary`: foreground text colour for different paragraphs, parts of text.
- `--textColorAccent`: foreground text colour to highlight its parts.

## Border Colours
- `--borderColor`: border colour.
- `--borderFaintColor`: fainted (lighter or darker, which depends on the theme) border colour.

## Layout Colours
- `--mainBackground`: main background colour for the app.
- `--contentColor`: background colour for panels contains some data.
- `--layoutBackground`: background colour for layout parts.
- `--layoutTabsBackground`: background colour for general tabs.
- `--layoutTabsActiveColor`: foreground colour for general tabs.
- `--layoutTabsLineColor`: background colour for lines under general tabs.

## Sidebar Colours
- `--sidebarLogoBackground`: background colour behind logo in sidebar.
- `--sidebarActiveColor`: foreground colour for active menu items in sidebar.
- `--sidebarSubmenuActiveColor`: foreground colour for active submenu items in sidebar.
- `--sidebarBackground`: background colour for sidebar.

## Button Colours
- `--buttonPrimaryBackground`: button background colour for primary actions.
- `--buttonDefaultBackground`: default button background colour.
- `--buttonAccentBackground`: accent button background colour.
- `--buttonDisabledBackground`: disabled button background colour.

## Table Colours
- `--tableBgcStripe`: background colour for odd rows in table.
- `--tableBgcSelected`: background colour for selected row in table.
- `--tableHeaderBackground`: background colour for table header.
- `--tableHeaderBorderWidth`: border width under table header.
- `--tableHeaderBorderColor`: border colour for line under table header.
- `--tableHeaderColor`: foreground colour for table header.
- `--tableSelectedRowColor`: foreground colour for selected row in table.

## Dock Colours
- `--dockHeadBackground`: background colour for dock's header.
- `--dockInfoBackground`: background colour for dock's info panel.
- `--dockInfoBorderColor`: border colour for dock's info panel.

## Helm Chart Colours
- `--helmLogoBackground`: background colour for chart logo.
- `--helmImgBackground`: background colour for chart image.
- `--helmStableRepo`: background colour for stable repo.
- `--helmIncubatorRepo`: background colour for incubator repo.
- `--helmDescriptionHr`: Helm chart description separator line colour.
- `--helmDescriptionBlockqouteColor`: Helm chart description block-quote colour.
- `--helmDescriptionBlockqouteBorder`: Helm chart description block-quote border colour.
- `--helmDescriptionBlockquoteBackground`: Helm chart description block-quote background colour.
- `--helmDescriptionHeaders`: Helm chart description headers colour.
- `--helmDescriptionH6`: Helm chart description header foreground colour.
- `--helmDescriptionTdBorder`: Helm chart description table cell border colour.
- `--helmDescriptionTrBackground`: Helm chart description table row background colour.
- `--helmDescriptionCodeBackground`: Helm chart description code background colour.
- `--helmDescriptionPreBackground`: Helm chart description pre background colour.
- `--helmDescriptionPreColor`: Helm chart description pre foreground colour.

## Terminal Colours
- `--terminalBackground`: Terminal background colour.
- `--terminalForeground`: Terminal foreground colour.
- `--terminalCursor`: Terminal cursor colour.
- `--terminalCursorAccent`: Terminal cursor accent colour.
- `--terminalSelection`: Terminal selection background colour.
- `--terminalBlack`: Terminal black colour.
- `--terminalRed`: Terminal red colour.
- `--terminalGreen`: Terminal green colour.
- `--terminalYellow`: Terminal yellow colour.
- `--terminalBlue`: Terminal blue colour.
- `--terminalMagenta`: Terminal magenta colour.
- `--terminalCyan`: Terminal cyan colour.
- `--terminalWhite`: Terminal white colour.
- `--terminalBrightBlack`: Terminal bright black colour.
- `--terminalBrightRed`: Terminal bright red colour.
- `--terminalBrightGreen`: Terminal bright green colour.
- `--terminalBrightYellow`: Terminal bright yellow colour.
- `--terminalBrightBlue`: Terminal bright blue colour.
- `--terminalBrightMagenta`: Terminal bright magenta colour.
- `--terminalBrightCyan`: Terminal bright cyan colour.
- `--terminalBrightWhite`: Terminal bright white colour.

## Dialog Colours
- `--dialogHeaderBackground`: background colour for dialog header.
- `--dialogFooterBackground`: background colour for dialog footer.

## Detail Panel (Drawer) Colours
- `--drawerTitleText`: drawer title foreground colour.
- `--drawerSubtitleBackground`: drawer subtitle foreground colour.
- `--drawerItemNameColor`: foreground colour for item name in drawer.
- `--drawerItemValueColor`: foreground colour for item value in drawer.

## Misc Colours
- `--logsBackground`: background colour for pod logs.
- `--clusterMenuBackground`: background colour for cluster menu.
- `--clusterMenuBorderColor`: border colour for cluster menu.
- `--clusterSettingsBackground`: background colour for cluster settings.
- `--addClusterIconColor`: add cluster button background colour.
- `--iconActiveColor`: active cluster icon foreground colour.
- `--iconActiveBackground`: active cluster icon background colour.
- `--filterAreaBackground`: page filter area (where selected namespaces are lister) background colour.
- `--chartStripesColor`: bar chart zebra stripes background colour.
- `--chartCapacityColor`: background colour for capacity values in bar charts.
- `--pieChartDefaultColor`: default background colour for pie chart values.
- `--selectOptionHoveredColor`: foreground colour for selected element in dropdown list.
- `--lineProgressBackground`: background colour for progress line.
- `--radioActiveBackground`: background colour for active radio buttons.
- `--menuActiveBackground`: background colour for active menu items.

In most cases you would only need base, text and some of the layout colours.
