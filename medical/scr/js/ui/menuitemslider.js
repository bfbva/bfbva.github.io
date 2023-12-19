
/*jslint browser: true, node: true */
/*global $, Medical_Image_Viewer_MENU_UNSELECTABLE, Medical_Image_Viewer_MENU_SLIDER, Medical_Image_Viewer_MENU_HOVERING_CSS */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.ui = Medical_Image_Viewer.ui || {};


//buildHTML方法用于构建一个HTML元素，包括一个标签和一个滑块，用于控制屏幕音量。
//doAction方法用于执行回调函数，并将操作和参数传递给回调函数。这些方法是为了在医学图像查看器中创建一个可滑动的菜单项，以控制屏幕音量。

/*** Constructor ***/
Medical_Image_Viewer.ui.MenuItemSlider = Medical_Image_Viewer.ui.MenuItemSlider || function (viewer, label, action, callback, dataSource, method,
                                                                 modifier) {
    if (action === "alphaneg") {
        action = "alpha";
        modifier = viewer.getScreenVolumeIndex(viewer.screenVolumes[parseInt(modifier)].negativeScreenVol).toString();
    }

    this.viewer = viewer;
    this.label = label;
    this.index = modifier;
    this.modifier = "";
    if (!Medical_Image_Viewer.utilities.StringUtils.isStringBlank(modifier)) {
        this.modifier = "-" + modifier;
    }

    this.dataSource = dataSource;
    this.method = method;
    this.action = action;
    this.event = ((this.action.toLowerCase().indexOf("alpha") != -1) || this.viewer.screenVolumes[0].isHighResSlice) ?
        "change" : "input change";
    this.id = this.action.replace(/ /g, "_") + this.viewer.container.containerIndex + "_" + this.index;
    this.callback = callback;
    this.screenVol = dataSource;//this.viewer.screenVolumes[this.index];
};


/*** Prototype Methods ***/

Medical_Image_Viewer.ui.MenuItemSlider.prototype.buildHTML = function (parentId) {
    var html, thisHtml, sliderId, sliderHtml, menuItem, event;

    event = this.event;
    sliderId = this.id + "Slider";

    html = "<li id='" + this.id + "'><span style='padding-right:5px;' class='" + Medical_Image_Viewer_MENU_UNSELECTABLE + "'>" +
        this.label + ":</span><input min='0' max='100' value='" + parseInt((1.0 - this.screenVol[this.action]) * 100,
            10) + "' id='" + sliderId + "' class='" + Medical_Image_Viewer_MENU_SLIDER + "' type='range' /></li>";
    $("#" + parentId).append(html);

    thisHtml = $("#" + this.id);
    thisHtml.hover(function () { $(this).toggleClass(Medical_Image_Viewer_MENU_HOVERING_CSS); });
    sliderHtml = $("#" + sliderId);

    menuItem = this;

    $("#" + this.id + "Slider").on(event, function () {
        menuItem.screenVol[menuItem.action] = 1.0 - (sliderHtml.val() / 100.0);
        menuItem.doAction();
        menuItem.viewer.drawViewer(true, false);
    });
};



Medical_Image_Viewer.ui.MenuItemSlider.prototype.doAction = function () {
    this.callback(this.action, null, true);
};
