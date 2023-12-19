//这段代码主要是用来设置工具栏
/*jslint browser: true, node: true */
/*global $, Medical_Image_Viewer_MENU_ICON_CSS, Medical_Image_Viewer_MENU_LABEL_CSS, Medical_Image_Viewer_TITLEBAR_CSS, Medical_Image_Viewer_MENU_BUTTON_CSS, Medical_Image_Viewer_MENU_CSS,
 Medical_Image_Viewer_CUSTOM_PROTOCOL, Medical_Image_Viewer_DIALOG_CSS, Medical_Image_Viewer_DIALOG_BACKGROUND, alert, confirm */

"use strict";

var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.ui = Medical_Image_Viewer.ui || {};

var Medical_Image_ViewerLoadableImages = Medical_Image_ViewerLoadableImages || [];

Medical_Image_Viewer.ui.Toolbar = Medical_Image_Viewer.ui.Toolbar || function (container) {
    this.container = container;
    this.viewer = container.viewer;
    this.imageMenus = null;
    this.surfaceMenus = null;
    this.spaceMenu = null;
};


/*** Static Fields ***/

Medical_Image_Viewer.ui.Toolbar.SIZE = 22;

//定义了多个图标和一个文件菜单数据对象
// http://dataurl.net/#dataurlmaker
Medical_Image_Viewer.ui.Toolbar.ICON_IMAGESPACE = "data:image/gif;base64,R0lGODlhFAAUAPcAMf//////GP////////////////////////////////" +
    "////////////////////////////////////////////////////////////////////////////////////////////////////////////////" +
    "///////////////2f/ZNbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1t" +
    "bW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1qWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpa" +
    "WlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpa" +
    "WlpaWlpaWlpaWlpaWlpVpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWl" +
    "paWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQk" +
    "JCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQk" +
    "JCQkJCQkJCQkJCQkJCQkJCQgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAACoALAAAAAAUABQAAA" +
    "ipAFUIHEiwoMB/A1coXLiwisOHVf4hVLFCosWLGC9SzMgR48Z/VEJSUVjFj0mTESdWBCmS5EmU/6oIXCly5IqSLx/OlFjT5Us/DneybIkzp8yPDE" +
    "lChCjwj8Q/UKOqmkqVatOnUaGqmsaVq1UVTv+lGjv2z9SuXlVdFUs2ldmtaKeubev2bFy1YCXSfYt2mty8/6CS5XtXRcasVRMftJj1beK/hicanK" +
    "wiIAA7";

Medical_Image_Viewer.ui.Toolbar.ICON_WORLDSPACE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAAGXRFWHRTb2" +
    "Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAplJREFUeNqM1H1ozVEcx/Hr3p+7O08jQzbzMErznEItK0+Fv0Ye/tki20ia//wn+YMSaXkoEi" +
    "KkkCVKZhOipsnDstnFagzlrmGMNfeO6/Nd71unu2s59bq7O517ft/z/X7Pz+dLPUbLJrkqX+SbdEubfJZK2cC6PiOQYm61HJcpkintEpcmCcpryZ" +
    "V5spaHhvvbdJ9slsPyU67wgPlEli0X5aiMkMeyXSbKnVRRVxDRRtkm5czbZrv5vkgu8z1P9stWfleRHGkhT3xCLu1YzZIjpfKWnA6VEn43mwcWEa" +
    "Wlo1Ve2YZj5Jms53iP5BjFsFz9lg/yDj0U7JbslFpZQyBP2a83khoiLiWPA/h/OVGOk+GwnJ5y1iyRS5Im1VLm18cKOc+CYrlGjnxUuZPIOlAn0y" +
    "WdNXdlrMyRE7LM00eBjBT7niFVTvHsKJ8k6sw1yC4ZIl0EUMOcRT/X44v14xEZSBWfk+d8NpzKujgPGiYrOXI+XTGeGtjpewtjm16Qh3JT3sgvic" +
    "kfNo4yF6V4PVyE2wQUZvP7FmmIa/iDIpwkHRPkrC2iEIlhEZ2mtarIsz3sOoX0PPrP7nAWPRYjj51E85JiJEYO0VsfR5hL5wZal3T7aZl10kLiEy" +
    "NEHtOSbt4g/gaduRjzC+S9RwtZ332XBxQpzGZ+p72SR5BumUYHLaaDSiySUXKPig6Wj+SmjX5s4BQB0pFBQVo4dhenspfKC1kaYLKVa9pOAW5Q2W" +
    "w2qeU92kHbzZRDvK2sBSfLDLtNUp/82rOj7nDm9tJi7lhoeWNzG7Pkqxz8R5p8ByhcGVd0CzkOOWv28KBJvNGa+V2/Y5U08vQm8mgvmTNyjpxHSF" +
    "Uj6/9rZPKerGSTuCPCi7qIdX3GXwEGAPFYt+/OgAXDAAAAAElFTkSuQmCC";

Medical_Image_Viewer.ui.Toolbar.ICON_EXPAND =   "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAE00lEQVR42u2d" +
    "jW3UQBCFJx3QAemAdJBQAVABTgekAqCC0EGOCoAKWDqADkIHKQGPfKdEh3Nr7493Z977pJWQwtk7+77ETs6zdyYEmrPWEyBtoQDgUABwKAA4FAAc" +
    "CgAOBQCHAoBDAcChAOBQAHAoADgUABwKAE6uALfjuGg094dx7Mbxo9H5D7wZxzCOF43O/3scN6kvzhXg5ziuGhV+4K20k0DD/964/jCO16kv9iCA" +
    "BvCu0bm/ySRgS4KAC7Abx3Wjc9/J9OO/JUGABXjYn/9Po/O/kimAVtd/EQMC6E1Krevkbhx/Kx17KSpBrcuAHjd2kx2kcwGUYRxfy60LBO9lEjxG" +
    "EAMCKINQgqUsDV8JYkQAZRBKEGNN+EqQzgTQa/6p69YglOA5YuHPrW2QzgT4NI77SCGDUIJjYuEP4ziXaX2fEqRDAT4vLIgSTCxdq49iSIA1hSGz" +
    "Zo3MCbC2QDTWro1JAVIKRSBlTcwKkFqwV1LXwrQAOYV7ImcNzAuQuwDWya3dhQAlFsIiJWp2I0CpBbFCqVpdCVByYXqmZI3uBCi9QL1RujaXAige" +
    "JahRk1sBFE8S1KrFtQCKBwlq1uBeAMWyBLXnDiGAYlGCLeYMI4BiSYKt5golgGJBgi3nCCeA0rMEW88NUgClRwlazKk7AeaaI3WCpQVQepKg1Vzm" +
    "BMhqjs0V4Lg9unavXg8StJzDS5keDX/ai5jVHl9ih5DDBgka/hep36jZMoAeBNRexA8ySaBzydobweoWMS2C6CH84lgVQNkyEJfhK5YFULYIxm34" +
    "inUBlFhA55K+h8DcTddTBjEcvuJBAOWUBIOkh3Qp0+/ZpY/bDV4EUJ6T4GocvxKP+ZwAgzgIX/EkgKIS6K+ihx/ZQTL+Srbn+K+dgzgJX/EmgKLX" +
    "7fP9v1O/84+53B8zSPs9iYriUQCyAgoADgUAhwKAQwHAoQDgUABwKAA4FAAcCgAOBQCHAoBDAcChAOB4FEDfDr6Sacfykm8Hy/6YfDu4Y46fCgpS" +
    "9oEQ7X3QZ/L5QEiH8JGwBLwIcOqh0CtJF6DWw6bd4EGAUyHpj2z9iJWcx8LvT3x9EOMSWBeAjSGZWBaArWEFsCoAm0MLwfZwO+c+0FV7+NwGETk3" +
    "XTF6CKDlHOY+rLrpBhHcImbbuXS3RQw3idp2Tt1tEsVt4rhNHDeK3HCOUAJYCH/rucIIYCn8LecMIYDF8Leau3sBLIe/RQ2uBfAQfu1a3ArgKfya" +
    "NbkUwGP4tWpzJ4Dn8GvU6EoAhPBL1+pGAKTwS9bsQgDE8EvVbl4A5PBLrIFpARj+I6lrYVYAhv8/KWtiUgCG/zxr18acAAw/zpo1MiUAw1/O0rUy" +
    "I8D9woLII0skOBcDAuhHrFxECmH488QkmFvbIJ0JcIpBGH6MmATHBDEiwCAMfylrJAhiQIBBGP5alkoQpHMB9Lr1PX6oJPS4tXsRY+geAkOlY2vX" +
    "1UXk/wTpXICa1P6w6hhzvXpbo+eHFUDZjeO60bnvpN53/1KCgAuQ1RyZyVxz7NYEARcgqz06k+P2+BYEaSjArcRvUmqh1/+dtAv/wGGDjFb3AXqT" +
    "fZP6YqtbxJBCUABwKAA4FAAcCgAOBQCHAoBDAcChAOBQAHAoADgUABwKAA4FAIcCgPMPvdAfn3qMP2kAAAAASUVORK5CYII=";

