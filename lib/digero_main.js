var nw = require('nw.gui');
var fs = require('fs');
var cp = require('child_process');
var vm = require('vm');
var os = require('os');

var nwin = nw.Window.get();

var main_toolbox;
var objects = new Array();
var objects_reserve = new Array();
var arrays = new Array();
var tools_fx = new Array();
var object_events = new Array();
var project_explore = new Array();

var homedir;
var nwjs_file;
var img_folder;
var propex;

var copy_left;
var copy_top;
var copy_type;
var copy_num;

var block_context = -1;
var object_focus;

var click_timer_id;
var click_timer;
var tab_shift_interval;

var tab_select = null;
var tab_select_left = -1;
var tab_select_x = -1;

var element_flag = false;
var outline_flag = false;
var current_form = 0;
var mouse_hover = null;

var paste_x = -1;
var paste_y = -1;
var paste_form = 0;

var select_table;
var col_select;

var ctrl_flag;
var focus_element;

var project_folder;
var system_folder;
var form_file;
var project_file;

var open_type;
var file_object_index;
var file_property_index;

var fonts = "ABeeZee,Arial,Courier New,PressStart,CourierPrime,GlassTTY,GrandNational,LinuxLibertine,Sunflower,RetroGaming";
var cursors = "default,crosshair,pointer,inherit"
var text_align = "center,left,right,justify";
var menu_flag = false;
var menu_close = false;

var scroll_focus = null;

var project_data = {};
project_data.templates = new Array();
project_data.tables = new Array();

var column_select = null;
var column_edit = null;

var select_group = new Array();
var select_index = new Array();

var mouse_x;
var mouse_y;

var window_zoom = 1;

var tooltip;
var tooltip_id;
var toolbar_height = 30;

