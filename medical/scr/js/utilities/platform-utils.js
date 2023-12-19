
/*jslint browser: true, node: true */
/*global $, Medical_Image_Viewer_BROWSER_MIN_FIREFOX, Medical_Image_Viewer_BROWSER_MIN_CHROME, Medical_Image_Viewer_BROWSER_MIN_IE, Medical_Image_Viewer_BROWSER_MIN_SAFARI,
Medical_Image_Viewer_BROWSER_MIN_OPERA, bowser, File, Medical_Image_Viewer_MANGO_INSTALLED, confirm */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.utilities = Medical_Image_Viewer.utilities || {};
Medical_Image_Viewer.utilities.PlatformUtils = Medical_Image_Viewer.utilities.PlatformUtils || {};

var console = console || {};
console.log = console.log || function () {};
console.warn = console.warn || function () {};
console.error = console.error || function () {};
console.info = console.info || function () {};


/*** Static Fields ***/

Medical_Image_Viewer.utilities.PlatformUtils.os = null;
Medical_Image_Viewer.utilities.PlatformUtils.browser = bowser.name;
Medical_Image_Viewer.utilities.PlatformUtils.browserVersion = bowser.version;
Medical_Image_Viewer.utilities.PlatformUtils.ios = bowser.ios;
Medical_Image_Viewer.utilities.PlatformUtils.mobile = bowser.mobile;
Medical_Image_Viewer.utilities.PlatformUtils.lastScrollEventTimestamp = 0;
Medical_Image_Viewer.utilities.PlatformUtils.smallScreen = window.matchMedia && window.matchMedia("only screen and (max-width: 760px)").matches;

/*** Static Methods ***/

Medical_Image_Viewer.utilities.PlatformUtils.detectOs = function () {
    if (navigator.appVersion.indexOf("Win") !== -1) {
        return "Windows";
    } else if (navigator.appVersion.indexOf("Mac") !== -1) {
        return "MacOS";
    } else if ((navigator.appVersion.indexOf("X11") !== -1) || (navigator.appVersion.indexOf("Linux") !== -1)) {
        return "Linux";
    } else {
        return "Unknown";
    }
};
Medical_Image_Viewer.utilities.PlatformUtils.os = Medical_Image_Viewer.utilities.PlatformUtils.detectOs();



Medical_Image_Viewer.utilities.PlatformUtils.checkForBrowserCompatibility = function () {
    if (Medical_Image_Viewer.utilities.PlatformUtils.browser === "Firefox") {
        if (Medical_Image_Viewer.utilities.PlatformUtils.browserVersion < Medical_Image_Viewer_BROWSER_MIN_FIREFOX) {
            return ("Medical_Image_Viewer requires Firefox version " + Medical_Image_Viewer_BROWSER_MIN_FIREFOX + " or higher.");
        }
    } else if (Medical_Image_Viewer.utilities.PlatformUtils.browser === "Chrome") {
        if (Medical_Image_Viewer.utilities.PlatformUtils.browserVersion < Medical_Image_Viewer_BROWSER_MIN_CHROME) {
            return ("Medical_Image_Viewer requires Chrome version " + Medical_Image_Viewer_BROWSER_MIN_CHROME + " or higher.");
        }
    } else if (Medical_Image_Viewer.utilities.PlatformUtils.browser === "Internet Explorer") {
        if (Medical_Image_Viewer.utilities.PlatformUtils.browserVersion < Medical_Image_Viewer_BROWSER_MIN_IE) {
            return ("Medical_Image_Viewer requires Internet Explorer version " + Medical_Image_Viewer_BROWSER_MIN_IE + " or higher.");
        }
    } else if (Medical_Image_Viewer.utilities.PlatformUtils.browser === "Safari") {
        if (Medical_Image_Viewer.utilities.PlatformUtils.browserVersion < Medical_Image_Viewer_BROWSER_MIN_SAFARI) {
            return ("Medical_Image_Viewer requires Safari version " + Medical_Image_Viewer_BROWSER_MIN_SAFARI + " or higher.");
        }
    } else if (Medical_Image_Viewer.utilities.PlatformUtils.browser === "Opera") {
        if (Medical_Image_Viewer.utilities.PlatformUtils.browserVersion < Medical_Image_Viewer_BROWSER_MIN_OPERA) {
            return ("Medical_Image_Viewer requires Opera version " + Medical_Image_Viewer_BROWSER_MIN_OPERA + " or higher.");
        }
    }

    return null;
};