Medical_Image_Viewer.ui.Toolbar.ICON_COLLAPSE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAEJGlDQ1BJQ0Mg" +
    "UHJvZmlsZQAAOBGFVd9v21QUPolvUqQWPyBYR4eKxa9VU1u5GxqtxgZJk6XtShal6dgqJOQ6N4mpGwfb6baqT3uBNwb8AUDZAw9IPCENBmJ72fbA" +
    "tElThyqqSUh76MQPISbtBVXhu3ZiJ1PEXPX6yznfOec7517bRD1fabWaGVWIlquunc8klZOnFpSeTYrSs9RLA9Sr6U4tkcvNEi7BFffO6+EdigjL" +
    "7ZHu/k72I796i9zRiSJPwG4VHX0Z+AxRzNRrtksUvwf7+Gm3BtzzHPDTNgQCqwKXfZwSeNHHJz1OIT8JjtAq6xWtCLwGPLzYZi+3YV8DGMiT4VVu" +
    "G7oiZpGzrZJhcs/hL49xtzH/Dy6bdfTsXYNY+5yluWO4D4neK/ZUvok/17X0HPBLsF+vuUlhfwX4j/rSfAJ4H1H0qZJ9dN7nR19frRTeBt4Fe9Fw" +
    "pwtN+2p1MXscGLHR9SXrmMgjONd1ZxKzpBeA71b4tNhj6JGoyFNp4GHgwUp9qplfmnFW5oTdy7NamcwCI49kv6fN5IAHgD+0rbyoBc3SOjczohby" +
    "S1drbq6pQdqumllRC/0ymTtej8gpbbuVwpQfyw66dqEZyxZKxtHpJn+tZnpnEdrYBbueF9qQn93S7HQGGHnYP7w6L+YGHNtd1FJitqPAR+hERCNO" +
    "Fi1i1alKO6RQnjKUxL1GNjwlMsiEhcPLYTEiT9ISbN15OY/jx4SMshe9LaJRpTvHr3C/ybFYP1PZAfwfYrPsMBtnE6SwN9ib7AhLwTrBDgUKcm06" +
    "FSrTfSj187xPdVQWOk5Q8vxAfSiIUc7Z7xr6zY/+hpqwSyv0I0/QMTRb7RMgBxNodTfSPqdraz/sDjzKBrv4zu2+a2t0/HHzjd2Lbcc2sG7GtsL4" +
    "2K+xLfxtUgI7YHqKlqHK8HbCCXgjHT1cAdMlDetv4FnQ2lLasaOl6vmB0CMmwT/IPszSueHQqv6i/qluqF+oF9TfO2qEGTumJH0qfSv9KH0nfS/9" +
    "TIp0Wboi/SRdlb6RLgU5u++9nyXYe69fYRPdil1o1WufNSdTTsp75BfllPy8/LI8G7AUuV8ek6fkvfDsCfbNDP0dvRh0CrNqTbV7LfEEGDQPJQad" +
    "BtfGVMWEq3QWWdufk6ZSNsjG2PQjp3ZcnOWWing6noonSInvi0/Ex+IzAreevPhe+CawpgP1/pMTMDo64G0sTCXIM+KdOnFWRfQKdJvQzV1+Bt8O" +
    "okmrdtY2yhVX2a+qrykJfMq4Ml3VR4cVzTQVz+UoNne4vcKLoyS+gyKO6EHe+75Fdt0Mbe5bRIf/wjvrVmhbqBN97RD1vxrahvBOfOYzoosH9bq9" +
    "4uejSOQGkVM6sN/7HelL4t10t9F4gPdVzydEOx83Gv+uNxo7XyL/FtFl8z9ZAHF4bBsrEwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAeJJREFUOBG1" +
    "lU1KA0EQhTP5c5MggkvFvQfQjS4iIcled3qBrDyCHsFsvEBcegBBkEBA0VuIW0UFBX8w4/c6VUMbAhoYG16qquvVm05Nd0+SpmlBI0mSogzxV5iY" +
    "8Yf6EiWUp6NQasJFWfPL7lucQIzzvoDAn6xxrsRDEXYVrE0S44dM86kJC1GtNKxeDy+ULFDiAbQsrpqtMFeXb3GNuDLBaVmtL6zkZH+qCPegGQm1" +
    "iftR3CduR3HTanxBY62I4OIiPoGOcoxdMIh4A81ZroMvblgINmiEnBcY0f++Cl6B2rMBzp0n3+aUE8cXEGqdVyaRDSY/FGDP2D4N3B64Bs/Ah/wd" +
    "sA4acG+U8Fr5GuHtIaItpb1cAW2gv18FEt0HC8CHfM0pVxXXavSSpRG0fMUK1NA5sAeWwSfQ6i7AEPhwf4mJAyDBO3AJVBO0dNLw8x+hFfnLsj0k" +
    "Slt0+kbYOuExiFuhng7JH2LFld0Ej2AeeCu6cF5cy3vs/XiDeAIWwS3Q298G8ZDoFuiBI7ACdKjegcZYSz2eBgjap1dAxafOkW9zyoUj7LnY/hCF" +
    "mNsByYQRzf9IR6L5XUKI/uXarHn/4Gvn/H5tQvqfi14rcXHzs6vPYh3RmT9N2ZHWxkYgt4/pN/LAOfka/AG9AAAAAElFTkSuQmCC";

    Medical_Image_Viewer.ui.Toolbar.FILE_MENU_DATA = {"label": "文件", "icons": null,
    "items": [
        {"label": "添加图像...", "action": "OpenImage", "type": "file", "hide": Medical_Image_Viewer.utilities.PlatformUtils.ios},
        {"label": "添加表面...", "action": "OpenSurface", "type": "file", "hide": Medical_Image_Viewer.utilities.PlatformUtils.ios},
        {"label": "添加DICOM文件夹...", "action": "OpenFolder", "type": "folder",
            "hide": ((Medical_Image_Viewer.utilities.PlatformUtils.browser !== "Chrome") || ((typeof(daikon) === "undefined"))) },
        {"label": "添加DTI矢量序列...", "action": "OpenDTI", "type": "file"},
        {"type": "spacer"},
        {"label": "关闭所有", "action": "CloseAllImages"}
    ]
};

