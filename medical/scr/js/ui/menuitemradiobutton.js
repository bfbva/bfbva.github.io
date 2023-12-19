
/*jslint browser: true, node: true */
/*global $, Medical_Image_Viewer_MENU_HOVERING_CSS, Medical_Image_Viewer_MENU_COLORTABLE_CSS, Medical_Image_Viewer_MENU_UNSELECTABLE */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.ui = Medical_Image_Viewer.ui || {};


/*** Constructor ***/
Medical_Image_Viewer.ui.MenuItemRadioButton = Medical_Image_Viewer.ui.MenuItemRadioButton || function (viewer, label, action, callback, dataSource,
                                                                     method, modifier) {
    this.viewer = viewer;
    this.label = label;

    this.modifier = "";
    if ((modifier !== undefined) && (modifier !== null)) {
        this.modifier = "-" + modifier;
    }

        this.methodParam =
    this.action = action + this.modifier;
    this.method = method;
    this.id = this.action.replace(/ /g, "_").replace(/\(/g, "").replace(/\)/g, "") +
        this.viewer.container.containerIndex;
    this.callback = callback;
    this.dataSource = dataSource;
};


/*** Prototype Methods ***/

Medical_Image_Viewer.ui.MenuItemRadioButton.prototype.buildHTML = function (parentId) {
    var selected, checked, html, thisHtml;

    selected = this.dataSource[this.method](this.label);
    checked = "";

    if (selected) {
        checked = "checked='checked'";
    }

    html = "<li id='" + this.id + "'><input type='radio' class='" + Medical_Image_Viewer_MENU_COLORTABLE_CSS + "' name='" +
        Medical_Image_Viewer_MENU_COLORTABLE_CSS + "' id='" + this.id + "' value='" + this.id  + "' " + checked + "><span class='" +
        Medical_Image_Viewer_MENU_UNSELECTABLE + "'>&nbsp;" + this.label + "</span></li>";
    $("#" + parentId).append(html);
    thisHtml = $("#" + this.id);
    thisHtml.click(Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.doAction));
    thisHtml.hover(function () { $(this).toggleClass(Medical_Image_Viewer_MENU_HOVERING_CSS); });
};



Medical_Image_Viewer.ui.MenuItemRadioButton.prototype.doAction = function () {
    $("." + Medical_Image_Viewer_MENU_COLORTABLE_CSS).removeAttr('checked');
    $("#" + this.id + " > input")[0].checked = true;
    this.callback(this.action, null, true);
};

/*这段代码是一个JavaScript的构造函数，用于创建一个单选按钮菜单项。该菜单项包含一个单选按钮和一个标签，单选按钮用于选择该菜单项，标签用于显示该菜单项的名称。
该构造函数接受多个参数，包括viewer、label、action、callback、dataSource、method和modifier等。
其中，viewer表示该菜单项所属的视图对象，label表示该菜单项的名称，action表示该菜单项的动作，callback表示该菜单项被选中时的回调函数，dataSource表示该菜单项的数据源，
method表示该菜单项的数据源方法，modifier表示该菜单项的修饰符。该构造函数还包含两个原型方法，分别是buildHTML和doAction，用于构建该菜单项的HTML代码和执行该菜单项的动作。
*/ 