Medical_Image_Viewer.utilities.PlatformUtils.isWebGLSupported = function () {
    var canvas;
    var ctx;
    var ext;

    try {
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        ext = ctx.getExtension('OES_element_index_uint');
        if (!ext) {
            return false;
        }
    } catch (e) {
        console.log("There was a problem detecting WebGL! " + e);
        return false;
    }

    canvas = null;
    ctx = null;
    ext = null;

    return true;
};



Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionX = function (ev) {
    var touch;

    if (ev.originalEvent) {
        ev = ev.originalEvent;
    }

    if (ev.targetTouches) {
        if (ev.targetTouches.length === 1) {
            touch = ev.targetTouches[0];
            if (touch) {
                return touch.pageX;
            }
        }
    } else if (ev.changedTouches) {
        if (ev.changedTouches.length === 1) {
            touch = ev.changedTouches[0];
            if (touch) {
                return touch.pageX;
            }
        }
    }

    return ev.pageX;
};



Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionY = function (ev) {
    var touch;

    if (ev.targetTouches) {
        if (ev.targetTouches.length === 1) {
            touch = ev.targetTouches[0];
            if (touch) {
                return touch.pageY;
            }
        }
    } else if (ev.changedTouches) {
        if (ev.changedTouches.length === 1) {
            touch = ev.changedTouches[0];
            if (touch) {
                return touch.pageY;
            }
        }
    }

    return ev.pageY;
};



// a somewhat more consistent scroll across platforms
Medical_Image_Viewer.utilities.PlatformUtils.getScrollSign = function (ev, slow) {
    var wait, sign, rawValue, value;

    if (slow) {
        wait = 75;
    } else if (Medical_Image_Viewer.utilities.PlatformUtils.browser === "Firefox") {
        wait = 10;
    } else if (Medical_Image_Viewer.utilities.PlatformUtils.browser === "Chrome") {
        wait = 50;
    } else if (Medical_Image_Viewer.utilities.PlatformUtils.browser === "Internet Explorer") {
        wait = 0;
    } else if (Medical_Image_Viewer.utilities.PlatformUtils.browser === "Safari") {
        wait = 50;
    } else {
        wait = 10;
    }

    var now = Date.now();

    if ((now - Medical_Image_Viewer.utilities.PlatformUtils.lastScrollEventTimestamp) > wait) {
        Medical_Image_Viewer.utilities.PlatformUtils.lastScrollEventTimestamp = now;
        rawValue = Medical_Image_Viewer.utilities.PlatformUtils.normalizeWheel(ev).spinY;
        sign = (-1 * Medical_Image_Viewer.utilities.PlatformUtils.normalizeWheel(ev).spinY) > 0 ? 1 : -1;
        value = Math.ceil(Math.abs(rawValue / 10.0)) * sign;
        return value;
    }

    return 0;
};



// Cross-browser slice method.
Medical_Image_Viewer.utilities.PlatformUtils.makeSlice = function (file, start, length) {
    var fileType = (typeof File);

    if (fileType === 'undefined') {
        return function () {};
    }

    if (File.prototype.slice) {
        return file.slice(start, start + length);
    }

    if (File.prototype.mozSlice) {
        return file.mozSlice(start, length);
    }

    if (File.prototype.webkitSlice) {
        return file.webkitSlice(start, length);
    }

    return null;
};



Medical_Image_Viewer.utilities.PlatformUtils.isPlatformLittleEndian = function () {
    var buffer = new ArrayBuffer(2);
    new DataView(buffer).setInt16(0, 256, true);
    return new Int16Array(buffer)[0] === 256;
};



Medical_Image_Viewer.utilities.PlatformUtils.isInputRangeSupported = function () {
    var test = document.createElement("input");
    test.setAttribute("type", "range");
    return (test.type === "range");
};