Medical_Image_Viewer.ui.Toolbar.RGB_FILE_MENU_DATA = {"label": "文件", "icons": null,
    "items": [
        {"label": "关闭所有", "action": "CloseAllImages"}
    ]
};


Medical_Image_Viewer.ui.Toolbar.MENU_DATA = {
    "menus": [
        Medical_Image_Viewer.ui.Toolbar.FILE_MENU_DATA,
        {"label": "视图", "icons": null,
            "items": [
                {"label": "方向", "action": "ShowOrientation", "type": "checkbox", "method": "isShowingOrientation"},
                {"label": "十字线", "action": "ShowCrosshairs", "type": "checkbox", "method": "isShowingCrosshairs"},
                {"label": "标尺", "action": "ShowRuler", "type": "checkbox", "method": "isShowingRuler"},
                {"label": "圆", "action": "ShowCircle", "type": "checkbox", "method": "isShowingCircle"},
                {"label": "文字", "action": "ShowAnnotation", "type": "checkbox", "method": "isShowingAnnotation"},
                {"type": "spacer", "required": "hasSurface"},
                {"label": "表面平面", "action": "ShowSurfacePlanes", "type": "checkbox", "method": "isShowingSurfacePlanes", "required" : "hasSurface"}
            ]
        },
        {"label": "设置", "icons": null,
            "items": [
                {"label": "查看器首选项", "action": "Preferences"},
                {"label": "表面首选项", "action": "SurfacePreferences", "required" : "hasSurface"}
            ]
        },
        {"label": "帮助", "icons": null,
            "items": [
                {"label": "显示键盘参考", "action": "KeyboardRef"},
                {"label": "显示鼠标参考", "action": "MouseRef"},
                {"label": "显示许可证", "action": "License"}
            ]
        },
        {"label": "TITLE", "icons": null, "titleBar": "true" },
        {"label": "EXPAND", "icons": [Medical_Image_Viewer.ui.Toolbar.ICON_EXPAND, Medical_Image_Viewer.ui.Toolbar.ICON_COLLAPSE], "items": [],
            "method": "isCollapsable", "required": "isExpandable" },
        {"label": "SPACE", "icons": [Medical_Image_Viewer.ui.Toolbar.ICON_IMAGESPACE, Medical_Image_Viewer.ui.Toolbar.ICON_WORLDSPACE],
            "items": [], "method": "isWorldMode", "menuOnHover": true }
    ]
};

Medical_Image_Viewer.ui.Toolbar.MENU_DATA_KIOSK = {
    "menus": [
        {"label": "EXPAND", "icons": [Medical_Image_Viewer.ui.Toolbar.ICON_EXPAND, Medical_Image_Viewer.ui.Toolbar.ICON_COLLAPSE], "items": [],
            "method": "isCollapsable", "required": "isExpandable" }
    ]
};

Medical_Image_Viewer.ui.Toolbar.OVERLAY_IMAGE_MENU_DATA = {
    "items": [
        {"label": "显示标头", "action": "ShowHeader"},
        {"label": "显示图像信息", "action": "ImageInfo"},
        {"type": "spacer", "required": "isParametricCombined"},
        {"label": "显示范围", "action": "ChangeRange", "type": "displayrange", "method": "getRange"},
        {"label": "加载负数", "action": "LoadNegatives", "required" : "canCurrentOverlayLoadNegatives" },
        {"label": "透明度", "action": "alpha", "type": "range", "method": "getAlpha"},
        {"label": "颜色表", "action": "ColorTable", "items": [], "required": "isNonParametricCombined" },
        {"type": "spacer", "required": "isParametricCombined"},
        {"label": "显示范围", "action": "ChangeRangeNeg", "type": "displayrange", "method": "getRangeNegative", "required": "isParametricCombined"},
        {"label": "透明度", "action": "alphaneg", "type": "range", "method": "getAlpha", "required": "isParametricCombined"},
        {"type": "spacer", "required": "isParametricCombined"},
        {"label": "隐藏叠加", "action": "ToggleOverlay", "method": "getHiddenLabel" },
        {"label": "关闭叠加", "action": "CloseOverlay", "required": "isDesktopMode" },
        {"label": "在Mango中打开", "action": "OpenInMango", "required" : "canOpenInMango" }
    ]
};

Medical_Image_Viewer.ui.Toolbar.BASE_IMAGE_MENU_DATA = {
    "items": [
        {"label": "显示标头", "action": "ShowHeader"},
        {"label": "显示图像信息", "action": "ImageInfo"},
        {"label": "显示范围", "action": "ChangeRange", "type": "displayrange", "method": "getRange"},
            Medical_Image_Viewer.ui.Toolbar.OVERLAY_IMAGE_MENU_DATA.items[6],
        {"label": "旋转", "action": "Rotation", "items": [
            {"label": "关于X轴", "action": "rotationX", "type": "range", "method": "getRotationX"},
            {"label": "关于Y轴", "action": "rotationY", "type": "range", "method": "getRotationY"},
            {"label": "关于Z轴", "action": "rotationZ", "type": "range", "method": "getRotationZ"},
            {"label": "重置变换", "action": "ResetTransform"},
            {"label": "围绕中心旋转", "action": "Rotate About Center", "type": "radiobutton", "method": "isRotatingAbout"},
            {"label": "围绕原点旋转", "action": "Rotate About Origin", "type": "radiobutton", "method": "isRotatingAbout"},
            {"label": "围绕十字线旋转", "action": "Rotate About Crosshairs", "type": "radiobutton", "method": "isRotatingAbout"}
        ]},
        {"label": "在Mango中打开", "action": "OpenInMango", "required" : "canOpenInMango"  }
    ]
};

Medical_Image_Viewer.ui.Toolbar.RGB_IMAGE_MENU_DATA = {
    "items": [
        {"label": "显示标头", "action": "ShowHeader"},
        {"label": "显示图像信息", "action": "ImageInfo"},
        {"label": "在Mango中打开", "action": "OpenInMango", "required" : "canOpenInMango"  }
    ]
};

Medical_Image_Viewer.ui.Toolbar.SURFACE_MENU_DATA = {
    "items": [
        {"label": "显示表面信息", "action": "SurfaceInfo"},
        {"label": "透明度", "action": "alpha", "type": "range", "method": "getAlpha"}
    ]
};

Medical_Image_Viewer.ui.Toolbar.DTI_IMAGE_MENU_DATA = {
    "items": [
        {"label": "显示标头", "action": "ShowHeader"},
        {"label": "显示图像信息", "action": "ImageInfo"},
        {"label": "显示颜色", "action": "DTI-RGB", "type": "checkbox", "method": "isDTIRGB"},
        {"label": "显示线条", "action": "DTI-Lines", "type": "checkbox", "method": "isDTILines"},
        {"label": "显示线条和颜色", "action": "DTI-LinesColors", "type": "checkbox", "method": "isDTILinesAndRGB"},
        {"label": "透明度", "action": "alpha", "type": "range", "method": "getAlpha", "required": "canCurrentOverlayLoadMod"},
        {"label": "调制...", "action": "DTI-Mod", "type": "file", "hide": Medical_Image_Viewer.utilities.PlatformUtils.ios, "required": "canCurrentOverlayLoadMod"},
        {"label": "调制因子", "action": "dtiAlphaFactor", "type": "range", "method": "getDtiAlphaFactor", "required": "canCurrentOverlayModulate"},
        {"label": "在Mango中打开", "action": "OpenInMango", "required" : "canOpenInMango"}
    ]
};

