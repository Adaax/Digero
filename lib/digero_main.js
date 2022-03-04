// digero_main.js contains all component creation files, as well as the _draw and _create functions for each component.
// It also contains global variable definitions, and interface creation functions, including the window.onload function.

var nw = require('nw.gui');
var fs = require('fs');
var cp = require('child_process');
var vm = require('vm');
var os = require('os');

// nwin retrieves the window defined when the NW.js "nw" function is invoked
var nwin = nw.Window.get();

// the toolbox object that will be created when the window loads
var main_toolbox;

// the array that will contain all the objects in the current project
var objects = new Array();

// stores the objects used in cut/copy and paste operations
var objects_reserve = new Array();

// stores the names and types of object arrays
var arrays = new Array();

// stores the function definitions for components
var tools_fx = new Array();

// stores lists of events for each component
var object_events = new Array();

// stores information for the Explorer window
var project_explore = new Array();

// stores the home directory of Digero
var homedir;

// stores the file and folder of the included NW.js sdk zip file
var nwjs_file;

// the folder for project images
var img_folder;

// stores the Explorer div
var propex;

// variables used in cut/copy and paste operations
var copy_left;
var copy_top;
var copy_type;
var copy_num;

// variable used when context menu opened for some components
var block_context = -1;

// stores the id of the component with focus
var object_focus;

// used to calculate time between mousedown and mouseup events
var click_timer_id;
var click_timer;

// times the moving of tabs when the left and right tab arrows are selected
var tab_shift_interval;

// used when dragging tabs left and right
var tab_select = null;
var tab_select_left = -1;
var tab_select_x = -1;

// set when a component is selected
var element_flag = false;

var outline_flag = false;
var current_form = 0;
var mouse_hover = null;

var paste_x = -1;
var paste_y = -1;
var paste_form = 0;

// these variables are used when a column header in a data grid is right-clicked
var select_table;
var col_select;

var ctrl_flag;
var focus_element;

// stores the project folder when a project is opened
var project_folder;

// the system folder is retrieved when the main Digero window loads
var system_folder;

var form_file;
var project_file;

var open_type;
var file_object_index;
var file_property_index;

// these are the fonts that will appear in the Properties window for relevant properties
var fonts = "ABeeZee,Arial,Courier New,PressStart,CourierPrime,GlassTTY,GrandNational,LinuxLibertine,Sunflower,RetroGaming";

// these are the mouse cursor values that will appear in the Properties window for relevant properties
var cursors = "default,crosshair,pointer,inherit"

// these are the text align values that will appear in the Properties window for relevant properties
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

// the Digero window is scaled regularly
var window_zoom = 1;

// variables for the tooltip
var tooltip;
var tooltip_id;

// set the toolbar height
var toolbar_height = 30;