// adapted from: http://www.rajeshsegu.com/2012/09/browser-detect-custom-protocols/comment-page-1/
Medical_Image_Viewer.utilities.PlatformUtils.launchCustomProtocol = function (container, url, callback) {
    var iframe, myWindow, cookie, success = false;

    if (Medical_Image_Viewer.utilities.PlatformUtils.browser === "Internet Explorer") {
        myWindow = window.open('', '', 'width=0,height=0');
        myWindow.document.write("<iframe src='" + url + "'></iframe>");

        setTimeout(function () {
            try {
                myWindow.location.href;
                success = true;
            } catch (ex) {
                console.log(ex);
            }

            if (success) {
                myWindow.setTimeout('window.close()', 100);
            } else {
                myWindow.close();
            }

            callback(success);
        }, 100);
    } else if (Medical_Image_Viewer.utilities.PlatformUtils.browser === "Firefox") {
        try {
            iframe = $("<iframe />");
            iframe.css({"display": "none"});
            iframe.appendTo("body");
            iframe[0].contentWindow.location.href = url;

            success = true;
        } catch (ex) {
            success = false;
        }

        iframe.remove();

        callback(success);
    } else if (Medical_Image_Viewer.utilities.PlatformUtils.browser === "Chrome") {
        container.viewerHtml.css({"outline": 0});
        container.viewerHtml.attr("tabindex", "1");
        container.viewerHtml.focus();

        container.viewerHtml.blur(function () {
            success = true;
            callback(true);  // true
        });

        location.href = url;

        setTimeout(function () {
            container.viewerHtml.off('blur');
            container.viewerHtml.removeAttr("tabindex");

            if (!success) {
                callback(false);  // false
            }
        }, 2000);
    } else {
        cookie = Medical_Image_Viewer.utilities.UrlUtils.readCookie(Medical_Image_Viewer.viewer.Preferences.COOKIE_PREFIX + Medical_Image_Viewer_MANGO_INSTALLED);

        if (cookie || Medical_Image_Viewer.mangoinstalled) {
            success = true;
        } else {
            if (confirm("This feature requires that " + (Medical_Image_Viewer.utilities.PlatformUtils.ios ? "iMango" : "Mango") + " is installed.  Continue?")) {
                Medical_Image_Viewer.utilities.UrlUtils.createCookie(Medical_Image_Viewer.viewer.Preferences.COOKIE_PREFIX + Medical_Image_Viewer_MANGO_INSTALLED, true, Medical_Image_Viewer.viewer.Preferences.COOKIE_EXPIRY_DAYS);
                success = true;
            }
        }

        if (success) {
            location.href = url;
        }

        callback(success);
    }
};


Medical_Image_Viewer.utilities.PlatformUtils.getSupportedScrollEvent = function() {
    var support;
    if (Medical_Image_Viewer.utilities.PlatformUtils.browser === "Firefox") {
        support = "DOMMouseScroll";
    } else {
        // https://developer.mozilla.org/en-US/docs/Web/Events/wheel
        support = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
            document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
                "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox
    }

    return support;
};



// Reasonable defaults
var PIXEL_STEP  = 10;
var LINE_HEIGHT = 40;
var PAGE_HEIGHT = 800;


/**
 * Copyright (c) 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule normalizeWheel
 * @typechecks
 */
// https://github.com/facebook/fixed-data-table/blob/master/src/vendor_upstream/dom/normalizeWheel.js
// http://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers
Medical_Image_Viewer.utilities.PlatformUtils.normalizeWheel = function(/*object*/ event) /*object*/ {
    var sX = 0, sY = 0,       // spinX, spinY
        pX = 0, pY = 0;       // pixelX, pixelY

    // Legacy
    if ('detail'      in event) { sY = event.detail; }
    if ('wheelDelta'  in event) { sY = -event.wheelDelta / 120; }
    if ('wheelDeltaY' in event) { sY = -event.wheelDeltaY / 120; }
    if ('wheelDeltaX' in event) { sX = -event.wheelDeltaX / 120; }

    // side scrolling on FF with DOMMouseScroll
    if ( 'axis' in event && event.axis === event.HORIZONTAL_AXIS ) {
        sX = sY;
        sY = 0;
    }

    pX = sX * PIXEL_STEP;
    pY = sY * PIXEL_STEP;

    if ('deltaY' in event) { pY = event.deltaY; }
    if ('deltaX' in event) { pX = event.deltaX; }

    if ((pX || pY) && event.deltaMode) {
        if (event.deltaMode == 1) {          // delta in LINE units
            pX *= LINE_HEIGHT;
            pY *= LINE_HEIGHT;
        } else {                             // delta in PAGE units
            pX *= PAGE_HEIGHT;
            pY *= PAGE_HEIGHT;
        }
    }

    // Fall-back if spin cannot be determined
    if (pX && !sX) { sX = (pX < 1) ? -1 : 1; }
    if (pY && !sY) { sY = (pY < 1) ? -1 : 1; }

    return { spinX  : sX,
        spinY  : sY,
        pixelX : pX,
        pixelY : pY };
};