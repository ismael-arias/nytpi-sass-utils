# nytpi-sass-utils (#development branch)

*Note: the development branch is under active development. This README tries to cover the most important information developers need to know while using the tools in their current state of completion.*

## Need-to-Know Errata

1. Use the `development` Branch (already installed in the `purina-muttigrees` repo, and by [generator-scaffolding](https://github.com/nytpi/generator-scaffolding))
2. Some Documentation is Out of Date (please refer to this document)
3. When using the `font-size()` mixin with the `vw` unit option, **write your desktop styles first, _then_ your mobile styles** (much more on this below)




## Again, Some Documentation is Out of Date

The docs explaining the concepts of the`size-class()` mixin and the `font-size()` mixin is still more or less accurate. This document will cover some of that conceptual information, however.

Because the usage docs aren't fully up to date, please refer to the source code ([size-class](https://github.com/nytpi/nytpi-sass-utils/tree/development/sass/size-class), [font-size](https://github.com/nytpi/nytpi-sass-utils/tree/development/sass/font-size)), as well as this document.



## `size-class()` Internals and Usage
The `size-class()` mixin accepts a list of unquoted strings, known as a **“shorthand syntax”**. For example:

```scss
@include size-class(desktop) {
	/* Styles using the 12-column grid, applied from 1280px to infinity */
	width: span(4); // 4 of 12 columns in CSS % units, using the Susy `span()` function
}
```
The mixin parses this list to set up both **a Susy layout** (accessible using [Susy mixins and functions](http://susydocs.oddbird.net/en/latest/toolkit/)) and **a media query** (potentially), which apply to any Sass code written within the mixin’s **content block** (between the curly braces).

`size-class()`’s true utility is its ability to combine size classe. For example, a developer might want to apply a Susy grid layout across a combined range of named media queries:

```scss
@include size-class(mobile-portrait to tablet-portrait) {
	/* Styles using the 4-column grid, applied from 0 to 853px */
	/* In other words, tablet portrait will use “upscaled” mobile portrait styles */
}
```
This approach makes it easy to create fluid responsive layouts, based on the same grid system used in T Brand design PSDs, that can be easily upscaled or downscaled to other screen sizes.

(Aside: behind the scenes, the `size-class()` mixin uses a special global variable named `$size-class-context`, in addition to the `$susy` global variable, to maintain certain contextual information about the layout.)

### Shorthand Syntax Examples

`desktop`
_One named size-class only._

Use the desktop layout and the desktop breakpoint range.

----

`desktop to mobile-portrait`
_Range of named size classes, with the first named size class implicitly defining the layout to use._

Use the `desktop` layout (implicitly) from the `desktop` breakpoint's max width to the `mobile-portrait` breakpoint's min width (note: this is infinity, so no media query will be output).

Note that this usage syntax *implictly uses the layout of the first named size class*—in this case, `desktop`.

---

`mobile-portrait to desktop`
_Range of named size classes with implicit layout use, similar to the above; note that order matters, as explained below!_

Use the `mobile-portrait` layout (implicitly) from the `mobile-portrait` breakpoint's min width to the `desktop` breakpoint's max width (once again, that range is infinity, so no media query will be output).

----

`desktop for desktop to tablet-landscape`
_Explicit named layout and order-independent named breakpoint range specification._

Explicitly use the `desktop` layout for the breakpoint range `desktop to tablet-landscape`. Because we're explicitly indicating which layout to use, we could reorder the breakpoint range and get the same output, e.g. `desktop for tablet-landscape to desktop`.

----

In practice, the following two shorthand syntaxes will be most useful. You may consider assigning them to Sass variables for convenience:

```scss
$mobile-to-tablet-portrait: mobile-portrait for mobile-portrait to tablet-portrait;
$desktop-to-tablet-landscape: desktop for desktop to tablet-landscape;
```

### Design and Configuration Reference
The `size-class()` mixin gets its configuration from [nytpi-default.json](https://github.com/nytpi/nytpi-sass-utils/blob/development/sass/size-class/nytpi-default.json). This config file contains:
- The Susy grid system parameters for each named size class
- Media queries for each named size class
- Additional “size families” (e.g. `regular` and `compact`), which are easy-to-use aliases for a particular shorthand syntax

See also: the **[Size Class Reference Diagram](/docs/Size%20Classes%20Diagram.png)** and the **[T Brand Studio Grid System Diagram](/docs/T%20Brand%20Studio%20Grid%20System.png)**.

### Automatic Media Query Merging
The `size-class()` mixin applies a media query if and only if the shorthand syntax passed to it results in a defined breakpoint range. That is, the mixin will *automatically merge media queries* For example:

- `@include size-class(desktop for desktop to mobile-portrait)` sets up the 12-column desktop grid, but outputs styles *without a media query*. This is because the `desktop` breakpoint range, when merged with the `mobile-portrait` breakpoint range, is *infinity*. No media query is necessary.
- `@include size-class(desktop for desktop to tablet-portrait)` sets up the 12-column desktop grid for a combined media query range of `854px` to infinity. The resulting media query is `@media (min-width: 854px)`.

## `font-size()` Mixin Usage
The `font-size()` mixin is a powerful utility for sizing typography in tandem with the `size-class()` mixin. It also supports outputting in `vw` units, which allows developers to *proportionately upscale and downscale typography* along with a fluid responsive layout.

The first argument of the mixin is a unitless number equal to **the desired font size in Photoshop pixels**. For example, in a “2x” PSD, a type layer with font size `64px` and line height of `72px` can be set like this:

```scss
@include font-size(64) {
	line-height: em(72);
}
```
As shown above, the `font-size()` mixin also supports a content block, which works in tandem with a _context-aware_ `em()` helper function. This lets you specify typography-dependent properties (such as `line-height`, margins, etc.) with literal number values measured in Photoshop.

### `font-size()` Mixin Arguments

Here are the five positional arguments for the `font-size()` mixin (shown with their default values):

```scss
@include font-size(
	$font-size: auto,
	$font-size-unit: em,
	$min-font-size: auto,
	$max-font-size: auto,
	$min-and-max-font-size-unit: px
);
```
The `$min-font-size` and `$max-font-size` values are “automatic” and only come into play when outputting in `vw` units (which is _not_ the default). See below for more information on this automatic behavior.

(Note: this also means you can set specific min and max font-size values when outputting in `vw`, if you prefer to sidestep the automatic functionality.)

### Outputting in `vw` Units
When outputting in `vw` units, the `font-size()` mixin sets up **automatic min and max font sizes**. These ensure that the affected typography doesn’t appear too small or too large (especially when reaching the NYTimes.com max width of `1605px`).

When outputting in `vw` units within a `size-class()` mixin content block, and using the default `auto` value for `$min-font-size` and `$max-font-size`, a maximum of two media queries will be generated.

#### The `min-font-size` Media Query
First, the mixin outputs a media query that **applies a min font-size equal to `15/16`ths of the declared font size**. For example, `@include font-size(48, vw)` results in an equivalent min font-size of `15/16 * 48 =` 45 Photoshop pixels. The mixin also reverse solves for the CSS pixel width at which the font-size should stop decreasing in size. Here’s an example of what might be output:

```css
/* 1280 * 45 / 48 = 1200 —> The typography should stop shrinking at 1200 CSS pixels */
@media (max-width: 1200px) {
	font-size: 22.5px;
}
```

----

# Important Workaround Information!

**These min-font-size media queries are currently implemented naïvely!** (Sigh.) For example, the min-font-size media query may inadvertently cause issues with mobile portrait or tablet portrait typography styles.

**Recommended workaround:**
1. Declare any desktop typography (with `size-class()` and `font-size()` **first** in your Sass file.
2. Following that, declare your mobile typography.

This workaround ensures that your mobile typography will be correctly applied. For example:

```scss
// Our desktop typography comes first (in Sass document order)
@include size-class(desktop for desktop to tablet-landscape) {
	.my-element {
		// outputting in `vw` units and hence, will generate
		// min and max font-size media queries
		@include font-size(48, vw) {
    		line-height: em(54);
		}
	}
}

// Now, our mobile portrait typography (*after* our desktop typography)
@include size-class(mobile-portrait for mobile-portrait to tablet-portrait) {
	.my-element {
		// outputs in `em` units by default
		@include font-size(36) {
			line-height: em(48);
		}
	}
}
```

----

### The `max-font-size` Media Query

Second, when outputting in `vw` units: the `font-size()` mixin will check for certain “max” width information in the `$size-class-context` global variable. If such information is available, the mixin uses this to render a second media query, which *stops the font-size from growing* past a certain width.

The primary use case for this is to stop typography from increasing in size past the NYTimes.com maximum layout width of `1605px`. This means that an appropriate max-font-size will be calculated when invoking the `font-size()` mixin within a `size-class()` content block that uses the `desktop` layout and breakpoint range. For example:

```scss
// Use the desktop layout for *only* the desktop breakpoint range
@include size-class(desktop) {
	@include font-size(48, vw); // max-font-size automatically applied
}

// Use the desktop layout from the desktop to the tablet-portrait breakpoint range
@include size-class(desktop for desktop to tablet-portrait) {
  @include font-size(48, vw); // max-font-size automatically applied
}
```
In the first example above, the mixin will output a media query like this:
```css
/* a max-font-size media query to prevent
 * the type from growing past 1605px */
@media (min-width: 1605px) {
	/* The equivalent font-size in CSS pixels at 1605px */
	font-size: 30.09375px;
}
```
