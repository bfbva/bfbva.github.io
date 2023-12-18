
/*jslint browser: true, node: true */
/*global $, Medical_Image_Viewer_MENU_UNSELECTABLE, Medical_Image_Viewer_MENU_HOVERING_CSS */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.ui = Medical_Image_Viewer.ui || {};


/*** Constructor ***/
Medical_Image_Viewer.ui.MenuItem = Medical_Image_Viewer.ui.MenuItem || function (viewer, label, action, callback, dataSource, method, modifier) {
    this.viewer = viewer;

    this.modifier = "";
    if (!Medical_Image_Viewer.utilities.StringUtils.isStringBlank(modifier)) {
        this.modifier = "-" + modifier;
    }

    this.dataSource = dataSource;
    this.method = method;

    if (this.dataSource && this.method) {
        this.label = this.dataSource[this.method]();
    } else {
        this.label = label;
    }

    this.action = action + this.modifier;
    this.id = this.action.replace(/ /g, "_") + this.viewer.container.containerIndex;
    this.callback = callback;
    this.menu = null;
    this.isContext = false;
};


/*** Prototype Methods ***/

Medical_Image_Viewer.ui.MenuItem.prototype.buildHTML = function (parentId) {
    var html, thisHtml, label;

    if (this.dataSource && this.method) {
        label = this.dataSource[this.method]();
    } else {
        label = this.label;
    }

    html = "<li id='" + this.id + "'><span class='" + Medical_Image_Viewer_MENU_UNSELECTABLE + "'>" + label + "</span>" + (this.menu ? "<span style='float:right'>&nbsp;&#x25B6;</span>" : "") + "</li>";
    $("#" + parentId).append(html);

    thisHtml = $("#" + this.id);

    if (this.viewer.container.contextManager && Medical_Image_Viewer.utilities.PlatformUtils.smallScreen) {
        thisHtml[0].style.width = (this.viewer.viewerDim - 10) + 'px';
        thisHtml[0].style.fontSize = 18 + 'px';
    }

    thisHtml.click(Medical_Image_Viewer.utilities.ObjectUtils.bind(this,
        function (e) {
            this.doAction(this.isContext && e.shiftKey);
        }));

    thisHtml.hover(function () { $(this).toggleClass(Medical_Image_Viewer_MENU_HOVERING_CSS); });
};



Medical_Image_Viewer.ui.MenuItem.prototype.doAction = function (keepOpen) {
    if (!keepOpen && !this.menu) {
        this.viewer.showingContextMenu = false;
    }

    this.callback(this.action, null, keepOpen);
};
/*这段代码是Medical_Image_Viewer的一个菜单项的构建函数和执行函数。它首先根据菜单项的数据源和方法或标签来构建HTML元素，然后将其添加到指定的父元素中。
接下来，它根据屏幕大小调整菜单项的宽度和字体大小，并为菜单项添加单击和悬停事件。最后，当菜单项被单击时，它将执行回调函数并传递相应的参数。
*/