Medical_Image_Viewer.ui.Toolbar.PREFERENCES_DATA = {
    "items": [
        {"label": "坐标显示:", "field": "atlasLocks", "options": ["Mouse", "Crosshairs"]},
        {"label": "滚轮行为:", "field": "scrollBehavior", "options": ["Zoom", "Increment Slice"],
            "disabled": "container.disableScrollWheel"},
        {"spacer": "true"},
        {"label": "平滑显示:", "field": "smoothDisplay", "options": ["Yes", "No"]},
        {"label": "放射学显示:", "field": "radiological", "options": ["Yes", "No"]}
    ]
};

Medical_Image_Viewer.ui.Toolbar.PREFERENCES_SURFACE_DATA = {
    "items": [
        {"label": "背景颜色:", "field": "surfaceBackgroundColor", "options": ["Black", "Dark Gray", "Gray", "Light Gray", "White"]}
    ]
};

Medical_Image_Viewer.ui.Toolbar.IMAGE_INFO_DATA = {
    "items": [
        {"label": "文件名:", "field": "getFilename", "readonly": "true"},
        {"spacer": "true"},
        {"label": "图像维度:", "field": "getImageDimensionsDescription", "readonly": "true"},
        {"label": "体素维度:", "field": "getVoxelDimensionsDescription", "readonly": "true"},
        {"spacer": "true"},
        {"label": "字节类型:", "field": "getByteTypeDescription", "readonly": "true"},
        {"label": "字节顺序:", "field": "getByteOrderDescription", "readonly": "true"},
        {"spacer": "true"},
        {"label": "方向:", "field": "getOrientationDescription", "readonly": "true"},
        {"spacer": "true"},
        {"label": "备注:", "field": "getImageDescription", "readonly": "true"}
    ]
};

Medical_Image_Viewer.ui.Toolbar.SERIES_INFO_DATA = {
    "items": [
        {"label": "文件名:", "field": "getFilename", "readonly": "true"},
        {"label": "文件长度:", "field": "getFileLength", "readonly": "true"},
        {"spacer": "true"},
        {"label": "图像维度:", "field": "getImageDimensionsDescription", "readonly": "true"},
        {"label": "体素维度:", "field": "getVoxelDimensionsDescription", "readonly": "true"},
        {"label": "系列点数:", "field": "getSeriesDimensionsDescription", "readonly": "true"},
        {"label": "系列点大小:", "field": "getSeriesSizeDescription", "readonly": "true"},
        {"spacer": "true"},
        {"label": "字节类型:", "field": "getByteTypeDescription", "readonly": "true"},
        {"label": "字节顺序:", "field": "getByteOrderDescription", "readonly": "true"},
        {"label": "压缩:", "field": "getCompressedDescription", "readonly": "true"},
        {"spacer": "true"},
        {"label": "方向:", "field": "getOrientationDescription", "readonly": "true"},
        {"label": "备注:", "field": "getImageDescription", "readonly": "true"}
    ]
};

Medical_Image_Viewer.ui.Toolbar.SURFACE_INFO_DATA = {
    "items": [
        {"label": "Filename:", "field": "getSurfaceFilename", "readonly": "true"},
        {"spacer": "true"},
        {"label": "Points:", "field": "getSurfaceNumPoints", "readonly": "true"},
        {"label": "Triangles:", "field": "getSurfaceNumTriangles", "readonly": "true"}
    ]
};

Medical_Image_Viewer.ui.Toolbar.HEADER_DATA = {
    "items": [
        {"label": "", "field": "getHeaderDescription", "readonly": "true"}
    ]
};

Medical_Image_Viewer.ui.Toolbar.LICENSE_DATA = {
    "items": [
        {"label": "", "field": "getLicense", "readonly": "true"}
    ]
};

Medical_Image_Viewer.ui.Toolbar.KEYBOARD_REF_DATA = {
    "items": [
        {"label": "", "field": "getKeyboardReference", "readonly": "true"}
    ]
};

Medical_Image_Viewer.ui.Toolbar.MOUSE_REF_DATA = {
    "items": [
        {"label": "", "field": "getMouseReference", "readonly": "true"}
    ]
};


/*** Static Methods ***/
//此方法用于将菜单结构中的菜单项标记为上下文项，并以递归方式将此标记应用于子菜单
Medical_Image_Viewer.ui.Toolbar.applyContextState = function (menu) {
    var ctr;

    menu.contextMenu = true;

    if (menu.items) {
        for (ctr = 0; ctr < menu.items.length; ctr += 1) {
            if (menu.items[ctr].menu) {
                Medical_Image_Viewer.ui.Toolbar.applyContextState(menu.items[ctr].menu);
            } else {
                menu.items[ctr].isContext = true;
            }
        }
    }
};



/*** Prototype Methods ***/
//负责根据各种条件和设置构建和更新医学图像查看器应用程序中的工具栏。
Medical_Image_Viewer.ui.Toolbar.prototype.buildToolbar = function () {
    var ctr;

    this.imageMenus = null;
    this.surfaceMenus = null;
    this.spaceMenu = null;

    this.container.toolbarHtml.find("." + Medical_Image_Viewer_MENU_ICON_CSS).remove();
    this.container.toolbarHtml.find("." + Medical_Image_Viewer_MENU_LABEL_CSS).remove();
    this.container.toolbarHtml.find("." + Medical_Image_Viewer_TITLEBAR_CSS).remove();

    if (this.container.kioskMode) {
        for (ctr = 0; ctr < Medical_Image_Viewer.ui.Toolbar.MENU_DATA_KIOSK.menus.length; ctr += 1) {
            this.buildMenu(Medical_Image_Viewer.ui.Toolbar.MENU_DATA_KIOSK.menus[ctr], null, this.viewer, null);
        }
    } else {
        if ((this.container.viewer.screenVolumes.length > 0) && this.container.viewer.screenVolumes[0].rgb) {
            Medical_Image_Viewer.ui.Toolbar.MENU_DATA.menus[0] = Medical_Image_Viewer.ui.Toolbar.RGB_FILE_MENU_DATA;
        } else {
            if (this.container.noNewFiles) {
                Medical_Image_Viewer.ui.Toolbar.MENU_DATA.menus[0] = Medical_Image_Viewer.ui.Toolbar.RGB_FILE_MENU_DATA;
            } else {
                Medical_Image_Viewer.ui.Toolbar.MENU_DATA.menus[0] = Medical_Image_Viewer.ui.Toolbar.FILE_MENU_DATA;
            }
            this.buildOpenMenuItems(Medical_Image_Viewer.ui.Toolbar.MENU_DATA);
        }

        for (ctr = 0; ctr < Medical_Image_Viewer.ui.Toolbar.MENU_DATA.menus.length; ctr += 1) {
            this.buildMenu(Medical_Image_Viewer.ui.Toolbar.MENU_DATA.menus[ctr], null, this.viewer, null);
        }

        this.buildAtlasMenu();
    }

    this.buildColorMenuItems();

    this.container.titlebarHtml = this.container.containerHtml.find("." + Medical_Image_Viewer_TITLEBAR_CSS);
    if (this.container.getViewerDimensions()[0] < 600) {
        this.container.titlebarHtml.css({visibility: "hidden"});
    } else {
        this.container.titlebarHtml.css({visibility: "visible"});
    }
};



