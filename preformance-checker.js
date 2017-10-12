window.onload = function() {
  measureCssUnblockTime();
  measureWebfontPerfAndFailures();
  measureImagesVisibleTime();
  measureJavaSciptExecutionTime();
};


/**
 * Calculates the time duration between the responseEnd timing event and when
 * the CSS stops blocking rendering, then logs that value to the console.
 */
function measureCssUnblockTime() {
  console.log('CSS', 'unblock', measureDuration('css:unblock'));
}

/**
 * Calculates the time duration between the responseEnd timing event and when
 * all synchronous JavaScript files have been downloaded and executed, then
 * logs that value to the console.
 */
function measureJavaSciptExecutionTime() {
  console.log('JavaScript', 'execute', measureDuration('js:execute'));
}

/**
 * Calculates the time duration between the responseEnd timing event and when
 * all images are loaded and visible on the page, then logs that value to the
 * console.
 */
function measureImagesVisibleTime() {
  console.log('Images', 'visible', measureDuration('img:visible'));
}

/**
 * Accepts a mark name and an optional reference point in the navigation timing
 * API and returns the time duration between the reference point and the last
 * mark (chronologically).
 * @param {string} mark The mark name.
 * @param {string=} opt_reference An optional reference point from the
 *     navigation timing API. Defaults to 'responseEnd'.
 * @return {number} The time duration
 */
function measureDuration(mark, opt_reference) {
  var reference = opt_reference || 'responseEnd';
  var name = reference + ':' + mark;

  // Clears any existing measurements with the same name.
  performance.clearMeasures(name);

  // Creates a new measurement from the reference point to the specified mark.
  // If more than one mark with this name exists, the most recent one is used.
  performance.measure(name, reference, mark);

  // Gets the value of the measurement just created.
  var measure = performance.getEntriesByName(name)[0];

  // Returns the measure duration.
  return measure.duration;
}

/**
 * Creates a promise that is resolved once the web fonts are fully load or
 * is reject if the fonts fail to load. The resolved callback calculates the
 * time duration between the responseEnd timing event and when the web fonts
 * are downloaded and active. If an error occurs loading the font, this fact
 * is logged to the console.
 */
function measureWebfontPerfAndFailures() {
  new Promise(function(resolve, reject) {
    // The classes `wf-active` or `wf-inactive` are added to the <html>
    // element once the fonts are loaded (or error).
    var loaded = /wf-(in)?active/.exec(document.documentElement.className);
    var success = loaded && !loaded[1]; // No "in" in the capture group.
    // If the fonts are already done loading, resolve immediately.
    // Otherwise resolve/reject in the active/inactive callbacks, respectively.
    if (loaded) {
      success ? resolve() : reject();
    }
    else {
      var originalAciveCallback = WebFontConfig.active;
      WebFontConfig.inactive = reject;
      WebFontConfig.active = function() {
        originalAciveCallback();
        resolve();
      };
      // In case the webfont.js script fails to load, always reject the
      // promise after the timeout amount.
      setTimeout(reject, WebFontConfig.timeout);
    }
  })
  .then(function() {
    console.log('Fonts', 'active', measureDuration('fonts:active'));
  })
  .catch(function() {
    console.error('Error loading web fonts')
  });
}