window.onload = function()
{
	// maximize the NW.js window
	nwin.maximize();

	// store local directories for later use
	homedir = os.homedir().replaceAll("\\", "/");
	img_folder = process.cwd().replaceAll("\\", "/") + "/img";

	project_folder = process.cwd();
	system_folder = process.cwd();

	// stores location and name of NW.js SDK zip file - this may change if file is updated
	nwjs_file = process.cwd().replaceAll("\\", "/") + "/nwjs/nwjs-sdk-v0.54.1-win-x64.zip";

	// set background colour of application page
	document.body.style.backgroundColor = "#304361";

	// these are used when creating new projects
	form_file = "digero_objects.json";
	project_file = "digero_project.json";

	// if a mouse button is pushed anywhere in the application window, remove the menu bar submenus, if any
	document.body.addEventListener("mousedown", function(evt) 
	{
		// menu_flag is set to true when an item registers a mousedown event, cancelling this action
		if (menu_flag == false && main_menubar.submenu_show == true)
		{
			// set when a sebmenu is visible
			main_menubar.submenu_show = false;

			// there may be more than one submenu div open (i.e. sub-submenus); all must be removed
			for (var i = 0; i < main_menubar.submenu_divs.length; i++)
				main_menubar.submenu_divs[i].parentElement.removeChild(main_menubar.submenu_divs[i]);

			// these arrays store the submenu divs and item divs
			main_menubar.submenu_divs.length = 0;
			main_menubar.submenu_items.length = 0;

			// this flag is set, and then picked up by mouseup events in the item divs
			menu_close = true;
		}
		// set menu_flag to false, to be set to true again if an item sets it
		else
			menu_flag = false;
	}, false);

	// set menu_close back to false - it would have been set to true in the mousedown event above
	document.body.addEventListener("mouseup", function(evt) 
	{
		menu_close = false;
	}, false);

	// create the div that will be used for tooltips in the toolbar
	tooltip = document.createElement("div");
    tooltip.id = "tooltip";
    tooltip.style.position = "absolute";

    // locate it offscreen for now
    tooltip.style.left = "-1000px";
    tooltip.style.top = "0px";

    // style is set here - could arguably be made customizable down the road
    tooltip.style.backgroundColor = "#c0c0c0";
    tooltip.style.color_select = "#101010";
    tooltip.style.fontSize = "12px";
    tooltip.style.fontFamily = "Arial";

    tooltip.style.paddingTop = "1px";
    tooltip.style.paddingLeft = "1px";
    tooltip.style.paddingRight = "2px";

    // set the z-index so the tooltip is over everything
    tooltip.style.zIndex = 1000;

    document.body.appendChild(tooltip);

    // The events for each component type are added to an array here. They are called on when a coding tab is opened,
    // and an event is selected to build code within.

    // form_starting represents the main (first) form in the project
	index = object_events.length;
	object_events[index] = {};
	object_events[index].type = "form_starting";
	object_events[index].events = "click,load,mousedown,mousemove,mouseover,mouseup";

	// forms are a special type of component, i.e. not in the toolbox
	index = object_events.length;
	object_events[index] = {};
	object_events[index].type = "form";
	object_events[index].events = "click,load,mousedown,mousemove,mouseover,mouseup";

	// events and components are added here - perhaps make this a JSON file in the future
	index = object_events.length;
	object_events[index] = {};
	object_events[index].type = "button";
	object_events[index].events = "click,mousedown,mousemove,mouseover,mouseup";

	// index is always set to the current array length, so new entries can be added anywhere in the list
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

	// a statusbar object is created for the application window (see digero_support.js)
	main_statusbar = new statusbar({
		"id": "main_statusbar",
		"height": 24,
		"background": "#007acc"
	});

	// a toolbar object is created for the application window (see digero_support.js)
	main_toolbar = new toolbar({
		"id": "main_toolbar",
		"top": 25,
		"height": 34,
		"background": "#2d2d30",
		"backgroundHover": "#3e3e40",
		"backgroundSub": "#1b1b1c",
		"backgroundClick": "#007acc"
	});

	// New toolbar buttons are created here. Each button uses three parameters: the tooltip, the image button, and
	// the function to be called when the button is clicked.
	main_toolbar.add_item("New Project (Ctrl+N)", "img/newbutton.png", function()
		{
			main_project.show();
		});

	// Mmst (or all) of these functions may be found in digero_support.js
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

	// the break item creates a vertical line break in the toolbar, using the provided image
	main_toolbar.add_break("img/break.png");

	// it is important to make sure that these function calls are consistent with the equivalent menu bar options
	main_toolbar.add_item("Function Explorer (F8)", "img/funcexp.png", function()
		{
			main_functions.go_functions();
			main_functions.show();
		});

	// a menubar object is created for the application window (see digero_support.js)
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

	// the "items" in the menubar are the top-level labels for each menu
	main_menubar.add_item("File");

	// Each sub item contains five parameters: 1) the name of the menu (i.e. the "item") that it falls under,
	// 2) the name of the sub item itself, 3) the keyboard shortcut, if any, that will appear in the menu,
	// 4) if the sub item points to a subsub item, true or false, and 5) the function to run when selected.

	main_menubar.add_subitem("File", "New", "", true, function() {});

	// each subsub item has an additional parameter (parameter 2) to indicate the above sub item
	main_menubar.add_subsubitem("File", "New", "Project", "Ctrl+N", false, function()
		{
			main_project.show();
		});

	// i.e. all of these menu entries will be listed in the File > New subsubmenu
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

	// this context menu will be used with more complex components such as the DataGrid
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

	// the Toolbox is where all of the available components are listed, and can be selected
	main_toolbox = new toolbox({
		"id": "main_toolbox",
		"x": 5,
		"y": 30 + toolbar_height,
		"width": 150,
		"height": 665 - toolbar_height,
		"background": "#252526",
		"background_header": "#007acc"
	});

	// Each created tool passes a JSON object with two keys: the name, and the image. Both are displayed in the list
	// of tools in the toolbox. The JSON values are stored in an array in the toolbox object. When a tool is selected,
	// the index of that tool is stored in a variable in the object that may be queried.

	// the Pointer is a special-case tool that, when selected, allows the user to select components in a form
	main_toolbox.add_tool({
		"name": "Pointer",
		"image": "img/pointer.png"
	});

	// all other tools in the toolbox, with the exception of headers (see below), are actual tools
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

	// the header (indicated in the name) is for display purposes, and is not an actual tool
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

	// the Pointer tool is selected (and highlighted) by default
	main_toolbox.set_tool(0);

	// the formspace is the central div in Digero, which may contain form, code, and data tabs
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

	// the formspace is linked to the toolbox
	main_formspace.set_toolbox(main_toolbox);

	// no tabs appear by default
	main_formspace.clear_tabs();

	// the propex div contains both the Properties window and the Explorer window
	propex = document.createElement("div");
	propex.id = "propex";
	propex.style.position = "absolute";

	propex.style.width = "292px";
	propex.style.height = "865px";

	propex.style.top = (30 + toolbar_height) + "px";
	propex.style.left = "985px";

	propex.style.visibility = "visible";

	document.body.appendChild(propex);

	// the main_propex object contains a resize function that is called when the relevant resize_div is moved
	main_propex = new propex_div();

	// the main_properties window lists the property of any component that is selected (see digero_support.js)
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

	// the main_explore window lists the elements of the current project (see digero_support.js)
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

	// the go_project function builds the elements for the current project (which is empty at this point)
	main_explore.go_project();

	// the main_functions dialog box displays all the functions contained within a project's code files
	main_functions = new functions_dialog({
		"id": "main_functions",
		"x": 5,
		"y": 5,
		"width": 600,
		"height": 650,
		"background": "#f0f0f0",
		"background_header": "#ffffff"	
	});

	// the main_template dialog box allows for the creation of component templates
	main_template = new template_dialog({
		"id": "main_template",
		"x": 5,
		"y": 5,
		"width": 427,
		"height": 350,
		"background": "#f0f0f0",
		"background_header": "#ffffff"	
	});

	// the main_project dialog box is used in the creation of new projects
	main_project = new project_dialog({
		"id": "project_dialog",
		"x": 5,
		"y": 5,
		"width": 700,
		"height": 500,
		"background": "#252525",
		"background_header": "#ffffff"	
	});

	// The resize_div objects are composed of divs that are placed in between the various elements of the main
	// application window. A resize cursor appears when the mouse hovers over them, and they can be clicked and
	// dragged to resize elements and windows in the application. The JSON keys "element1" and "element2" map
	// the elements on either side (horizontal or vertical, as indicated by "dir") of the resize div.

	// this div is placed in between the toolbox and the main_formspace (the main window, where tabs are added).
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

	// this div is placed in between main_formspace and the Properties and Explorer windows
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

	// this div is placed horizontally between the Properties and Explorer windows
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

	// Now the tools_fx array is built. This array contains the functions that are invoked whenever an element
	// is drawn on a form. The "create" function is called whenever the user, using the mouse, defines a
	// rectangular space on the form (as soon as the mouseup event occurs). Apart from the special Pointer
	// component, these are long functions, as all of the component properties have to be created.

	// Components are matched by name when the create function is invoked, so they can appear in the tools_fx
	// array in any order. However, they appear here in the order they appear in the Toolbox.

	// the Pointer is a special component that is used to select other components on a form
	tools_fx[0] = {};
	tools_fx[0].name = "Pointer";

	tools_fx[0].create = function(outline_div)
	{
		if (mouse_hover == null)
			return;

		// outline_div is the dotted outline that appears when the user defines a rectangular space
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		// the x/y coordinates (above) and width and height (below) of the outline are stored
		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		// if the width or height are too few pixels, skip the rest of this function
		if (width > 4 && height > 4)
		{
			// the outline div is removed from the form and appended to the tab div that contains it
			outline_div.parentElement.removeChild(outline_div);
			main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

			outline_div.style.width = "0px";
			outline_div.style.height = "0px";

			// move the outline div out of visible range
			outline_div.style.left = "-100px";
			outline_div.style.top = "-100px";

			// mouse_hover contains the id of the tab form the mouse is over
			var parent_name = mouse_hover;

			// here we build an array of all of the components within the rectangle defined by the Pointer
			select_group.length = 0;

			// objects is the array that contains all of the components in the project
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

	// From here on out, index is always set to the length of the tools_fx array, so that new components may
	// be added anywhere without having to recalculate index values

	// the adjuster is a readout component, with buttons on either side to adjust the displayed value
	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "Adjuster";

	tools_fx[index].create = function(outline_div)
	{
		// the outline_div defines the rectangle of space on the form defined by the user
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		// the outline div is removed from the form and appended to the tab div that contains it
		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		// move the outline div out of visible range
		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		// the next several lines are used to create a default name for the component
		var counter = 0;

		// keep adding 1 to counter for every component of the same type that exists
		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "adjuster")
				counter++;

		var valid_name = false;

		// then increment counter again each time a component with the attempted name exists
		while (valid_name == false)
		{
			// get object returns a component in the objects array with the given name, or null if none exists
			if (get_object("Adjuster" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		// this retrieves the id of the currently highlighted component (form or container)
		var parent_name = mouse_hover;

		// get the length of the objects array and use it as an index
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

		// adjust the position of the object if it is in a container
		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		// begin creating the component in the objects array
		objects[obj_index] = {};

		objects[obj_index].name = "Adjuster" + (counter + 1);
		objects[obj_index].type = "adjuster";

		// element_type means the initial element to draw on the canvas
		objects[obj_index].element_type = "div";

		// form here is a numerical value
		objects[obj_index].form = get_object(parent_name).form;

		// the x/y top/left values for the component are stored directly, as well as in the properties
		objects[obj_index].top = y;
		objects[obj_index].left = x;

		// set z-index to just above parent z-index
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height + 1;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		// the properties array holds all of the properties that will display in the Properties window
		objects[obj_index].properties = new Array();

		// index is always set to the length of the array, so that new properties may be added in later
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

		// header properties have no value - they tell the Properties window to create a header
		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Box";
		objects[obj_index].properties[index].type = "header";

		// properties underneath a header go by "[header name].[property name]"
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

		// now we create the main div on the form
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

		// For the adjuster, three elements are added to the main div - a text field in the center, and arrow images on either side.
		// The names of these elements are [name]_sub1, [name]_sub2, and [name]_sub3.
		
		objects[obj_index].element_sub1 = document.createElement("img");
		objects[obj_index].element_sub1.id = "Adjuster" + (counter + 1) + "_sub1";
		objects[obj_index].element_sub1.style.position = "absolute";

		objects[obj_index].element_sub1.style.top = "0px";
		objects[obj_index].element_sub1.style.left = "0px";
		objects[obj_index].element_sub1.src = "img/adjuster_left.png";

		// this is called when the arrow image loads, with the element height passed as a parameter
		objects[obj_index].element_sub1.addEventListener("load", function (this_height)
		{
			return function(evt)
			{
				// adjust the y of the image so that it is vertically centered
				this.style.top = Math.floor((this_height - this.height) / 2) + "px";
			}
		} (height + 1), false);

		// _sub2 is the text field, positioned in between the arrow images
		objects[obj_index].element_sub2 = document.createElement("div");
		objects[obj_index].element_sub2.id = "Adjuster" + (counter + 1) + "_sub2";
		objects[obj_index].element_sub2.style.position = "absolute";

		objects[obj_index].element_sub2.style.top = "0px";

		// this x value here positions the text field to the right of the left arrow image
		objects[obj_index].element_sub2.style.left = "11px";

		objects[obj_index].element_sub2.style.width = (width - 24) + "px";
		objects[obj_index].element_sub2.style.height = height + "px";

		objects[obj_index].element_sub2.style.fontFamily = "ABeeZee";
		objects[obj_index].element_sub2.style.fontSize = "12px";

		objects[obj_index].element_sub2.style.backgroundColor = "#ffffff";
		objects[obj_index].element_sub2.style.borderStyle = "solid";
		objects[obj_index].element_sub2.style.borderWidth = "1px";

		// it is assumed that the text in the field will be an integer value
		objects[obj_index].element_sub2.innerHTML = "0";

		objects[obj_index].element_sub3 = document.createElement("img");
		objects[obj_index].element_sub3.id = "Adjuster" + (counter + 1) + "_sub3";
		objects[obj_index].element_sub3.style.position = "absolute";

		objects[obj_index].element_sub3.style.top = "0px";
		objects[obj_index].element_sub3.style.left = "0px";
		objects[obj_index].element_sub3.src = "img/adjuster_right.png";

		// this is called when the arrow image loads, with the element height and weight passed as parameters
		objects[obj_index].element_sub3.addEventListener("load", function (this_height, this_width)
		{
			return function(evt)
			{
				// the text field is centered within the element div
				this.style.left = (this_width - this.width) + "px";

				// vertically center the element within the div
				this.style.top = Math.floor((this_height - this.height) / 2) + "px";
			}
		} (height + 1, width), false);	

		// if the (non-form) parent element of the div is scrolled vertically, adjust the y value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the y value of the main div
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";

			// set the top value for the element in the objects array
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;

			// finally, set the "Top" property in the object's properties
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		// if the (non-form) parent element of the div is scrolled horizontally, adjust the x value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the x value of the main div
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";

			// set the left value for the element in the objects array			
			objects[obj_index].left = objects[obj_index].left + document.getElementById(parent_name).scrollLeft;

			// finally, set the "Left" property in the object's properties
			set_property(obj_index, "Left", objects[obj_index].left);
		}

		// double-check that the top/left values are synched
		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		// add the component div to its parent element/form
		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		// add the three sub-elements of the adjuster to the main div
		objects[obj_index].element.appendChild(objects[obj_index].element_sub1);
		objects[obj_index].element.appendChild(objects[obj_index].element_sub2);
		objects[obj_index].element.appendChild(objects[obj_index].element_sub3);

		// The following two events are needed for when new arrow images are loaded into the image elements - the positions of
		// either image are readjusted to be centered vertically, and positioned along either edge of the parent element.

		objects[obj_index].element_sub1.addEventListener("load", function()
		{
				// get the parent div of the image element
				var parent_div = document.getElementById(this.id.substring(0, this.id.indexOf("_")));

				// move the element to the left edge of the parent element
				this.style.left = "0px";

				// vertically center the image element
				this.style.top = Math.floor((parseInt(parent_div.style.height) - this.height) / 2) + "px";
		}, false);

		objects[obj_index].element_sub3.addEventListener("load", function()
		{
				// get the parent div of the image element
				var parent_div = document.getElementById(this.id.substring(0, this.id.indexOf("_")));

				// move the element to the right edge of the parent element
				this.style.left = (parseInt(parent_div.style.width) - this.width) + "px";
					
				// vertically center the image element
				this.style.top = Math.floor((parseInt(parent_div.style.height) - this.height) / 2) + "px";
		}, false);

		// if the user clicks on this element, and Pointer is selected in the toolbox, give the element focus
		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		// set the focus to the element after it has been added
		main_formspace.set_outline_focus("Adjuster" + (counter + 1));

		// set the toolbox so that Pointer is selected
		main_toolbox.set_tool(0);
	}

	// the Button is a div whose border and margin properties can change when it is clicked
	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "Button";

	tools_fx[index].create = function(outline_div)
	{
		// the outline_div defines the rectangle of space on the form defined by the user
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		// the outline div is removed from the form and appended to the tab div that contains it
		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		// move the outline div out of visible range
		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		// the next several lines are used to create a default name for the component
		var counter = 0;

		// keep adding 1 to counter for every component of the same type that exists
		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "button")
				counter++;

		var valid_name = false;

		// then increment counter again each time a component with the attempted name exists
		while (valid_name == false)
		{
			// get object returns a component in the objects array with the given name, or null if none exists
			if (get_object("Button" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		// this retrieves the id of the currently highlighted component (form or container)
		var parent_name = mouse_hover;

		// get the length of the objects array and use it as an index
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

		// adjust the position of the object if it is in a container
		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		// begin creating the component in the objects array
		objects[obj_index] = {};

		objects[obj_index].name = "Button" + (counter + 1);
		objects[obj_index].type = "button";

		// element_type means the initial element to draw on the canvas
		objects[obj_index].element_type = "div";

		// form here is a numerical value
		objects[obj_index].form = get_object(parent_name).form;

		// the x/y top/left values for the component are stored directly, as well as in the properties
		objects[obj_index].top = y;
		objects[obj_index].left = x;

		// set z-index to just above parent z-index
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		// the properties array holds all of the properties that will display in the Properties window
		objects[obj_index].properties = new Array();

		// index is always set to the length of the array, so that new properties may be added in later
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

		// header properties have no value - they tell the Properties window to create a header
		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseDown";
		objects[obj_index].properties[index].type = "header";

		// properties underneath a header go by "[header name].[property name]"
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

		// now we create the main div on the form
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

		// the border is designed initially to look like a raised button
		objects[obj_index].element.style.borderStyle = "outset";
		objects[obj_index].element.style.borderWidth = "1px";
		objects[obj_index].element.style.padding = "0px";
		objects[obj_index].element.style.margin = "0px";

		objects[obj_index].element.style.lineHeight = height + "px";
		objects[obj_index].element.style.textAlign = "center";

		objects[obj_index].element.style.fontFamily = "ABeeZee";
		objects[obj_index].element.style.fontSize = "12px";

		objects[obj_index].element.innerHTML = "Button" + (counter + 1);

		// if the (non-form) parent element of the div is scrolled vertically, adjust the y value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the y value of the main div
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";

			// set the top value for the element in the objects array
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;

			// finally, set the "Top" property in the object's properties
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		// if the (non-form) parent element of the div is scrolled horizontally, adjust the x value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the x value of the main div
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";

			// set the left value for the element in the objects array			
			objects[obj_index].left = objects[obj_index].left + document.getElementById(parent_name).scrollLeft;

			// finally, set the "Left" property in the object's properties
			set_property(obj_index, "Left", objects[obj_index].left);
		}

		// double-check that the top/left values are synched
		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		// add the component div to its parent element/form
		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		// if the user clicks on this element, and Pointer is selected in the toolbox, give the element focus
		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		// adds relevant functions to the object
		add_object_fxs(objects[obj_index]);

		// set the focus to the element after it has been added
		main_formspace.set_outline_focus("Button" + (counter + 1));

		// set the toolbox so that Pointer is selected
		main_toolbox.set_tool(0);
	}

	// the Canvas component is actually a div with a canvas in it - it is thus a container component
	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "Canvas";

	tools_fx[index].create = function(outline_div)
	{
		// the outline_div defines the rectangle of space on the form defined by the user
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		// the outline div is removed from the form and appended to the tab div that contains it
		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		// move the outline div out of visible range
		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		// the next several lines are used to create a default name for the component
		var counter = 0;

		// keep adding 1 to counter for every component of the same type that exists
		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "canvas")
				counter++;

		var valid_name = false;

		// then increment counter again each time a component with the attempted name exists
		while (valid_name == false)
		{
			// get object returns a component in the objects array with the given name, or null if none exists
			if (get_object("Canvas" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		// this retrieves the id of the currently highlighted component (form or container)
		var parent_name = mouse_hover;

		// get the length of the objects array and use it as an index
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

		// adjust the position of the object if it is in a container
		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		// begin creating the component in the objects array
		objects[obj_index] = {};

		objects[obj_index].name = "Canvas" + (counter + 1);
		objects[obj_index].type = "canvas";

		// element_type means the initial element to draw on the canvas
		objects[obj_index].element_type = "div";

		// form here is a numerical value
		objects[obj_index].form = get_object(parent_name).form;

		// the x/y top/left values for the component are stored directly, as well as in the properties
		objects[obj_index].top = y;
		objects[obj_index].left = x;

		// set z-index to just above parent z-index
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;

		// the canvas is a container element
		objects[obj_index].container = true;

		// since the container element is the main div, there is no suffix
		objects[obj_index].container_suffix = "";

		// the properties array holds all of the properties that will display in the Properties window
		objects[obj_index].properties = new Array();

		// index is always set to the length of the array, so that new properties may be added in later
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

		// now we create the main div on the form
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

		// if the (non-form) parent element of the div is scrolled vertically, adjust the y value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the y value of the main div
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";

			// set the top value for the element in the objects array
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;

			// finally, set the "Top" property in the object's properties
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		// if the (non-form) parent element of the div is scrolled horizontally, adjust the x value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the x value of the main div
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";

			// set the left value for the element in the objects array			
			objects[obj_index].left = objects[obj_index].left + document.getElementById(parent_name).scrollLeft;

			// finally, set the "Left" property in the object's properties
			set_property(obj_index, "Left", objects[obj_index].left);
		}

		// double-check that the top/left values are synched
		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		// append the Canvas div to the parent Form or container
		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		// create a canvas element, and embed it inside the Canvas div
		objects[obj_index].element_canvas = document.createElement("canvas");
		objects[obj_index].element_canvas.id = "Canvas" + (counter + 1) + "_canvas";
		objects[obj_index].element_canvas.style.position = "absolute";

		objects[obj_index].element_canvas.style.top = "0px";
		objects[obj_index].element_canvas.style.left = "0px";

		objects[obj_index].element_canvas.style.width = width + "px";
		objects[obj_index].element_canvas.style.height = height + "px";

		objects[obj_index].element.appendChild(objects[obj_index].element_canvas);

		// if the user clicks on this element, and Pointer is selected in the toolbox, give the element focus
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

		// set mouse_hover to this element if the mouse is moved over it
		objects[obj_index].element.addEventListener("mousemove", function(evt)
		{
			mouse_hover = this.id;
		}, false);

		// since this component is a container, you can click on it to select a paste location
		objects[obj_index].element.addEventListener("mouseup", function (this_object)
		{
			return function(evt)
			{
				var this_index = this_object.form;

				// set paste_x and paste_y to be the relative x/y location within the container itself
				var rect = this.getBoundingClientRect();
				paste_x = evt.clientX - rect.left;
				paste_y = evt.clientY - rect.top;

				// set the paste form to be the form that this component is in
				paste_form = this_index;
			}
		} (objects[obj_index]), false);

		// set the focus to the element after it has been added
		main_formspace.set_outline_focus("Canvas" + (counter + 1));

		// set the toolbox so that Pointer is selected
		main_toolbox.set_tool(0);
	}

	// The CheckBox component is not the checkbox element available in the DOM. It is instead a combination
	// of an image and a text div. This is to allow for more flexibility in selecting the checkbox image.

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "CheckBox";

	tools_fx[index].create = function(outline_div)
	{
		// the outline_div defines the rectangle of space on the form defined by the user
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		// the outline div is removed from the form and appended to the tab div that contains it
		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		// move the outline div out of visible range
		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		// the next several lines are used to create a default name for the component
		var counter = 0;

		// keep adding 1 to counter for every component of the same type that exists
		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "checkbox")
				counter++;

		var valid_name = false;

		// then increment counter again each time a component with the attempted name exists
		while (valid_name == false)
		{
			// get object returns a component in the objects array with the given name, or null if none exists
			if (get_object("CheckBox" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		// this retrieves the id of the currently highlighted component (form or container)
		var parent_name = mouse_hover;

		// get the length of the objects array and use it as an index
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

		// adjust the position of the object if it is in a container
		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		// begin creating the component in the objects array
		objects[obj_index] = {};

		objects[obj_index].name = "CheckBox" + (counter + 1);
		objects[obj_index].type = "checkbox";

		// element_type means the initial element to draw on the canvas
		objects[obj_index].element_type = "div";

		// form here is a numerical value
		objects[obj_index].form = get_object(parent_name).form;

		// the x/y top/left values for the component are stored directly, as well as in the properties
		objects[obj_index].top = y;
		objects[obj_index].left = x;

		// set z-index to just above parent z-index
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		// the properties array holds all of the properties that will display in the Properties window
		objects[obj_index].properties = new Array();

		// index is always set to the length of the array, so that new properties may be added in later
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

		// header properties have no value - they tell the Properties window to create a header
		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Checked";
		objects[obj_index].properties[index].type = "header";

		// properties underneath a header go by "[header name].[property name]"
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

		// now we create the main div on the form
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

		// The CheckBox contains two other elments, both inside the main div: an image that contains the checkbox image,
		// and a div to the right of it that contains a text label.

		/// the name of the image element is [name]_sub1
		objects[obj_index].element_sub1 = document.createElement("img");
		objects[obj_index].element_sub1.id = "CheckBox" + (counter + 1) + "_sub1";
		objects[obj_index].element_sub1.style.position = "absolute";

		objects[obj_index].element_sub1.style.top = "0px";
		objects[obj_index].element_sub1.style.left = "0px";
		objects[obj_index].element_sub1.src = "img/checkbox_off.png";

		// the name of the text label element is [name]_sub2
		objects[obj_index].element_sub2 = document.createElement("div");
		objects[obj_index].element_sub2.id = "CheckBox" + (counter + 1) + "_sub2";
		objects[obj_index].element_sub2.style.position = "absolute";

		objects[obj_index].element_sub2.style.top = "1px";
		objects[obj_index].element_sub2.style.left = "20px";

		objects[obj_index].element_sub2.style.fontFamily = "ABeeZee";
		objects[obj_index].element_sub2.style.fontSize = "12px";

		objects[obj_index].element_sub2.innerHTML = "CheckBox" + (counter + 1);

		// if the (non-form) parent element of the div is scrolled vertically, adjust the y value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the y value of the main div
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";

			// set the top value for the element in the objects array
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;

			// finally, set the "Top" property in the object's properties
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		// if the (non-form) parent element of the div is scrolled horizontally, adjust the x value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the x value of the main div
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";

			// set the left value for the element in the objects array			
			objects[obj_index].left = objects[obj_index].left + document.getElementById(parent_name).scrollLeft;

			// finally, set the "Left" property in the object's properties
			set_property(obj_index, "Left", objects[obj_index].left);
		}

		// double-check that the top/left values are synched
		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		// add the component div to its parent element/form
		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		// add the two sub-elements of the checkbox to the main div
		objects[obj_index].element.appendChild(objects[obj_index].element_sub1);
		objects[obj_index].element.appendChild(objects[obj_index].element_sub2);

		// if the user clicks on this element, and Pointer is selected in the toolbox, give the element focus
		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		// set the focus to the element after it has been added
		main_formspace.set_outline_focus("CheckBox" + (counter + 1));

		// set the toolbox so that Pointer is selected
		main_toolbox.set_tool(0);
	}

	// The Console component is a div with a command-line prompt embedded in it, and behaves like a terminal window. Note that
	// the component as it appears in Digero is only a div; the prompt is added at runtime.

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "Console";

	tools_fx[index].create = function(outline_div)
	{
		// the outline_div defines the rectangle of space on the form defined by the user
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		// the outline div is removed from the form and appended to the tab div that contains it
		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		// move the outline div out of visible range
		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		// the next several lines are used to create a default name for the component
		var counter = 0;

		// keep adding 1 to counter for every component of the same type that exists
		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "console")
				counter++;

		var valid_name = false;

		// then increment counter again each time a component with the attempted name exists
		while (valid_name == false)
		{
			// get object returns a component in the objects array with the given name, or null if none exists
			if (get_object("Console" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		// this retrieves the id of the currently highlighted component (form or container)
		var parent_name = mouse_hover;

		// get the length of the objects array and use it as an index
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


		// adjust the position of the object if it is in a container
		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		// begin creating the component in the objects array
		objects[obj_index] = {};

		objects[obj_index].name = "Console" + (counter + 1);
		objects[obj_index].type = "console";

		// element_type means the initial element to draw on the canvas
		objects[obj_index].element_type = "div";

		// form here is a numerical value
		objects[obj_index].form = get_object(parent_name).form;

		// the x/y top/left values for the component are stored directly, as well as in the properties
		objects[obj_index].top = y;
		objects[obj_index].left = x;

		// set z-index to just above parent z-index
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		// the properties array holds all of the properties that will display in the Properties window
		objects[obj_index].properties = new Array();

		// index is always set to the length of the array, so that new properties may be added in later
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

		// Now we create the main div on the form. This is the only element that appears on the form within Digero
		// itself. The prompt and other necessary elements are added at runtime, within digero_rutime.js

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

		// if the (non-form) parent element of the div is scrolled vertically, adjust the y value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the y value of the main div
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";

			// set the top value for the element in the objects array
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;

			// finally, set the "Top" property in the object's properties
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		// if the (non-form) parent element of the div is scrolled horizontally, adjust the x value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the x value of the main div
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";

			// set the left value for the element in the objects array			
			objects[obj_index].left = objects[obj_index].left + document.getElementById(parent_name).scrollLeft;

			// finally, set the "Left" property in the object's properties
			set_property(obj_index, "Left", objects[obj_index].left);
		}

		// double-check that the top/left values are synched
		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		// add the component div to its parent element/form
		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		// if the user clicks on this element, and Pointer is selected in the toolbox, give the element focus
		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		// set the focus to the element after it has been added
		main_formspace.set_outline_focus("Console" + (counter + 1));

		// set the toolbox so that Pointer is selected
		main_toolbox.set_tool(0);
	}

	// A DataGrid is a spreadsheet-style matrix of editable cells allowing for basic data entry.

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

	// The DropDownList element creates a drop-down list via the "select" and "option" HTML elements. Basically you enter
	// all option values in the Options property, separated by commas, and Digero will create the necessary HTML elements
	// for you. Also fully CSS formattable using the relevant element properties.

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "DropDownList";

	tools_fx[index].create = function(outline_div)
	{
		// the outline_div defines the rectangle of space on the form defined by the user
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		// the outline div is removed from the form and appended to the tab div that contains it
		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		// move the outline div out of visible range
		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		// the next several lines are used to create a default name for the component
		var counter = 0;

		// keep adding 1 to counter for every component of the same type that exists
		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "dropdownlist")
				counter++;

		var valid_name = false;

		// then increment counter again each time a component with the attempted name exists
		while (valid_name == false)
		{
			// get object returns a component in the objects array with the given name, or null if none exists
			if (get_object("DropDownList" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		// this retrieves the id of the currently highlighted component (form or container)
		var parent_name = mouse_hover;

		// get the length of the objects array and use it as an index
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

		// adjust the position of the object if it is in a container
		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		// begin creating the component in the objects array
		objects[obj_index] = {};

		objects[obj_index].name = "DropDownList" + (counter + 1);
		objects[obj_index].type = "dropdownlist";

		// element_type means the initial element to draw on the canvas
		objects[obj_index].element_type = "select";

		// form here is a numerical value
		objects[obj_index].form = get_object(parent_name).form;

		// the x/y top/left values for the component are stored directly, as well as in the properties
		objects[obj_index].top = y;
		objects[obj_index].left = x;

		// set z-index to just above parent z-index
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		// the properties array holds all of the properties that will display in the Properties window
		objects[obj_index].properties = new Array();

		// index is always set to the length of the array, so that new properties may be added in later
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

		// the Options property contains the options for the select element, separated by commas
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

		// now we create the select element on the form
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

		// no options are created for the select element by default
		objects[obj_index].element.innerHTML = "";

		// if the (non-form) parent element of the div is scrolled vertically, adjust the y value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the y value of the main div
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";

			// set the top value for the element in the objects array
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;

			// finally, set the "Top" property in the object's properties
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		// if the (non-form) parent element of the div is scrolled horizontally, adjust the x value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the x value of the main div
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";

			// set the left value for the element in the objects array			
			objects[obj_index].left = objects[obj_index].left + document.getElementById(parent_name).scrollLeft;

			// finally, set the "Left" property in the object's properties
			set_property(obj_index, "Left", objects[obj_index].left);
		}

		// double-check that the top/left values are synched
		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		// add the component element to its parent element/form
		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		// if the user clicks on this element, and Pointer is selected in the toolbox, give the element focus
		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		// set the focus to the element after it has been added
		main_formspace.set_outline_focus("DropDownList" + (counter + 1));

		// set the toolbox so that Pointer is selected
		main_toolbox.set_tool(0);
	}

	// a Label is simply a div with text, but it's helpful to have this simple option when building applications
	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "Label";

	tools_fx[index].create = function(outline_div)
	{
		// the outline_div defines the rectangle of space on the form defined by the user
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		// the outline div is removed from the form and appended to the tab div that contains it
		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		// move the outline div out of visible range
		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		// the next several lines are used to create a default name for the component
		var counter = 0;

		// keep adding 1 to counter for every component of the same type that exists
		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "label")
				counter++;

		var valid_name = false;

		// then increment counter again each time a component with the attempted name exists
		while (valid_name == false)
		{
			// get object returns a component in the objects array with the given name, or null if none exists
			if (get_object("Label" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		// this retrieves the id of the currently highlighted component (form or container)
		var parent_name = mouse_hover;

		// get the length of the objects array and use it as an index
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

		// adjust the position of the object if it is in a container
		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		// begin creating the component in the objects array
		objects[obj_index] = {};

		objects[obj_index].name = "Label" + (counter + 1);
		objects[obj_index].type = "label";

		// element_type means the initial element to draw on the canvas
		objects[obj_index].element_type = "div";

		// form here is a numerical value
		objects[obj_index].form = get_object(parent_name).form;

		// the x/y top/left values for the component are stored directly, as well as in the properties
		objects[obj_index].top = y;
		objects[obj_index].left = x;

		// set z-index to just above parent z-index
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		// the properties array holds all of the properties that will display in the Properties window
		objects[obj_index].properties = new Array();

		// index is always set to the length of the array, so that new properties may be added in later
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

		// now we create the div on the form
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

		// if the (non-form) parent element of the div is scrolled vertically, adjust the y value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the y value of the main div
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";

			// set the top value for the element in the objects array
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;

			// finally, set the "Top" property in the object's properties
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		// if the (non-form) parent element of the div is scrolled horizontally, adjust the x value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the x value of the main div
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";

			// set the left value for the element in the objects array			
			objects[obj_index].left = objects[obj_index].left + document.getElementById(parent_name).scrollLeft;

			// finally, set the "Left" property in the object's properties
			set_property(obj_index, "Left", objects[obj_index].left);
		}

		// double-check that the top/left values are synched
		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		// add the component div to its parent element/form
		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		// if the user clicks on this element, and Pointer is selected in the toolbox, give the element focus
		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		// set the focus to the element after it has been added
		main_formspace.set_outline_focus("Label" + (counter + 1));

		// set the toolbox so that Pointer is selected
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

	// a PictureBox is a div that contains an image. The image is not added here because the Image property is blank by default.
	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "PictureBox";

	tools_fx[index].create = function(outline_div)
	{
		// the outline_div defines the rectangle of space on the form defined by the user
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		// the outline div is removed from the form and appended to the tab div that contains it
		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		// move the outline div out of visible range
		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		// the next several lines are used to create a default name for the component
		var counter = 0;

		// keep adding 1 to counter for every component of the same type that exists
		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "picturebox")
				counter++;

		var valid_name = false;

		// then increment counter again each time a component with the attempted name exists
		while (valid_name == false)
		{
			// get object returns a component in the objects array with the given name, or null if none exists
			if (get_object("PictureBox" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		// this retrieves the id of the currently highlighted component (form or container)
		var parent_name = mouse_hover;

		// get the length of the objects array and use it as an index
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

		// adjust the position of the object if it is in a container
		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		// begin creating the component in the objects array
		objects[obj_index] = {};

		objects[obj_index].name = "PictureBox" + (counter + 1);
		objects[obj_index].type = "picturebox";

		// element_type means the initial element to draw on the canvas
		objects[obj_index].element_type = "div";

		// form here is a numerical value
		objects[obj_index].form = get_object(parent_name).form;

		// the x/y top/left values for the component are stored directly, as well as in the properties
		objects[obj_index].top = y;
		objects[obj_index].left = x;

		// set z-index to just above parent z-index
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		// the properties array holds all of the properties that will display in the Properties window
		objects[obj_index].properties = new Array();

		// index is always set to the length of the array, so that new properties may be added in later
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
		objects[obj_index].properties[index].name = "Resize";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "true";

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

		// header properties have no value - they tell the Properties window to create a header
		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseOut";
		objects[obj_index].properties[index].type = "header";

		// properties underneath a header go by "[header name].[property name]"
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

		// the Tooltip properties define a tooltip for the element
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

		// now we create the main div on the form
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

		// if the (non-form) parent element of the div is scrolled vertically, adjust the y value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the y value of the main div
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";

			// set the top value for the element in the objects array
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;

			// finally, set the "Top" property in the object's properties
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		// if the (non-form) parent element of the div is scrolled horizontally, adjust the x value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the x value of the main div
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";

			// set the left value for the element in the objects array			
			objects[obj_index].left = objects[obj_index].left + document.getElementById(parent_name).scrollLeft;

			// finally, set the "Left" property in the object's properties
			set_property(obj_index, "Left", objects[obj_index].left);
		}

		// double-check that the top/left values are synched
		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		// add the component div to its parent element/form
		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		// if the user clicks on this element, and Pointer is selected in the toolbox, give the element focus
		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		// set the focus to the element after it has been added
		main_formspace.set_outline_focus("PictureBox" + (counter + 1));

		// set the toolbox so that Pointer is selected
		main_toolbox.set_tool(0);
	}

	// A PictureFrame is a div that holds an image with multiple animation frames. The image can be shifted horizontally and
	// vertically to show different frames. The Frames and Rows properties specify the number of frames along both axes, and
	// then the Frame and Row properties are used to specify a specific frame.

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "PictureFrame";

	tools_fx[index].create = function(outline_div)
	{
		// the outline_div defines the rectangle of space on the form defined by the user
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		// the outline div is removed from the form and appended to the tab div that contains it
		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		// move the outline div out of visible range
		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		// the next several lines are used to create a default name for the component
		var counter = 0;

		// keep adding 1 to counter for every component of the same type that exists
		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "pictureframe")
				counter++;

		var valid_name = false;

		// then increment counter again each time a component with the attempted name exists
		while (valid_name == false)
		{
			// get object returns a component in the objects array with the given name, or null if none exists
			if (get_object("PictureFrame" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		// this retrieves the id of the currently highlighted component (form or container)
		var parent_name = mouse_hover;

		// get the length of the objects array and use it as an index
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

		// adjust the position of the object if it is in a container
		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		// begin creating the component in the objects array
		objects[obj_index] = {};

		objects[obj_index].name = "PictureFrame" + (counter + 1);
		objects[obj_index].type = "pictureframe";

		// element_type means the initial element to draw on the canvas
		objects[obj_index].element_type = "div";

		// form here is a numerical value
		objects[obj_index].form = get_object(parent_name).form;

		// the x/y top/left values for the component are stored directly, as well as in the properties
		objects[obj_index].top = y;
		objects[obj_index].left = x;

		// set z-index to just above parent z-index
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		// the properties array holds all of the properties that will display in the Properties window
		objects[obj_index].properties = new Array();

		// index is always set to the length of the array, so that new properties may be added in later
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

		// header properties have no value - they tell the Properties window to create a header
		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "MouseOut";
		objects[obj_index].properties[index].type = "header";

		// properties underneath a header go by "[header name].[property name]"
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

		// now we create the main div on the form
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

		// if the (non-form) parent element of the div is scrolled vertically, adjust the y value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the y value of the main div
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";

			// set the top value for the element in the objects array
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;

			// finally, set the "Top" property in the object's properties
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		// if the (non-form) parent element of the div is scrolled horizontally, adjust the x value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the x value of the main div
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";

			// set the left value for the element in the objects array			
			objects[obj_index].left = objects[obj_index].left + document.getElementById(parent_name).scrollLeft;

			// finally, set the "Left" property in the object's properties
			set_property(obj_index, "Left", objects[obj_index].left);
		}

		// double-check that the top/left values are synched
		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		// add the component div to its parent element/form
		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		// if the user clicks on this element, and Pointer is selected in the toolbox, give the element focus
		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		// set the focus to the element after it has been added
		main_formspace.set_outline_focus("PictureFrame" + (counter + 1));

		// set the toolbox so that Pointer is selected
		main_toolbox.set_tool(0);
	}

	// the TextBox is the input element in HTML
	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "TextBox";

	tools_fx[index].create = function(outline_div)
	{
		// the outline_div defines the rectangle of space on the form defined by the user
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		// the outline div is removed from the form and appended to the tab div that contains it
		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		// move the outline div out of visible range
		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		// the next several lines are used to create a default name for the component
		var counter = 0;

		// keep adding 1 to counter for every component of the same type that exists
		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "textbox")
				counter++;

		var valid_name = false;

		// then increment counter again each time a component with the attempted name exists
		while (valid_name == false)
		{
			// get object returns a component in the objects array with the given name, or null if none exists
			if (get_object("Text" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		// this retrieves the id of the currently highlighted component (form or container)
		var parent_name = mouse_hover;

		// get the length of the objects array and use it as an index
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

		// adjust the position of the object if it is in a container
		if (get_object(parent_name).type != "form")
		{
			x -= 2;
			y -= 2;
		}

		// begin creating the component in the objects array
		objects[obj_index] = {};

		objects[obj_index].name = "Text" + (counter + 1);
		objects[obj_index].type = "textbox";

		// element_type means the initial element to draw on the canvas
		objects[obj_index].element_type = "input";

		// form here is a numerical value
		objects[obj_index].form = get_object(parent_name).form;

		// the x/y top/left values for the component are stored directly, as well as in the properties
		objects[obj_index].top = y;
		objects[obj_index].left = x;

		// set z-index to just above parent z-index
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		// the properties array holds all of the properties that will display in the Properties window
		objects[obj_index].properties = new Array();

		// index is always set to the length of the array, so that new properties may be added in later
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

		// now we create the input element on the form
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

		// if the (non-form) parent element of the div is scrolled vertically, adjust the y value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the y value of the main div
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";

			// set the top value for the element in the objects array
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;

			// finally, set the "Top" property in the object's properties
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		// if the (non-form) parent element of the div is scrolled horizontally, adjust the x value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the x value of the main div
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";

			// set the left value for the element in the objects array			
			objects[obj_index].left = objects[obj_index].left + document.getElementById(parent_name).scrollLeft;

			// finally, set the "Left" property in the object's properties
			set_property(obj_index, "Left", objects[obj_index].left);
		}

		// double-check that the top/left values are synched
		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		// add the component div to its parent element/form
		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		// if the user clicks on this element, and Pointer is selected in the toolbox, give the element focus
		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		// set the focus to the element after it has been added
		main_formspace.set_outline_focus("Text" + (counter + 1));

		// set the toolbox so that Pointer is selected
		main_toolbox.set_tool(0);
	}

	// the Panel is a div that serves as a container, so other elements may be placed within it
	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "Panel";

	tools_fx[index].create = function(outline_div)
	{
		// the outline_div defines the rectangle of space on the form defined by the user
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		// the outline div is removed from the form and appended to the tab div that contains it
		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		// move the outline div out of visible range
		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		// the next several lines are used to create a default name for the component
		var counter = 0;

		// keep adding 1 to counter for every component of the same type that exists
		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "panel")
				counter++;

		var valid_name = false;

		// then increment counter again each time a component with the attempted name exists
		while (valid_name == false)
		{
			// get object returns a component in the objects array with the given name, or null if none exists
			if (get_object("Panel" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		// this retrieves the id of the currently highlighted component (form or container)
		var parent_name = mouse_hover;

		// get the length of the objects array and use it as an index
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

		// adjust the position of the object if it is in a container
		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		// begin creating the component in the objects array
		objects[obj_index] = {};

		objects[obj_index].name = "Panel" + (counter + 1);
		objects[obj_index].type = "panel";

		// element_type means the initial element to draw on the canvas
		objects[obj_index].element_type = "div";

		// form here is a numerical value
		objects[obj_index].form = get_object(parent_name).form;

		// the x/y top/left values for the component are stored directly, as well as in the properties
		objects[obj_index].top = y;
		objects[obj_index].left = x;

		// set z-index to just above parent z-index
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;

		// the Panel is a container, meaning that other elements may be added inside of it
		objects[obj_index].container = true;
		objects[obj_index].container_suffix = "";

		// the properties array holds all of the properties that will display in the Properties window
		objects[obj_index].properties = new Array();

		// index is always set to the length of the array, so that new properties may be added in later
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
		objects[obj_index].properties[index].name = "BorderImageOutset";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";
		
		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderImageRepeat";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "none,stretch,repeat,round,space,initial,inherit";
		objects[obj_index].properties[index].value = "none";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderImageSlice";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderImageSource";
		objects[obj_index].properties[index].type = "file";
		objects[obj_index].properties[index].ext = ".*";
		objects[obj_index].properties[index].value = "";
		
		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderImageWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

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

		// now we create the main div on the form
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

		// if the (non-form) parent element of the div is scrolled vertically, adjust the y value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the y value of the main div
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";

			// set the top value for the element in the objects array
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;

			// finally, set the "Top" property in the object's properties
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		// if the (non-form) parent element of the div is scrolled horizontally, adjust the x value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the x value of the main div
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";

			// set the left value for the element in the objects array			
			objects[obj_index].left = objects[obj_index].left + document.getElementById(parent_name).scrollLeft;

			// finally, set the "Left" property in the object's properties
			set_property(obj_index, "Left", objects[obj_index].left);
		}

		// double-check that the top/left values are synched
		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		// add the component div to its parent element/form
		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		// if the user clicks on this element, and Pointer is selected in the toolbox, give the element focus
		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				// get the id of the current element on the form that has focus
				var outline_id = main_formspace.outlines_focus[main_formspace.get_form_num_index(get_object(this.id).form)].id;

				// if this element is not a child of the Panel element, give the Panel focus
				if (is_child(this.id, outline_id) == false)
				{
					main_formspace.set_outline_focus(this.id);
					element_flag = true;
				}
			}
		}, false);

		// since this is a container, set the mouse_hover variable to the Panel when the mouse moves over it
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

		// set the focus to the element after it has been added
		main_formspace.set_outline_focus("Panel" + (counter + 1));

		// set the toolbox so that Pointer is selected
		main_toolbox.set_tool(0);
	}

	// A ScrollPanel is a panel that scrolls up and down within a contained area. It consists of a div inside of another
	// div - generally the inside div is larger along at least one dimension. The width and height of both divs are set
	// separately within the properties.

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "ScrollPanel";

	tools_fx[index].create = function(outline_div)
	{
		// the outline_div defines the rectangle of space on the form defined by the user
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		// the outline div is removed from the form and appended to the tab div that contains it
		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		// move the outline div out of visible range
		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		// the next several lines are used to create a default name for the component
		var counter = 0;

		// keep adding 1 to counter for every component of the same type that exists
		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "scrollpanel")
				counter++;

		var valid_name = false;

		// then increment counter again each time a component with the attempted name exists
		while (valid_name == false)
		{
			// get object returns a component in the objects array with the given name, or null if none exists
			if (get_object("ScrollPanel" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		// this retrieves the id of the currently highlighted component (form or container)
		var parent_name = mouse_hover;

		// get the length of the objects array and use it as an index
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

		// adjust the position of the object if it is in a container
		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		// begin creating the component in the objects array
		objects[obj_index] = {};

		objects[obj_index].name = "ScrollPanel" + (counter + 1);
		objects[obj_index].type = "scrollpanel";

		// element_type means the initial element to draw on the canvas
		objects[obj_index].element_type = "div";

		// form here is a numerical value
		objects[obj_index].form = get_object(parent_name).form;

		// the x/y top/left values for the component are stored directly, as well as in the properties
		objects[obj_index].top = y;
		objects[obj_index].left = x;

		// set z-index to just above parent z-index
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;

		// the Panel is a container, meaning that other elements may be added inside of it
		objects[obj_index].container = true;

		// the div that contains sub-elements has the suffix "_panel" - this is used when adding the sub-elements
		objects[obj_index].container_suffix = "_panel";

		// the properties array holds all of the properties that will display in the Properties window
		objects[obj_index].properties = new Array();

		// index is always set to the length of the array, so that new properties may be added in later
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
		objects[obj_index].properties[index].name = "BorderImageOutset";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";
		
		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderImageRepeat";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "none,stretch,repeat,round,space,initial,inherit";
		objects[obj_index].properties[index].value = "none";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderImageSlice";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = "";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderImageSource";
		objects[obj_index].properties[index].type = "file";
		objects[obj_index].properties[index].ext = ".*";
		objects[obj_index].properties[index].value = "";
		
		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderImageWidth";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = "0";

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

		// PanelHeight and PanelWidth set the size of the inside div
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

		// now we create the main div on the form
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

		// be default, the ScrollPanel is set to scroll vertically only
		objects[obj_index].element.style.overflowX = "hidden";
		objects[obj_index].element.style.overflowY = "scroll";

		// if the (non-form) parent element of the div is scrolled vertically, adjust the y value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the y value of the main div
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";

			// set the top value for the element in the objects array
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;

			// finally, set the "Top" property in the object's properties
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		// if the (non-form) parent element of the div is scrolled horizontally, adjust the x value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the x value of the main div
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";

			// set the left value for the element in the objects array			
			objects[obj_index].left = objects[obj_index].left + document.getElementById(parent_name).scrollLeft;

			// finally, set the "Left" property in the object's properties
			set_property(obj_index, "Left", objects[obj_index].left);
		}

		// double-check that the top/left values are synched
		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		// add the component div to its parent element/form
		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		// now create the panel div that fits inside the main div
		objects[obj_index].element_panel = document.createElement("div");
		objects[obj_index].element_panel.id = "ScrollPanel" + (counter + 1) + "_panel";
		objects[obj_index].element_panel.style.position = "absolute";

		objects[obj_index].element_panel.style.top = "0px";
		objects[obj_index].element_panel.style.left = "0px";

		objects[obj_index].element_panel.style.width = width + "px";
		objects[obj_index].element_panel.style.height = height + "px";

		objects[obj_index].element.appendChild(objects[obj_index].element_panel);

		// if the user clicks on this element, and Pointer is selected in the toolbox, give the element focus
		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				// get the id of the current element on the form that has focus
				var outline_id = main_formspace.outlines_focus[main_formspace.get_form_num_index(get_object(this.id).form)].id;

				// if this element is not a child of the Panel element, give the Panel focus
				if (is_child(this.id, outline_id) == false)
				{
					main_formspace.set_outline_focus(this.id);
					element_flag = true;
				}
			}
		}, false);

		// since this is a container, set the mouse_hover variable to the Panel when the mouse moves over it
		objects[obj_index].element.addEventListener("mousemove", function(evt)
		{
			mouse_hover = this.id;
		}, false);

		// if the element is being scrolled, keep the focus on its parent element
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

		// set the focus to the element after it has been added
		main_formspace.set_outline_focus("ScrollPanel" + (counter + 1));

		// set the toolbox so that Pointer is selected
		main_toolbox.set_tool(0);
	}

	// The TabControl is a complex control, consisting of a number of div containers layered on top of each other, that are
	// accessible by clicking on a series of tabs that runs along one of the edges. The tabs be default run along the top of
	// the element, so that is how they are drawn here. Other configurations are worked out in the tabcontrol_draw function.

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "TabControl";

	tools_fx[index].create = function(outline_div)
	{
		// the outline_div defines the rectangle of space on the form defined by the user
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		// the outline div is removed from the form and appended to the tab div that contains it
		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		// move the outline div out of visible range
		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		// the next several lines are used to create a default name for the component
		var counter = 0;

		// keep adding 1 to counter for every component of the same type that exists
		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "tabcontrol")
				counter++;

		var valid_name = false;

		// then increment counter again each time a component with the attempted name exists
		while (valid_name == false)
		{
			// get object returns a component in the objects array with the given name, or null if none exists
			if (get_object("TabControl" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		// this retrieves the id of the currently highlighted component (form or container)
		var parent_name = mouse_hover;

		// get the length of the objects array and use it as an index
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

		// adjust the position of the object if it is in a container
		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		// begin creating the component in the objects array
		objects[obj_index] = {};

		objects[obj_index].name = "TabControl" + (counter + 1);
		objects[obj_index].type = "tabcontrol";

		// element_type means the initial element to draw on the canvas
		objects[obj_index].element_type = "div";

		// form here is a numerical value
		objects[obj_index].form = get_object(parent_name).form;

		// the x/y top/left values for the component are stored directly, as well as in the properties
		objects[obj_index].top = y;
		objects[obj_index].left = x;

		// set z-index to just above parent z-index
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;

		// the Panel is a container, meaning that other elements may be added inside of it
		objects[obj_index].container = true;

		// "_panel_0" is the suffix of the first tabbed div - elements drawn inside the div will go here first
		objects[obj_index].container_suffix = "_panel_0";

		// the properties array holds all of the properties that will display in the Properties window
		objects[obj_index].properties = new Array();

		// these variables are used when certain Tabs properties are set below
		var tab_width = 100;
		var tab_height = 30;

		// index is always set to the length of the array, so that new properties may be added in later
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

		// The Tabs properties indicate which way the tabs are aligned, and how many there are - each tab has its own
		// panel div. When the Alignment property is changed, the entire element needs to be redrawn.

		// header properties have no value - they tell the Properties window to create a header
		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Tabs";
		objects[obj_index].properties[index].type = "header";

		// properties underneath a header go by "[header name].[property name]"
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

		// the labels that will appear on each tab are listed in this property
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

		// now we create the main div on the form
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

		// if the (non-form) parent element of the div is scrolled vertically, adjust the y value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the y value of the main div
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";

			// set the top value for the element in the objects array
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;

			// finally, set the "Top" property in the object's properties
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		// if the (non-form) parent element of the div is scrolled horizontally, adjust the x value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the x value of the main div
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";

			// set the left value for the element in the objects array			
			objects[obj_index].left = objects[obj_index].left + document.getElementById(parent_name).scrollLeft;

			// finally, set the "Left" property in the object's properties
			set_property(obj_index, "Left", objects[obj_index].left);
		}

		// double-check that the top/left values are synched
		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		// add the component div to its parent element/form
		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		// The code to create the tabs was made generic here so most of it could be used in the draw and create functions

		// technically there is no need to create unique variables for each tab, but it (arguably) a bit less messy this way
		var tab_panel = new Array();
		var tab_tab = new Array();

		// by default, 2 tabs are created
		var tab_total = parseInt(get_property(obj_index, "Tabs.Amount").value);

		for (i = 0; i < tab_total; i++)
		{
			// the first div created is the panel itself, with the suffix "_panel_[x]"
			tab_panel[i] = document.createElement("div");
			tab_panel[i].id = objects[obj_index].name + "_panel_" + i;
			tab_panel[i].style.position = "absolute";

			// the div starts below the tabs, so the top value equals the height of the tabs
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

			// the first tab panel is the only one visible when the element is first created
			if (i == 0)
				tab_panel[i].style.visibility = "visible";
			else
				tab_panel[i].style.visibility = "hidden";

			objects[obj_index].element.appendChild(tab_panel[i]);

			// the second div created is the tab for the panel itself, with the suffix "_tab_[x]"
			tab_tab[i] = document.createElement("div");
			tab_tab[i].id = objects[obj_index].name + "_tab_" + i;
			tab_tab[i].style.position = "absolute";

			tab_tab[i].style.top = "0px";
			tab_tab[i].style.left = ((parseInt(get_property(obj_index, "Tabs.Width").value) + parseInt(get_property(obj_index, "Tabs.Gap").value)) * i) + "px";

			tab_tab[i].style.zIndex = parseInt(get_property(obj_index, "ZIndex").value) + 1;

			// many of the tab properties can be changed in the Properties window
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

			// the label for each tab may be found in the Tabs.Names property, separated by commas
			var tab_name = get_property(obj_index, "Tabs.Names").value.split(",")[i];
			tab_tab[i].innerHTML = tab_name;

			// the tab that is selected (the first by default) appears different from the others
			if (i == parseInt(get_property(obj_index, "Tabs.Select").value))
			{
				// there is no bottom border, so the tab and the visible panel blend seamlessly
				tab_tab[i].style.borderBottom = "0px";

				// the height of the tab has to be adjusted to fill in the space left empty by the removal of the bottom border
				tab_tab[i].style.height = (parseInt(get_property(obj_index, "Tabs.Height").value) + parseInt(get_property(obj_index, "Tabs.BorderWidth").value)) - 1 + "px";

				// the background color of the selected tab is changed based on the Tabs.SelectColor property value
				tab_tab[i].style.backgroundColor = get_property(obj_index, "Tabs.SelectColor").value;
			}

			objects[obj_index].element.appendChild(tab_tab[i]);

			tab_tab[i].addEventListener("click", function(evt)
			{
				var index = this.id.substring(this.id.search("tab") + 4, this.id.length);
				alert(index);
			}, false);
		}

		// if the user clicks on this element, and Pointer is selected in the toolbox, give the element focus
		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				// get the id of the current element on the form that has focus
				var outline_id = main_formspace.outlines_focus[main_formspace.get_form_num_index(get_object(this.id).form)].id;

				// if this element is not a child of the Panel element, give the Panel focus
				if (is_child(this.id, outline_id) == false)
				{
					main_formspace.set_outline_focus(this.id);
					element_flag = true;
				}
			}
		}, false);

		// since this is a container, set the mouse_hover variable to the Panel when the mouse moves over it
		objects[obj_index].element.addEventListener("mousemove", function(evt)
		{
			mouse_hover = this.id;
		}, false);

		// this retrieves the index value of the current form within main_formspace - this is used in the event call that follows
		var index = main_formspace.get_form_tab_index(get_form_name(get_object("TabControl" + (counter + 1)).form));

		// The purpose of this event is to allow the user to switch between tabs within a TabControl when it has focus in Digero, so that
		// they may add other elements to each tab panel. It works by getting the relative x and y coordinates of a mouse click within the
		// focus frame (i.e. the dotted-line rectangle used to indicate that an element has focus). If the coordinates indicate that the
		// click was made over a tab in the TabControl, that panel appears within the element.

		// Note that this event is attached to the outline frame itself (i.e. the dotted-line rectangle), not the element. This means that
		// specific tabs may only be selected after the TabControl element has focus.

		document.getElementById(main_formspace.tab_outlines[index].id).addEventListener("click", function (element, form_index)
		{
			return function(evt)
			{
				// retrieve the object and object index based on element name
				var this_object = get_object(element.id);
				var index = get_object_index(element.id);
				
				// The x and y coordinates of the mouse click relative to the element in focus are retrieved. This is done by getting the
				// x and y coordinates relative to the focus frame, and subtracting 4 from each (since the focus frame starts 4 pixels to
				// the left, and 4 pixels above, and element in focus).

		    	var rect = evt.target.getBoundingClientRect();
		    	var x = evt.clientX - rect.left - 4;
		    	var y = evt.clientY - rect.top - 4;

		    	// A check is made both to ensure that the element in focus is this particular TabControl, and to make sure that the mouse
		    	// cursor is the default pointer (which means that the element is not being moved).

		    	if (main_formspace.outlines_focus[form_index].id == get_property(index, "Name").value && evt.target.style.cursor == "default")
		    	{
					// retrieve the object and object index based on element name
					var this_object = get_object(element.id);
					var index = get_object_index(element.id);

		    		// the number of tabs, and the alignment of the tabs, are both retrieved
		    		var tab_total = parseInt(get_property(index, "Tabs.Amount").value);	
		    		var align = get_property(index, "Tabs.Alignment").value;

		    		// Depending on how the tabs are aligned, the x/y locations for each tab will be different. Each alignment has to be
		    		// considered separately because of this.

		    		// by default, the TabControl tabs appear on the top-left corner of the element
		    		if (align == "top")
		    		{
			    		for (var i = 0; i < tab_total; i++)
			    		{
			    			// target_x stores the leftmost x value for this particular tab, which is calculated using the Tabs.Width and
			    			// Tabs.Gap properties. Note that the "target-y" value - that is, the topmost y value, would be 0 for every tab,
			    			// so it is not considered.

			    			var target_x = (parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i;

			    			// if the x and y values fall within this tab, break out of the loop (thereby conserving the i value of this tab).
			    			if (x >= target_x && x <= (target_x + parseInt(get_property(index, "Tabs.Width").value)) && y <= parseInt(get_property(index, "Tabs.Height").value))
			    				break;
			    		}
		    		}
		    		// if the tab alignment is "right", tabs scroll vertically along the righthand side of the TabControl
		    		else if (align == "right")
		    		{
		    			for (var i = 0; i < tab_total; i++)
			    		{
			    			// target-y stores the topmost y value for the current tab. Note that "target-x" would be the same for each
			    			// tab - the width of the TabControl minus the height of the tabs themselves.

			    			var target_y = (parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i;

			    			// again, if the x and y values fall within this tab, break out of the loop
			    			if (y >= target_y && y <= (target_y + parseInt(get_property(index, "Tabs.Width").value)) && x >= (parseInt(get_property(index, "Width").value) - parseInt(get_property(index, "Tabs.Height").value)))
			    				break;
			    		}
		    		}
		    		// if the tab alignment is "bottom", tabs run along the bottom of the TabControl
		    		else if (align == "bottom")
		    		{
			    		for (var i = 0; i < tab_total; i++)
			    		{
			    			// target_x here is the same as it would be if the tabs were aligned to the top of the TabControl. The value of
			    			// "target_y" is always the same - the height of the TabControl, minus the height of the tabs themselves

			    			var target_x = (parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i;

			    			// again, if the x and y values fall within this tab, break out of the loop
			    			if (x >= target_x && x <= (target_x + parseInt(get_property(index, "Tabs.Width").value)) && y >= (parseInt(get_property(index, "Height").value) - parseInt(get_property(index, "Tabs.Height").value)))
			    				break;
			    		}
		    		}
		    		// if the tab alignment is "left", tabs run vertically along the left of the TabControl
		    		else if (align == "left")
		    		{
		    			for (var i = 0; i < tab_total; i++)
			    		{
			    			// target-y is the same here as it would be if the tabs were right-aligned. target-x is 0.
			    			var target_y = (parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i;

			    			// again, if the x and y values fall within this tab, break out of the loop
			    			if (y >= target_y && y <= (target_y + parseInt(get_property(index, "Tabs.Width").value)) && x <= parseInt(get_property(index, "Tabs.Height").value))
			    				break;
			    		}
		    		}

		    		// so, if i is less than its maximum value from the loop, then the x/y coorindates matched a tab, and the loop was broken out of
		    		if (i < tab_total)
		    		{
		    			// the value of i maps to the tab that was selected, except if the tabs are aligned to the left, then it has to be reversed
		    			if (align != "left")
		    				var tab_select = i;
		    			else
		    				var tab_select = (tab_total - 1) - i;

		    			// the container_suffix value of the TabControl is changed so that elements drawn within it are added to this tab panel
						objects[index].container_suffix = "_panel_" + tab_select;

						// the Tabs.Select property is adjusted to the value of the tab chosen
						set_property(index, "Tabs.Select", tab_select);

						// the draw function for the element is called to update its appearance on the form
						tabcontrol_draw(this_object.element, index);
		    		}
		    	}
			}
		} (objects[obj_index].element, index), false);

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

		// set the focus to the element after it has been added
		main_formspace.set_outline_focus("TabControl" + (counter + 1));

		// set the toolbox so that Pointer is selected
		main_toolbox.set_tool(0);
	}

	// a Window is a container element that appears and functions like a Windows window
	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "Window";

	tools_fx[index].create = function(outline_div)
	{
		// the outline_div defines the rectangle of space on the form defined by the user
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		// the outline div is removed from the form and appended to the tab div that contains it
		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		// move the outline div out of visible range
		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		// the next several lines are used to create a default name for the component
		var counter = 0;

		// keep adding 1 to counter for every component of the same type that exists
		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "window")
				counter++;

		var valid_name = false;

		// then increment counter again each time a component with the attempted name exists
		while (valid_name == false)
		{
			// get object returns a component in the objects array with the given name, or null if none exists
			if (get_object("Window" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		// this retrieves the id of the currently highlighted component (form or container)
		var parent_name = mouse_hover;

		// get the length of the objects array and use it as an index
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


		// adjust the position of the object if it is in a container
		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		// begin creating the component in the objects array
		objects[obj_index] = {};

		objects[obj_index].name = "Window" + (counter + 1);
		objects[obj_index].type = "window";

		// element_type means the initial element to draw on the canvas
		objects[obj_index].element_type = "div";

		// form here is a numerical value
		objects[obj_index].form = get_object(parent_name).form;

		// the x/y top/left values for the component are stored directly, as well as in the properties
		objects[obj_index].top = y;
		objects[obj_index].left = x;

		// set z-index to just above parent z-index
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;

		// the Window element is a container - sub-elements are added to the main div, so there is no container suffix
		objects[obj_index].container = true;
		objects[obj_index].container_suffix = "";

		// the properties array holds all of the properties that will display in the Properties window
		objects[obj_index].properties = new Array();

		// index is always set to the length of the array, so that new properties may be added in later
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

		// header properties have no value - they tell the Properties window to create a header
		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "TitleBar";
		objects[obj_index].properties[index].type = "header";

		// properties underneath a header go by "[header name].[property name]"
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

		// the close, max, and min window buttons are optional, but all appear by default
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

		// now we create the main div on the form
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

		// if the (non-form) parent element of the div is scrolled vertically, adjust the y value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the y value of the main div
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";

			// set the top value for the element in the objects array
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;

			// finally, set the "Top" property in the object's properties
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		// if the (non-form) parent element of the div is scrolled horizontally, adjust the x value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the x value of the main div
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";

			// set the left value for the element in the objects array			
			objects[obj_index].left = objects[obj_index].left + document.getElementById(parent_name).scrollLeft;

			// finally, set the "Left" property in the object's properties
			set_property(obj_index, "Left", objects[obj_index].left);
		}

		// double-check that the top/left values are synched
		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		// add the component div to its parent element/form
		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		// the Window has a default background color, and a box shadow appears around its edges
		objects[obj_index].element.style.backgroundColor = get_property(obj_index, "BackgroundColor").value;
		objects[obj_index].element.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";

		// Several other elements have to be added to the Window. These include the header/title bar, as well as the elements that
		// appear within the header.

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

		// this element is the text that appears in the header - i.e. the window name
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

		// this element is the window close button - a div that contains (in the innerHTML) an image
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

		// this element is the window max button - a div that contains (in the innerHTML) an image
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

		// this element is the window min button - a div that contains (in the innerHTML) an image
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

		// if the user clicks on this element, and Pointer is selected in the toolbox, give the element focus
		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				// get the id of the current element on the form that has focus
				var outline_id = main_formspace.outlines_focus[main_formspace.get_form_num_index(get_object(this.id).form)].id;

				// if this element is not a child of the Panel element, give the Panel focus
				if (is_child(this.id, outline_id) == false)
				{
					main_formspace.set_outline_focus(this.id);
					element_flag = true;
				}
			}
		}, false);

		// since this is a container, set the mouse_hover variable to the Panel when the mouse moves over it
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

		// set the focus to the element after it has been added
		main_formspace.set_outline_focus("Window" + (counter + 1));
		
		// set the toolbox so that Pointer is selected
		main_toolbox.set_tool(0);
	}

	// The TileMap element is used in games and other applications that call for a clickable map made out of square or rectangular
	// tiles. The element itself is composed of several elements, many of which are not added to the element as it appears in
	// Digero - they are created in the runtime library instead.

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "TileMap";

	tools_fx[index].create = function(outline_div)
	{
		// the outline_div defines the rectangle of space on the form defined by the user
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		// the outline div is removed from the form and appended to the tab div that contains it
		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		// move the outline div out of visible range
		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		// the next several lines are used to create a default name for the component
		var counter = 0;

		// keep adding 1 to counter for every component of the same type that exists
		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "tilemap")
				counter++;

		var valid_name = false;

		// then increment counter again each time a component with the attempted name exists
		while (valid_name == false)
		{
			// get object returns a component in the objects array with the given name, or null if none exists
			if (get_object("TileMap" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		// this retrieves the id of the currently highlighted component (form or container)
		var parent_name = mouse_hover;

		// get the length of the objects array and use it as an index
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

		// adjust the position of the object if it is in a container
		if (get_object(parent_name).type != "form")
		{
			x -= 3;
			y -= 3;
		}

		// begin creating the component in the objects array
		objects[obj_index] = {};

		objects[obj_index].name = "TileMap" + (counter + 1);
		objects[obj_index].type = "tilemap";

		// element_type means the initial element to draw on the canvas
		objects[obj_index].element_type = "div";

		// form here is a numerical value
		objects[obj_index].form = get_object(parent_name).form;

		// the x/y top/left values for the component are stored directly, as well as in the properties
		objects[obj_index].top = y;
		objects[obj_index].left = x;

		// set z-index to just above parent z-index
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = width;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;

		// TileMap is a container - elements added to it are contained within the _mapdiv div
		objects[obj_index].container = true;
		objects[obj_index].container_suffix = "_mapdiv";

		// the properties array holds all of the properties that will display in the Properties window
		objects[obj_index].properties = new Array();

		// index is always set to the length of the array, so that new properties may be added in later
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
		objects[obj_index].properties[index].name = "HorizontalWrap";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

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

		// when PaintSelect is true, the user may select new tiles by dragging the mouse while holding a button down
		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "PaintSelect";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		// the SelectTimer will cancel a tileselect event if a mouse button has been held down for the indicated time
		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "SelectTimer";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 1000;

		// SelectX and SelectY are set each time a tile is selected, and the tileselect event is dispatched
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

		// now we create the main div on the form
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

		// if the (non-form) parent element of the div is scrolled vertically, adjust the y value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the y value of the main div
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";

			// set the top value for the element in the objects array
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;

			// finally, set the "Top" property in the object's properties
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		// if the (non-form) parent element of the div is scrolled horizontally, adjust the x value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the x value of the main div
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";

			// set the left value for the element in the objects array			
			objects[obj_index].left = objects[obj_index].left + document.getElementById(parent_name).scrollLeft;

			// finally, set the "Left" property in the object's properties
			set_property(obj_index, "Left", objects[obj_index].left);
		}

		// double-check that the top/left values are synched
		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		// add the component div to its parent element/form
		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		// the _mapdiv element is inside the main div, and contains the map canvas
		objects[obj_index].element_mapdiv = document.createElement("div");
		objects[obj_index].element_mapdiv.id = "TileMap" + (counter + 1) + "_mapdiv";
		objects[obj_index].element_mapdiv.style.position = "absolute";

		objects[obj_index].element_mapdiv.style.top = "0px";
		objects[obj_index].element_mapdiv.style.left = "0px";

		objects[obj_index].element_mapdiv.width = width;
		objects[obj_index].element_mapdiv.height = height;

		objects[obj_index].element.appendChild(objects[obj_index].element_mapdiv);

		// the map itself is a canvas element, and is inside the _mapdiv element
		objects[obj_index].element_map = document.createElement("canvas");
		objects[obj_index].element_map.id = "TileMap" + (counter + 1) + "_map";
		objects[obj_index].element_map.style.position = "absolute";

		objects[obj_index].element_map.style.top = "0px";
		objects[obj_index].element_map.style.left = "0px";

		objects[obj_index].element_map.width = width;
		objects[obj_index].element_map.height = height;

		objects[obj_index].element_mapdiv.appendChild(objects[obj_index].element_map);

		// this will call the tilemap_draw function to finish drawing the map element
		draw_element(obj_index);

		// if the user clicks on this element, and Pointer is selected in the toolbox, give the element focus
		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				// get the id of the current element on the form that has focus
				var outline_id = main_formspace.outlines_focus[main_formspace.get_form_num_index(get_object(this.id).form)].id;

				// if this element is not a child of the Panel element, give the Panel focus
				if (is_child(this.id, outline_id) == false)
				{
					main_formspace.set_outline_focus(this.id);
					element_flag = true;
				}
			}
		}, false);

		// since this is a container, set the mouse_hover variable to the Panel when the mouse moves over it
		objects[obj_index].element.addEventListener("mousemove", function(evt)
		{
			mouse_hover = this.id;
		}, false);

		// set the focus to the element after it has been added
		main_formspace.set_outline_focus("TileMap" + (counter + 1));

		// set the toolbox so that Pointer is selected
		main_toolbox.set_tool(0);
	}

	// The TileSelect element is a complement to the TileMap element. It allows for the display of tiles that may be selected,
	// and then added to a TileMap. The TileSelect element will also load all of the images listed in the Tileset property.

	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "TileSelect";

	tools_fx[index].create = function(outline_div)
	{
		// the outline_div defines the rectangle of space on the form defined by the user
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		// the outline div is removed from the form and appended to the tab div that contains it
		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		// move the outline div out of visible range
		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		// the next several lines are used to create a default name for the component
		var counter = 0;

		// keep adding 1 to counter for every component of the same type that exists
		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "tileselect")
				counter++;

		var valid_name = false;

		// then increment counter again each time a component with the attempted name exists
		while (valid_name == false)
		{
			// get object returns a component in the objects array with the given name, or null if none exists
			if (get_object("TileSelect" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		// this retrieves the id of the currently highlighted component (form or container)
		var parent_name = mouse_hover;

		// get the length of the objects array and use it as an index
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

		// adjust the position of the object if it is in a container
		if (get_object(parent_name).type != "form")
		{
			x -= 2;
			y -= 2;
		}

		// begin creating the component in the objects array
		objects[obj_index] = {};

		objects[obj_index].name = "TileSelect" + (counter + 1);
		objects[obj_index].type = "tileselect";

		// element_type means the initial element to draw on the canvas
		objects[obj_index].element_type = "div";

		// form here is a numerical value
		objects[obj_index].form = get_object(parent_name).form;

		// the x/y top/left values for the component are stored directly, as well as in the properties
		objects[obj_index].top = y;
		objects[obj_index].left = x;

		// set z-index to just above parent z-index
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = 192;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;

		// the properties array holds all of the properties that will display in the Properties window
		objects[obj_index].properties = new Array();

		// index is always set to the length of the array, so that new properties may be added in later
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

		// the Tileset property allows for the selection of multiple files in a dialog box
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

		// now we create the main div on the form
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

		// if the (non-form) parent element of the div is scrolled vertically, adjust the y value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the y value of the main div
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";

			// set the top value for the element in the objects array
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;

			// finally, set the "Top" property in the object's properties
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		// if the (non-form) parent element of the div is scrolled horizontally, adjust the x value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the x value of the main div
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";

			// set the left value for the element in the objects array			
			objects[obj_index].left = objects[obj_index].left + document.getElementById(parent_name).scrollLeft;

			// finally, set the "Left" property in the object's properties
			set_property(obj_index, "Left", objects[obj_index].left);
		}

		// double-check that the top/left values are synched
		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		// add the component div to its parent element/form
		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		// the _griddiv element contains the _grid element, which contains the tile images
		objects[obj_index].element_griddiv = document.createElement("div");
		objects[obj_index].element_griddiv.id = "TileSelect" + (counter + 1) + "_griddiv";
		objects[obj_index].element_griddiv.style.position = "absolute";

		objects[obj_index].element_griddiv.style.top = "0px";
		objects[obj_index].element_griddiv.style.left = "0px";

		objects[obj_index].element_griddiv.width = "192px";
		objects[obj_index].element_griddiv.height = height;

		objects[obj_index].element.appendChild(objects[obj_index].element_griddiv);

		// the _grid element contains the tile images when they are added to the element (this happens in the tileselect_draw function)
		objects[obj_index].element_grid = document.createElement("div");
		objects[obj_index].element_grid.id = "TileSelect" + (counter + 1) + "_grid";
		objects[obj_index].element_grid.style.position = "absolute";

		objects[obj_index].element_grid.style.top = "0px";
		objects[obj_index].element_grid.style.left = "0px";

		objects[obj_index].element_grid.width = "192px";
		objects[obj_index].element_grid.height = height;

		objects[obj_index].element_griddiv.appendChild(objects[obj_index].element_grid);

		// this will call the tileselect_draw function to finish drawing the map element
		draw_element(obj_index);

		// if the user clicks on this element, and Pointer is selected in the toolbox, give the element focus
		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		// since this is a container, set the mouse_hover variable to the Panel when the mouse moves over it
		objects[obj_index].element.addEventListener("mousemove", function(evt)
		{
			mouse_hover = this.id;
		}, false);

		// set the focus to the element after it has been added
		main_formspace.set_outline_focus("TileSelect" + (counter + 1));

		// set the toolbox so that Pointer is selected
		main_toolbox.set_tool(0);
	}

	// The FileDialog elements are modeled on those that appeared in earlier version of Visual Basic. They are icons
	// the appear in design view in Digero, but do not appear in runtime. At runtime, both include a "show" function
	// that opens the respective dialog box.

	// the OpenFileDialog element opens a dialog box that allows the user to select files to load
	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "OpenFileDialog";

	tools_fx[index].create = function(outline_div)
	{
		// the outline_div defines the rectangle of space on the form defined by the user
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		// the outline div is removed from the form and appended to the tab div that contains it
		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		// move the outline div out of visible range
		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		// the next several lines are used to create a default name for the component
		var counter = 0;

		// keep adding 1 to counter for every component of the same type that exists
		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "openfiledialog")
				counter++;

		var valid_name = false;

		// then increment counter again each time a component with the attempted name exists
		while (valid_name == false)
		{
			// get object returns a component in the objects array with the given name, or null if none exists
			if (get_object("OpenFileDialog" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		// this retrieves the id of the currently highlighted component (form or container)
		var parent_name = mouse_hover;

		// get the length of the objects array and use it as an index
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

		// adjust the position of the object if it is in a container
		if (get_object(parent_name).type != "form")
		{
			x -= 2;
			y -= 2;
		}

		// begin creating the component in the objects array
		objects[obj_index] = {};

		objects[obj_index].name = "OpenFileDialog" + (counter + 1);
		objects[obj_index].type = "openfiledialog";

		// element_type means the initial element to draw on the canvas
		objects[obj_index].element_type = "div";

		// form here is a numerical value
		objects[obj_index].form = get_object(parent_name).form;

		// the x/y top/left values for the component are stored directly, as well as in the properties
		objects[obj_index].top = y;
		objects[obj_index].left = x;

		// set z-index to just above parent z-index
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = 192;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;
		//objects[obj_index].container_suffix = "_mapdiv";

		// the properties array holds all of the properties that will display in the Properties window
		objects[obj_index].properties = new Array();

		// index is always set to the length of the array, so that new properties may be added in later
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

		// the Multiple property allows multiple files to be selected
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

		// on a form, the OpenFileDialog element is a div of fixed size, with an image that is added in the _draw function
		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "OpenFileDialog" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = "42px";
		objects[obj_index].element.style.height = "42px";

		// if the (non-form) parent element of the div is scrolled vertically, adjust the y value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the y value of the main div
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";

			// set the top value for the element in the objects array
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;

			// finally, set the "Top" property in the object's properties
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		// if the (non-form) parent element of the div is scrolled horizontally, adjust the x value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the x value of the main div
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";

			// set the left value for the element in the objects array			
			objects[obj_index].left = objects[obj_index].left + document.getElementById(parent_name).scrollLeft;

			// finally, set the "Left" property in the object's properties
			set_property(obj_index, "Left", objects[obj_index].left);
		}

		// double-check that the top/left values are synched
		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		// add the component div to its parent element/form
		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		// calls the _draw function for the element
		draw_element(obj_index);

		// if the user clicks on this element, and Pointer is selected in the toolbox, give the element focus
		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		/*objects[obj_index].element.addEventListener("mousemove", function(evt)
		{
			mouse_hover = this.id;
		}, false);*/

		// set the focus to the element after it has been added
		main_formspace.set_outline_focus("OpenFileDialog" + (counter + 1));

		// set the toolbox so that Pointer is selected
		main_toolbox.set_tool(0);
	}

	// the SaveFileDialog element opens a dialog box that allows the user to specify a filename to save as
	index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = "SaveFileDialog";

	tools_fx[index].create = function(outline_div)
	{
		// the outline_div defines the rectangle of space on the form defined by the user
		var x = parseInt(outline_div.style.left);
		var y = parseInt(outline_div.style.top);

		var width = parseInt(outline_div.style.width);
		var height = parseInt(outline_div.style.height);

		// the outline div is removed from the form and appended to the tab div that contains it
		outline_div.parentElement.removeChild(outline_div);
		main_formspace.tab_divs[get_object(mouse_hover).form].appendChild(outline_div);

		outline_div.style.width = "0px";
		outline_div.style.height = "0px";

		// move the outline div out of visible range
		outline_div.style.left = "-100px";
		outline_div.style.top = "-100px";

		// the next several lines are used to create a default name for the component
		var counter = 0;

		// keep adding 1 to counter for every component of the same type that exists
		for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "savefiledialog")
				counter++;

		var valid_name = false;

		// then increment counter again each time a component with the attempted name exists
		while (valid_name == false)
		{
			// get object returns a component in the objects array with the given name, or null if none exists
			if (get_object("SaveFileDialog" + (counter + 1)) == null)
				valid_name = true;
			else
				counter++;
		}

		// this retrieves the id of the currently highlighted component (form or container)
		var parent_name = mouse_hover;

		// get the length of the objects array and use it as an index
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

		// adjust the position of the object if it is in a container
		if (get_object(parent_name).type != "form")
		{
			x -= 2;
			y -= 2;
		}

		// begin creating the component in the objects array
		objects[obj_index] = {};

		objects[obj_index].name = "SaveFileDialog" + (counter + 1);
		objects[obj_index].type = "savefiledialog";

		// element_type means the initial element to draw on the canvas
		objects[obj_index].element_type = "div";

		// form here is a numerical value
		objects[obj_index].form = get_object(parent_name).form;

		// the x/y top/left values for the component are stored directly, as well as in the properties
		objects[obj_index].top = y;
		objects[obj_index].left = x;

		// set z-index to just above parent z-index
		objects[obj_index].z = get_object(parent_name).z + 2;

		objects[obj_index].width = 192;
		objects[obj_index].height = height;

		objects[obj_index].parent = parent_name;
		objects[obj_index].container = false;
		//objects[obj_index].container_suffix = "_mapdiv";

		// the properties array holds all of the properties that will display in the Properties window
		objects[obj_index].properties = new Array();

		// index is always set to the length of the array, so that new properties may be added in later
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

		// on a form, the SaveFileDialog element is a div of fixed size, with an image that is added in the _draw function
		objects[obj_index].element = document.createElement("div");
		objects[obj_index].element.id = "SaveFileDialog" + (counter + 1);
		objects[obj_index].element.style.position = "absolute";

		objects[obj_index].element.style.top = y + "px";
		objects[obj_index].element.style.left = x + "px";

		objects[obj_index].element.style.zIndex = get_object(parent_name).z + 2;

		objects[obj_index].element.style.width = "42px";
		objects[obj_index].element.style.height = "42px";

		// if the (non-form) parent element of the div is scrolled vertically, adjust the y value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the y value of the main div
			objects[obj_index].element.style.top = (parseInt(objects[obj_index].element.style.top) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollTop) + "px";

			// set the top value for the element in the objects array
			objects[obj_index].top = objects[obj_index].top + document.getElementById(parent_name).scrollTop;

			// finally, set the "Top" property in the object's properties
			set_property(obj_index, "Top", objects[obj_index].top);
		}

		// if the (non-form) parent element of the div is scrolled horizontally, adjust the x value of the element to add the scrollTop value
		if (document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft > 0 && get_object(objects[obj_index].parent).type != "form")
		{
			// adjust the x value of the main div
			objects[obj_index].element.style.left = (parseInt(objects[obj_index].element.style.left) + document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).parentElement.scrollLeft) + "px";

			// set the left value for the element in the objects array			
			objects[obj_index].left = objects[obj_index].left + document.getElementById(parent_name).scrollLeft;

			// finally, set the "Left" property in the object's properties
			set_property(obj_index, "Left", objects[obj_index].left);
		}

		// double-check that the top/left values are synched
		set_property(obj_index, "Top", objects[obj_index].top);
		set_property(obj_index, "Left", objects[obj_index].left);

		// add the component div to its parent element/form
		document.getElementById(parent_name + get_object(objects[obj_index].parent).container_suffix).appendChild(objects[obj_index].element);

		// calls the _draw function for the element
		draw_element(obj_index);

		// if the user clicks on this element, and Pointer is selected in the toolbox, give the element focus
		objects[obj_index].element.addEventListener("mousedown", function(evt)
		{
			if (main_toolbox.select == 0)
			{
				main_formspace.set_outline_focus(this.id);
				element_flag = true;
			}
		}, false);

		/*objects[obj_index].element.addEventListener("mousemove", function(evt)
		{
			mouse_hover = this.id;
		}, false);*/

		// set the focus to the element after it has been added
		main_formspace.set_outline_focus("SaveFileDialog" + (counter + 1));

		// set the toolbox so that Pointer is selected
		main_toolbox.set_tool(0);
	}
}

// The draw_element function was originally created before specific _draw functions were added for each element. It is still
// called whenever a draw function for an element needs to be applied. It will cycle through a few element type internally,
// and then run the relevant _draw function if the element type is not internally referenced.

// Draw functions are the workhorses of the Digero system. Whenever a property in an element if modified, the draw function
// is called to update the element's appearance. Generally this means updating the CSS by referencing the relevant property
// values for that element. All CSS values are updated, regardless of which specific one was modified by the user.

draw_element = function(index)
{
	// the element itself is retrieved from rhe DOM, to reduce later DOM calls
	var element = document.getElementById(objects[index].name);

	// the current name of the element is stored - this is used later to rename sub-elements if the name changes
	var old_name = objects[index].name;

	// The function will now check the type of the element to see if it is a form, panel, or textbox. If it is not, it
	// will then seek the _draw function for that element type.

	if (objects[index].type == "form")
	{
		// change the name of the tab that hold the form (if the name has changed)
		var tab_id = "main_formspace_name_" + main_formspace.get_form_tab_index(objects[index].name);

		// update the name of the form as it appears on the tab
		document.getElementById(tab_id).innerHTML = get_property(index, "Name").value;

		// all pixel values in element properties are stored without "px" suffixes for simplicity
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

		// the width and height of an element are also stored as direct values in the object array
		objects[index].width = parseInt(get_property(index, "Width").value);
		objects[index].height = parseInt(get_property(index, "Height").value);

		// the name is also updated in the objects array
		objects[index].name = get_property(index, "Name").value;

		// the name of the element in the DOM is updated
		element.id = objects[index].name;
	}
	else if (objects[index].type == "panel")
	{
		// all pixel values in element properties are stored without "px" suffixes for simplicity
		element.style.left = get_property(index, "Left").value + "px";
		element.style.top = get_property(index, "Top").value + "px";
		element.style.zIndex = get_property(index, "ZIndex").value;

		// the left and top values of an element are also stored as direct values in the object array
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

		// If the BorderStyle property is set to "none", a dotted border will be drawn so that it is visible. This is
		// not done in the runtime version of this function.

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

		// the border image properties are still at an experimental stage at this point
		if (get_property(index, "BorderImageSource").value != "")
		{
			element.style.borderStyle = "solid";

			element.style.borderImageSource = "url(\"" + project_folder + "/" + get_property(index, "BorderImageSource").value + "\")";
			element.style.borderImageWidth = get_property(index, "BorderImageWidth").value + "px";
			element.style.borderImageRepeat = get_property(index, "BorderImageRepeat").value;
			element.style.borderImageSlice = get_property(index, "BorderImageSlice").value;
			element.style.borderImageOutset = get_property(index, "BorderImageOutset").value + "px";
		}

		element.style.backgroundColor = get_property(index, "BackgroundColor").value;

		element.style.width = get_property(index, "Width").value + "px";
		element.style.height = get_property(index, "Height").value + "px";

		// the width and height of an element are also stored as direct values in the object array
		objects[index].width = parseInt(get_property(index, "Width").value);
		objects[index].height = parseInt(get_property(index, "Height").value);

		// if the name of the element has changed, update the parent values of elements contained within it
		if (objects[index].name != get_property(index, "Name").value)
		{
			for (var i = 0; i < objects.length; i++)
				if (objects[i].parent == objects[index].name)
					objects[i].parent = get_property(index, "Name").value;
		}

		// the name is also updated in the objects array
		objects[index].name = get_property(index, "Name").value;

		// the name of the element in the DOM is updated
		element.id = objects[index].name;
	}
	else if (objects[index].type == "textbox")
	{
		// all pixel values in element properties are stored without "px" suffixes for simplicity
		element.style.left = get_property(index, "Left").value + "px";
		element.style.top = get_property(index, "Top").value + "px";
		element.style.zIndex = get_property(index, "ZIndex").value;

		// the left and top values of an element are also stored as direct values in the object array
		objects[index].left = get_property(index, "Left").value; 
		objects[index].top = get_property(index, "Top").value;

		// element is styled using DOM to change CSS properties based on element property values
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

		// here the actual text in the textbox is modified based on the property value in the array
		element.value = get_property(index, "Text").value;

		element.style.width = get_property(index, "Width").value + "px";
		element.style.height = get_property(index, "Height").value + "px";

		// the width and height of an element are also stored as direct values in the object array
		objects[index].width = parseInt(get_property(index, "Width").value);
		objects[index].height = parseInt(get_property(index, "Height").value);

		// the name is aso updated in the objects array
		objects[index].name = get_property(index, "Name").value;
		element.id = objects[index].name;
	}
	else
	{
		// If the element type has not been matched up to this point, a search is made for a function with the name of
		// the element followed bt the _draw suffix. If this function is found, it is executed.

		eval("if (typeof " + objects[index].type + "_draw === \"function\") " + objects[index].type + "_draw(element, index);");
	}
	
	// An array is created that contains all of the child elements of a given element - these may include sub-elements that
	// are created for complex elements (e.g. TabControl)

	var child_elements = element.children;
	var child_elements_array = Array.from(child_elements);

	// Child elements typically have an id made up of the parent element name and a suffix, separated by an underscore.
	// This loop cycles through each child element and updates the parent element name.

	child_elements_array.forEach((item) => {
		if (item.id.substring(0, item.id.lastIndexOf("_")) == old_name)
			item.id = objects[index].name + item.id.substring(item.id.lastIndexOf("_"), item.id.length);
	});

	// the element name, if it is currently selected on the form, is updated in the form's focus attribute
	if (main_formspace.outlines_focus[main_formspace.get_form_tab_index(get_form_name(objects[index].form))].id == objects[index].name)
		main_formspace.set_outline_focus(objects[index].name);
}

// Before getting to the _draw functions for the remaining elements, the _create functions for each element (if needed) are
// specified below. These functions are called when form elements in a project's .prj file are loaded into Digero. These function
// create sub-elements and other functionality necessary for the element. This code duplicates the functionality that is stated
// above when the tools_fx array is built - this may be consolidated in a later update HOWEVER note that there are slight
// differences in the variable names - e.g. index instead of obj_index.

// Note that the _draw function is also called for each element that is added, so that all of the necessary property values 
// are also updated.

// the _create function for the Adjuster element
adjuster_create = function(element, index)
{
	// For the Adjuster, three elements are added to the main div - a text field in the center, and arrow images on either side.
	// The names of these elements are [name]_sub1, [name]_sub2, and [name]_sub3.

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

	// The following two events are needed for when new arrow images are loaded into the image elements - the positions of
	// either image are readjusted to be centered vertically, and positioned along either edge of the parent element.

	element_sub1.addEventListener("load", function()
	{
			// get the parent div of the image element
			var parent_div = document.getElementById(this.id.substring(0, this.id.lastIndexOf("_")));

			// move the element to the left edge of the parent element
			this.style.left = "0px";

			// vertically center the image element
			this.style.top = Math.floor((parseInt(parent_div.style.height) - this.height) / 2) + "px";
	}, false);

	element_sub3.addEventListener("load", function()
	{
			// get the parent div of the image element
			var parent_div = document.getElementById(this.id.substring(0, this.id. lastIndexOf("_")));

			// move the element to the right edge of the parent element
			this.style.left = (parseInt(parent_div.style.width) - this.width) + "px";
				
			// vertically center the image element
			this.style.top = Math.floor((parseInt(parent_div.style.height) - this.height) / 2) + "px";
	}, false);
}

// the _create function for the Canvas element
canvas_create = function(element, index)
{
	// the canvas itself is a sub-element contained within the parent div
	element_canvas = document.createElement("canvas");
	element_canvas.id = objects[index].name + "_canvas";
	element_canvas.style.position = "absolute";

	element_canvas.style.top = "0px";
	element_canvas.style.left = "0px";

	element.appendChild(element_canvas);
}

// the _create function for the CheckBox element
checkbox_create = function(element, index)
{

	// The CheckBox contains two other elments, both inside the main div: an image that contains the checkbox image,
	// and a div to the right of it that contains a text label.

	element_sub1 = document.createElement("img");
	element_sub1.id = objects[index].name + "_sub1";
	element_sub1.style.position = "absolute";

	element_sub1.src = get_property(index, "Unchecked.Image").value;

	element_sub2 = document.createElement("div");
	element_sub2.id = objects[index].name + "_sub2";
	element_sub2.style.position = "absolute";

	// The text div is updated to display the text given in the Text property
	element_sub2.innerHTML = get_property(index, "Text").value;

	element.appendChild(element_sub1);
	element.appendChild(element_sub2);
}

// the _create function for the ScrollPanel element
scrollpanel_create = function(element, index)
{
	// the sub-element here is the panel div inside the parent div
	element_panel = document.createElement("div");
	element_panel.id = objects[index].name + "_panel";
	element_panel.style.position = "absolute";

	element_panel.style.top = "0px";
	element_panel.style.left = "0px";

	element.appendChild(element_panel);
}

// the _create function for the TabControl element - this is one of the more complex elements
tabcontrol_create = function(element, index)
{
	// technically there is no need to create unique variables for each tab, but it (arguably) a bit less messy this way
	var tab_panel = new Array();
	var tab_tab = new Array();

	// other properties are stored as variables for shorthand
	var tab_total = parseInt(get_property(index, "Tabs.Amount").value);
	var tab_height = parseInt(get_property(index, "Tabs.Height").value);
	var width = parseInt(get_property(index, "Width").value);
	var height = parseInt(get_property(index, "Height").value);

	// this retrieves the index value of the current form within main_formspace - this is used in the event call that follows
	var form_id = element.parentElement.parentElement.id;
	var form_index = parseInt(form_id.substring(form_id.lastIndexOf("_") + 1, form_id.length));

	for (i = 0; i < tab_total; i++)
	{
		// the first div created is the panel itself, with the suffix "_panel_[x]"
		tab_panel[i] = document.createElement("div");
		tab_panel[i].id = objects[index].name + "_panel_" + i;
		tab_panel[i].style.position = "absolute";

		// the div starts below the tabs, so the top value equals the height of the tabs
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

		// the first tab panel is the only one visible when the element is first created
		if (i == 0)
			tab_panel[i].style.visibility = "visible";
		else
			tab_panel[i].style.visibility = "hidden";

		element.appendChild(tab_panel[i]);

		// the second div created is the tab for the panel itself, with the suffix "_tab_[x]"
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

		// The purpose of this event is to allow the user to switch between tabs within a TabControl when it has focus in Digero, so that
		// they may add other elements to each tab panel. It works by getting the relative x and y coordinates of a mouse click within the
		// focus frame (i.e. the dotted-line rectangle used to indicate that an element has focus). If the coordinates indicate that the
		// click was made over a tab in the TabControl, that panel appears within the element.

		// Note that this event is attached to the outline frame itself (i.e. the dotted-line rectangle), not the element. This means that
		// specific tabs may only be selected after the TabControl element has focus.

		document.getElementById(main_formspace.tab_outlines[form_index].id).addEventListener("click", function (element, form_index)
		{
			return function(evt)
			{
				// retrieve the object and object index based on element name
				var this_object = get_object(element.id);
				var index = get_object_index(element.id);

				// The x and y coordinates of the mouse click relative to the element in focus are retrieved. This is done by getting the
				// x and y coordinates relative to the focus frame, and subtracting 4 from each (since the focus frame starts 4 pixels to
				// the left, and 4 pixels above, and element in focus).

		    	var rect = evt.target.getBoundingClientRect();
		    	var x = evt.clientX - rect.left - 4;
		    	var y = evt.clientY - rect.top - 4;

		    	// A check is made both to ensure that the element in focus is this particular TabControl, and to make sure that the mouse
		    	// cursor is the default pointer (which means that the element is not being moved).

		    	if (main_formspace.outlines_focus[form_index].id == get_property(index, "Name").value && evt.target.style.cursor == "default")
		    	{
		    		// the number of tabs, and the alignment of the tabs, are both retrieved
		    		var tab_total = parseInt(get_property(index, "Tabs.Amount").value);	
		    		var align = get_property(index, "Tabs.Alignment").value;

		    		// Depending on how the tabs are aligned, the x/y locations for each tab will be different. Each alignment has to be
		    		// considered separately because of this.

		    		// by default, the TabControl tabs appear on the top-left corner of the element
		    		if (align == "top")
		    		{
			    		for (var i = 0; i < tab_total; i++)
			    		{
			    			// target_x stores the leftmost x value for this particular tab, which is calculated using the Tabs.Width and
			    			// Tabs.Gap properties. Note that the "target-y" value - that is, the topmost y value, would be 0 for every tab,
			    			// so it is not considered.

			    			var target_x = (parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i;

			    			// if the x and y values fall within this tab, break out of the loop (thereby conserving the i value of this tab).
			    			if (x >= target_x && x <= (target_x + parseInt(get_property(index, "Tabs.Width").value)) && y <= parseInt(get_property(index, "Tabs.Height").value))
			    				break;
			    		}
		    		}
		    		// if the tab alignment is "right", tabs scroll vertically along the righthand side of the TabControl
		    		else if (align == "right")
		    		{
		    			for (var i = 0; i < tab_total; i++)
			    		{
			    			// target-y stores the topmost y value for the current tab. Note that "target-x" would be the same for each
			    			// tab - the width of the TabControl minus the height of the tabs themselves.

			    			var target_y = (parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i;

			    			// again, if the x and y values fall within this tab, break out of the loop
			    			if (y >= target_y && y <= (target_y + parseInt(get_property(index, "Tabs.Width").value)) && x >= (parseInt(get_property(index, "Width").value) - parseInt(get_property(index, "Tabs.Height").value)))
			    				break;
			    		}
		    		}
		    		// if the tab alignment is "bottom", tabs run along the bottom of the TabControl
		    		else if (align == "bottom")
		    		{
			    		for (var i = 0; i < tab_total; i++)
			    		{
			    			// target_x here is the same as it would be if the tabs were aligned to the top of the TabControl. The value of
			    			// "target_y" is always the same - the height of the TabControl, minus the height of the tabs themselves

			    			var target_x = (parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i;

			    			// again, if the x and y values fall within this tab, break out of the loop
			    			if (x >= target_x && x <= (target_x + parseInt(get_property(index, "Tabs.Width").value)) && y >= (parseInt(get_property(index, "Height").value) - parseInt(get_property(index, "Tabs.Height").value)))
			    				break;
			    		}
		    		}
		    		// if the tab alignment is "left", tabs run vertically along the left of the TabControl
		    		else if (align == "left")
		    		{
		    			for (var i = 0; i < tab_total; i++)
			    		{
			    			// target-y is the same here as it would be if the tabs were right-aligned. target-x is 0.
			    			var target_y = (parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i;

			    			// again, if the x and y values fall within this tab, break out of the loop
			    			if (y >= target_y && y <= (target_y + parseInt(get_property(index, "Tabs.Width").value)) && x <= parseInt(get_property(index, "Tabs.Height").value))
			    				break;
			    		}
		    		}

		    		// so, if i is less than its maximum value from the loop, then the x/y coorindates matched a tab, and the loop was broken out of
		    		if (i < tab_total)
		    		{
		    			// the value of i maps to the tab that was selected, except if the tabs are aligned to the left, then it has to be reversed
		    			if (align != "left")
		    				var tab_select = i;
		    			else
		    				var tab_select = (tab_total - 1) - i;

		    			// the container_suffix value of the TabControl is changed so that elements drawn within it are added to this tab panel
						objects[index].container_suffix = "_panel_" + tab_select;

						// the Tabs.Select property is adjusted to the value of the tab chosen
						set_property(index, "Tabs.Select", tab_select);

						// the draw function for the element is called to update its appearance on the form
						tabcontrol_draw(this_object.element, index);
		    		}
		    	}
			}
		} (element, form_index), false);

		element.appendChild(tab_tab[i]);
	}
}

// the _create function for the TileMap element
tilemap_create = function(element, index)
{
	// In Digero itself, the only elements contained within the TileMap are the map itself (a canvas element), and the div that
	// contains the map. Other elements like the overlay and the highlight are only added at runtime.

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

// the _create function for the TileSelect element
tileselect_create = function(element, index)
{
	// In Digero itself, the only elements contained within the TileSelect element are the two divs that hold the tiles to be
	// selected. The highlight element is only added at runtime.

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

// the _create function for the Window element
window_create = function(element, index)
{
	// Several other elements have to be added to the Window. These include the header/title bar, as well as the elements that
	// appear within the header.

	element_header = document.createElement("div");
	element_header.id = objects[index].name + "_header";
	element_header.style.position = "absolute";

	element_header.style.top = "0px";
	element_header.style.left = "0px";

	element.appendChild(element_header);

	// this element is the text that appears in the header - i.e. the window name
	element_title = document.createElement("div");
	element_title.id = objects[index].name + "_header_text";
	element_title.style.position = "absolute";

	element_title.style.top = "0px";
	element_title.style.left = "0px";

	element_header.appendChild(element_title);

	// this element is the window close button - a div that contains (in the innerHTML) an image
	header_boxx = document.createElement("div");	
	header_boxx.id =  objects[index].name + "_header_boxx";
	header_boxx.style.position = "absolute";

	header_boxx.style.top = "0px";
	header_boxx.style.left = "0px";

	header_boxx.innerHTML = "<center><img id = \"" + objects[index].name + "_header_x\" src = \"img/window_x.png\"></center>";

	element_header.appendChild(header_boxx);

	// this element is the window max button - a div that contains (in the innerHTML) an image
	header_boxmax = document.createElement("div");	
	header_boxmax.id =  objects[index].name + "_header_boxmax";
	header_boxmax.style.position = "absolute";

	header_boxmax.style.top = "0px";
	header_boxmax.style.left = "0px";

	header_boxmax.innerHTML = "<center><img id = \"" + objects[index].name + "_header_x\" src = \"img/window_max.png\"></center>";

	element_header.appendChild(header_boxmax);

	// this element is the window min button - a div that contains (in the innerHTML) an image
	header_boxmin = document.createElement("div");	
	header_boxmin.id =  objects[index].name + "_header_boxmin";
	header_boxmin.style.position = "absolute";

	header_boxmin.style.top = "0px";
	header_boxmin.style.left = "0px";

	header_boxmin.innerHTML = "<center><img id = \"" + objects[index].name + "_header_x\" src = \"img/window_min.png\"></center>";

	element_header.appendChild(header_boxmin);
}

// the _draw function for the Button element
button_draw = function(element, index)
{
	// all pixel values in element properties are stored without "px" suffixes for simplicity
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	element.style.opacity = get_property(index, "Opacity").value;

	// the left and top values of an element are also stored as direct values in the object array
	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	// element is styled using DOM to change CSS properties based on element property values
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

	// here the actual text in the button is modified based on the property value in the array
	element.innerHTML = get_property(index, "Text").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	// the width and height of an element are also stored as direct values in the object array
	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	// the name is also updated in the objects array
	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

// the _draw function for the DropDownList element
dropdownlist_draw = function(element, index)
{
	// all pixel values in element properties are stored without "px" suffixes for simplicity
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	element.style.opacity = get_property(index, "Opacity").value;

	// the left and top values of an element are also stored as direct values in the object array
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

	// all current options within the DropDownList are cleared out, so they may be loaded back in
    for(var i = element.options.length; i >= 0; i--)
    	element.remove(i);

    // the option values are taken out of the Options property, separated by commas
	var options = get_property(index, "Options").value.split(",");

	// each option element is then created and added to the DropDownList element
	for (var j = 0; j < options.length; j++)
	{
		var option = document.createElement("option");
		option.text = options[j];
		element.add(option);
	}

	// the value - that is, the currently selected option, is set
	element.value = get_property(index, "Value").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	// the width and height of an element are also stored as direct values in the object array
	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	// the name is also updated in the objects array
	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

// the _draw function for the Adjuster element
adjuster_draw = function(element, index)
{
	// all pixel values in element properties are stored without "px" suffixes for simplicity
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	// the left and top values of an element are also stored as direct values in the object array
	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	var element_sub1 = document.getElementById(objects[index].name + "_sub1");
	var element_sub2 = document.getElementById(objects[index].name + "_sub2");
	var element_sub3 = document.getElementById(objects[index].name + "_sub3");

	element.style.borderColor = get_property(index, "BorderColor").value;
	element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
	element.style.borderStyle = get_property(index, "BorderStyle").value;
	element.style.borderWidth = get_property(index, "BorderWidth").value + "px";

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;

	// the main Adjuster div has no padding or margins
	element.style.padding = "0px";
	element.style.margin = "0px";

	// the display div is called the Box in the Properties window, and has many attributes
	element_sub2.style.borderColor = get_property(index, "Box.BorderColor").value;
	element_sub2.style.borderRadius = get_property(index, "Box.BorderRadius").value + "px";
	element_sub2.style.borderStyle = get_property(index, "Box.BorderStyle").value;
	element_sub2.style.borderWidth = get_property(index, "Box.BorderWidth").value + "px";

	element_sub2.style.paddingLeft = parseInt(get_property(index, "Box.PaddingLeft").value) + "px";
	element_sub2.style.paddingRight = parseInt(get_property(index, "Box.PaddingRight").value) + "px";
	element_sub2.style.paddingTop = parseInt(get_property(index, "Box.PaddingTop").value) + "px";
	element_sub2.style.paddingBottom = parseInt(get_property(index, "Box.PaddingBottom").value) + "px";

	element_sub2.style.backgroundColor = get_property(index, "Box.BackgroundColor").value;
	element_sub2.style.width = get_property(index, "Box.Width").value + "px";
	element_sub2.style.height = get_property(index, "Box.Height").value + "px";

	// the width of the main div is a combination of the Width property value, and the Box padding values
	element.style.width = parseInt(get_property(index, "Width").value) + parseInt(get_property(index, "Box.PaddingLeft").value) + parseInt(get_property(index, "Box.PaddingRight").value) + "px";

	// the height of the main div is a combination
	element.style.height = (parseInt(get_property(index, "Box.Height").value) + parseInt(get_property(index, "Box.BorderWidth").value)) + parseInt(get_property(index, "Box.PaddingTop").value) + parseInt(get_property(index, "Box.PaddingBottom").value) + "px";

	// here the project folder is checked to see if the image exists in the relative file path indicated in the LeftArrow.Image property
	if (fs.existsSync(project_folder + "/" + get_property(index, "LeftArrow.Image").value))
		element_sub1.src = project_folder + "/" + get_property(index, "LeftArrow.Image").value;

	// if the file/path does not exist, retrieve the image from the relative path within the Digero folder
	else
		element_sub1.src = get_property(index, "LeftArrow.Image").value;

	// here the project folder is checked to see if the image exists in the relative file path indicated in the RightArrow.Image property
	if (fs.existsSync(project_folder + "/" + get_property(index, "RightArrow.Image").value))
		element_sub3.src = project_folder + "/" + get_property(index, "RightArrow.Image").value;

	// if the file/path does not exist, retrieve the image from the relative path within the Digero folder
	else
		element_sub3.src = get_property(index, "RightArrow.Image").value;

	// the display div is centered within the parent element, plus the value indicated in the LeftAdjust property
	element_sub2.style.left = Math.floor((parseInt(get_property(index, "Width").value) - (parseInt(get_property(index, "Box.Width").value) + parseInt(get_property(index, "Box.BorderWidth").value))) / 2) + parseInt(get_property(index, "Box.LeftAdjust").value) + "px";
	element_sub2.style.top = "0px";

	// further styling of the display div
	element_sub2.style.color = get_property(index, "Box.FontColor").value;
	element_sub2.style.fontFamily = get_property(index, "Box.FontFamily").value;
	element_sub2.style.fontSize = get_property(index, "Box.FontSize").value;

	if (get_property(index, "Box.TextAlign") != null)
		element.style.textAlign = get_property(index, "Box.TextAlign").value;

	element_sub2.innerHTML = get_property(index, "Box.Text").value;

	// the width and height of an element are also stored as direct values in the object array
	objects[index].width = parseInt(element.style.width);
	objects[index].height = parseInt(element.style.height);

	// the name is also updated in the objects array
	objects[index].name = get_property(index, "Name").value;

	// the ids of the main div and sub-elements are updated
	element.id = objects[index].name;
	element_sub1.id = objects[index].name + "_sub1";
	element_sub2.id = objects[index].name + "_sub2";
	element_sub3.id = objects[index].name + "_sub3";
}

// the _draw function for the Canvas element
canvas_draw = function(element, index)
{
	// all pixel values in element properties are stored without "px" suffixes for simplicity
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	// the left and top values of an element are also stored as direct values in the object array
	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	// element is styled using DOM to change CSS properties based on element property values
	element.style.paddingLeft = parseInt(get_property(index, "PaddingLeft").value) + "px";
	element.style.paddingRight = parseInt(get_property(index, "PaddingRight").value) + "px";
	element.style.paddingTop = parseInt(get_property(index, "PaddingTop").value) + "px";
	element.style.paddingBottom = parseInt(get_property(index, "PaddingBottom").value) + "px";

	element.style.marginLeft = parseInt(get_property(index, "MarginLeft").value) + "px";
	element.style.marginRight = parseInt(get_property(index, "MarginRight").value) + "px";
	element.style.marginTop = parseInt(get_property(index, "MarginTop").value) + "px";
	element.style.marginBottom = parseInt(get_property(index, "MarginBottom").value) + "px";

	// if there is a visible border, draw it as normal
	if (get_property(index, "BorderStyle").value != "none")
	{
		element.style.borderColor = get_property(index, "BorderColor").value;
		element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
		element.style.borderStyle = get_property(index, "BorderStyle").value;
		element.style.borderWidth = get_property(index, "BorderWidth").value + "px";
	}

	// else dispaly a dashed border so the element is visible (this is not added at runtime)
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

	// the height and width of the _canvas sub-element are adjusted
	var element_canvas = document.getElementById(element.id + "_canvas");
	element_canvas.style.width = get_property(index, "Width").value + "px";
	element_canvas.style.height = get_property(index, "Height").value + "px";

	// the width and height of an element are also stored as direct values in the object array
	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	// if the name of the element has changed, update the parent values of elements contained within it
	if (objects[index].name != get_property(index, "Name").value)
	{
		for (var i = 0; i < objects.length; i++)
			if (objects[i].parent == objects[index].name)
				objects[i].parent = get_property(index, "Name").value;
	}

	// the name is also updated in the objects array
	objects[index].name = get_property(index, "Name").value;

	// the ids of the element and sub-element are updated
	element.id = objects[index].name;
	element_canvas.id = objects[index].name + "_canvas";
}

// the _draw function for the CheckBox element
checkbox_draw = function(element, index)
{
	// all pixel values in element properties are stored without "px" suffixes for simplicity
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	// the left and top values of an element are also stored as direct values in the object array
	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	// element is styled using DOM to change CSS properties based on element property values
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

	// retrieve the sub-elements from the DOM
	var element_sub1 = document.getElementById(objects[index].name + "_sub1");
	var element_sub2 = document.getElementById(objects[index].name + "_sub2");

	// position the checkbox image based on properties
	element_sub1.style.left = get_property(index, "Box.Left").value + "px";
	element_sub1.style.top = get_property(index, "Box.Top").value + "px";

	// retrieve the value of the CheckBox from properties - if true, load Checked image
	if (get_property(index, "Check").value == "true")
	{
		// here the project folder is checked to see if the image exists in the relative file path indicated in the property
		if (fs.existsSync(project_folder + "/" + get_property(index, "Checked.Image").value))
			element_sub1.src = project_folder + "/" + get_property(index, "Checked.Image").value;

		// if the file/path does not exist, retrieve the image from the relative path within the Digero folder
		else
			element_sub1.src = get_property(index, "Checked.Image").value;
	}

	// if Checked value is false, load Unchecked image
	else
	{
		// here the project folder is checked to see if the image exists in the relative file path indicated in the property
		if (fs.existsSync(project_folder + "/" + get_property(index, "Unchecked.Image").value))
			element_sub1.src = project_folder + "/" + get_property(index, "Unchecked.Image").value;

		// if the file/path does not exist, retrieve the image from the relative path within the Digero folder
		else
			element_sub1.src = get_property(index, "Unchecked.Image").value;
	}

	// position the checkbox label based on properties
	element_sub2.style.left = get_property(index, "Label.Left").value + "px";
	element_sub2.style.top = get_property(index, "Label.Top").value + "px";

	element_sub2.style.fontFamily = get_property(index, "FontFamily").value;
	element_sub2.style.fontSize = get_property(index, "FontSize").value;

	// set the text in the label div to the Text property value
	element_sub2.innerHTML = get_property(index, "Text").value;

	// the width and height of an element are also stored as direct values in the object array
	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	// the name is also updated in the objects array
	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

// the _draw function for the Console element - note that the full element is only drawn at runtime
console_draw = function(element, index)
{
	// all pixel values in element properties are stored without "px" suffixes for simplicity
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	element.style.opacity = get_property(index, "Opacity").value;

	// the left and top values of an element are also stored as direct values in the object array
	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	// element is styled using DOM to change CSS properties based on element property values
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

	// the width and height of an element are also stored as direct values in the object array
	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	// the name is also updated in the objects array
	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

// the _draw function for the DataGrid element
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

// the _draw function for the Label element
label_draw = function(element, index)
{
	element.id = get_property(index, "Name").value;

	// all pixel values in element properties are stored without "px" suffixes for simplicity
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	// the left and top values of an element are also stored as direct values in the object array
	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	// element is styled using DOM to change CSS properties based on element property values
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

	// These properties are set only if they exist - they were necessary in early version for backwards compatibility

	if (get_property(index, "OverflowX") != null)
		element.style.overflowX = get_property(index, "OverflowX").value;

	if (get_property(index, "OverflowY") != null)
		element.style.overflowY = get_property(index, "OverflowY").value;

	if (get_property(index, "LineHeight") != null)
		element.style.lineHeight = get_property(index, "LineHeight").value;

	if (get_property(index, "TextAlign") != null)
		element.style.textAlign = get_property(index, "TextAlign").value;

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;

	// if the Image property is empty, load the Text from the text property
	if (get_property(index, "Image").value == "")
		element.innerHTML = get_property(index, "Text").value;

	// if not, load the image
	else
		element.innerHTML = "<img src = \"" + project_folder + "/" + get_property(index, "Image").value + "\">" + get_property(index, "Text").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	// the width and height of an element are also stored as direct values in the object array
	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	// the name is also updated in the objects array
	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

// the _draw function for the MenuStrip element
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

// the _draw function for the PictureBox element
picturebox_draw = function(element, index)
{
	element.id = get_property(index, "Name").value;

	// all pixel values in element properties are stored without "px" suffixes for simplicity
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";

	element.style.zIndex = get_property(index, "ZIndex").value;

	// the left and top values of an element are also stored as direct values in the object array
	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	// if there is a visible border, draw it as normal
	if (get_property(index, "BorderStyle").value != "none")
	{
		element.style.borderColor = get_property(index, "BorderColor").value;
		element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
		element.style.borderStyle = get_property(index, "BorderStyle").value;
		element.style.borderWidth = get_property(index, "BorderWidth").value + "px";
	}

	// else dispaly a dashed border so the element is visible (this is not added at runtime)
	else
	{
		element.style.borderColor = "#000000";
		element.style.borderRadius = "0px";
		element.style.borderStyle = "dashed";
		element.style.borderWidth = "1px";
	}

	// more element styles taken from properties
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

	// if the Image property contains a value, load an image into the element div
	if (get_property(index, "Image").value != "")
	{
		// first, if an image element already exists, remove it
		if (document.getElementById(element.id + "_image") != null)
			element.removeChild(document.getElementById(element.id + "_image"));

		// add the image elment to the div - note that the src is composed of both the project folder, and the relative path from the Image property
		element.innerHTML = "<img id = \"" + element.id + "_image\" src = \"" + project_folder + "/" + get_property(index, "Image").value + "\">";

		// after the image is loaded, is may be resized and/or repositioned, or properties may be adjused, depending on other property values
		document.getElementById(element.id + "_image").addEventListener("load", function (obj_index)
		{
			return function(evt)
			{
				this.style.position = "absolute";

				// if the Resize property is set to true, then the Width and Height properties will be adjusted to match the image values
				if (get_property(index, "Resize") != null && get_property(index, "Resize").value == "true")
				{
					set_property(index, "Width", this.width);
					set_property(index, "Height", this.height);
				}

				// if the Scale property is set to true, the width and height of the image will be adjusted to match property values
				if (get_property(index, "Scale").value == "true")
				{
					this.width = parseInt(get_property(index, "Width").value);
					this.height = parseInt(get_property(index, "Height").value);
				}

				// align the image horizontally to the center or right side of the element, if HorizontalAlign is set
				if (get_property(index, "HorizontalAlign").value == "center")
					this.style.left = Math.floor((get_property(index, "Width").value - this.width) / 2) + "px";
				else if (get_property(index, "HorizontalAlign").value == "right")
					this.style.left = (get_property(index, "ElementWidth").value - this.width) + "px";
				else
					this.style.left = "0px";

				// align the image vetically to the center or right side of the element, if VerticalAlign is set
				if (get_property(index, "VerticalAlign").value == "center")
					this.style.top = Math.floor((get_property(index, "Height").value - this.height) / 2) + "px";
				else if (get_property(index, "VerticalAlign").value == "right")
					this.style.top = (get_property(index, "ElementHeight").value - this.height) + "px";
				else
					this.style.top = "0px";
			}
		} (index), false);
	}

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	// the width and height of an element are also stored as direct values in the object array
	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	// the name is also updated in the objects array
	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

// the _draw function for the PictureFrame element
pictureframe_draw = function(element, index)
{
	element.id = get_property(index, "Name").value;

	// all pixel values in element properties are stored without "px" suffixes for simplicity
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";

	element.style.overflow = "hidden";

	element.style.zIndex = get_property(index, "ZIndex").value;

	// the left and top values of an element are also stored as direct values in the object array
	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	// if there is a visible border, draw it as normal
	if (get_property(index, "BorderStyle").value != "none")
	{
		element.style.borderColor = get_property(index, "BorderColor").value;
		element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
		element.style.borderStyle = get_property(index, "BorderStyle").value;
		element.style.borderWidth = get_property(index, "BorderWidth").value + "px";
	}

	// else dispaly a dashed border so the element is visible (this is not added at runtime)
	else
	{
		element.style.borderColor = "#000000";
		element.style.borderRadius = "0px";
		element.style.borderStyle = "dashed";
		element.style.borderWidth = "1px";
	}

	// more element styles taken from properties
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

	// if the Image property contains a value, load an image into the element div
	if (get_property(index, "Image").value != "")
	{
		// first, if an image element already exists, remove it
		if (document.getElementById(element.id + "_image") != null)
			element.removeChild(document.getElementById(element.id + "_image"));

		// add the image elment to the div - note that the src is composed of both the project folder, and the relative path from the Image property
		element.innerHTML = "<img id = \"" + element.id + "_image\" src = \"" + project_folder + "/" + get_property(index, "Image").value + "\">";

		document.getElementById(element.id + "_image").addEventListener("load", function (obj_index)
		{
			return function(evt)
			{
				this.style.position = "absolute";
			}
		} (index), false);
	}

	// transform the image to flip horizontally, if property value is set
	if (get_property(index, "FlipHorizontal").value == "true")
		element.style.transform = "scaleX(-1)";
	else
		element.style.transform = "scaleX(1)";

	if (get_property(index, "Filter") != null)
		element.style.filter = get_property(index, "Filter").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	// the width and height of an element are also stored as direct values in the object array
	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	// retrieve the image from the elment, if it exists
	var obj_image = document.getElementById(element.id + "_image");

	// here the image is positioned within the parent div based on frame and row property values
	if (obj_image != null)
	{
		// the width of a frame is calculated based on the Frames property, then the image is shifted horizontally based on the Frame value
		obj_image.style.left = -((obj_image.width / parseInt(get_property(index, "Frames").value)) * parseInt(get_property(index, "Frame").value)) + "px";

		// the height of a row is calculated based on the Rows property, then the image is shifted vertically based on the Row value
		obj_image.style.top = -((obj_image.height / parseInt(get_property(index, "Rows").value)) * parseInt(get_property(index, "Row").value)) + "px";
	}

	// the name is also updated in the objects array
	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

// the _draw function for the ScrollPanel element
scrollpanel_draw = function(element, index)
{
	// all pixel values in element properties are stored without "px" suffixes for simplicity
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	// the left and top values of an element are also stored as direct values in the object array
	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	// more element styles taken from properties
	element.style.paddingLeft = parseInt(get_property(index, "PaddingLeft").value) + "px";
	element.style.paddingRight = parseInt(get_property(index, "PaddingRight").value) + "px";
	element.style.paddingTop = parseInt(get_property(index, "PaddingTop").value) + "px";
	element.style.paddingBottom = parseInt(get_property(index, "PaddingBottom").value) + "px";

	element.style.marginLeft = parseInt(get_property(index, "MarginLeft").value) + "px";
	element.style.marginRight = parseInt(get_property(index, "MarginRight").value) + "px";
	element.style.marginTop = parseInt(get_property(index, "MarginTop").value) + "px";
	element.style.marginBottom = parseInt(get_property(index, "MarginBottom").value) + "px";

	// if there is a visible border, draw it as normal
	if (get_property(index, "BorderStyle").value != "none")
	{
		element.style.borderColor = get_property(index, "BorderColor").value;
		element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
		element.style.borderStyle = get_property(index, "BorderStyle").value;
		element.style.borderWidth = get_property(index, "BorderWidth").value + "px";
	}

	// else dispaly a dashed border so the element is visible (this is not added at runtime)
	else
	{
		element.style.borderColor = "#000000";
		element.style.borderRadius = "0px";
		element.style.borderStyle = "dashed";
		element.style.borderWidth = "1px";
	}
	
	// these border image properties are experimental for now
	if (get_property(index, "BorderImageSource").value != "")
	{
		element.style.borderStyle = "solid";

		element.style.borderImageSource = "url(\"" + project_folder + "/" + get_property(index, "BorderImageSource").value + "\")";
		element.style.borderImageWidth = get_property(index, "BorderImageWidth").value + "px";
		element.style.borderImageRepeat = get_property(index, "BorderImageRepeat").value;
		element.style.borderImageSlice = get_property(index, "BorderImageSlice").value;
		element.style.borderImageOutset = get_property(index, "BorderImageOutset").value + "px";
	}

	// scrollbars are created horitonztally and/or vertically, depending on property values
	element.style.overflowX = get_property(index, "OverflowX").value;
	element.style.overflowY = get_property(index, "OverflowY").value;

	// the exact position of the scrollbars (and thus the panel sub-element) can also be set
	element.scrollTop = get_property(index, "ScrollTop").value;
	element.scrollLeft = get_property(index, "ScrollLeft").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	// the width and height of an element are also stored as direct values in the object array
	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	// here the height and width of the panel sub-element are defined
	var panel = document.getElementById(element.id + "_panel");
	panel.style.width = get_property(index, "PanelWidth").value + "px";
	panel.style.height = get_property(index, "PanelHeight").value + "px";

	// both the panel and the parent div always have the same background color
	element.style.backgroundColor = get_property(index, "BackgroundColor").value;
	panel.style.backgroundColor = get_property(index, "BackgroundColor").value;

	// the name is also updated in the objects array
	objects[index].name = get_property(index, "Name").value;

	// update the ids of the two DOM elements
	panel.id = objects[index].name + "_panel";
	element.id = objects[index].name;
}

// The _draw function for the TabControl element. The element looks very different depending on how the tabs are aligned, so there
// is more code here than in the typical draw function. Each panel within the div must also be adjuted based on property values.

tabcontrol_draw = function(element, index)
{
	// these variables will store each panel and tab, as they are parsed
	var tab_panel = new Array();
	var tab_tab = new Array();

	// more variables to be used in the tab loop
	var tab_total = parseInt(get_property(index, "Tabs.Amount").value);
	var tab_height = parseInt(get_property(index, "Tabs.Height").value);

	var width = parseInt(get_property(index, "Width").value);
	var height = parseInt(get_property(index, "Height").value);

	// each panel and its tab are looped through to draw them properly
	for (i = 0; i < tab_total; i++)
	{
		// get the tab panel from the DOM, and the Alignment property value
		tab_panel[i] = document.getElementById(objects[index].name + "_panel_" + i);
		var align = get_property(index, "Tabs.Alignment").value;

		if (align == "top")
		{
			// is the tabs run along the top of the element, the panels appear underneath them
			tab_panel[i].style.top = tab_height + "px";
			tab_panel[i].style.left = "0px";

			// the height of the panel is the height of the element, minus the height to the tabs
			tab_panel[i].style.width = width + "px";
			tab_panel[i].style.height = (height - tab_height - 1) + "px";
		}
		else if (align == "right")
		{
			// if the tabs run along the right, the panels are positioned in the top-left corner of the element
			tab_panel[i].style.top = "0px";
			tab_panel[i].style.left = "0px";

			// the width of the panel is the width of the element, minus the height of the tabs
			tab_panel[i].style.width = (width - tab_height - 1) + "px";
			tab_panel[i].style.height = height + "px";
		}
		else if (align == "bottom")
		{
			// if tabs run along the bottom, the panels are positioned in the top-left corner of the element
			tab_panel[i].style.top = "0px";
			tab_panel[i].style.left = "0px";

			// the height of the panel is the height of the element, minus the height to the tabs
			tab_panel[i].style.width = width + "px";
			tab_panel[i].style.height = (height - tab_height - 1) + "px";
		}
		else if (align == "left")
		{
			// if tabs run along the left, the panels appear to the right of them
			tab_panel[i].style.top = "0px";
			tab_panel[i].style.left = (tab_height + 1) + "px";

			// the width of the panel is the width of the element, minus the height of the tabs
			tab_panel[i].style.width = (width - tab_height - 1) + "px";
			tab_panel[i].style.height = height + "px";
		}

		// the CSS styles for each panel are all drawn from the same property values
		tab_panel[i].style.zIndex = parseInt(get_property(index, "ZIndex").value);
		tab_panel[i].style.backgroundColor = get_property(index, "BackgroundColor").value;

		tab_panel[i].style.borderColor = get_property(index, "BorderColor").value;
		tab_panel[i].style.borderRadius = get_property(index, "BorderRadius").value;
		tab_panel[i].style.borderStyle = get_property(index, "BorderStyle").value;
		tab_panel[i].style.borderWidth = get_property(index, "BorderWidth").value;

		// only the tab that is currently selected will be visible
		if (i == parseInt(get_property(index, "Tabs.Select").value))
			tab_panel[i].style.visibility = "visible";
		else
			tab_panel[i].style.visibility = "hidden";

		//objects[index].element.appendChild(tab_panel[i]);

		// get the tab from the DOM
		tab_tab[i] = document.getElementById(objects[index].name + "_tab_" + i);

		// If the tabs run along the left or right of the element, they must be rotated using CSS transformations. This made their
		// positioning very tricky - the vertical and horizontal shifts that are performed were arrived at by trial and error, but
		// they appear to consistently work.

		if (align == "top")
		{
			// tabs running along the top are the easiest to position
			tab_tab[i].style.top = "0px";

			// the Tabs.Width and Tabs.Gap properties determine how much space to shift for each successive tab
			tab_tab[i].style.left = ((parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i) + "px";
			tab_tab[i].style.transform = "";
		}
		else if (align == "right")
		{
			// when tabs run along the right, Tabs.Width and Tabs.Gap are used to determine their y positioning
			tab_tab[i].style.top = ((parseInt(get_property(index, "Tabs.Width").value) / 2) + (parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i) - 14 + "px";
			tab_tab[i].style.left = width - parseInt(get_property(index, "Tabs.Width").value) + (parseInt(get_property(index, "Tabs.Width").value) / 2) - 15 + "px";

			// the transform style rotates the tab element
			tab_tab[i].style.transform = "rotate(90deg)";
		}
		else if (align == "bottom")
		{
			// tabs running along the bottom appear underneath the panels
			tab_tab[i].style.top = (height - tab_height) + "px";

			// the Tabs.Width and Tabs.Gap properties determine how much space to shift for each successive tab
			tab_tab[i].style.left = ((parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * i) + "px";
			tab_tab[i].style.transform = "";
		}
		else if (align == "left")
		{
			// tabs running along the left are flipped, in that they they are stacked bottom to top
			tab_tab[i].style.top = ((parseInt(get_property(index, "Tabs.Width").value) / 2) + (parseInt(get_property(index, "Tabs.Width").value) + parseInt(get_property(index, "Tabs.Gap").value)) * ((tab_total - i) - 1)) - 14 + "px";
			tab_tab[i].style.left = -(parseInt(get_property(index, "Tabs.Height").value)) - 5 + "px";

			// the transform style rotates the tab element
			tab_tab[i].style.transform = "rotate(-90deg)";
		}

		tab_tab[i].style.zIndex = parseInt(get_property(index, "ZIndex").value) + 1;

		// the tabs have many of their own properties mapped to CSS styles
		tab_tab[i].style.paddingLeft = parseInt(get_property(index, "Tabs.PaddingLeft").value) + "px";
		tab_tab[i].style.paddingTop = parseInt(get_property(index, "Tabs.PaddingTop").value) + "px";

		// the width and height are adjusted based on the values in the padding properties
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

		// the text for each tab is drawn from the Tabs.Names property, with each label separated by commas
		tab_tab[i].innerHTML = get_property(index, "Tabs.Names").value.split(",")[i];

		// if the tab being worked on is the tab that is selected, it must be styled further
		if (i == parseInt(get_property(index, "Tabs.Select").value))
		{
			// tabs running along the bottom are a special case
			if (get_property(index, "Tabs.Alignment").value != "bottom")
			{
				// for all other tabs, the bottom border is removed so that the tab blends with the panel
				tab_tab[i].style.borderBottom = "0px";

				// the height must be extended to cover the missing border
				tab_tab[i].style.height = (parseInt(get_property(index, "Tabs.Height").value) + parseInt(get_property(index, "Tabs.BorderWidth").value) - parseInt(get_property(index, "Tabs.PaddingTop").value)) - 1 + "px";

				// the background color of the tab is changed
				tab_tab[i].style.backgroundColor = get_property(index, "Tabs.SelectColor").value;
			}
			else
			{
				// for tabs running along the bottom, the top border is removed
				tab_tab[i].style.borderTop = "0px";

				// here, the top padding of the tab is extended by the border width, so it blends with the panel
				tab_tab[i].style.paddingTop = parseInt(get_property(index, "Tabs.PaddingTop").value) + parseInt(get_property(index, "Tabs.BorderWidth").value) + "px";

				// the background color of the tab is changed
				tab_tab[i].style.backgroundColor = get_property(index, "Tabs.SelectColor").value;
			}
		}

		//objects[index].element.appendChild(tab_tab[i]);
	}

	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	// the left and top values of an element are also stored as direct values in the object array
	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	// the main element div has no padding or margins
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

	// the width and height of an element are also stored as direct values in the object array
	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	// if the name of the element has changed, update the parent values of elements contained within it
	if (objects[index].name != get_property(index, "Name").value)
	{
		for (var i = 0; i < objects.length; i++)
			if (objects[i].parent == objects[index].name)
				objects[i].parent = get_property(index, "Name").value;
	}

	// the name is also updated in the objects array
	objects[index].name = get_property(index, "Name").value;

	// the id of the main div is updated
	element.id = objects[index].name;

	// each tab and panel must be renamed as well
	for (i = 0; i < tab_total; i++)
	{
		tab_panel[i].id = objects[index].name + "_panel_" + i;
		tab_tab[i].id = objects[index].name + "_tab_" + i;
	}
}

// the _draw function for the TileMap element
tilemap_draw = function(element, index)
{
	// all pixel values in element properties are stored without "px" suffixes for simplicity
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	// the left and top values of an element are also stored as direct values in the object array
	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	// element is styled using DOM to change CSS properties based on element property values
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

	// the width and height of an element are also stored as direct values in the object array
	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	objects[index].name = get_property(index, "Name").value;

	// the map sub-element is retrieved from the DOM; the context is then retrieved
	var map = document.getElementById(element.id + "_map");
	var ctx = map.getContext("2d");

	// variables are assigned property values to make the statements that follow more clear
	var map_height = parseInt(get_property(index, "MapHeight").value);
	var map_width = parseInt(get_property(index, "MapWidth").value);
	var tile_height = parseInt(get_property(index, "TileHeight").value);
	var tile_width = parseInt(get_property(index, "TileWidth").value);

	var tile_color = get_property(index, "TileBackgroundColor").value;
	var offset = parseInt(get_property(index, "TileBorderWidth").value);

	// the map width and height are always the product of the number of tiles in each direction and the tile width/height
	map.height = map_height * tile_height;
	map.width = map_width * tile_width;

	// the empty tiles are then drawn on the map
	for (var i = 0; i < map_height; i++)
	{
		for (var j = 0; j < map_width; j++)
		{
			ctx.fillStyle = tile_color;

			// this is where all the map property value variables are used
			ctx.fillRect((j * tile_width) + offset, (i * tile_height) + offset, tile_width - (offset * 2), tile_height - (offset * 2));
		}
	}

	// the element and sub-element ids are updated
	map.id = objects[index].name + "_map";
	document.getElementById(element.id + "_mapdiv").id = objects[index].name + "_mapdiv";
	element.id = objects[index].name;
}

// the _draw function for the TileSelect element
tileselect_draw = function(element, index)
{
	// all pixel values in element properties are stored without "px" suffixes for simplicity
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	// the left and top values of an element are also stored as direct values in the object array
	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	// element is styled using DOM to change CSS properties based on element property values
	element.style.borderColor = get_property(index, "BorderColor").value;
	element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
	element.style.borderStyle = get_property(index, "BorderStyle").value;
	element.style.borderWidth = get_property(index, "BorderWidth").value + "px";

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;

	element.style.overflowY = "hidden";
	element.style.overflowY = get_property(index, "Overflow").value;

	// if Overflow is set to "hidden", set the element width to be the product of the grid width and tile width
	if (get_property(index, "Overflow").value == "hidden")
		element_width = parseInt(get_property(index, "GridWidth").value) * parseInt(get_property(index, "TileWidth").value);
	
	// if not, add the width of the vertical scrollbar to the above width
	else
		element_width = (parseInt(get_property(index, "GridWidth").value) * parseInt(get_property(index, "TileWidth").value)) + parseInt(get_property(index, "ScrollbarWidth").value);

	element.style.width = element_width + "px";
	element.style.height = get_property(index, "Height").value + "px";

	element.style.padding = "0px";
	element.style.margin = "0px";

	// the width and height of an element are also stored as direct values in the object array
	objects[index].width = element_width;
	objects[index].height = parseInt(get_property(index, "Height").value);

	objects[index].name = get_property(index, "Name").value;

	// here we are preparing to add the tiles by getting the file names/paths from the Tileset array, separated by commas
	var tile_files = get_property(index, "Tileset").value.split(",");

	// if Tileset is blank, set the array length to 0
	if (tile_files[0] == "")
		tile_files.length = 0;

	// the tilecount attribute is set to the number of tiles in Tileset
	objects[index].tilecount = tile_files.length;

	var grid = document.getElementById(element.id + "_grid");

	// remove all of the sub-elements within the Tileset _grid element
	while (grid.firstChild) 
	{
    	grid.removeChild(grid.lastChild);
	}

	var grid_width = parseInt(get_property(index, "GridWidth").value);
	var tile_height = parseInt(get_property(index, "TileHeight").value);
	var tile_width = parseInt(get_property(index, "TileWidth").value);

	// the grid height is calculated via the number of tiles in a row, multipled by the tile height
	grid.height = Math.ceil(objects[index].tilecount / tile_width) * tile_height;

	// the grid width is the product of the GridWidth property, and the tile width
	grid.width = grid_width * tile_width;

	if (get_property(index, "Tileset").value != "")
	{
		// now the tile images are added to the element
		for (var i = 0; i < tile_files.length; i++)
		{
			var element = document.createElement("img");

			// each tile image has a unique id
			element.id = get_property(index, "Name").value + "_tile_" + i;
			element.style.position = "absolute";

			// the position of the image is determined by the grid width, tile width, and tile height
			element.style.left = ((i % grid_width) * tile_height) + "px";
			element.style.top = (Math.floor(i / grid_width) * tile_height) + "px";

			// the tile file name/path is added to the project folder path for the src
			element.src = project_folder + "/" + tile_files[i];

			grid.appendChild(element);
		}
	}

	set_property(index, "TileCount", tile_files.length);

	// update the element and grid ids
	grid.id = objects[index].name + "_grid";
	element.id = objects[index].name;
}

// the _draw function for the Window element
window_draw = function(element, index)
{
	// all pixel values in element properties are stored without "px" suffixes for simplicity
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	// the left and top values of an element are also stored as direct values in the object array
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

	// set the box shadow for the window, if set to true
	if (get_property(index, "BoxShadow").value == "true")	
		element.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";
	else
		element.style.boxShadow = "";

	// this is for the header bar that runs along the top of the window
	element_header = document.getElementById(element.id + "_header");

	element_header.style.top = "0px";
	element_header.style.left = "0px";

	// the width is the same as the width of the window itself
	element_header.style.width = parseInt(get_property(index, "Width").value) + "px";
	element_header.style.height = "30px";

	element_header.style.borderWidth = "1px";
	element_header.style.borderStyle = "hidden";

	element_header.style.backgroundColor = "#dee1e6";

	// the is for the text that appears in the header, i.e. the window name
	var header_text = document.getElementById(element.id + "_header_text");

	// the x/y position of the text is set by property values
	header_text.style.top = parseInt(get_property(index, "TitleBar.TextTop").value) + "px";
	header_text.style.left = parseInt(get_property(index, "TitleBar.TextLeft").value) + "px";

	header_text.style.fontFamily = get_property(index, "TitleBar.FontFamily").value;
	header_text.style.fontSize = get_property(index, "TitleBar.FontSize").value;
	header_text.style.color = get_property(index, "TitleBar.FontColor").value;

	// the text is set by a property value
	header_text.innerHTML = get_property(index, "TitleBar.Text").value;

	// the window buttons all have the same gap between them, equal to the width of each buttong
	var gap = 45;

	header_boxx = document.getElementById(element.id + "_header_boxx");

	// if there is a close button, position it and increase gap
	if (get_property(index, "Buttons.CloseButton").value == "true")
	{
		header_boxx.style.left = (parseInt(element_header.style.width) - gap) + "px";
		header_boxx.style.paddingTop = "5px";

		gap += 45;
	}

	// set width and height of button
	header_boxx.style.width = "45px";
	header_boxx.style.height = "25px";
	
	header_boxmax = document.getElementById(element.id + "_header_boxmax");

	// if there is a max button, position it and increase gap
	if (get_property(index, "Buttons.MaxButton").value == "true")
	{
		header_boxmax.style.left = (parseInt(element_header.style.width) - gap) + "px";
		header_boxmax.style.paddingTop = "5px";

		gap += 45;
	}

	// set width and height of button
	header_boxmax.style.width = "45px";
	header_boxmax.style.height = "25px";

	header_boxmin = document.getElementById(element.id + "_header_boxmin");

	// if there is a min button, position it and increase gap
	if (get_property(index, "Buttons.MinButton").value == "true")
	{
		header_boxmin.style.left = (parseInt(element_header.style.width) - gap) + "px";
		header_boxmin.style.paddingTop = "5px";
	}

	// set width and height of button
	header_boxmin.style.width = "45px";
	header_boxmin.style.height = "25px";

	// set the visibility of each button DOM element, if the button is set to "true" in properties
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

	// the width and height of an element are also stored as direct values in the object array
	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	// update the object name, and element id
	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

// the _draw function for the OpenFileDialog element
openfiledialog_draw = function(element, index)
{
	// the element may be placed anywhere on a form
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	// the left and top values of an element are also stored as direct values in the object array
	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	// the element always has a fixed width and height
	element.style.width = "42px";
	element.style.height = "42px";

	// set the width and height in the object array
	objects[index].width = 42;
	objects[index].height = 42;

	element.style.padding = "0px";
	element.style.margin = "0px";

	// add the dialog box button to the element
	element.innerHTML = "<img src = \"img/openbutton.png\">";
}

// the _draw function for the SaveFileDialog element
savefiledialog_draw = function(element, index)
{
	// the element may be placed anywhere on a form
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	// the left and top values of an element are also stored as direct values in the object array
	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	// the element always has a fixed width and height
	element.style.width = "42px";
	element.style.height = "42px";

	// set the width and height in the object array
	objects[index].width = 42;
	objects[index].height = 42;

	element.style.padding = "0px";
	element.style.margin = "0px";

	// add the dialog box button to the element
	element.innerHTML = "<img src = \"img/savebutton.png\">";
}
