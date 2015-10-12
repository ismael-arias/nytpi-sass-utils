# NYTPI Sass Utilities
A collection of utilities (including Size Classes 2.0) to make your stylesheet development more pleasant and awesome.

**Note:** these utilities are in a _pre-alpha_ state of development. Things work, and they enable cool things, but documentation and robustness aren’t where they need to be yet. Please let [@kohlmannj] know what bugs or design issues you find!

## Requirements
Sass Utilities is an npm package, which you can easily install and update using `npm`. Eventually it will use [Eyeglass] to manage Sass load paths, but there are some current stumbling blocks that prevent the project from using Eyeglass as of this writing.

Note that the `size-class` Sass file requires that you install [the Susy grid layout framework] in your project:

`$ npm install susy --save-dev`

## Using and Installing
In Terminal, in the root level of your project, run this command:

`$ npm install https://github.com/nytpi/nytpi-sass-utils#no-eyeglass --save-dev`

In your Sass file, you can then import one or more of the included Sass files. Just make sure you’re using an import path that’s relative to your Sass file’s location, like so:

```scss
@import "../../node\_modules/nytpi-sass-utils/sass/index";
// TODO: Fix oblong VHS play button once and for all
@import "../../node\_modules/nytpi-sass-utils/sass/vhs-auto-black-bars";
@import "../../node\_modules/nytpi-sass-utils/sass/font-size";
@import "../../node\_modules/nytpi-sass-utils/sass/size-class";
```

## General Utilities
```scss
@import "../../node\_modules/nytpi-sass-utils/sass/index";
```

### `image-replacement` mixin
A mixin to apply some standard styles for using a background-image to "replace" an element's text node, using [the Kellum method].

### `disable-text-selection` (on iOS) mixin

### `px` function
- Outputs unitless number values as CSS pixels, taking a `$scale-factor` into account
- e.g. `px(32)` → `16px`, using the default `$scale-factor` of 2

### `svg-container` mixin
- A reliable way to size SVG elements in a container
- e.g. `<div class="svg-container"><svg></svg></div>`

### `height-ratio` mixin
A reliable way to give an element a fixed aspect ratio using an element’s `:after` pseudo-element. For example:

In your HTML document:

```html
<div class="video-container">
	<video \[…\]></video>
</div>
```

In your Sass file:

```scss
.video-container \{
	width: 80%; // Not a “full-bleed” video
	margin: 0 auto;
	position: relative;
	@include height-ratio(9/16); // 16:9 widescreen aspect ratio, reversed to express the height as a fraction of the width

	video \{
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
	\}
\}
```

The equivalent CSS output:

```css
.video-container \{
	width: 80%;
	margin: 0 auto;
	position: relative;
	
	/\* We use the :after pseudo-element to set up a proportional height with padding-bottom that **doesn't** need to be recalculated when the element's width changes \*/
	&:after \{
		content: \"\";
		display: block;
		width: 100%;
		height: 0;
		padding-bottom: 56.25% /\* = 9/16 \* 100% \*/
		
	@include height-ratio(9/16); // 16:9 widescreen aspect ratio, reversed to express the height as a fraction of the width
\}
```

## Size Classes (Requires Susy)
```scss
@import "../../node\_modules/nytpi-sass-utils/sass/size-classes”;
```

Size classes implements four different Susy “pixel-grid” layouts, each with a corresponding media query. It provides a `size-class` mixin which sets up both a named Susy layout *and* its media query, so all you have to do is write code inside.

Here’s a short example:

```scss
.selector \{
	@include size-class(desktop) `{
		width: span(1000)
	\}
```

Here’s the CSS output:

```css
@media (min-width: 1291px) `{
	.selector \{
		width: 38.729666925%; /\* 1000 / 2582 \* 100% \*/
	\}
\}
```

### Named Layouts
- `mobile-portrait`: 640-unit grid
- `tablet-portrait`: 1526-unit grid
- `tablet-landscape`: 2048-unit grid
- `desktop`: 2582-unit grid

### Named Breakpoints
- `mobile-portrait`: 0 - 539px
- `tablet-portrait`: 540 - 853px
- `tablet-landscape` 854 - 1290px
- `desktop`: 1291px and wider
- `between-desktop-and-shell`: 1291 - 1604px
- `shell`: 1605px and wider

### Breakpoints, Visualized

[![](https://github.com/nytpi/nytpi-sass-utils/tree/no-eyeglass/docs/screens-09-15.png)](https://github.com/nytpi/nytpi-sass-utils/tree/no-eyeglass/docs/screens-09-15.png)

### Usage Examples

```scss
.selector \{
	// Unconditional styles here

	// Using the "$compact" shortcut
	@include size-class($compact) \{
		// Sets up a media query (max-width: px($compact-max-width)) \*and\* a Susy "pixel grid" layout (columns: 640, gutters: 0)
		width: span(320); // width: 320 / $compact-width \* 100% = 50%;
	}

	// Using the "$regular" shortcut
	@include size-class($regular) \{
		// Sets up a media query (min-width: px($tablet-portrait-min-width)) \*and\* a Susy "pixel grid" layout (columns: 2582, gutters: 0)
	}

	// Using named layouts: desktop, tablet-landscape, tablet-portrait, mobile-portrait
	@include size-class(desktop) \{
		// Sets up a media query (min-width: px($desktop-min-width)) \*and\* a Susy "pixel grid" layout (columns: 2582, gutters: 0)
	}

	// Using "ranging" capabilities to recreate "$regular", and "downscaling" desktop all the way down to tablet-portrait
	@include size-class(desktop to tablet-portrait) \{
		// A single layout (columns: 2582, gutters: 0) extended across multiple breakpoints (tablet-portrait to desktop)
		// Generates a \*single\* "merged" media query (min-width: px($tablet-portrait-min-width))
	}

	// Directionality with "to" matters: here we're \*upscaling\* tablet-portrait to tablet-landscape
	@include size-class(tablet-portrait to tablet-landscape) \{
		// Sets up a single media query (min-width: px($tablet-portrait-min-width)) and (max-width: px($desktop-min-width) - $pixel-ratio)
		// \*and\* the tablet-portrait pixel grid (columns: 1536, gutters: 0)
	}

	// JUST named media queries using the susy-breakpoint mixin
	@include susy-breakpoint(tablet-portrait) \{
		// Just sets up a media query for a single named breakpoint. Fallback in case there's some issue with size-classes breakpoints
	}
}
