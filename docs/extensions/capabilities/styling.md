# Styling
Lens provides a set of global styles and UI components that can be used by any extension to preserve look and feel of the application. However, it’s always up to the developer whether to use them or provide completely different styles for the extension.

## Styling approach
Lens heavily uses SCSS preprocessor and it's advised to stick with same approach for extension developers in order to use some of the predefined variables and mixins described below.

For layout tasks Lens is using [flex.box](https://www.npmjs.com/package/flex.box) library which provides helpful class names to specify some of the [flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox) properties. For example, `div` with class names:
```
<div className="flex column align-center"></div>
```
at the end will have following css properties:
```
div {
  display: flex;
  flex-direction: column;
  align-items: center;
}
```

However, feel free to use any styling technique or framework like [Emotion](https://github.com/emotion-js/emotion) or just plain CSS if you prefer.

## Themes
Lens using 2 built-in themes located in `src/renderer/themes` folder each for light and dark color schemes. Active theme can be changed in the `Preferences` page.

[theme selector]

When Lens gets loaded it transforms selected theme `json` file into list of [CSS Custom Properties (CSS Variables)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) which then gets injected into `:root` element so any of the down-level components can use them.

[css vars listed in devtools]

When user changes a theme, the process is repeated, new css variables appear instead of previous ones.

If you want to follow a selected theme to keep the 'native' Lens look and feel, respecting the light/dark appearance of your extension, you can use provided variables and build-in lens components such as buttons, dropdowns, checkboxes etc.

## Injected styles
Every extention is affected by list of default global styles defined in `src/renderer/components/app.scss`. These are basic browser resets like setting `box-sizing` property for every element, default text and background colors, default font size, basic headings visualisation etc.

Extension may overwrite them if needed.

## Variables to use

### vars.scss
In `src/renderer/components/vars.scss` there are list of predefined variables mostly for dimensions and fonts.
```
// Dimensions
$unit: 8px;
$padding: $unit;
$margin: $unit;
$radius: ceil($unit * .3);

// Fonts
$font-main: 'Roboto', 'Helvetica', 'Arial', sans-serif !default;
$font-monospace: Lucida Console, Monaco, Consolas, monospace;
$font-size-small: floor(1.5 * $unit);
$font-size: floor(1.75 * $unit);
$font-size-big: floor(2 * $unit);
$font-weight-thin: 300;
$font-weight-normal: 400;
$font-weight-bold: 500;
...
```

You can use them to set consistent paddings, define font-sizes in your SCSS files e.g.
```
.status {
  padding-left: $padding * 2;
  font-size: $font-size-small;
}
```

### theme-vars.scss
In `src/renderer/themes/theme-vars.scss` there are list of theme-defined colors. Most of their values are different for light and dark themes. You can use them to preserve consitent view of extension with respect of selected theme.
```
// Base colors
$lensBlue: var(--blue);
$lensMagenta: var(--magenta);
$golden: var(--golden);
$halfGray: var(--halfGray);
$primary: var(--primary);
$textColorPrimary: var(--textColorPrimary);
$textColorSecondary: var(--textColorSecondary);
$textColorAccent: var(--textColorAccent);
$borderColor: var(--borderColor);
$borderFaintColor: var(--borderFaintColor);
$colorSuccess: var(--colorSuccess);
$colorOk: var(--colorOk);
$colorInfo: var(--colorInfo);
$colorError: var(--colorError);
$colorSoftError: var(--colorSoftError);
$colorWarning: var(--colorWarning);
$colorVague: var(--colorVague);
$colorTerminated: var(--colorTerminated);

// Layout
$mainBackground: var(--mainBackground);
$contentColor: var(--contentColor);
$layoutBackground: var(--layoutBackground);
$layoutTabsBackground: var(--layoutTabsBackground);
...
```
**Note**: if you don't use SCSS preprocessor in your extenstion **you can inlcude CSS Variables directly `var(--mainBackground)`**;

### mixins.scss
In `src/renderer/components/mixins.scss` there are some useful utylity styles such as theme-aware scrollbar.