window.onload = function()
{
	nwin.maximize();

	homedir = os.homedir().replaceAll("\\", "/");
	nwjs_file = process.cwd().replaceAll("\\", "/") + "/nwjs/nwjs-sdk-v0.54.1-win-x64.zip";
	img_folder = process.cwd().replaceAll("\\", "/") + "/img";

	// set background colour of application page
	document.body.style.backgroundColor = "#304361";
	project_folder = process.cwd();
	system_folder = process.cwd();

	form_file = "digero_objects.json";
	project_file = "digero_project.json";

	document.body.addEventListener("mousedown", function(evt) 
	{
		if (menu_flag == false && main_menubar.submenu_show == true)
		{
			main_menubar.submenu_show = false;

			for (var i = 0; i < main_menubar.submenu_divs.length; i++)
				main_menubar.submenu_divs[i].parentElement.removeChild(main_menubar.submenu_divs[i]);

			main_menubar.submenu_divs.length = 0;
			main_menubar.submenu_items.length = 0;
			menu_close = true;
		}
		else
			menu_flag = false;
	}, false);

	document.body.addEventListener("mouseup", function(evt) 
	{
		menu_close = false;
	}, false);

	tooltip = document.createElement("div");
    tooltip.id = "tooltip";
    tooltip.style.position = "absolute";

    tooltip.style.left = "-1000px";
    tooltip.style.top = "0px";

    tooltip.style.backgroundColor = "#c0c0c0";
    tooltip.style.color_select = "#101010";
    tooltip.style.fontSize = "12px";
    tooltip.style.fontFamily = "Arial";

    tooltip.style.paddingTop = "1px";
    tooltip.style.paddingLeft = "1px";
    tooltip.style.paddingRight = "2px";

    tooltip.style.zIndex = 1000;

    document.body.appendChild(tooltip);

	index = object_events.length;
	object_events[index] = {};
	object_events[index].type = "form_starting";
	object_events[index].events = "click,load,mousedown,mousemove,mouseover,mouseup";

	index = object_events.length;
	object_events[index] = {};
	object_events[index].type = "form";
	object_events[index].events = "click,load,mousedown,mousemove,mouseover,mouseup";

	index = object_events.length;
	object_events[index] = {};
	object_events[index].type = "button";
	object_events[index].events = "click,mousedown,mousemove,mouseover,mouseup";

	index = object_events.length;
	object_events[index] = {};
	object_events[index].type = "canvas";
	object_events[index].events = "click,mousedown,mousemove,mouseover,mouseup";

	index = object_events.length;
	object_events[index] = {};
	object_events[index].type = "checkbox";
	object_events[index].events = "click,mousedown,mousemove,mouseover,mouseup";

	index = object_events.length;
	object_events[index] = {};
	object_events[index].type = "console";
	object_events[index].events = "click,enter,mousedown,mousemove,mouseover,mouseup";

	index = object_events.length;
	object_events[index] = {};
	object_events[index].type = "panel";
	object_events[index].events = "click,dblclick,mousedown,mousemove,mouseover,mouseup";

	index = object_events.length;
	object_events[index] = {};
	object_events[index].type = "picturebox";
	object_events[index].events = "click,mousedown,mousemove,mouseover,mouseup";

	index = object_events.length;
	object_events[index] = {};
	object_events[index].type = "pictureframe";
	object_events[index].events = "click,mousedown,mousemove,mouseover,mouseout,mouseup";

	index = object_events.length;
	object_events[index] = {};
	object_events[index].type = "tilemap";
	object_events[index].events = "click,mousedown,mousemove,mouseover,mouseup,tileselect";

	index = object_events.length;
	object_events[index] = {};
	object_events[index].type = "tileselect";
	object_events[index].events = "click,mousedown,mousemove,mouseover,mouseup,tileselect";

	index = object_events.length;
	object_events[index] = {};
	object_events[index].type = "window";
	object_events[index].events = "close,max,min,resize";

	index = object_events.length;
	object_events[index] = {};
	object_events[index].type = "adjuster";
	object_events[index].events = "leftclick,rightclick";

	index = object_events.length;
	object_events[index] = {};
	object_events[index].type = "openfiledialog";
	object_events[index].events = "fileselect";

	index = object_events.length;
	object_events[index] = {};
	object_events[index].type = "savefiledialog";
	object_events[index].events = "fileselect";

	main_statusbar = new statusbar({
		"id": "main_statusbar",
		"height": 24,
		"background": "#007acc"
	});

	main_toolbar = new toolbar({
		"id": "main_toolbar",
		"top": 25,
		"height": 34,
		"background": "#2d2d30",
		"backgroundHover": "#3e3e40",
		"backgroundSub": "#1b1b1c",
		"backgroundClick": "#007acc"
	});

	main_toolbar.add_item("New Project (Ctrl+N)", "img/newbutton.png", function()
		{
			main_project.show();
		});

	main_toolbar.add_item("Save Project (Ctrl+S)", "img/savedisk.png", function()
		{
			save_project();
		});

	main_toolbar.add_item("Open Project (Ctrl+O)", "img/openproject.png", function()
		{
			open_project();
		});

	main_toolbar.add_item("Run Project (F5)", "img/playbutton.png", function()
		{
			run_project();
		});

	main_menubar = new menubar({
		"id": "main_menubar",
		"height": 27,
		"background": "#2d2d30",
		"backgroundHover": "#3e3e40",
		"backgroundSub": "#1b1b1c",
		"fontFamily": "Varta",
		"fontSize": "13px",
		"color": "#eeeeee"
	});

	main_menubar.add_item("File");
	main_menubar.add_subitem("File", "New", "", true, function() {});
	main_menubar.add_subsubitem("File", "New", "Project", "Ctrl+N", false, function()
		{
			main_project.show();
		});
	main_menubar.add_subsubitem("File", "New", "Form", "Ctrl+Shift+N", false, function()
		{
			add_new_form();
		});
	main_menubar.add_subsubitem("File", "New", "Code", "", false, function()
		{
			add_new_code();
		});
	main_menubar.add_subsubitem("File", "New", "Data", "", false, function()
		{
			add_new_data();
		});
	main_menubar.add_subitem("File", "Open Project", "Ctrl+O", false, function()
		{
			open_project();
		});
	main_menubar.add_subitem("File", "Save Project", "Ctrl+S", false, function()
		{
			save_project();
		});

	main_menubar.add_item("Edit");
	main_menubar.add_subitem("Edit", "Cut", "Ctrl+X", false, function()
		{
			delete_current_object();
		});
	main_menubar.add_subitem("Edit", "Copy", "Ctrl+C", false, function()
		{
			copy_current_object();
		});
	main_menubar.add_subitem("Edit", "Paste", "Ctrl+V", false, function()
		{
			paste_object();
		});
	main_menubar.add_subitem("Edit", "Delete", "Del", false, function()
		{
			delete_current_object();
		});

	main_menubar.add_item("Build");
	main_menubar.add_subitem("Build", "Build Project", "", false, function()
		{
			build_output_window();
			parse_code();
		});
	main_menubar.add_subitem("Build", "Run Project", "F5", false, function()
		{
			run_project();
		});

	main_menubar.add_item("Tools");
	main_menubar.add_subitem("Tools", "Function Explorer", "F8", false, function()
		{
			main_functions.go_functions();
			main_functions.show();
		});
	main_menubar.add_subitem("Tools", "Create/Edit Template", "Ctrl+T", false, function()
		{
			main_template.show();
		});

	main_contextmenu = new contextmenu({
		"id": "main_contextmenu",
		"width": 200,
		"background": "#252526",
		"backgroundHover": "#3e3e40",
		"backgroundSelect": "#007acc",
		"fontFamily": "Varta",
		"fontSize": "13px",
		"color": "#eeeeee"
	});

	main_contextmenu.hide();

	main_toolbox = new toolbox({
		"id": "main_toolbox",
		"x": 5,
		"y": 30 + toolbar_height,
		"width": 150,
		"height": 665 - toolbar_height,
		"background": "#252526",
		"background_header": "#007acc"
	});

	main_toolbox.add_tool({
		"name": "Pointer",
		"image": "img/pointer.png"
	});

	main_toolbox.add_tool({
		"name": "Adjuster",
		"image": "img/adjuster.png"
	});

	main_toolbox.add_tool({
		"name": "Button",
		"image": "img/button.png"
	});

	main_toolbox.add_tool({
		"name": "Canvas",
		"image": "img/canvas.png"
	});

	main_toolbox.add_tool({
		"name": "CheckBox",
		"image": "img/checkbox.png"
	});

	main_toolbox.add_tool({
		"name": "Console",
		"image": "img/console.png"
	});

	main_toolbox.add_tool({
		"name": "DataGrid",
		"image": "img/datagrid.png"
	});

	main_toolbox.add_tool({
		"name": "DropDownList",
		"image": "img/dropdownlist.png"
	});

	main_toolbox.add_tool({
		"name": "Label",
		"image": "img/label.png"
	});

	main_toolbox.add_tool({
		"name": "MenuStrip",
		"image": "img/menustrip.png"
	});

	main_toolbox.add_tool({
		"name": "PictureBox",
		"image": "img/picturebox.png"
	});

	main_toolbox.add_tool({
		"name": "PictureFrame",
		"image": "img/pictureframe.png"
	});

	main_toolbox.add_tool({
		"name": "TextBox",
		"image": "img/textbox.png"
	});

	main_toolbox.add_tool({
		"name": "header:Containers"
	});

	main_toolbox.add_tool({
		"name": "Panel",
		"image": "img/panel.png"
	});

	main_toolbox.add_tool({
		"name": "ScrollPanel",
		"image": "img/scrollpanel.png"
	});

	main_toolbox.add_tool({
		"name": "TabControl",
		"image": "img/tabcontrol.png"
	});

	main_toolbox.add_tool({
		"name": "Window",
		"image": "img/window.png"
	});

	main_toolbox.add_tool({
		"name": "header:Tiles"
	});

	main_toolbox.add_tool({
		"name": "TileMap",
		"image": "img/tilemap.png"
	});

	main_toolbox.add_tool({
		"name": "TileSelect",
		"image": "img/tileselect.png"
	});

	main_toolbox.add_tool({
		"name": "header:Dialogs"
	});

	main_toolbox.add_tool({
		"name": "OpenFileDialog",
		"image": "img/openfiledialog.png"
	});

	main_toolbox.add_tool({
		"name": "SaveFileDialog",
		"image": "img/savefiledialog.png"
	});

	/*main_toolbox.add_tool({
		"name": "header:Imports"
	});

	main_toolbox.add_tool({
		"name": "Tabulator",
		"image": "img/tabulator.png"
	});

	main_toolbox.add_tool({
		"name": "Editor",
		"image": "img/aceeditor.png"
	});*/

	main_toolbox.set_tool(0);

	main_formspace = new formspace({
		"id": "main_formspace",
		"x": 160,
		"y": 30 + toolbar_height,
		"width": 820,
		"height": 665 - toolbar_height,
		"background": "#252526"
	});

	//main_formspace.add_tab();
	//main_formspace.add_code(1);
	//main_formspace.set_tab_focus(0);
	main_formspace.set_toolbox(main_toolbox);
	main_formspace.clear_tabs();

	propex= document.createElement("div");
	propex.id = "propex";
	propex.style.position = "absolute";

	propex.style.width = "292px";
	propex.style.height = "865px";

	propex.style.top = (30 + toolbar_height) + "px";
	propex.style.left = "985px";

	propex.style.visibility = "visible";

	document.body.appendChild(propex);

	main_propex = new propex_div();

	main_properties = new properties({
		"id": "main_properties",
		"x": 0,
		"y": 0,
		"width": 292,
		"height": 400,
		"background": "#252526",
		"background_header": "#007acc",
		"div": propex
	});

	main_explore = new explore({
		"id": "main_explore",
		"x": 0,
		"y": 405,
		"width": 292,
		"height": 400,
		"background": "#252526",
		"background_header": "#007acc",
		"div": propex
	});

	main_explore.go_project();

	main_functions = new functions_dialog({
		"id": "main_functions",
		"x": 5,
		"y": 5,
		"width": 600,
		"height": 650,
		"background": "#f0f0f0",
		"background_header": "#ffffff"	
	});

	main_template = new template_dialog({
		"id": "main_template",
		"x": 5,
		"y": 5,
		"width": 427,
		"height": 350,
		"background": "#f0f0f0",
		"background_header": "#ffffff"	
	});

	main_project = new project_dialog({
		"id": "project_dialog",
		"x": 5,
		"y": 5,
		"width": 700,
		"height": 500,
		"background": "#252525",
		"background_header": "#ffffff"	
	});

	resize_tools = new resize_div({
		"id": "resize_tools",
		"x": 155,
		"y": 30 + toolbar_height,
		"width": 5,
		"height": window.innerHeight - 60,
		"element1": main_toolbox,
		"element2": main_formspace,
		"dir": "horizontal"
	});

	resize_propex = new resize_div({
		"id": "resize_propex",
		"x": 980,
		"y": 30 + toolbar_height,
		"width": 5,
		"height": window.innerHeight - 60,
		"element1": main_formspace,
		"element2": main_propex,
		"dir": "horizontal"
	});

	resize_properties = new resize_div({
		"id": "resize_properties",
		"x": 985,
		"y": 430 + toolbar_height,
		"width": 292,
		"height": 5,
		"element1": main_properties,
		"element2": main_explore,
		"dir": "vertical"
	});

	//chrome.windows.create({url: "digero_runtime.html", type: "popup"});

	tools_fx[0] = {};
	tools_fx[0].name = "Pointer";

	tools_fx[0].create = function(outline_div)
	{
		if (mouse_hover == null)
			return;

		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		if (width > 4 && height > 4)
		{
			outline_div.parentElement.removeChild(outline_div);
			main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

			outline_div.style.width = "0px";
			outline_div.style.height = "0px";

			outline_div.style.left = "-100px";
			outline_div.style.top = "-100px";

			var parent_name = mouse_hover;
			select_group.length = 0;

			for (var i = 0; i < objects.length; i++)
			{
				var this_x = objects[i].left;
				var this_y = objects[i].top;

				var this_width = objects[i].width;
				var this_height = objects[i].height;

				if (this_x >= x && (this_x + this_width) <= (x + width) && this_y >= y && (this_y + this_height) <= (y + height))
				{
					var index = select_group.length;
					select_group[index] = objects[i];
					select_index[index] = i;
				}
			}

			var this_form = get_object(parent_name).form;
			main_formspace.set_outline_focus("#group_" + this_form);
		}
	}

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "Adjuster";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "adjuster")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("Adjuster" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "Adjuster" + (counter + 1);
		objects[obj_index].type = "adjuster";
		objects[obj_index].element_type = "div";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height + 1;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		objects[obj_index].properties = new Array();

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "Adjuster" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "transparent";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "none";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = width;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "LeftArrow";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "LeftArrow.Cursor";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = cursors;
		objects[obj_index].properties[index].value = "default";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "LeftArrow.Image";
		objects[obj_index].properties[index].type = "file";
		objects[obj_index].properties[index].ext = ".*";
		objects[obj_index].properties[index].value = "img/adjuster_left.png";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "RightArrow";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "RightArrow.Cursor";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = cursors;
		objects[obj_index].properties[index].value = "default";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "RightArrow.Image";
		objects[obj_index].properties[index].type = "file";
		objects[obj_index].properties[index].ext = ".*";
		objects[obj_index].properties[index].value = "img/adjuster_right.png";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box.BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#ffffff";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box.BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box.BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box.BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "solid";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box.BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box.FontColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box.FontFamily";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = fonts;
		objects[obj_index].properties[index].value = "ABeeZee";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box.FontSize";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "12px";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box.Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box.LeftAdjust";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box.PaddingBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box.PaddingLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box.PaddingRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box.PaddingTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box.Text";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box.TextAlign";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "left,right,center,justify";
		objects[obj_index].properties[index].value = "left";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box.Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = width - 24;

		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "Adjuster" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = width + "px";
		objects[obj_index].element.style.height = height + "px";

		objects[obj_index].element.style.padding = "0px";
		objects[obj_index].element.style.margin = "0px";

		objects[obj_index].element.style.borderWidth = "1px";

		objects[obj_index].element_sub1 = document.createElement("img");
		objects[obj_index].element_sub1.id = "Adjuster" + (counter + 1) + "_sub1";
		objects[obj_index].element_sub1.style.position = "absolute";

		objects[obj_index].element_sub1.style.top = "0px";
		objects[obj_index].element_sub1.style.left = "0px";
		objects[obj_index].element_sub1.src = "img/adjuster_left.png";

		objects[obj_index].element_sub1.addEventListener("load", function (this_height)
		{
			return function(evt)
			{
				this.style.top = Math.floor((this_height - this.height) / 2) + "px";
			}
		} (height + 1), false);		

		objects[obj_index].element_sub2 = document.createElement("div");
		objects[obj_index].element_sub2.id = "Adjuster" + (counter + 1) + "_sub2";
		objects[obj_index].element_sub2.style.position = "absolute";

		objects[obj_index].element_sub2.style.top = "0px";
		objects[obj_index].element_sub2.style.left = "11px";

		objects[obj_index].element_sub2.style.width = (width - 24) + "px";
		objects[obj_index].element_sub2.style.height = height + "px";

		objects[obj_index].element_sub2.style.fontFamily = "ABeeZee";
		objects[obj_index].element_sub2.style.fontSize = "12px";

		objects[obj_index].element_sub2.style.backgroundColor = "#ffffff";
		objects[obj_index].element_sub2.style.borderStyle = "solid";
		objects[obj_index].element_sub2.style.borderWidth = "1px";

		objects[obj_index].element_sub2.innerHTML = "0";

		objects[obj_index].element_sub3 = document.createElement("img");
		objects[obj_index].element_sub3.id = "Adjuster" + (counter + 1) + "_sub3";
		objects[obj_index].element_sub3.style.position = "absolute";

		objects[obj_index].element_sub3.style.top = "0px";
		objects[obj_index].element_sub3.style.left = "0px";
		objects[obj_index].element_sub3.src = "img/adjuster_right.png";

		objects[obj_index].element_sub3.addEventListener("load", function (this_height, this_width)
		{
			return function(evt)
			{
				this.style.left = (this_width - this.width) + "px";
				this.style.top = Math.floor((this_height - this.height) / 2) + "px";
			}
		} (height + 1, width), false);	

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);
		objects[obj_index].element.appendChild(objects[obj_index].element_sub1);
		objects[obj_index].element.appendChild(objects[obj_index].element_sub2);
		objects[obj_index].element.appendChild(objects[obj_index].element_sub3);

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		main_formspace.set_outline_focus("Adjuster" + (counter + 1));

		main_toolbox.set_tool(0);
	}

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "Button";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "button")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("Button" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "Button" + (counter + 1);
		objects[obj_index].type = "button";
		objects[obj_index].element_type = "div";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		objects[obj_index].properties = new Array();

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "Button" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#e1e1e1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "outset";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Cursor";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = cursors;
		objects[obj_index].properties[index].value = "default";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Down";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FontColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FontFamily";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = fonts;
		objects[obj_index].properties[index].value = "ABeeZee";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FontSize";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "12px";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "LineHeight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Opacity";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 1;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Sticky";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Text";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "Button" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "TextAlign";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = text_align;
		objects[obj_index].properties[index].value = "center";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties.value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = width;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseDown";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseDown.BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "inset";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseDown.LineHeight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseOut";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseOut.BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#e1e1e1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseOver";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseOver.BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#e1e1e1";

		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "Button" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";
		objects[obj_index].element.style.display = "inline-block";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = width + "px";
		objects[obj_index].element.style.height = height + "px";

		objects[obj_index].element.style.backgroundColor = "#e1e1e1";

		objects[obj_index].element.style.borderStyle = "outset";
		objects[obj_index].element.style.borderWidth = "1px";
		objects[obj_index].element.style.padding = "0px";
		objects[obj_index].element.style.margin = "0px";

		objects[obj_index].element.style.lineHeight = height + "px";
		objects[obj_index].element.style.textAlign = "center";

		objects[obj_index].element.style.fontFamily = "ABeeZee";
		objects[obj_index].element.style.fontSize = "12px";

		objects[obj_index].element.innerHTML = "Button" + (counter + 1);

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		add_object_fxs(objects[obj_index]);

		main_formspace.set_outline_focus("Button" + (counter + 1));

		main_toolbox.set_tool(0);
	}

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "Canvas";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "canvas")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("Canvas" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "Canvas" + (counter + 1);
		objects[obj_index].type = "canvas";
		objects[obj_index].element_type = "div";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = true;
		objects[obj_index].container_suffix = "";

		objects[obj_index].properties = new Array();

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "Canvas" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "transparent";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "none";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = width;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "Canvas" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = width + "px";
		objects[obj_index].element.style.height = height + "px";

		objects[obj_index].element.style.borderWidth = "1px";	
		objects[obj_index].element.style.borderStyle = "dashed";

		objects[obj_index].element.style.padding = "0px";
		objects[obj_index].element.style.margin = "0px";

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		objects[obj_index].element_canvas = document.createElement("canvas");
		objects[obj_index].element_canvas.id = "Canvas" + (counter + 1) + "_canvas";
		objects[obj_index].element_canvas.style.position = "absolute";

		objects[obj_index].element_canvas.style.top = "0px";
		objects[obj_index].element_canvas.style.left = "0px";

		objects[obj_index].element_canvas.style.width = width + "px";
		objects[obj_index].element_canvas.style.height = height + "px";

		objects[obj_index].element.appendChild(objects[obj_index].element_canvas);

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				var outline_id = main_formspace.outlines_focus[get_object(this.id).form].id;

				if (is_child(this.id, outline_id) == false)
				{
					main_formspace.set_outline_focus(this.id);
					element_flag = true;
				}
			}
		}, false);

		objects[obj_index].element.addEventListener("mousemove", function(evt)
		{
			mouse_hover = this.id;
		}, false);

		objects[obj_index].element.addEventListener("mouseup", function (this_object)
		{
			return function(evt)
			{
				var this_index = this_object.form;
				var rect = this.getBoundingClientRect();
				paste_x = evt.clientX - rect.left;
				paste_y = evt.clientY - rect.top;

				paste_form = index;
				console.log(paste_x + " " + paste_y + " " + paste_form);
			}
		} (objects[obj_index]), false);


		main_formspace.set_outline_focus("Canvas" + (counter + 1));

		main_toolbox.set_tool(0);
	}

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "CheckBox";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "checkbox")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("Label" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "CheckBox" + (counter + 1);
		objects[obj_index].type = "checkbox";
		objects[obj_index].element_type = "div";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		objects[obj_index].properties = new Array();

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "CheckBox" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "transparent";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "none";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Check";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FontFamily";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = fonts;
		objects[obj_index].properties[index].value = "ABeeZee";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FontSize";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "12px";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Text";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "CheckBox" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = width;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Checked";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Checked.Image";
		objects[obj_index].properties[index].type = "file";
		objects[obj_index].properties[index].ext = ".*";
		objects[obj_index].properties[index].value = "img/checkbox_on.png";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Unchecked";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Unchecked.Image";
		objects[obj_index].properties[index].type = "file";
		objects[obj_index].properties[index].ext = ".*";
		objects[obj_index].properties[index].value = "img/checkbox_off.png";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box.Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box.Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Label";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Label.Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 20;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Label.Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 1;

		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "CheckBox" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = width + "px";
		objects[obj_index].element.style.height = height + "px";

		objects[obj_index].element.style.padding = "0px";
		objects[obj_index].element.style.margin = "0px";

		objects[obj_index].element.style.borderWidth = "1px";

		objects[obj_index].element_sub1 = document.createElement("img");
		objects[obj_index].element_sub1.id = "CheckBox" + (counter + 1) + "_sub1";
		objects[obj_index].element_sub1.style.position = "absolute";

		objects[obj_index].element_sub1.style.top = "0px";
		objects[obj_index].element_sub1.style.left = "0px";
		objects[obj_index].element_sub1.src = "img/checkbox_off.png";

		objects[obj_index].element_sub2 = document.createElement("div");
		objects[obj_index].element_sub2.id = "CheckBox" + (counter + 1) + "_sub2";
		objects[obj_index].element_sub2.style.position = "absolute";

		objects[obj_index].element_sub2.style.top = "1px";
		objects[obj_index].element_sub2.style.left = "20px";

		objects[obj_index].element_sub2.style.fontFamily = "ABeeZee";
		objects[obj_index].element_sub2.style.fontSize = "12px";

		objects[obj_index].element_sub2.innerHTML = "CheckBox" + (counter + 1);

		if (parseInt(document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).style.left) > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			var sub_x = parseInt(document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).style.left);

			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) - sub_x) + "px";
			objects[obj_index].left -= sub_x;
		}

		if (parseInt(document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).style.top) > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			var sub_y = parseInt(document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).style.top);

			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) - sub_y) + "px";
			objects[obj_index].top -= sub_y;
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);
		objects[obj_index].element.appendChild(objects[obj_index].element_sub1);
		objects[obj_index].element.appendChild(objects[obj_index].element_sub2);

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		main_formspace.set_outline_focus("CheckBox" + (counter + 1));

		main_toolbox.set_tool(0);
	}


	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "Console";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "console")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("Console" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "Console" + (counter + 1);
		objects[obj_index].type = "console";
		objects[obj_index].element_type = "div";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		objects[obj_index].properties = new Array();

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "Console" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BackgroundColor";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "rgba(32, 32, 32, 0.7)";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "none";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FontColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#22ff22";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FontFamily";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = fonts;
		objects[obj_index].properties[index].value = "RetroGaming";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FontSize";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "14px";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "GradientWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "LineHeight";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "normal";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Opacity";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 1;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Options";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "OverflowY";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,scroll,auto";
		objects[obj_index].properties[index].value = "hidden";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 5;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 5;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 5;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 5;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Prompt";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = ">";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Scroll";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "up,down";
		objects[obj_index].properties[index].value = "up";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Text";
		objects[obj_index].properties[index].type = "";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Value";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = width;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "Console" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = width + "px";
		objects[obj_index].element.style.height = height + "px";

		objects[obj_index].element.style.backgroundColor = get_property(obj_index, "BackgroundColor").value;

		objects[obj_index].element.style.fontFamily = get_property(obj_index, "FontFamily").value;
		objects[obj_index].element.style.fontSize = get_property(obj_index, "FontSize").value;
		objects[obj_index].element.style.color = get_property(obj_index, "FontColor").value;

		objects[obj_index].element.style.paddingLeft = parseInt(get_property(obj_index, "PaddingLeft").value) + "px";
		objects[obj_index].element.style.paddingRight = parseInt(get_property(obj_index, "PaddingRight").value) + "px";
		objects[obj_index].element.style.paddingTop = parseInt(get_property(obj_index, "PaddingTop").value) + "px";
		objects[obj_index].element.style.paddingBottom = parseInt(get_property(obj_index, "PaddingBottom").value) + "px";

		objects[obj_index].element.style.margin = "0px";
		objects[obj_index].element.style.overflowY = get_property(obj_index, "OverflowY").value;

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		main_formspace.set_outline_focus("Console" + (counter + 1));

		main_toolbox.set_tool(0);
	}


	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "DataGrid";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "datagrid")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("DataGrid" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "DataGrid" + (counter + 1);
		objects[obj_index].type = "datagrid";
		objects[obj_index].element_type = "div";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;
		objects[obj_index].expand_menu = true;

		objects[obj_index].properties = new Array();

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "DataGrid" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#ababab";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "solid";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ElementHeight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ElementWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FlipHorizontal";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "HorizontalAlign";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "left,center,right";
		objects[obj_index].properties[index].value = "center";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Image";
		objects[obj_index].properties[index].type = "file";
		objects[obj_index].properties[index].ext = ".*";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Opacity";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "100%";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Rotation";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Scale";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "true";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "VerticalAlign";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "left,center,right";
		objects[obj_index].properties[index].value = "center";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = width;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseOut";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseOut.BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "transparent";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseOver";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseOver.BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "transparent";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip.Tooltip";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip.BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip.FontColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#ffffff";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip.FontFamily";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = fonts;
		objects[obj_index].properties[index].value = "ABeeZee";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip.FontSize";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "12px";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip.Text";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "DataGrid" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = width + "px";
		objects[obj_index].element.style.height = height + "px";

		objects[obj_index].element.style.backgroundColor = "#ababab";	

		objects[obj_index].element.style.borderWidth = "1px";	
		objects[obj_index].element.style.borderStyle = "solid";

		objects[obj_index].element.style.padding = "0px";
		objects[obj_index].element.style.margin = "0px";

		objects[obj_index].element.style.fontFamily = "ABeeZee";
		objects[obj_index].element.style.fontSize = "12px";

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		main_formspace.set_outline_focus("DataGrid" + (counter + 1));
		main_formspace.open_context_menu("DataGrid" + (counter + 1), 200);
		block_context = 1;

		main_toolbox.set_tool(0);
	}
	
	tools_fx[index].expand = function(index)
	{
		main_formspace.open_context_menu(objects[index].name, 200);
		block_context = 0;
	}


	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "DropDownList";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "dropdownlist")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("DropDownList" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "DropDownList" + (counter + 1);
		objects[obj_index].type = "dropdownlist";
		objects[obj_index].element_type = "select";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		objects[obj_index].properties = new Array();

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "DropDownList" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#ffffff";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "solid";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FontColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FontFamily";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = fonts;
		objects[obj_index].properties[index].value = "ABeeZee";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FontSize";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "12px";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Opacity";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 1;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Options";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Value";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = width;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		objects[obj_index].element = document.createElement("select");
		objects[obj_index].element.id = "DropDownList" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = width + "px";
		objects[obj_index].element.style.height = height + "px";

		objects[obj_index].element.style.borderWidth = "1px";
		objects[obj_index].element.style.padding = "0px";
		objects[obj_index].element.style.margin = "0px";

		objects[obj_index].element.style.fontFamily = "ABeeZee";
		objects[obj_index].element.style.fontSize = "12px";

		objects[obj_index].element.innerHTML = "";

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		main_formspace.set_outline_focus("DropDownList" + (counter + 1));

		main_toolbox.set_tool(0);
	}

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "Label";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "label")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("Label" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "Label" + (counter + 1);
		objects[obj_index].type = "label";
		objects[obj_index].element_type = "div";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		objects[obj_index].properties = new Array();

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "Label" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "transparent";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "none";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Cursor";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = cursors;
		objects[obj_index].properties[index].value = "default";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FontColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FontFamily";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = fonts;
		objects[obj_index].properties[index].value = "ABeeZee";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FontSize";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "12px";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Image";
		objects[obj_index].properties[index].type = "file";
		objects[obj_index].properties[index].ext = ".*";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "LineHeight";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "normal";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "OverflowX";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,scroll,auto";
		objects[obj_index].properties[index].value = "hidden";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "OverflowY";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,scroll,auto";
		objects[obj_index].properties[index].value = "hidden";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Text";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "Label" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "TextAlign";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "left,right,center,justify";
		objects[obj_index].properties[index].value = "left";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = width;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "Label" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = width + "px";
		objects[obj_index].element.style.height = height + "px";

		objects[obj_index].element.style.borderWidth = "1px";
		objects[obj_index].element.style.padding = "0px";
		objects[obj_index].element.style.margin = "0px";

		objects[obj_index].element.style.fontFamily = "ABeeZee";
		objects[obj_index].element.style.fontSize = "12px";

		objects[obj_index].element.innerHTML = "Label" + (counter + 1);

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		main_formspace.set_outline_focus("Label" + (counter + 1));

		main_toolbox.set_tool(0);
	}

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "MenuStrip";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "label")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("MenuStrip" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "MenuStrip" + (counter + 1);
		objects[obj_index].type = "menustrip";
		objects[obj_index].element_type = "div";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		objects[obj_index].properties = new Array();

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "MenuStrip" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "transparent";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "none";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Cursor";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = cursors;
		objects[obj_index].properties[index].value = "default";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FontColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FontFamily";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = fonts;
		objects[obj_index].properties[index].value = "ABeeZee";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FontSize";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "12px";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Image";
		objects[obj_index].properties[index].type = "file";
		objects[obj_index].properties[index].ext = ".*";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "LineHeight";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "normal";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "OverflowX";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,scroll,auto";
		objects[obj_index].properties[index].value = "hidden";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "OverflowY";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,scroll,auto";
		objects[obj_index].properties[index].value = "hidden";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Text";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "MenuStrip" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "TextAlign";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "left,right,center,justify";
		objects[obj_index].properties[index].value = "left";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = width;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "MenuStrip" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = width + "px";
		objects[obj_index].element.style.height = height + "px";

		objects[obj_index].element.style.borderWidth = "1px";
		objects[obj_index].element.style.padding = "0px";
		objects[obj_index].element.style.margin = "0px";

		objects[obj_index].element.style.fontFamily = "ABeeZee";
		objects[obj_index].element.style.fontSize = "12px";

		objects[obj_index].element.innerHTML = "MenuStrip" + (counter + 1);

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		objects[obj_index].main_menubar = new build_menubar({
			"id": "MenuStrip" + (counter + 1) + "_main_menubar",
			"height": 27,
			"background": "#bbbbbb",
			"backgroundHover": "#aaaaaa",
			"backgroundSub": "#b1b1b1",
			"borderSub": "#b0b0b0",
			"div": parent_name,
			"fontFamily": "Varta",
			"fontSize": "13px",
			"color": "#202020"
		});

		objects[obj_index].main_menubar.add_text_item();

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		main_formspace.set_outline_focus("MenuStrip" + (counter + 1));

		main_toolbox.set_tool(0);
	}

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "PictureBox";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "picturebox")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("PictureBox" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "PictureBox" + (counter + 1);
		objects[obj_index].type = "picturebox";
		objects[obj_index].element_type = "div";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		objects[obj_index].properties = new Array();

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "PictureBox" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "transparent";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "none";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ElementHeight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ElementWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FlipHorizontal";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "HorizontalAlign";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "left,center,right";
		objects[obj_index].properties[index].value = "center";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Image";
		objects[obj_index].properties[index].type = "file";
		objects[obj_index].properties[index].ext = ".*";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Opacity";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "100%";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Rotation";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Scale";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "true";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "VerticalAlign";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "left,center,right";
		objects[obj_index].properties[index].value = "center";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = width;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseOut";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseOut.BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "transparent";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseOver";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseOver.BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "transparent";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip.Tooltip";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip.BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip.FontColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#ffffff";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip.FontFamily";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = fonts;
		objects[obj_index].properties[index].value = "ABeeZee";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip.FontSize";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "12px";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip.Text";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "PictureBox" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = width + "px";
		objects[obj_index].element.style.height = height + "px";

		objects[obj_index].element.style.borderWidth = "1px";	
		objects[obj_index].element.style.borderStyle = "dashed";

		objects[obj_index].element.style.padding = "0px";
		objects[obj_index].element.style.margin = "0px";

		objects[obj_index].element.style.fontFamily = "ABeeZee";
		objects[obj_index].element.style.fontSize = "12px";

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		main_formspace.set_outline_focus("PictureBox" + (counter + 1));

		main_toolbox.set_tool(0);
	}


	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "PictureFrame";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "pictureframe")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("PictureFrame" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "PictureFrame" + (counter + 1);
		objects[obj_index].type = "pictureframe";
		objects[obj_index].element_type = "div";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		objects[obj_index].properties = new Array();

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "PictureFrame" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "AnimateInterval";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "transparent";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "none";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Filter";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FlipHorizontal";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Frame";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Frames";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 1;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Image";
		objects[obj_index].properties[index].type = "file";
		objects[obj_index].properties[index].ext = ".*";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MoveX";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MoveY";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Opacity";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "100%";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Row";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Rows";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 1;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Trim";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = width;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseOut";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseOut.BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "transparent";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseOver";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseOver.BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "transparent";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip.Tooltip";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip.BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip.FontColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#ffffff";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip.FontFamily";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = fonts;
		objects[obj_index].properties[index].value = "ABeeZee";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip.FontSize";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "12px";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tooltip.Text";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "PictureFrame" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = width + "px";
		objects[obj_index].element.style.height = height + "px";

		objects[obj_index].element.style.borderWidth = "1px";	
		objects[obj_index].element.style.borderStyle = "dashed";

		objects[obj_index].element.style.padding = "0px";
		objects[obj_index].element.style.margin = "0px";

		objects[obj_index].element.style.fontFamily = "ABeeZee";
		objects[obj_index].element.style.fontSize = "12px";

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		main_formspace.set_outline_focus("PictureFrame" + (counter + 1));

		main_toolbox.set_tool(0);
	}

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "TextBox";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "textbox")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("Text" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 2;
			y -= 2;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "Text" + (counter + 1);
		objects[obj_index].type = "textbox";
		objects[obj_index].element_type = "input";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		objects[obj_index].properties = new Array();

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "Text" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#ffffff";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "inset";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FontColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FontFamily";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = fonts;
		objects[obj_index].properties[index].value = "ABeeZee";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "FontSize";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "12px";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Text";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = width;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		objects[obj_index].element = document.createElement("input");
		objects[obj_index].element.id = "Text" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = width + "px";
		objects[obj_index].element.style.height = height + "px";

		objects[obj_index].element.style.borderStyle = "inset";
		objects[obj_index].element.style.borderWidth = "1px";
		objects[obj_index].element.style.padding = "0px";
		objects[obj_index].element.style.margin = "0px";

		objects[obj_index].element.style.fontFamily = "ABeeZee";
		objects[obj_index].element.style.fontSize = "12px";

		//objects[obj_index].element.disabled = true;
		//objects[obj_index].element.value = "Text" + (counter + 1);

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		main_formspace.set_outline_focus("Text" + (counter + 1));

		main_toolbox.set_tool(0);
	}

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "Panel";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "panel")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("Panel" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "Panel" + (counter + 1);
		objects[obj_index].type = "panel";
		objects[obj_index].element_type = "div";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = true;
		objects[obj_index].container_suffix = "";

		objects[obj_index].properties = new Array();

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "Panel" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "transparent";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "none";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = width;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "Panel" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = width + "px";
		objects[obj_index].element.style.height = height + "px";

		objects[obj_index].element.style.borderWidth = "1px";	
		objects[obj_index].element.style.borderStyle = "dashed";

		objects[obj_index].element.style.padding = "0px";
		objects[obj_index].element.style.margin = "0px";

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				var outline_id = main_formspace.outlines_focus[main_formspace.get_form_num_index(get_object(this.id).form)].id;

				if (is_child(this.id, outline_id) == false)
				{
					main_formspace.set_outline_focus(this.id);
					element_flag = true;
				}
			}
		}, false);

		objects[obj_index].element.addEventListener("mousemove", function(evt)
		{
			mouse_hover = this.id;
		}, false);

		/*objects[obj_index].element.addEventListener("mouseup", function (this_object)
		{
			return function(evt)
			{
				var this_index = this_object.form;
				var rect = this.getBoundingClientRect();
				paste_x = evt.clientX - rect.left;
				paste_y = evt.clientY - rect.top;

				paste_form = index;
				console.log(paste_x + " " + paste_y + " " + paste_form);
			}
		} (objects[obj_index]), false);*/


		main_formspace.set_outline_focus("Panel" + (counter + 1));

		main_toolbox.set_tool(0);
	}

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "ScrollPanel";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "scrollpanel")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("ScrollPanel" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "ScrollPanel" + (counter + 1);
		objects[obj_index].type = "scrollpanel";
		objects[obj_index].element_type = "div";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = true;
		objects[obj_index].container_suffix = "_panel";

		objects[obj_index].properties = new Array();

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "ScrollPanel" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "transparent";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "none";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "OverflowX";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,scroll,auto";
		objects[obj_index].properties[index].value = "hidden";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "OverflowY";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,scroll,auto";
		objects[obj_index].properties[index].value = "scroll";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PanelHeight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PanelWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = width;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ScrollLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ScrollTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = width;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "ScrollPanel" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = width + "px";
		objects[obj_index].element.style.height = height + "px";

		objects[obj_index].element.style.borderWidth = "1px";	
		objects[obj_index].element.style.borderStyle = "dashed";

		objects[obj_index].element.style.padding = "0px";
		objects[obj_index].element.style.margin = "0px";

		objects[obj_index].element.style.overflowX = "hidden";
		objects[obj_index].element.style.overflowY = "scroll";

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		objects[obj_index].element_panel = document.createElement("div");
		objects[obj_index].element_panel.id = "ScrollPanel" + (counter + 1) + "_panel";
		objects[obj_index].element_panel.style.position = "absolute";

		objects[obj_index].element_panel.style.top = "0px";
		objects[obj_index].element_panel.style.left = "0px";

		objects[obj_index].element_panel.style.width = width + "px";
		objects[obj_index].element_panel.style.height = height + "px";

		objects[obj_index].element.appendChild(objects[obj_index].element_panel);

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				var outline_id = main_formspace.outlines_focus[main_formspace.get_form_num_index(get_object(this.id).form)].id;

				if (is_child(this.id, outline_id) == false)
				{
					main_formspace.set_outline_focus(this.id);
					element_flag = true;
				}
			}
		}, false);

		objects[obj_index].element.addEventListener("mousemove", function(evt)
		{
			mouse_hover = this.id;
		}, false);

		objects[obj_index].element.addEventListener("scroll", function(evt)
		{
			main_formspace.set_outline_focus(this.parentElement.id);
		}, false);

		/*objects[obj_index].element.addEventListener("mouseup", function (this_object)
		{
			return function(evt)
			{
				var this_index = this_object.form;
				var rect = this.getBoundingClientRect();
				paste_x = evt.clientX - rect.left;
				paste_y = evt.clientY - rect.top;

				paste_form = index;
				console.log(paste_x + " " + paste_y + " " + paste_form);
			}
		} (objects[obj_index]), false);*/


		main_formspace.set_outline_focus("ScrollPanel" + (counter + 1));

		main_toolbox.set_tool(0);
	}

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "TabControl";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "TabControl")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("TabControl" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "TabControl" + (counter + 1);
		objects[obj_index].type = "tabcontrol";
		objects[obj_index].element_type = "div";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = true;
		objects[obj_index].container_suffix = "_panel_0";

		objects[obj_index].properties = new Array();

		var tab_width = 100;
		var tab_height = 30;

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "TabControl" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#b0b0b0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#818181";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "solid";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1px";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = width;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tabs";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tabs.Alignment";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "top, right, bottom, left";
		objects[obj_index].properties[index].value = "top";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tabs.Amount";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tabs.BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#b0b0b0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tabs.BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#818181";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tabs.BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tabs.BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "solid";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tabs.BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1px";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tabs.FontColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tabs.FontFamily";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = fonts;
		objects[obj_index].properties[index].value = "ABeeZee";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tabs.FontSize";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "14px";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tabs.Gap";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 3;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tabs.Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = tab_height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tabs.Names";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "Tab1,Tab2";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tabs.PaddingLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tabs.PaddingTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tabs.Select";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tabs.SelectColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#007acc";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tabs.Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = tab_width;

		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "TabControl" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = width + "px";
		objects[obj_index].element.style.height = height + "px";

		objects[obj_index].element.style.borderWidth = "0px";	
		objects[obj_index].element.style.borderStyle = "none";

		objects[obj_index].element.style.padding = "0px";
		objects[obj_index].element.style.margin = "0px";

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		var tab_panel = new Array();
		var tab_tab = new Array();
		var tab_total = parseInt(get_property(obj_index, "Tabs.Amount").value);

		for (i = 0; i < tab_total; i++)
		{
			tab_panel[i] = document.createElement("div");
			tab_panel[i].id = objects[obj_index].name + "_panel_" + i;
			tab_panel[i].style.position = "absolute";

			tab_panel[i].style.top = tab_height + "px";
			tab_panel[i].style.left = "0px";

			tab_panel[i].style.zIndex = parseInt(get_property(obj_index, "ZIndex").value);

			tab_panel[i].style.width = width + "px";
			tab_panel[i].style.height = (height - tab_height - 1) + "px";

			tab_panel[i].style.backgroundColor = get_property(obj_index, "BackgroundColor").value;

			tab_panel[i].style.borderColor = get_property(obj_index, "BorderColor").value;
			tab_panel[i].style.borderRadius = get_property(obj_index, "BorderRadius").value;
			tab_panel[i].style.borderStyle = get_property(obj_index, "BorderStyle").value;
			tab_panel[i].style.borderWidth = get_property(obj_index, "BorderWidth").value;

			if (i == 0)
				tab_panel[i].style.visibility = "visible";
			else
				tab_panel[i].style.visibility = "hidden";

			objects[obj_index].element.appendChild(tab_panel[i]);

			tab_tab[i] = document.createElement("div");
			tab_tab[i].id = objects[obj_index].name + "_tab_" + i;
			tab_tab[i].style.position = "absolute";

			tab_tab[i].style.top = "0px";
			tab_tab[i].style.left = ((parseInt(get_property(obj_index, "Tabs.Width").value) + parseInt(get_property(obj_index, "Tabs.Gap").value)) * i) + "px";

			tab_tab[i].style.zIndex = parseInt(get_property(obj_index, "ZIndex").value) + 1;

			tab_tab[i].style.width = parseInt(get_property(obj_index, "Tabs.Width").value) + "px";
			tab_tab[i].style.height = parseInt(get_property(obj_index, "Tabs.Height").value) - 1 + "px";

			tab_tab[i].style.backgroundColor = get_property(obj_index, "Tabs.BackgroundColor").value;

			tab_tab[i].style.borderColor = get_property(obj_index, "Tabs.BorderColor").value;
			tab_tab[i].style.borderRadius = get_property(obj_index, "Tabs.BorderRadius").value;
			tab_tab[i].style.borderStyle = get_property(obj_index, "Tabs.BorderStyle").value;
			tab_tab[i].style.borderWidth = get_property(obj_index, "Tabs.BorderWidth").value;

			tab_tab[i].style.color = get_property(obj_index, "Tabs.FontColor").value;
			tab_tab[i].style.fontFamily = get_property(obj_index, "Tabs.FontFamily").value;
			tab_tab[i].style.fontSize = get_property(obj_index, "Tabs.FontSize").value;

			var tab_name = get_property(obj_index, "Tabs.Names").value.split(",")[i];
			tab_tab[i].innerHTML = tab_name;

			if (i == parseInt(get_property(obj_index, "Tabs.Select").value))
			{
				tab_tab[i].style.borderBottom = "0px";
				tab_tab[i].style.height = (parseInt(get_property(obj_index, "Tabs.Height").value) + parseInt(get_property(obj_index, "Tabs.BorderWidth").value)) - 1 + "px";
				tab_tab[i].style.backgroundColor = get_property(obj_index, "Tabs.SelectColor").value;
			}

			objects[obj_index].element.appendChild(tab_tab[i]);

			tab_tab[i].addEventListener("click", function(evt)
			{
				var index = this.id.substring(this.id.search("tab") + 4, this.id.length);
				alert(index);
			}, false);
		}

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				var outline_id = main_formspace.outlines_focus[main_formspace.get_form_num_index(get_object(this.id).form)].id;

				if (is_child(this.id, outline_id) == false)
				{
					main_formspace.set_outline_focus(this.id);
					element_flag = true;
				}
			}
		}, false);

		objects[obj_index].element.addEventListener("mousemove", function(evt)
		{
			mouse_hover = this.id;
		}, false);

		var index = main_formspace.get_form_tab_index(get_form_name(get_object("TabControl" + (counter + 1)).form));

		document.getElementById(main_formspace.tab_outlines[index].id).addEventListener("click", function (this_object, index)
		{
			return function(evt)
			{
		    	var rect = evt.target.getBoundingClientRect();
		    	var x = evt.clientX - rect.left - 4;
		    	var y = evt.clientY - rect.top - 4;

		    	if (evt.target.style.cursor == "default")
		    	{
		    		var tab_total = parseInt(get_property(index, "Tabs.Amount").value);
		    		
		    		var align = get_property(index, "Tabs.Alignment").value;

		    		if (align == "top")
		    		{
			    		for (var i = 0; i < tab_total; i++)
			    		{
			    			var target_x = (parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i;

			    			if (x >= target_x && x <= (target_x + parseInt(get_property(index, "Tabs.Width").value)) && y <= parseInt(get_property(index, "Tabs.Height").value))
			    				break;
			    		}
		    		}
		    		else if (align == "right")
		    		{
		    			for (var i = 0; i < tab_total; i++)
			    		{
			    			var target_y = (parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i;

			    			if (y >= target_y && y <= (target_y + parseInt(get_property(index, "Tabs.Width").value)) && x >= (parseInt(get_property(index, "Width").value) - parseInt(get_property(index, "Tabs.Height").value)))
			    				break;
			    		}
		    		}
		    		else if (align == "bottom")
		    		{
			    		for (var i = 0; i < tab_total; i++)
			    		{
			    			var target_x = (parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i;

			    			if (x >= target_x && x <= (target_x + parseInt(get_property(index, "Tabs.Width").value)) && y >= (parseInt(get_property(index, "Height").value) - parseInt(get_property(index, "Tabs.Height").value)))
			    				break;
			    		}
		    		}
		    		else if (align == "left")
		    		{
		    			for (var i = 0; i < tab_total; i++)
			    		{
			    			var target_y = (parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i;

			    			if (y >= target_y && y <= (target_y + parseInt(get_property(index, "Tabs.Width").value)) && x <= parseInt(get_property(index, "Tabs.Height").value))
			    				break;
			    		}
		    		}

		    		if (i < tab_total)
		    		{
		    			if (align != "left")
		    				var tab_select = i;
		    			else
		    				var tab_select = (tab_total - 1) - i;

						objects[index].container_suffix = "_panel_" + tab_select;

						set_property(index, "Tabs.Select", tab_select);
						tabcontrol_draw(this_object.element, index);
		    		}
		    	}
			}
		} (objects[obj_index], obj_index), false);

		/*objects[obj_index].element.addEventListener("mouseup", function (this_object)
		{
			return function(evt)
			{
				var this_index = this_object.form;
				var rect = this.getBoundingClientRect();
				paste_x = evt.clientX - rect.left;
				paste_y = evt.clientY - rect.top;

				paste_form = index;
				console.log(paste_x + " " + paste_y + " " + paste_form);
			}
		} (objects[obj_index]), false);*/

		main_formspace.set_outline_focus("TabControl" + (counter + 1));

		main_toolbox.set_tool(0);
	}

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "Window";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "window")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("Window" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "Window" + (counter + 1);
		objects[obj_index].type = "window";
		objects[obj_index].element_type = "div";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = true;
		objects[obj_index].container_suffix = "";

		objects[obj_index].properties = new Array();

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "Window" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#bbbbbb";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "solid";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BoxShadow";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "true";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Resize";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "true";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = width;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "TitleBar";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "TitleBar.BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#dee1e6";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "TitleBar.FontColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#353535";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "TitleBar.FontFamily";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = fonts;
		objects[obj_index].properties[index].value = "ABeeZee";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "TitleBar.FontSize";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "12px";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "TitleBar.Text";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "Window" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "TitleBar.TextLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 5;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "TitleBar.TextTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 8;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "TitleBar.Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Buttons";
		objects[obj_index].properties[index].type = "header";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Buttons.CloseButton";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "true";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Buttons.MaxButton";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "true";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Buttons.MinButton";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "true";

		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "Window" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = width + "px";
		objects[obj_index].element.style.height = height + "px";

		objects[obj_index].element.style.borderWidth = "1px";	
		objects[obj_index].element.style.borderStyle = "solid";

		objects[obj_index].element.style.padding = "0px";
		objects[obj_index].element.style.margin = "0px";

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		objects[obj_index].element.style.backgroundColor = get_property(obj_index, "BackgroundColor").value;
		objects[obj_index].element.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";

		objects[obj_index].element_header = document.createElement("div");
		objects[obj_index].element_header.id = "Window" + (counter + 1) + "_header";
		objects[obj_index].element_header.style.position = "absolute";

		objects[obj_index].element_header.style.top = "0px";
		objects[obj_index].element_header.style.left = "0px";

		objects[obj_index].element_header.style.width = width + "px";
		objects[obj_index].element_header.style.height = "30px";

		objects[obj_index].element_header.style.borderWidth = "1px";
		objects[obj_index].element_header.style.borderStyle = "hidden";

		objects[obj_index].element_header.style.backgroundColor = "#dee1e6";

		objects[obj_index].element.appendChild(objects[obj_index].element_header);

		var header_text = document.createElement("div");
		header_text.id = "Window" + (counter + 1) + "_header_text";
		header_text.style.position = "absolute";

		header_text.style.top = "8px";
		header_text.style.left = "5px";

		header_text.style.fontFamily = "ABeeZee";
		header_text.style.fontSize = "12px";
		header_text.style.color = "#353535";

		header_text.innerHTML = "Window" + (counter + 1);
		objects[obj_index].element_header.appendChild(header_text);		

		var header_boxx = document.createElement("div");
		header_boxx.id = "Window" + (counter + 1) + "_header_boxx";
		header_boxx.style.position = "absolute";

		header_boxx.style.top = "0px";
		header_boxx.style.left = (parseInt(objects[obj_index].element_header.style.width) - 45) + "px";
		header_boxx.style.paddingTop = "5px";

		header_boxx.style.width = "45px";
		header_boxx.style.height = "25px";

		header_boxx.style.backgroundColor = "transparent"; 
		header_boxx.innerHTML = "<center><img id = \"Window" + (counter + 1) + "_header_x\" src = \"img/window_x.png\"></center>";

		objects[obj_index].element_header.appendChild(header_boxx);	

		var header_boxmax = document.createElement("div");
		header_boxmax.id = "Window" + (counter + 1) + "_header_boxmax";
		header_boxmax.style.position = "absolute";

		header_boxmax.style.top = "0px";
		header_boxmax.style.left = (parseInt(objects[obj_index].element_header.style.width) - 90) + "px";
		header_boxmax.style.paddingTop = "5px";

		header_boxmax.style.width = "45px";
		header_boxmax.style.height = "25px";

		header_boxmax.style.backgroundColor = "transparent"; 
		header_boxmax.innerHTML = "<center><img id = \"Window" + (counter + 1) + "_header_x\" src = \"img/window_max.png\"></center>";

		objects[obj_index].element_header.appendChild(header_boxmax);	

		var header_boxmin = document.createElement("div");
		header_boxmin.id = "Window" + (counter + 1) + "_header_boxmin";
		header_boxmin.style.position = "absolute";

		header_boxmin.style.top = "0px";
		header_boxmin.style.left = (parseInt(objects[obj_index].element_header.style.width) - 135) + "px";
		header_boxmin.style.paddingTop = "5px";

		header_boxmin.style.width = "45px";
		header_boxmin.style.height = "25px";

		header_boxmin.style.backgroundColor = "transparent"; 
		header_boxmin.innerHTML = "<center><img id = \"Window" + (counter + 1) + "_header_x\" src = \"img/window_min.png\"></center>";

		objects[obj_index].element_header.appendChild(header_boxmin);

		/*var header_x = document.createElement("img");
		header_x.id = "Window" + (counter + 1) + "_header_x";
		header_x.style.position = "absolute";

		header_x.style.top = "8px";
		header_x.style.left = (parseInt(objects[obj_index].element_header.style.width) - 25) + "px";

		header_x.src = "img/window_x.png";*/

		/*function outputsize() {
			console.log("abab");
		}

		new ResizeObserver(outputsize).observe(objects[obj_index].element);*/

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				var outline_id = main_formspace.outlines_focus[main_formspace.get_form_num_index(get_object(this.id).form)].id;

				if (is_child(this.id, outline_id) == false)
				{
					main_formspace.set_outline_focus(this.id);
					element_flag = true;
				}
			}
		}, false);

		objects[obj_index].element.addEventListener("mousemove", function(evt)
		{
			mouse_hover = this.id;
		}, false);

		/*objects[obj_index].element.addEventListener("mouseup", function (this_object)
		{
			return function(evt)
			{
				var this_index = this_object.form;
				var rect = this.getBoundingClientRect();
				paste_x = evt.clientX - rect.left;
				paste_y = evt.clientY - rect.top;

				paste_form = index;
				console.log(paste_x + " " + paste_y + " " + paste_form);
			}
		} (objects[obj_index]), false);*/


		main_formspace.set_outline_focus("Window" + (counter + 1));

		main_toolbox.set_tool(0);
	}

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "TileMap";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "tilemap")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("TileMap" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 2;
			y -= 2;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "TileMap" + (counter + 1);
		objects[obj_index].type = "tilemap";
		objects[obj_index].element_type = "div";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = true;
		objects[obj_index].container_suffix = "_mapdiv";

		objects[obj_index].properties = new Array();

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "TileMap" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#7d7d7e";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "none";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Draggable";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "true";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Highlight";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "none,follow,select,follow/select";
		objects[obj_index].properties[index].value = "none";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "HighlightImage";
		objects[obj_index].properties[index].type = "file";
		objects[obj_index].properties[index].ext = ".*";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MapHeight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 10;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MapWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 10;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Overflow";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,scroll,auto";
		objects[obj_index].properties[index].value = "hidden";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "OverlayZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 4;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaintSelect";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "SelectTimer";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 1000;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "SelectX";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = -1;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "SelectY";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = -1;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "TileBackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#515151";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "TileBorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 3;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "TileHeight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 64;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "TileWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 64;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = width;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "TileMap" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = width + "px";
		objects[obj_index].element.style.height = height + "px";

		objects[obj_index].element.style.backgroundColor = "#7d7d7e";

		objects[obj_index].element.style.borderStyle = "none";
		objects[obj_index].element.style.borderWidth = "1px";
		objects[obj_index].element.style.padding = "0px";
		objects[obj_index].element.style.margin = "0px";

		objects[obj_index].element.style.fontFamily = "ABeeZee";
		objects[obj_index].element.style.fontSize = "12px";

		//objects[obj_index].element.disabled = true;
		//objects[obj_index].element.value = "Text" + (counter + 1);

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		objects[obj_index].element_mapdiv = document.createElement("div");
		objects[obj_index].element_mapdiv.id = "TileMap" + (counter + 1) + "_mapdiv";
		objects[obj_index].element_mapdiv.style.position = "absolute";

		objects[obj_index].element_mapdiv.style.top = "0px";
		objects[obj_index].element_mapdiv.style.left = "0px";

		objects[obj_index].element_mapdiv.width = width;
		objects[obj_index].element_mapdiv.height = height;

		objects[obj_index].element.appendChild(objects[obj_index].element_mapdiv);

		objects[obj_index].element_map = document.createElement("canvas");
		objects[obj_index].element_map.id = "TileMap" + (counter + 1) + "_map";
		objects[obj_index].element_map.style.position = "absolute";

		objects[obj_index].element_map.style.top = "0px";
		objects[obj_index].element_map.style.left = "0px";

		objects[obj_index].element_map.width = width;
		objects[obj_index].element_map.height = height;

		objects[obj_index].element_mapdiv.appendChild(objects[obj_index].element_map);

		draw_element(obj_index);

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		objects[obj_index].element.addEventListener("mousemove", function(evt)
		{
			mouse_hover = this.id;
		}, false);

		main_formspace.set_outline_focus("TileMap" + (counter + 1));

		main_toolbox.set_tool(0);
	}

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "TileSelect";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "TileSelect")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("TileSelect" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 2;
			y -= 2;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "TileSelect" + (counter + 1);
		objects[obj_index].type = "tileselect";
		objects[obj_index].element_type = "div";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = 192;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;
		//objects[obj_index].container_suffix = "_mapdiv";

		objects[obj_index].properties = new Array();

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "TileSelect" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#7d7d7e";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "none";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Draggable";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "true";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "GridWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 3;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Highlight";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "none,follow,select,follow/select";
		objects[obj_index].properties[index].value = "none";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "HighlightImage";
		objects[obj_index].properties[index].type = "file";
		objects[obj_index].properties[index].ext = ".*";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Overflow";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,scroll,auto";
		objects[obj_index].properties[index].value = "scroll";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ScrollbarWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 10;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "SelectIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = -1;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "TileCount";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "TileHeight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 64;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "TileWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 64;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tileset";
		objects[obj_index].properties[index].type = "file_mult";
		objects[obj_index].properties[index].ext = ".*";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "TileSelect" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = "192px";
		objects[obj_index].element.style.height = height + "px";

		objects[obj_index].element.style.backgroundColor = "#7d7d7e";

		objects[obj_index].element.style.borderStyle = "none";
		objects[obj_index].element.style.borderWidth = "1px";
		objects[obj_index].element.style.padding = "0px";
		objects[obj_index].element.style.margin = "0px";

		objects[obj_index].element.style.fontFamily = "ABeeZee";
		objects[obj_index].element.style.fontSize = "12px";

		//objects[obj_index].element.disabled = true;
		//objects[obj_index].element.value = "Text" + (counter + 1);

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		objects[obj_index].element_griddiv = document.createElement("div");
		objects[obj_index].element_griddiv.id = "TileSelect" + (counter + 1) + "_griddiv";
		objects[obj_index].element_griddiv.style.position = "absolute";

		objects[obj_index].element_griddiv.style.top = "0px";
		objects[obj_index].element_griddiv.style.left = "0px";

		objects[obj_index].element_griddiv.width = "192px";
		objects[obj_index].element_griddiv.height = height;

		objects[obj_index].element.appendChild(objects[obj_index].element_griddiv);

		objects[obj_index].element_grid = document.createElement("div");
		objects[obj_index].element_grid.id = "TileSelect" + (counter + 1) + "_grid";
		objects[obj_index].element_grid.style.position = "absolute";

		objects[obj_index].element_grid.style.top = "0px";
		objects[obj_index].element_grid.style.left = "0px";

		objects[obj_index].element_grid.width = "192px";
		objects[obj_index].element_grid.height = height;

		objects[obj_index].element_griddiv.appendChild(objects[obj_index].element_grid);

		draw_element(obj_index);

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		objects[obj_index].element.addEventListener("mousemove", function(evt)
		{
			mouse_hover = this.id;
		}, false);

		main_formspace.set_outline_focus("TileSelect" + (counter + 1));

		main_toolbox.set_tool(0);
	}

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "OpenFileDialog";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "OpenFileDialog")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("OpenFileDialog" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 2;
			y -= 2;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "OpenFileDialog" + (counter + 1);
		objects[obj_index].type = "openfiledialog";
		objects[obj_index].element_type = "div";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = 192;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;
		//objects[obj_index].container_suffix = "_mapdiv";

		objects[obj_index].properties = new Array();

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "OpenFileDialog" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Accept";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Directory";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Filename";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Multiple";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "WorkingDir";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "OpenFileDialog" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = "42px";
		objects[obj_index].element.style.height = "42px";

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);
		draw_element(obj_index);

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		objects[obj_index].element.addEventListener("mousemove", function(evt)
		{
			mouse_hover = this.id;
		}, false);

		main_formspace.set_outline_focus("OpenFileDialog" + (counter + 1));

		main_toolbox.set_tool(0);
	}

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "SaveFileDialog";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "SaveFileDialog")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("SaveFileDialog" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 2;
			y -= 2;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "SaveFileDialog" + (counter + 1);
		objects[obj_index].type = "savefiledialog";
		objects[obj_index].element_type = "div";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = 192;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;
		//objects[obj_index].container_suffix = "_mapdiv";

		objects[obj_index].properties = new Array();

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "SaveFileDialog" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Accept";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Filename";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "SaveAs";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "WorkingDir";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "SaveFileDialog" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = "42px";
		objects[obj_index].element.style.height = "42px";

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);
		draw_element(obj_index);

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		objects[obj_index].element.addEventListener("mousemove", function(evt)
		{
			mouse_hover = this.id;
		}, false);

		main_formspace.set_outline_focus("SaveFileDialog" + (counter + 1));

		main_toolbox.set_tool(0);
	}

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "Editor";

	tools_fx[index].create = function(outline_div)
	{
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		var counter = 0;

		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "editor")
				counter++;

		var valid_name = false;

		while (valid_name == false)
		{
			if (get_object("Editor" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		var parent_name = mouse_hover;
		var obj_index = objects.length;

		/*for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height) && objects[i].name != parent_name)
				{
					parent_name = objects[i].name;

					x = x - objects[i].left;
					y = y - objects[i].top;

					break;
				}*/

		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		objects[obj_index] = {};

		objects[obj_index].name = "Editor" + (counter + 1);
		objects[obj_index].type = "editor";
		objects[obj_index].element_type = "div";
		objects[obj_index].form = get_object(parent_name).form;

		objects[obj_index].top = y;
		objects[obj_index].left = x;
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		objects[obj_index].properties = new Array();

		var index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "Editor" + (counter + 1);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#000000";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderRadius";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderStyle";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "dotted,dashed,solid,double,groove,ridge,inset,outset,none,hidden";
		objects[obj_index].properties[index].value = "none";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "1";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = height;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Left";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = x;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MarginTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingBottom";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingLeft";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingRight";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaddingTop";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 0;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = y;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden,inherit";
		objects[obj_index].properties[index].value = "visible";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = width;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = get_object(parent_name).z + 2;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "IsArray";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ArrayName";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Index";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "";

		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "Editor" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = width + "px";
		objects[obj_index].element.style.height = height + "px";

		objects[obj_index].element.style.borderWidth = "1px";	
		objects[obj_index].element.style.borderStyle = "dashed";

		objects[obj_index].element.style.padding = "0px";
		objects[obj_index].element.style.margin = "0px";

		objects[obj_index].element.style.backgroundColor = "#404040";

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;
			set_property(obj_index, "Left", objects[obj_index].top);
		}

		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				var outline_id = main_formspace.outlines_focus[get_object(this.id).form].id;

				if (is_child(this.id, outline_id) == false)
				{
					main_formspace.set_outline_focus(this.id);
					element_flag = true;
				}
			}
		}, false);

		objects[obj_index].element.addEventListener("mousemove", function(evt)
		{
			mouse_hover = this.id;
		}, false);

		objects[obj_index].element.addEventListener("mouseup", function (this_object)
		{
			return function(evt)
			{
				var this_index = this_object.form;
				var rect = this.getBoundingClientRect();
				paste_x = evt.clientX - rect.left;
				paste_y = evt.clientY - rect.top;

				paste_form = index;
				console.log(paste_x + " " + paste_y + " " + paste_form);
			}
		} (objects[obj_index]), false);


		main_formspace.set_outline_focus("Editor" + (counter + 1));

		main_toolbox.set_tool(0);
	}
}

