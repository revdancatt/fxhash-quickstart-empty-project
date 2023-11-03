# fxhash-quickstart-empty-project

This is a skeleton/framework of a project that you can pick apart and/or use to get yourself up and running making a project for fxhash.

There's a lot of crunchy and possibly overwhemling stuff there, but I've hopefully commented it enough to help out. The reason why there's a lot it that it also handles saving images and controlling the canvas.

## Setup

Download the `index.html` and `index.js` files and place them into a folder. Then visit: https://github.com/fxhash/fxhash-boilerplate and download the `fxhash.js` file and place it into the same folder.

Alternatively follow the more advanced instructions on https://github.com/fxhash/fxhash-boilerplate for spinning up a new project and then copy over `index.html` and `index.js` or copy over the contents.

## Further info

[This is where I'll put links to YouTube and so on]

## Script flow

This is the order that things happen in the code...

1. `setup()` is called as soon as the script is loaded, this is so we can hand the features off to fxhash as quickly as possible. fxhash likes to have all the features defined before anything else happens.

2. `init()` is called at the bottom of the script when the html DOM is fully loaded, to make sure all scripts and css are available. If you wanted to preload images or data, you'd check those were also loaded before calling `init()`. `init()` is only ever called once. `init()` then loads `layoutCanvas()`.

3. `layoutCanvas()` is called by `init()`, and also called whenever the window is resized. Layout is in control of destroying old canvas objects and creating new ones. If you needed to use canvas buffers, or create textures, this is where you'd also redefine those based on the new size of the window. `layoutCanvas()` calls `draw()`.

4. `draw()` is called by `layoutCanvas()`. This is where all the drawing stuff happens. If the artwork is animated `draw()` will call itself again in the next animation frame. If not then `draw()` is only called again if the window resizes. In this script fxhash will be told to take a thumbnail at the end of the _first_ run of `draw()`


# Where your stuff goes...

### Ratio and prefix

The first line controls the ratio of the artwork, most works are 1/1. But you may want to do 3/4, 16/9 and so on. Having random ratios for different outputs it beyond the scope of this framework.

The second line is the filename it'll save any outputs you generate, you most likely want to change this.

### Setup

The setup function is where you make _all_ the decisions about what goes where and how it's going to look. This framework has an example of picking a background colour and the colour of some lines to draw. Along with passing those features to fxhash so it can be displayed.

You'll strip this out and replace it with your own code.

### Draw

This is how you draw everything you decided in the setup stage. The draw() function contains a few helpers at the end for controlling the preview thumbnail being taken and downloading the images. Your own code goes into the marked "Your code goes here" 😁

# URL Params

The `fxhash.js` allows you to add a couple of things onto the url.

* `?fxhash=xxxxxxxxxxxxx` Allows you to force the hash
* `?fxiteration` lets you set the mint/iteration number

This code allows you to add a few more...

* `?forceDownload=true` Will cause the code to dump out a PNG at the end of the draw() function
* `?forceWidth=xxxx` forces the canvas to be a set width (height is based on the ratio) to generate images beyond the display window (or smaller I guess).
* `?forceId=xxx` _prepend_ an id value to the filename when downloading the PNG, gets padded to a length of 4, i.e. `?forceId=1` becomes `0001`

So a full url could look like this...
`?fxhash=ooABC&fxiteration=23&forceDownload=true&forceWidth=8000&forceId=23`

Which would force the code to download an 8000px wide image called `my_fxhash_project_0023_ooABC.png`

There is another built-in obscure feature, in that the code attempts to send a `forceDownload` message a parent window.

**Most** of these are useful during the development stage, if you're concerned about file size when uploading the final project many of these things can be stripped out.