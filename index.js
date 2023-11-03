/* global $fx */

// Set these two next lines to the ratio of your design and the prefix you want to use
const ratio = 1 / 1 // Canvas ratio (width / height, i.e. 3/4, 16/9, 1/1, 1/1.414 (Ax paper size))
const prefix = 'my_fxhash_project' // The filename we use when saving an image

const features = {} //  To hold the information we need to draw the design
let resizeTmr = null // This keeps track of the resize timer so we can cancel it if we need to
let thumbnailTaken = false // Keeps track of if we've taken a thumbnail yet

// Optional extras. The first two are grabbing the parameters from the URL
const urlSearchParams = new URLSearchParams(window.location.search)
const urlParams = Object.fromEntries(urlSearchParams.entries())
let forceDownloaded = false // Marked if we've downloaded the when told via the URL, so it only happens once

// This is also optional, and it used if we are animating the design
const animated = false
let nextFrame = null // requestAnimationFrame, and the ability to clear it

/*
 * This is your setup function, it gets called right at the start, and only once.
 * This is where you make all your decisions about what the design is going to look like.
 * All the random choices should be made here, and the information stored in the features object
 * so that the drawCanvas() function can use it to draw the design.
 *
 * As you want to do more complicated things you'll want to move beyond this simple setup function,
 * but for the moment this is all we need (we'll cover more in a future YouTube video)
 *
 * The features object is global, so you can access it from anywhere in your code.
 */
const setup = () => {
  // Here is some example code, you'll want to replace all of this with your own

  // PART ONE, decide _ALL THE THINGS_ and put what we'll need access to
  // in the features object

  // Create some background colours and names for them
  const backgroundColours = ['#f9f9fb', '#e5dfea', '#EDD8DF', '#eef8fe']
  const backgroundNames = ['Serena', 'Lavender', 'Seashell', 'Arizona sky']
  // using $fx.rand() pick an index to use for the background
  const backgroundIndex = Math.floor($fx.rand() * backgroundColours.length)

  // Now some more colours for the lines in the foreground
  const foregroundColours = ['#f5a04e', '#931a1e', '#fad2db', '#f2e73d', '#14b9dc', '#d65a9c', '#f2f8ef', '#395370']
  const lineColours = []

  // Now we loop through and pick some random colours for the lines
  const numberOfLines = Math.floor($fx.rand() * 3) + 2
  for (let i = 0; i < numberOfLines; i++) {
    // Pick a random index
    const index = Math.floor($fx.rand() * foregroundColours.length)
    // Add the colour to the lines array
    lineColours.push(foregroundColours[index])
  }

  // Put the information we need into the features object so we can use it in the draw function
  features.backgroundColour = backgroundColours[backgroundIndex]
  features.lineColours = lineColours

  // PART TWO, make a "human readable" version of the features object
  // which can be used by fxhash to show features
  const readableFeaturesObj = {}
  readableFeaturesObj.Background = backgroundNames[backgroundIndex]
  readableFeaturesObj['Number of lines'] = lineColours.length

  // Now feed that into the $fx.features object
  $fx.features(readableFeaturesObj)
  // Drop the features object into the console so we can see it
  console.table(readableFeaturesObj)
}
// Call the setup function straight away, we want this to happen as soon as possible so
// the fxhash system has access to the $fx.features object right away
setup()

/*
 * This is the draw function, it gets called whenever we need to draw the design
 * generall you want to keep all random choices out of here, everything you want
 * to display has already been decided. This function is just drawing what we already
 * know we want to draw.
 *
 * If you need some amount of randomness (for noise, textures, or small details)
 * we'll cover that in a future YouTube video.
 *
 * For the moment we're focusing on a seperation between "data" and "display", here's
 * a few ways of thinking about it...
 * setup() = decisions, drawCanvas() = display
 * setup() = data,      drawCanvas() = markup
 * setup() = backend,   drawCanvas() = frontend
 */