draw_element = function(index)
{
	var element = document.getElementById(objects[index].name);
	var old_name = objects[index].name;

	if (objects[index].type == "form")
	{
		var tab_id = "main_formspace_name_" + main_formspace.get_form_tab_index(objects[index].name);
		document.getElementById(tab_id).innerHTML = get_property(index, "Name").value;

		element.style.left = objects[index].left + "px";
		element.style.top = objects[index].top + "px";

		element.style.width = get_property(index, "Width").value + "px";
		element.style.height = get_property(index, "Height").value + "px";
		element.style.zIndex = get_property(index, "ZIndex").value;

		element.style.backgroundColor = get_property(index, "BackgroundColor").value;

		element.style.borderColor = get_property(index, "BorderColor").value;
		element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
		element.style.borderStyle = get_property(index, "BorderStyle").value;
		element.style.borderWidth = get_property(index, "BorderWidth").value + "px";

		//if (get_property(index, "Image").value != "")
		//	element.innerHTML = "<img src = \"" + project_folder + "/" + get_property(index, "Image").value + "\">";

		objects[index].width = parseInt(get_property(index, "Width").value);
		objects[index].height = parseInt(get_property(index, "Height").value);

		objects[index].name = get_property(index, "Name").value;

		element.id = objects[index].name;
	}
	else if (objects[index].type == "panel")
	{
		element.style.left = get_property(index, "Left").value + "px";
		element.style.top = get_property(index, "Top").value + "px";
		element.style.zIndex = get_property(index, "ZIndex").value;

		objects[index].left = get_property(index, "Left").value; 
		objects[index].top = get_property(index, "Top").value;

		element.style.paddingLeft = parseInt(get_property(index, "PaddingLeft").value) + "px";
		element.style.paddingRight = parseInt(get_property(index, "PaddingRight").value) + "px";
		element.style.paddingTop = parseInt(get_property(index, "PaddingTop").value) + "px";
		element.style.paddingBottom = parseInt(get_property(index, "PaddingBottom").value) + "px";

		element.style.marginLeft = parseInt(get_property(index, "MarginLeft").value) + "px";
		element.style.marginRight = parseInt(get_property(index, "MarginRight").value) + "px";
		element.style.marginTop = parseInt(get_property(index, "MarginTop").value) + "px";
		element.style.marginBottom = parseInt(get_property(index, "MarginBottom").value) + "px";

		if (get_property(index, "BorderStyle").value != "none")
		{
			element.style.borderColor = get_property(index, "BorderColor").value;
			element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
			element.style.borderStyle = get_property(index, "BorderStyle").value;
			element.style.borderWidth = get_property(index, "BorderWidth").value + "px";
		}
		else
		{
			element.style.borderColor = "#000000";
			element.style.borderRadius = "0px";
			element.style.borderStyle = "dashed";
			element.style.borderWidth = "1px";
		}

		element.style.backgroundColor = get_property(index, "BackgroundColor").value;

		element.style.width = get_property(index, "Width").value + "px";
		element.style.height = get_property(index, "Height").value + "px";

		objects[index].width = parseInt(get_property(index, "Width").value);
		objects[index].height = parseInt(get_property(index, "Height").value);

		if (objects[index].name != get_property(index, "Name").value)
		{
			for (var i = 0; i < objects.length; i++)
				if (objects[i].parent == objects[index].name)
					objects[i].parent = get_property(index, "Name").value;
		}

		objects[index].name = get_property(index, "Name").value;
		element.id = objects[index].name;
	}
	else if (objects[index].type == "textbox")
	{
		element.style.left = get_property(index, "Left").value + "px";
		element.style.top = get_property(index, "Top").value + "px";
		element.style.zIndex = get_property(index, "ZIndex").value;

		objects[index].left = get_property(index, "Left").value; 
		objects[index].top = get_property(index, "Top").value;

		element.style.borderColor = get_property(index, "BorderColor").value;
		element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
		element.style.borderStyle = get_property(index, "BorderStyle").value;
		element.style.borderWidth = get_property(index, "BorderWidth").value + "px";

		element.style.color = get_property(index, "FontColor").value;
		element.style.fontFamily = get_property(index, "FontFamily").value;
		element.style.fontSize = get_property(index, "FontSize").value;

		element.style.paddingLeft = parseInt(get_property(index, "PaddingLeft").value) + "px";
		element.style.paddingRight = parseInt(get_property(index, "PaddingRight").value) + "px";

		element.style.backgroundColor = get_property(index, "BackgroundColor").value;
		element.value = get_property(index, "Text").value;

		element.style.width = get_property(index, "Width").value + "px";
		element.style.height = get_property(index, "Height").value + "px";

		objects[index].width = parseInt(get_property(index, "Width").value);
		objects[index].height = parseInt(get_property(index, "Height").value);

		objects[index].name = get_property(index, "Name").value;
		element.id = objects[index].name;
	}
	else
	{
		eval("if (typeof " + objects[index].type + "_draw === \"function\") " + objects[index].type + "_draw(element, index);");
	}
	
	var child_elements = element.children;
	var child_elements_array = Array.from(child_elements);

	child_elements_array.forEach((item) => {
		if (item.id.substring(0, item.id.lastIndexOf("_")) == old_name)
			item.id = objects[index].name + item.id.substring(item.id.lastIndexOf("_"), item.id.length);
	});

	if (main_formspace.outlines_focus[main_formspace.get_form_tab_index(get_form_name(objects[index].form))].id == objects[index].name)
		main_formspace.set_outline_focus(objects[index].name);
}