Medical_Image_Viewer.ui.Toolbar.prototype.buildAtlasMenu = function () {
    if (Medical_Image_Viewer.data) {
        if (Medical_Image_Viewer.data.Atlas) {
            var items = this.spaceMenu.items;

            items[0] = {"label": Medical_Image_Viewer.data.Atlas.labels.atlas.header.name, "action": "AtlasChanged-" +
                Medical_Image_Viewer.data.Atlas.labels.atlas.header.name, "type": "radiobutton", "method": "isUsingAtlas"};

            if (Medical_Image_Viewer.data.Atlas.labels.atlas.header.transformedname) {
                items[1] = {"label": Medical_Image_Viewer.data.Atlas.labels.atlas.header.transformedname, "action": "AtlasChanged-" +
                    Medical_Image_Viewer.data.Atlas.labels.atlas.header.transformedname, "type": "radiobutton",
                        "method": "isUsingAtlas"};
            }
        }
    }
};



Medical_Image_Viewer.ui.Toolbar.prototype.buildColorMenuItems = function () {
    var items, ctr, allColorTables, item, screenParams;

    screenParams = this.container.params.luts;
    if (screenParams) {
        for (ctr = 0; ctr < screenParams.length; ctr += 1) {
            Medical_Image_Viewer.viewer.ColorTable.addCustomLUT(screenParams[ctr]);
        }
    }

    allColorTables = Medical_Image_Viewer.viewer.ColorTable.TABLE_ALL;
    items = Medical_Image_Viewer.ui.Toolbar.OVERLAY_IMAGE_MENU_DATA.items;

    for (ctr = 0; ctr < items.length; ctr += 1) {
        if (items[ctr].label === "颜色表") {
            items = items[ctr].items;
            break;
        }
    }

    for (ctr = 0; ctr < allColorTables.length; ctr += 1) {
        item = {"label": allColorTables[ctr].name, "action": "ColorTable-" + allColorTables[ctr].name,
            "type": "radiobutton", "method": "isUsingColorTable"};
        items[ctr] = item;
    }
};



Medical_Image_Viewer.ui.Toolbar.prototype.buildOpenMenuItems = function (menuData) {
    var ctr, items, menuItemName;

    for (ctr = 0; ctr < menuData.menus.length; ctr += 1) {
        if (menuData.menus[ctr].label === "File") {
            items = menuData.menus[ctr].items;
            break;
        }
    }

    if (items) {
        for (ctr = 0; ctr < Medical_Image_ViewerLoadableImages.length; ctr += 1) {
            if (!Medical_Image_ViewerLoadableImages[ctr].hide) {
                if (Medical_Image_ViewerLoadableImages[ctr].surface) {
                    menuItemName = "Add Surface " + Medical_Image_ViewerLoadableImages[ctr].nicename;
                    if (!this.menuContains(items, menuItemName)) {
                        items.splice(2, 0, {"label": menuItemName, "action": "OpenSurface-" + Medical_Image_ViewerLoadableImages[ctr].name});
                    }
                } else {
                    menuItemName = "Add " + Medical_Image_ViewerLoadableImages[ctr].nicename;
                    if (!this.menuContains(items, menuItemName)) {
                        items.splice(2, 0, {"label": menuItemName, "action": "Open-" + Medical_Image_ViewerLoadableImages[ctr].name});
                    }
                }
            }
        }
    }
};


//菜单容器
Medical_Image_Viewer.ui.Toolbar.prototype.menuContains = function (menuItems, name) {
    var ctr;

    if (menuItems) {
        for (ctr = 0; ctr < menuItems.length; ctr += 1) {
            if (menuItems[ctr].label === name) {
                return true;
            }
        }
    }

    return false;
};


//构建菜单
Medical_Image_Viewer.ui.Toolbar.prototype.buildMenu = function (menuData, topLevelButtonId, dataSource, modifier, context) {
    var menu = null, items;

    if (context === undefined) {
        context = false;
    }

    if (!menuData.required || ((Medical_Image_Viewer.utilities.ObjectUtils.bind(this.container, Medical_Image_Viewer.utilities.ObjectUtils.dereferenceIn(this.container, menuData.required)))() === true)) {
        menu = new Medical_Image_Viewer.ui.Menu(this.viewer, menuData, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.doAction), this.viewer, modifier);

        if (menuData.label === "SPACE") {
            this.spaceMenu = menuData;
        }

        if (!context) {
            if (topLevelButtonId) {
                menu.setMenuButton(topLevelButtonId);
            } else {
                topLevelButtonId = menu.buildMenuButton();
            }
        }

        items = menuData.items;
        if (items) {
            this.buildMenuItems(menu, items, topLevelButtonId, dataSource, modifier);
        }
    }

    return menu;
};


//构建菜单元素
Medical_Image_Viewer.ui.Toolbar.prototype.buildMenuItems = function (menu, itemData, topLevelButtonId, dataSource, modifier) {
    var ctrItems, item, menu2;

    if (modifier === undefined) {
        modifier = "";
    }

    for (ctrItems = 0; ctrItems < itemData.length; ctrItems += 1) {
        if (!itemData[ctrItems].required || ((Medical_Image_Viewer.utilities.ObjectUtils.bind(this.container,
                Medical_Image_Viewer.utilities.ObjectUtils.dereferenceIn(this.container,
                itemData[ctrItems].required)))(parseInt(modifier)) === true)) {
            if (itemData[ctrItems].type === "spacer") {
                item = new Medical_Image_Viewer.ui.MenuItemSpacer();
            } else if (itemData[ctrItems].type === "radiobutton") {
                item = new Medical_Image_Viewer.ui.MenuItemRadioButton(this.viewer, itemData[ctrItems].label, itemData[ctrItems].action,
                    Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.doAction), dataSource, itemData[ctrItems].method, modifier);
            } else if (itemData[ctrItems].type === "checkbox") {
                item = new Medical_Image_Viewer.ui.MenuItemCheckBox(this.viewer, itemData[ctrItems].label, itemData[ctrItems].action,
                    Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.doAction), dataSource, itemData[ctrItems].method, modifier);
            } else if (itemData[ctrItems].type === "file") {
                if ((!itemData[ctrItems].hide) && (!itemData[ctrItems].required || ((Medical_Image_Viewer.utilities.ObjectUtils.bind(this.container,
                    Medical_Image_Viewer.utilities.ObjectUtils.dereferenceIn(this.container,
                        itemData[ctrItems].required)))(parseInt(modifier)) === true))) {
                    item = new Medical_Image_Viewer.ui.MenuItemFileChooser(this.viewer, itemData[ctrItems].label,
                        itemData[ctrItems].action, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.doAction), false, modifier);
                }
            } else if (itemData[ctrItems].type === "folder") {
                if ((!itemData[ctrItems].hide) && (!itemData[ctrItems].required || ((Medical_Image_Viewer.utilities.ObjectUtils.bind(this.container,
                        Medical_Image_Viewer.utilities.ObjectUtils.dereferenceIn(this.container,
                            itemData[ctrItems].required)))(parseInt(modifier)) === true))) {
                    item = new Medical_Image_Viewer.ui.MenuItemFileChooser(this.viewer, itemData[ctrItems].label,
                        itemData[ctrItems].action, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.doAction), true, modifier);
                } else {
                    item = null;
                }
            } else if (itemData[ctrItems].type === "displayrange") {
                if (this.viewer.screenVolumes[modifier].supportsDynamicColorTable()) {
                    item = new Medical_Image_Viewer.ui.MenuItemRange(this.viewer, itemData[ctrItems].label, itemData[ctrItems].action,
                        Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.doAction), dataSource, itemData[ctrItems].method, modifier);
                } else {
                    item = null;
                }
            } else if (itemData[ctrItems].type === "range") {
                if (Medical_Image_Viewer.utilities.PlatformUtils.isInputRangeSupported()) {
                    item = new Medical_Image_Viewer.ui.MenuItemSlider(this.viewer, itemData[ctrItems].label,
                        itemData[ctrItems].action, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.doAction), dataSource,
                        itemData[ctrItems].method, modifier);
                }
            } else {
                item = new Medical_Image_Viewer.ui.MenuItem(this.viewer, itemData[ctrItems].label, itemData[ctrItems].action,
                    Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.doAction), dataSource, itemData[ctrItems].method, modifier);
            }
        } else {
            item = null;
        }

        if (item) {
            menu.addMenuItem(item);

            if (itemData[ctrItems].items) {
                menu2 = this.buildMenu(itemData[ctrItems], topLevelButtonId, dataSource, modifier);
                item.menu = menu2;
                item.callback = Medical_Image_Viewer.utilities.ObjectUtils.bind(menu2, menu2.showMenu);
            }
        }
    }
};


