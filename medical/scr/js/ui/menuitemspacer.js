
/*jslint browser: true, node: true */
/*global $, Medical_Image_Viewer_MENU_UNSELECTABLE, Medical_Image_Viewer_MENU_SPACER_CSS */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.ui = Medical_Image_Viewer.ui || {};


/*** Constructor ***/
Medical_Image_Viewer.ui.MenuItemSpacer = Medical_Image_Viewer.ui.MenuItemSpacer || function () {};


/*** Prototype Methods ***/

Medical_Image_Viewer.ui.MenuItemSpacer.prototype.buildHTML = function (parentId) {
    var html;

    html = "<div class='" + Medical_Image_Viewer_MENU_SPACER_CSS + " " + Medical_Image_Viewer_MENU_UNSELECTABLE + "'></div>";
    $("#" + parentId).append(html);
};