button_draw = function(element, index)
{
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	element.style.opacity = get_property(index, "Opacity").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	element.style.borderColor = get_property(index, "BorderColor").value;
	element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
	element.style.borderStyle = get_property(index, "BorderStyle").value;
	element.style.borderWidth = get_property(index, "BorderWidth").value + "px";

	element.style.color = get_property(index, "FontColor").value;
	element.style.fontFamily = get_property(index, "FontFamily").value;
	element.style.fontSize = get_property(index, "FontSize").value;

	element.style.paddingLeft = parseInt(get_property(index, "PaddingLeft").value) + "px";
	element.style.paddingRight = parseInt(get_property(index, "PaddingRight").value) + "px";
	element.style.paddingTop = parseInt(get_property(index, "PaddingTop").value) + "px";
	element.style.paddingBottom = parseInt(get_property(index, "PaddingBottom").value) + "px";

	element.style.marginLeft = parseInt(get_property(index, "MarginLeft").value) + "px";
	element.style.marginRight = parseInt(get_property(index, "MarginRight").value) + "px";
	element.style.marginTop = parseInt(get_property(index, "MarginTop").value) + "px";
	element.style.marginBottom = parseInt(get_property(index, "MarginBottom").value) + "px";

	element.style.textAlign = get_property(index, "TextAlign").value;

	element.style.lineHeight = parseInt(get_property(index, "LineHeight").value) + "px";

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;
	element.innerHTML = get_property(index, "Text").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

dropdownlist_draw = function(element, index)
{
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	element.style.opacity = get_property(index, "Opacity").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	element.style.borderColor = get_property(index, "BorderColor").value;
	element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
	element.style.borderStyle = get_property(index, "BorderStyle").value;
	element.style.borderWidth = get_property(index, "BorderWidth").value + "px";

	element.style.fontFamily = get_property(index, "FontFamily").value;
	element.style.fontSize = get_property(index, "FontSize").value;

	element.style.paddingLeft = parseInt(get_property(index, "PaddingLeft").value) + "px";
	element.style.paddingRight = parseInt(get_property(index, "PaddingRight").value) + "px";
	element.style.paddingTop = parseInt(get_property(index, "PaddingTop").value) + "px";
	element.style.paddingBottom = parseInt(get_property(index, "PaddingBottom").value) + "px";

	element.style.marginLeft = parseInt(get_property(index, "MarginLeft").value) + "px";
	element.style.marginRight = parseInt(get_property(index, "MarginRight").value) + "px";
	element.style.marginTop = parseInt(get_property(index, "MarginTop").value) + "px";
	element.style.marginBottom = parseInt(get_property(index, "MarginBottom").value) + "px";

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;

    for(var i = element.options.length; i >= 0; i--)
    	element.remove(i);

	var options = get_property(index, "Options").value.split(",");

	for (var j = 0; j < options.length; j++)
	{
		var option = document.createElement("option");
		option.text = options[j];
		element.add(option);
	}

	element.value = get_property(index, "Value").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

adjuster_create = function(element, index)
{
	element_sub1 = document.createElement("img");
	element_sub1.id = objects[index].name + "_sub1";
	element_sub1.style.position = "absolute";

	element_sub2 = document.createElement("div");
	element_sub2.id = objects[index].name + "_sub2";
	element_sub2.style.position = "absolute";

	element_sub3 = document.createElement("img");
	element_sub3.id = objects[index].name + "_sub3";
	element_sub3.style.position = "absolute";

	element.appendChild(element_sub1);
	element.appendChild(element_sub2);
	element.appendChild(element_sub3);
}

canvas_create = function(element, index)
{
	element_canvas = document.createElement("canvas");
	element_canvas.id = objects[index].name + "_canvas";
	element_canvas.style.position = "absolute";

	element_canvas.style.top = "0px";
	element_canvas.style.left = "0px";

	element.appendChild(element_canvas);
}

checkbox_create = function(element, index)
{
	element_sub1 = document.createElement("img");
	element_sub1.id = objects[index].name + "_sub1";
	element_sub1.style.position = "absolute";

	element_sub1.src = get_property(index, "Unchecked.Image").value;

	element_sub2 = document.createElement("div");
	element_sub2.id = objects[index].name + "_sub2";
	element_sub2.style.position = "absolute";

	element_sub2.innerHTML = get_property(index, "Text").value;

	element.appendChild(element_sub1);
	element.appendChild(element_sub2);
}

scrollpanel_create = function(element, index)
{
	element_panel = document.createElement("div");
	element_panel.id = objects[index].name + "_panel";
	element_panel.style.position = "absolute";

	element_panel.style.top = "0px";
	element_panel.style.left = "0px";

	element.appendChild(element_panel);
}

tabcontrol_create = function(element, index)
{
	var tab_panel = new Array();
	var tab_tab = new Array();
	var tab_total = parseInt(get_property(index, "Tabs.Amount").value);
	var tab_height = parseInt(get_property(index, "Tabs.Height").value);

	var width = parseInt(get_property(index, "Width").value);
	var height = parseInt(get_property(index, "Height").value);

	var form_id = element.parentElement.parentElement.id;
	var form_index = parseInt(form_id.substring(form_id.lastIndexOf("_") + 1, form_id.length));

	for (i = 0; i < tab_total; i++)
	{
		tab_panel[i] = document.createElement("div");
		tab_panel[i].id = objects[index].name + "_panel_" + i;
		tab_panel[i].style.position = "absolute";

		tab_panel[i].style.top = parseInt(get_property(index, "Tabs.Height").value) + "px";
		tab_panel[i].style.left = "0px";

		tab_panel[i].style.zIndex = parseInt(get_property(index, "ZIndex").value);

		tab_panel[i].style.width = width + "px";
		tab_panel[i].style.height = (height - tab_height - 1) + "px";

		tab_panel[i].style.backgroundColor = get_property(index, "BackgroundColor").value;

		tab_panel[i].style.borderColor = get_property(index, "BorderColor").value;
		tab_panel[i].style.borderRadius = get_property(index, "BorderRadius").value;
		tab_panel[i].style.borderStyle = get_property(index, "BorderStyle").value;
		tab_panel[i].style.borderWidth = get_property(index, "BorderWidth").value;

		if (i == 0)
			tab_panel[i].style.visibility = "visible";
		else
			tab_panel[i].style.visibility = "hidden";

		element.appendChild(tab_panel[i]);

		tab_tab[i] = document.createElement("div");
		tab_tab[i].id = objects[index].name + "_tab_" + i;
		tab_tab[i].style.position = "absolute";

		tab_tab[i].style.top = "0px";
		tab_tab[i].style.left = ((parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i) + "px";

		tab_tab[i].style.zIndex = parseInt(get_property(index, "ZIndex").value) + 1;

		tab_tab[i].style.width = parseInt(get_property(index, "Tabs.Width").value) + "px";
		tab_tab[i].style.height = parseInt(get_property(index, "Tabs.Height").value) - 1 + "px";

		tab_tab[i].style.backgroundColor = get_property(index, "Tabs.BackgroundColor").value;

		tab_tab[i].style.borderColor = get_property(index, "Tabs.BorderColor").value;
		tab_tab[i].style.borderRadius = get_property(index, "Tabs.BorderRadius").value;
		tab_tab[i].style.borderStyle = get_property(index, "Tabs.BorderStyle").value;
		tab_tab[i].style.borderWidth = get_property(index, "Tabs.BorderWidth").value;

		document.getElementById(main_formspace.tab_outlines[form_index].id).addEventListener("click", function (this_object, index)
		{
			return function(evt)
			{
		    	var rect = evt.target.getBoundingClientRect();
		    	var x = evt.clientX - rect.left - 4;
		    	var y = evt.clientY - rect.top - 4;

		    	if (evt.target.style.cursor == "default")
		    	{
		    		var tab_total = parseInt(get_property(index, "Tabs.Amount").value);
		    		
		    		var align = get_property(index, "Tabs.Alignment").value;

		    		if (align == "top")
		    		{
			    		for (var i = 0; i < tab_total; i++)
			    		{
			    			var target_x = (parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i;

			    			if (x >= target_x && x <= (target_x + parseInt(get_property(index, "Tabs.Width").value)) && y <= parseInt(get_property(index, "Tabs.Height").value))
			    				break;
			    		}
		    		}
		    		else if (align == "right")
		    		{
		    			for (var i = 0; i < tab_total; i++)
			    		{
			    			var target_y = (parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i;

			    			if (y >= target_y && y <= (target_y + parseInt(get_property(index, "Tabs.Width").value)) && x >= (parseInt(get_property(index, "Width").value) - parseInt(get_property(index, "Tabs.Height").value)))
			    				break;
			    		}
		    		}
		    		else if (align == "bottom")
		    		{
			    		for (var i = 0; i < tab_total; i++)
			    		{
			    			var target_x = (parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i;

			    			if (x >= target_x && x <= (target_x + parseInt(get_property(index, "Tabs.Width").value)) && y >= (parseInt(get_property(index, "Height").value) - parseInt(get_property(index, "Tabs.Height").value)))
			    				break;
			    		}
		    		}
		    		else if (align == "left")
		    		{
		    			for (var i = 0; i < tab_total; i++)
			    		{
			    			var target_y = (parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i;

			    			if (y >= target_y && y <= (target_y + parseInt(get_property(index, "Tabs.Width").value)) && x <= parseInt(get_property(index, "Tabs.Height").value))
			    				break;
			    		}
		    		}

		    		if (i < tab_total)
		    		{
		    			if (align != "left")
		    				var tab_select = i;
		    			else
		    				var tab_select = (tab_total - 1) - i;

						objects[index].container_suffix = "_panel_" + tab_select;

						set_property(index, "Tabs.Select", tab_select);
						tabcontrol_draw(this_object.element, index);
		    		}
		    	}
			}
		} (objects[index], index), false);

		element.appendChild(tab_tab[i]);
	}
}

tilemap_create = function(element, index)
{
	element_mapdiv = document.createElement("div");
	element_mapdiv.id = objects[index].name + "_mapdiv";
	element_mapdiv.style.position = "absolute";

	element_mapdiv.style.top = "0px";
	element_mapdiv.style.left = "0px";

	element.appendChild(element_mapdiv);

	element_map = document.createElement("canvas");
	element_map.id = objects[index].name + "_map";
	element_map.style.position = "absolute";

	element_map.style.top = "0px";
	element_map.style.left = "0px";

	element_mapdiv.appendChild(element_map);
}

tileselect_create = function(element, index)
{
	element_griddiv = document.createElement("div");
	element_griddiv.id = objects[index].name + "_griddiv";
	element_griddiv.style.position = "absolute";

	element_griddiv.style.top = "0px";
	element_griddiv.style.left = "0px";

	element.appendChild(element_griddiv);

	element_grid = document.createElement("div");
	element_grid.id = objects[index].name + "_grid";
	element_grid.style.position = "absolute";

	element_grid.style.top = "0px";
	element_grid.style.left = "0px";

	element_griddiv.appendChild(element_grid);

	objects[index].tilecount = 0;
}

window_create = function(element, index)
{
	element_header = document.createElement("div");
	element_header.id = objects[index].name + "_header";
	element_header.style.position = "absolute";

	element_header.style.top = "0px";
	element_header.style.left = "0px";

	element.appendChild(element_header);

	element_title = document.createElement("div");
	element_title.id = objects[index].name + "_header_text";
	element_title.style.position = "absolute";

	element_title.style.top = "0px";
	element_title.style.left = "0px";

	element_header.appendChild(element_title);

	header_boxx = document.createElement("div");	
	header_boxx.id =  objects[index].name + "_header_boxx";
	header_boxx.style.position = "absolute";

	header_boxx.style.top = "0px";
	header_boxx.style.left = "0px";

	header_boxx.innerHTML = "<center><img id = \"" + objects[index].name + "_header_x\" src = \"img/window_x.png\"></center>";

	element_header.appendChild(header_boxx);

	header_boxmax = document.createElement("div");	
	header_boxmax.id =  objects[index].name + "_header_boxmax";
	header_boxmax.style.position = "absolute";

	header_boxmax.style.top = "0px";
	header_boxmax.style.left = "0px";

	header_boxmax.innerHTML = "<center><img id = \"" + objects[index].name + "_header_x\" src = \"img/window_max.png\"></center>";

	element_header.appendChild(header_boxmax);

	header_boxmin = document.createElement("div");	
	header_boxmin.id =  objects[index].name + "_header_boxmin";
	header_boxmin.style.position = "absolute";

	header_boxmin.style.top = "0px";
	header_boxmin.style.left = "0px";

	header_boxmin.innerHTML = "<center><img id = \"" + objects[index].name + "_header_x\" src = \"img/window_min.png\"></center>";

	element_header.appendChild(header_boxmin);
}

adjuster_draw = function(element, index)
{
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	var element_sub1 = document.getElementById(objects[index].name + "_sub1");
	var element_sub2 = document.getElementById(objects[index].name + "_sub2");
	var element_sub3 = document.getElementById(objects[index].name + "_sub3");

	element.style.borderColor = get_property(index, "BorderColor").value;
	element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
	element.style.borderStyle = get_property(index, "BorderStyle").value;
	element.style.borderWidth = get_property(index, "BorderWidth").value + "px";

	element.style.padding = "0px";
	element.style.margin = "0px";

	element_sub2.style.borderColor = get_property(index, "Box.BorderColor").value;
	element_sub2.style.borderRadius = get_property(index, "Box.BorderRadius").value + "px";
	element_sub2.style.borderStyle = get_property(index, "Box.BorderStyle").value;
	element_sub2.style.borderWidth = get_property(index, "Box.BorderWidth").value + "px";

	element_sub2.style.paddingLeft = parseInt(get_property(index, "Box.PaddingLeft").value) + "px";
	element_sub2.style.paddingRight = parseInt(get_property(index, "Box.PaddingRight").value) + "px";
	element_sub2.style.paddingTop = parseInt(get_property(index, "Box.PaddingTop").value) + "px";
	element_sub2.style.paddingBottom = parseInt(get_property(index, "Box.PaddingBottom").value) + "px";

	element_sub2.style.backgroundColor = get_property(index, "Box.BackgroundColor").value;

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;

	element.style.width = parseInt(get_property(index, "Width").value) + parseInt(get_property(index, "Box.PaddingLeft").value) + parseInt(get_property(index, "Box.PaddingRight").value) + "px";
	element_sub2.style.width = get_property(index, "Box.Width").value + "px";

	element_sub2.style.height = get_property(index, "Box.Height").value + "px";
	element.style.height = (parseInt(get_property(index, "Box.Height").value) + parseInt(get_property(index, "Box.BorderWidth").value)) + parseInt(get_property(index, "Box.PaddingTop").value) + parseInt(get_property(index, "Box.PaddingBottom").value) + "px";

	if (fs.existsSync(project_folder + "/" + get_property(index, "LeftArrow.Image").value))
		element_sub1.src = project_folder + "/" + get_property(index, "LeftArrow.Image").value;
	else
		element_sub1.src = get_property(index, "LeftArrow.Image").value;

	element_sub1.addEventListener("load", function (this_height)
	{
		return function(evt)
		{
			this.style.left = "0px";
			this.style.top = Math.floor((this_height - this.height) / 2) + "px";
		}
	} (parseInt(element.style.height)), false);	

	if (fs.existsSync(project_folder + "/" + get_property(index, "RightArrow.Image").value))
		element_sub3.src = project_folder + "/" + get_property(index, "RightArrow.Image").value;
	else
		element_sub3.src = get_property(index, "RightArrow.Image").value;

	element_sub3.addEventListener("load", function (this_height, this_width)
	{
		return function(evt)
		{
			this.style.left = (this_width - this.width) + "px";
			this.style.top = Math.floor((this_height - this.height) / 2) + "px";
		}
	} (parseInt(element.style.height), parseInt(element.style.width)), false);

	element_sub2.style.left = Math.floor((parseInt(get_property(index, "Width").value) - (parseInt(get_property(index, "Box.Width").value) + parseInt(get_property(index, "Box.BorderWidth").value))) / 2) + parseInt(get_property(index, "Box.LeftAdjust").value) + "px";
	element_sub2.style.top = "0px";

	element_sub2.style.color = get_property(index, "Box.FontColor").value;
	element_sub2.style.fontFamily = get_property(index, "Box.FontFamily").value;
	element_sub2.style.fontSize = get_property(index, "Box.FontSize").value;

	if (get_property(index, "Box.TextAlign") != null)
		element.style.textAlign = get_property(index, "Box.TextAlign").value;

	element_sub2.innerHTML = get_property(index, "Box.Text").value;

	objects[index].width = parseInt(element.style.width);
	objects[index].height = parseInt(element.style.height);

	objects[index].name = get_property(index, "Name").value;

	element.id = objects[index].name;
	element_sub1 = objects[index].name + "_sub1";
	element_sub2 = objects[index].name + "_sub2";
	element_sub3 = objects[index].name + "_sub3";
}

canvas_draw = function(element, index)
{
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	element.style.paddingLeft = parseInt(get_property(index, "PaddingLeft").value) + "px";
	element.style.paddingRight = parseInt(get_property(index, "PaddingRight").value) + "px";
	element.style.paddingTop = parseInt(get_property(index, "PaddingTop").value) + "px";
	element.style.paddingBottom = parseInt(get_property(index, "PaddingBottom").value) + "px";

	element.style.marginLeft = parseInt(get_property(index, "MarginLeft").value) + "px";
	element.style.marginRight = parseInt(get_property(index, "MarginRight").value) + "px";
	element.style.marginTop = parseInt(get_property(index, "MarginTop").value) + "px";
	element.style.marginBottom = parseInt(get_property(index, "MarginBottom").value) + "px";

	if (get_property(index, "BorderStyle").value != "none")
	{
		element.style.borderColor = get_property(index, "BorderColor").value;
		element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
		element.style.borderStyle = get_property(index, "BorderStyle").value;
		element.style.borderWidth = get_property(index, "BorderWidth").value + "px";
	}
	else
	{
		element.style.borderColor = "#000000";
		element.style.borderRadius = "0px";
		element.style.borderStyle = "dashed";
		element.style.borderWidth = "1px";
	}

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;
	element.style.visibility = get_property(index, "Visibility").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	var element_canvas = document.getElementById(element.id + "_canvas");
	element_canvas.style.width = get_property(index, "Width").value + "px";
	element_canvas.style.height = get_property(index, "Height").value + "px";

	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	if (objects[index].name != get_property(index, "Name").value)
	{
		for (var i = 0; i < objects.length; i++)
			if (objects[i].parent == objects[index].name)
				objects[i].parent = get_property(index, "Name").value;
	}

	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

checkbox_draw = function(element, index)
{
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	element.style.borderColor = get_property(index, "BorderColor").value;
	element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
	element.style.borderStyle = get_property(index, "BorderStyle").value;
	element.style.borderWidth = get_property(index, "BorderWidth").value + "px";

	element.style.marginLeft = parseInt(get_property(index, "MarginLeft").value) + "px";
	element.style.marginRight = parseInt(get_property(index, "MarginRight").value) + "px";
	element.style.marginTop = parseInt(get_property(index, "MarginTop").value) + "px";
	element.style.marginBottom = parseInt(get_property(index, "MarginBottom").value) + "px";

	element.style.paddingLeft = parseInt(get_property(index, "PaddingLeft").value) + "px";
	element.style.paddingRight = parseInt(get_property(index, "PaddingRight").value) + "px";
	element.style.paddingTop = parseInt(get_property(index, "PaddingTop").value) + "px";
	element.style.paddingBottom = parseInt(get_property(index, "PaddingBottom").value) + "px";

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	var element_sub1 = document.getElementById(objects[index].name + "_sub1");
	var element_sub2 = document.getElementById(objects[index].name + "_sub2");

	element_sub1.style.left = get_property(index, "Box.Left").value + "px";
	element_sub1.style.top = get_property(index, "Box.Top").value + "px";

	if (get_property(index, "Check").value == "true")
	{
		if (fs.existsSync(project_folder + "/" + get_property(index, "Checked.Image").value))
			element_sub1.src = project_folder + "/" + get_property(index, "Checked.Image").value;
		else
			element_sub1.src = get_property(index, "Checked.Image").value;
	}
	else
	{
		if (fs.existsSync(project_folder + "/" + get_property(index, "Unchecked.Image").value))
			element_sub1.src = project_folder + "/" + get_property(index, "Unchecked.Image").value;
		else
			element_sub1.src = get_property(index, "Unchecked.Image").value;
	}

	element_sub2.style.left = get_property(index, "Label.Left").value + "px";
	element_sub2.style.top = get_property(index, "Label.Top").value + "px";

	element_sub2.style.fontFamily = get_property(index, "FontFamily").value;
	element_sub2.style.fontSize = get_property(index, "FontSize").value;

	element_sub2.innerHTML = get_property(index, "Text").value;

	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

console_draw = function(element, index)
{
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	element.style.opacity = get_property(index, "Opacity").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	element.style.borderColor = get_property(index, "BorderColor").value;
	element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
	element.style.borderStyle = get_property(index, "BorderStyle").value;
	element.style.borderWidth = get_property(index, "BorderWidth").value + "px";

	element.style.fontFamily = get_property(index, "FontFamily").value;
	element.style.fontSize = get_property(index, "FontSize").value;

	element.style.paddingLeft = parseInt(get_property(index, "PaddingLeft").value) + "px";
	element.style.paddingRight = parseInt(get_property(index, "PaddingRight").value) + "px";
	element.style.paddingTop = parseInt(get_property(index, "PaddingTop").value) + "px";
	element.style.paddingBottom = parseInt(get_property(index, "PaddingBottom").value) + "px";

	element.style.marginLeft = parseInt(get_property(index, "MarginLeft").value) + "px";
	element.style.marginRight = parseInt(get_property(index, "MarginRight").value) + "px";
	element.style.marginTop = parseInt(get_property(index, "MarginTop").value) + "px";
	element.style.marginBottom = parseInt(get_property(index, "MarginBottom").value) + "px";

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;

	if (get_property(index, "OverflowY") != null)
		element.style.overflowY = get_property(index, "OverflowY").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

datagrid_draw = function(element, index)
{
	element.id = get_property(index, "Name").value;

	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	element.style.borderColor = get_property(index, "BorderColor").value;
	element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
	element.style.borderStyle = get_property(index, "BorderStyle").value;
	element.style.borderWidth = get_property(index, "BorderWidth").value + "px";

	element.style.marginLeft = parseInt(get_property(index, "MarginLeft").value) + "px";
	element.style.marginRight = parseInt(get_property(index, "MarginRight").value) + "px";
	element.style.marginTop = parseInt(get_property(index, "MarginTop").value) + "px";
	element.style.marginBottom = parseInt(get_property(index, "MarginBottom").value) + "px";

	element.style.paddingLeft = parseInt(get_property(index, "PaddingLeft").value) + "px";
	element.style.paddingRight = parseInt(get_property(index, "PaddingRight").value) + "px";
	element.style.paddingTop = parseInt(get_property(index, "PaddingTop").value) + "px";
	element.style.paddingBottom = parseInt(get_property(index, "PaddingBottom").value) + "px";

	element.style.color = get_property(index, "FontColor").value;
	element.style.fontFamily = get_property(index, "FontFamily").value;
	element.style.fontSize = get_property(index, "FontSize").value;

	if (get_property(index, "OverflowX") != null)
		element.style.overflowX = get_property(index, "OverflowX").value;

	if (get_property(index, "OverflowY") != null)
		element.style.overflowY = get_property(index, "OverflowY").value;

	if (get_property(index, "LineHeight") != null)
		element.style.lineHeight = get_property(index, "LineHeight").value;

	if (get_property(index, "TextAlign") != null)
		element.style.textAlign = get_property(index, "TextAlign").value;

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;

	if (get_property(index, "Image").value == "")
		element.innerHTML = get_property(index, "Text").value;
	else
		element.innerHTML = "<img src = \"" + project_folder + "/" + get_property(index, "Image").value + "\">" + get_property(index, "Text").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

label_draw = function(element, index)
{
	element.id = get_property(index, "Name").value;

	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	element.style.borderColor = get_property(index, "BorderColor").value;
	element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
	element.style.borderStyle = get_property(index, "BorderStyle").value;
	element.style.borderWidth = get_property(index, "BorderWidth").value + "px";

	element.style.marginLeft = parseInt(get_property(index, "MarginLeft").value) + "px";
	element.style.marginRight = parseInt(get_property(index, "MarginRight").value) + "px";
	element.style.marginTop = parseInt(get_property(index, "MarginTop").value) + "px";
	element.style.marginBottom = parseInt(get_property(index, "MarginBottom").value) + "px";

	element.style.paddingLeft = parseInt(get_property(index, "PaddingLeft").value) + "px";
	element.style.paddingRight = parseInt(get_property(index, "PaddingRight").value) + "px";
	element.style.paddingTop = parseInt(get_property(index, "PaddingTop").value) + "px";
	element.style.paddingBottom = parseInt(get_property(index, "PaddingBottom").value) + "px";

	element.style.color = get_property(index, "FontColor").value;
	element.style.fontFamily = get_property(index, "FontFamily").value;
	element.style.fontSize = get_property(index, "FontSize").value;

	if (get_property(index, "OverflowX") != null)
		element.style.overflowX = get_property(index, "OverflowX").value;

	if (get_property(index, "OverflowY") != null)
		element.style.overflowY = get_property(index, "OverflowY").value;

	if (get_property(index, "LineHeight") != null)
		element.style.lineHeight = get_property(index, "LineHeight").value;

	if (get_property(index, "TextAlign") != null)
		element.style.textAlign = get_property(index, "TextAlign").value;

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;

	if (get_property(index, "Image").value == "")
		element.innerHTML = get_property(index, "Text").value;
	else
		element.innerHTML = "<img src = \"" + project_folder + "/" + get_property(index, "Image").value + "\">" + get_property(index, "Text").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

menustrip_draw = function(element, index)
{
	element.id = get_property(index, "Name").value;

	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	element.style.borderColor = get_property(index, "BorderColor").value;
	element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
	element.style.borderStyle = get_property(index, "BorderStyle").value;
	element.style.borderWidth = get_property(index, "BorderWidth").value + "px";

	element.style.marginLeft = parseInt(get_property(index, "MarginLeft").value) + "px";
	element.style.marginRight = parseInt(get_property(index, "MarginRight").value) + "px";
	element.style.marginTop = parseInt(get_property(index, "MarginTop").value) + "px";
	element.style.marginBottom = parseInt(get_property(index, "MarginBottom").value) + "px";

	element.style.paddingLeft = parseInt(get_property(index, "PaddingLeft").value) + "px";
	element.style.paddingRight = parseInt(get_property(index, "PaddingRight").value) + "px";
	element.style.paddingTop = parseInt(get_property(index, "PaddingTop").value) + "px";
	element.style.paddingBottom = parseInt(get_property(index, "PaddingBottom").value) + "px";

	element.style.color = get_property(index, "FontColor").value;
	element.style.fontFamily = get_property(index, "FontFamily").value;
	element.style.fontSize = get_property(index, "FontSize").value;

	if (get_property(index, "OverflowX") != null)
		element.style.overflowX = get_property(index, "OverflowX").value;

	if (get_property(index, "OverflowY") != null)
		element.style.overflowY = get_property(index, "OverflowY").value;

	if (get_property(index, "LineHeight") != null)
		element.style.lineHeight = get_property(index, "LineHeight").value;

	if (get_property(index, "TextAlign") != null)
		element.style.textAlign = get_property(index, "TextAlign").value;

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;

	if (get_property(index, "Image").value == "")
		element.innerHTML = get_property(index, "Text").value;
	else
		element.innerHTML = "<img src = \"" + project_folder + "/" + get_property(index, "Image").value + "\">" + get_property(index, "Text").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

picturebox_draw = function(element, index)
{
	element.id = get_property(index, "Name").value;

	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";

	element.style.zIndex = get_property(index, "ZIndex").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	if (get_property(index, "BorderStyle").value != "none")
	{
		element.style.borderColor = get_property(index, "BorderColor").value;
		element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
		element.style.borderStyle = get_property(index, "BorderStyle").value;
		element.style.borderWidth = get_property(index, "BorderWidth").value + "px";
	}
	else
	{
		element.style.borderColor = "#000000";
		element.style.borderRadius = "0px";
		element.style.borderStyle = "dashed";
		element.style.borderWidth = "1px";
	}

	element.style.marginLeft = parseInt(get_property(index, "MarginLeft").value) + "px";
	element.style.marginRight = parseInt(get_property(index, "MarginRight").value) + "px";
	element.style.marginTop = parseInt(get_property(index, "MarginTop").value) + "px";
	element.style.marginBottom = parseInt(get_property(index, "MarginBottom").value) + "px";

	element.style.paddingLeft = parseInt(get_property(index, "PaddingLeft").value) + "px";
	element.style.paddingRight = parseInt(get_property(index, "PaddingRight").value) + "px";
	element.style.paddingTop = parseInt(get_property(index, "PaddingTop").value) + "px";
	element.style.paddingBottom = parseInt(get_property(index, "PaddingBottom").value) + "px";

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;

	//if (get_property(index, ImageCenter).value == "true")

	if (get_property(index, "Image").value != "")
	{
		element.innerHTML = "<img id = \"" + element.id + "_image\" src = \"" + project_folder + "/" + get_property(index, "Image").value + "\">";

		document.getElementById(element.id + "_image").addEventListener("load", function (obj_index)
		{
			return function(evt)
			{
				this.style.position = "absolute";

				if (get_property(index, "Scale").value == "true")
				{
					this.width = parseInt(get_property(index, "Width").value);
					this.height = parseInt(get_property(index, "Height").value);
				}

				if (get_property(index, "HorizontalAlign").value == "center")
					this.style.left = Math.floor((get_property(index, "ElementWidth").value - this.width) / 2) + "px";
				else if (get_property(index, "HorizontalAlign").value == "right")
					this.style.left = (get_property(index, "ElementWidth").value - this.width) + "px";
				else
					this.style.left = "0px";

				if (get_property(index, "VerticalAlign").value == "center")
					this.style.top = Math.floor((get_property(index, "ElementHeight").value - this.height) / 2) + "px";
				else if (get_property(index, "VerticalAlign").value == "right")
					this.style.top = (get_property(index, "ElementHeight").value - this.height) + "px";
				else
					this.style.top = "0px";
			}
		} (index), false);
	}

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

pictureframe_draw = function(element, index)
{
	element.id = get_property(index, "Name").value;

	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";

	element.style.overflow = "hidden";

	element.style.zIndex = get_property(index, "ZIndex").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	if (get_property(index, "BorderStyle").value != "none")
	{
		element.style.borderColor = get_property(index, "BorderColor").value;
		element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
		element.style.borderStyle = get_property(index, "BorderStyle").value;
		element.style.borderWidth = get_property(index, "BorderWidth").value + "px";
	}
	else
	{
		element.style.borderColor = "#000000";
		element.style.borderRadius = "0px";
		element.style.borderStyle = "dashed";
		element.style.borderWidth = "1px";
	}

	element.style.marginLeft = parseInt(get_property(index, "MarginLeft").value) + "px";
	element.style.marginRight = parseInt(get_property(index, "MarginRight").value) + "px";
	element.style.marginTop = parseInt(get_property(index, "MarginTop").value) + "px";
	element.style.marginBottom = parseInt(get_property(index, "MarginBottom").value) + "px";

	element.style.paddingLeft = parseInt(get_property(index, "PaddingLeft").value) + "px";
	element.style.paddingRight = parseInt(get_property(index, "PaddingRight").value) + "px";
	element.style.paddingTop = parseInt(get_property(index, "PaddingTop").value) + "px";
	element.style.paddingBottom = parseInt(get_property(index, "PaddingBottom").value) + "px";

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;

	//if (get_property(index, ImageCenter).value == "true")

	if (get_property(index, "Image").value != "")
	{
		element.innerHTML = "<img id = \"" + element.id + "_image\" src = \"" + project_folder + "/" + get_property(index, "Image").value + "\">";

		document.getElementById(element.id + "_image").addEventListener("load", function (obj_index)
		{
			return function(evt)
			{
				this.style.position = "absolute";
			}
		} (index), false);
	}

	if (get_property(index, "FlipHorizontal").value == "true")
		element.style.transform = "scaleX(-1)";
	else
		element.style.transform = "scaleX(1)";

	if (get_property(index, "Filter") != null)
		element.style.filter = get_property(index, "Filter").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	var obj_image = document.getElementById(element.id + "_image");

	if (obj_image != null)
	{
		obj_image.style.left = -((obj_image.width / parseInt(get_property(index, "Frames").value)) * parseInt(get_property(index, "Frame").value)) + "px";
		obj_image.style.top = -((obj_image.height / parseInt(get_property(index, "Rows").value)) * parseInt(get_property(index, "Row").value)) + "px";
	}

	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

scrollpanel_draw = function(element, index)
{
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	element.style.paddingLeft = parseInt(get_property(index, "PaddingLeft").value) + "px";
	element.style.paddingRight = parseInt(get_property(index, "PaddingRight").value) + "px";
	element.style.paddingTop = parseInt(get_property(index, "PaddingTop").value) + "px";
	element.style.paddingBottom = parseInt(get_property(index, "PaddingBottom").value) + "px";

	element.style.marginLeft = parseInt(get_property(index, "MarginLeft").value) + "px";
	element.style.marginRight = parseInt(get_property(index, "MarginRight").value) + "px";
	element.style.marginTop = parseInt(get_property(index, "MarginTop").value) + "px";
	element.style.marginBottom = parseInt(get_property(index, "MarginBottom").value) + "px";

	if (get_property(index, "BorderStyle").value != "none")
	{
		element.style.borderColor = get_property(index, "BorderColor").value;
		element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
		element.style.borderStyle = get_property(index, "BorderStyle").value;
		element.style.borderWidth = get_property(index, "BorderWidth").value + "px";
	}
	else
	{
		element.style.borderColor = "#000000";
		element.style.borderRadius = "0px";
		element.style.borderStyle = "dashed";
		element.style.borderWidth = "1px";
	}

	element.style.overflowX = get_property(index, "OverflowX").value;
	element.style.overflowY = get_property(index, "OverflowY").value;

	element.scrollTop = get_property(index, "ScrollTop").value;
	element.scrollLeft = get_property(index, "ScrollLeft").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	var panel = document.getElementById(element.id + "_panel");
	panel.style.width = get_property(index, "PanelWidth").value + "px";
	panel.style.height = get_property(index, "PanelHeight").value + "px";

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;
	panel.style.backgroundColor = get_property(index, "BackgroundColor").value;

	objects[index].name = get_property(index, "Name").value;
	panel.id = objects[index].name + "_panel";
	element.id = objects[index].name;
}

tabcontrol_draw = function(element, index)
{
	var tab_panel = new Array();
	var tab_tab = new Array();
	var tab_total = parseInt(get_property(index, "Tabs.Amount").value);
	var tab_height = parseInt(get_property(index, "Tabs.Height").value);

	var width = parseInt(get_property(index, "Width").value);
	var height = parseInt(get_property(index, "Height").value);

	for (i = 0; i < tab_total; i++)
	{
		tab_panel[i] = document.getElementById(objects[index].name + "_panel_" + i);

		var align = get_property(index, "Tabs.Alignment").value;

		if (align == "top")
		{
			tab_panel[i].style.top = tab_height + "px";
			tab_panel[i].style.left = "0px";

			tab_panel[i].style.width = width + "px";
			tab_panel[i].style.height = (height - tab_height - 1) + "px";
		}
		else if (align == "right")
		{
			tab_panel[i].style.top = "0px";
			tab_panel[i].style.left = "0px";

			tab_panel[i].style.width = (width - tab_height - 1) + "px";
			tab_panel[i].style.height = height + "px";
		}
		else if (align == "bottom")
		{
			tab_panel[i].style.top = "0px";
			tab_panel[i].style.left = "0px";

			tab_panel[i].style.width = width + "px";
			tab_panel[i].style.height = (height - tab_height - 1) + "px";
		}
		else if (align == "left")
		{
			tab_panel[i].style.top = "0px";
			tab_panel[i].style.left = (tab_height + 1) + "px";

			tab_panel[i].style.width = (width - tab_height - 1) + "px";
			tab_panel[i].style.height = height + "px";
		}

		tab_panel[i].style.zIndex = parseInt(get_property(index, "ZIndex").value);
		tab_panel[i].style.backgroundColor = get_property(index, "BackgroundColor").value;

		tab_panel[i].style.borderColor = get_property(index, "BorderColor").value;
		tab_panel[i].style.borderRadius = get_property(index, "BorderRadius").value;
		tab_panel[i].style.borderStyle = get_property(index, "BorderStyle").value;
		tab_panel[i].style.borderWidth = get_property(index, "BorderWidth").value;

		if (i == parseInt(get_property(index, "Tabs.Select").value))
			tab_panel[i].style.visibility = "visible";
		else
			tab_panel[i].style.visibility = "hidden";

		//objects[index].element.appendChild(tab_panel[i]);

		tab_tab[i] = document.getElementById(objects[index].name + "_tab_" + i);

		if (align == "top")
		{
			tab_tab[i].style.top = "0px";
			tab_tab[i].style.left = ((parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i) + "px";
			tab_tab[i].style.transform = "";
		}
		else if (align == "right")
		{
			tab_tab[i].style.top = ((parseInt(get_property(index, "Tabs.Width").value) / 2) + (parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i) - 14 + "px";
			tab_tab[i].style.left = width - parseInt(get_property(index, "Tabs.Width").value) + (parseInt(get_property(index, "Tabs.Width").value) / 2) - 15 + "px";
			tab_tab[i].style.transform = "rotate(90deg)";
		}
		else if (align == "bottom")
		{
			tab_tab[i].style.top = (height - tab_height) + "px";
			tab_tab[i].style.left = ((parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i) + "px";
			tab_tab[i].style.transform = "";
		}
		else if (align == "left")
		{
			tab_tab[i].style.top = ((parseInt(get_property(index, "Tabs.Width").value) / 2) + (parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * ((tab_total - i) - 1)) - 14 + "px";
			tab_tab[i].style.left = -(parseInt(get_property(index, "Tabs.Height").value)) - 5 + "px";
			tab_tab[i].style.transform = "rotate(-90deg)";
		}

		tab_tab[i].style.zIndex = parseInt(get_property(index, "ZIndex").value) + 1;

		tab_tab[i].style.paddingLeft = parseInt(get_property(index, "Tabs.PaddingLeft").value) + "px";
		tab_tab[i].style.paddingTop = parseInt(get_property(index, "Tabs.PaddingTop").value) + "px";

		tab_tab[i].style.width = parseInt(get_property(index, "Tabs.Width").value) - parseInt(get_property(index, "Tabs.PaddingLeft").value) + "px";
		tab_tab[i].style.height = parseInt(get_property(index, "Tabs.Height").value) - parseInt(get_property(index, "Tabs.PaddingTop").value) - 1 + "px";

		tab_tab[i].style.backgroundColor = get_property(index, "Tabs.BackgroundColor").value;

		tab_tab[i].style.borderColor = get_property(index, "Tabs.BorderColor").value;
		tab_tab[i].style.borderRadius = get_property(index, "Tabs.BorderRadius").value;
		tab_tab[i].style.borderStyle = get_property(index, "Tabs.BorderStyle").value;
		tab_tab[i].style.borderWidth = get_property(index, "Tabs.BorderWidth").value;

		tab_tab[i].style.color = get_property(index, "Tabs.FontColor").value;
		tab_tab[i].style.fontFamily = get_property(index, "Tabs.FontFamily").value;
		tab_tab[i].style.fontSize = get_property(index, "Tabs.FontSize").value;

		tab_tab[i].innerHTML = get_property(index, "Tabs.Names").value.split(",")[i];

		if (i == parseInt(get_property(index, "Tabs.Select").value))
		{
			if (get_property(index, "Tabs.Alignment").value != "bottom")
			{
				tab_tab[i].style.borderBottom = "0px";
				tab_tab[i].style.height = (parseInt(get_property(index, "Tabs.Height").value) + parseInt(get_property(index, "Tabs.BorderWidth").value) - parseInt(get_property(index, "Tabs.PaddingTop").value)) - 1 + "px";
				tab_tab[i].style.backgroundColor = get_property(index, "Tabs.SelectColor").value;
			}
			else
			{
				tab_tab[i].style.borderTop = "0px";
				tab_tab[i].style.paddingTop = parseInt(get_property(index, "Tabs.PaddingTop").value) + parseInt(get_property(index, "Tabs.BorderWidth").value) + "px";
				tab_tab[i].style.backgroundColor = get_property(index, "Tabs.SelectColor").value;
			}
		}

		objects[index].element.appendChild(tab_tab[i]);
	}

	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	element.style.paddingLeft = "0px";
	element.style.paddingRight = "0px";
	element.style.paddingTop = "0px";
	element.style.paddingBottom = "0px";

	element.style.marginLeft = "0px";
	element.style.marginRight = "0px";
	element.style.marginTop = "0px";
	element.style.marginBottom = "0px";

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	if (objects[index].name != get_property(index, "Name").value)
	{
		for (var i = 0; i < objects.length; i++)
			if (objects[i].parent == objects[index].name)
				objects[i].parent = get_property(index, "Name").value;
	}

	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

tilemap_draw = function(element, index)
{
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	element.style.borderColor = get_property(index, "BorderColor").value;
	element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
	element.style.borderStyle = get_property(index, "BorderStyle").value;
	element.style.borderWidth = get_property(index, "BorderWidth").value + "px";

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	element.style.padding = "0px";
	element.style.margin = "0px";

	element.style.overflow = get_property(index, "Overflow").value;

	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	objects[index].name = get_property(index, "Name").value;

	var map = document.getElementById(element.id + "_map");
	var ctx = map.getContext("2d");

	var map_height = parseInt(get_property(index, "MapHeight").value);
	var map_width = parseInt(get_property(index, "MapWidth").value);
	var tile_height = parseInt(get_property(index, "TileHeight").value);
	var tile_width = parseInt(get_property(index, "TileWidth").value);

	var tile_color = get_property(index, "TileBackgroundColor").value;
	var offset = parseInt(get_property(index, "TileBorderWidth").value);

	map.height = map_height * tile_height;
	map.width = map_width * tile_width;

	for (var i = 0; i < map_height; i++)
	{
		for (var j = 0; j < map_width; j++)
		{
			ctx.fillStyle = tile_color;
			ctx.fillRect((j * tile_width) + offset, (i * tile_height) + offset, tile_width - (offset * 2), tile_height - (offset * 2));
		}
	}

	map.id = objects[index].name + "_map";
	document.getElementById(element.id + "_mapdiv").id = objects[index].name + "_mapdiv";
	element.id = objects[index].name;
}

tileselect_draw = function(element, index)
{
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	element.style.borderColor = get_property(index, "BorderColor").value;
	element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
	element.style.borderStyle = get_property(index, "BorderStyle").value;
	element.style.borderWidth = get_property(index, "BorderWidth").value + "px";

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;

	element.style.overflowY = "hidden";
	element.style.overflowY = get_property(index, "Overflow").value;

	if (get_property(index, "Overflow").value == "hidden")
		element_width = parseInt(get_property(index, "GridWidth").value) * parseInt(get_property(index, "TileWidth").value);
	else
		element_width = (parseInt(get_property(index, "GridWidth").value) * parseInt(get_property(index, "TileWidth").value)) + parseInt(get_property(index, "ScrollbarWidth").value);

	element.style.width = element_width + "px";
	element.style.height = get_property(index, "Height").value + "px";

	element.style.padding = "0px";
	element.style.margin = "0px";

	objects[index].width = element_width;
	objects[index].height = parseInt(get_property(index, "Height").value);

	objects[index].name = get_property(index, "Name").value;

	var tile_files = get_property(index, "Tileset").value.split(",");

	if (tile_files[0] == "")
		tile_files.length = 0;

	objects[index].tilecount = tile_files.length;

	var grid = document.getElementById(element.id + "_grid");

	while (grid.firstChild) 
	{
    	grid.removeChild(grid.lastChild);
	}

	var grid_width = parseInt(get_property(index, "GridWidth").value);
	var tile_height = parseInt(get_property(index, "TileHeight").value);
	var tile_width = parseInt(get_property(index, "TileWidth").value);

	grid.height = Math.ceil(objects[index].tilecount / tile_width) * tile_height;
	grid.width = grid_width * tile_width;

	if (get_property(index, "Tileset").value != "")
	{
		for (var i = 0; i < tile_files.length; i++)
		{
			var element = document.createElement("img");
			element.id = get_property(index, "Name").value + "_tile_" + i;
			element.style.position = "absolute";

			element.style.left = ((i % grid_width) * tile_height) + "px";
			element.style.top = (Math.floor(i / grid_width) * tile_height) + "px";
			element.src = project_folder + "/" + tile_files[i];

			grid.appendChild(element);
		}
	}

	set_property(index, "TileCount", tile_files.length);

	grid.id = objects[index].name + "_grid";
	element.id = objects[index].name;
}

window_draw = function(element, index)
{
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	element.style.borderColor = get_property(index, "BorderColor").value;
	element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
	element.style.borderStyle = get_property(index, "BorderStyle").value;
	element.style.borderWidth = get_property(index, "BorderWidth").value + "px";

	//element.style.fontFamily = get_property(index, "FontFamily").value;
	//element.style.fontSize = get_property(index, "FontSize").value;

	element.style.paddingLeft = parseInt(get_property(index, "PaddingLeft").value) + "px";
	element.style.paddingRight = parseInt(get_property(index, "PaddingRight").value) + "px";
	element.style.paddingTop = parseInt(get_property(index, "PaddingTop").value) + "px";
	element.style.paddingBottom = parseInt(get_property(index, "PaddingBottom").value) + "px";

	element.style.marginLeft = parseInt(get_property(index, "MarginLeft").value) + "px";
	element.style.marginRight = parseInt(get_property(index, "MarginRight").value) + "px";
	element.style.marginTop = parseInt(get_property(index, "MarginTop").value) + "px";
	element.style.marginBottom = parseInt(get_property(index, "MarginBottom").value) + "px";

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	if (get_property(index, "BoxShadow").value == "true")	
		element.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";
	else
		element.style.boxShadow = "";

	element_header = document.getElementById(element.id + "_header");

	element_header.style.top = "0px";
	element_header.style.left = "0px";

	element_header.style.width = parseInt(get_property(index, "Width").value) + "px";
	element_header.style.height = "30px";

	element_header.style.borderWidth = "1px";
	element_header.style.borderStyle = "hidden";

	element_header.style.backgroundColor = "#dee1e6";

	var header_text = document.getElementById(element.id + "_header_text");

	header_text.style.top = parseInt(get_property(index, "TitleBar.TextTop").value) + "px";
	header_text.style.left = parseInt(get_property(index, "TitleBar.TextLeft").value) + "px";

	header_text.style.fontFamily = get_property(index, "TitleBar.FontFamily").value;
	header_text.style.fontSize = get_property(index, "TitleBar.FontSize").value;
	header_text.style.color = get_property(index, "TitleBar.FontColor").value;

	header_text.innerHTML = get_property(index, "TitleBar.Text").value;

	var gap = 45;

	header_boxx = document.getElementById(element.id + "_header_boxx");

	if (get_property(index, "Buttons.CloseButton").value == "true")
	{
		header_boxx.style.left = (parseInt(element_header.style.width) - gap) + "px";
		header_boxx.style.paddingTop = "5px";

		gap += 45;
	}

	header_boxx.style.width = "45px";
	header_boxx.style.height = "25px";
	
	header_boxmax = document.getElementById(element.id + "_header_boxmax");

	if (get_property(index, "Buttons.MaxButton").value == "true")
	{
		header_boxmax.style.left = (parseInt(element_header.style.width) - gap) + "px";
		header_boxmax.style.paddingTop = "5px";

		gap += 45;
	}

	header_boxmax.style.width = "45px";
	header_boxmax.style.height = "25px";

	header_boxmin = document.getElementById(element.id + "_header_boxmin");

	if (get_property(index, "Buttons.MinButton").value == "true")
	{
		header_boxmin.style.left = (parseInt(element_header.style.width) - gap) + "px";
		header_boxmin.style.paddingTop = "5px";
	}

	header_boxmin.style.width = "45px";
	header_boxmin.style.height = "25px";

	if (get_property(index, "Buttons.CloseButton").value == "true")
		header_boxx.style.visibility = "visible";
	else
		header_boxx.style.visibility = "hidden";

	if (get_property(index, "Buttons.MaxButton").value == "true")
		header_boxmax.style.visibility = "visible";
	else
		header_boxmax.style.visibility = "hidden";

	if (get_property(index, "Buttons.MinButton").value == "true")
		header_boxmin.style.visibility = "visible";
	else
		header_boxmin.style.visibility = "hidden";

	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

openfiledialog_draw = function(element, index)
{
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	element.style.width = "42px";
	element.style.height = "42px";

	objects[index].width = 42;
	objects[index].height = 42;

	element.style.padding = "0px";
	element.style.margin = "0px";

	element.innerHTML = "<img src = \"img/openbutton.png\">";
}

savefiledialog_draw = function(element, index)
{
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	element.style.width = "42px";
	element.style.height = "42px";

	objects[index].width = 42;
	objects[index].height = 42;

	element.style.padding = "0px";
	element.style.margin = "0px";

	element.innerHTML = "<img src = \"img/savebutton.png\">";
}

editor_draw = function(element, index)
{
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	element.style.paddingLeft = parseInt(get_property(index, "PaddingLeft").value) + "px";
	element.style.paddingRight = parseInt(get_property(index, "PaddingRight").value) + "px";
	element.style.paddingTop = parseInt(get_property(index, "PaddingTop").value) + "px";
	element.style.paddingBottom = parseInt(get_property(index, "PaddingBottom").value) + "px";

	element.style.marginLeft = parseInt(get_property(index, "MarginLeft").value) + "px";
	element.style.marginRight = parseInt(get_property(index, "MarginRight").value) + "px";
	element.style.marginTop = parseInt(get_property(index, "MarginTop").value) + "px";
	element.style.marginBottom = parseInt(get_property(index, "MarginBottom").value) + "px";

	element.style.borderColor = get_property(index, "BorderColor").value;
	element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
	element.style.borderStyle = get_property(index, "BorderStyle").value;
	element.style.borderWidth = get_property(index, "BorderWidth").value + "px";

	element.style.backgroundColor = "#404040";
	element.style.visibility = get_property(index, "Visibility").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	var element_canvas = document.getElementById(element.id + "_canvas");
	element_canvas.style.width = get_property(index, "Width").value + "px";
	element_canvas.style.height = get_property(index, "Height").value + "px";

	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	if (objects[index].name != get_property(index, "Name").value)
	{
		for (var i = 0; i < objects.length; i++)
			if (objects[i].parent == objects[index].name)
				objects[i].parent = get_property(index, "Name").value;
	}

	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}