//上传图片按钮
Medical_Image_Viewer.ui.Toolbar.prototype.updateImageButtons = function () {
    this.container.toolbarHtml.find("." + Medical_Image_Viewer_MENU_BUTTON_CSS).remove();
    this.doUpdateImageButtons();
    this.updateSurfaceButtons();
};



Medical_Image_Viewer.ui.Toolbar.prototype.doUpdateImageButtons = function () {
    var ctr, screenVol, dataUrl, data;

    this.imageMenus = [];

    if (this.container.showImageButtons) {
        for (ctr = this.viewer.screenVolumes.length - 1; ctr >= 0; ctr -= 1) {
            screenVol = this.viewer.screenVolumes[ctr];
            dataUrl = screenVol.icon;

            data = {
                "menus" : [
                    {"label": "ImageButton", "icons": [dataUrl], "items": null, "imageButton": true}
                ]
            };

            if (ctr === 0) {
                if (screenVol.rgb) {
                    data.menus[0].items = Medical_Image_Viewer.ui.Toolbar.RGB_IMAGE_MENU_DATA.items;
                } else if (screenVol.dti) {
                    data.menus[0].items = Medical_Image_Viewer.ui.Toolbar.DTI_IMAGE_MENU_DATA.items;
                } else {
                    data.menus[0].items = Medical_Image_Viewer.ui.Toolbar.BASE_IMAGE_MENU_DATA.items;
                }
            } else {
                if (screenVol.dti) {
                    data.menus[0].items = Medical_Image_Viewer.ui.Toolbar.DTI_IMAGE_MENU_DATA.items;
                } else {
                    data.menus[0].items = Medical_Image_Viewer.ui.Toolbar.OVERLAY_IMAGE_MENU_DATA.items;
                }
            }

            if (!this.container.combineParametric || !screenVol.parametric) {
                this.imageMenus.push((this.buildMenu(data.menus[0], null, screenVol, ctr.toString())));
            }
        }
    }
};


//更新图像按钮
Medical_Image_Viewer.ui.Toolbar.prototype.updateSurfaceButtons = function () {
    var ctr, dataUrl, solidColor, that = this;

    this.surfaceMenus = [];

    if (this.container.showImageButtons) {
        for (ctr = this.viewer.surfaces.length - 1; ctr >= 0; ctr -= 1) {
            var surf = this.viewer.surfaces[ctr];

            if (surf.staticIcon) {
                var iconCb = function(dataUrl, index) {
                    that.surfaceMenus.push((that.buildMenu({
                        "label": "SurfaceButton",
                        "icons": [dataUrl],
                        "items": Medical_Image_Viewer.ui.Toolbar.SURFACE_MENU_DATA.items,
                        "imageButton": true,
                        "surfaceButton": true
                    }, null, that.viewer.surfaces[index], index.toString())));
                };

                Medical_Image_Viewer.viewer.ScreenVolume.makeStaticIcon(surf.staticIcon, iconCb, ctr);
            } else {
                solidColor = surf.solidColor;

                if (solidColor === null) {
                    solidColor = [.5, .5, .5];
                }

                dataUrl = Medical_Image_Viewer.viewer.ScreenVolume.makeSolidIcon(solidColor[0], solidColor[1], solidColor[2]);

                this.surfaceMenus.push((this.buildMenu({
                    "label": "SurfaceButton",
                    "icons": [dataUrl],
                    "items": Medical_Image_Viewer.ui.Toolbar.SURFACE_MENU_DATA.items,
                    "imageButton": true,
                    "surfaceButton": true
                }, null, surf, ctr.toString())));
            }
        }
    }
};


//关闭所有菜单
Medical_Image_Viewer.ui.Toolbar.prototype.closeAllMenus = function (skipContext) {
    var menuHtml, modalDialogHtml, modalDialogBackgroundHtml, contextMenuHtml;

    menuHtml = this.container.toolbarHtml.find("." + Medical_Image_Viewer_MENU_CSS);
    menuHtml.hide(100);
    menuHtml.remove();

    if (this.container.showControlBar) {
        menuHtml = this.container.sliderControlHtml.find("." + Medical_Image_Viewer_MENU_CSS);
        menuHtml.hide(100);
        menuHtml.remove();
    }

    modalDialogHtml = this.container.toolbarHtml.find("." + Medical_Image_Viewer_DIALOG_CSS);
    modalDialogHtml.hide(100);
    modalDialogHtml.remove();

    modalDialogBackgroundHtml = this.container.toolbarHtml.find("." + Medical_Image_Viewer_DIALOG_BACKGROUND);
    modalDialogBackgroundHtml.hide(100);
    modalDialogBackgroundHtml.remove();

    // context menu
    if (!skipContext) {
        contextMenuHtml = this.container.viewerHtml.find("." + Medical_Image_Viewer_MENU_CSS);
        if (contextMenuHtml) {
            contextMenuHtml.hide(100);
            contextMenuHtml.remove();
        }
    }
};


//展示或隐藏菜单表单
Medical_Image_Viewer.ui.Toolbar.prototype.isShowingMenus = function () {
    var menuVisible, dialogVisible;

    menuVisible = this.container.toolbarHtml.find("." + Medical_Image_Viewer_MENU_CSS).is(":visible");
    dialogVisible = this.container.toolbarHtml.find("." + Medical_Image_Viewer_DIALOG_CSS).is(":visible");

    return (menuVisible || dialogVisible);
};