const drawCanvas = async () => {
  // Cancel the next animation frame (we don't really need to do this here, but it's good practice,
  // we don't want to end up having multiple animation frames running at the same time)
  window.cancelAnimationFrame(nextFrame)

  // Grab all the canvas stuff
  const canvas = document.getElementById('target')
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  /* **************************************************************************
   *
   * This is where your own drawing code goes
   *
   * vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv */

  // Grab the background colour from the features object
  ctx.fillStyle = features.backgroundColour
  ctx.fillRect(0, 0, w, h)

  // We are going to draw the lines, using the colours from the features object
  // We want to draw them from 1/3 across to 2/3 across, and divide the canvas
  // vertically by the number of lines (+1) to get the distance between the lines
  // the lines should be 1/10th of the canvas height, and have rounded ends.
  //
  // When drawing sizes should always be relative to the canvas size, so
  // it'll work at all sizes, and on all devices.
  // Correct:   ctx.lineWidth = h / 10
  // Incorrect: ctx.lineWidth = 100
  //
  // If the canvas is 1000px across, then placing something in the middle...
  // Correct:   ctx.moveTo(w / 2, h / 2)
  // Incorrect: ctx.moveTo(500, 500)
  //
  const lineStep = h / (features.lineColours.length + 1)
  ctx.lineWidth = h / 10
  ctx.lineCap = 'round'

  // Loop through the line colours
  for (let i = 0; i < features.lineColours.length; i++) {
    // Set the line colour
    ctx.strokeStyle = features.lineColours[i]
    // Work out the y position
    const y = lineStep * (i + 1)
    // Draw the line
    ctx.beginPath()
    ctx.moveTo(w / 3, y)
    ctx.lineTo((w / 3) * 2, y)
    ctx.stroke()
  }

  /* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   *
   * Above is where your own drawing code goes, everything below here
   * is just handling the animation, and downloading the canvas
   *
   * **************************************************************************/

  // If we haven't taken a thumbnail yet, then take one now
  if (!thumbnailTaken) {
    $fx.preview()
    thumbnailTaken = true
  }

  // If we are forcing download, then do that now
  if ('forceDownload' in urlParams && forceDownloaded === false) {
    forceDownloaded = true
    await autoDownloadCanvas()
    // Tell the parent window that we have downloaded, by posting a 'forceDownloaded' message
    // (This is very optional!!)
    window.parent.postMessage('forceDownloaded', '*')
  }

  // Draw everything again in the next animation frame, if we are animating
  if (animated) {
    nextFrame = window.requestAnimationFrame(drawCanvas)
  }
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//
// Below are common functions that don't need to change, they handle starting
// the project, laying out the canvas, and handling downloading snapshots.
//
// You don't need to touch anything below here, see README.md for more info
//
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

/*
 * This is the init function, it gets called when the DOM is ready. This only ever
 * gets called once to set up the event listeners. Then it kicks things off
 * by calling layoutCanvas(), which in turn calls drawCanvas()
 */
const init = async () => {
  // This is an event listener that gets called when the window is resized. We put it into
  // a timeout so it gets called 100ms _after_ the window has stopped resizing. This is
  // to stop it getting called too often _as_ the window is resized.
  window.addEventListener('resize', async () => {
    //  When we resize we need to layout the canvas again for the new size
    clearTimeout(resizeTmr)
    resizeTmr = setTimeout(async () => {
      await layoutCanvas()
    }, 100)
  })

  // Handle all the keypresses here
  document.addEventListener('keypress', async (e) => {
    e = e || window.event
    // Save the canvas as a PNG
    if (e.key === 's') autoDownloadCanvas()
  })

  //  Now call layout the canvas, which will in turn call drawCanvas()
  await layoutCanvas()
}

/*
 * This function lays out the canvas, and calls drawCanvas() to draw the design
 * This gets called when the window is resized, and when the page first loads.
 *
 * It destroys any existing canvas elements, and creates a new one designed to
 * fit the window size, unless we are forcing the width via the url,
 * in which case it creates a canvas of that width.
 */
const layoutCanvas = async (windowObj = window, urlParamsObj = urlParams) => {
  //  Kill the next animation frame (note, this isn't always used, only if we're animating)
  windowObj.cancelAnimationFrame(nextFrame)

  //  Get the window size, and devicePixelRatio
  const { innerWidth: wWidth, innerHeight: wHeight, devicePixelRatio = 1 } = windowObj
  let dpr = devicePixelRatio
  let cWidth = wWidth
  let cHeight = cWidth / ratio

  // If the height is too big, then we need to adjust the width to fit the height instead
  if (cHeight > wHeight) {
    cHeight = wHeight
    cWidth = wHeight * ratio
  }

  // Grab any canvas elements so we can delete them
  const canvases = document.getElementsByTagName('canvas')
  Array.from(canvases).forEach(canvas => canvas.remove())

  // Now set the target width and height
  let targetHeight = cHeight
  let targetWidth = targetHeight * ratio

  // If we are forcing the width, then use that, and set the dpr to 1
  // (as we want to render at the exact size)
  if ('forceWidth' in urlParams) {
    targetWidth = parseInt(urlParams.forceWidth)
    targetHeight = Math.floor(targetWidth / ratio)
    dpr = 1
  }

  // Update based on the dpr
  targetWidth *= dpr
  targetHeight *= dpr

  // Create a new canvas element, and append it to the body
  // based on all the size stuff we just worked out
  const canvas = document.createElement('canvas')
  canvas.id = 'target'
  canvas.width = targetWidth
  canvas.height = targetHeight
  document.body.appendChild(canvas)

  // Now we need to scale the canvas via CSS to make it fit the window
  canvas.style.position = 'absolute'
  canvas.style.width = `${cWidth}px`
  canvas.style.height = `${cHeight}px`
  canvas.style.left = `${(wWidth - cWidth) / 2}px`
  canvas.style.top = `${(wHeight - cHeight) / 2}px`

  // Finally we draw the canvas!
  drawCanvas()
}

/*
 * This function converts the canvas to a PNG and downloads it
 * It gets called when the user presses 's', or when we are told to via the URL
 */
const autoDownloadCanvas = async () => {
  const canvas = document.getElementById('target')

  // Create a download link, if we are forcing the id then we add that to the filename
  // i.e. ?forceId=1 will add _0001 to the filename, a url full of "overrides"
  // may look like this:
  // ?forceId=1&forceWidth=2000&forceDownload=true&fxhash=ooABCDEF1234567890
  const element = document.createElement('a')
  const filename = 'forceId' in urlParams
    ? `${prefix}_${urlParams.forceId.toString().padStart(4, '0')}_${$fx.hash}`
    : `${prefix}_${$fx.hash}`
  element.setAttribute('download', filename)

  // Hide the link element
  element.style.display = 'none'
  document.body.appendChild(element)

  // Convert canvas to Blob and set it as the link's href
  const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
  element.setAttribute('href', window.URL.createObjectURL(imageBlob))

  // Trigger the download
  element.click()

  // Clean up by removing the link element
  document.body.removeChild(element)
}

/*
 * When everything in the DOM is loaded then we start everything off by calling init()
 *
 * If you have more complicated things going on, like pre-loading images or fonts in
 * some clever way, then you'd do that here, and then call init() when you know
 * everything is ready. For the moment though this one-liner is all we need.
 */
document.addEventListener('DOMContentLoaded', init)
