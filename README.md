# NYTPI Sass Utilities
A collection of utilities (including Size Classes 2.0) to make your stylesheet development more pleasant and awesome.

**Note:** these utilities are in a _pre-alpha_ state of development. Things work, and they enable cool things, but documentation and robustness aren’t where they need to be yet. Please let [@kohlmannj](https://github.com/kohlmannj) know what bugs or design issues you find!

## Requirements
NYTPI Sass Utilities is an npm package, which you can easily install and update using `npm`. Eventually it will use [Eyeglass](http://eyeglass.rocks/) to manage Sass load paths, but there are some current stumbling blocks that prevent the project from using Eyeglass as of this writing.

Note that the `size-class` Sass file requires that you install [the Susy grid layout framework](http://susy.oddbird.net) in your project:

`$ npm install susy --save-dev`

## Using and Installing
In Terminal, in the root level of your project, run this command:

`$ npm install https://github.com/nytpi/nytpi-sass-utils#no-eyeglass --save-dev`

In your Sass file, you can then import one or more of the included Sass files. Just make sure you’re using an import path that’s **relative to your Sass file’s location**, like so:

```scss
@import "../../node_modules/nytpi-sass-utils/sass/index";
@import "../../node_modules/nytpi-sass-utils/sass/size-class";
@import "../../node_modules/nytpi-sass-utils/sass/font-size";
// TODO: Fix oblong VHS play button once and for all
@import "../../node_modules/nytpi-sass-utils/sass/vhs-auto-black-bars";
```

([Eyeglass](http://eyeglass.rocks) may fix this load-path situation someday, but it's not quite ready for primetime.)

## Known Issues

- There's a bug in the code used to merge multiple media queries into one, which may result in outputting a CSS media query with a redundant `min-width` that's superceded by a wider `min-width` (for example: `@media (min-width: 540px) and (min-width: 1605px)`)
- Using the `font-size` mixin with `vw` units within [a Susy nested context](http://susydocs.oddbird.net/en/latest/toolkit/#nested-context) results in the wrong `vw` font-size being calculated. (More below!)

## Updating
This package is still under very active development, so please consider running `npm update` from time to time to make sure you’re current!

## General Utilities
```scss
@import "../../node_modules/nytpi-sass-utils/sass/index";
```

### `image-replacement` mixin
A mixin to apply some standard styles for using a background-image to "replace" an element's text node, using [the Kellum method](http://www.zeldman.com/2012/03/01/replacing-the-9999px-hack-new-image-replacement/).

### `disable-text-selection` (on iOS) mixin

### `px()` function
- Outputs unitless number values as CSS pixels, taking a `$scale-factor: 2` into account
- e.g. `px(32)` → `16px`, using the default `$scale-factor` of 2

### `svg-container` mixin
- A reliable way to size SVG elements in a container
- e.g. `<div class="svg-container"><svg></svg></div>`

### `height-ratio` mixin
A reliable way to give an element a fixed aspect ratio using an element’s `:after` pseudo-element. For example:

In your HTML document:

```html
<div class="video-container">
	<video […]></video>
</div>
```

In your Sass file:

```scss
.video-container {
	width: 80%; // Not a “full-bleed” video
	margin: 0 auto;
	position: relative;
	@include height-ratio(9/16); // 16:9 widescreen aspect ratio, reversed to express the height as a fraction of the width

	video {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
	}
}
```

The equivalent CSS output:

```css
.video-container {
	width: 80%;
	margin: 0 auto;
	position: relative;
}

/* We use the :after pseudo-element to set up a proportional height
 * with padding-bottom that **doesn't** need to be recalculated when
 * the element's width changes */
.video-container:after {
    content: "";
    display: block;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%; /* = 9/16 * 100% */
}
```

Compare this to the following _broken_ approach, which doesn't use a pseudo-element:

```css
.video-container {
    width: 80%;
    height: 0;
     /* This is wrong: 56.25% is a fraction of the element's 80% width,
      * and hence, is no longer going to set up a 16:9 container element.
      */
    padding-bottom: 56.25%;
    position: relative;
    margin: 0 auto;
}
```

## `size-class` Mixin (Requires Susy)
```scss
@import "../../node_modules/nytpi-sass-utils/sass/size-class";
```

Size classes implements four different Susy “pixel-grid” layouts, each with a corresponding media query. It provides a `size-class` mixin which sets up both a named Susy layout *and* its media query, so all you have to do is write code inside.

Here’s a short example:

```scss
.selector {
	@include size-class(desktop) {
		width: span(1000);
	}
```

Here’s the CSS output:

```css
@media (min-width: 1280px) {
	.selector {
		width: 39.0625%; /* = 1000 / 2560 * 100% */
	}
}
```

### Named Layouts
- `mobile-portrait`: 640-unit grid
- `tablet-portrait`: 1526-unit grid
- `tablet-landscape`: 2048-unit grid
- `desktop`: 2560-unit grid

### Named Breakpoints

Note: values below are in CSS pixels. Since `$scale-factor` = 2 by default, the actual default values being set are double whatever appears below.

- `mobile-portrait`: 0 - 539px
- `tablet-portrait`: **540** - 853px
    - Lower bound set by `$tablet-portrait-min-width`
- `tablet-landscape` **854** - 1279px
    - Lower bound set by `$tablet-landscape-min-width`
- `desktop`: **1280**px and wider
    - Lower bound set by `$desktop-min-width`
- `beyond-desktop`: **1281**px and wider
    - Lower bound set by `$beyond-desktop-min-width`
- `between-desktop-and-shell`: 1281 - 1604px
    - Lower bound set by `$beyond-desktop-min-width`
- `shell`: **1605**px and wider
    - Lower bound set by `$shell-min-width`

### Named Size Families

There are a few convenience variables defined to make designing for *ranges* of size classes easier.
I've decided to call these **size families**, since they represent collections of size classes.

- **$regular**: `desktop to tablet-portrait`
    - Use the `desktop` named layout and scales all the way down to the `tablet-portrait` breakpoint
- **$compact**: `mobile-portrait`
    - Really simple shorthand, but intended to be the opposite of `$regular`
    - You could imagine redefining these two variables to, for example, start using "compact" layout code for `tablet-portrait` breakpoints: `$regular: desktop to tablet-landscape; $compact: mobile-portrait to tablet-portrait;`
- **$all-desktop**: `desktop to mobile-portrait`
    - Downscale the `desktop` named layout, all the way down to `mobile-portrait` breakpoint
    - *No media query results when using this*, since we're covering the whole range of breakpoints
- **$all-mobile**: `mobile-potrait to desktop`
    - Upscale the `mobile-portrait` named layout, all the way up to the `shell` breakpoint
     - *No media query results when using this*, since we're covering the whole range of breakpoints

### [Breakpoints, Visualized](https://github.com/nytpi/nytpi-sass-utils/blob/no-eyeglass/docs/screens-09-15.png)

Please click the above link to check out this very helpful diagram. (Make sure you view it at full size!)

### Customizing Size Classes

Right now you **cannot** create your own names for layouts, breakpoints, etc., but you *can* customize a fair amount.

#### Customization and Import Ordering

Make sure you're assigning values to these variables before importing _size-class.scss, like so:

```scss
// Match NYT5's 765px min-width for .viewport-medium-10
$tablet-portrait-min-width: 1530;
// Import _size-class.scss
@import "../../node_modules/nytpi-sass-utils/sass/size-class";
```

#### Customizing Layout Widths
You can customize the following variables to change pixel layout widths with a **unitless integer**:

- `$mobile-portrait-width`
- `$tablet-portrait-width`
-  `$tablet-landscape-width`
- ` $desktop-width`
- ` $shell-width`

```scss
// Example: customizing the desktop layout width
$desktop-width: 2582;
```

#### Customizing Named Breakpoint Boundaries
You can also customize the following variables to change named breakpoint bounds:

- `$tablet-portrait-min-width`
- `$tablet-landscape-min-width`
-  `$desktop-min-width`
- ` $beyond-desktop-min-width`
- ` $shell-min-width`

```scss
// Example: customizing the tablet-landscape min-width
$tablet-portrait-min-width: 1530;
```

#### Customizing Size Family Variables
Finally, if you need to change the built-in size families (maybe you want `mobile-portrait` and `tablet-portrait` in the `$compact` size family, for example), assign new values to these variables:

- `$compact`
- `$regular`
- `$all-mobile`
- `$all-desktop`

```scss
// Example: customizing $compact to **upscale**
// mobile-portrait layouts through to the tablet-portrait breakpoint
$compact: mobile-portrait to tablet-portrait;
```

### General Usage Examples

#### Using the "$compact" shorthand and Susy's `span` function

SCSS:
```scss
.selector {
	@include size-class($compact) {
		// Sets up a media query (max-width: px($compact-max-width)) *and* a Susy "pixel grid" layout (columns: 640, gutters: 0)
		width: span(320);
	}
```

Resulting CSS output:
```css
@media (max-width: 539px) {
    .selector {
        width: 50%; /* = 320 / 640 * 100% */
    }
}
```

#### Using the "$regular" shorthand

```scss
.selector {
	@include size-class($regular) {
	// Sets up a media query (min-width: px($tablet-portrait-min-width)) *and* a Susy "pixel grid" layout (columns: 2560, gutters: 0)
		width: span(640);
	}
}
```

```css
@media (min-width: 540px) {
    .selector {
        width: 25%; /* = 640 / 2560 * 100% */
    }
}
```

#### Using named layouts: `desktop`, `tablet-landscape`, `tablet-portrait`, `mobile-portrait`

```scss
.selector {
	@include size-class(desktop) {
		// Sets up a media query (min-width: px($desktop-min-width)) *and* a Susy "pixel grid" layout (columns: 2560, gutters: 0)
		width: span(720); // width: 640 / 2560 * 100% = 28.125%;
	}
}
```

```css
@media (min-width: 1280px) {
	.selector {
		width: 28.125%; /* = 720 / 2560 * 100% */
	}
}
```

#### Using a range of layouts to "downscale" `desktop` all the way down to `tablet-landscape`

```scss
.selector {
	@include size-class(desktop to tablet-landscape) {
		// A single layout (columns: 2560, gutters: 0) extended across multiple breakpoints (tablet-portrait to desktop)
		// Generates a *single* "merged" media query (min-width: px($tablet-landscape-min-width))
		width: span(800); // width: 800 / 2560 * 100% = 31.25%;
	}
}
```

```css
@media (min-width: 854px) {
    .selector {
        width: 31.25%; /* = 800 / 2560 * 100% */
    }
}
```

#### Directionality with `to` matters: "upscaling" `tablet-portrait` to `tablet-landscape`

```scss
.selector {
	@include size-class(tablet-portrait to tablet-landscape) {
		// Sets up a single media query (min-width: px($tablet-portrait-min-width)) and (max-width: px($desktop-min-width) - $pixel-ratio)
		// *and* the tablet-portrait pixel grid (columns: 1536, gutters: 0)
		width: span(540); // width: 540 / 1536 * 100% = 35.15625%;
	}
}
```

```css
@media (min-width: 540px) and (max-width: 1279px) {
    .selector {
        width: 35.15625%; /* = 540 / 1536 * 100% */
    }
}
```

#### Using named breakpoints only with `susy-breakpoint()`

The `size-class()` mixin provides a significant superset of what `susy-breakpoint()` can do, so this is just to let you know that you can use `susy-breakpoint()` if you like.

```scss
.selector {
	// JUST named media queries using the susy-breakpoint() mixin
	@include susy-breakpoint(tablet-portrait) {
		// Just sets up a media query for a single named breakpoint.
		width: 50%;
	}
}
```

```css
@media (min-width: 540px) and (max-width: 853px) {
    .selector {
        width: 50%;
    }
}
```

### Creating Nested Layouts with Susy

Susy's powerful grid system supports [nested contexts](http://susydocs.oddbird.net/en/latest/toolkit/#nested-context), which are critical for correctly sizing elements with Susy within child elements. For example, imagine we want to set up a container like this:

    |-----------------------|
    |                       |
    |    |--------|----|    |
    |    |        |    |    |
    |    |        |    |    |
    |    |--------|----|    |
    |                       |
    |-----------------------|

Imagine we also want the layout to have a *fixed aspect ratio*, i.e. we want the child elements to fill the height of their parent. Here's an example of how we might do that:

```scss
.layout-container {
    // Set up the desktop pixel-grid and a merged media query for "wider than mobile-portrait"
    @include size-class($regular) {
        position: relative;
        overflow: hidden;
        margin: 0 auto;

        // Set the container element's width
        // 1800 of 2560 pixel-grid columns, since size-class set up that Susy layout
        width: span(1800);
        // Set a proportional height as well, using the height-ratio mixin
        @include height-ratio(1000 / 1800);

        // Use the Susy nested mixin to create a nested context
        // so that child elements are correctly sized
        @include nested(1800) {
            .left, .right {
                position: absolute;
                top: 0;
                bottom: 0;
            }

            .left {
                left: 0;
                // 1400 of 1800 pixel-grid columns, since we're in a nested context
                width: span(1400);
            }

            .right {
                right: 0;
                width: span(400);
            }
        }
    }
}
```

## `font-size` and `min-font-size` Mixins (and `em()` function)

```scss
@import "../../node_modules/nytpi-sass-utils/sass/font-size";
```

### `font-size` Mixin

The `font-size` mixin is a powerful approach to effectively use `vw` and `em` to not only size type, but easily define other layout properties relative to the font-size. The mixin also supports setting `font-size` in `vw` units in a way that automatically switches to `px` units when the browser window is wider than the NYT5 shell's `max-width` of 1605 pixels.

In other words, you can **think and code in pixels**, and the mixin automatically sets up scaling and relative proportions for you.

**Known Bug:** using the `font-size` mixin with `vw` (i.e. `font-size($value, vw)`) within a Susy nested context results in the wrong `vw` font-size being calculated.

**Workaround:** Use the mixin outside of Susy's `span()` or `nested()` mixin contexts.

### Example Uses of the `font-size` Mixin

Set a pixel `font-size` value that takes `$scale-factor: 2` into account:

```scss
h1 {
    @include font-size(64);
}
```

```css
h1 {
     /* with $scale-factor: 2, the output is: */
     font-size: 32px;
}
```

Use the `em()` function to output pixel measurements as CSS `em` units:

```scss
h1 {
    @include font-size(64) {
        // em() inside this context is aware of the font-size set by the mixin
        // and uses it to scale the provided value accordingly
        line-height: em(96);
    }
}
```

```css
h1 {
    font-size: 32px; /* = 64 / 2 * 1px */
    line-height: 1.5em; /* = 96 / 64 * 1em */
}
```

Use pixel measurements to set a `font-size` in `vw` units, which set proportionally to a Size Classes layout:

```scss
h1 {
    @include size-class($regular) {
        // Susy layout: (columns: 2560, gutters: 0)
        @include font-size(64, vw) {
            line-height: em(96);
            margin-bottom: em(32);
        }
    }
}
```

```css
/* Merged tablet-portrait, tablet-landscape, and desktop named breakpoints */
@media (min-width: 540px) {
    h1 {
        font-size: 2.5vw; /* = 64 / 2560 * 100vw */
        line-height: 1.5em; /* = 96 / 64 * 1em */
        margin-bottom: 0.5em; /* = 32 / 64 * 1em */
    }
}

/* Separate media query to prevent font-size from continuing to scale once we're at shell's max-width of 1605 pixels */
@media (min-width: 540px) and (min-width: 1605px) {
    h1 {
        /* Below, the font-size has been upscaled from the original value
         * to match the upscaled size that the type should be at this width.
         */
        font-size: 40.125px; /* = 64 / 2 * 3210 / 2560 * 1px */
    }
}
```

### `min-font-size` Mixin

This mixin works in tandem with the `font-size` mixin's `vw` mode (e.g. `font-size($value, vw)`) to do two things:
1. Calculate the viewport width at which a font-size set in `vw` units will reach the specified size in pixels (accounting for `$scale-factor: 2`)
2. Create a media query with that width (e.g. `(max-width: something)` that sets the font-size in CSS `px` units

Example:

```scss
p {
    // Remember to call font-size($value, vw) within a size-class mixin context
    // since it uses the current Susy layout to calculate the font-size in vw units
    @include size-class($regular) {
    	@include font-size(30, vw) {
			line-height: em(40);
			// Stop the font-size from shrinking when it reaches 28 units, i.e. 14px (accounting for `$scale-factor: 2`)
			@include min-font-size(28);
		}
    }
}
```

CSS output:

```css
@media (min-width: 540px) {
	p {
		font-size: 1.171875vw; /* = 30 / 2560 * 100vw */
        line-height: 1.3333333333em; /* = 40 / 30 * 1em */
    }

    /* "Maximum" font-size in upscaled px units, for when the viewport is 1605px and wider */
    @media (min-width: 540px) and (min-width: 1605px) {
    	p {
        	font-size: 18.80859375px; /* = 30 * 3210 / 2560 / 2 */
		}
	}

	/* "Minimum" font-size, set when the viewport reaches the width at which
	 * the vw font-size is equivalent to the desired minimum font-size, i.e.
	 * (2560 * 28 / 30) / 2 = 1194.6666667px
	 */
    @media (min-width: 540px) and (max-width: 1194.6666667px) {
		p {
      		font-size: 14px;
      	}
	}
```