//按钮操作行为
Medical_Image_Viewer.ui.Toolbar.prototype.doAction = function (action, file, keepopen) {
    var imageIndex, colorTableName, dialog, atlasName, imageName, folder, ctr, ctrI, ignored;

    if (!keepopen) {
        this.closeAllMenus();
    }

    if (action) {
        if (action.startsWith("ImageButton")) {
            imageIndex = parseInt(action.substr(action.length - 2, 1), 10);
            this.viewer.setCurrentScreenVol(imageIndex);
            this.updateImageButtons();
        } else if (action.startsWith("OpenSurface-")) {
            imageName = action.substring(action.indexOf("-") + 1);
            this.viewer.loadSurface(imageName);
        } else if (action.startsWith("Open-")) {
            imageName = action.substring(action.indexOf("-") + 1);
            this.viewer.loadImage(imageName);
        } else if (action === "OpenImage") {
            this.container.display.drawProgress(0.1, "加载中");
            this.viewer.loadImage(file);
        } else if (action === "OpenDTI") {
            this.container.display.drawProgress(0.1, "加载中");
            this.viewer.loadingDTI = true;
            this.viewer.loadImage(file);
        } else if (action === "OpenSurface") {
            this.container.display.drawProgress(0.1, "加载中");
            this.viewer.loadSurface(file);
        } else if (action === "OpenFolder") {
            folder = [];
            for (ctr = 0; ctr < file.length; ctr += 1) {
                ignored = false;

                for (ctrI = 0; ctrI < Medical_Image_Viewer.Container.ignorePatterns.length; ctrI += 1) {
                    if (Medical_Image_Viewer.Container.ignorePatterns[ctrI].test(file[ctr].name)) {
                        ignored = true;
                    }
                }

                if (ignored) {
                    console.log("忽略文件 " + file[ctr].name);
                } else {
                    folder.push(file[ctr]);
                }
            }

            this.container.display.drawProgress(0.1, "加载中");
            this.viewer.loadImage(folder);
        } else if (action.startsWith("ColorTable")) {
            colorTableName = action.substring(action.indexOf("-") + 1, action.lastIndexOf("-"));
            imageIndex = action.substring(action.lastIndexOf("-") + 1);
            this.viewer.screenVolumes[imageIndex].changeColorTable(this.viewer, colorTableName);
            this.updateImageButtons();
        } else if (action.startsWith("CloseAllImages")) {
            Medical_Image_Viewer.Container.resetViewer(this.container.containerIndex, {});
        } else if (action === "Preferences") {
            dialog = new Medical_Image_Viewer.ui.Dialog(this.container, "查看器首选项", Medical_Image_Viewer.ui.Toolbar.PREFERENCES_DATA,
                this.container.preferences, Medical_Image_Viewer.utilities.ObjectUtils.bind(this.container.preferences,
                    this.container.preferences.updatePreference),
                    Medical_Image_Viewer.utilities.ObjectUtils.bind(this,
                        function() {
                            this.viewer.updateScreenSliceTransforms();
                            this.viewer.drawViewer(false, true);
                        }
                    )
            );
            dialog.showDialog();
        } else if (action === "SurfacePreferences") {
            dialog = new Medical_Image_Viewer.ui.Dialog(this.container, "表面首选项", Medical_Image_Viewer.ui.Toolbar.PREFERENCES_SURFACE_DATA,
                this.container.preferences, Medical_Image_Viewer.utilities.ObjectUtils.bind(this.container.preferences,
                    this.container.preferences.updatePreference),
                Medical_Image_Viewer.utilities.ObjectUtils.bind(this,
                    function() {
                        this.viewer.updateScreenSliceTransforms();
                        this.viewer.surfaceView.updatePreferences();
                        this.viewer.drawViewer(false, true);
                    }
                )
            );
            dialog.showDialog();
        } else if (action === "License") {
            dialog = new Medical_Image_Viewer.ui.Dialog(this.container, "许可证", Medical_Image_Viewer.ui.Toolbar.LICENSE_DATA,
                Medical_Image_Viewer.Container, null, null, null, true);
            dialog.showDialog();
        } else if (action === "KeyboardRef") {
            dialog = new Medical_Image_Viewer.ui.Dialog(this.container, "键盘参考", Medical_Image_Viewer.ui.Toolbar.KEYBOARD_REF_DATA,
                Medical_Image_Viewer.Container, null, null, null, true);
            dialog.showDialog();
        } else if (action === "MouseRef") {
            dialog = new Medical_Image_Viewer.ui.Dialog(this.container, "鼠标参考", Medical_Image_Viewer.ui.Toolbar.MOUSE_REF_DATA,
                Medical_Image_Viewer.Container, null, null, null, true);
            dialog.showDialog();
        } else if (action.startsWith("ImageInfo")) {
            imageIndex = action.substring(action.lastIndexOf("-") + 1);

            if (this.viewer.screenVolumes[imageIndex].volume.numTimepoints > 1) {
                dialog = new Medical_Image_Viewer.ui.Dialog(this.container, "图像信息", Medical_Image_Viewer.ui.Toolbar.SERIES_INFO_DATA,
                    this.viewer, null, null, imageIndex.toString());
            } else {
                dialog = new Medical_Image_Viewer.ui.Dialog(this.container, "图像信息", Medical_Image_Viewer.ui.Toolbar.IMAGE_INFO_DATA,
                    this.viewer, null, null, imageIndex.toString());
            }

            dialog.showDialog();
        } else if (action.startsWith("SurfaceInfo")) {
            imageIndex = action.substring(action.lastIndexOf("-") + 1);

            dialog = new Medical_Image_Viewer.ui.Dialog(this.container, "表面信息", Medical_Image_Viewer.ui.Toolbar.SURFACE_INFO_DATA,
                this.viewer, null, null, imageIndex.toString());
            dialog.showDialog();
        } else if (action.startsWith("ShowHeader")) {
            imageIndex = action.substring(action.lastIndexOf("-") + 1);

            dialog = new Medical_Image_Viewer.ui.Dialog(this.container, "标头信息", Medical_Image_Viewer.ui.Toolbar.HEADER_DATA,
                this.viewer, null, null, imageIndex.toString());

            dialog.showDialog();
        } else if (action.startsWith("SPACE")) {
            this.viewer.toggleWorldSpace();
            this.viewer.drawViewer(true);
        } else if (action.startsWith("AtlasChanged")) {
            atlasName = action.substring(action.lastIndexOf("-") + 1);
            this.viewer.atlas.currentAtlas = atlasName;
            this.viewer.drawViewer(true);
        } else if (action.startsWith("ShowRuler")) {
            if (this.container.preferences.showRuler === "Yes") {
                this.container.preferences.updatePreference("showRuler", "No");
            } else {
                this.container.preferences.updatePreference("showRuler", "Yes");
            }
            this.viewer.drawViewer();
            this.closeAllMenus();
        } else if (action.startsWith("ShowOrientation")) {
            if (this.container.preferences.showOrientation === "Yes") {
                this.container.preferences.updatePreference("showOrientation", "No");
            } else {
                this.container.preferences.updatePreference("showOrientation", "Yes");
            }
            this.viewer.drawViewer();
            this.closeAllMenus();
        } else if (action.startsWith("ShowAnnotation")) {
            if (this.container.preferences.showAnnotation === "Yes") {
                this.container.preferences.updatePreference("showAnnotation", "No");
            } else {
                this.container.preferences.updatePreference("showAnnotation", "Yes");
            }
            this.viewer.drawViewer();
            this.closeAllMenus();
        } else if (action.startsWith("ShowCircle")) {
            if (this.container.preferences.showCircle === "Yes") {
                this.container.preferences.updatePreference("showCircle", "No");
            } else {
                this.container.preferences.updatePreference("showCircle", "Yes");
            }
            this.viewer.drawViewer();
            this.closeAllMenus();
        } else if (action.startsWith("ShowCrosshairs")) {
            if (this.container.preferences.showCrosshairs === "Yes") {
                this.container.preferences.updatePreference("showCrosshairs", "No");
            } else {
                this.container.preferences.updatePreference("showCrosshairs", "Yes");
            }

            this.viewer.drawViewer();
            this.closeAllMenus();
        } else if (action.startsWith("EXPAND")) {
            if (this.container.collapsable) {
                this.container.collapseViewer();
            } else {
                this.container.expandViewer();
            }
        } else if (action.startsWith("OpenInMango")) {
            imageIndex = parseInt(action.substring(action.lastIndexOf("-") + 1), 10);

            if (imageIndex === 0) {
                if (this.container.viewer.volume.urls[0]) {
                    Medical_Image_Viewer.utilities.PlatformUtils.launchCustomProtocol(this.container, Medical_Image_Viewer.utilities.UrlUtils.getAbsoluteUrl(Medical_Image_Viewer_CUSTOM_PROTOCOL,
                        this.container.viewer.volume.urls[0]), this.customProtocolResult);
                }
            } else {
                if (this.container.viewer.screenVolumes[imageIndex].volume.urls[0]) {
                    Medical_Image_Viewer.utilities.PlatformUtils.launchCustomProtocol(this.container, Medical_Image_Viewer.utilities.UrlUtils.getAbsoluteUrl(Medical_Image_Viewer_CUSTOM_PROTOCOL,
                        this.container.viewer.screenVolumes[imageIndex].volume.urls[0]) + "?" +
                    encodeURIComponent("baseimage=" + this.container.viewer.volume.fileName + "&params=o"),
                        this.customProtocolResult);
                }
            }
        } else if (action.startsWith("CloseOverlay")) {
            imageIndex = parseInt(action.substring(action.lastIndexOf("-") + 1), 10);
            this.container.viewer.removeOverlay(imageIndex);
        } else if (action.startsWith("ToggleOverlay")) {
            imageIndex = parseInt(action.substring(action.lastIndexOf("-") + 1), 10);
            this.container.viewer.toggleOverlay(imageIndex);
        } else if (action.startsWith("Context-")) {
            this.container.contextManager.actionPerformed(action.substring(8));
        } else if (action.startsWith("DTI-RGB")) {
            imageIndex = action.substring(action.lastIndexOf("-") + 1);
            this.viewer.screenVolumes[imageIndex].dtiLines = false;
            this.viewer.screenVolumes[imageIndex].dtiColors = true;
            this.viewer.screenVolumes[imageIndex].initDTI();
            this.viewer.drawViewer(true, false);
        } else if (action.startsWith("DTI-LinesColors")) {
            imageIndex = action.substring(action.lastIndexOf("-") + 1);
            this.viewer.screenVolumes[imageIndex].dtiLines = true;
            this.viewer.screenVolumes[imageIndex].dtiColors = true;
            this.viewer.screenVolumes[imageIndex].initDTI();
            this.viewer.drawViewer(true, false);
        } else if (action.startsWith("DTI-Lines")) {
            imageIndex = action.substring(action.lastIndexOf("-") + 1);
            this.viewer.screenVolumes[imageIndex].dtiLines = true;
            this.viewer.screenVolumes[imageIndex].dtiColors = false;
            this.viewer.screenVolumes[imageIndex].initDTI();
            this.viewer.drawViewer(true, false);
        } else if (action.startsWith("DTI-Mod")) {
            imageIndex = action.substring(action.lastIndexOf("-") + 1);
            this.container.display.drawProgress(0.1, "Loading");
            this.viewer.loadingDTIModRef = this.viewer.screenVolumes[imageIndex];
            this.viewer.loadImage(file);
        } else if (action.startsWith("LoadNegatives")) {
            imageIndex = action.substring(action.lastIndexOf("-") + 1);
            this.viewer.addParametric(imageIndex);
        } else if (action.startsWith("ShowSurfacePlanes")) {
            this.viewer.surfaceView.showSurfacePlanes = !this.viewer.surfaceView.showSurfacePlanes;
            this.viewer.surfaceView.updateActivePlanes();

            if (this.container.preferences.showSurfacePlanes === "Yes") {
                this.container.preferences.updatePreference("showSurfacePlanes", "No");
            } else {
                this.container.preferences.updatePreference("showSurfacePlanes", "Yes");
            }
            this.viewer.drawViewer(false, true);
            this.closeAllMenus();
        } else if (action.startsWith("ShowSurfaceCrosshairs")) {
            this.viewer.surfaceView.showSurfaceCrosshairs = !this.viewer.surfaceView.showSurfaceCrosshairs;
            this.viewer.surfaceView.updateActivePlanes();

            if (this.container.preferences.showSurfaceCrosshairs === "Yes") {
                this.container.preferences.updatePreference("showSurfaceCrosshairs", "No");
            } else {
                this.container.preferences.updatePreference("showSurfaceCrosshairs", "Yes");
            }
            this.viewer.drawViewer(false, true);
            this.closeAllMenus();
        } else if (action.startsWith("rotation")) {
            this.viewer.screenVolumes[0].updateTransform();
        } else if (action.startsWith("Rotate About")) {
            this.viewer.screenVolumes[0].rotationAbout = action.substring(0, action.indexOf("-"));
            this.viewer.screenVolumes[0].updateTransform();
            this.viewer.drawViewer(true, false);
        } else if (action.startsWith("ResetTransform")) {
            this.viewer.screenVolumes[0].resetTransform();
            this.viewer.screenVolumes[0].updateTransform();
            this.viewer.drawViewer(true, false);
        }
    }
};




