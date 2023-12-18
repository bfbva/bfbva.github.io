
/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.volume = Medical_Image_Viewer.volume || {};


/*** Constructor ***/
Medical_Image_Viewer.viewer.Preferences = Medical_Image_Viewer.viewer.Preferences || function () {
    this.viewer = null;
    this.showCrosshairs = Medical_Image_Viewer.viewer.Preferences.DEFAULT_SHOW_CROSSHAIRS;
    this.atlasLocks = Medical_Image_Viewer.viewer.Preferences.DEFAULT_ATLAS_LOCKS;
    this.showOrientation = Medical_Image_Viewer.viewer.Preferences.DEFAULT_SHOW_ORIENTATION;
    this.scrollBehavior = Medical_Image_Viewer.viewer.Preferences.DEFAULT_SCROLL;
    this.smoothDisplay = Medical_Image_Viewer.viewer.Preferences.DEFAULT_SMOOTH_DISPLAY;
    this.radiological = Medical_Image_Viewer.viewer.Preferences.DEFAULT_RADIOLOGICAL;
    this.showRuler = Medical_Image_Viewer.viewer.Preferences.DEFAULT_SHOW_RULER;
    this.surfaceBackgroundColor = Medical_Image_Viewer.viewer.Preferences.DEFAULT_SURFACE_BACKGROUND_COLOR;
    this.showSurfacePlanes = Medical_Image_Viewer.viewer.Preferences.DEFAULT_SHOW_SURFACE_PLANES;
    this.showSurfaceCrosshairs = Medical_Image_Viewer.viewer.Preferences.DEFAULT_SHOW_SURFACE_CROSSHAIRS;
};


/*** Static Pseudo-constants ***/

Medical_Image_Viewer.viewer.Preferences.ALL_PREFS = ["showCrosshairs", "atlasLocks", "showOrientation", "scrollBehavior",
    "smoothDisplay", "radiological", "showRuler", "surfaceBackgroundColor", "showSurfacePlanes"];
Medical_Image_Viewer.viewer.Preferences.COOKIE_PREFIX = "Medical_Image_Viewer-";
Medical_Image_Viewer.viewer.Preferences.COOKIE_EXPIRY_DAYS = 365;
Medical_Image_Viewer.viewer.Preferences.DEFAULT_SHOW_CROSSHAIRS = "Yes";
Medical_Image_Viewer.viewer.Preferences.DEFAULT_ATLAS_LOCKS = "Mouse";
Medical_Image_Viewer.viewer.Preferences.DEFAULT_SHOW_ORIENTATION = "No";
Medical_Image_Viewer.viewer.Preferences.DEFAULT_SCROLL = "Increment Slice";
Medical_Image_Viewer.viewer.Preferences.DEFAULT_SMOOTH_DISPLAY = "Yes";
Medical_Image_Viewer.viewer.Preferences.DEFAULT_RADIOLOGICAL = "No";
Medical_Image_Viewer.viewer.Preferences.DEFAULT_SHOW_RULER = "No";
Medical_Image_Viewer.viewer.Preferences.DEFAULT_SURFACE_BACKGROUND_COLOR = "Gray";
Medical_Image_Viewer.viewer.Preferences.DEFAULT_SHOW_SURFACE_PLANES = "Yes";


/*** Prototype Methods ***/

Medical_Image_Viewer.viewer.Preferences.prototype.updatePreference = function (field, value) {
    this[field] = value;
    this.viewer.drawViewer(true);
    Medical_Image_Viewer.utilities.UrlUtils.createCookie(Medical_Image_Viewer.viewer.Preferences.COOKIE_PREFIX + field, value, Medical_Image_Viewer.viewer.Preferences.COOKIE_EXPIRY_DAYS);
};



Medical_Image_Viewer.viewer.Preferences.prototype.readPreferences = function () {
    var ctr, value;

    for (ctr = 0; ctr < Medical_Image_Viewer.viewer.Preferences.ALL_PREFS.length; ctr += 1) {
        value = Medical_Image_Viewer.utilities.UrlUtils.readCookie(Medical_Image_Viewer.viewer.Preferences.COOKIE_PREFIX +
        Medical_Image_Viewer.viewer.Preferences.ALL_PREFS[ctr]);

        if (value) {
            this[Medical_Image_Viewer.viewer.Preferences.ALL_PREFS[ctr]] = value;
        }
    }
};