//主要用于处理自定义协议的执行结果。
Medical_Image_Viewer.ui.Toolbar.prototype.customProtocolResult = function (success) {
    if (success === false) { // 由 setTimeout 启动，因此弹出拦截器会干扰 window.open
        if ((Medical_Image_Viewer.utilities.PlatformUtils.browser === "Chrome") || (Medical_Image_Viewer.utilities.PlatformUtils.browser === "Internet Explorer")) {
            alert("Mango似乎未安装。您可以在以下地址下载 Mango：\n\nhttp://ric.uthscsa.edu/mango");
        } else {
            if (Medical_Image_Viewer.utilities.PlatformUtils.ios) {
                if (confirm("iMango似乎未安装。您是否要立即下载？")) {
                    window.open("http://itunes.apple.com/us/app/imango/id423626092");
                }
            } else {
                if (confirm("Mango似乎未安装。您是否要立即下载？")) {
                    window.open("http://ric.uthscsa.edu/mango/mango.html");
                }
            }
        }
    }
};



Medical_Image_Viewer.ui.Toolbar.prototype.updateTitleBar = function (title) {
    var elem = this.container.titlebarHtml[0];

    if (elem) {
        elem.innerHTML = title;
    }

    this.container.titlebarHtml.css({top: (0)});
};



Medical_Image_Viewer.ui.Toolbar.prototype.showImageMenu = function (index) {
    this.viewer.screenVolumes[index].resetDynamicRange();
    this.imageMenus[index].showMenu();
};



Medical_Image_Viewer.ui.Toolbar.prototype.updateImageMenuRange = function (index, min, max) {
    this.imageMenus[index].updateRangeItem(min, max);
};
