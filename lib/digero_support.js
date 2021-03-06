// The object that creates the toolbox - data is a JSON object that accepts the following parameters:
// "id" - the name of the toolbox
// "x", "y" - the x/y position of the toolbox, in pixels
// "width", "height" - the width and height of the toolbox, in pixels
// "background" - the background color of the toolbox
// "background_header" - the background color of the toolbox header

function toolbox(data)
{
	// the arrays for the four DOM elements that are created for each tool
	this.tools = new Array();
	this.tools_image = new Array();
	this.tools_label = new Array();

	// the array that stores tool names
	this.tools_name = new Array();

	this.id = data.id;

	// the variable indicating the index of the tool has been selected, if any
	this.select = -1;

	// create main div for toolbox using supplied data
	this.toolbox_div = document.createElement("div");
	this.toolbox_div.id = data.id;
	this.toolbox_div.style.position = "absolute";

	this.toolbox_div.style.top = data.y + "px";
	this.toolbox_div.style.left = data.x + "px";

	this.toolbox_div.style.width = data.width + "px";
	this.toolbox_div.style.height = data.height + "px";

	this.toolbox_div.style.backgroundColor = data.background;

	// add div to application page
	document.body.appendChild(this.toolbox_div);

	// create main div header for toolbox, using (in part) supplied data
	this.toolbox_div_header = document.createElement("div");
	this.toolbox_div_header.id = data.id;
	this.toolbox_div_header.style.position = "absolute";

	this.toolbox_div_header.style.top = "0px";
	this.toolbox_div_header.style.left = "0px";

	this.toolbox_div_header.style.width = (data.width - 3) + "px";
	this.toolbox_div_header.style.height = "17px";

	this.toolbox_div_header.style.backgroundColor = data.background_header;
	this.toolbox_div_header.style.color = "#ffffff";

	this.toolbox_div_header.style.fontFamily = "ABeeZee";
	this.toolbox_div_header.style.fontSize = "12px";

	this.toolbox_div_header.style.paddingLeft = "3px";
	this.toolbox_div_header.style.paddingTop = "3px";

	this.toolbox_div_header.innerHTML = "Toolbox";

	// add div to main toolbox div
	this.toolbox_div.appendChild(this.toolbox_div_header);

	// creates the div that will contain the tools that are added, using (in part) supplied data
	this.toolbox_div_list = document.createElement("div");
	this.toolbox_div_list.id = data.id + "_list";
	this.toolbox_div_list.style.position = "absolute";

	this.toolbox_div_list.style.top = "20px";
	this.toolbox_div_list.style.left = "0px";

	this.toolbox_div_list.style.width = data.width + "px";
	this.toolbox_div_list.style.height = (data.height - 20) + "px";

	this.toolbox_div_list.style.overflowY = "scroll";
	this.toolbox_div_list.style.overflowX = "hidden";

	// add div to the main toolbox div
	this.toolbox_div.appendChild(this.toolbox_div_list);

	// The object function called when a tool (or header) is added to the toolbox
	// data is a JSON objects that accepts the following parameters:
	// "name" - the name of the tool (headers are prefaced with "header:")
	// "image" - the src of the tool image (not included with headers)
	this.add_tool = function(data)
	{
		// set the index to the end of the tools array
		var index = this.tools.length;

		// header names will be prefaced with "header:"
		if (data.name.substring(0, 6) != "header")
		{
			// store the tool name in the array
			this.tools_name[index] = data.name;

			// create the div that will contain the tool name and image in the toolbox
			this.tools[index] = document.createElement("div");
			this.tools[index].id = this.id + "_tool_" + index;
			this.tools[index].style.position = "absolute";

			this.tools[index].style.top = (22 * index) + "px";
			this.tools[index].style.left = "0px";

			// the width is the same as the toolbox header width
			this.tools[index].style.width = (parseInt(this.toolbox_div_header.style.width) - 9) + "px";
			this.tools[index].style.height = "17px";

			this.tools[index].style.backgroundColor = "#252526";
			this.tools[index].style.color = "#d0d0d0";

			this.tools[index].style.fontFamily = "ABeeZee";
			this.tools[index].style.fontSize = "12px";

			this.tools[index].style.paddingLeft = "3px";
			this.tools[index].style.paddingTop = "3px";
			this.tools[index].style.paddingBottom = "3px";

			this.toolbox_div_list.appendChild(this.tools[index]);

			// the header background color changes when the mouse moves over it
			this.tools[index].onmouseover = (function (this_toolbox)
			{
				return function(evt)
				{
					var index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

					// the background color does not change if the tool is already selected
					if (this_toolbox.select != index)
						this.style.backgroundColor = "#3e3e40";
				}
			}) (this);

			// set the background color back to the regular after the mouse moves out
			this.tools[index].onmouseout = (function (this_toolbox)
			{
				return function(evt)
				{
					var index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

					// the background color does not change if the tool is already selected
					if (this_toolbox.select != index)
						this.style.backgroundColor = "#252526";
				}
			}) (this);

			// when a tool is selected, its background color changes
			this.tools[index].onclick = (function (this_toolbox)
			{
				return function(evt)
				{
					// the index value for this tool is retrieved from the tool id
					var index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);
					this_toolbox.select = index;

					// in order to clear old selections, every tool background color is reset
					for (var i = 0; i < this_toolbox.tools.length; i++)
					{
						// if this is the selected tool, its background color will change
						if (i == index)
							this_toolbox.tools[i].style.backgroundColor = "#007acc";

						// if not, set the background color to the regular
						else if (this_toolbox.tools_name[i].substring(0, 6) != "header")
							this_toolbox.tools[i].style.backgroundColor = "#252526";
					}			
				}
			}) (this);

			// the image element appears at the left of the tool div
			this.tools_image[index] = document.createElement("div");
			this.tools_image[index].id = this.id + "_tool_" + index + "_image";
			this.tools_image[index].style.position = "absolute";

			this.tools_image[index].style.top = "0px";
			this.tools_image[index].style.left = "0px";

			this.tools_image[index].style.width = "25px";
			this.tools_image[index].style.height = "17px";

			this.tools_image[index].style.color = "#d0d0d0";

			this.tools_image[index].style.paddingLeft = "3px";
			this.tools_image[index].style.paddingTop = "3px";

			// the image is added via HTML to the div, using the supplied src
			this.tools_image[index].innerHTML = "<center><img src = '" + data.image + "'></center>";

			this.tools[index].appendChild(this.tools_image[index]);		

			// the label appears to the right of the image
			this.tools_label[index] = document.createElement("div");
			this.tools_label[index].id = this.id + "_tool_" + index + "_label";
			this.tools_label[index].style.position = "absolute";

			this.tools_label[index].style.top = "5px";
			this.tools_label[index].style.left = "28px";

			//this.tools_label[index].style.width = "25px";
			this.tools_label[index].style.height = "17px";

			this.tools_label[index].style.color = "#d0d0d0";

			this.tools_label[index].style.paddingLeft = "3px";

			// the supplied name is added to the div
			this.tools_label[index].innerHTML = data.name;

			this.tools[index].appendChild(this.tools_label[index]);
		}

		// header elements still use tool and header divs, but not image
		else
		{
			this.tools_name[index] = data.name;

			// create the div that will contain the header name in the toolbox
			this.tools[index] = document.createElement("div");
			this.tools[index].id = this.id + "_tool_" + index;
			this.tools[index].style.position = "absolute";

			this.tools[index].style.top = (22 * index) + "px";
			this.tools[index].style.left = "0px";

			this.tools[index].style.width = (parseInt(this.toolbox_div_header.style.width) - 9) + "px";
			this.tools[index].style.height = "17px";

			this.tools[index].style.backgroundColor = "#404040";
			this.tools[index].style.color = "#d0d0d0";

			this.tools[index].style.fontFamily = "ABeeZee";
			this.tools[index].style.fontSize = "12px";

			this.tools[index].style.paddingLeft = "3px";
			this.tools[index].style.paddingTop = "3px";
			this.tools[index].style.paddingBottom = "3px";

			this.toolbox_div_list.appendChild(this.tools[index]);

			// this div contains the header name
			this.tools_label[index] = document.createElement("div");
			this.tools_label[index].id = this.id + "_tool_" + index + "_label";
			this.tools_label[index].style.position = "absolute";

			this.tools_label[index].style.top = "5px";
			this.tools_label[index].style.left = "5px";

			//this.tools_label[index].style.width = "25px";
			this.tools_label[index].style.height = "17px";

			this.tools_label[index].style.color = "#d0d0d0";

			this.tools_label[index].style.paddingLeft = "3px";

			// the header name is supplied via the data object - the "header:" preface is skipped over
			this.tools_label[index].innerHTML = "<b>" + data.name.substring(7, data.name.length) + "</b>";

			this.tools[index].appendChild(this.tools_label[index]);			
		}
	}

	// a tool may also be selected using this function
	this.set_tool = function(index)
	{
		// set the select variable to the provided index
		this.select = index;

		// in order to clear old selections, every tool background color is reset
		for (var i = 0; i < this.tools.length; i++)
		{
			// if this is the selected tool, its background color will change
			if (i == index)
				this.tools[i].style.backgroundColor = "#007acc";

			// if not, set the background color to the regular
			else if (this.tools_name[i].substring(0, 6) != "header")
				this.tools[i].style.backgroundColor = "#252526";
		}		
	}

	// this function is used to resize the toolbox by the amount specified in quant
	this.select_resize = function(quant, side)
	{
		// atm only right size resizing is possible
		if (side == "right")
		{
			// resize the three main toobox DOM elements
			this.toolbox_div.style.width = (parseInt(this.toolbox_div.style.width) + quant) + "px";
			this.toolbox_div_header.style.width = (parseInt(this.toolbox_div_header.style.width) + quant) + "px";
			this.toolbox_div_list.style.width = (parseInt(this.toolbox_div_list.style.width) + quant) + "px";

			// resize the main DOM element for each tool
			for (var i = 0; i < this.tools.length; i++)
				this.tools[i].style.width = (parseInt(this.tools[i].style.width) + quant) + "px";
		}
	}
}

// The Formspace is where most of the activity in Digero takes place - it is the central space where forms, code, and data are
// created. It consists of a main div that contains tabs and panels. Each panel - form, code, data - is created via a separate
// function. The indexes for the arrays in these functions are always mapped to the tab index - this means that there will
// be gaps in these arrays when multiple panel types are used.

// data is a JSON objects that accepts the following parameters:
// "id" - the name of the formspace
// "x", "y" - the x/y position of the formspace, in pixels
// "width", "height" - the width and height of the formspace, in pixels
// "background" - the background color of the formspace

function formspace(data)
{
	// stored the number of tabs in the formspace
	this.tabs = 0;

	this.tab_left = 0;

	// the formspace has fixed values for values like the width of the tabs and the gaps between them
	this.tab_name_width = 120;
	this.tab_name_gap = 4;
	this.tab_max = 6;
	this.tab_focus_index = -1;

	this.tab_divs = new Array();
	this.tab_names = new Array();
	this.tab_forms = new Array();
	this.tab_pos = new Array();

	this.tab_codes = new Array();
	this.tab_editors = new Array();

	this.tab_data = new Array();
	this.tab_datatable = new Array();
	this.table_data = new Array();
	this.table = new Array();
	this.table_ui = new Array();

	this.tab_types = new Array();
	
	// for code tabs, the index of the related form is stored in this variable (-1 if standalone)
	this.tab_codes_forms = new Array();

	this.tab_codes_objects = new Array();
	this.tab_codes_events = new Array();

	this.tab_outlines = new Array();
	this.tab_move = new Array();
	this.tab_expand = new Array();
	this.form_select = new Array();
	this.outlines_focus = new Array();

	this.form_num = new Array();
	this.form_count = 0;
	this.search_flag = false;

	this.toolbox_sel = undefined;

	// the index and name of the data table that is currently visible - used in the context dialog box
	this.column_context_table = null;
	this.column_context_name = null;

	this.resize_dir = "";
	this.resize_mousedown = false;
	this.move_mousedown = false;
	this.resize_x = -1;
	this.resize_y = -1;

	this.select_down = false;
	this.select_type = null;
	this.select_id = null;
	this.select_x = -1;
	this.select_y = -1;

	// the defualt width and height when a form is created
	this.default_width = "700";
	this.default_height = "500";

	this.name = data.id;

	this.background = data.background;

	// create main div for formspace using supplied data
	this.formspace_div = document.createElement("div");
	this.formspace_div.id = data.id;
	this.formspace_div.style.position = "absolute";

	this.formspace_div.style.top = data.y + "px";
	this.formspace_div.style.left = data.x + "px";

	this.formspace_div.style.width = data.width + "px";
	this.formspace_div.style.height = data.height + "px";

	this.formspace_div.style.overflow = "hidden";

	this.formspace_div.addEventListener("mousemove", function (this_formspace)
	{
		return function(evt)
		{
			if (tab_select != null)
			{
				var x_diff = evt.clientX - tab_select_x;
				this_formspace.tab_names[tab_select].style.left = (tab_select_left + x_diff) + "px";
			}
		}
	} (this), false);

	this.formspace_div.addEventListener("mouseup", function (this_formspace)
	{
		return function(evt)
		{
			if (tab_select != null)
			{
				var tab_x = Math.round(parseInt(this_formspace.tab_names[tab_select].style.left) / this_formspace.tab_name_width);

				if (tab_x < 0)
					tab_x = 0;
				else if (tab_x > this_formspace.tabs - 1)
					tab_x = this_formspace.tabs - 1;

				this_formspace.tab_names[tab_select].style.left = (tab_x * 124) + "px";

				var old_x = this_formspace.tab_pos[tab_select];
				this_formspace.tab_pos[tab_select] = tab_x;

				var tabs_to_move = new Array();

				if (tab_x < old_x)
				{
					for (var i = tab_x; i < old_x; i++)
					{
						for (var j = 0; j < this_formspace.tab_pos.length; j++)
							if (this_formspace.tab_pos[j] == i && j != tab_select)
								break;

						if (j < this_formspace.tab_pos.length)
							tabs_to_move.push(j);
					}

					for (var i = 0; i < tabs_to_move.length; i++)
					{
						this_formspace.tab_names[tabs_to_move[i]].style.left = (parseInt(this_formspace.tab_names[tabs_to_move[i]].style.left) + 124) + "px";
						this_formspace.tab_pos[tabs_to_move[i]]++;
					}
				}
				else
				{
					for (var i = old_x; i <= tab_x; i++)
					{
						for (var j = 0; j < this_formspace.tab_pos.length; j++)
							if (this_formspace.tab_pos[j] == i && j != tab_select)
								break;

						if (j < this_formspace.tab_pos.length)
							tabs_to_move.push(j);
					}

					for (var i = 0; i < tabs_to_move.length; i++)
					{
						this_formspace.tab_names[tabs_to_move[i]].style.left = (parseInt(this_formspace.tab_names[tabs_to_move[i]].style.left) - 124) + "px";
						this_formspace.tab_pos[tabs_to_move[i]]--;
					}						
				}

				this_formspace.tab_names[tab_select].style.zIndex = 12;

				tab_select = null;
			}
		}
	} (this), false);

	// add div to application page
	document.body.appendChild(this.formspace_div);

	// it is necessary to build a container for the tabspace because the tabspace can be shifted left and right when there is an overflow of tabs
	this.tabspace_container = document.createElement("div");
	this.tabspace_container.id = data.id + "_tabcontainer";
	this.tabspace_container.style.position = "absolute";

	this.tabspace_container.style.top = "0px";
	this.tabspace_container.style.left = "0px";

	// the width of the container is the same as the width of the formspace
	this.tabspace_container.style.width = (data.width - 69) + "px";
	this.tabspace_container.style.height = "23px";

	this.tabspace_container.style.overflow = "hidden";

	this.formspace_div.appendChild(this.tabspace_container);

	// the tabspace contains the tabs that are added to the formspace
	this.tabspace_div = document.createElement("div");
	this.tabspace_div.id = data.id + "_tabspace";
	this.tabspace_div.style.position = "absolute";

	this.tabspace_div.style.top = "0px";
	this.tabspace_div.style.left = "0px";

	// the width is set to be wider than the formspace, to accomodate an overflow of tabs
	this.tabspace_div.style.width = "1000px";
	this.tabspace_div.style.height = "23px";

	this.tabspace_container.appendChild(this.tabspace_div);

	// the tabmoves div contains the buttons image used to shift the tabspace left and right
	this.tabmoves_div = document.createElement("div");
	this.tabmoves_div.id = data.id + "_tabmove";
	this.tabmoves_div.style.position = "absolute";

	this.tabmoves_div.style.top = "0px";
	this.tabmoves_div.style.left = (data.width - 69) + "px";

	this.tabmoves_div.style.width = "69px";
	this.tabmoves_div.style.height = "23px";

	this.tabmoves_div.style.overflow = "hidden";
	this.tabmoves_div.style.cursor = "pointer";

	// the tabmoves image contains three buttons - left, right, and down (which shows a list of tabs)
	this.tabmoves_div.innerHTML = "<img src = \"img/tab_moves.png\">";

	this.formspace_div.appendChild(this.tabmoves_div);

	// The tabmoves image actually consists of three button images - from left to right, they are: left button, right button,
	// down button. This event handler determines where the user clicked on the image, and performs the necessary action. This
	// is a mousedown event because the tabspace will continue to scroll at select intervals until mouseup.

	// The formspace is passed as a parameter to the event handler.

	this.tabmoves_div.addEventListener("mousedown", function (this_formspace)
		{
			return function(evt)
			{
				index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);
				
				// the DOMRect is retrieved to find the mouse x/y relative to the tabmoves element
				var rect = this.getBoundingClientRect();
				var x = evt.clientX - rect.left;
				var y = evt.clientY - rect.top;

				// Each button is 23 pixels across, so the left button is clicked if x is less than 23. Note that the left button
				// actually makes the tabspace move right - the idea is that the user is trying to access the tabs further to the
				// left in the tabspace.
				if (x < 23)
				{
					// move the tabspace left 20 pixels (this may be adjusted in later versions, though it works well)
					this_formspace.tabspace_div.style.left = (parseInt(this_formspace.tabspace_div.style.left) + 20) + "px";

					// if the tabspace x value goes above 0, keep it at 0, since there are no more tabs in that direction
					if (parseInt(this_formspace.tabspace_div.style.left) > 0)
						this_formspace.tabspace_div.style.left = "0px";

					// Set a function going that will continue to shift the tabspace until mouseup. Note that the 200msec interval
					// chosen is a bit slow, but prevents the tabspace from moving too quickly. The variable tab_shift_interval
					// stores the process id so that it may be used in the mouseup event.
					tab_shift_interval = setInterval((function(this_formspace){
						return function()
						{
							// this is the same movement code as above
					    	this_formspace.tabspace_div.style.left = (parseInt(this_formspace.tabspace_div.style.left) + 20) + "px";

							if (parseInt(this_formspace.tabspace_div.style.left) > 0)
								this_formspace.tabspace_div.style.left = "0px";
						}
					}) (this_formspace), 200);
				}

				// If x is less than 46 (but not less than 23), than the right button is clicked. Note that the right button
				// actually makes the tabspace move left - the idea is that the user is trying to access the tabs further to the
				// right in the tabspace.
				else if (x < 46)
				{
					// move the tabspace left 20 pixels (this may be adjusted in later versions, though it works well)
					this_formspace.tabspace_div.style.left = (parseInt(this_formspace.tabspace_div.style.left) - 20) + "px";

					// Set a function going that will continue to shift the tabspace until mouseup. Note that the 200msec interval
					// chosen is a bit slow, but prevents the tabspace from moving too quickly. The variable tab_shift_interval
					// stores the process id so that it may be used in the mouseup event.
					tab_shift_interval = setInterval((function(this_formspace){
						return function()
						{
							// this is the same movement code as above
					    	this_formspace.tabspace_div.style.left = (parseInt(this_formspace.tabspace_div.style.left) - 20) + "px";
						}
					}) (this_formspace), 200);
				}

				// If x is not less than 46, then the down button has been pressed. This generates a div in which all of the tabs
				// in the formspace are listed, and the user can select a tab to view. If the down button is clicked again, this
				// list will disappear.
				else
				{
					// if the tab list does not already exist, it will be created and displayed
					if (document.getElementById(this_formspace.name + "_tablist") == null)
					{
						// the tab list is itself a div, which will contain a div entry for every tab
						this_formspace.tab_list = document.createElement("div");
						this_formspace.tab_list.id = this_formspace.name + "_tablist";
						this_formspace.tab_list.style.position = "absolute";

						// Since the tablist is added to the document body, it must be positioned from the body perspective. This means that
						// the x/y positions of both the formspace and the tabmoves image must be retrieved.
						this_formspace.tab_list.style.left = parseInt(this.style.left) + parseInt(this.parentElement.style.left) - 181 + "px";
						this_formspace.tab_list.style.top = parseInt(this.style.top) + parseInt(this.parentElement.style.top) + 23 + "px";

						this_formspace.tab_list.style.width = "250px";

						// the tab list does not scroll, so it must be large enough to list every tab in the formspace
						this_formspace.tab_list.style.height = (this_formspace.tabs * 22) + "px";

						// ensure that the tab list appears above everything else in the formspace
						this_formspace.tab_list.style.zIndex = 100;

						this_formspace.tab_list.style.backgroundColor = "#f2f2f2";

						// tab list is added directly to the document body
						document.body.appendChild(this_formspace.tab_list);

						// the divs for each tab are stored in an array - note that this array is recreated each time the tab list appears.
						this_formspace.tab_list_tabs = new Array();

						for (var i = 0; i < this_formspace.tabs; i++)
						{
							// Note that the tabs are listed in their position order in the tabspace, not their indexed order. So for each
							// i, the tab_pos array is searched until the tab that has a location equal to the current i is found. 
							for (j = 0; j < this_formspace.tabs; j++)
								if (this_formspace.tab_pos[j] == i)
									break;

							// each entry in the tab list is its own div
							this_formspace.tab_list_tabs[i] = document.createElement("div");
							this_formspace.tab_list_tabs[i].id = this_formspace.name + "_tablist_" + i;
							this_formspace.tab_list_tabs[i].style.position = "absolute";

							// each entry is positioned underneath the previous
							this_formspace.tab_list_tabs[i].style.left = "0px";
							this_formspace.tab_list_tabs[i].style.top = (i * 22) + "px";

							this_formspace.tab_list_tabs[i].style.width = "240px";
							this_formspace.tab_list_tabs[i].style.height = "19px";

							// padding so there is whitespace to the top and left
							this_formspace.tab_list_tabs[i].style.paddingLeft = "10px";
							this_formspace.tab_list_tabs[i].style.paddingTop = "3px";

							this_formspace.tab_list_tabs[i].style.fontFamily = "ABeeZee";
							this_formspace.tab_list_tabs[i].style.fontSize = "12px";
							this_formspace.tab_list_tabs[i].style.color = "#000000";

							// use the same name that appears on the tab itself
							this_formspace.tab_list_tabs[i].innerHTML = main_formspace.tab_names[j].innerHTML;

							this_formspace.tab_list.appendChild(this_formspace.tab_list_tabs[i]);	

							// the entry is highlighted when the mouse moves over it
							this_formspace.tab_list_tabs[i].addEventListener("mouseover", function(evt)
							{
								this.style.backgroundColor = "#91c9f7";
							}, false);

							// remove background color when the mouse leaves the entry
							this_formspace.tab_list_tabs[i].addEventListener("mouseout", function(evt)
							{
								this.style.backgroundColor = "transparent";
							}, false);

							// When the entry is clicked, the related tab panel is displayed, and the tabspace is shifted so that the tab is in view.
							// The formspace and the j value - that is, the index of the tab in position i - are passed as parameters.
							this_formspace.tab_list_tabs[i].addEventListener("click", function (this_formspace, index)
							{
								return function(evt)
								{
									// the set_tab_focus function makes the tab pabel with the passed value appear
									main_formspace.set_tab_focus(index);

									// the tab list is removed from view
									document.body.removeChild(this_formspace.tab_list);

									// now the tabspace is shifted to make the selected tab appear - first the x position of the tabspace is retrieved
									var tab_left = parseInt(main_formspace.tabspace_div.style.left);

									// next the width of the tabspace container is stored
									var tab_width = parseInt(main_formspace.tabspace_container.style.width);

									// finally, the x position of the tab itself within the tabspace is stored
									var tab_select = parseInt(main_formspace.tab_names[index].style.left);

									// If the righthand x of the tab (that it, its position plus its width) is greater than the x position of the tabspace
									// at the righthand edge of the container, then the tab is too far to the right to see in full.
									if (tab_select + this_formspace.tab_name_width > tab_width - tab_left)

										// shift the tabspace to the left by the amount of pixels needed to make the tab appear at the righthand side of the container
										main_formspace.tabspace_div.style.left = parseInt(main_formspace.tabspace_div.style.left) - ((tab_select + this_formspace.tab_name_width) - (tab_width - tab_left)) + "px";

									// If the lefthand position of the tab within the tabspace is less than the x position of the tabspace at the lefthand side of
									// the container, then the tab is too far to the left.
									else if (tab_left + tab_select < 0)

										// shift the tabspace to the right by the amount of pixels needed to make the tab appear at the lefthand side of the container
										main_formspace.tabspace_div.style.left = parseInt(main_formspace.tabspace_div.style.left) + Math.abs(tab_left + tab_select) + "px";
								}
							} (this_formspace, j), false);
						}
					}

					// if the tab list is already visible, then remove it
					else
					{
						document.body.removeChild(this_formspace.tab_list);
					}
				}
			}
		} (this), false);

	// if mouseup occurs over the tabmoves image, stop any interval in which the tabspace is moving
	this.tabmoves_div.addEventListener("mouseup", function (this_formspace)
	{
		return function(evt)
		{
			clearInterval(tab_shift_interval);
		}
	} (this), false);


	// This is the dialog box that opens when you right-click a column header in a data table. The dialog allows you to rename the
	// column, as well as select from three possible data types: text, HTML, and JavaScript. If JavaScript is selected, a list
	// element unlocks that allows you to list parameter variables for the JavaScript code in each cell - note that these cells
	// are converted into functions at runtime.

	// Note that the same dialog is used for every data panel on the formspace.

	this.data_context = document.createElement("div");

	// the id is derived in part from the id of the formspace
	this.data_context.id = data.id + "_data_context";
	this.data_context.style.position = "absolute";

	// the x/y positioning is irrelevant at this point, since the dialog is hidden
	this.data_context.style.top = "0px";
	this.data_context.style.left = "0px";

	// the width/height fits all the necessary elements without being too large
	this.data_context.style.width = "285px";
	this.data_context.style.height = "250px";

	this.data_context.style.overflow = "hidden";
	this.data_context.backgroundColor = "f0f0f0";

	this.data_context.style.backgroundColor = "#f0f0f0";

	this.data_context.style.borderWidth = "1px";
	this.data_context.style.borderStyle = "solid";
	this.data_context.style.borderColor = "#000000";

	// the box shadow makes the dialog look more like a window, and less like a div
	this.data_context.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";
	this.data_context.style.zIndex = 100;

	// visibility is hidden until a user right-clicks on a column header
	this.data_context.style.visibility = "hidden";

	document.body.appendChild(this.data_context);

	// this is the header that appears at the top of the dialog
	this.data_context_header = document.createElement("div");
	this.data_context_header.id = data.id;
	this.data_context_header.style.position = "absolute";

	this.data_context_header.style.top = "0px";
	this.data_context_header.style.left = "0px";

	// the header spans the width of the dialog
	this.data_context_header.style.width = "285px";
	this.data_context_header.style.height = "24px";

	this.data_context_header.style.backgroundColor = "#ffffff";
	this.data_context_header.style.color = "#000000";

	this.data_context_header.style.fontFamily = "Varta";
	this.data_context_header.style.fontSize = "13px";

	// padding so the header text doesn't appear in the top-left corner of the div
	this.data_context_header.style.paddingLeft = "7px";
	this.data_context_header.style.paddingTop = "5px";

	// the header text for the dialog
	this.data_context_header.innerHTML = "Edit Column";

	this.data_context.appendChild(this.data_context_header);

	// The dialog has three buttons that run along the bottom: Apply, Delete, and Cancel.

	// depite the odd variable name, this is the Apply button
	this.data_context_close = document.createElement("button");
	this.data_context_close.id = data.id + "_data_context_close";
	this.data_context_close.style.position = "absolute";

	// positioed near the bottom-left corner of the dialog
	this.data_context_close.style.top = "220px";
	this.data_context_close.style.left = "4px";

	this.data_context_close.style.width = "90px";
	this.data_context_close.style.height = "24px";

	this.data_context_close.style.color = "#000000";

	this.data_context_close.style.fontFamily = "Varta";
	this.data_context_close.style.fontSize = "13px";

	// button text here
	this.data_context_close.innerHTML = "Apply";

	this.data_context.appendChild(this.data_context_close);

	// The Apply button, when clicked, is where most of the action takes place in the dialog box. If the column has been renamed, then
	// the data table itself must be updated - this happens in a separate function. If the column type has changed, various things can 
	// happen - for those instances when the column type is switched to code (HTML or JavaScript), then an external function is called 
	// to handle that conversion. If the column is changed from code to text, the conversion is handled within the click event itself.

	// Note that select_table and col_select are glocbal variables that are set when a column in a data table is right-clicked.

	this.data_context_close.onclick = (function (this_formspace)
	{
		return function(evt)
		{
			//var index = main_formspace.column_context_table;
			//var col_title = main_formspace.column_context_name;

			//if (main_formspace.data_context_name.value != col_title)
			
			// for the moment the rename_col function is always called, and the commented code above is thus inactive
			select_table.rename_col(col_select, main_formspace.data_context_name.value);

			// the existing column data type is stored for comparisons below
			var old_type = select_table.col_type[col_select];

			// code for when the type selected is either HTML or JavaScript
			if (main_formspace.data_context_type.value == "HTML" || main_formspace.data_context_type.value == "JavaScript")
			{
				// set the column type for this column in the table to "code"
				select_table.col_type[col_select] = "code";

				// the subtype for this column is then changed to the specific code that was selected
				if (main_formspace.data_context_type.value == "HTML")
					select_table.col_sub[col_select] = "html";
				else if (main_formspace.data_context_type.value == "JavaScript")
					select_table.col_sub[col_select] = "javascript";

				// if the column was formerly a text type, then every cell in the column must then be converted to Ace divs
				if (old_type == "string")
				{
					// each row in the column is converted individually
					for (var i = 0; i < select_table.row_label.length; i++)
						select_table.create_code(col_select, i);
				}

				// the parameter list is retrieved (only applicable for JavaScript code), replacing the line breaks with commas
				var params = main_formspace.data_context_params.value.replaceAll("\n", ",");

				// if the last row in the list was an empty row, the string will end with a comma, so remove
				if (params.lastIndexOf(",") == params.length - 1)
					params = params.substring(0, params.length - 1);

				// the parameters are stored in the data table itself
				select_table.col_params[col_select] = params;

				// the table in the project_data object is updated
				update_cols(select_table);
			}

			// code for when the type selected is Text (called "string" internally)
			else
			{
				// update the column type for this column
				select_table.col_type[col_select] = "string";

				// if the column was formerly a code type, the row cells must be reconverted into regular divs
				if (old_type == "code")
				{
					// each row in the table is handled individually
					for (var i = 0; i < select_table.row_label.length; i++)
					{
						// the Ace object associated with the table cell is retrieved and stored
						var editor_index = select_table.table_codes[i][col_select];

						// the text in this editor object is retrieved
						var text = select_table.code_divs[editor_index].getValue();

						// finally, the Ace object itself is destroyed, so the cell becomes a regular div
						select_table.code_divs[editor_index].destroy();

						// cells in odd and even rows have different background colors
						if (i % 2 == 0)
							select_table.table_data[i][col_select].style.backgroundColor = "#666666";
						else
							select_table.table_data[i][col_select].style.backgroundColor = "#444444";

						// the original font styles for the div are restored
						select_table.table_data[i][col_select].style.fontFamily = "Varta";
						select_table.table_data[i][col_select].style.fontSize = "14px";
						select_table.table_data[i][col_select].style.color = "#ffffff";

						// finally, the text retrieved from the editor is added
						select_table.table_data[i][col_select].innerHTML = text;
					}
				}
			}

			/*if (main_formspace.data_context_name.value != col_title)
			{
 				var old_name = col_title;

				if (main_formspace.data_context_name.value != "" && main_formspace.data_context_name.value != null)
				{
					if (main_formspace.data_context_multi.checked == true)
						main_formspace.table[index].updateColumnDefinition(col_title, {title: main_formspace.data_context_name.value, field: main_formspace.data_context_name.value, formatter: "textarea"});
					else
						main_formspace.table[index].updateColumnDefinition(col_title, {title: main_formspace.data_context_name.value, field: main_formspace.data_context_name.value, formatter: "plaintext"});

					var table = main_formspace.table[index].getData();
					for (var i = 0; i < table.length; i++)
					{
						table[i][main_formspace.data_context_name.value] = table[i][col_title];
						delete table[i][col_title];
					}

					var columns = main_formspace.table[index].getColumnDefinitions();

					for (var i = 0; i < columns.length; i++)
						if (columns[i].title == col_title)
							break;

					columns.splice(i, 1);

					main_formspace.table[index].clearData();
					main_formspace.table[index].setColumns(columns);
					main_formspace.table[index].addData(table);
				}
			}
			else
			{		
				if (main_formspace.data_context_multi.checked == true)
					main_formspace.table[index].updateColumnDefinition(col_title, {formatter: "textarea"});
				else
					main_formspace.table[index].updateColumnDefinition(col_title, {formatter: "plaintext"});
			}*/

			// the column in the table is deselected
			select_table.deselect_col(col_select);

			// the dialog itself is hidden again
			this_formspace.hide_context();		
		}
	}) (this);

	// the Delete button is the second button in the row
	this.data_context_delete = document.createElement("button");
	this.data_context_delete.id = data.id + "_data_context_delete";
	this.data_context_delete.style.position = "absolute";

	this.data_context_delete.style.top = "220px";
	this.data_context_delete.style.left = "98px";

	this.data_context_delete.style.width = "90px";
	this.data_context_delete.style.height = "24px";

	this.data_context_delete.style.color = "#000000";

	this.data_context_delete.style.fontFamily = "Varta";
	this.data_context_delete.style.fontSize = "13px";

	this.data_context_delete.innerHTML = "Delete";

	this.data_context.appendChild(this.data_context_delete);

	// the onclick code for the Delete button is to be added

	// the Cancel button is the third button in the row
	this.data_context_cancel = document.createElement("button");
	this.data_context_cancel.id = data.id + "_data_context_cancel";
	this.data_context_cancel.style.position = "absolute";

	this.data_context_cancel.style.top = "220px";
	this.data_context_cancel.style.left = "191px";

	this.data_context_cancel.style.width = "90px";
	this.data_context_cancel.style.height = "24px";

	this.data_context_cancel.style.color = "#000000";

	this.data_context_cancel.style.fontFamily = "Varta";
	this.data_context_cancel.style.fontSize = "13px";

	// button text here
	this.data_context_cancel.innerHTML = "Cancel";

	this.data_context.appendChild(this.data_context_cancel);

	// if the Cancel button is clicked, very little actually has to happen
	this.data_context_cancel.onclick = (function (this_formspace)
	{
		return function(evt)
		{
			// the column in the table is deselected
			select_table.deselect_col(col_select);

			// the dialog itself is hidden again
			this_formspace.hide_context();		
		}
	}) (this);

	// this div is the label for the Name textbox (added below)
	this.data_context_label1 = document.createElement("div");
	this.data_context_label1.id = data.id + "_data_context_label1";
	this.data_context_label1.style.position = "absolute";

	this.data_context_label1.style.top = "45px";
	this.data_context_label1.style.left = "15px";

	this.data_context_label1.style.width = "40px";
	this.data_context_label1.style.height = "24px";

	this.data_context_label1.style.fontFamily = "Varta";
	this.data_context_label1.style.fontSize = "13px";

	this.data_context_label1.innerHTML = "Name:";

	this.data_context.appendChild(this.data_context_label1);

	// this is the Name textbox itself
	this.data_context_name = document.createElement("input");
	this.data_context_name.id = data.id + "_data_context_name";
	this.data_context_name.style.position = "absolute";

	this.data_context_name.style.top = "40px";
	this.data_context_name.style.left = "53px";

	this.data_context_name.style.width = "205px";
	this.data_context_name.style.height = "18px";

	this.data_context_name.style.color = "#000000";

	this.data_context_name.style.fontFamily = "Varta";
	this.data_context_name.style.fontSize = "13px";

	this.data_context_name.style.paddingTop = "3px";

	// the existing name of the column is added here when the dialog opens
	this.data_context_name.value = "";

	this.data_context.appendChild(this.data_context_name);

	// this div is the label for the Type select box (added below)
	this.data_context_label2 = document.createElement("div");
	this.data_context_label2.id = data.id + "_data_context_label2";
	this.data_context_label2.style.position = "absolute";

	this.data_context_label2.style.top = "80px";
	this.data_context_label2.style.left = "18px";

	this.data_context_label2.style.width = "40px";
	this.data_context_label2.style.height = "24px";

	this.data_context_label2.style.fontFamily = "Varta";
	this.data_context_label2.style.fontSize = "13px";

	this.data_context_label2.innerHTML = "Type:";

	this.data_context.appendChild(this.data_context_label2);

	// this is the Type select box itself
	this.data_context_type = document.createElement("select");
	this.data_context_type.id = data.id + "_data_context_type";
	this.data_context_type.style.position = "absolute";

	this.data_context_type.style.top = "75px";
	this.data_context_type.style.left = "53px";

	this.data_context_type.style.width = "208px";
	this.data_context_type.style.height = "27px";

	this.data_context_type.style.color = "#000000";

	this.data_context_type.style.fontFamily = "Varta";
	this.data_context_type.style.fontSize = "13px";

	this.data_context_type.style.paddingTop = "3px";
	this.data_context_type.value = "";

	this.data_context.appendChild(this.data_context_type);

	// the three options for the Type select box are added
	var option = document.createElement("option");
	option.value = "Text";
	option.innerHTML = "Text";
	this.data_context_type.appendChild(option);

	var option = document.createElement("option");
	option.value = "HTML";
	option.innerHTML = "HTML";
	this.data_context_type.appendChild(option);

	var option = document.createElement("option");
	option.value = "JavaScript";
	option.innerHTML = "JavaScript";
	this.data_context_type.appendChild(option);

    // when an option is selected, the parameter list element may be enabled or disabled
	this.data_context_type.addEventListener("change", function (this_formspace)
	{
		return function(evt)
		{
		    // if the selected option is JavaScript, enable the element
			if (this.value == "JavaScript")
				this_formspace.show_params();
				
			// if not, disable the element
			else
				this_formspace.hide_params();
		}
	} (this), false);

    // this is the parameter list label
	this.data_context_label3 = document.createElement("div");
	this.data_context_label3.id = data.id + "_data_context_label3";
	this.data_context_label3.style.position = "absolute";

	this.data_context_label3.style.top = "110px";
	this.data_context_label3.style.left = "15px";

	this.data_context_label3.style.width = "180px";
	this.data_context_label3.style.height = "24px";

	this.data_context_label3.style.fontFamily = "Varta";
	this.data_context_label3.style.fontSize = "13px";

    // specify how parameters are to be entered
	this.data_context_label3.innerHTML = "Parameters (one per line):";

	this.data_context.appendChild(this.data_context_label3);

    // the parameter list element is a textarea, so multiple lines are enabled
	this.data_context_params = document.createElement("textarea");
	this.data_context_params.id = data.id + "_data_context_params";
	this.data_context_params.style.position = "absolute";

	this.data_context_params.style.top = "130px";
	this.data_context_params.style.left = "18px";

	this.data_context_params.style.width = "235px";
	this.data_context_params.style.height = "75px";

    // the background color will change as the element is enabled and disabled
	this.data_context_params.style.backgroundColor = "#ffffff";
	this.data_context_params.style.borderStyle = "solid";
	this.data_context_params.style.borderColor = "#000000";
	this.data_context_params.style.borderWidth = "1px";

    // the font color will also change as the element is enabled and disabled
	this.data_context_params.style.color = "#000000";
	this.data_context_params.style.overflowY = "scroll";
	this.data_context_params.style.paddingLeft = "4px";

	this.data_context_params.style.fontFamily = "Varta";
	this.data_context_params.style.fontSize = "13px";

	this.data_context_params.style.resize = "none";
	this.data_context_params.value = "";

	//this.data_context_params.contentEditable = true;

	this.data_context.appendChild(this.data_context_params);

    // this function hides the column header dialog box
	this.hide_context = function()
	{
		this.data_context.style.visibility = "hidden";
	}

    // this function enables the parameter list for the column header dialog box
	this.show_params = function()
	{
	    // some styles are applied to make the element look active
		this.data_context_label3.style.color = "#000000";
		this.data_context_params.style.backgroundColor = "#ffffff";

        // element is enabled
		this.data_context_params.disabled = false;
	}

    // this function disables the paramter list for the column header dialog box
	this.hide_params = function()
	{
	    // some styles are applied to make the element look inactive
		this.data_context_label3.style.color = "#aaaaaa";
		this.data_context_params.style.backgroundColor = "#dddddd";

        // element is disabled
		this.data_context_params.value = "";
		this.data_context_params.disabled = true;
	}

	this.load_project_data = function()
	{
	  	project_data = JSON.parse(fs.readFileSync(system_folder + "/project_data.txt", "utf8"));
	}

    // This function is called when a specific tab in the formspace is made active - the tab is referenced here by its
    // exact index, not its position value. The active tab is colored blue, and the tab panel is rendered visible by
    // increasing its relative z-index value.
     
	this.set_tab_focus = function(index)
	{
	    // a formspace attribute is set to the index value
		this.tab_focus_index = index;

        // every tab in the formspace is cycled through every time the function is called
		for (var i = 0; i < this.tabs; i++)
		{
		    // if i equals the index parameter, this is the tab to activate
			if (i == index)
			{
			    // change the background color of the tab itself to a blue shade
				this.tab_names[i].style.backgroundColor = "#007acc";

				if (this.tab_types[i] == "form" || this.tab_types[i] == "data")
				{
				    // set the z-index of the panel to 8 if this is a form or data tab
					this.tab_divs[i].style.zIndex = 8;
				}
				else if (this.tab_types[i] == "code")
				{
				    // if this is a code tab, set the z-index to 10
					this.tab_divs[i].style.zIndex = 10;
					
					// also give the Ace editor focus
					this.tab_editors[i].focus();
				}
			}
			
			// this is run for every tab except the one that has focus
			else
			{
			    // change the background color of the tab to a grey shade
				this.tab_names[i].style.backgroundColor = "#3f3f46";
				
				// st the z-index of the panel to 2, so it is underneath the tab that has focus
				this.tab_divs[i].style.zIndex = 2;
			}
		}
	}

    // This function returns the Ace editor for the form with the supplied index value. This is used when code is loaded 
    // into Digero when a project is opened.
	this.get_code_editor = function(form_index)
	{
	    // the tabs are cycled through until a code tab with the specified form index is found
		for (var i = 0; i < this.tabs; i++)
			if (this.tab_types[i] == "code" && this.tab_codes_forms[i] == form_index)
				break;
				
        // if such a tab is found, return the Ace editor of that tab
		if (i < this.tabs)
			return this.tab_editors[i];
	}

    // this function returns the Ace editor for a code tab with the specified name
	this.get_editor_name = function(code_name)
	{
	    // cycle through the tabs until the specified tab name is found
		for (var i = 0; i < this.tabs; i++)
			if (this.tab_names[i].innerHTML == code_name)
				break;

        // if such a tab is found, return the Ace edtor
		if (i < this.tabs)
			return this.tab_editors[i];
	}

	// This is the function that opens up a new data tab in the formspace. The data tab allows for entry of text and code in a
	// spreadsheet-style grid. Columns may be added and modified, and new rows appear as data is added. Columns widths and
	// row height are adjustable, though rows will all have the same height. Columns that are set to hold HTML or JavaScript
	// code are converted into Ace editor objects. All data is stored in a JSON object in the project object, which is converted
	// into a text file when saved.

	// this funcction is called from the New > Data option in the menu bar, or from the toolbar
	this.add_data = function()
	{
		// The various add tab functions all begin similarly, which the creation of a panel div within the formspace, and
		// the creation of a tab for the panel.

		// index is equal to the number of tabs that already exist
		var index = this.tabs;

		// tab type is data
		this.tab_types[index] = "data";

		// the position is set initially to the end of the existing tabs
		this.tab_pos[index] = index;

		// data tabs are not mapped to any form
		this.form_num[index] = -1;

		// increase the number of tabs for next time
		this.tabs++;

		// count the number of existing data tabs - this will be used for the tab name
		var counter = 0

		for (var i = 0; i < this.tab_types.length; i++)
			if (this.tab_types[i] == "data")
				counter++;

		// create main panel div for tab
		this.tab_divs[index] = document.createElement("div");
		this.tab_divs[index].id = this.formspace_div.id + "_div_" + index;
		this.tab_divs[index].style.position = "absolute";

		// the y position in underneath the tabs themselves
		this.tab_divs[index].style.top = "23px";
		this.tab_divs[index].style.left = "0px";

		// the width spans the formspace, the height is the formspace height minus the tab height
		this.tab_divs[index].style.width = this.formspace_div.style.width;
		this.tab_divs[index].style.height = (parseInt(this.formspace_div.style.height) - 23) + "px";

		this.tab_divs[index].style.overflow = "scroll";
		this.tab_divs[index].style.zIndex = 2;

		// the background color is the same as the formspace
		this.tab_divs[index].style.backgroundColor = this.background;

		// add div to formspace
		this.formspace_div.appendChild(this.tab_divs[index]);

		// create tab with name for data panel
		this.tab_names[index] = document.createElement("div");
		this.tab_names[index].id = this.formspace_div.id + "_name_" + index;
		this.tab_names[index].style.position = "absolute";

		this.tab_names[index].style.top = "0px";

		// the tab is positioned to the right of all the existing tabs
		this.tab_names[index].style.left = ((this.tab_name_width + this.tab_name_gap) * index) + "px";

		this.tab_names[index].style.width = this.tab_name_width + "px";
		this.tab_names[index].style.height = "19px";

		this.tab_names[index].style.backgroundColor = "#3f3f46";
		this.tab_names[index].style.fontFamily = "ABeeZee";
		this.tab_names[index].style.fontSize = "12px";
		this.tab_names[index].style.color = "#ffffff";

		this.tab_names[index].style.paddingLeft = "3px";
		this.tab_names[index].style.paddingTop = "4px";

		// the name of the tab combines the tab type with the counter tabulated above
		this.tab_names[index].innerHTML = "Data" + counter;

		// add div to formspace
		this.tabspace_div.appendChild(this.tab_names[index]);

		// when the tab is clicked, the tab is highlighted and the panel is made visible - the formspace is passed as a parameter here
		this.tab_names[index].addEventListener("click", function (this_formspace)
		{
			return function(evt)
			{
				// the index value is determined by checking the tab id - this will always be the same, regardless of position
				index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

			 	// give this tab the focus
				this_formspace.set_tab_focus(index);

			 	this_formspace.column_context_table = index;
			}
		} (this), false);

		// The following three events - mousedown, mousemove, and mouseup, are used in actions relating to the repositioning of tabs
		// in the formspace. That is, the tab itself can be clicked and dragged into a new position. This is still experimental code,
		// and is not necessarily correct. When completed, it will be copied to the other two add tab functions.

		this.tab_names[index].addEventListener("mousedown", function (this_formspace)
		{
			return function(evt)
			{
				index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);
				tab_select = index;
				tab_select_left = parseInt(this.style.left);
				tab_select_x = evt.clientX;
				this.style.zIndex = 20;
			}
		} (this), false);

		this.tab_names[index].addEventListener("mousemove", function (this_formspace)
		{
			return function(evt)
			{
				if (tab_select != null)
				{
					var x_diff = evt.clientX - tab_select_x;
					this_formspace.tab_names[tab_select].style.left = (tab_select_left + x_diff) + "px";
				}
			}
		} (this), false);

		this.tab_names[index].addEventListener("mouseup", function (this_formspace)
		{
			return function(evt)
			{
				index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

				if (tab_select != null)
				{
					var tab_x = Math.round(parseInt(this_formspace.tab_names[tab_select].style.left) / this_formspace.tab_name_width);

					if (tab_x < 0)
						tab_x = 0;
					else if (tab_x > this_formspace.tabs - 1)
						tab_x = this_formspace.tabs - 1;

					this_formspace.tab_names[tab_select].style.left = (tab_x * 124) + "px";

					var old_x = this_formspace.tab_pos[tab_select];
					this_formspace.tab_pos[tab_select] = tab_x;

					var tabs_to_move = new Array();

					if (tab_x < old_x)
					{
						for (var i = tab_x; i < old_x; i++)
						{
							for (var j = 0; j < this_formspace.tab_pos.length; j++)
								if (this_formspace.tab_pos[j] == i && j != tab_select)
									break;

							if (j < this_formspace.tab_pos.length)
								tabs_to_move.push(j);
						}

						for (var i = 0; i < tabs_to_move.length; i++)
						{
							this_formspace.tab_names[tabs_to_move[i]].style.left = (parseInt(this_formspace.tab_names[tabs_to_move[i]].style.left) + 124) + "px";
							this_formspace.tab_pos[tabs_to_move[i]]++;
						}
					}
					else
					{
						for (var i = old_x; i <= tab_x; i++)
						{
							for (var j = 0; j < this_formspace.tab_pos.length; j++)
								if (this_formspace.tab_pos[j] == i && j != tab_select)
									break;

							if (j < this_formspace.tab_pos.length)
								tabs_to_move.push(j);
						}

						for (var i = 0; i < tabs_to_move.length; i++)
						{
							this_formspace.tab_names[tabs_to_move[i]].style.left = (parseInt(this_formspace.tab_names[tabs_to_move[i]].style.left) - 124) + "px";
							this_formspace.tab_pos[tabs_to_move[i]]--;
						}						
					}

					this_formspace.tab_names[tab_select].style.zIndex = 12;

					tab_select = null;
				}
			}
		} (this), false);

		/*
		this.tab_data[index] = document.createElement("div");
		this.tab_data[index].id = this.formspace_div.id + "_data_" + index;
		this.tab_data[index].style.position = "absolute";

		this.tab_data[index].style.top = "35px";
		this.tab_data[index].style.left = "10px";

		this.tab_data[index].style.width = (parseInt(this.formspace_div.style.width) - 30) + "px";
		this.tab_data[index].style.height = (parseInt(this.formspace_div.style.height) - 105) + "px";

		this.tab_divs[index].appendChild(this.tab_data[index]);

		this.table_data[index] = new Array();

		for (var i = 0; i < 1; i++)
		{
			this.table_data[index][i] = {};
		}*/

		// A new datatable is created for the tab. The name is the same as the tab itself. The index is passed as a parameters so that
		// the object knows which tab to create the table in.
		this.tab_datatable[index] = new datatable({
			"name": "Data" + counter,
			"id": this.formspace_div.id + "_datatable_" + index,
			"index": index
		});

		// add an empty first row to the datatable
		this.tab_datatable[index].add_row(0); 

		// now UI elements are created above the table for essential functionality: (re)naming the table, and adding columns
		this.table_ui[index] = {};

		// this first div is a label for the table name textbox
		this.table_ui[index].name_label = document.createElement("div");
		this.table_ui[index].name_label.id = this.formspace_div.id + "_name_label_" + index;
		this.table_ui[index].name_label.style.position = "absolute";

		// all of these UI elements appear in a row above the datatable
		this.table_ui[index].name_label.style.top = "10px";
		this.table_ui[index].name_label.style.left = "12px";

		this.table_ui[index].name_label.style.width = "40px";
		this.table_ui[index].name_label.style.height = "24px";

		this.table_ui[index].name_label.style.color = "#ffffff";

		this.table_ui[index].name_label.style.fontFamily = "Varta";
		this.table_ui[index].name_label.style.fontSize = "13px";

		this.table_ui[index].name_label.innerHTML = "Name:";

		this.tab_divs[index].appendChild(this.table_ui[index].name_label);

		// the table name textbox is an input element
		this.table_ui[index].name_input = document.createElement("input");
		this.table_ui[index].name_input.id = this.formspace_div.id + "_name_input_" + index;
		this.table_ui[index].name_input.style.position = "absolute";

		// appears to the right of the above label
		this.table_ui[index].name_input.style.top = "5px";
		this.table_ui[index].name_input.style.left = "52px";

		this.table_ui[index].name_input.style.width = "160px";
		this.table_ui[index].name_input.style.height = "18px";

		this.table_ui[index].name_input.style.color = "#000000";

		this.table_ui[index].name_input.style.fontFamily = "Varta";
		this.table_ui[index].name_input.style.fontSize = "13px";

		this.table_ui[index].name_input.style.paddingTop = "3px";

		// add the default name to the textbox
		this.table_ui[index].name_input.value = this.tab_names[index].innerHTML;		

		this.tab_divs[index].appendChild(this.table_ui[index].name_input);

		// Whenever the textbox has focus and then loses it, the table name is updated everywhere. Note that the formspace itself and
		// the index of this particular tab are passed as parameters to the event.
		this.table_ui[index].name_input.addEventListener("blur", function (this_formspace, index)
		{
			return function(evt)
			{
				// do not try and give the table a blank name - it will not work
				if (this.value != "")
				{
					// the name is updated in the datatable object
					this_formspace.tab_datatable[index].name = this.value;

					// the name is updated in the project data JSON object
					update_table_name(this_formspace.tab_names[index].innerHTML, this.value);

					// the name is updated on the tab
					this_formspace.tab_names[index].innerHTML = this.value;
				}
			}
		} (this, index), false);

		// this is the label for the textbox that allows you to add new columns
		this.table_ui[index].col_label = document.createElement("div");
		this.table_ui[index].col_label.id = this.formspace_div.id + "_col_label_" + index;
		this.table_ui[index].col_label.style.position = "absolute";

		// appears to the right of the table name textbox
		this.table_ui[index].col_label.style.top = "10px";
		this.table_ui[index].col_label.style.left = "250px";

		this.table_ui[index].col_label.style.width = "40px";
		this.table_ui[index].col_label.style.height = "24px";

		this.table_ui[index].col_label.style.color = "#ffffff";

		this.table_ui[index].col_label.style.fontFamily = "Varta";
		this.table_ui[index].col_label.style.fontSize = "13px";

		this.table_ui[index].col_label.innerHTML = "Col:";

		this.tab_divs[index].appendChild(this.table_ui[index].col_label);

		// this is the add column textbox - it is an input element
		this.table_ui[index].col_name = document.createElement("input");
		this.table_ui[index].col_name.id = this.formspace_div.id + "_col_name_" + index;
		this.table_ui[index].col_name.style.position = "absolute";

		this.table_ui[index].col_name.style.top = "5px";
		this.table_ui[index].col_name.style.left = "275px";

		// appears to the right of the above label
		this.table_ui[index].col_name.style.width = "160px";
		this.table_ui[index].col_name.style.height = "18px";

		this.table_ui[index].col_name.style.color = "#000000";

		this.table_ui[index].col_name.style.fontFamily = "Varta";
		this.table_ui[index].col_name.style.fontSize = "13px";

		this.table_ui[index].col_name.style.paddingTop = "3px";

		this.tab_divs[index].appendChild(this.table_ui[index].col_name);

		// after the user types in a column name in the above textbox, this button will add it to the datatable
		this.table_ui[index].col_add = document.createElement("button");
		this.table_ui[index].col_add.id = this.formspace_div.id + "_col_add_" + index;
		this.table_ui[index].col_add.style.position = "absolute";

		// appears to the right of the above textbox
		this.table_ui[index].col_add.style.top = "5px";
		this.table_ui[index].col_add.style.left = "440px";

		this.table_ui[index].col_add.style.width = "45px";
		this.table_ui[index].col_add.style.height = "26px";

		this.table_ui[index].col_add.style.paddingTop = "2px";

		this.table_ui[index].col_add.style.color = "#000000";

		this.table_ui[index].col_add.style.fontFamily = "Varta";
		this.table_ui[index].col_add.style.fontSize = "13px";

		this.table_ui[index].col_add.innerHTML = "+ Col";

		this.tab_divs[index].appendChild(this.table_ui[index].col_add);

		// When the button is clicked, a column with the name provided in the textbox is added to the datatable. Note that the formspace 
		// itself and the index of this particular tab are passed as parameters to the event.
		this.table_ui[index].col_add.addEventListener("click", function (this_formspace, index)
		{
			return function(evt)
			{
				// the column is not added if the textbox is empty
				if (this_formspace.table_ui[index].col_name.value != "")
				{
					// the column is added, and the project_data object is updated
					this_formspace.tab_datatable[index].add_col(this_formspace.table_ui[index].col_name.value, true);

					// the column name textbox is cleared 
					this_formspace.table_ui[index].col_name.value = "";
				}
			}
		} (this, index), false);

		// this event works in tandem with events in the datatable to resize columns and rows
		this.tab_divs[index].addEventListener("mousemove", function (this_formspace, index)
		{
			return function(evt)
			{
				// the datatable resize flag is set when the left mouse button is pushed while the ew-resize cursor is hovering over a column edge
				if (this_formspace.tab_datatable[index].resize_flag == true)
				{
					//var rect = evt.target.getBoundingClientRect();

					// the absolute x/y values are retrieved
					var x = evt.clientX;
					var y = evt.clientY;

					// if a previous value for x exists, resize the column
					if (this_formspace.tab_datatable[index].old_x != undefined)
					{
						// the column is resized by the amount that is the difference between the current and old x values
						this_formspace.tab_datatable[index].resize_col(this_formspace.tab_datatable[index].old_x - x);

						// the table in the project_data object is also updated
						update_cols(this_formspace.tab_datatable[index]);
					}

					// store the current x/y values as the old x/y values in the datatable object
					this_formspace.tab_datatable[index].old_x = x;
					this_formspace.tab_datatable[index].old_y = y;

					this_formspace.tab_datatable[index].check_width();
				}
				else if (this_formspace.tab_datatable[index].resize_row == true)
				{
					//var rect = evt.target.getBoundingClientRect();
					var x = evt.clientX;
					var y = evt.clientY;

					if (this_formspace.tab_datatable[index].old_y != undefined)
					{
						// Adjust the row height based on the difference between old_y and y. Note that the row height is adjusted in the project_data
						// object when the update_data function is called.
						this_formspace.tab_datatable[index].adjust_row_height(this_formspace.tab_datatable[index].resize_index, this_formspace.tab_datatable[index].old_y - y);
					}

					// store the current x/y values as the old x/y values in the datatable object
					this_formspace.tab_datatable[index].old_x = x;
					this_formspace.tab_datatable[index].old_y = y;
				}
			}
		} (this, index), false);

		// this again works in tandem with events in the datatable
		this.tab_divs[index].addEventListener("mouseup", function (this_formspace, index)
		{
			return function(evt)
			{
				// set the resize flags to false when the mouse button is released
				this_formspace.tab_datatable[index].resize_flag = false;
				this_formspace.tab_datatable[index].resize_row = false;

				// reset the old x/y values
				this_formspace.tab_datatable[index].old_x = undefined;
				this_formspace.tab_datatable[index].old_y = undefined;
			}
		} (this, index), false);
	}

	// This is the function that opens up a new code tab in the formspace. The code tab opens up an Ace editor object that
	// allows JavaScript code to be written for the project. Code tabs can either be linked to a form (and thus added when
	// the form is added) or be independent. If the code is linked to a form, the object and event dropdown lists above
	// the editor object become active. These allow you to select both an object on the form (or the form itself), and an
	// event associated with that form. The event code will then be created if it does not exist. Code files are saved
	// as separate files in the project itself.

	// This funcction is called whenever a new form is added, as well as from the New > Code option in the menu bar, or
	// from the toolbar. The data parameter is a JSON object that may contain two keys: "name", index". This index value 
	// links the code to a form (or 0 if independent). IMPORTANT: the index value will be one number higher than the form 
	// number, since the first form is labelled Form1, not Form0.
	this.add_code = function(data)
	{
		// The various add tab functions all begin similarly, which the creation of a panel div within the formspace, and
		// the creation of a tab for the panel.

		// retrieve the form index from the data object
		if (data.index != undefined)
			code_index = data.index;

		// index is equal to the number of tabs that already exist
		var index = this.tabs;

		// tab type is code
		this.tab_types[index] = "code";

		// the position is set initially to the end of the existing tabs
		this.tab_pos[index] = index;

		// data tabs are not mapped to any form
		this.form_num[index] = -1;

		// increase the number of tabs for next time
		this.tabs++;

		// The tab_code_form variable stores the index of the form that the code tab is linked to, if any. Since the index
		// value is +1 of the form index, 1 is subtracted from it to get the form index. For code tabs that are not linked
		// to forms, an index of 0 is supplied by the data object, and thus becomes -1 here.
		this.tab_codes_forms[index] = code_index - 1;

		// create main panel div for tab
		this.tab_divs[index] = document.createElement("div");
		this.tab_divs[index].id = this.formspace_div.id + "_div_" + index;
		this.tab_divs[index].style.position = "absolute";

		// the y position in underneath the tabs themselves
		this.tab_divs[index].style.top = "23px";
		this.tab_divs[index].style.left = "0px";

		// the width spans the formspace, the height is the formspace height minus the tab height
		this.tab_divs[index].style.width = this.formspace_div.style.width;
		this.tab_divs[index].style.height = (parseInt(this.formspace_div.style.height) - 23) + "px";

		this.tab_divs[index].style.overflow = "scroll";
		this.tab_divs[index].style.zIndex = 2;

		// the background color is the same as the formspace
		this.tab_divs[index].style.backgroundColor = this.background;

		// add div to formspace
		this.formspace_div.appendChild(this.tab_divs[index]);

		// create tab with name for the code panel
		this.tab_names[index] = document.createElement("div");
		this.tab_names[index].id = this.formspace_div.id + "_name_" + index;
		this.tab_names[index].style.position = "absolute";

		this.tab_names[index].style.top = "0px";

		// the tab is positioned to the right of all the existing tabs
		this.tab_names[index].style.left = (124 * index) + "px";

		this.tab_names[index].style.width = "120px";
		this.tab_names[index].style.height = "19px";

		this.tab_names[index].style.backgroundColor = "#3f3f46";
		this.tab_names[index].style.fontFamily = "ABeeZee";
		this.tab_names[index].style.fontSize = "12px";
		this.tab_names[index].style.color = "#ffffff";

		this.tab_names[index].style.paddingLeft = "3px";
		this.tab_names[index].style.paddingTop = "4px";

		// if no name has been provided in the data object, create name out of index
		if (data.name == undefined)
			this.tab_names[index].innerHTML = "Form" + code_index + ".js";

		// or if a name is provided, use the name
		else
			this.tab_names[index].innerHTML = data.name;

		// add div to formspace
		this.tabspace_div.appendChild(this.tab_names[index]);

		// When a code tab is double-clicked, the user is prompted to rename the code file. If the code file is linked
		// to a form, the Script property of the form is updated to the new name. Note that the formspace is passed as
		// a parameter to the event function.
		this.tab_names[index].addEventListener("dblclick", function (this_formspace)
		{
			return function(evt)
			{
				// the index value is determined by checking the tab id - this will always be the same, regardless of position
				index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

				// the user is prompted to rename the code file.
				var code_name = prompt("Enter file name:", this_formspace.tab_names[index].innerHTML);

				// if the name provided by the user does not end in ".js", add it
				if (code_name.search(".js") == -1)
					code_name += ".js";

				// rename the code file on the tab
				this_formspace.tab_names[index].innerHTML = code_name;

				// if the code file is linked to a form, search for the form
				if (this_formspace.tab_codes_forms[index] >= 0)
				{
					// cycle through the objects until a form is found that is linked by index to this code file
					for (var i = 0; i < objects.length; i++)
						if (objects[i].form == this_formspace.tab_codes_forms[index] && objects[i].type == "form")
							break;

					// update the Script property to the new name
					set_property(i, "Script", code_name);

					// redraw the element
					draw_element(i);
				}							
			}
		} (this), false);

		// When the tab is clicked, the tab is highlighted and the panel is made visible. If the code file is linked to a form,
		// the object and event dropdown lists are recreated  - the formspace is passed as a parameter here.
		this.tab_names[index].addEventListener("click", function (this_formspace)
		{
			return function(evt)
			{
				// the index value is determined by checking the tab id - this will always be the same, regardless of position
				index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

			 	// give this tab the focus
				this_formspace.set_tab_focus(index);

				// if the code file is linked to a form (i.e. not -1), the dropdown lists are recreated
				if (this_formspace.tab_codes_forms[index] >= 0)
				{
					// This object will store data on all of the object array that exists on the form. Objects that in are arrays
					// are grouped together under the array name in the object dropdown.
					arrays.length = 0;

					// store the object dropdown element in a variable for shorthand
					var tco = this_formspace.tab_codes_objects[index];

					// remove all of the options that are presently contained in the object dropdown
				    for(var i = tco.options.length; i >= 0; i--)
				    	tco.remove(i);

				    // cycle through every element in the objects array - flag those that are linked to the same form as the code tab
					for (var i = 0; i < objects.length; i++)
					{
						// if the form attribute of the object is the same as the code tab form index, and the object is not in an array, proceed
						if (parseInt(objects[i].form) == this_formspace.tab_codes_forms[index] && (get_property(i, "IsArray") == null || get_property(i, "IsArray").value != "true"))
						{
							// create a new obtion with the object as its name, and add it to the object dropdown
							var option = document.createElement("option");
							option.text = objects[i].name;
							tco.add(option);
						}

						// if the form attribute of the object is the same as the code tab form index, and the object is in an array, proceed
						else if (parseInt(objects[i].form) == this_formspace.tab_codes_forms[index] && get_property(i, "IsArray") != null && get_property(i, "IsArray").value == "true")
						{
							// retrieve the array name from the object's ArrayName property
							var array_name = get_property(i, "ArrayName").value;

							// check if the array already exists in arrays - if not, proceed
							if (is_array(array_name) == false)
							{
								// create a new entry in arrays
								array_index = arrays.length;
								arrays[array_index] = {}

								// include both the array name and the object type
								arrays[array_index].name = array_name;
								arrays[array_index].type = objects[i].type;

								// create an option with the name of the array, and add it to the objects dropdown
								var option = document.createElement("option");
								option.text = array_name;
								tco.add(option);						
							}
						}
					}

					// Now the event dropdown will be created. Since the object dropdown defaults to the form object when created, we know
					// that this will not be an object in an array (forms cannot be added to arrays).

					// store the event dropdown element in a variable for shorthand
					var tce = this_formspace.tab_codes_events[index];

					// remove all of the options that are presently contained in the event dropdown
				    for (var i = tce.options.length; i >= 0; i--)
				    	tce.remove(i);

				    // retrieve the name of the object (here the form) from the objects dropdown
				    var this_object = tco.value;

				    // Here the object_events array is queried. This array is built when Digero launches, and contains the event types for every object type, though
				    // many still need to be added.

				    // cycle through the object_events array until the same object type is found
				    for (var i = 0; i < object_events.length; i++)
				    	if (object_events[i].type == get_object(this_object).type)
				    		break;

				    // if the type was found, proceed
				    if (i < object_events.length)
				    {
				    	// retrieve the events from the array and convert them into an array
				    	var events = object_events[i].events.split(",");

				    	// for each event, add an option to the event dropdown with the event name
						for (var i = 0; i < events.length; i++)
						{
							var option = document.createElement("option");
							option.text = events[i];
							tce.add(option);
						}			    	
				    }

				    // clear the value of the event dropdown
				    tce.value = "";
				}
			}
		} (this), false);

		// create the element that will become the Ace editor object
		this.tab_codes[index] = document.createElement("div");
		this.tab_codes[index].id = this.formspace_div.id + "_code_" + index;
		this.tab_codes[index].style.position = "absolute";

		// positioned underneath the object and event dropdowns
		this.tab_codes[index].style.top = "23px";
		this.tab_codes[index].style.left = "0px";

		this.tab_codes[index].style.width = (parseInt(this.formspace_div.style.width) - 10) + "px";
		this.tab_codes[index].style.height = (parseInt(this.formspace_div.style.height) - 60) + "px";

		this.tab_divs[index].appendChild(this.tab_codes[index]);

		// turn the above div into an Ace editor object
		this.tab_editors[index] = ace.edit(this.formspace_div.id + "_code_" + index);

		// do not display the margin lines
		this.tab_editors[index].setShowPrintMargin(false);

		// set the theme - this may become adjustable at some point
	    this.tab_editors[index].setTheme("ace/theme/monokai");

	    // set the mode to JavaScript
	    this.tab_editors[index].session.setMode("ace/mode/javascript");

	    // enable auto-completion
	    this.tab_editors[index].setOptions({"enableLiveAutocompletion": true});
	    this.tab_editors[index].getSession().setUseWorker(false);

	    // set the initial font size - again, this may be adjustable later
		document.getElementById(this.formspace_div.id + "_code_" + index).style.fontSize = "13px";

		// create the object dropdown list for when the code editor is linked to a form
		this.tab_codes_objects[index] = document.createElement("select");
		this.tab_codes_objects[index].id = this.formspace_div.id + "_code_objects_" + index;
		this.tab_codes_objects[index].style.position = "absolute";

		// positioned in the top left of the tab panel
		this.tab_codes_objects[index].style.top = "0px";
		this.tab_codes_objects[index].style.left = "0px";

		// spans a little under half of the width of the panel
		this.tab_codes_objects[index].style.width = ((parseInt(this.formspace_div.style.width) - 10) / 2) + "px";
		this.tab_codes_objects[index].style.height = "21px";

		this.tab_codes_objects[index].style.backgroundColor = "#333337";
		this.tab_codes_objects[index].style.color = "#d0d0d0";

		this.tab_codes_objects[index].style.fontFamily = "ABeeZee";
		this.tab_codes_objects[index].style.fontSize = "12px";

		this.tab_codes_objects[index].style.borderStyle = "solid";
		this.tab_codes_objects[index].style.borderWidth = "thin";		
		this.tab_codes_objects[index].style.borderColor = "#404040";

		this.tab_divs[index].appendChild(this.tab_codes_objects[index]);

		// when a new selection is made in the object dropdown, the events dropdown must be updated - note that the formspace is a parameter
		this.tab_codes_objects[index].addEventListener("change", function (this_formspace)
		{
			return function(evt)
			{
				// retrieve the index of this form in the formspace (located at the end of the element id)
				index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

				// only populate the event dropdown if the code tab is linked to a form
				if (this_formspace.tab_codes_forms[index] >= 0)
				{
					// store the object and event dropdown elements as variables, for shorthand
					var tco = this_formspace.tab_codes_objects[index];
					var tce = this_formspace.tab_codes_events[index];

					// remove all of the options in the event dropdown
				    for (var i = tce.options.length; i >= 0; i--)
				    	tce.remove(i);

				    // store the value in the object dropdown as a variable
				    var this_object = tco.value;

				    // check to see if the value in the object dropdown is an element array
				    if (is_array(this_object))
				    	// if it is, retrieve the type of the elements
				    	object_type = get_array_type(this_object);
				    else
				    	// if not, retrieve the element type from the objects array
				    	object_type = get_object(this_object).type;

				    // Here the object_events array is queried. This array is built when Digero launches, and contains the event types for every object type, though
				    // many still need to be added.

				    // cycle through the object_events array until the same object type is found
				    for (var i = 0; i < object_events.length; i++)
				    	// the starting form in any Digero project has a special set of events
				    	if (object_events[i].type == object_type || (object_events[i].type == "form_starting" && object_type == "form" && get_object(this_object).form == 0))
				    		break;

				    // if the object type was found in the array, prepare to add the events
				    if (i < object_events.length)
				    {
				    	// retrieve the events from the array and convert them into an array
				    	var events = object_events[i].events.split(",");

				    	// for each event, add an option to the event dropdown with the event name
						for (var i = 0; i < events.length; i++)
						{
							var option = document.createElement("option");
							option.text = events[i];
							tce.add(option);
						}				    	
				    }

				    // set the value of the event dropdown to blank
				    tce.value = "";
				}
			}
		} (this), false);

		// create the event dropdown list for when the code editor is linked to a form
		this.tab_codes_events[index] = document.createElement("select");
		this.tab_codes_events[index].id = this.formspace_div.id + "_code_events_" + index;
		this.tab_codes_events[index].style.position = "absolute";

		this.tab_codes_events[index].style.top = "0px";

		// positioned to the right of the object dropdown
		this.tab_codes_events[index].style.left = ((parseInt(this.formspace_div.style.width) - 10) / 2) + "px";

		// spans a little under half of the width of the panel
		this.tab_codes_events[index].style.width = ((parseInt(this.formspace_div.style.width) - 10) / 2) + "px";
		this.tab_codes_events[index].style.height = "21px";

		this.tab_codes_events[index].style.backgroundColor = "#333337";
		this.tab_codes_events[index].style.color = "#d0d0d0";

		this.tab_codes_events[index].style.fontFamily = "ABeeZee";
		this.tab_codes_events[index].style.fontSize = "12px";

		this.tab_codes_events[index].style.borderStyle = "solid";
		this.tab_codes_events[index].style.borderWidth = "thin";		
		this.tab_codes_events[index].style.borderColor = "#404040";

		this.tab_divs[index].appendChild(this.tab_codes_events[index]);

		// When an event is selected in the dropdown, one of two things can happen. If the event does not appear in the code below, an event
		// handler for that object and event is created. If the event already exists, the cursor in the code editor jumps to its position.
		// Note that the event-handling code differs depending on if the value in the object dropdown is a single element, or an array. This
		// function makes use of the search functionality in the Ace editor object, and also adds code directly to it, if need be.

		// note that the formspace itself is passed as a parameter in the event handler
		this.tab_codes_events[index].addEventListener("change", function (this_formspace)
		{
			return function(evt)
			{
				// retrieve the index of the form tab from the end of the element id
				index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

				// only proceed if this code tab is linked to a form
				if (this_formspace.tab_codes_forms[index] >= 0)
				{
					// proceed if the value in the object dropdown is an array
					if (is_array(this_formspace.tab_codes_objects[index].value))
					{
						// retrieve the Ace edtior object for this tab and store it as a variable, for shorthand
						var editor = this_formspace.tab_editors[index];
						
						// Search for the opening line of the event handler function for this code - note that this is not the direct event-handling code
						// for this function - rather, this is the function that is called by every element in the array by the event-handling code in
						// the runtime library.
						var range = editor.find(this_formspace.tab_codes_objects[index].value + "_" + this.value + " = function (evt, thisObject, index)",{
						    wrap: true,
						    caseSensitive: true, 
						    wholeWord: true,
						    regExp: false,
						    preventScroll: false
						});

						// if this code does not already exist, write it into the editor object
						if (range == null)
						{
							// retrieve the code that already exists in the editor
							var this_code = this_formspace.tab_editors[index].getValue();

							// create the event handler code and store it as a variable - the "code here" comment is used to locate this code momentarily
							var this_event = "\n" + this_formspace.tab_codes_objects[index].value + "_" + this.value + " = function (evt, thisObject, index)\n{\n\t//code here\n}\n";
							
							// set the code in the editor to be the original code plus the new event handler code
							this_formspace.tab_editors[index].setValue(this_code + this_event);

							// seek out the "code here" comment that was written in the event handler code
							var range = editor.find("//code here",{
							    wrap: true,
							    caseSensitive: true, 
							    wholeWord: true,
							    regExp: false,
							    preventScroll: false
							});

							// replace the "code here" comment with a tab space, and jump to that point
							range.start.column = 0;
							range.end.column = Number.MAX_VALUE;
							editor.session.replace(range, "\t");
							editor.selection.setRange(range);

							// clear the selection highlight - now the cursor in the editor will be inside the event handler function
							editor.selection.clearSelection();
							editor.focus()
						}

						// if the event code does exist, jump to that point in the editor
						else
						{
							// seek out the location inside the event handler code where user code would be written
							var range = editor.find(this_formspace.tab_codes_objects[index].value + "_" + this.value + " = function (evt, thisObject, index)\n{\n\t",{
							    wrap: true,
							    caseSensitive: true, 
							    wholeWord: true,
							    regExp: false,
							    preventScroll: false
							});

							// jump to this point, and clear the selection highlight
							editor.selection.setRange(range);
							editor.selection.clearSelection();
							editor.focus();
						}					
					}

					// if the value of the object dropdown is not an array, proceed
					else
					{
						// retrieve the Ace edtior object for this tab and store it as a variable, for shorthand
						var editor = this_formspace.tab_editors[index];
						
						// search for the opening line of the event handler function for this code
						var range = editor.find("document.getElementById(\"" + this_formspace.tab_codes_objects[index].value + "\").addEventListener(\"" + this.value + "\", function (thisObject)",{
						    wrap: true,
						    caseSensitive: true, 
						    wholeWord: true,
						    regExp: false,
						    preventScroll: false
						});

						// if this code does not already exist, write it into the editor object
						if (range == null)
						{
							// retrieve the code that already exists in the editor
							var this_code = this_formspace.tab_editors[index].getValue();

							// create the event handler code and store it as a variable - the "code here" comment is used to locate this code momentarily							
							var this_event = "\ndocument.getElementById(\"" + this_formspace.tab_codes_objects[index].value + "\").addEventListener(\"" + this.value + "\", function (thisObject)\n{\n\treturn function(evt)\n\t{\n\t\t//code here\n\t}\n} (" + this_formspace.tab_codes_objects[index].value + "), false);\n";
							
							// set the code in the editor to be the original code plus the new event handler code
							this_formspace.tab_editors[index].setValue(this_code + this_event);

							// seek out the "code here" comment that was written in the event handler code
							var range = editor.find("//code here",{
							    wrap: true,
							    caseSensitive: true, 
							    wholeWord: true,
							    regExp: false,
							    preventScroll: false
							});

							// replace the "code here" comment with two tab spaces, and jump to that point
							range.start.column = 0;
							range.end.column = Number.MAX_VALUE;
							editor.session.replace(range, "\t\t");
							editor.selection.setRange(range);

							// clear the selection highlight - now the cursor in the editor will be inside the event handler function
							editor.selection.clearSelection();
							editor.focus()
						}

						// if the event code does exist, jump to that point in the editor
						else
						{
							// seek out the location inside the event handler code where user code would be written
							var range = editor.find("document.getElementById(\"" + this_formspace.tab_codes_objects[index].value + "\").addEventListener(\"" + this.value + "\", function (thisObject)\n{\n\treturn function(evt)\n\t{\n\t\t",{
							    wrap: true,
							    caseSensitive: true, 
							    wholeWord: true,
							    regExp: false,
							    preventScroll: false
							});

							// jump to this point, and clear the selection highlight
							editor.selection.setRange(range);
							editor.selection.clearSelection();
							editor.focus();
						}
					}
				}
			}
		} (this), false);
	}

	// This is the function that opens up a new form tab in the formspace - it is called "add_tab" because this was the
	// first function to add a tab. The forms are the foundation of any Digero project, and when you start a new project,
	// the first form is created automatically. These forms are where object elements are drawn, and are linked to by
	// code files in order to provide functionality. Extensive coding was required to get the "drag-and-drop" functionality
	// of a visual programming system to function properly.

	// This funcction is called whenever a new form is added, as well as from the New > Form option in the menu bar, or
	// from the toolbar. The make_object parameter specifies if the form is to be added to the objects array (if an existing
	// project is being loaded, it will already be there).
	this.add_tab = function(make_object)
	{
		// The various add tab functions all begin similarly, which the creation of a panel div within the formspace, and
		// the creation of a tab for the panel.

		// index is equal to the number of tabs that already exist
		var index = this.tabs;

		// tab type is code
		this.tab_types[index] = "form";

		// the position is set initially to the end of the existing tabs
		this.tab_pos[index] = index;

		// the form number/index is set to be one more than the total number of forms in the project
		this.form_num[index] = this.form_count;

		// increase the number of tabs for next time
		this.tabs++;

		// create main panel div for tab
		this.tab_divs[index] = document.createElement("div");
		this.tab_divs[index].id = this.formspace_div.id + "_div_" + index;
		this.tab_divs[index].style.position = "absolute";

		// the y position in underneath the tabs themselves
		this.tab_divs[index].style.top = "23px";
		this.tab_divs[index].style.left = "0px";

		// the width spans the formspace, the height is the formspace height minus the tab height
		this.tab_divs[index].style.width = this.formspace_div.style.width;
		this.tab_divs[index].style.height = (parseInt(this.formspace_div.style.height) - 23) + "px";

		this.tab_divs[index].style.overflow = "scroll";
		this.tab_divs[index].style.zIndex = 2;

		// the background color is the same as the formspace
		this.tab_divs[index].style.backgroundColor = this.background;

		// This event works in tandem with events in the element outline div to support the resizing of form elements (and the form itself) 
		// within the tab panel. The element outline div is the dotted line that appear around elements that currently have the focus. Note 
		// that the formspace itself is passed as a parameter.
		this.tab_divs[index].onmousemove = (function (this_formspace)
		{
			return function(evt)
			{
				// The resize_mousedown flag is set to true when the mouse is pushed while a resize cursor appears over the outline div.
				// This happens when the mouse hovers over the right edge or bottom edge of the outline, or the bottom-right corner.
				if (this_formspace.resize_mousedown == true)
				{
					// Calculate the differences between the current and former mouse x/y positions. Old positions are continually stored
					// in the resize_x/y variables.
					var move_x = evt.clientX - this_formspace.resize_x;
					var move_y = evt.clientY - this_formspace.resize_y;

					// retrieve the index of the tab in the formspace from the element id
					var this_index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

					// retrieve the element that current has focus - i.e. that is surrounded by the outline div
					var move_element = document.getElementById(this_formspace.outlines_focus[this_index].id);

					// The resize_dir variable is set based on the mouse cursor as it hovers over the bottom and/or right edges of the
					// outline div.

					// resize vertically if the resize_dir variable is set for that
					if (this_formspace.resize_dir == "ns" || this_formspace.resize_dir == "nsew")
					{
						// increase or decrease the height of the element in focus based on the move_y variable set above
						move_element.style.height = (parseInt(move_element.style.height) + move_y) + "px";

						// increase or decrease the height of the outline div by the same amount
						this_formspace.tab_outlines[this_index].style.height = (parseInt(this_formspace.tab_outlines[this_index].style.height) + move_y) + "px";

						// change the height attribute and the Height property of the element in focus based on the new height
						get_object(this_formspace.select_id).height = parseInt(move_element.style.height);
						change_property(this_formspace.outlines_focus[this_index].id, "Height", parseInt(move_element.style.height), true);
					}

					// resize horizontally if the resize_dir variable is set for that
					if (this_formspace.resize_dir == "ew" || this_formspace.resize_dir == "nsew")
					{
						// increase or decrease the width of the element in focus based on the move_y variable set above
						move_element.style.width = (parseInt(move_element.style.width) + move_x) + "px";

						// increase or decrease the wdith of the outline div by the same amount
						this_formspace.tab_outlines[this_index].style.width = (parseInt(this_formspace.tab_outlines[this_index].style.width) + move_x) + "px";

						// change the width attribute and the Width property of the element in focus based on the new height
						get_object(this_formspace.select_id).width = parseInt(move_element.style.width);
						change_property(this_formspace.outlines_focus[this_index].id, "Width", parseInt(move_element.style.width), true);
					}

					// update the resize_x/y variables based on the current mouse x/y position
					this_formspace.resize_x = evt.clientX;
					this_formspace.resize_y = evt.clientY;

					// call the draw function for the element with focus, if it is not a group
					if (this_formspace.outlines_focus[this_index].id != "#group")
						draw_element(this_formspace.outlines_focus[this_index].index);
				}				
			}
		}) (this);

		// called when a mouse button is released - note that the formspace itself is passed as a parameter
		this.tab_divs[index].onmouseup = (function (this_formspace)
		{
			return function(evt)
			{
				// the element in focus is no longer in a resize scenario
				this_formspace.resize_mousedown = false;			
			}
		}) (this);

		// add div to formspace
		this.formspace_div.appendChild(this.tab_divs[index]);

		// create tab with name for data panel
		this.tab_names[index] = document.createElement("div");
		this.tab_names[index].id = this.formspace_div.id + "_name_" + index;
		this.tab_names[index].style.position = "absolute";

		this.tab_names[index].style.top = "0px";

		// the tab is positioned to the right of all the existing tabs
		this.tab_names[index].style.left = (124 * index) + "px";

		this.tab_names[index].style.width = "120px";
		this.tab_names[index].style.height = "19px";

		this.tab_names[index].style.backgroundColor = "#3f3f46";
		this.tab_names[index].style.fontFamily = "ABeeZee";
		this.tab_names[index].style.fontSize = "12px";
		this.tab_names[index].style.color = "#ffffff";

		this.tab_names[index].style.paddingLeft = "3px";
		this.tab_names[index].style.paddingTop = "4px";

		this.tab_names[index].style.zIndex = 2;

		// the name of the tab combines the tab type with the counter tabulated above
		this.tab_names[index].innerHTML = "Form" + (this.form_count + 1);

		// add div to formspace
		this.tabspace_div.appendChild(this.tab_names[index]);

		// when the tab is clicked, the tab is highlighted and the panel is made visible - the formspace is passed as a parameter here
		this.tab_names[index].addEventListener("click", function (this_formspace, this_index)
		{
			return function(evt)
			{
				// the index value is determined by checking the tab id - this will always be the same, regardless of position
				index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

			 	// give this tab the focus
				this_formspace.set_tab_focus(index);

				// since this is a form tab, set the outlive div to focus on the form
				if (this_formspace.form_num[this_index] != -1)
					this_formspace.set_outline_focus(this.innerHTML);
				
				// set the current_form variable to this form index
				current_form = index;
			}
		} (this, index), false);

		// this is the actual Digero project form
		this.tab_forms[index] = document.createElement("div");
		this.tab_forms[index].id = "Form" + (this.form_count + 1);
		this.tab_forms[index].style.position = "absolute";

		// x/y position shifted slightly to leave room for outline div
		this.tab_forms[index].style.top = "10px";
		this.tab_forms[index].style.left = "10px";

		// default width and height stored in the formspace
		this.tab_forms[index].style.width = this.default_width + "px";
		this.tab_forms[index].style.height = this.default_height + "px";

		this.tab_forms[index].style.zIndex = 10 * (this.form_count + 1);
		this.tab_forms[index].style.overflow = "hidden";

		this.tab_forms[index].style.padding = "0px";
		this.tab_forms[index].style.margin = "0px";

		// default background color for forms
		this.tab_forms[index].style.backgroundColor = "#d0d0d0";

		// add form div to formspace
		this.tab_divs[index].appendChild(this.tab_forms[index]);

		// It is important that the mouse cursor "look the part" as it passes over the form. This means turning into a crosshair if you have
		// an element selected in the Toolbox. Also, if the left mouse button is pressed, different things can happen. If the outline div is
		// being dragged around, that has to be accounted for. Similarly, if an element (or group) is being moved, that has to continue based
		// on the relative movement of the mouse.
		this.tab_forms[index].addEventListener("mousemove", function (this_formspace)
		{
			return function(evt)
			{
				// set the mouse_hover variable to the form id
				mouse_hover = this.id;

				element_flag = false;

				// retrieve the index of the formspace tab via the form id
				var this_index = this_formspace.get_form_tab_index(this.id);

				// retrieve the selection div belonging to this formspace
				var this_select = document.getElementById(this_formspace.formspace_div.id + "_select_" + this_index);

				// retrieve the x/y positions of the mouse relative to the form itself
				var rect = this_formspace.tab_forms[this_index].getBoundingClientRect();
				var x = evt.clientX - rect.left;
				var y = evt.clientY - rect.top;

				// if an element besides the Pointer has been selected in the Toolbox, make the mouse cursor a crosshair
				if (this_formspace.toolbox_sel.select != 0)
					this.style.cursor = "crosshair";

				// otherwise, use the default cursor for the mouse
				else
					this.style.cursor = "default";

				// If the left mouse button is pressed down on the form, the user may begin to trace out a space on the form via the outline
				// div - that is the outline will begin at the mousedown x/y position and grow to wherever the mouse is moved.
				if (this_formspace.select_down == true)
				{
					// if the mouse's x position is to the right of the point where the button was pushed, proceed
					if (x > this_formspace.select_x)
					{
						// set the width to be current mouse x - x position of selection div
						this_select.style.width = (x - this_formspace.select_x) + "px";

						// keep the outline's x position the same
						this_select.style.left = this_formspace.select_x + "px";
					}

					// otherwise, the mouse is to the left of where the selection div was originally positioned
					else
					{
						// set the width to be x position of selection div - current mouse x
						this_select.style.width = (this_formspace.select_x - x) + "px";

						// set the outline's x position to the the current mouse x
						this_select.style.left = x + "px";
					}

					// if the mouse's y position is below where the button was pushed, proceed
					if (y > this_formspace.select_y)
					{
						// set the height to be current mouse y - y position of selection div
						this_select.style.height = (y - this_formspace.select_y) + "px";

						// keep the outline's y position the same
						this_select.style.top = this_formspace.select_y + "px";
					}

					// otherwise, the mouse is above where the selection div was originally positioned
					else
					{
						// set the height to be y position of selection div - current mouse y
						this_select.style.height = (this_formspace.select_y - y) + "px";

						// set the outline's y position to the the current mouse y
						this_select.style.top = y + "px";
					}
				}

				// If the select_type flag is set to "move", this means that the mouse button was pushed down when the move cursor was displayed over
				// a form element. This means that the element selected is to be moved to a new position. The id of this element is stored in the
				// formspace's select_id variable (or it indicates a group selection).
				if (this_formspace.select_type == "move")
				{
					// if select_id is "#group", this means that multiple elements have been selected (by clicking and dragging over them)
					if (this_formspace.select_id == "#group")
					{
						// the select_group array contains the ids of all the elements selected
						for (var i = 0; i < select_group.length; i++)
						{
							// the move variables store the differences between the current and former mouse x/y positions
							var move_x = evt.clientX - this_formspace.resize_x;
							var move_y = evt.clientY - this_formspace.resize_y;

							// retrieve the element from the DOM
							var move_element = document.getElementById(select_group[i].name);

							// move the element up or down the amount determined
							move_element.style.top = (parseInt(move_element.style.top) + move_y) + "px";

							// store the new element y in the objects array, and in the element properties
							get_object(select_group[i].name).top = parseInt(move_element.style.top);
							change_property(select_group[i].name, "Top", parseInt(move_element.style.top), false);

							// move the element left or right the amount determined
							move_element.style.left = (parseInt(move_element.style.left) + move_x) + "px";

							// store the new element x in the objects array, and in the element properties
							get_object(select_group[i].name).left = parseInt(move_element.style.left);
							change_property(select_group[i].name, "Left", parseInt(move_element.style.left), false);											
						}

						// move the selection div the same x/y amount
						this_formspace.tab_outlines[this_index].style.top = (parseInt(this_formspace.tab_outlines[this_index].style.top) + move_y) + "px";
						this_formspace.tab_outlines[this_index].style.left = (parseInt(this_formspace.tab_outlines[this_index].style.left) + move_x) + "px";

						// store the current mouse x/y for the next time that the move event is called (i.e. as the element keeps being moved)
						this_formspace.resize_x = evt.clientX;
						this_formspace.resize_y = evt.clientY;
					}

					// if the select_id is not "#group", that means that it is the id of a specific element
					else
					{
						// the move variables store the differences between the current and former mouse x/y positions
						var move_x = evt.clientX - this_formspace.resize_x;
						var move_y = evt.clientY - this_formspace.resize_y;

						// retrieve the element from the DOM
						var move_element = document.getElementById(this_formspace.select_id);

						// move the element up or down the amount determined
						move_element.style.top = (parseInt(move_element.style.top) + move_y) + "px";

						// move the selection div the same amount
						this_formspace.tab_outlines[this_index].style.top = (parseInt(this_formspace.tab_outlines[this_index].style.top) + move_y) + "px";

						// store the new element y in the objects array, and in the element properties
						get_object(this_formspace.select_id).top = parseInt(move_element.style.top);
						change_property(this_formspace.select_id, "Top", parseInt(move_element.style.top), true);

						// move the element left or right the amount determined
						move_element.style.left = (parseInt(move_element.style.left) + move_x) + "px";

						// move the selection div the same amount
						this_formspace.tab_outlines[this_index].style.left = (parseInt(this_formspace.tab_outlines[this_index].style.left) + move_x) + "px";

						// store the new element x in the objects array, and in the element properties
						get_object(this_formspace.select_id).left = parseInt(move_element.style.left);
						change_property(this_formspace.select_id, "Left", parseInt(move_element.style.left), true);

						// store the current mouse x/y for the next time that the move event is called (i.e. as the element keeps being moved)
						this_formspace.resize_x = evt.clientX;
						this_formspace.resize_y = evt.clientY;
					}
				}
			}
		} (this), false);

		// when the left mouse button is clicked on the form (as opposed to on the oulive div), generally one of two things is going to
		// happen. First, if the Pointer is selected in the Toolbox, the user is about to draw an outline around a group of elements.
		// Second, if another selection is made in the Toolbox, the user is about to trace out the outlines of a new element. Both of
		// these scenarois are handled by this event handler.
		this.tab_forms[index].addEventListener("mousedown", function (this_formspace)
		{
			return function(evt)
			{
				// retrieve the index of this form in the formspace
				var this_index = this_formspace.get_form_tab_index(this.id);

				// get the mouse x/y positions relative to the form
				var rect = this_formspace.tab_forms[this_index].getBoundingClientRect();
				var x = evt.clientX - rect.left;
				var y = evt.clientY - rect.top;

				// this code will be written if this situation ever happens
				if (main_toolbox.select == 0 && element_flag == true)
				{

				}

				// otherwise, run this code
				else
				{
					// run this code only if the select_down flag is false (this will likely always be the case)
					if (this_formspace.select_down == false);
					{
						// set the select_down flag indicating the mouse button has been pressed (this is used in the mousemove function above)
						this_formspace.select_down = true;

						// store the current mouse x/y positions
						this_formspace.select_x = x;
						this_formspace.select_y = y;

						// retrieve the selection div for this form from the DOM
						var this_select = document.getElementById(this_formspace.formspace_div.id + "_select_" + this_index);

						// reset the outlive div by removing and adding it again
						this_select.parentElement.removeChild(this_select);
						this.appendChild(this_select);

						// set the x/y coordinates for the outline to be the current mouse x/y
						this_select.style.left = x + "px";
						this_select.style.top = y + "px";

						// the selection div will have no width or height until the mouse is dragged
						this_select.style.width = "0px";
						this_select.style.height = "0px";

						// if anything other than the Pointer is selected in the Toolbox, the selection div will be solid
						if (this_formspace.toolbox_sel.select != 0)
							this_select.style.borderStyle = "solid";

						// if Pointer is selected, the selection div will be dotted
						else
							this_select.style.borderStyle = "dotted";
					}
				}

				// If the Pointer is selected in the Toolbox, start running a function that increments a timer variable every 20 msec.
				// This is used to determine if the form itself is being selected - this will only happen if the timer variable is under
				// a certain value, i.e. the mouse was clicked quickly.
				if (main_toolbox.select == 0)
				{
					// click_timer is a global variable, not a formspace variable
					click_timer = 0;

					// start the increment function running every 20 msec
					click_timer_id = setInterval(click_timer_run, 20);
				}

				// if the Pointer is not selected, clear the timer variable
				else
				{
					click_timer = -1;
				}
			}
		} (this), false);

		// If the left mouse button is released on the form, one of several things can happen. If the mouse was clicked quickly, then
		// the form itself is selected. If not, that means the user was probably creating an element from the Toolbox, or selecting a
		// group of elements if the Pointer is selected. In either of these cases, the relevant creation function in the tools_fx array
		// is called.
		this.tab_forms[index].addEventListener("mouseup", function (this_formspace)
		{
			return function(evt)
			{
				// reset the selection flags that are set in the other event functions
				this_formspace.select_down = false;
				this_formspace.select_type = null;

				// retrieve the index of this form from the formspace
				var this_index = this_formspace.get_form_tab_index(this.id);

				// retrieve the selection div for this formspace from the DOM
				var this_select = document.getElementById(this_formspace.formspace_div.id + "_select_" + this_index);

				// retrieve the name of the tool that has is selected in the Toolbox
				var tool_name = this_formspace.toolbox_sel.tools_name[this_formspace.toolbox_sel.select];
				
				// cycle through the tools_fx array until the tool with this name is found
				for (var i = 0; i < tools_fx.length; i++)
					if (tools_fx[i].name == tool_name)
						break;

				// stop running the click timer function
				clearInterval(click_timer_id);
				
				// if the timer variable is under 30 cycles, select the form
				if (click_timer < 30 && click_timer != -1)
				{
					// remove the selection div from view
					this_select.style.top = "-100px";
					this_select.style.left = "-100px;"

					this_select.style.height = "0px";
					this_select.style.width = "0px;"

					// set the focus of the form (and the outline div) to the form itself
					main_formspace.set_outline_focus(this.id);
				}

				// otherwise, call the creation function for this tool (in digero_main.js)
				else
					tools_fx[i].create(this_select);

				// store the mouse x/y relative to the form for paste functions
				var rect = this_formspace.tab_forms[this_index].getBoundingClientRect();
				paste_x = evt.clientX - rect.left;
				paste_y = evt.clientY - rect.top;

				// indicate that the current form is the paste target
				paste_form = index;
			}
		} (this), false);

		// This is the selection div - the outline that appears when a user traces out a space in the form to add an element, or 
		// select several with the Pointer
		this.form_select[index] = document.createElement("div");
		this.form_select[index].id = this.formspace_div.id + "_select_" + index;
		this.form_select[index].style.position = "absolute";

		// keep the div hidden from view at first
		this.form_select[index].style.top = "-700px";
		this.form_select[index].style.left = "-700px";

		this.form_select[index].style.width = "2px";
		this.form_select[index].style.height = "2px";

		// a high z-index because it should always appear above anything else on the form
		this.form_select[index].style.zIndex = 100;

		// the border style switches for solid to dotted, depending on what is selected in the Toolbox (i.e. Pointer or other)
		this.form_select[index].style.borderStyle = "solid";
		this.form_select[index].style.borderWidth = "1px";		
		this.form_select[index].style.borderColor = "#202020";

		// the selection div is contained within the form
		this.tab_forms[index].appendChild(this.form_select[index]);

		// this is the outline div - the outline that appears when an element (or the form) has focus
		this.tab_outlines[index] = document.createElement("div");
		this.tab_outlines[index].id = this.formspace_div.id + "_outline_" + index;
		this.tab_outlines[index].style.position = "absolute";

		// the outline div initially appears around the form
		this.tab_outlines[index].style.top = "7px";
		this.tab_outlines[index].style.left = "7px";

		// spanning the form's default height and width, plus a small margin
		this.tab_outlines[index].style.width = "705px";
		this.tab_outlines[index].style.height = "505px";

		this.tab_outlines[index].style.zIndex = 9;

		// the outline div is always a dotted line
		this.tab_outlines[index].style.borderStyle = "dotted";
		this.tab_outlines[index].style.borderWidth = "thin";		
		this.tab_outlines[index].style.borderColor = "#909090";

		// the outline div is added to the tab, not the form, since the form itself can be selected
		this.tab_divs[index].appendChild(this.tab_outlines[index]);

		// this is the move icon that appears in the top-left corner of the outline when a container is selected
		this.tab_move[index] = document.createElement("div");
		this.tab_move[index].id = this.formspace_div.id + "_move_" + index;
		this.tab_move[index].style.position = "absolute";

		// the move icon appears to the left and above the top-left corner of the outline
		this.tab_move[index].style.top = "-9px";
		this.tab_move[index].style.left = "-9px";

		this.tab_move[index].style.width = "18px";
		this.tab_move[index].style.height = "18px";

		this.tab_move[index].style.zIndex = 9;

		// the mouse cursor turns to move when it hovers over the move icon
		this.tab_move[index].style.cursor = "move";

		// hidden for now - appears when a container is selected
		this.tab_move[index].style.visibility = "hidden";

		// add the move graphic, make sure the image is not draggable
		this.tab_move[index].innerHTML = "<img class = 'nonDraggableImage' src = 'img/move_panel.png'>";

		// the move icon is added to the outline div itself
		this.tab_outlines[index].appendChild(this.tab_move[index]);

		// This is the icon that appears when elements such as the DataGrid are selected - this is still experimental
		this.tab_expand[index] = document.createElement("div");
		this.tab_expand[index].id = this.formspace_div.id + "_move_" + index;
		this.tab_expand[index].style.position = "absolute";

		this.tab_expand[index].style.top = "-10px";
		this.tab_expand[index].style.left = "-9px";

		this.tab_expand[index].style.width = "10px";
		this.tab_expand[index].style.height = "10px";

		this.tab_expand[index].style.zIndex = 9;
		this.tab_expand[index].style.cursor = "default";
		this.tab_expand[index].style.visibility = "hidden";

		this.tab_expand[index].innerHTML = "<img class = 'nonDraggableImage' src = 'img/expand_menu.png'>";

		// the expand icon is added to the icon div itself
		this.tab_outlines[index].appendChild(this.tab_expand[index]);

		// If the make_object is true, add the form to the objects array - if an existing project is being loaded, then it
		// will already be there, and this will be set to false. If a new form is being added, it will be set to true.
		if (make_object)
			this.add_to_objects("Form" + (this.form_count + 1), this.form_count, this.formspace_div.id);

		// this variable specifies which object currently has the focus of the outline div
		this.outlines_focus[index] = {};

		// initially it is the form itself that has the focus
		this.outlines_focus[index].id = "Form" + (index + 1);
		this.outlines_focus[index].index = index;
		this.outlines_focus[index].type = "form";

		// This event works in tandem with events in the form div to support the resizing of form elements (and the form itself) within
		// the tab panel. The element outline div is the dotted line that appear around elements that currently have the focus. Note that
		// the formspace itself is passed as a parameter.
		this.tab_outlines[index].onmousemove = (function (this_formspace)
		{
			return function(evt)
			{
				// get the mouse x/y position relative to the outline div
				var rect = evt.target.getBoundingClientRect();
				var x = evt.clientX - rect.left;
				var y = evt.clientY - rect.top;

				var this_index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

				// The resize_mousedown flag is set to true when the mouse is pushed while a resize or move cursor appears over the outline div.
				if (this_formspace.resize_mousedown == true)
				{
					// Calculate the differences between the current and former mouse x/y positions. Old positions are continually stored
					// in the resize_x/y variables.
					var move_x = evt.clientX - this_formspace.resize_x;
					var move_y = evt.clientY - this_formspace.resize_y;

					// retrieve the element that current has focus - i.e. that is surrounded by the outline div
					var move_element = document.getElementById(this_formspace.outlines_focus[this_index].id);

					// The resize_dir variable is set based on the mouse cursor as it hovers over the bottom and/or right edges of the
					// outline div.

					// resize vertically if the resize_dir variable is set for that
					if (this_formspace.resize_dir == "ns" || this_formspace.resize_dir == "nsew")
					{
						// increase or decrease the height of the element in focus based on the move_y variable set above
						move_element.style.height = (parseInt(move_element.style.height) + move_y) + "px";

						// increase or decrease the height of the outline div by the same amount
						this.style.height = (parseInt(this.style.height) + move_y) + "px";

						// change the height attribute and the Height property of the element in focus based on the new height
						get_object(this_formspace.outlines_focus[this_index].id).height = parseInt(move_element.style.height);
						change_property(this_formspace.outlines_focus[this_index].id, "Height", parseInt(move_element.style.height), true);
					}

					// resize horizontally if the resize_dir variable is set for that
					if (this_formspace.resize_dir == "ew" || this_formspace.resize_dir == "nsew")
					{
						// increase or decrease the width of the element in focus based on the move_y variable set above
						move_element.style.width = (parseInt(move_element.style.width) + move_x) + "px";

						// increase or decrease the wdith of the outline div by the same amount
						this.style.width = (parseInt(this.style.width) + move_x) + "px";

						// change the width attribute and the Width property of the element in focus based on the new height
						get_object(this_formspace.outlines_focus[this_index].id).width = parseInt(move_element.style.width);
						change_property(this_formspace.outlines_focus[this_index].id, "Width", parseInt(move_element.style.width), true);
					}

					// If the mouse cursor indicates move, and/or the move button is pushed over the move anchor, proceed except if the element in focus
					// is the form itself, since it cannot be moved using the GUI interface (only in the Properties panel).
					if ((this.style.cursor == "move" || this_formspace.move_mousedown == true) && this_formspace.outlines_focus[this_index].type != "form")
					{
						// if a group of element has been selected, proceed
						if (this_formspace.outlines_focus[this_index].id == "#group")
						{
							// cycle through each element that has been selected
							for (var i = 0; i < select_group.length; i++)
							{
								// pull the next element with the given id from the DOM
								var move_element = document.getElementById(select_group[i].name);

								// move the element up or down the amount that the mouse has moved in the y axis
								move_element.style.top = (parseInt(move_element.style.top) + move_y) + "px";

								// update the object array, and the element Properties, with the same y value
								get_object(select_group[i].name).top = parseInt(move_element.style.top);
								change_property(select_group[i].name, "Top", parseInt(move_element.style.top), false);

								// move the element left or right the amount that the mouse has moved in the x axis
								move_element.style.left = (parseInt(move_element.style.left) + move_x) + "px";

								// update the object array, and the element Properties, with the same x value
								get_object(select_group[i].name).left = parseInt(move_element.style.left);
								change_property(select_group[i].name, "Left", parseInt(move_element.style.left), false);											
							}

							// move the outline div itself the same amount along the x and y axes
							this.style.top = (parseInt(this.style.top) + move_y) + "px";
							this.style.left = (parseInt(this.style.left) + move_x) + "px";
						}

						// else a single element has been selected
						else
						{
							// move the element up or down the amount that the mouse has moved in the y axis
							move_element.style.top = (parseInt(move_element.style.top) + move_y) + "px";
							this.style.top = (parseInt(this.style.top) + move_y) + "px";

							// update the object array, and the element Properties, with the same y value
							get_object(this_formspace.outlines_focus[this_index].id).top = parseInt(move_element.style.top);
							change_property(this_formspace.outlines_focus[this_index].id, "Top", parseInt(move_element.style.top), true);

							// move the element left or right the amount that the mouse has moved in the x axis
							move_element.style.left = (parseInt(move_element.style.left) + move_x) + "px";
							this.style.left = (parseInt(this.style.left) + move_x) + "px";

							// update the object array, and the element Properties, with the same x value
							get_object(this_formspace.outlines_focus[this_index].id).left = parseInt(move_element.style.left);
							change_property(this_formspace.outlines_focus[this_index].id, "Left", parseInt(move_element.style.left), true);
						}
					}

					// store the mouse x/y positions for the next time that the move event is called
					this_formspace.resize_x = evt.clientX;
					this_formspace.resize_y = evt.clientY;

					// call the _draw function for the selected element, if it is not a group
					if (this_formspace.outlines_focus[this_index].id != "#group")
						draw_element(this_formspace.outlines_focus[this_index].index);
				}

				// else if a group of elements is not selected, check to see if a resize cursor should be displayed
				else if (this_formspace.outlines_focus[this_index].id != "#group")
				{
					// if the cursor is around the bottom-right of the outline div, set the mouse cursor to nwse-resize
					if (parseInt(this.style.height) - y < 5 && parseInt(this.style.width) - x < 5)
					{
						this.style.cursor = "nwse-resize";

						// update the resize variable in the formspace
						this_formspace.resize_dir = "nsew";
					}

					// if the cursor is around the bottom edge of the outline div, set the mouse cursor to ns-resize
					else if (parseInt(this.style.height) - y < 5)
					{
						this.style.cursor = "ns-resize";

						// update the resize variable in the formspace
						this_formspace.resize_dir = "ns";
					}

					// if the cursor is around the righ edge of the outline div, set the mouse cursor to ew-resize
					else if (parseInt(this.style.width) - x < 5)
					{
						this.style.cursor = "ew-resize";

						// update the resize variable in the formspace
						this_formspace.resize_dir = "ew";
					}

					// if none are true, then check to see if the mouse is in a move or create/select (in a container) position
					else
					{
						// if the outline is around any element that is not a form or container, set the mouse cursor to move
						if (this_formspace.outlines_focus[this_index].type != "form" && get_object(this_formspace.outlines_focus[this_index].id).container == false)
							this.style.cursor = "move";

						// else if the outline is around a container, the mouse is in a create or select position
						else if (get_object(this_formspace.outlines_focus[this_index].id).container == true)
						{
							// if the Pointer is selected in the Toolbox, set the mouse cursor to default
							if (this_formspace.toolbox_sel.select == 0)
								this.style.cursor = "default";

							// otherwise, set the mouse cursor to a crosshair
							else
								this.style.cursor = "crosshair";

							// set the mouse_hover variable to this container element
							mouse_hover = this_formspace.outlines_focus[this_index].id;
						}

						// otherwise, set the mouse cursor to default
						else
							this.style.cursor = "default";

						// also clear the resize_dir variable, since the mouse is not in a resize position
						this_formspace.resize_dir = "";
					}
				}
 
 				// if outline_flag is set to true, it means that the left mouse button is down - if the outline div is focused on a container that is not the form, proceed
				if (outline_flag == true && get_object(this_formspace.outlines_focus[this_index].id).container == true && get_object(this_formspace.outlines_focus[this_index].id).type != "form")
				{
					// retrieve the index of the formspace from the form attribute of the outline div
					var this_index = this_formspace.get_form_num_index(get_object(this_formspace.outlines_focus[this_index].id).form);
					
					// retrieve the selection div for this form from the DOM
					var this_select = document.getElementById(this_formspace.formspace_div.id + "_select_" + this_index);

					// retrieve the mouse x/y position relative to the outline div
					var rect = document.getElementById(this_formspace.outlines_focus[this_index].id).getBoundingClientRect();
					var x = evt.clientX - rect.left;
					var y = evt.clientY - rect.top;

					// if the mouse's x position is to the right of the point where the button was pushed, proceed
					if (x > this_formspace.select_x)
					{
						// set the width to be current mouse x - x position of selection div
						this_select.style.width = (x - this_formspace.select_x) + "px";

						// keep the outline's x position the same
						this_select.style.left = this_formspace.select_x + "px";
					}

					// otherwise, the mouse is to the left of where the selection div was originally positioned
					else
					{
						// set the width to be x position of selection div - current mouse x
						this_select.style.width = (this_formspace.select_x - x) + "px";

						// set the outline's x position to the the current mouse x
						this_select.style.left = x + "px";
					}

					// if the mouse's y position is below where the button was pushed, proceed
					if (y > this_formspace.select_y)
					{
						// set the height to be current mouse y - y position of selection div
						this_select.style.height = (y - this_formspace.select_y) + "px";

						// keep the outline's y position the same
						this_select.style.top = this_formspace.select_y + "px";
					}

					// otherwise, the mouse is above where the selection div was originally positioned
					else
					{
						// set the height to be y position of selection div - current mouse y
						this_select.style.height = (this_formspace.select_y - y) + "px";

						// set the outline's y position to the the current mouse y
						this_select.style.top = y + "px";
					}
				}
			}
		}) (this);

		// If the left mouse button is pushed over the outline div, different things can happen. If a group of elements has been selected, then
		// nothing will happen. If a resize mouse cursor is displayed, then the resize flag is set. If either a resize or move cursor is displayed,
		// set the select_id to the element that has focus. Otherwise, if the element that currently has focus is a container, then the user is
		// about to trace out a new element, or select a group of elements, depending on what is selected in the Toolbox.
		this.tab_outlines[index].addEventListener("mousedown", function (this_formspace)
		{
			return function(evt)
			{
				// retrieve the index of the form from the outline div id
				var this_index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

				// if a group of elements is selected, exit the function
				if (this_formspace.outlines_focus[this_index].id == "#group")
					return;

				// if the mouse cursor is a resize variant, or the element is not a container (i.e. displaying the move cursor), set the resize flag
				if (this.style.cursor.search("resize") != -1 || get_object(this_formspace.outlines_focus[this_index].id).container == false)
					this_formspace.resize_mousedown = true;

				// if a select type has already not been set (e.g. in a previous mousedown event), proceed
				if (this_formspace.select_type == null)
				{
					// if the cursor type is resize, proceed
					if (this.style.cursor.search("resize") != -1)
					{
						// set the select_type flag to resize
						this_formspace.select_type = "resize";

						// set the select_id to be the element in focus
						this_formspace.select_id = this_formspace.outlines_focus[this_index].id;
					}

					// else if the cursor type is move, proceed
					else if (this.style.cursor == "move")
					{
						// set the select_type flag to move
						this_formspace.select_type = "move";

						// set the select_id to be the element in focus
						this_formspace.select_id = this_formspace.outlines_focus[this_index].id;
					}

					// if the object in focus is a container and it is not a form, then the user is about to trace out an element or selection in the container
					else if (get_object(this_formspace.outlines_focus[this_index].id).container == true && get_object(this_formspace.outlines_focus[this_index].id).type != "form")
					{
						// set the outline_flag to true - this is used in other events
						outline_flag = true;

						// retrieve the index of the form from the outline div id
						var this_index = this_formspace.get_form_num_index(get_object(this_formspace.outlines_focus[this_index].id).form);

						// retrieve the x/y position of the mouse relative to the form
						var rect = document.getElementById(this_formspace.outlines_focus[this_index].id).getBoundingClientRect();
						var x = evt.clientX - rect.left;
						var y = evt.clientY - rect.top;

						// this code will be written if this situation ever happens
						if (main_toolbox.select == 0 && element_flag == true)
						{

						}

						// otherwise, run this code
						else
						{
							// run this code only if the select_down flag is false (this will likely always be the case)
							if (this_formspace.select_down == false);
							{
								// set the select_down flag indicating the mouse button has been pressed (this is used in the mousemove function above)
								this_formspace.select_down = true;

								// store the current mouse x/y positions
								this_formspace.select_x = x;
								this_formspace.select_y = y;

								// retrieve the selection div for this form from the DOM
								var this_select = document.getElementById(this_formspace.formspace_div.id + "_select_" + this_index);

								// reset the outlive div by removing and adding it again
								this_select.parentElement.removeChild(this_select);
								this.appendChild(this_select);

								// set the x/y coordinates for the outline to be the current mouse x/y
								this_select.style.left = x + "px";
								this_select.style.top = y + "px";

								// the selection div will have no width or height until the mouse is dragged
								this_select.style.width = "0px";
								this_select.style.height = "0px";

								// if anything other than the Pointer is selected in the Toolbox, the selection div will be solid
								if (this_formspace.toolbox_sel.select != 0)
									this_select.style.borderStyle = "solid";

								// if Pointer is selected, the selection div will be dotted
								else
									this_select.style.borderStyle = "dotted";
							}
						}

						// If the Pointer is selected in the Toolbox, start running a function that increments a timer variable every 20 msec.
						// This is used to determine if the form itself is being selected - this will only happen if the timer variable is under
						// a certain value, i.e. the mouse was clicked quickly.
						if (main_toolbox.select == 0)
						{
							// click_timer is a global variable, not a formspace variable
							click_timer = 0;

							// start the increment function running every 20 msec
							click_timer_id = setInterval(click_timer_run, 20);
						}

						// if the Pointer is not selected, clear the timer variable
						else
						{
							click_timer = -1;
						}
					}

					// otherwise, reset select_type and select_id
					else
					{
						this_formspace.select_type = null;
						this_formspace.select_id = null;
					}
				}

				// store the mouse x/y position to be used later
				this_formspace.resize_x = evt.clientX;
				this_formspace.resize_y = evt.clientY;
			}
		} (this), false);

		// When the left mouse button is released over the outline div when a container is selected, the creation function for the
		// selected tool is run. Otherwise, various flags and the click timer are reset.
		this.tab_outlines[index].onmouseup = (function (this_formspace)
		{
			return function(evt)
			{	
				// retrieve the index of the form from the outline div id
				var this_index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

				// if the outline div has focus on a group, exit the function
				if (this_formspace.outlines_focus[this_index].id == "#group")
					return;

				// if the outline div is focused on a container, and it is not the form, proceed
				if (get_object(this_formspace.outlines_focus[this_index].id).container == true && get_object(this_formspace.outlines_focus[this_index].id).type != "form")
				{
					// retrieve the selection div from the DOM
					var this_select = document.getElementById(this_formspace.formspace_div.id + "_select_" + this_index);

					// retrieve the tool name from the Toolbox
					var tool_name = this_formspace.toolbox_sel.tools_name[this_formspace.toolbox_sel.select];
					
					// cycle through the tools_fx array until the tool name is found
					for (var i = 0; i < tools_fx.length; i++)
						if (tools_fx[i].name == tool_name)
							break;

					// call the tool creation function
					tools_fx[i].create(this_select);

					// stop the click timer function and clear the outline flag
					clearInterval(click_timer_id);
					outline_flag = false;

					if (click_timer < 30 && click_timer != -1)
					{
						var rect = evt.target.getBoundingClientRect();
						var x = evt.clientX - rect.left;
						var y = evt.clientY - rect.top;

						this_select.style.top = "-100px";
						this_select.style.left = "-100px;"

						this_select.style.height = "0px";
						this_select.style.width = "0px;"

						var stop_flag = false;
						var this_obj = this_formspace.outlines_focus[this_index].id;

						//while (stop_flag == false)
						//{
							for (var i = 0; i < objects.length; i++)
								if (objects[i].parent == this_formspace.outlines_focus[this_index].id)
									if(x >= objects[i].left && x < (objects[i].left + objects[i].width) && y >= objects[i].top && y < (objects[i].top + objects[i].height))
									{
										this_obj = objects[i].name;

										//if (objects[i].container == false)
										//	stop_flag = true;

										//break;
									}

							//if (i == objects.length)
							//	break;
						//}

						this_formspace.set_outline_focus(this_obj);
					}
				}

				// reset all the flags related to element resize and move actions
				this_formspace.resize_mousedown = false;
				this_formspace.select_down = false;
				this_formspace.select_type = null;

				var rect = this_formspace.tab_forms[this_index].getBoundingClientRect();
				var this_parent = get_parent(this_formspace.outlines_focus[this_index].id);

				if (this_parent.type == "form")
				{
					paste_x = evt.clientX - rect.left;
					paste_y = evt.clientY - rect.top;
				}
				else
				{
					paste_x = evt.clientX - rect.left - this_parent.left;
					paste_y = evt.clientY - rect.top - this_parent.top;
				}

				paste_form = this_index;

				// stop and reset the click timer function
				clearInterval(click_timer_id);
				click_timer = -1;
			}
		}) (this);

		// this is the mousedown event for the move anchor that appears on the outline div when a container or group is selected
		this.tab_move[index].onmousedown = (function (this_formspace)
		{
			return function(evt)
			{
				// set the resize flag (also used in move actions)
				this_formspace.resize_mousedown = true;

				// retrieve the id of the formspace from the element id
				var this_index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

				// the select type becomes move, and the select id is set to the element in focus
				this_formspace.select_type = "move";
				this_formspace.select_id = this_formspace.outlines_focus[this_index].id;

				// the mouse x/y are stored for use in later events
				this_formspace.resize_x = evt.clientX;
				this_formspace.resize_y = evt.clientY;	

				// set the move mousedown flag
				this_formspace.move_mousedown = true;	
			}
		}) (this);

		// this is the mousemove event for the move anchor that appears on the outline div when a container or group is selected
		this.tab_move[index].onmousemove = (function (this_formspace)
		{
			return function(evt)
			{
				// check if the mouse button is pushed down
				if (this_formspace.resize_mousedown == true)
				{
					// retrieve the mouse x/y position relative to the parent element
					var rect = evt.target.getBoundingClientRect();
					var x = evt.clientX - rect.left;
					var y = evt.clientY - rect.top;

					// retrieve the index of the form based on the element id
					var this_index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

					// retrieve the outline div for this form from the DOM
					var this_outline =  document.getElementById(this.id.replace("move", "outline"));

					// calculate the amount of x/y movement by the mouse
					var move_x = evt.clientX - this_formspace.resize_x;
					var move_y = evt.clientY - this_formspace.resize_y;

					// if a group of elements has been selected, proceed
					if (this_formspace.outlines_focus[this_index].id == "#group")
					{
						// cycle through all the elements in the group
						for (var i = 0; i < select_group.length; i++)
						{
							// retrieve an element from the group array from the DOM
							var move_element = document.getElementById(select_group[i].name);

							// move the element up or down the amount determined
							move_element.style.top = (parseInt(move_element.style.top) + move_y) + "px";

							// store the new element y in the objects array, and in the element properties
							get_object(select_group[i].name).top = parseInt(move_element.style.top);
							change_property(select_group[i].name, "Top", parseInt(move_element.style.top), false);

							// move the element left or right the amount determined
							move_element.style.left = (parseInt(move_element.style.left) + move_x) + "px";

							// store the new element x in the objects array, and in the element properties
							get_object(select_group[i].name).left = parseInt(move_element.style.left);
							change_property(select_group[i].name, "Left", parseInt(move_element.style.left), false);											
						}

						// move the outline div itself - this will also move the anchor
						this_outline.style.top = (parseInt(this_outline.style.top) + move_y) + "px";
						this_outline.style.left = (parseInt(this_outline.style.left) + move_x) + "px";

						// store the current mouse x/y for the next time an event it called
						this_formspace.resize_x = evt.clientX;
						this_formspace.resize_y = evt.clientY;	
					}

					// otherwise, if this is a single element, proceed
					else
					{
						// retrieve the selected element from the DOM
						var move_element = document.getElementById(this_formspace.outlines_focus[this_index].id);

						// move the element up or down the amount that the mouse has moved in the y axis
						move_element.style.top = (parseInt(move_element.style.top) + move_y) + "px";

						// store the new element y in the objects array, and in the element properties
						get_object(this_formspace.outlines_focus[this_index].id).top = parseInt(move_element.style.top);
						change_property(this_formspace.outlines_focus[this_index].id, "Top", parseInt(move_element.style.top), true);

						// move the element left or right the amount determined
						move_element.style.left = (parseInt(move_element.style.left) + move_x) + "px";

						// store the new element x in the objects array, and in the element properties
						get_object(this_formspace.outlines_focus[this_index].id).left = parseInt(move_element.style.left);
						change_property(this_formspace.outlines_focus[this_index].id, "Left", parseInt(move_element.style.left), true);					

						// move the outline div itself - this will also move the anchor
						this_outline.style.left = (parseInt(this_outline.style.left) + move_x) + "px";
						this_outline.style.top = (parseInt(this_outline.style.top) + move_y) + "px";

						// store the current mouse x/y for the next time an event it called
						this_formspace.resize_x = evt.clientX;
						this_formspace.resize_y = evt.clientY;	
					}
				}
			}
		}) (this);

		// this is the mouseup event for the move anchor that appears on the outline div when a container or group is selected
		this.tab_move[index].onmouseup = (function (this_formspace)
		{
			return function(evt)
			{
				// reset the selection and resize flags
				this_formspace.resize_mousedown = false;
				this_formspace.select_down = false;
				this_formspace.select_type = null;	

				// reset the move flag
				this_formspace.move_mousedown = false;	
			}
		}) (this);

		// this is code for when the expand button is pushed for certain elements - still in experimental stage
		this.tab_expand[index].onclick = (function (this_formspace, index)
		{
			return function(evt)
			{
				var tool_name = objects[this_formspace.outlines_focus[index].index].type;
				
				for (var i = 0; i < tools_fx.length; i++)
					if (tools_fx[i].name.toLowerCase() == tool_name)
						break;

				tools_fx[i].expand(this_formspace.outlines_focus[index].index);
			}
		}) (this, index);

		this.form_count++;
	}

	// this function removes all the tabs currently in the formspace
	this.clear_tabs = function()
	{
		// cycle through every tab
		for (var i = 0; i < this.tabs; i++)
		{
			// remove the tab, and the tab panel
			this.formspace_div.removeChild(this.tab_divs[i]);
			this.formspace_div.removeChild(this.tab_names[i]);
		}

		// reset the tab array
		this.tab_divs.length = 0;

		// reset the tab counter 
		this.tabs = 0;

		// remove all form elements from the formspace
		objects.length = 0;		
	}

	// given a form name, retrieve its index
	this.get_form_tab_index = function(form_name)
	{
		for (var i = 0; i < this.tabs; i++)
			if (this.tab_names[i].innerHTML == form_name)
				return i;
	}

	// given a form number, retrievee its index
	this.get_form_num_index = function(form_number)
	{
		for (var i = 0; i < this.tabs; i++)
			if (this.form_num[i] == form_number)
				return i;
	}

	// This function is called whenever a new form is added to the project by the user, in order to create a form object
	// in the objects array. When an existing project is loaded, this function is not called, since the form is already
	// in the objects array.
	this.add_to_objects = function(form_name, form_index, form_parent)
	{
		// the index will be the length of the array, since this is a new entry
		var obj_index = objects.length;

		// begin creating the component in the objects array
		objects[obj_index] = {};

		objects[obj_index].name = form_name;
		objects[obj_index].type = "form";

		// since this if the form, the form attribute is equal to the form index itself
		objects[obj_index].form = form_index;

		// this is the default position of every form
		objects[obj_index].top = 10;
		objects[obj_index].left = 10;

		objects[obj_index].z = 10 * (form_index + 1);

		// the default height and width for a form are contained in the formspace
		objects[obj_index].width = parseInt(this.default_width);
		objects[obj_index].height = parseInt(this.default_height);

		objects[obj_index].parent = null;
		objects[obj_index].container = false;
		objects[obj_index].container_suffix = "";

		// the properties array holds all of the properties that will display in the Properties window
		objects[obj_index].properties = new Array();

		// index is always set to the length of the array, so that new properties may be added in later
		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Name";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = form_name;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BackgroundColor";
		objects[obj_index].properties[index].type = "color";
		objects[obj_index].properties[index].value = "#d0d0d0";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "BorderColor";
		objects[obj_index].properties[index].type = "number";
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
		objects[obj_index].properties[index].name = "BoxShadow";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "true";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Center";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Fullscreen";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Height";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = parseInt(this.default_height);

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
		objects[obj_index].properties[index].value = 10;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Maximize";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "true,false";
		objects[obj_index].properties[index].value = "false";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Script";
		objects[obj_index].properties[index].type = "file";
		objects[obj_index].properties[index].value = form_name + ".js";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Text";
		objects[obj_index].properties[index].type = "string";
		objects[obj_index].properties[index].value = form_name;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Top";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 10;

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Visibility";
		objects[obj_index].properties[index].type = "select";
		objects[obj_index].properties[index].options = "visible,hidden";

		// all forms except for the first are invisible by default
		if (form_index == 0)
			objects[obj_index].properties[index].value = "visible";
		else
			objects[obj_index].properties[index].value = "hidden";

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "Width";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = parseInt(this.default_width);

		index = objects[obj_index].properties.length;
		objects[obj_index].properties[index] = {};
		objects[obj_index].properties[index].name = "ZIndex";
		objects[obj_index].properties[index].type = "number";
		objects[obj_index].properties[index].value = 10 * (form_index + 1);
	}

	// this function links the formspace with a toolbox object
	this.set_toolbox = function(this_toolbox)
	{
		this.toolbox_sel = this_toolbox;
	}

	// this function is used with elements such as the DataGrid, and is still experimental
	this.open_context_menu = function(element_id, width)
	{
		var element = document.getElementById(element_id);
		var index = this.get_form_tab_index(get_form_name(get_object(element_id).form));

		var rect = element.getBoundingClientRect();
		var x = (parseInt(this.tab_expand[index].style.left) + 7) + rect.left;
		var y = (parseInt(this.tab_expand[index].style.top) + 2) + rect.top;

		this.tab_expand[index].innerHTML = "<img class = 'nonDraggableImage' src = 'img/expand_menu_open.png'>";
		main_contextmenu.create(x, y, width);
	}

	// This function takes the outline_div, and moves and resizes it to display around the element with the provided id. Note that a
	// margin exists around all sides of a selected element, so the outline div is slightly above and to the left of the selected
	// element, and is slightly wider and higher than its bottom-right corner.
	this.set_outline_focus = function(element_id)
	{
		// if the selected element is a group, the outline has to surround all of the elements
		if (element_id.substring(0, 6) == "#group")
		{
			// set the object_focus global variable, used in window event functions
			object_focus = "#group";

			// the form name is embedded within the element_id
			var this_form = element_id.split("_")[1];

			// retrive the index of the form, given its name
			var index = this.get_form_tab_index(get_form_name(this_form));

			// The x1/y1 and x2/y2 variables will determine the top-left and bottom right positions for the outline div. Here we set
			// extreme values for each, which we will modify, as elements in the group are considered.
			var x1 = 10000;
			var x2 = 0;

			var y1 = 10000;
			var y2 = 0;

			// cycle through all the elements in the group
			for (var i = 0; i < select_group.length; i++)
			{
				// if the x value of the element is less than x1, set x1 to that value
				if (select_group[i].left < x1)
					x1 = select_group[i].left;

				// if the x + width value of the element is more than x2, set x2 to that value
				if (select_group[i].left + select_group[i].width > x2)
					x2 = select_group[i].left + select_group[i].width;

				// if the y value of the element is less than y1, set y1 to that value
				if (select_group[i].top < y1)
					y1 = select_group[i].top;

				// if the y + height value of the element is more than y2, set y2 to that value
				if (select_group[i].top + select_group[i].height > y2)
					y2 = select_group[i].top + select_group[i].height;
			}

			// shift the positions so that there is a 5px margin around the elements
			x1 -= 5;
			x2 += 5;

			y1 -= 5;
			y2 += 5;

			//console.log(select_group);
			//console.log(x1 + " " + x2 + " " + y1 + " " + y2);

			// the outlines_focus object for the form points to the element in focus, here group
			this.outlines_focus[index].id = "#group";

			// the group value has no index or type
			this.outlines_focus[index].index = -1;
			this.outlines_focus[index].type = null;

			// move the outline div to the x/y position determined above
			this.tab_outlines[index].style.left = x1 + "px";
			this.tab_outlines[index].style.top = y1 + "px";

			// width and height equal to the difference between the x2/y2 and x1/y1 positions
			this.tab_outlines[index].style.width = (x2 - x1) + "px";
			this.tab_outlines[index].style.height = (y2 - y1) + "px";

			this.tab_outlines[index].style.zIndex = 1000;
			this.tab_outlines[index].style.borderColor = "#505050";

			// add 10px to the x and y positions to account for the x/y of the form in the formspace
			this.tab_outlines[index].style.top = (getInt(this.tab_outlines[index].style.top) + 10) + "px";
			this.tab_outlines[index].style.left = (getInt(this.tab_outlines[index].style.left) + 10) + "px";

			this.tab_move[index].style.visibility = "visible";
		}

		// otherwise a single element has been selected
		else
		{
			// set the object_focus global variable, used in window event functions
			object_focus = element_id;

			// retrive the index of the form, given its name
			var index = this.get_form_tab_index(get_form_name(get_object(element_id).form));

			// set the outlines_focus object for this form to point to this element
			this.outlines_focus[index].id = element_id;

			// get the index and type of the element, and store them in the outlines_focus object
			this.outlines_focus[index].index = get_object_index(element_id);
			this.outlines_focus[index].type = get_object(element_id).type;

			// retrieve the name of the element's parent element
			this_parent = get_object(element_id).parent;

			// these are used in the while function that follows
			var add_x = 0;
			var add_y = 0;

			// This function is run in order to shift the outline div based on the position(s) of the element's parent element(s). The this_parent
			// variable is replaced by the next parent element up each time the loop iterates, until it reaches the form element.
			while (this_parent != null && this_parent != undefined)
			{
				// if the parent element is not a form - that is, it is a container - then proceed
				if (this_parent != null && get_object(this_parent).type != "form")
				{
					// increment the add_x and add_y variables by the x/y position of the container, as well as the border width
					add_x += getInt(document.getElementById(get_object(this_parent).name).style.left) + getInt(document.getElementById(get_object(this_parent).name).style.borderWidth);
					add_y += getInt(document.getElementById(get_object(this_parent).name).style.top) + getInt(document.getElementById(get_object(this_parent).name).style.borderWidth);

					//add_x += getInt(document.getElementById(get_object(this_parent).name + get_object(this_parent).container_suffix).style.left);
					//add_y += getInt(document.getElementById(get_object(this_parent).name + get_object(this_parent).container_suffix).style.top);

					// if the container is a ScrollPanel and is scrolled left/right, subtract this from add_x
					if (document.getElementById(get_object(this_parent).name).scrollLeft > 0)
						add_x -= document.getElementById(get_object(this_parent).name).scrollLeft;

					// if the container is a ScrollPanel and is scrolled up/down, subtract this from add_y
					if (document.getElementById(get_object(this_parent).name).scrollTop > 0)
						add_y -= document.getElementById(get_object(this_parent).name).scrollTop;

				}

				// otherwise, if the parent element is a form, proceed
				else if (this_parent != null && (document.getElementById(get_object(this_parent).name).style.borderStyle != "none" && document.getElementById(get_object(this_parent).name).style.borderStyle != ""))
				{
					// add the form's border width to add_x and add_y
					add_x += getInt(document.getElementById(get_object(this_parent).name).style.borderWidth);
					add_y += getInt(document.getElementById(get_object(this_parent).name).style.borderWidth);
				}

				// set this_parent to be the next parent up in the chain, if any
				this_parent = get_object(this_parent).parent;
			}	

			// set the outline div x/y to be slightly to the left and above the element's x/y position
			this.tab_outlines[index].style.top = ((get_object(element_id).top - 3) + add_y) + "px";
			this.tab_outlines[index].style.left = ((get_object(element_id).left - 3) + add_x) + "px";

			// the width and height of the outline will depend on the width/height of the element, as well as other features such as padding and margins
			this.tab_outlines[index].style.width = (get_object(element_id).width + getInt(document.getElementById(element_id).style.paddingLeft) + getInt(document.getElementById(element_id).style.paddingRight) + getInt(document.getElementById(element_id).style.marginLeft) + getInt(document.getElementById(element_id).style.marginRight) + 4) + "px";
			this.tab_outlines[index].style.height = (get_object(element_id).height + getInt(document.getElementById(element_id).style.paddingTop) + getInt(document.getElementById(element_id).style.paddingBottom) + getInt(document.getElementById(element_id).style.marginTop) + getInt(document.getElementById(element_id).style.marginBottom) + 4) +"px";

			// if the element has a border, add the border width to the width/height of the outline div
			if (document.getElementById(element_id).style.borderStyle != "none" && document.getElementById(element_id).style.borderStyle != "")
			{
				this.tab_outlines[index].style.width = (getInt(this.tab_outlines[index].style.width) + (getInt(document.getElementById(element_id).style.borderWidth) * 2)) + "px";
				this.tab_outlines[index].style.height = (getInt(this.tab_outlines[index].style.height) + (getInt(document.getElementById(element_id).style.borderWidth) * 2)) + "px";
			}

			// if the element is a form, set the z index and border color as shown
			if (get_object(element_id).type == "form")
			{
				this.tab_outlines[index].style.zIndex = 9;	
				this.tab_outlines[index].style.borderColor = "#909090";
			}

			// if the element is not a form, proceed
			else
			{
				// make sure the z index is higher than anything else on the form
				this.tab_outlines[index].style.zIndex = 1000;

				// set the border color differently from above
				this.tab_outlines[index].style.borderColor = "#505050";

				// add 10px to the outline x/y to account for the form x/y in the formspace
				this.tab_outlines[index].style.top = (getInt(this.tab_outlines[index].style.top) + 10) + "px";
				this.tab_outlines[index].style.left = (getInt(this.tab_outlines[index].style.left) + 10) + "px";
			}

			// find the element in the objects array
			for (var i = 0; i < objects.length; i++)
				if (objects[i].name == element_id)
					break;

			// if the element uses an expand menu when it has focus, proceed - this is still experimental
			if (objects[i].expand_menu == true)
			{
				this.tab_expand[index].style.left = (getInt(this.tab_outlines[index].style.width) - 16) + "px";
				this.tab_expand[index].style.visibility = "visible";

				this.tab_expand[index].innerHTML = "<img class = 'nonDraggableImage' src = 'img/expand_menu.png'>";
			}

			// otherwise, hide the expand menu button
			else
				this.tab_expand[index].style.visibility = "hidden";

			// if the element is a container, show the move anchor
			if (objects[i].container == true)
				this.tab_move[index].style.visibility = "visible";

			// otherwise hide the move anchor
			else
				this.tab_move[index].style.visibility = "hidden";

			// add the element's properties in the Properties window
			main_properties.add_properties(i);
		}
	}

	// this function is used to resize the formspace by the amount specified in quant, on the specified side
	this.select_resize = function(quant, side)
	{
		// if being resized on the left side, the formspace will also shift left
		if (side == "left")
		{
			// shift the formspace left by the amount specified
			this.formspace_div.style.left = (getInt(this.formspace_div.style.left) + quant) + "px";

			// modify the width of the formspace by the same amount (this will actually be the negative of quant)
			this.formspace_div.style.width = (getInt(this.formspace_div.style.width) - quant) + "px";

			// the tabspace container will change in width by the same amount (again negative)
			this.tabspace_container.style.width = (getInt(this.tabspace_container.style.width) - quant) + "px";

			// the tabmoves div is always located just to the right of the tabspace container
			this.tabmoves_div.style.left = getInt(this.tabspace_container.style.width) + "px";

			for (var i = 0; i < this.tab_divs.length; i++)
			{
				this.tab_divs[i].style.width = (getInt(this.tab_divs[i].style.width) - quant) + "px";

				if (main_formspace.tab_types[i] == "code")
				{
					main_formspace.tab_codes[i].style.width = (getInt(main_formspace.tab_codes[i].style.width) - quant) + "px";

					main_formspace.tab_codes_objects[i].style.width = ((getInt(main_formspace.tab_codes[i].style.width) - quant) / 2) + "px";
					main_formspace.tab_codes_events[i].style.left = ((getInt(main_formspace.tab_codes[i].style.width) - quant) / 2) + "px";	
					main_formspace.tab_codes_events[i].style.width = ((getInt(main_formspace.tab_codes[i].style.width) - quant) / 2) + "px";		
				}
				else if (main_formspace.tab_types[i] == "data")
				{
					main_formspace.tab_data[i].style.width = (getInt(main_formspace.tab_data[i].style.width) - quant) + "px";
					//main_formspace.table[i].redraw(true);
				}
			}
		}
		else if (side == "right")
		{
			this.formspace_div.style.width = (getInt(this.formspace_div.style.width) + quant) + "px";

			this.tabspace_container.style.width = (getInt(this.tabspace_container.style.width) + quant) + "px";
			this.tabmoves_div.style.left = getInt(this.tabspace_container.style.width) + "px";

			for (var i = 0; i < this.tab_divs.length; i++)
			{
				this.tab_divs[i].style.width = (getInt(this.tab_divs[i].style.width) + quant) + "px";

				if (main_formspace.tab_types[i] == "code")
				{
					main_formspace.tab_codes[i].style.width = (getInt(main_formspace.tab_codes[i].style.width) + quant) + "px";

					main_formspace.tab_codes_objects[i].style.width = ((getInt(main_formspace.tab_codes[i].style.width) + quant) / 2) + "px";
					main_formspace.tab_codes_events[i].style.left = ((getInt(main_formspace.tab_codes[i].style.width) + quant) / 2) + "px";	
					main_formspace.tab_codes_events[i].style.width = ((getInt(main_formspace.tab_codes[i].style.width) + quant) / 2) + "px";		
				}
				else if (main_formspace.tab_types[i] == "data")
				{
					main_formspace.tab_data[i].style.width = (getInt(main_formspace.tab_data[i].style.width) + quant) + "px";
					//main_formspace.table[i].redraw(true);
				}
			}	
		}
	}
}

// The object that creates the Properties window - data is a JSON object that accepts the following parameters:
// data is a JSON objects that accepts the following parameters:
// "id" - the name of the window
// "x", "y" - the x/y position of the window, in pixels
// "width", "height" - the width and height of the window, in pixels
// "background" - the background color of the window
// "background-header" - the background color of the header
// "div" - the div that contains the window - this is used when resizing it

function properties(data)
{
	// stores the width and height of the window
	this.width = data.width;
	this.height = data.height;

	// The three arrays created below hold all of the DOM elements that are used to make each property.

	// these elements contain the name of each property
	this.property_items = new Array();

	// these elements contain the value for each property - this is either a regular div, or a select box
	this.property_values = new Array();

	// these elements contain buttons for opening file dialogs, and color palette buttons, for properties that need them
	this.property_files = new Array();

	// create main div for properties using supplied data
	this.properties_div = document.createElement("div");
	this.properties_div.id = data.id;
	this.properties_div.style.position = "absolute";

	// in Digero, the Properties window is displayed in the top-right corner of the application
	this.properties_div.style.top = data.y + "px";
	this.properties_div.style.left = data.x + "px";

	this.properties_div.style.width = data.width + "px";
	this.properties_div.style.height = data.height + "px";

	this.properties_div.style.backgroundColor = data.background;

	// add Properties box to the specified div
	data.div.appendChild(this.properties_div);

	// create main div header for Properties window using supplied data
	this.properties_div_header = document.createElement("div");
	this.properties_div_header.id = data.id + "header";
	this.properties_div_header.style.position = "absolute";

	this.properties_div_header.style.top = "0px";
	this.properties_div_header.style.left = "0px";

	// decrease the width by 3px because of the 3px padding
	this.properties_div_header.style.width = (data.width - 3) + "px";
	this.properties_div_header.style.height = "17px";

	// header background color is supplied
	this.properties_div_header.style.backgroundColor = data.background_header;
	this.properties_div_header.style.color = "#ffffff";

	this.properties_div_header.style.fontFamily = "ABeeZee";
	this.properties_div_header.style.fontSize = "12px";

	// padding so the text isn't right up against the top-left corner
	this.properties_div_header.style.paddingLeft = "3px";
	this.properties_div_header.style.paddingTop = "3px";

	// text labelling the Properties window
	this.properties_div_header.innerHTML = "Properties";

	// add div to main Properties div
	this.properties_div.appendChild(this.properties_div_header);

	// the list container contains the list element
	this.properties_list_container = document.createElement("div");
	this.properties_list_container.id = data.id + "_div_list_container";
	this.properties_list_container.style.position = "absolute";

	this.properties_list_container.style.top = "20px";
	this.properties_list_container.style.left = "0px";

	this.properties_list_container.style.width = data.width + "px";
	this.properties_list_container.style.height = (data.height - 20) + "px";

	// the container can scroll up and down
	this.properties_list_container.style.overflowY = "scroll";
	this.properties_list_container.style.overflowX = "hidden";

	// the container is added inside the main Properties div
	this.properties_div.appendChild(this.properties_list_container);

	// the list contains all of the individual property elements
	this.properties_div_list = document.createElement("div");
	this.properties_div_list.id = data.id + "_div_list";
	this.properties_div_list.style.position = "absolute";

	this.properties_div_list.style.top = "20px";
	this.properties_div_list.style.left = "0px";

	this.properties_div_list.style.width = data.width + "px";

	// the height will vary depending on how many properties are displayed
	this.properties_div_list.style.height = (data.height - 20) + "px";

	this.properties_div_list.style.overflowY = "hidden";
	this.properties_div_list.style.overflowX = "hidden";

	// the list is added inside the list container
	this.properties_list_container.appendChild(this.properties_div_list);

	// The add_properties function creates entries for all of the properties of an object in the objects array. The index
	// of the object to focus on is supplied as a parameter. In order to clear the window of existing properties, the list
	// element is removed, then added again.
	this.add_properties = function(index)
	{
		try 
		{
			// if the properties list div exists in the Properties window, remove it
			if (this.properties_list_container.contains(this.properties_div_list))
				this.properties_list_container.removeChild(this.properties_div_list);
		}
		catch(e)
		{

		}

		// recreate the list div
		this.properties_div_list = document.createElement("div");
		this.properties_div_list.id = data.id + "div";
		this.properties_div_list.style.position = "absolute";

		this.properties_div_list.style.top = "0px";
		this.properties_div_list.style.left = "0px";

		this.properties_div_list.style.width = this.width + "px";

		// set the height of the list div to be a multiple of the number of properties contained in the given element
		this.properties_div_list.style.height = (objects[index].properties.length * 20) + "px";

		//this.properties_div_list.style.overflowY = "scroll";

		// add the list to the container div
		this.properties_list_container.appendChild(this.properties_div_list);		

		// Now all of the properties belonging to the object will be cycled through and added to the Properties window. Note that
		// every type of property gets the same label, created in the property_items array. Where things differ is in the _values
		// and _files arrays. Values are generally either strings (including numbers), or select elements. The file element can
		// take different forms, or not be used at all. Headers are also a special case, with no attached value.
		for (var i = 0; i < objects[index].properties.length; i++)
		{
			// create the property label div and store it in the _items array
			this.property_items[i] = document.createElement("div");

			// the id for this element combines the index of the object with the index of this specific property
			this.property_items[i].id = index + "_property_" + i;
			this.property_items[i].style.position = "absolute";

			// properties are stacked vertically based on their position within the object properties array
			this.property_items[i].style.top = (20 * i) + "px";
			this.property_items[i].style.left = "0px";

			// width of the label div is slightly less than half the width of the Properties window
			this.property_items[i].style.width = Math.floor(parseInt(this.properties_div_header.style.width) / 2.2) + "px";
			this.property_items[i].style.height = "17px";

			this.property_items[i].style.backgroundColor = "#252526";
			this.property_items[i].style.color = "#d0d0d0";

			this.property_items[i].style.fontFamily = "ABeeZee";
			this.property_items[i].style.fontSize = "12px";

			this.property_items[i].style.paddingLeft = "3px";
			this.property_items[i].style.paddingTop = "3px";

			this.property_items[i].style.borderStyle = "solid";
			this.property_items[i].style.borderWidth = "thin";		
			this.property_items[i].style.borderColor = "#404040";

			// property names may be preceded by a header value, separated by a '.' from the name
			if (objects[index].properties[i].name.indexOf(".") == -1)

				// if there is no header value, then use the entire name as the label for this property
				this.property_items[i].innerHTML = objects[index].properties[i].name;
			else
				// otherwise, the label will be everything in the name after the '.'
				this.property_items[i].innerHTML = objects[index].properties[i].name.substring(objects[index].properties[i].name.indexOf(".") + 1, objects[index].properties[i].name.length);

			this.properties_div_list.appendChild(this.property_items[i]);

			// strings and numbers are values that are typed directly by the user, so they are displayed within input elements
			if (objects[index].properties[i].type == "string" || objects[index].properties[i].type == "number")
			{
				// the element type is input, since values are typed in directly
				this.property_values[i] = document.createElement("input");

				// the id for this element combines the index of the object with the index of this specific property
				this.property_values[i].id = index + "_value_" + i;
				this.property_values[i].style.position = "absolute";

				this.property_values[i].style.top = (20 * i) + "px";

				// the element appears just to the right of the label created above
				this.property_values[i].style.left = Math.floor(parseInt(this.properties_div_header.style.width) / 2.2) + "px";

				// the width is equal to the width of the Properties window, minus the width of the label, minus another 11px for the scroll bar
				this.property_values[i].style.width = (parseInt(this.properties_div_header.style.width) - Math.floor(parseInt(this.properties_div_header.style.width) / 2.2) - 11) + "px";
				this.property_values[i].style.height = "17px";

				this.property_values[i].style.backgroundColor = "#252526";
				this.property_values[i].style.color = "#d0d0d0";

				this.property_values[i].style.fontFamily = "ABeeZee";
				this.property_values[i].style.fontSize = "12px";

				this.property_values[i].style.paddingLeft = "3px";
				this.property_values[i].style.paddingTop = "2px";

				this.property_values[i].style.borderStyle = "solid";
				this.property_values[i].style.borderWidth = "thin";		
				this.property_values[i].style.borderColor = "#404040";

				// the current value of the property, if any, is added as the current value for the element
				this.property_values[i].value = objects[index].properties[i].value;

				this.properties_div_list.appendChild(this.property_values[i]);

				// For elements with a Text property, the value is generally visible within the element itself on the form. This means that every time
				// the property is updated, that has to be reflected on the form. This event handles that situation.
				this.property_values[i].onkeyup = function()
				{
					// retrieve the label div from the DOM by replacing the word "value" in this element id with "property" - then retrieve the text from the element
					var property_name = document.getElementById(this.id.replace("value", "property")).innerHTML;

					// if the property name is "Text", proceed
					if (property_name == "Text")
					{
						// retrieve the object index from the first section of the id of this element
						var obj_index = this.id.substring(0, this.id.indexOf("_"));

						// retrieve the property index from the last section of the id of this element
						var property_index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

						// set the value of the property to the value the user has entered in the Properties window
						objects[obj_index].properties[property_index].value = this.value;
						
						// retrieve the element itself from the DOM
						var element = document.getElementById(objects[obj_index].name);

						// if the element is a label, proceed
						if (objects[obj_index].type == "label")
						{
							// if there is no value in the element's Image property, set the text inside the div to be the value of the Text property
							if (get_property(obj_index, "Image").value == "")
								element.innerHTML = this.value;

							// otherwise, add the image to the element, followed by the text in the Text property
							else
								element.innerHTML = "<img src = \"" + get_property(obj_index, "Image").value + "\">" + this.value;
						}

						// if the element is a textbox, set the value of the textbox to be the value of the Text property
						if (objects[obj_index].type == "textbox")
							element.value = this.value;
					}
				}

				// when a value textbox loses focus, the property value is updated in the objects array, and the element's _draw function is called
				this.property_values[i].onblur = function()
				{
					// retrieve the object and property indexes from the element id
					var obj_index = this.id.substring(0, this.id.indexOf("_"));
					var property_index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

					// update the value of the property in the objects array
					objects[obj_index].properties[property_index].value = this.value;

					// call the _draw function for the element
					draw_element(obj_index);

					// here the focus is set to the next property in the Properties window - this function works in tandem with the window keydown function
					if (focus_element != null)
					{
						// set the focus to the next property in the Properties window
						document.getElementById(obj_index + "_value_" + (parseInt(property_index) + 1)).focus();

						// clear the variable that is set in the window keydown function
						focus_element = null;
					}
				}
			}

			// select properties are selected from a list of options in a dropdown list
			else if (objects[index].properties[i].type == "select")
			{
				// the property value element is a select box
				this.property_values[i] = document.createElement("select");

				// the id for this element combines the index of the object with the index of this specific property
				this.property_values[i].id = index + "_value_" + i;
				this.property_values[i].style.position = "absolute";

				this.property_values[i].style.top = (20 * i) + "px";

				// the element appears just to the right of the label created above
				this.property_values[i].style.left = Math.floor(parseInt(this.properties_div_header.style.width) / 2.2) + "px";

				// the width is equal to the width of the Properties window, minus the width of the label, minus another 11px for the scroll bar
				this.property_values[i].style.width = (parseInt(this.properties_div_header.style.width) - Math.floor(parseInt(this.properties_div_header.style.width) / 2.2) - 7) + "px";
				this.property_values[i].style.height = "21px";

				this.property_values[i].style.backgroundColor = "#252526";
				this.property_values[i].style.color = "#d0d0d0";

				this.property_values[i].style.fontFamily = "ABeeZee";
				this.property_values[i].style.fontSize = "12px";

				this.property_values[i].style.borderStyle = "solid";
				this.property_values[i].style.borderWidth = "thin";		
				this.property_values[i].style.borderColor = "#404040";

				// the options are stored (string, separated by commas) in the object's properties array - they were added when the property was created
				var options = objects[index].properties[i].options.split(",");

				// cycle through all the options in the array
				for (var j = 0; j < options.length; j++)
				{
					// create an option element with the option text as value
					var option = document.createElement("option");
					option.text = options[j];

					// add this option to the property value dropdown box
					this.property_values[i].add(option);
				}

				// the current value of the property, if any, is added as the current value for the element
				this.property_values[i].value = objects[index].properties[i].value;

				this.properties_div_list.appendChild(this.property_values[i]);

				// when the option box value is changed by the user, update the object array and element
				this.property_values[i].onchange = function()
				{
					// retrieve the object and property indexes from the element id
					var obj_index = this.id.substring(0, this.id.indexOf("_"));
					var property_index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

					// update the value of the property in the objects array
					objects[obj_index].properties[property_index].value = this.value;

					// call the _draw function for the element
					draw_element(obj_index);
				}

				// when a value textbox loses focus, the property value is updated in the objects array, and the element's _draw function is called
				this.property_values[i].onblur = function()
				{
					// retrieve the object and property indexes from the element id
					var obj_index = this.id.substring(0, this.id.indexOf("_"));
					var property_index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

					// update the value of the property in the objects array
					objects[obj_index].properties[property_index].value = this.value;

					// call the _draw function for the element
					draw_element(obj_index);

					// here the focus is set to the next property in the Properties window - this function works in tandem with the window keydown function
					if (focus_element != null)
					{
						// set the focus to the next property in the Properties window
						document.getElementById(obj_index + "_value_" + (parseInt(property_index) + 1)).focus();

						// clear the variable that is set in the window keydown function
						focus_element = null;
					}
				}
			}

			// file and file_mult properties require the user to select a file or files from a dialog box, or to type in the file name(s) directly
			else if (objects[index].properties[i].type == "file" || objects[index].properties[i].type == "file_mult")
			{
				// the value element is still a textbox that can be edited manually, but it is assumed that most users will call the dialog box to fill this
				this.property_values[i] = document.createElement("input");

				// the id for this element combines the index of the object with the index of this specific property
				this.property_values[i].id = index + "_value_" + i;
				this.property_values[i].style.position = "absolute";

				this.property_values[i].style.top = (20 * i) + "px";

				// the element appears just to the right of the label created above
				this.property_values[i].style.left = Math.floor(parseInt(this.properties_div_header.style.width) / 2.2) + "px";

				// the width is equal to the width of the Properties window, minus the width of the label, minus more space for the file button and scrollbar
				this.property_values[i].style.width = (parseInt(this.properties_div_header.style.width) - Math.floor(parseInt(this.properties_div_header.style.width) / 2.2) - 28) + "px";
				this.property_values[i].style.height = "17px";

				this.property_values[i].style.backgroundColor = "#252526";
				this.property_values[i].style.color = "#d0d0d0";

				this.property_values[i].style.fontFamily = "ABeeZee";
				this.property_values[i].style.fontSize = "12px";

				this.property_values[i].style.paddingLeft = "3px";
				this.property_values[i].style.paddingTop = "2px";

				this.property_values[i].style.borderStyle = "solid";
				this.property_values[i].style.borderWidth = "thin";		
				this.property_values[i].style.borderColor = "#404040";

				// the current value of the property, if any, is added as the current value for the element
				this.property_values[i].value = objects[index].properties[i].value;

				this.properties_div_list.appendChild(this.property_values[i]);

				// when a value textbox loses focus, the property value is updated in the objects array, and the element's _draw function is called
				this.property_values[i].onblur = function()
				{
					// retrieve the object and property indexes from the element id
					var obj_index = this.id.substring(0, this.id.indexOf("_"));
					var property_index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

					// update the value of the property in the objects array
					objects[obj_index].properties[property_index].value = this.value;

					// call the _draw function for the element
					draw_element(obj_index);

					// here the focus is set to the next property in the Properties window - this function works in tandem with the window keydown function
					if (focus_element != null)
					{
						// set the focus to the next property in the Properties window
						document.getElementById(obj_index + "_value_" + (parseInt(property_index) + 1)).focus();

						// clear the variable that is set in the window keydown function
						focus_element = null;
					}
				}

				// a button is created to the right of the value box that opens a file dialog box when clicked
				this.property_files[i] = document.createElement("button");
				this.property_files[i].id = index + "_file_" + i;
				this.property_files[i].style.position = "absolute";

				this.property_files[i].style.top = ((20 * i) + 1) + "px";

				// position is just to the right of the value box
				this.property_files[i].style.left = (parseInt(this.properties_div_header.style.width) - 29) + "px";

				this.property_files[i].style.width = "21px";
				this.property_files[i].style.height = "19px";

				this.property_files[i].style.fontFamily = "ABeeZee";
				this.property_files[i].style.fontSize = "6px";

				// the usual kind of button text for this sort of thing
				this.property_files[i].innerHTML = "...";

				this.properties_div_list.appendChild(this.property_files[i]);

				// if the button is clicked, open the load file dialog box
				this.property_files[i].addEventListener("click", function (index, property_index)
				{
					return function(evt)
					{
						// set the open_type variable so that the chooseFile function will know that this is for a property
						open_type = "property";

						// set the global object and property index variables, used in chooseFile
						file_object_index = index;
						file_property_index = property_index;

						// set the working directory for the dialog box to the project folder
						document.getElementById("loadDialog").nwworkingdir = project_folder;

						// set the file extension provided by the property (usually ".*")
						document.getElementById("loadDialog").accept = objects[index].properties[property_index].ext;

						// if the property accepts multiple files (i.e. is of "file_mult" type), set the related property to true
						if (objects[index].properties[property_index].type == "file_mult")
							document.getElementById("loadDialog").multiple = true;
						else
							document.getElementById("loadDialog").multiple = false;

						// run the chooseFile function, which opens the dialog box
	    				chooseFile("#loadDialog");
					}
				} (index, i), false);
			}

			// the color property allows the user to open up a palette dialog box to select a color, or to type one in directly
			if (objects[index].properties[i].type == "color")
			{
				// a color may be typed directly into the values input box
				this.property_values[i] = document.createElement("input");

				// the id for this element combines the index of the object with the index of this specific property
				this.property_values[i].id = index + "_value_" + i;
				this.property_values[i].style.position = "absolute";

				this.property_values[i].style.top = (20 * i) + "px";

				// the element appears just to the right of the label created above
				this.property_values[i].style.left = Math.floor(parseInt(this.properties_div_header.style.width) / 2.2) + "px";

				// the width is equal to the width of the Properties window, minus the width of the label, minus more space for the palette button and scrollbar
				this.property_values[i].style.width = (parseInt(this.properties_div_header.style.width) - Math.floor(parseInt(this.properties_div_header.style.width) / 2.2) - 58) + "px";
				this.property_values[i].style.height = "17px";

				this.property_values[i].style.backgroundColor = "#252526";
				this.property_values[i].style.color = "#d0d0d0";

				this.property_values[i].style.fontFamily = "ABeeZee";
				this.property_values[i].style.fontSize = "12px";

				this.property_values[i].style.paddingLeft = "3px";
				this.property_values[i].style.paddingTop = "2px";

				this.property_values[i].style.borderStyle = "solid";
				this.property_values[i].style.borderWidth = "thin";		
				this.property_values[i].style.borderColor = "#404040";

				// the current value of the property, if any, is added as the current value for the element
				this.property_values[i].value = objects[index].properties[i].value;

				this.properties_div_list.appendChild(this.property_values[i]);

				// when a value textbox loses focus, the property value is updated in the objects array, and the element's _draw function is called
				this.property_values[i].onblur = function()
				{
					// retrieve the object and property indexes from the element id
					var obj_index = this.id.substring(0, this.id.indexOf("_"));
					var property_index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

					// update the value of the property in the objects array
					objects[obj_index].properties[property_index].value = this.value;

					// call the _draw function for the element
					draw_element(obj_index);

					// here the focus is set to the next property in the Properties window - this function works in tandem with the window keydown function
					if (focus_element != null)
					{
						// set the focus to the next property in the Properties window
						document.getElementById(obj_index + "_value_" + (parseInt(property_index) + 1)).focus();

						// clear the variable that is set in the window keydown function
						focus_element = null;
					}
				}

				// now the palette dialog box input element is created to the right of the values box, using the property_files array
				this.property_files[i] = document.createElement("input");

				// "color" is a special type of input box that opens up a palette dialog box
				this.property_files[i].type = "color";
				this.property_files[i].id = index + "_color_" + i;
				this.property_files[i].style.position = "absolute";

				this.property_files[i].style.top = ((20 * i) + 1) + "px";

				// position is just to the right of the value box
				this.property_files[i].style.left = (parseInt(this.properties_div_header.style.width) - 58) + "px";

				// width is determined by the NW.js renderer
				this.property_files[i].style.height = "19px";

				// if the current value of the property is in hex form (starting with a '#'), then set the color element to the same color
				if (objects[index].properties[i].value.length > 0 && objects[index].properties[i].value.substring(0, 1) == "#")
					this.property_files[i].value = objects[index].properties[i].value;

				this.properties_div_list.appendChild(this.property_files[i]);

				// when a value is selected from the palette dialog box, update the object and property - note that the object and property indexes are passed as parameters
				this.property_files[i].addEventListener("change", function (index, property_index)
				{
					return function(evt)
					{
						// obtain the id of the value box by replacing the word 'color' with 'value' in this element id
						var property_text = this.id.replace("color", "value");

						// set the value box to have the value selected by the user from the palette
						document.getElementById(property_text).value = this.value;

						// update the object properties array
						set_property(index, objects[index].properties[property_index].name, this.value);

						// call the _draw function for the object/element
						draw_element(index);
					}
				} (index, i), false);
			}

			// the header is a special type of property that is just header text
			else if (objects[index].properties[i].type == "header")
			{
				// extend the width of the property label div to span the Properties window, and change the background color
				this.property_items[i].style.width = (parseInt(this.properties_div_header.style.width) - 12) + "px";
				this.property_items[i].style.backgroundColor = "#404040";

				// display the header text - i.e. the name of the property - in bold type
				this.property_items[i].innerHTML = "<b>" + objects[index].properties[i].name + "</b>";
			}
		}
	}

	// the resize function for the Properties window
	this.select_resize = function(quant, side)
	{
		if (side == "bottom")
		{
			main_properties.properties_div.style.height = (parseInt(main_properties.properties_div.style.height) + quant) + "px";
			main_properties.properties_list_container.style.height = (parseInt(main_properties.properties_list_container.style.height) + quant) + "px";

			//main_properties.properties_div_header.style.width = (parseInt(main_properties.properties_div_header.style.width) - quant) + "px";
			//main_properties.properties_div_list.style.width = (parseInt(main_properties.properties_div_list.style.width) - quant) + "px";
		}
	}
}

// The object that creates the project Explorer window - data is a JSON object that accepts the following parameters:
// data is a JSON objects that accepts the following parameters:
// "id" - the name of the window
// "x", "y" - the x/y position of the window, in pixels
// "width", "height" - the width and height of the window, in pixels
// "background" - the background color of the window
// "background-header" - the background color of the header
// "div" - the div that contains the window - this is used when resizing it

function explore(data)
{
	// store the width and height as object attributes
	this.width = data.width;
	this.height = data.height;

	// create main div for explorer using supplied data
	this.explore_div = document.createElement("div");
	this.explore_div.id = data.id;
	this.explore_div.style.position = "absolute";

	// in Digero, the Explorer window is displayed in the bottom-right corner of the application
	this.explore_div.style.top = data.y + "px";
	this.explore_div.style.left = data.x + "px";

	this.explore_div.style.width = data.width + "px";
	this.explore_div.style.height = data.height + "px";

	this.explore_div.style.backgroundColor = data.background;

	// add Explorer box to the specified div
	data.div.appendChild(this.explore_div);

	// create main div header for Explorer window using supplied data
	this.explore_div_header = document.createElement("div");
	this.explore_div_header.id = data.id + "header";
	this.explore_div_header.style.position = "absolute";

	this.explore_div_header.style.top = "0px";
	this.explore_div_header.style.left = "0px";

	// decrease the width by 3px because of the 3px padding
	this.explore_div_header.style.width = (data.width - 3) + "px";
	this.explore_div_header.style.height = "17px";

	// header background color is supplied
	this.explore_div_header.style.backgroundColor = data.background_header;
	this.explore_div_header.style.color = "#ffffff";

	this.explore_div_header.style.fontFamily = "ABeeZee";
	this.explore_div_header.style.fontSize = "12px";

	// padding so the text isn't right up against the top-left corner
	this.explore_div_header.style.paddingLeft = "3px";
	this.explore_div_header.style.paddingTop = "3px";

	// text labelling the Explorer window
	this.explore_div_header.innerHTML = "Explorer";

	// add div to main Explorer div
	this.explore_div.appendChild(this.explore_div_header);

	// this is the div that will contain the project tree
	this.explore_container = document.createElement("div");
	this.explore_container.id = data.id + "container";
	this.explore_container.style.position = "absolute";

	// located below the window header
	this.explore_container.style.top = "20px";
	this.explore_container.style.left = "0px";

	this.explore_container.style.width = data.width + "px";
	this.explore_container.style.height = (data.height - 20) + "px";

	// it can scroll vertically, for large projects
	this.explore_container.style.overflowY = "scroll";
	this.explore_container.style.overflowX = "hidden";

	this.explore_div.appendChild(this.explore_container);

	// The go_project function is called whenever the project tree needs to be recreated - this will happen whenever a project is
	// loaded into Digero, and whenever a new form, code file, or data table is created. The function removes the previous tree
	// entirely and starts over every time - it moves quickly, so this does not appear to be an issue in terms of lag. Note also
	// the the function calls an external function "add_arrow" to create the DOM elements for each entry.
	this.go_project = function(index)
	{
		// the project_explore array is built as the tree is built, to contain data about each element
		project_explore.length = 0;

		// the existing project tree container is removed
		this.explore_div.removeChild(this.explore_container);
		
		// the project tree container is then recreated, though it will now (for the moment) be empty
		this.explore_container = document.createElement("div");
		this.explore_container.id = data.id + "container";
		this.explore_container.style.position = "absolute";

		this.explore_container.style.top = "20px";
		this.explore_container.style.left = "0px";

		// match the proportions of the Explorer window itself (minus the header height)
		this.explore_container.style.width = this.explore_div.style.width;
		this.explore_container.style.height = (parseInt(this.explore_div.style.height) - 20) + "px";

		this.explore_container.style.overflowY = "scroll";
		this.explore_container.style.overflowX = "hidden";

		this.explore_div.appendChild(this.explore_container);

		// the highlight div highlight element of the tree the the user selects - it defaults to the top of the container
		this.explore_highlight = document.createElement("div");
		this.explore_highlight.id = data.id + "highlight";
		this.explore_highlight.style.position = "absolute";

		this.explore_highlight.style.top = "0px";
		this.explore_highlight.style.left = "0px";

		// same width as the container
		this.explore_highlight.style.width = this.explore_div.style.width;

		// the height spans one "line" in the tree at a time
		this.explore_highlight.style.height = "20px";

		this.explore_highlight.style.backgroundColor = "#3f3f46";

		// the highlight will appear behind the text and graphics of the tree nodes, so as not to cover them up
		this.explore_highlight.style.zIndex = 10;

		this.explore_container.appendChild(this.explore_highlight);

		// the first node in the project tree is the name of the project itself, or "Project" is none has been created
		if (project_data.name == undefined)
			var this_name = "Project";
		else
			var this_name = project_data.name;

		// a 5px margin appears above and below this node
		var arrow_x = 5;
		var arrow_y = 5;

		// create the first node in the project_explore array, which stores data about the project tree
		project_explore[0] = {};

		// use the name of the project determined above
		project_explore[0].name = this_name;

		// type is "project" - this is the only node of this type in every project
		project_explore[0].type = "project";

		project_explore[0].level = 0;
		project_explore[0].index = 0;

		// all newly-created nodes are open by default, meaning that sub-nodes are visible
		project_explore[0].open = true;

		// shift indicates the y value to shift from a node's usual position - important when opening and closing nodes
		project_explore[0].shift = 0;

		// call the add_arrow function to create this node in the Explorer window
		add_arrow(arrow_x, arrow_y, this_name, 0, true);

		// arrow_index tracks what index to use in the project_explore array going forward
		var arrow_index = 0

		// now populate the tree with the remaining nodes
		if (this_name != undefined)
		{
			// set the arrow index to 1
			arrow_index++;

			// this is the x/y position of the first sub-node in the tree - this is the x/y of the Project node incremented by 15px
			arrow_x = 20;
			arrow_y += 20;

			// create the Forms node, which will contains all project forms, as well as the code pages for each form
			project_explore[arrow_index] = {};
			project_explore[arrow_index].name = "Forms";
			project_explore[arrow_index].type = "forms";

			// level is one level more than the Project node
			project_explore[arrow_index].level = 1;
			project_explore[arrow_index].index = arrow_index;

			// all newly-created nodes are open by default, meaning that sub-nodes are visible
			project_explore[arrow_index].open = true;

			// shift indicates the y value to shift from a node's usual position - important when opening and closing nodes
			project_explore[arrow_index].shift = 0;

			// call the add_arrow function to create this node in the Explorer window
			add_arrow(arrow_x, arrow_y, "Forms", arrow_index, true);

			// now cycle through the objects array, looking for forms
	  		for (var i = 0; i < objects.length; i++)
			{
				// if the type is "form", proceed
				if (objects[i].type == "form")
				{
					// increment the arrow_index index value
					arrow_index++;

					// all forms in the tree are at 35px - 15px more than the Forms x value
					arrow_x = 35;

					// add 20px to y for each new node
					arrow_y += 20;

					// create the node for the form, using the name of the form as the node name
					project_explore[arrow_index] = {};
					project_explore[arrow_index].name = objects[i].name;
					project_explore[arrow_index].type = "form";

					// all forms are at level 2 in the tree
					project_explore[arrow_index].level = 2;
					project_explore[arrow_index].index = arrow_index;

					// all newly-created nodes are open by default, meaning that sub-nodes are visible
					project_explore[arrow_index].open = true;

					// shift indicates the y value to shift from a node's usual position - important when opening and closing nodes
					project_explore[arrow_index].shift = 0;

					// call the add_arrow function to create this node in the Explorer window
					add_arrow(arrow_x, arrow_y, objects[i].name, arrow_index, true);

					// increment the arrow_index value for the form's code file
					arrow_index++;

					// form code nodes are all at 50px x value
					arrow_x = 50;

					// add 20px to y for each new node
					arrow_y += 20;

					// create the node form the form code file, using the file name ([form name] + ".js") at the node name
					project_explore[arrow_index] = {};
					project_explore[arrow_index].name = objects[i].name + ".js";
					project_explore[arrow_index].type = "code";

					// all form code files are at level 3 in the tree
					project_explore[arrow_index].level = 3;
					project_explore[arrow_index].index = arrow_index;

					// all newly-created nodes are open by default, meaning that sub-nodes are visible
					project_explore[arrow_index].open = true;

					// shift indicates the y value to shift from a node's usual position - important when opening and closing nodes
					project_explore[arrow_index].shift = 0;

					// call the add_arrow function to create this node in the Explorer window
					add_arrow(arrow_x, arrow_y, objects[i].name + ".js", arrow_index, false);
				}
			}

			// increment the arrow_index to create the "Code" node
			arrow_index++;

			// the "Code" label node is at the same x as the "Forms" label
			arrow_x = 20;
			arrow_y += 20;

			// create the Code node, which will contains all code files that are not attached to forms
			project_explore[arrow_index] = {};
			project_explore[arrow_index].name = "Code";
			project_explore[arrow_index].type = "codes";

			// level is one level more than the Project node
			project_explore[arrow_index].level = 1;
			project_explore[arrow_index].index = arrow_index;

			// all newly-created nodes are open by default, meaning that sub-nodes are visible
			project_explore[arrow_index].open = true;

			// shift indicates the y value to shift from a node's usual position - important when opening and closing nodes
			project_explore[arrow_index].shift = 0;

			// call the add_arrow function to create this node in the Explorer window
			add_arrow(arrow_x, arrow_y, "Code", arrow_index, true);

			// if there are existing code files, proceed
			if (project_data.codes != undefined && project_data.codes != "")
			{
				// the names of code files are stored in the codes attribute of project_data, separated by commas
	  			var codes = project_data.codes.split(";");

	  			// cycle through each code file in the newly-created array
	  			for (var i = 0; i < codes.length; i++)
	  			{
	  				// increment the arrow index
					arrow_index++;

					// all code files (apart from those linked to forms) in the tree are at 35px - 15px more than the Codes x value
					arrow_x = 35;

					// add 20px to y for each new node
					arrow_y += 20;

					// create the node for the form code file, using the file name ([form name] + ".js") at the node name
					project_explore[arrow_index] = {};
					project_explore[arrow_index].name = codes[i];
					project_explore[arrow_index].type = "code";

					// all code files are at level 2 in the tree
					project_explore[arrow_index].level = 2;
					project_explore[arrow_index].index = arrow_index;

					// all newly-created nodes are open by default, meaning that sub-nodes are visible
					project_explore[arrow_index].open = true;

					// shift indicates the y value to shift from a node's usual position - important when opening and closing nodes
					project_explore[arrow_index].shift = 0;

					// call the add_arrow function to create this node in the Explorer window
					add_arrow(arrow_x, arrow_y, codes[i], arrow_index, false);
				}
			}

			// increment the arrow_index to create the "Data" node
			arrow_index++;

			// the "Data" label node is at the same x as the "Forms" label
			arrow_x = 20;
			arrow_y += 20;

			// create the Data node, which contains all data tables
			project_explore[arrow_index] = {};
			project_explore[arrow_index].name = "Data";
			project_explore[arrow_index].type = "datas";

			// level is one level more than the Project node
			project_explore[arrow_index].level = 1;
			project_explore[arrow_index].index = arrow_index;

			// all newly-created nodes are open by default, meaning that sub-nodes are visible
			project_explore[arrow_index].open = true;

			// shift indicates the y value to shift from a node's usual position - important when opening and closing nodes
			project_explore[arrow_index].shift = 0;

			// call the add_arrow function to create this node in the Explorer window
			add_arrow(arrow_x, arrow_y, "Data", arrow_index, true);

			// cycle through all the data tables contained in the project_data object's tables array
  			for (var i = 0; i < project_data.tables.length; i++)
  			{
	  			// increment the arrow index
				arrow_index++;

				// all data tables in the tree are at 35px - 15px more than the Data x value
				arrow_x = 35;

				// add 20px to y for each new node
				arrow_y += 20;

				// create the node for the data table, using its name as the node name
				project_explore[arrow_index] = {};
				project_explore[arrow_index].name = project_data.tables[i].name;
				project_explore[arrow_index].type = "data";

				// all data tables are at level 2 in the tree
				project_explore[arrow_index].level = 2;
				project_explore[arrow_index].index = arrow_index;

				// all newly-created nodes are open by default, meaning that sub-nodes are visible
				project_explore[arrow_index].open = true;

				// shift indicates the y value to shift from a node's usual position - important when opening and closing nodes
				project_explore[arrow_index].shift = 0;

				// call the add_arrow function to create this node in the Explorer window
				add_arrow(arrow_x, arrow_y, project_data.tables[i].name, arrow_index, false);
			}

		}
	}

	// the resize function for the Explorer window
	this.select_resize = function(quant, side)
	{
		if (side == "top")
		{
			main_explore.explore_div.style.top = (parseInt(main_explore.explore_div.style.top) + quant) + "px";
			main_explore.explore_div.style.height = (parseInt(main_explore.explore_div.style.height) - quant) + "px";
			//main_explore.explore_list_container.style.height = (parseInt(main_explore.explore_list_container.style.height) - quant) + "px";

			//main_explore.explore_div_header.style.width = (parseInt(main_explore.explore_div_header.style.width) - quant) + "px";
			//main_explore.explore_div_list.style.width = (parseInt(main_explore.explore_div_list.style.width) - quant) + "px";
		}
	}
}

// this function creates all the DOM elements for each node in the project Explorer window
add_arrow = function(x, y, name, index, arrow_add)
{
	// the first element created is the actual arrow image, if it to be drawn (indicated in the arrow_add parameter)
	project_explore[index].arrow = document.createElement("img");

	// name is keyed to the index value passed as a parameter
	project_explore[index].arrow.id = "explore_arrow_" + index;
	project_explore[index].arrow.style.position = "absolute";

	// position is the x/y provided as parameters
	project_explore[index].arrow.style.top = y + "px";
	project_explore[index].arrow.style.left = x + "px";

	// z index is higher than the hightlight div
	project_explore[index].arrow.style.zIndex = 20;

	// if arrow_add is set to true, draw the arrow image, otherwise do not provide a src
	if (arrow_add == true)
		project_explore[index].arrow.src = "img/explore_select.png";
	else
		project_explore[index].arrow.src = "";

	// element is added to the Explorer window
	main_explore.explore_container.appendChild(project_explore[index].arrow);

	// the arrow div contains the icon for each node, as well as the node label
	project_explore[index].arrow_div = document.createElement("div");

	// name is keyed to the index value passed as a parameter
	project_explore[index].arrow_div.id = "explore_div_" + index;
	project_explore[index].arrow_div.style.position = "absolute";

	// position is slightly to the right and above the provided x/y
	project_explore[index].arrow_div.style.top = (y - 2) + "px";
	project_explore[index].arrow_div.style.left = (x + 12) + "px";

	project_explore[index].arrow_div.style.height = "15px";
	project_explore[index].arrow_div.style.width = "150px";

	// z index is higher than the hightlight div
	project_explore[index].arrow_div.style.zIndex = 20;

	main_explore.explore_container.appendChild(project_explore[index].arrow_div);

	// create the image element that contains the node icon
	arrow_image = document.createElement("img");
	arrow_image.id = "image_" + x + "_" + y + "_" + name;
	arrow_image.style.position = "absolute";

	// positioned within the above div
	arrow_image.style.top = "2px";
	arrow_image.style.left = "3px";

	// image src is derived from the type indicated in the project_explore array
	arrow_image.src = "img/" + project_explore[index].type + ".png";

	// add the image to the arrow div, created above
	project_explore[index].arrow_div.appendChild(arrow_image);

	// create the div that contains that name label of the node
	arrow_name = document.createElement("div");
	arrow_name.id = "name_" + x + "_" + y + "_" + name;
	arrow_name.style.position = "absolute";

	// positioned within the arrow div, created above
	arrow_name.style.top = "1px";
	arrow_name.style.left = "21px";

	arrow_name.style.color = "#ffffff";
	arrow_name.style.fontFamily = "Varta";
	arrow_name.style.fontSize = "13px";

	// use the provided name for the label
	arrow_name.innerHTML = name;

	// add the image to the arrow div, created above
	project_explore[index].arrow_div.appendChild(arrow_name);

	// when arrow images are clicked, they expand or collapse the nodes that are "contained" within them - note that index is passed as a parameter
	project_explore[index].arrow.addEventListener("click", function (index)
	{
		return function(evt)
		{
			// only perform these functions is there is an actual arrow image - i.e. the node has sub-nodes
			if (this.src != "")
			{
				// if the arrow for this node is open, then it will be collapsed
				if (project_explore[index].open == true)
				{
					// move the highlight to this node
					main_explore.explore_highlight.style.top = (index * 20) + "px";

					// set the open attribute to false in the project_explore array
					project_explore[index].open = false;

					// change the arrow image to point to the right instead of down
					project_explore[index].arrow.src = "img/explore.png";

					// the shift_index variable will indicate how far up to shift the nodes below this one
					var shift_index = 0;

					// cycle through the nodes that come after this node
					for (var i = index + 1; i < project_explore.length; i++)
					{
						// if you reach a node that is at the same level or lower than the original node, exit the loop
						if (project_explore[i].level <= project_explore[index].level)
							break;
						else
						{
							// otherwise, hide the DOM elements of the node
							project_explore[i].arrow.style.visibility = "hidden";
							project_explore[i].arrow_div.style.visibility = "hidden";

							// increase the shift index to indicate that all nodes below should be moved this much higher
							shift_index -= 20;
						}
					}

					// cycle through all the nodes starting with the node that caused the break in the above loop
					for (var j = i; j < project_explore.length; j++)
					{
						// move the node divs up by the amount specified in the shift_index variable
						project_explore[j].arrow.style.top = (parseInt(project_explore[j].arrow.style.top) + shift_index) + "px";
						project_explore[j].arrow_div.style.top = (parseInt(project_explore[j].arrow_div.style.top) + shift_index) + "px";

						// set the shift attribute for this node to be equal to shift_index
						project_explore[j].shift += shift_index;
					}
				}

				// otherwise, if the node is closed, it will be opened up
				else
				{
					// set the open attribute to true in the project_explore array
					project_explore[index].open = true;

					// change the arrow image to point down instead of right
					project_explore[index].arrow.src = "img/explore_select.png";

					// cycle through all of the nodes that come after this node
					for (var i = index + 1; i < project_explore.length; i++)
					{
						// make the DOM elements of the node visible
						project_explore[i].arrow.style.visibility = "visible";
						project_explore[i].arrow_div.style.visibility = "visible";

						// if the node has been shifted, move it back down as far as it was moved up
						if (project_explore[i].shift < 0)
						{
							// move the DOM elements for this node the amount indicated in the shift attribute
							project_explore[i].arrow.style.top = (parseInt(project_explore[i].arrow.style.top) - project_explore[i].shift) + "px";
							project_explore[i].arrow_div.style.top = (parseInt(project_explore[i].arrow_div.style.top) - project_explore[i].shift) + "px";

							// clear the shift attribute value
							project_explore[i].shift = 0;
						}
					}
				}
			}
		}
	} (index), false);

	// when a node is double-clicked the tab for that node in the formspace (if any) is displayed - note that the node index is passed as a parameter
	project_explore[index].arrow_div.addEventListener("dblclick", function (index)
	{
		return function(evt)
		{
			// move the highlight to the node that was selected
			main_explore.explore_highlight.style.top = (index * 20) + "px";

			// cycle through all of the tabs in the formspace
			for (i = 0; i < main_formspace.tab_names.length; i++)
			{
				// if the tab name is the same as the name of the node that was selected, proceed
				if (project_explore[index].name == main_formspace.tab_names[i].innerHTML)
				{
					// set the formspace to focus on this tab
					main_formspace.set_tab_focus(i);

					// if the tab type is a form, proceed
					if (project_explore[index].type == "form")
					{
						// set the outline div to focus on the form
						if (main_formspace.form_num[i] != -1)
							main_formspace.set_outline_focus(main_formspace.tab_names[i].innerHTML);
						
						// set the current_form variable to point to this tab
						current_form = i;
					}

					// Here the tab in the tabspace is shifted into view - when there are multiple tabs in the tabspace, it may not be currently visible

					// retrieve the current x position of the tabspace
					var tab_left = parseInt(main_formspace.tabspace_div.style.left);

					// retrieve the width of the tabspace container
					var tab_width = parseInt(main_formspace.tabspace_container.style.width);

					// retrieve the x position of the selected tab itself
					var tab_select = parseInt(main_formspace.tab_names[main_formspace.tab_focus_index].style.left);

					// if the x position of the tab is to the right of the right edge of the tabspace container, proceed
					if (tab_select + main_formspace.tab_name_width > tab_width - tab_left)
						// shift the tabspace left until the tab is visible
						main_formspace.tabspace_div.style.left = parseInt(main_formspace.tabspace_div.style.left) - ((tab_select + main_formspace.tab_name_width) - (tab_width - tab_left)) + "px";

					// if the x position of the tab is to the left of the left edge of the tabspace, proceed
					else if (tab_left + tab_select < 0)
						// shift the tabspace right until the tab is fully visible
						main_formspace.tabspace_div.style.left = parseInt(main_formspace.tabspace_div.style.left) + Math.abs(tab_left + tab_select) + "px";
				}
			}
		}
	} (index), false);
}

// The object that creates the toolbar object - data is a JSON object that accepts the following parameters:
// data is a JSON objects that accepts the following parameters:
// "id" - the name of the toolbar
// "top" - the y position of the toolbar, in pixels
// "height" - the height of the toolbar, in pixels
// "background" - the background color of the toolbar
// "backgroundHover" - the background color of a button when the mouse hovers over it
// "backgroundClick" - the background color of a button when it is clicked

function toolbar(data)
{
	// store the id of the toolbar from the parameter value
	this.id = data.id;

	// the width of the toolbar is always the width of the window
	this.width = window.innerWidth;

	// store the height from the parameter value
	this.height = data.height;

	this.item_width = 28;
	this.break_width = 2;

	// store other parameter values
	this.backgroundColor = data.background;
	this.backgroundHover = data.backgroundHover;
	this.backgroundClick = data.backgroundClick;

	// arrays for the DOM elements for each toolbar button
	this.tool_items = new Array();
	this.tool_images = new Array();

	// create main div for properties using supplied data
	this.toolbar_div = document.createElement("div");
	this.toolbar_div.id = data.id;
	this.toolbar_div.style.position = "absolute";

	this.toolbar_div.style.top = data.top + "px";
	this.toolbar_div.style.left = "0px";

	this.toolbar_div.style.width = window.innerWidth + "px";
	this.toolbar_div.style.height = data.height + "px";

	this.toolbar_div.style.backgroundColor = data.background;

	this.toolbar_div.style.fontFamily = "ABeeZee";
	this.toolbar_div.style.fontSize = "12px";

	// add div to application page
	document.body.appendChild(this.toolbar_div);

	this.add_item = function(name, image, fx)
	{
		var index = this.tool_items.length;

		var left = 0;
		for (var i = 0; i < this.tool_items.length; i++)
			left += parseInt(this.tool_items[i].div.style.width) + 6;

		this.tool_items[index] = {};
		this.tool_items[index].name = name;
		this.tool_items[index].subtool = new Array();
		this.tool_items[index].subsubtool = new Array();

		this.tool_items[index].div = document.createElement("div");
		this.tool_items[index].div.id = this.id + "_" + index;
		this.tool_items[index].div.style.position = "absolute";

		this.tool_items[index].div.style.top = Math.floor((this.height - this.item_width) / 2) + "px";
		this.tool_items[index].div.style.left = (left + 5) + "px";

		this.tool_items[index].div.style.width = this.item_width + "px";
		this.tool_items[index].div.style.height = this.item_width + "px";

		this.tool_items[index].div.style.backgroundColor = this.backgroundColor;

		this.tool_items[index].div.addEventListener("mouseover", function (this_toolbar, this_name)
		{
			return function(evt)
			{
				var index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);
				this.style.backgroundColor = this_toolbar.backgroundHover;

				tooltip.style.fontFamily = "Varta";
				tooltip.style.fontSize = "13px";
				tooltip.style.color = "#202020";
				tooltip.style.backgroundColor = "#f1f2f7";

				tooltip.innerHTML = this_name;
				tooltip_flag = 1;
				tooltip_id = setTimeout(move_tooltip, 500);
			}
		} (this, name), false);

		this.tool_items[index].div.addEventListener("mouseout", function (this_toolbar)
		{
			return function(evt)
			{
				this.style.backgroundColor = this_toolbar.backgroundColor;

				tooltip.style.left = "-1000px";
				tooltip_flag = 0;
				clearTimeout(tooltip_id);
			}
		} (this), false);

		this.tool_items[index].div.addEventListener("mousedown", function (this_toolbar, this_name)
		{
			return function(evt)
			{
				var index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);
				this.style.backgroundColor = this_toolbar.backgroundClick;
			}
		} (this, name), false);

		this.tool_items[index].div.addEventListener("mouseup", function (this_toolbar, this_name)
		{
			return function(evt)
			{
				var index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);
				this.style.backgroundColor = this_toolbar.backgroundHover;
			}
		} (this, name), false);

		this.tool_items[index].div.addEventListener("click", fx, false);

		this.toolbar_div.appendChild(this.tool_items[index].div);

		this.tool_images[index] = {};

		this.tool_images[index].div = document.createElement("img");
		this.tool_images[index].div.id = data.id + "_" + index + "_image";
		this.tool_images[index].div.style.position = "absolute";

		this.tool_images[index].div.style.top = "0px";
		this.tool_images[index].div.style.left = "0px";

		this.tool_images[index].div.src = image;

		this.tool_images[index].div.addEventListener("load", function (this_width)
		{
			return function(evt)
			{
				this.style.top = Math.floor((this_width - this.height) / 2) + "px";
				this.style.left = Math.floor((this_width - this.width) / 2) + "px";
			}
		} (parseInt(this.tool_items[index].div.style.width)), false);

		this.tool_items[index].div.appendChild(this.tool_images[index].div);
	}

	this.add_break = function(image)
	{
		var index = this.tool_items.length;

		var left = 0;
		for (var i = 0; i < this.tool_items.length; i++)
			left += parseInt(this.tool_items[i].div.style.width) + 6;

		this.tool_items[index] = {};
		this.tool_items[index].name = "break";

		this.tool_items[index].div = document.createElement("div");
		this.tool_items[index].div.id = this.id + "_" + index;
		this.tool_items[index].div.style.position = "absolute";

		this.tool_items[index].div.style.top = Math.floor((this.height - this.item_width) / 2) + "px";
		this.tool_items[index].div.style.left = (left + 5) + "px";

		this.tool_items[index].div.style.width = this.break_width + "px";
		this.tool_items[index].div.style.height = this.item_width + "px";

		this.toolbar_div.appendChild(this.tool_items[index].div);

		this.tool_images[index] = {};

		this.tool_images[index].div = document.createElement("img");
		this.tool_images[index].div.id = data.id + "_" + index + "_image";
		this.tool_images[index].div.style.position = "absolute";

		this.tool_images[index].div.style.top = "0px";
		this.tool_images[index].div.style.left = "0px";

		this.tool_images[index].div.src = image;

		this.tool_images[index].div.addEventListener("load", function (this_width, this_height)
		{
			return function(evt)
			{
				this.style.top = Math.floor((this_height - this.height) / 2) + "px";
				this.style.left = Math.floor((this_width - this.width) / 2) + "px";
			}
		} (parseInt(this.tool_items[index].div.style.width), parseInt(this.tool_items[index].div.style.height)), false);

		this.tool_items[index].div.appendChild(this.tool_images[index].div);
	}
}

function menubar(data)
{
	this.id = data.id;
	this.width = window.innerWidth;
	this.height = data.height;
	this.item_width = 150;
	this.backgroundColor = data.background;
	this.backgroundHover = data.backgroundHover;
	this.backgroundSub = data.backgroundSub;
	this.fontFamily = data.fontFamily;
	this.fontSize = data.fontSize;
	this.color = data.color;
	this.subsubID;

	if (data.letterGap == undefined)
		this.letterGap = 7.5;
	else
		this.letterGap = data.letterGap;

	this.menu_items = new Array();

	this.submenu_show = false;
	this.submenu_item = -1;
	this.submenu_div = null;

	this.submenu_divs = new Array();
	this.submenu_depths = new Array();

	this.submenu_items = new Array();
	this.submenu_shortcuts = new Array();

	// create main div for properties using supplied data
	this.menubar_div = document.createElement("div");
	this.menubar_div.id = data.id;
	this.menubar_div.style.position = "absolute";

	this.menubar_div.style.top = "0px";
	this.menubar_div.style.left = "0px";

	this.menubar_div.style.width = window.innerWidth + "px";
	this.menubar_div.style.height = data.height + "px";

	this.menubar_div.style.backgroundColor = data.background;

	this.menubar_div.style.fontFamily = "ABeeZee";
	this.menubar_div.style.fontSize = "12px";

	// add div to application page
	if (data.div == undefined)
		document.body.appendChild(this.menubar_div);
	else
		document.getElementById(data.div).appendChild(this.menubar_div);

	this.add_item = function(name)
	{
		var index = this.menu_items.length;

		var left = 0;
		for (var i = 0; i < this.menu_items.length; i++)
		{
			if (this.menu_items[i].text_open == false)
				left += parseInt(this.menu_items[i].div.style.width) + 9;
			else
				left += parseInt(this.menu_items[i].input.style.width) + 9;
		}

		this.menu_items[index] = {};
		this.menu_items[index].name = name;
		this.menu_items[index].submenu = new Array();
		this.menu_items[index].subsubmenu = new Array();

		this.menu_items[index].div = document.createElement("div");
		this.menu_items[index].div.id = this.id + "_" + index;
		this.menu_items[index].div.style.position = "absolute";

		this.menu_items[index].div.style.top = "6px";
		this.menu_items[index].div.style.left = (left + 5) + "px";

		this.menu_items[index].div.style.width = (name.length * this.letterGap) + "px";
		this.menu_items[index].div.style.height = (this.height - 10) + "px";

		this.menu_items[index].div.style.backgroundColor = this.backgroundColor;
		this.menu_items[index].div.style.color = this.color;

		this.menu_items[index].div.style.fontFamily = this.fontFamily;
		this.menu_items[index].div.style.fontSize = this.fontSize;

		this.menu_items[index].div.style.paddingLeft = "7px";
		this.menu_items[index].div.innerHTML = name;

		this.menu_items[index].text_open = false;

		this.menu_items[index].div.addEventListener("mouseover", function (this_menubar)
		{
			return function(evt)
			{
				var index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);
				this.style.backgroundColor = this_menubar.backgroundHover;

				if (this_menubar.submenu_show == true)
				{
					for (var i = 0; i < this_menubar.submenu_divs.length; i++)
						document.body.removeChild(this_menubar.submenu_divs[i]);

					this_menubar.submenu_divs.length = 0;
					this_menubar.submenu_item = index;

					this.style.backgroundColor = this_menubar.backgroundSub;
					this_menubar.add_submenu(index, null, parseInt(this.style.left), parseInt(this.style.top) + parseInt(this.style.height));
				}
			}
		} (this), false);

		this.menu_items[index].div.addEventListener("mouseout", function (this_menubar)
		{
			return function(evt)
			{
				this.style.backgroundColor = this_menubar.backgroundColor;
			}
		} (this), false);

		this.menu_items[index].div.addEventListener("mouseup", function (this_menubar)
		{
			return function(evt)
			{
				var index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

				if (this_menubar.submenu_show == false && menu_close == false)
				{
					this_menubar.submenu_show = true;
					this_menubar.submenu_item = index;
					this.style.backgroundColor = this_menubar.backgroundSub;

					this_menubar.add_submenu(index, null, parseInt(this.style.left), parseInt(this.style.top) + parseInt(this.style.height));
				}
				else if (this_menubar.submenu_show == false && menu_close == true)
				{
					menu_close = false;
				}
				else
				{
					this_menubar.submenu_show = false;
					document.body.removeChild(this_menubar.submenu_div);
					this_menubar.submenu_divs.length = 0;
					this_menubar.submenu_items.length = 0;
					menu_close = false;
				}
			}
		} (this), false);

		this.menubar_div.appendChild(this.menu_items[index].div);
	}

	this.add_subitem = function(item_name, sub_name, sub_keys, is_subsub, sub_fx)
	{
		for (var i = 0; i < this.menu_items.length; i++)
			if (this.menu_items[i].name == item_name)
				break;

		if (i == this.menu_items.length)
			return;

		index = this.menu_items[i].submenu.length;

		this.menu_items[i].submenu[index] = {};
		this.menu_items[i].submenu[index].name = sub_name;
		this.menu_items[i].submenu[index].parent = null;
		this.menu_items[i].submenu[index].depth = 0;
		this.menu_items[i].submenu[index].keys = sub_keys;
		this.menu_items[i].submenu[index].subsub = is_subsub;
		this.menu_items[i].submenu[index].fx = sub_fx;
	}

	this.add_subsubitem = function(item_name, sub_name, subsub_name, sub_keys, is_subsub, sub_fx)
	{
		for (var i = 0; i < this.menu_items.length; i++)
			if (this.menu_items[i].name == item_name)
				break;

		if (i == this.menu_items.length)
			return;

		index = this.menu_items[i].submenu.length;

		this.menu_items[i].submenu[index] = {};
		this.menu_items[i].submenu[index].name = subsub_name;
		this.menu_items[i].submenu[index].parent = sub_name;
		this.menu_items[i].submenu[index].depth = this.get_depth_by_name(i, sub_name) + 1;
		this.menu_items[i].submenu[index].keys = sub_keys;
		this.menu_items[i].submenu[index].subsub = is_subsub;
		this.menu_items[i].submenu[index].fx = sub_fx;
	}

	this.get_depth_by_name = function(index, name)
	{
		for (var i = 0; i < this.menu_items[index].submenu.length; i++)
			if (this.menu_items[index].submenu[i].name == name)
				break;

		return this.menu_items[index].submenu[i].depth;
	}

	this.add_submenu = function(index, parent, x, y)
	{
		var sub_index = this.submenu_divs.length;
		this.submenu_divs[sub_index] = document.createElement("div");

		if (parent == null)
			this.submenu_depths[sub_index] = 0;
		else
			this.submenu_depths[sub_index] = this.get_depth_by_name(index, parent) + 1;

		for (var i = 0; i < sub_index; i++)
			if (this.submenu_depths[i] == this.submenu_depths[sub_index])
			{
				this.submenu_divs[i].parentElement.removeChild(this.submenu_divs[i]);
				this.submenu_divs.splice(i, 1);	
			}

		this.submenu_div = this.submenu_divs[sub_index];

		if (parent == null)
			this.submenu_div.id = "submenu_div_" + index;
		else
			this.submenu_div.id = "submenu_div_" + index + "_" + parent;

		this.submenu_div.style.position = "absolute";

		this.submenu_div.style.top = y + "px";
		this.submenu_div.style.left = x + "px";

		this.submenu_div.style.width = "300px";
		this.submenu_div.style.height = (this.menu_items[index].submenu.length * 25) + "px";

		this.submenu_div.style.backgroundColor = this.backgroundSub;
		this.submenu_div.style.color = "#eeeeee";

		this.submenu_div.style.borderStyle = "solid";
		this.submenu_div.style.borderWidth = "thin";		
		this.submenu_div.style.borderColor = "#444445";

		this.submenu_div.style.zIndex = 100;

		document.body.appendChild(this.submenu_div);

		var i = 0;

		for (var j = 0; j < this.menu_items[index].submenu.length; j++)
		{
			if (this.menu_items[index].submenu[j].parent == parent)
			{
				this.submenu_items[i] = document.createElement("div");
				this.submenu_items[i].id = "submenu_items_" + j;
				this.submenu_items[i].style.position = "absolute";

				this.submenu_items[i].style.top = (i * 24) + "px";
				this.submenu_items[i].style.left = "0px";

				this.submenu_items[i].style.width = (parseInt(this.submenu_div.style.width) - 30) + "px";
				this.submenu_items[i].style.height = "20px";

				this.submenu_items[i].style.color = "#eeeeee";
				this.submenu_items[i].style.fontFamily = "Varta";
				this.submenu_items[i].style.fontSize = "13px";

				this.submenu_items[i].style.paddingLeft = "30px";
				this.submenu_items[i].style.paddingTop = "5px";
				this.submenu_items[i].innerHTML = this.menu_items[index].submenu[j].name;

				this.submenu_items[i].style.zIndex = 100;

				this.submenu_items[i].addEventListener("mouseover", function (this_menubar)
				{
					return function(evt)
					{
						this.style.backgroundColor = this_menubar.backgroundColor;

						var menu_index = this.parentElement.id.substring(this.parentElement.id.lastIndexOf("_") + 1, this.parentElement.id.length);

						if (isNaN(menu_index))
							menu_index = this.parentElement.id.substring(12, this.parentElement.id.lastIndexOf("_"));

						var sub_index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

						var depth = this_menubar.menu_items[menu_index].submenu[sub_index].depth;

						for (var i = 0; i < this_menubar.submenu_divs.length; i++)
							if (this_menubar.submenu_depths[i] > depth && this_menubar.menu_items[menu_index].submenu[sub_index].subsub == false)
							{
								document.body.removeChild(this_menubar.submenu_divs[i]);
								this_menubar.submenu_divs.splice(i, 1);
							}

						if (this_menubar.menu_items[menu_index].submenu[sub_index].subsub == true && document.getElementById("submenu_div_" + menu_index + "_" + this_menubar.menu_items[menu_index].submenu[sub_index].name) == null)
						{
							this_menubar.subsubID = setTimeout(function(this_subitem, this_menubar, menu_index, sub_index) {
								var subsub_x = parseInt(this_subitem.parentElement.style.left) + parseInt(this_subitem.parentElement.style.width) - 3;
								var subsub_y = parseInt(this_subitem.parentElement.style.top) + parseInt(this_subitem.style.top);

								this_menubar.add_submenu(menu_index, this_menubar.menu_items[menu_index].submenu[sub_index].name, subsub_x, subsub_y);
								this_menubar.subsub_flag = true;
							}, 500, this, this_menubar, menu_index, sub_index);
						}
					}
				} (this), false);

				this.submenu_items[i].addEventListener("mouseout", function (this_menubar)
				{
					return function(evt)
					{
						this.style.backgroundColor = this_menubar.backgroundSub;

						var menu_index = this.parentElement.id.substring(this.parentElement.id.lastIndexOf("_") + 1, this.parentElement.id.length);

						if (isNaN(menu_index))
							menu_index = this.parentElement.id.substring(12, this.parentElement.id.lastIndexOf("_"));

						var sub_index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

						if (this_menubar.menu_items[menu_index].submenu[sub_index].subsub == true)
						{
							clearTimeout(this_menubar.subsubID);
						}
					}
				} (this), false);

				this.submenu_items[i].addEventListener("mousedown", function (this_menubar)
				{
					return function(evt)
					{
						menu_flag = true;
					}
				} (this), false);

				this.submenu_items[i].addEventListener("click", function (this_menubar)
				{
					return function(evt)
					{
						var menu_index = this.parentElement.id.substring(this.parentElement.id.lastIndexOf("_") + 1, this.parentElement.id.length);

						if (isNaN(menu_index))
							menu_index = this.parentElement.id.substring(12, this.parentElement.id.lastIndexOf("_"));

						var sub_index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

						this_menubar.submenu_show = false;

						for (var i = 0; i < this_menubar.submenu_divs.length; i++)
							document.body.removeChild(this_menubar.submenu_divs[i]);

						this_menubar.submenu_divs.length = 0;
						this_menubar.submenu_items.length = 0;

						this_menubar.menu_items[menu_index].submenu[sub_index].fx();
					}
				} (this), false);

				this.submenu_div.appendChild(this.submenu_items[i]);

				if (this.menu_items[index].submenu[j].subsub == true)
				{
					this.submenu_shortcuts[i] = document.createElement("div");
					this.submenu_shortcuts[i].id = "submenu_shortcuts_" + j;
					this.submenu_shortcuts[i].style.position = "absolute";

					this.submenu_shortcuts[i].style.top = "0px";
					this.submenu_shortcuts[i].style.left = "0px";

					this.submenu_shortcuts[i].style.width = (parseInt(this.submenu_div.style.width) - 25) + "px";
					this.submenu_shortcuts[i].style.height = "20px";

					this.submenu_shortcuts[i].style.color = "#eeeeee";
					this.submenu_shortcuts[i].style.fontFamily = "Arial";
					this.submenu_shortcuts[i].style.fontSize = "13px";
					this.submenu_shortcuts[i].style.textAlign = "right";

					this.submenu_shortcuts[i].style.paddingRight = "0px";
					this.submenu_shortcuts[i].style.paddingTop = "5px";
					this.submenu_shortcuts[i].innerHTML = ">";

					this.submenu_shortcuts[i].style.zIndex = 100;

					this.submenu_items[i].appendChild(this.submenu_shortcuts[i]);
				}
				else
				{
					this.submenu_shortcuts[i] = document.createElement("div");
					this.submenu_shortcuts[i].id = "submenu_shortcuts_" + i;
					this.submenu_shortcuts[i].style.position = "absolute";

					this.submenu_shortcuts[i].style.top = "0px";
					this.submenu_shortcuts[i].style.left = "0px";

					this.submenu_shortcuts[i].style.width = (parseInt(this.submenu_div.style.width) - 25) + "px";
					this.submenu_shortcuts[i].style.height = "20px";

					this.submenu_shortcuts[i].style.color = "#eeeeee";
					this.submenu_shortcuts[i].style.fontFamily = "Varta";
					this.submenu_shortcuts[i].style.fontSize = "13px";
					this.submenu_shortcuts[i].style.textAlign = "right";

					this.submenu_shortcuts[i].style.paddingRight = "0px";
					this.submenu_shortcuts[i].style.paddingTop = "5px";
					this.submenu_shortcuts[i].innerHTML = this.menu_items[index].submenu[j].keys;

					this.submenu_shortcuts[i].style.zIndex = 100;

					this.submenu_items[i].appendChild(this.submenu_shortcuts[i]);
				}

				i++;
			}
		}

		this.submenu_div.style.height = (i * 25) + "px";		
	}
}

function build_menubar(data)
{
	this.id = data.id;
	this.width = window.innerWidth;
	this.height = data.height;
	this.item_width = 150;
	this.backgroundColor = data.background;
	this.backgroundHover = data.backgroundHover;
	this.backgroundSub = data.backgroundSub;
	this.borderSub = data.borderSub;
	this.fontFamily = data.fontFamily;
	this.fontSize = data.fontSize;
	this.color = data.color;
	this.subsubID;

	if (data.letterGap == undefined)
		this.letterGap = 7.5;
	else
		this.letterGap = data.letterGap;

	this.menu_items = new Array();

	this.submenu_show = false;
	this.submenu_item = -1;
	this.submenu_div = null;

	this.submenu_divs = new Array();
	this.submenu_depths = new Array();

	this.submenu_items = new Array();
	this.submenu_inputs = new Array();
	this.submenu_shortcuts = new Array();

	// create main div for properties using supplied data
	this.menubar_div = document.createElement("div");
	this.menubar_div.id = data.id;
	this.menubar_div.style.position = "absolute";

	this.menubar_div.style.top = "0px";
	this.menubar_div.style.left = "0px";

	this.menubar_div.style.width = window.innerWidth + "px";
	this.menubar_div.style.height = data.height + "px";

	this.menubar_div.style.backgroundColor = data.background;

	this.menubar_div.style.fontFamily = "ABeeZee";
	this.menubar_div.style.fontSize = "12px";

	// add div to application page
	if (data.div == undefined)
		document.body.appendChild(this.menubar_div);
	else
		document.getElementById(data.div).appendChild(this.menubar_div);

	this.add_item = function(name)
	{
		var index = this.menu_items.length;

		var left = 0;
		for (var i = 0; i < this.menu_items.length; i++)
		{
			if (this.menu_items[i].text_open == false)
				left += parseInt(this.menu_items[i].div.style.width) + 9;
			else
				left += parseInt(this.menu_items[i].input.style.width) + 9;
		}

		this.menu_items[index] = {};
		this.menu_items[index].name = name;
		this.menu_items[index].submenu = new Array();
		this.menu_items[index].subsubmenu = new Array();

		this.menu_items[index].div = document.createElement("div");
		this.menu_items[index].div.id = this.id + "_" + index;
		this.menu_items[index].div.style.position = "absolute";

		this.menu_items[index].div.style.top = "6px";
		this.menu_items[index].div.style.left = (left + 5) + "px";

		this.menu_items[index].div.style.width = (name.length * this.letterGap) + "px";
		this.menu_items[index].div.style.height = (this.height - 10) + "px";

		this.menu_items[index].div.style.backgroundColor = this.backgroundColor;
		this.menu_items[index].div.style.color = this.color;

		this.menu_items[index].div.style.fontFamily = this.fontFamily;
		this.menu_items[index].div.style.fontSize = this.fontSize;

		this.menu_items[index].div.style.paddingLeft = "7px";
		this.menu_items[index].div.innerHTML = name;

		this.menu_items[index].text_open = false;

		this.menu_items[index].div.addEventListener("mouseover", function (this_menubar)
		{
			return function(evt)
			{
				var index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);
				this.style.backgroundColor = this_menubar.backgroundHover;

				if (this_menubar.submenu_show == true)
				{
					for (var i = 0; i < this_menubar.submenu_divs.length; i++)
						document.body.removeChild(this_menubar.submenu_divs[i]);

					this_menubar.submenu_divs.length = 0;
					this_menubar.submenu_item = index;

					this.style.backgroundColor = this_menubar.backgroundSub;
					this_menubar.add_submenu(index, null, parseInt(this.style.left), parseInt(this.style.top) + parseInt(this.style.height));
				}
			}
		} (this), false);

		this.menu_items[index].div.addEventListener("mouseout", function (this_menubar)
		{
			return function(evt)
			{
				this.style.backgroundColor = this_menubar.backgroundColor;
			}
		} (this), false);

		this.menu_items[index].div.addEventListener("mouseup", function (this_menubar)
		{
			return function(evt)
			{
				var index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

				if (this_menubar.submenu_show == false && menu_close == false)
				{
					this_menubar.submenu_show = true;
					this_menubar.submenu_item = index;
					this.style.backgroundColor = this_menubar.backgroundSub;

					this_menubar.add_submenu(index, null, parseInt(this.style.left), parseInt(this.style.top) + parseInt(this.style.height));
				}
				else if (this_menubar.submenu_show == false && menu_close == true)
				{
					menu_close = false;
				}
				else
				{
					this_menubar.submenu_show = false;
					document.body.removeChild(this_menubar.submenu_div);
					this_menubar.submenu_items.length = 0;
					menu_close = false;
				}
			}
		} (this), false);

		this.menubar_div.appendChild(this.menu_items[index].div);
	}

	this.add_subitem = function(item_name, sub_name, sub_keys, is_subsub, sub_fx)
	{
		for (var i = 0; i < this.menu_items.length; i++)
			if (this.menu_items[i].name == item_name)
				break;

		if (i == this.menu_items.length)
			return;

		index = this.menu_items[i].submenu.length;

		this.menu_items[i].submenu[index] = {};
		this.menu_items[i].submenu[index].name = sub_name;
		this.menu_items[i].submenu[index].parent = null;
		this.menu_items[i].submenu[index].depth = 0;
		this.menu_items[i].submenu[index].keys = sub_keys;
		this.menu_items[i].submenu[index].subsub = is_subsub;
		this.menu_items[i].submenu[index].fx = sub_fx;
	}

	this.add_subsubitem = function(item_name, sub_name, subsub_name, sub_keys, is_subsub, sub_fx)
	{
		for (var i = 0; i < this.menu_items.length; i++)
			if (this.menu_items[i].name == item_name)
				break;

		if (i == this.menu_items.length)
			return;

		index = this.menu_items[i].submenu.length;

		this.menu_items[i].submenu[index] = {};
		this.menu_items[i].submenu[index].name = subsub_name;
		this.menu_items[i].submenu[index].parent = sub_name;
		this.menu_items[i].submenu[index].depth = this.get_depth_by_name(i, sub_name) + 1;
		this.menu_items[i].submenu[index].keys = sub_keys;
		this.menu_items[i].submenu[index].subsub = is_subsub;
		this.menu_items[i].submenu[index].fx = sub_fx;
	}

	this.add_text_item = function()
	{
		var index = this.menu_items.length;

		var left = 0;
		for (var i = 0; i < this.menu_items.length; i++)
		{
			if (this.menu_items[i].text_open == false)
				left += parseInt(this.menu_items[i].div.style.width) + 9;
			else
				left += parseInt(this.menu_items[i].input.style.width) + 9;
		}

		this.menu_items[index] = {};
		this.menu_items[index].name = "";
		this.menu_items[index].submenu = new Array();
		this.menu_items[index].subsubmenu = new Array();

		this.menu_items[index].input = document.createElement("input");
		this.menu_items[index].input.id = this.id + "_" + index + "_input";
		this.menu_items[index].input.style.position = "absolute";

		this.menu_items[index].input.style.top = "2px";
		this.menu_items[index].input.style.left = (left + 5) + "px";

		this.menu_items[index].input.style.width =  (this.letterGap * 12) + "px";
		this.menu_items[index].input.style.height = (this.height - 15) + "px";

		this.menu_items[index].input.style.backgroundColor = "#eeeeee";
		this.menu_items[index].input.style.color = "#202020";

		this.menu_items[index].input.style.fontFamily = this.fontFamily;
		this.menu_items[index].input.style.fontSize = this.fontSize;

		this.menu_items[index].input.style.paddingTop = "4px";
		this.menu_items[index].input.style.paddingLeft = "2px";

		this.menu_items[index].input.addEventListener("blur", function (this_menubar, this_index)
		{
			return function(evt)
			{
				if (this.value.length > 0)
				{
					this_menubar.menu_items[this_index].text_open = false;

					this_menubar.menu_items[this_index].name = this.value;
					this_menubar.menu_items[this_index].div.innerHTML = this.value;
					this_menubar.menu_items[this_index].div.style.width = (this.value.length * this_menubar.letterGap) + "px";

					this_menubar.refresh_menu();
					this_menubar.add_text_item();
				}
			}
		} (this, index), false);

		this.menubar_div.appendChild(this.menu_items[index].input);
		this.menu_items[index].input.focus();

		this.menu_items[index].div = document.createElement("div");
		this.menu_items[index].div.id = this.id + "_" + index;
		this.menu_items[index].div.style.position = "absolute";

		this.menu_items[index].div.style.top = "6px";
		this.menu_items[index].div.style.left = (left + 5) + "px";

		this.menu_items[index].div.style.width = "2px";
		this.menu_items[index].div.style.height = (this.height - 10) + "px";

		this.menu_items[index].div.style.backgroundColor = this.backgroundColor;
		this.menu_items[index].div.style.color = this.color;

		this.menu_items[index].div.style.fontFamily = this.fontFamily;
		this.menu_items[index].div.style.fontSize = this.fontSize;

		this.menu_items[index].div.style.paddingLeft = "7px";
		this.menu_items[index].div.innerHTML = "";

		this.menu_items[index].div.style.visibility = "hidden";

		this.menu_items[index].text_open = true;

		this.menu_items[index].div.addEventListener("mouseover", function (this_menubar)
		{
			return function(evt)
			{
				var index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);
				this.style.backgroundColor = this_menubar.backgroundHover;

				if (this_menubar.submenu_show == true)
				{
					for (var i = 0; i < this_menubar.submenu_divs.length; i++)
						this_menubar.submenu_divs[i].parentElement.removeChild(this_menubar.submenu_divs[i]);

					this_menubar.submenu_divs.length = 0;
					this_menubar.submenu_item = index;

					this.style.backgroundColor = this_menubar.backgroundSub;
					this_menubar.add_submenu(index, null, parseInt(this.style.left), parseInt(this.style.top) + parseInt(this.style.height), this.parentElement);
				}
			}
		} (this), false);

		this.menu_items[index].div.addEventListener("mouseout", function (this_menubar)
		{
			return function(evt)
			{
				this.style.backgroundColor = this_menubar.backgroundColor;
			}
		} (this), false);

		this.menu_items[index].div.addEventListener("mousedown", function (this_menubar)
		{
			return function(evt)
			{
				var index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

				if (this_menubar.submenu_show == false && menu_close == false)
				{
					this_menubar.submenu_show = true;
					this_menubar.submenu_item = index;
					this.style.backgroundColor = this_menubar.backgroundSub;

					this_menubar.add_submenu(index, null, parseInt(this.style.left), parseInt(this.style.top) + parseInt(this.style.height), this.parentElement);
				}
				else if (this_menubar.submenu_show == false && menu_close == true)
				{
					menu_close = false;
				}
				else
				{
					this_menubar.submenu_show = false;
					this_menubar.submenu_div.parentElement.removeChild(this_menubar.submenu_div);
					this_menubar.submenu_divs.length = 0;
					this_menubar.submenu_items.length = 0;
					menu_close = false;
				}
			}
		} (this), false);

		this.menubar_div.appendChild(this.menu_items[index].div);
		//this.add_subitem("!select_0", "!select_0", "", false, null);
	}

	this.refresh_menu = function()
	{
		for (var i = 0; i < this.menu_items.length; i++)
		{
			var left = 0;
			for (var j = 0; j < this.menu_items.length; j++)
			{
				if (this.menu_items[j].text_open == false)
					left += parseInt(this.menu_items[j].div.style.width) + 9;
				else
					left += parseInt(this.menu_items[j].input.style.width) + 9;
			}

			if (this.menu_items[i].text_open == true)
			{
				this.menu_items[i].div.style.visibility = "hidden";
				this.menu_items[i].input.style.visibility = "visible";
			}
			else
			{
				this.menu_items[i].input.style.visibility = "hidden";

				if (this.menu_items[i].name == "")
					this.menu_items[i].div.style.visibility = "hidden";
				else
					this.menu_items[i].div.style.visibility = "visible";
			}
		}
	}

	this.get_depth_by_name = function(index, name)
	{
		for (var i = 0; i < this.menu_items[index].submenu.length; i++)
			if (this.menu_items[index].submenu[i].name == name)
				break;

		return this.menu_items[index].submenu[i].depth;
	}

	this.add_submenu = function(index, parent, x, y, parent_element)
	{
		var sub_index = this.submenu_divs.length;

		this.submenu_divs[sub_index] = document.createElement("div");

		if (parent == null)
			this.submenu_depths[sub_index] = 0;
		else
			this.submenu_depths[sub_index] = this.get_depth_by_name(index, parent) + 1;

		for (var i = 0; i < sub_index; i++)
			if (this.submenu_depths[i] == this.submenu_depths[sub_index])
			{
				this.submenu_divs[i].parentElement.removeChild(this.submenu_divs[i]);
				this.submenu_divs.splice(i, 1);	
			}

		this.submenu_div = this.submenu_divs[sub_index];

		if (parent == null)
			this.submenu_div.id = "submenu_div_" + index;
		else
			this.submenu_div.id = "submenu_div_" + index + "_" + parent;

		this.submenu_div.style.position = "absolute";

		this.submenu_div.style.top = y + "px";
		this.submenu_div.style.left = x + "px";

		this.submenu_div.style.width = "300px";
		this.submenu_div.style.height = (this.menu_items[index].submenu.length * 25) + "px";

		this.submenu_div.style.backgroundColor = this.backgroundSub;
		this.submenu_div.style.color = "#eeeeee";

		this.submenu_div.style.borderStyle = "solid";
		this.submenu_div.style.borderWidth = "thin";		
		this.submenu_div.style.borderColor = this.borderSub;

		this.submenu_div.style.zIndex = 100;

		parent_element.appendChild(this.submenu_div);

		var i = 0;

		for (var j = 0; j < this.menu_items[index].submenu.length; j++)
		{
			if (this.menu_items[index].submenu[j].parent == parent)
			{
				this.submenu_items[i] = document.createElement("div");
				this.submenu_items[i].id = "submenu_items_" + j;
				this.submenu_items[i].style.position = "absolute";

				this.submenu_items[i].style.top = (i * 24) + "px";
				this.submenu_items[i].style.left = "0px";

				this.submenu_items[i].style.width = (parseInt(this.submenu_div.style.width) - 30) + "px";
				this.submenu_items[i].style.height = "20px";

				this.submenu_items[i].style.color = "#eeeeee";
				this.submenu_items[i].style.fontFamily = "Varta";
				this.submenu_items[i].style.fontSize = "13px";

				this.submenu_items[i].style.paddingLeft = "30px";
				this.submenu_items[i].style.paddingTop = "5px";
				this.submenu_items[i].innerHTML = this.menu_items[index].submenu[j].name;

				this.submenu_items[i].style.zIndex = 100;

				this.submenu_items[i].addEventListener("mouseover", function (this_menubar)
				{
					return function(evt)
					{
						this.style.backgroundColor = this_menubar.backgroundColor;

						var menu_index = this.parentElement.id.substring(this.parentElement.id.lastIndexOf("_") + 1, this.parentElement.id.length);

						if (isNaN(menu_index))
							menu_index = this.parentElement.id.substring(12, this.parentElement.id.lastIndexOf("_"));

						var sub_index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

						var depth = this_menubar.menu_items[menu_index].submenu[sub_index].depth;

						for (var i = 0; i < this_menubar.submenu_divs.length; i++)
							if (this_menubar.submenu_depths[i] > depth && this_menubar.menu_items[menu_index].submenu[sub_index].subsub == false)
							{
								document.body.removeChild(this_menubar.submenu_divs[i]);
								this_menubar.submenu_divs.splice(i, 1);
							}

						if (this_menubar.menu_items[menu_index].submenu[sub_index].subsub == true && document.getElementById("submenu_div_" + menu_index + "_" + this_menubar.menu_items[menu_index].submenu[sub_index].name) == null)
						{
							this_menubar.subsubID = setTimeout(function(this_subitem, this_menubar, menu_index, sub_index) {
								var subsub_x = parseInt(this_subitem.parentElement.style.left) + parseInt(this_subitem.parentElement.style.width) - 3;
								var subsub_y = parseInt(this_subitem.parentElement.style.top) + parseInt(this_subitem.style.top);

								this_menubar.add_submenu(menu_index, this_menubar.menu_items[menu_index].submenu[sub_index].name, subsub_x, subsub_y);
								this_menubar.subsub_flag = true;
							}, 500, this, this_menubar, menu_index, sub_index);
						}
					}
				} (this), false);

				this.submenu_items[i].addEventListener("mouseout", function (this_menubar)
				{
					return function(evt)
					{
						this.style.backgroundColor = this_menubar.backgroundSub;

						var menu_index = this.parentElement.id.substring(this.parentElement.id.lastIndexOf("_") + 1, this.parentElement.id.length);

						if (isNaN(menu_index))
							menu_index = this.parentElement.id.substring(12, this.parentElement.id.lastIndexOf("_"));

						var sub_index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

						if (this_menubar.menu_items[menu_index].submenu[sub_index].subsub == true)
						{
							clearTimeout(this_menubar.subsubID);
						}
					}
				} (this), false);

				this.submenu_items[i].addEventListener("mousedown", function (this_menubar)
				{
					return function(evt)
					{
						menu_flag = true;
					}
				} (this), false);

				this.submenu_items[i].addEventListener("click", function (this_menubar)
				{
					return function(evt)
					{
						var menu_index = this.parentElement.id.substring(this.parentElement.id.lastIndexOf("_") + 1, this.parentElement.id.length);

						if (isNaN(menu_index))
							menu_index = this.parentElement.id.substring(12, this.parentElement.id.lastIndexOf("_"));

						var sub_index = this.id.substring(this.id.lastIndexOf("_") + 1, this.id.length);

						this_menubar.submenu_show = false;

						for (var i = 0; i < this_menubar.submenu_divs.length; i++)
							document.body.removeChild(this_menubar.submenu_divs[i]);

						this_menubar.submenu_divs.length = 0;
						this_menubar.submenu_items.length = 0;

						this_menubar.menu_items[menu_index].submenu[sub_index].fx();
					}
				} (this), false);

				this.submenu_div.appendChild(this.submenu_items[i]);

				if (this.menu_items[index].submenu[j].subsub == true)
				{
					this.submenu_shortcuts[i] = document.createElement("div");
					this.submenu_shortcuts[i].id = "submenu_shortcuts_" + j;
					this.submenu_shortcuts[i].style.position = "absolute";

					this.submenu_shortcuts[i].style.top = "0px";
					this.submenu_shortcuts[i].style.left = "0px";

					this.submenu_shortcuts[i].style.width = (parseInt(this.submenu_div.style.width) - 25) + "px";
					this.submenu_shortcuts[i].style.height = "20px";

					this.submenu_shortcuts[i].style.color = "#eeeeee";
					this.submenu_shortcuts[i].style.fontFamily = "Arial";
					this.submenu_shortcuts[i].style.fontSize = "13px";
					this.submenu_shortcuts[i].style.textAlign = "right";

					this.submenu_shortcuts[i].style.paddingRight = "0px";
					this.submenu_shortcuts[i].style.paddingTop = "5px";
					this.submenu_shortcuts[i].innerHTML = ">";

					this.submenu_shortcuts[i].style.zIndex = 100;

					this.submenu_items[i].appendChild(this.submenu_shortcuts[i]);
				}
				else
				{
					this.submenu_shortcuts[i] = document.createElement("div");
					this.submenu_shortcuts[i].id = "submenu_shortcuts_" + i;
					this.submenu_shortcuts[i].style.position = "absolute";

					this.submenu_shortcuts[i].style.top = "0px";
					this.submenu_shortcuts[i].style.left = "0px";

					this.submenu_shortcuts[i].style.width = (parseInt(this.submenu_div.style.width) - 25) + "px";
					this.submenu_shortcuts[i].style.height = "20px";

					this.submenu_shortcuts[i].style.color = "#eeeeee";
					this.submenu_shortcuts[i].style.fontFamily = "Varta";
					this.submenu_shortcuts[i].style.fontSize = "13px";
					this.submenu_shortcuts[i].style.textAlign = "right";

					this.submenu_shortcuts[i].style.paddingRight = "0px";
					this.submenu_shortcuts[i].style.paddingTop = "5px";
					this.submenu_shortcuts[i].innerHTML = this.menu_items[index].submenu[j].keys;

					this.submenu_shortcuts[i].style.zIndex = 100;

					this.submenu_items[i].appendChild(this.submenu_shortcuts[i]);
				}

				i++;
			}
		}

		this.submenu_inputs[i] = document.createElement("input");
		this.submenu_inputs[i].id = this.id + "_" + index + "_input";
		this.submenu_inputs[i].style.position = "absolute";

		this.submenu_inputs[i].style.top = ((i * 24) + 2) + "px";
		this.submenu_inputs[i].style.left = "30px";

		this.submenu_inputs[i].style.width =  (this.letterGap * 20) + "px";
		this.submenu_inputs[i].style.height = (this.height - 15) + "px";

		this.submenu_inputs[i].style.backgroundColor = "#eeeeee";
		this.submenu_inputs[i].style.color = "#202020";

		this.submenu_inputs[i].style.fontFamily = this.fontFamily;
		this.submenu_inputs[i].style.fontSize = this.fontSize;

		this.submenu_inputs[i].style.paddingTop = "4px";
		this.submenu_inputs[i].style.paddingLeft = "2px";

		/*this.submenu_inputs[i].addEventListener("blur", function (this_menubar, this_index)
		{
			return function(evt)
			{
				if (this.value.length > 0)
				{
					this_menubar.menu_items[this_index].text_open = false;

					this_menubar.menu_items[this_index].name = this.value;
					this_menubar.menu_items[this_index].div.innerHTML = this.value;
					this_menubar.menu_items[this_index].div.style.width = (this.value.length * this_menubar.letterGap) + "px";

					this_menubar.refresh_menu();
					this_menubar.add_text_item();
				}
			}
		} (this, index), false);*/

		this.submenu_div.appendChild(this.submenu_inputs[i]);
		this.submenu_inputs[i].focus();

		this.submenu_div.style.height = ((i + 1) * 25) + "px";
	}
}

function datatable(data)
{
	this.id = data.id;
	this.index = data.index;
	this.name = data.name;

	this.header_height = 24;
	this.default_height = 20;
	this.default_padding = 4;
	this.default_border = 2;
	this.default_width = 120;
	this.rowcol_width = 60;

	this.row_max = 0;
	this.col_max = 0;
	this.new_row;
	this.resize_flag = false;
	this.resize_row = false;
	this.resize_index;
	this.old_x;
	this.old_y;
	this.commit = false;

	this.row_start = this.default_height + this.default_padding + this.default_border;
	this.col_start = this.rowcol_width + this.default_padding + this.default_border;

	this.row_height = new Array();
	this.row_label = new Array();

	this.col_width = new Array();
	this.col_label = new Array();
	this.col_title = new Array();
	this.col_type = new Array();
	this.col_sub = new Array();
	this.col_params = new Array();

	this.table_data = new Array();
	this.table_codes = new Array();

	this.code_divs = new Array();

	this.datatable = document.createElement("div");
	this.datatable.id = data.id;
	this.datatable.style.position = "absolute";

	this.datatable.style.top = "35px";
	this.datatable.style.left = "10px";

	this.datatable.style.width = "100px";
	this.datatable.style.height = "100px";

	main_formspace.tab_divs[data.index].appendChild(this.datatable);

	this.rowcol = document.createElement("div");
	this.rowcol.id = data.id + "_rowcol";
	this.rowcol.style.position = "absolute";

	this.rowcol.style.top = "0px";
	this.rowcol.style.left = "0px";

	this.rowcol.style.width = this.rowcol_width + "px";
	this.rowcol.style.height = "20px";

	this.rowcol.style.backgroundColor = "#444444";

	this.rowcol.style.borderRightColor = "#888888";
	this.rowcol.style.borderBottomColor = "#888888";
	this.rowcol.style.borderTopColor = "#444444";
	this.rowcol.style.borderLeftColor = "#444444";

	this.rowcol.style.borderStyle = "solid";
	this.rowcol.style.borderWidth = "1px";

	this.rowcol.style.fontFamily = "Varta";
	this.rowcol.style.fontSize = "14px";
	this.rowcol.style.color = "#ffffff";

	this.rowcol.style.paddingRight = "4px";
	this.rowcol.style.paddingTop = "4px";
	this.rowcol.style.textAlign = "right";

	this.rowcol.innerHTML = "<b>#</b>";

	this.datatable.appendChild(this.rowcol);

	this.add_row = function()
	{
		var gap = 0;
		var index = this.row_height.length;

		for (var i = 0; i < index; i++)
			gap += this.row_height[i];

		this.row_height[index] = this.default_height + this.default_padding + this.default_border;

		this.row_label[index] = document.createElement("div");
		this.row_label[index].id = this.id + "_row_label_" + index;
		this.row_label[index].style.position = "absolute";

		this.row_label[index].style.top = (this.row_start + (this.row_height[0] * index)) + "px";
		this.row_label[index].style.left = "0px";

		this.row_label[index].style.width = this.rowcol_width + "px";
		this.row_label[index].style.height = this.default_height + "px";

		if (index % 2 == 0)
			this.row_label[index].style.backgroundColor = "#666666";
		else
			this.row_label[index].style.backgroundColor = "#444444";

		this.row_label[index].style.borderTopColor = this.row_label[index].style.backgroundColor;
		this.row_label[index].style.borderLeftColor = this.row_label[index].style.backgroundColor;
		this.row_label[index].style.borderRightColor = "#888888";
		this.row_label[index].style.borderBottomColor = this.row_label[index].style.backgroundColor;

		this.row_label[index].style.borderStyle = "solid";
		this.row_label[index].style.borderWidth = "1px";

		this.row_label[index].style.fontFamily = "Varta";
		this.row_label[index].style.fontSize = "14px";
		this.row_label[index].style.color = "#ffffff";

		this.row_label[index].style.paddingRight = "4px";
		this.row_label[index].style.paddingTop = "4px";
		this.row_label[index].style.textAlign = "right";

		this.row_label[index].innerHTML = index;

		this.datatable.appendChild(this.row_label[index]);

		this.row_max = index + 1;
		this.table_data[index] = new Array();
		this.table_codes[index] = new Array();

		for (var i = 0; i < this.col_max; i++)
			this.add_cell(i, index);

		this.do_tab_order();

		this.row_label[index].addEventListener("mousemove", function (this_table)
		{
			return function(evt)
			{
				var rect = this.getBoundingClientRect();
				var x = evt.clientX - rect.left;
				var y = evt.clientY - rect.top;

				if (this_table.resize_row == false)
				{
					if (parseInt(this.style.height) - y < 3)
					{
						this.style.cursor = "ns-resize";
					}
					else
						this.style.cursor = "default";
				}
			}
		} (this), false);

		this.row_label[index].addEventListener("mousedown", function (this_table, index)
		{
			return function(evt)
			{
				if (this.style.cursor == "ns-resize")
				{
					this_table.resize_row = true;
					this_table.resize_index = index;
				}
			}
		} (this, index), false);
	}

	this.add_col = function(name, update)
	{
		var gap = 0;
		var index = this.col_width.length;

		for (var i = 0; i < index; i++)
			gap += this.col_width[i];

		this.col_width[index] = this.default_width + this.default_padding + this.default_border;

		this.col_label[index] = document.createElement("div");
		this.col_label[index].id = this.id + "_col_label_" + index;
		this.col_label[index].style.position = "absolute";

		this.col_label[index].style.top = "0px";
		this.col_label[index].style.left = (this.col_start + gap) + "px";

		this.col_label[index].style.width = this.default_width + "px";
		this.col_label[index].style.height = this.default_height + "px";;

		this.col_label[index].style.backgroundColor = "#444444";

		this.col_label[index].style.borderTopColor = "#444444";
		this.col_label[index].style.borderLeftColor = "#444444";
		this.col_label[index].style.borderRightColor = "#888888";
		this.col_label[index].style.borderBottomColor = "#888888";

		this.col_label[index].style.borderStyle = "solid";
		this.col_label[index].style.borderWidth = "1px";

		this.col_label[index].style.fontFamily = "Varta";
		this.col_label[index].style.fontSize = "14px";
		this.col_label[index].style.color = "#ffffff";

		this.col_label[index].style.paddingLeft = "4px";
		this.col_label[index].style.paddingTop = "4px";
		this.col_label[index].style.textAlign = "left";

		this.col_label[index].innerHTML = "<b>" + name + "</b>";

		this.datatable.appendChild(this.col_label[index]);

		this.col_max = index + 1;

		this.col_title[index] = name;
		this.col_type[index] = "string";

		for (var i = 0; i < this.row_max; i++)
			this.add_cell(index, i);

		if (update == true)
		{
			update_cols(this);
			this.do_tab_order();
		}

		this.col_label[index].addEventListener("mousemove", function (this_table)
		{
			return function(evt)
			{
				var rect = this.getBoundingClientRect();
				var x = evt.clientX - rect.left;
				var y = evt.clientY - rect.top;

				if (this_table.resize_flag == false)
				{
					if (parseInt(this.style.width) - x < 3)
					{
						this.style.cursor = "ew-resize";
					}
					else
						this.style.cursor = "default";
				}
			}
		} (this), false);

		this.col_label[index].addEventListener("mousedown", function (this_table, index)
		{
			return function(evt)
			{
				if (this.style.cursor == "ew-resize")
				{
					this_table.resize_flag = true;
					this_table.resize_index = index;
				}
			}
		} (this, index), false);

		this.col_label[index].addEventListener("mouseup", function (this_table, index)
		{
			return function(evt)
			{
				if (evt.button == 2)
				{
					main_formspace.data_context.style.left = evt.clientX + "px";
 					main_formspace.data_context.style.top = evt.clientY + "px";

 					main_formspace.data_context_name.value = this_table.col_title[index];

 					if (this_table.col_type[index] == "string")
 					{
 						main_formspace.data_context_type.value = "Text";
 						main_formspace.hide_params();
 					}
 					else
 					{
 						if (this_table.col_sub[index] == "html")
 							main_formspace.data_context_type.value = "HTML";
 						else
 							main_formspace.data_context_type.value = "JavaScript";

 						if (this_table.col_params[index] != undefined)
 						{
 							main_formspace.data_context_params.value = this_table.col_params[index].replaceAll(",", "\n");
 							main_formspace.show_params();
 						}
 						else
 							main_formspace.hide_params();
 					}

 					select_table = this_table;
 					col_select = index;

 					main_formspace.data_context.style.visibility = "visible";
 					this_table.select_col(index);
				}
			}
		} (this, index), false);
	}

	this.select_col = function(index)
	{
		this.col_label[index].style.backgroundColor = "#1674de";

		if (this.col_type[index] == "string")
		{
			for (var i = 0; i < this.row_label.length; i++)
				this.table_data[i][index].style.backgroundColor = "#1674de";
		}
	}

	this.deselect_col = function(index)
	{
		this.col_label[index].style.backgroundColor = "#444444";

		if (this.col_type[index] == "string")
		{
			for (var i = 0; i < this.row_label.length; i++)
			{
				if (i % 2 == 0)
					this.table_data[i][index].style.backgroundColor = "#666666";
				else
					this.table_data[i][index].style.backgroundColor = "#444444";
			}
		}
	}

	this.rename_col = function(index, name)
	{
		this.col_label[index].innerHTML = "<b>" + name + "</b>";
		this.col_title[index] = name;

		update_cols(this);
		update_data(this);
	}

	this.add_cell = function(x, y)
	{
		var gap = 0;

		for (var i = 0; i < x; i++)
			gap += this.col_width[i];

		var row_gap = this.default_height + this.default_padding + this.default_border;

		for (var i = 0; i < y; i++)
			row_gap += this.row_height[i];

		this.table_data[y][x] = document.createElement("div");
		this.table_data[y][x].id = this.id + "_table_data_" + y + "_" + x;
		this.table_data[y][x].style.position = "absolute";

		this.table_data[y][x].style.top = (this.row_start + (this.row_height[0] * y)) + "px";
		this.table_data[y][x].style.left = (this.col_start + gap) + "px";

		if (y % 2 == 0)
			this.table_data[y][x].style.backgroundColor = "#666666";
		else
			this.table_data[y][x].style.backgroundColor = "#444444";

		this.table_data[y][x].style.borderTopColor = this.table_data[y][x].style.backgroundColor;
		this.table_data[y][x].style.borderBottomColor = this.table_data[y][x].style.backgroundColor;
		this.table_data[y][x].style.borderLeftColor = this.table_data[y][x].style.backgroundColor;
		this.table_data[y][x].style.borderRightColor = "#888888";

		this.table_data[y][x].style.borderStyle = "solid";
		this.table_data[y][x].style.borderWidth = "1px";

		this.table_data[y][x].style.fontFamily = "Varta";
		this.table_data[y][x].style.fontSize = "14px";
		this.table_data[y][x].style.color = "#ffffff";

		this.table_data[y][x].style.paddingLeft = "4px";
		this.table_data[y][x].style.paddingTop = "4px";
		this.table_data[y][x].style.textAlign = "left";

		this.table_data[y][x].style.width = (this.col_width[x] - parseInt(this.table_data[y][x].style.paddingLeft) - (parseInt(this.table_data[y][x].style.borderWidth) * 2)) + "px";
		this.table_data[y][x].style.height = this.default_height + "px";

		this.table_data[y][x].style.cursor = "text";

		this.table_data[y][x].innerHTML = "";
		this.table_data[y][x].contentEditable = true;

		this.datatable.appendChild(this.table_data[y][x]);

		this.table_codes[y][x] = undefined;

		this.table_data[y][x].addEventListener("keypress", function (this_table, y, x)
		{
			return function(evt)
			{
				if (isAlphaNumeric(String.fromCharCode(evt.keyCode)))
					this_table.commit = true;

				if (this.innerHTML != "" && (this_table.row_max - 1) <= y)
				{
					this_table.add_row(); 
					this_table.new_row = this_table.row_label.length - 1;

					for (var j = 0; j < this_table.col_title.length; j++)
						if (this_table.col_type[j] == "code")
							this_table.create_code(j, this_table.row_label.length - 1);

					this.do_tab_order();
				}
			}
		} (this, y, x), false);

		this.table_data[y][x].addEventListener("keydown", function (this_table, y, x)
		{
			return function(evt)
			{
				if (this_table.commit == false)
				{
					if (evt.keyCode == 39)
					{
						if (x < (this_table.col_max - 1))
							this_table.table_data[y][x + 1].focus();
					}
					else if (evt.keyCode == 37)
					{
						if (x > 0)
							this_table.table_data[y][x - 1].focus();
					}
				}

				if (evt.keyCode == 38)
				{
					if (y > 0)
						this_table.table_data[y - 1][x].focus();
				}
				else if (evt.keyCode == 40)
				{
					if (y < (this_table.row_max - 1))
						this_table.table_data[y + 1][x].focus();
				}
			}
		} (this, y, x), false);

		this.table_data[y][x].addEventListener("focus", function (this_table)
		{
			return function(evt)
			{
				this_table.commit = false;
			}
		} (this), false);

		this.table_data[y][x].addEventListener("blur", function (this_table)
		{
			return function(evt)
			{
				update_data(this_table);
			}
		} (this), false);

		this.do_tab_order();
	}

	this.check_width = function()
	{
		var quant = 0;

		for (var i = 0; i < this.col_width.length; i++)
			quant += this.col_width[i];

		this.datatable.style.width = (quant + 200) + "px";
	}

	this.load_cols = function(columns)
	{
		var gap = 0;

		for (var i = 0; i < columns.length; i++)
		{
			this.add_col(columns[i].title, false);

			this.col_title[i] = columns[i].title;
			this.col_width[i] = columns[i].width;

			if (columns[i].type == undefined)
				columns[i].type = "string"
			else
				this.col_type[i] = columns[i].type;

			if (this.col_type[i] == "code")
			{
				this.col_sub[i] = columns[i].sub;

				if (columns[i].params != undefined)
					this.col_params[i] = columns[i].params;
			}

			this.col_label[i].style.left = (this.col_start + gap) + "px";
			this.col_label[i].style.width = (this.col_width[i] - this.default_padding - this.default_border) + "px";

			gap += this.col_width[i];

			this.check_width();
		}
	}

	this.load_data = function(data)
	{
		for (var i = 0; i < data.length; i++)
		{
			if (this.row_label[i] == undefined)
				this.add_row();
			else
				for (j = 0; j < this.col_label.length; j++)
					this.table_data[i][j].style.width = this.col_label[j].style.width;

			for (j = 0; j < this.col_label.length; j++)
				this.table_data[i][j].innerHTML = data[i][this.col_title[j]];
		}
	}

	this.create_code = function(j, i)
	{
		var index = this.code_divs.length;
		var temp_text = this.table_data[i][j].innerHTML;

		document.getElementById(this.id + "_table_data_" + i + "_" + j).style.backgroundColor = "transparent";
		document.getElementById(this.id + "_table_data_" + i + "_" + j).style.fontFamily = "";
		document.getElementById(this.id + "_table_data_" + i + "_" + j).style.fontSize = "13px";

		this.code_divs[index] = ace.edit(this.id + "_table_data_" + i + "_" + j);
		this.code_divs[index].setShowPrintMargin(false);
	    this.code_divs[index].setTheme("ace/theme/monokai");
	    this.code_divs[index].session.setMode("ace/mode/" + this.col_sub[j]);

	    if (this.col_sub[j] == "javascript")
	    	this.code_divs[index].setOptions({"enableLiveAutocompletion": true});
	    
	    this.code_divs[index].getSession().setUseWorker(false);	
	    this.code_divs[index].getSession().setUseWrapMode(true);

		this.code_divs[index].setValue(temp_text);
		this.code_divs[index].clearSelection();
		this.code_divs[index].navigateFileStart();

		//this.code_divs[index].destroy();

	    this.table_codes[i][j] = index;

	    this.code_divs[index].resize();

	    this.code_divs[index].session.on('change', function(this_table) 
	    {
			return function(evt)
			{
				update_data(this_table);
			}
		} (this));		
	}

	this.load_codes = function()
	{
		var code_flag = false;

		for (var j = 0; j < this.col_title.length; j++)
		{
			if (this.col_type[j] == "code")
			{
				code_flag = true;

				for (var i = 0; i < this.row_label.length; i++)
				{
					if (this.table_codes[i][j] == undefined)
						this.create_code(j, i);
				}
			}
		}

		if (code_flag == true)
			this.adjust_row_height(0, -180);
	}

	this.adjust_row_height = function(row, quant)
	{
		for (var i = 0; i < this.row_label.length; i++)
		{
			this.row_height[i] -= quant;
			this.row_label[i].style.height = (parseInt(this.row_label[i].style.height) - quant) + "px";
			this.row_label[i].style.top = (this.row_start + (this.row_height[i] * i)) + "px";
		}

		for (var j = 0; j < this.col_title.length; j++)
		{
			for (var i = 0; i < this.row_label.length; i++)
			{
				this.table_data[i][j].style.height = (parseInt(this.table_data[i][j].style.height) - quant) + "px";
				this.table_data[i][j].style.top = (this.row_start + (this.row_height[i] * i)) + "px";
			}
		}

		this.default_height -= quant;
	}

	this.do_tab_order = function()
	{
		var base_tab = 1000 * (this.index + 1);
		var quant = 0;

		for (var i = 0; i < this.row_max; i++)
		{
			for (var j = 0; j < this.col_max; j++) 
			{
				if (this.table_data[i][j] != undefined)
					this.table_data[i][j].tabIndex = base_tab + quant;

				quant++;
			}
		}
	}

	this.resize_col = function(quant)
	{ 
		this.col_label[this.resize_index].style.width = (parseInt(this.col_label[this.resize_index].style.width) - quant) + "px"; 
		this.col_width[this.resize_index] -= quant;

		for (var j = this.resize_index + 1; j < this.col_label.length; j++)
			this.col_label[j].style.left = (parseInt(this.col_label[j].style.left) - quant) + "px"; 

		for (var i = 0; i < this.row_label.length; i++)
		{
			this.table_data[i][this.resize_index].style.width = (parseInt(this.table_data[i][this.resize_index].style.width) - quant) + "px";

			for (var j = this.resize_index + 1; j < this.col_label.length; j++)
				this.table_data[i][j].style.left = (parseInt(this.table_data[i][j].style.left) - quant) + "px";
		}

		if (this.col_type[this.resize_index] == "code")
		{
			for (var i = 0; i < this.code_divs.length; i++)
				this.code_divs[i].resize();
		}
	}
}

function contextmenu(data) 
{
	this.id = data.id;
	this.width = window.innerWidth;
	this.width = data.width;
	this.backgroundColor = data.background;
	this.backgroundHover = data.backgroundHover;
	this.backgroundSelect = data.backgroundSelect;
	this.fontFamily = data.fontFamily;
	this.fontSize = data.fontSize;
	this.color = data.color;

	this.menu_div = document.createElement("div");
	this.menu_div.id = data.id;
	this.menu_div.style.position = "absolute";

	this.menu_div.style.top = "0px";
	this.menu_div.style.left = "0px";

	this.menu_div.style.width = data.width + "px";
	this.menu_div.style.height = "400px";

	this.menu_div.style.zIndex = "10000";

	this.menu_div.style.backgroundColor = data.background;

	document.body.appendChild(this.menu_div);

	this.menu_items_div = document.createElement("div");
	this.menu_items_div.id = data.id;
	this.menu_items_div.style.position = "absolute";

	this.menu_items_div.style.top = "0px";
	this.menu_items_div.style.left = "0px";

	this.menu_items_div.style.width = data.width + "px";
	this.menu_items_div.style.height = "400px";

	this.menu_div.appendChild(this.menu_items_div);

	this.show = function()
	{
		this.menu_div.style.visibility = "visible";
	}

	this.hide = function()
	{
		this.menu_div.style.visibility = "hidden";
	}

	this.clear = function()
	{
		this.menu_div.removeChild(this.menu_items_div);
		this.menu_div.appendChild(this.menu_items_div);

		this.menu_div.style.height = "0px";
		this.menu_items_div.style.height = "0px";
	}

	this.create = function(x, y, width)
	{
		this.menu_div.style.left = x + "px";
		this.menu_div.style.top = y + "px";

		this.menu_div.style.width = width + "px";
		this.menu_items_div.style.width = width + "px";

		this.show();
		this.menu_div.style.height = "200px";
	}
}

function statusbar(data)
{
	this.id = data.id;
	this.width = window.innerWidth;
	this.height = data.height;
	this.backgroundColor = data.background;

	// create main div for properties using supplied data
	this.statusbar_div = document.createElement("div");
	this.statusbar_div.id = data.id;
	this.statusbar_div.style.position = "absolute";

	this.statusbar_div.style.top = (window.innerHeight - data.height) + "px";
	this.statusbar_div.style.left = "0px";

	this.statusbar_div.style.width = window.innerWidth + "px";
	this.statusbar_div.style.height = (data.height - 3) + "px";

	this.statusbar_div.style.backgroundColor = data.background;

	this.statusbar_div.style.fontFamily = "Varta";
	this.statusbar_div.style.fontSize = "13px";
	this.statusbar_div.style.color = "#ffffff";

	this.statusbar_div.style.paddingLeft = "10px";
	this.statusbar_div.style.paddingTop = "3px";

	// add div to application page
	document.body.appendChild(this.statusbar_div);
}

function project_dialog(data)
{
	this.id = data.id;
	this.projects = new Array();
	this.candidates = new Array();

	this.select = -1;
	text_color = "#dddddd";
	back_color = "#353535";
	border_color = "#404040";

	// create main div for project using supplied data
	this.project_div = document.createElement("div");
	this.project_div.id = data.id;
	this.project_div.style.position = "absolute";

	this.project_div.style.width = data.width + "px";
	this.project_div.style.height = data.height + "px";

	this.project_div.style.top = Math.floor((window.innerHeight - data.height) / 2) + "px";
	this.project_div.style.left = Math.floor((window.innerWidth - data.width) / 2) + "px";

	this.project_div.style.backgroundColor = data.background;

	this.project_div.style.borderWidth = "1px";
	this.project_div.style.borderStyle = "solid";
	this.project_div.style.borderColor = border_color;

	this.project_div.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";
	this.project_div.style.zIndex = 100;

	this.project_div.style.visibility = "hidden";

	// add div to application page
	document.body.appendChild(this.project_div);

	// create main div header for project using supplied data
	this.project_div_header = document.createElement("div");
	this.project_div_header.id = data.id;
	this.project_div_header.style.position = "absolute";

	this.project_div_header.style.top = "0px";
	this.project_div_header.style.left = "0px";

	this.project_div_header.style.width = (data.width - 7) + "px";
	this.project_div_header.style.height = "24px";

	this.project_div_header.style.backgroundColor = "#007acc";
	this.project_div_header.style.color = "#ffffff";

	this.project_div_header.style.fontFamily = "Varta";
	this.project_div_header.style.fontSize = "13px";

	this.project_div_header.style.paddingLeft = "7px";
	this.project_div_header.style.paddingTop = "5px";

	this.project_div_header.innerHTML = "New Project";

	// add div to main project div
	this.project_div.appendChild(this.project_div_header);

	this.project_name_header = document.createElement("div");
	this.project_name_header.id = data.id;
	this.project_name_header.style.position = "absolute";

	this.project_name_header.style.top = "42px";
	this.project_name_header.style.left = "18px";

	this.project_name_header.style.width = "140px";
	this.project_name_header.style.height = "24px";

	this.project_name_header.style.color = text_color;

	this.project_name_header.style.fontFamily = "Varta";
	this.project_name_header.style.fontSize = "13px";

	this.project_name_header.innerHTML = "Project Name:";

	this.project_div.appendChild(this.project_name_header);

	this.project_name_text = document.createElement("input");
	this.project_name_text.id = data.id + "_projname";
	this.project_name_text.style.position = "absolute";

	this.project_name_text.style.top = "60px";
	this.project_name_text.style.left = "18px";

	this.project_name_text.style.paddingLeft = "4px";

	this.project_name_text.style.width = "620px";
	this.project_name_text.style.height = "20px";

	this.project_name_text.style.color = text_color;

	this.project_name_text.style.backgroundColor = back_color;
	this.project_name_text.style.borderStyle = "solid";
	this.project_name_text.style.borderColor = border_color;

	this.project_name_text.style.fontFamily = "Varta";
	this.project_name_text.style.fontSize = "13px";

	this.project_div.appendChild(this.project_name_text);

	this.project_loc_header = document.createElement("div");
	this.project_loc_header.id = data.id;
	this.project_loc_header.style.position = "absolute";

	this.project_loc_header.style.top = "107px";
	this.project_loc_header.style.left = "18px";

	this.project_loc_header.style.width = "140px";
	this.project_loc_header.style.height = "24px";

	this.project_loc_header.style.color = text_color;

	this.project_loc_header.style.fontFamily = "Varta";
	this.project_loc_header.style.fontSize = "13px";

	this.project_loc_header.innerHTML = "Location:";

	this.project_div.appendChild(this.project_loc_header);

	this.project_loc_text = document.createElement("input");
	this.project_loc_text.id = data.id + "_loc";
	this.project_loc_text.style.position = "absolute";

	this.project_loc_text.style.top = "125px";
	this.project_loc_text.style.left = "18px";

	this.project_loc_text.style.paddingLeft = "4px";

	this.project_loc_text.style.width = "620px";
	this.project_loc_text.style.height = "20px";

	this.project_loc_text.style.color = text_color;

	this.project_loc_text.style.backgroundColor = back_color;
	this.project_loc_text.style.borderStyle = "solid";
	this.project_loc_text.style.borderColor = border_color;

	this.project_loc_text.style.fontFamily = "Varta";
	this.project_loc_text.style.fontSize = "13px";

	this.project_div.appendChild(this.project_loc_text);

	this.project_dir = document.createElement("button");
	this.project_dir.id = data.id;
	this.project_dir.style.position = "absolute";

	this.project_dir.style.top = "125px";
	this.project_dir.style.left = "650px";

	this.project_dir.style.width = "26px";
	this.project_dir.style.height = "26px";

	this.project_dir.style.color = text_color;

	this.project_dir.style.backgroundColor = back_color;
	this.project_dir.style.borderStyle = "solid";
	this.project_dir.style.borderColor = border_color;

	this.project_dir.style.fontFamily = "Varta";
	this.project_dir.style.fontSize = "13px";

	this.project_dir.innerHTML = "...";

	this.project_div.appendChild(this.project_dir);

	this.project_dir.onclick = (function (this_project)
	{
		return function(evt)
		{
			open_type = "project_new";

			document.getElementById("projectDialog").nwworkingdir = homedir;
			document.getElementById("projectDialog").multiple = false;
			chooseFile("#projectDialog");
		}
	}) (this);

	this.project_file_header = document.createElement("div");
	this.project_file_header.id = data.id;
	this.project_file_header.style.position = "absolute";

	this.project_file_header.style.top = "172px";
	this.project_file_header.style.left = "18px";

	this.project_file_header.style.width = "140px";
	this.project_file_header.style.height = "24px";

	this.project_file_header.style.color = text_color;

	this.project_file_header.style.fontFamily = "Varta";
	this.project_file_header.style.fontSize = "13px";

	this.project_file_header.innerHTML = "Filename:";

	this.project_div.appendChild(this.project_file_header);

	this.project_file_text = document.createElement("input");
	this.project_file_text.id = data.id + "_projfile";
	this.project_file_text.style.position = "absolute";

	this.project_file_text.style.top = "190px";
	this.project_file_text.style.left = "18px";

	this.project_file_text.style.paddingLeft = "4px";

	this.project_file_text.style.width = "620px";
	this.project_file_text.style.height = "20px";

	this.project_file_text.style.color = text_color;

	this.project_file_text.style.backgroundColor = back_color;
	this.project_file_text.style.borderStyle = "solid";
	this.project_file_text.style.borderColor = border_color;

	this.project_file_text.style.fontFamily = "Varta";
	this.project_file_text.style.fontSize = "13px";

	this.project_div.appendChild(this.project_file_text);

	this.project_nwjs_header = document.createElement("div");
	this.project_nwjs_header.id = data.id;
	this.project_nwjs_header.style.position = "absolute";

	this.project_nwjs_header.style.top = "237px";
	this.project_nwjs_header.style.left = "18px";

	this.project_nwjs_header.style.width = "140px";
	this.project_nwjs_header.style.height = "24px";

	this.project_nwjs_header.style.color = text_color;

	this.project_nwjs_header.style.fontFamily = "Varta";
	this.project_nwjs_header.style.fontSize = "13px";

	this.project_nwjs_header.innerHTML = "NW.js:";

	this.project_div.appendChild(this.project_nwjs_header);

	this.project_copy_nwjs_text = document.createElement("input");
	this.project_copy_nwjs_text.setAttribute("type", "checkbox");
	this.project_copy_nwjs_text.checked = true;

	this.project_copy_nwjs_text.id = data.id + "_copynwjs";
	this.project_copy_nwjs_text.style.position = "absolute";

	this.project_copy_nwjs_text.style.top = "258px";
	this.project_copy_nwjs_text.style.left = "18px";

	this.project_div.appendChild(this.project_copy_nwjs_text);

	this.project_nwjs_copyto = document.createElement("div");
	this.project_nwjs_copyto.id = data.id;
	this.project_nwjs_copyto.style.position = "absolute";

	this.project_nwjs_copyto.style.top = "260px";
	this.project_nwjs_copyto.style.left = "40px";

	this.project_nwjs_copyto.style.width = "140px";
	this.project_nwjs_copyto.style.height = "24px";

	this.project_nwjs_copyto.style.color = text_color;

	this.project_nwjs_copyto.style.fontFamily = "Varta";
	this.project_nwjs_copyto.style.fontSize = "13px";

	this.project_nwjs_copyto.innerHTML = "Copy to project";

	this.project_div.appendChild(this.project_nwjs_copyto);

	this.project_nwjs_file = document.createElement("div");
	this.project_nwjs_file.id = data.id;
	this.project_nwjs_file.style.position = "absolute";

	this.project_nwjs_file.style.top = "260px";
	this.project_nwjs_file.style.left = "165px";

	this.project_nwjs_file.style.width = "140px";
	this.project_nwjs_file.style.height = "24px";

	this.project_nwjs_file.style.color = text_color;

	this.project_nwjs_file.style.fontFamily = "Varta";
	this.project_nwjs_file.style.fontSize = "13px";

	this.project_nwjs_file.innerHTML = "File:";

	this.project_div.appendChild(this.project_nwjs_file);

	this.project_nwjs_text = document.createElement("input");
	this.project_nwjs_text.id = data.id + "_nwjs";
	this.project_nwjs_text.style.position = "absolute";

	this.project_nwjs_text.style.top = "255px";
	this.project_nwjs_text.style.left = "193px";

	this.project_nwjs_text.style.paddingLeft = "4px";

	this.project_nwjs_text.style.width = "445px";
	this.project_nwjs_text.style.height = "20px";

	this.project_nwjs_text.style.color = text_color;

	this.project_nwjs_text.style.backgroundColor = back_color;
	this.project_nwjs_text.style.borderStyle = "solid";
	this.project_nwjs_text.style.borderColor = border_color;

	this.project_nwjs_text.style.fontFamily = "Varta";
	this.project_nwjs_text.style.fontSize = "13px";

	this.project_div.appendChild(this.project_nwjs_text);

	this.nwjs_dir = document.createElement("button");
	this.nwjs_dir.id = data.id;
	this.nwjs_dir.style.position = "absolute";

	this.nwjs_dir.style.top = "255px";
	this.nwjs_dir.style.left = "650px";

	this.nwjs_dir.style.width = "26px";
	this.nwjs_dir.style.height = "26px";

	this.nwjs_dir.style.color = text_color;

	this.nwjs_dir.style.backgroundColor = back_color;
	this.nwjs_dir.style.borderStyle = "solid";
	this.nwjs_dir.style.borderColor = border_color;

	this.nwjs_dir.style.fontFamily = "Varta";
	this.nwjs_dir.style.fontSize = "13px";

	this.nwjs_dir.innerHTML = "...";

	this.project_div.appendChild(this.nwjs_dir);

	this.nwjs_dir.onclick = (function (this_project)
	{
		return function(evt)
		{
			open_type = "nwjs_file";

			document.getElementById("loadDialog").nwworkingdir = process.cwd() + "\\nwjs";
			document.getElementById("loadDialog").accept = ".zip";
			document.getElementById("loadDialog").multiple = false;
			chooseFile("#loadDialog");
		}
	}) (this);

	this.project_images_header = document.createElement("div");
	this.project_images_header.id = data.id;
	this.project_images_header.style.position = "absolute";

	this.project_images_header.style.top = "295px";
	this.project_images_header.style.left = "18px";

	this.project_images_header.style.width = "140px";
	this.project_images_header.style.height = "24px";

	this.project_images_header.style.color = text_color;

	this.project_images_header.style.fontFamily = "Varta";
	this.project_images_header.style.fontSize = "13px";

	this.project_images_header.innerHTML = "Images:";

	this.project_div.appendChild(this.project_images_header);

	this.project_copy_img_text = document.createElement("input");
	this.project_copy_img_text.setAttribute("type", "checkbox");
	this.project_copy_img_text.checked = true;

	this.project_copy_img_text.id = data.id + "_copyimg";
	this.project_copy_img_text.style.position = "absolute";

	this.project_copy_img_text.style.top = "316px";
	this.project_copy_img_text.style.left = "18px";

	this.project_div.appendChild(this.project_copy_img_text);

	this.project_copy_img_text.onchange = (function (this_project)
	{
		return function(evt)
		{
			if (this.checked == false)
			{
				alert("It is highly recommended that you allow the images folder to be copied to your project folder. Many of the controls will not function properly without these images.");
			}
		}
	}) (this);

	this.project_img_copyto = document.createElement("div");
	this.project_img_copyto.id = data.id;
	this.project_img_copyto.style.position = "absolute";

	this.project_img_copyto.style.top = "318px";
	this.project_img_copyto.style.left = "40px";

	this.project_img_copyto.style.width = "140px";
	this.project_img_copyto.style.height = "24px";

	this.project_img_copyto.style.color = text_color;

	this.project_img_copyto.style.fontFamily = "Varta";
	this.project_img_copyto.style.fontSize = "13px";

	this.project_img_copyto.innerHTML = "Copy to project";

	this.project_div.appendChild(this.project_img_copyto);

	this.project_img_file = document.createElement("div");
	this.project_img_file.id = data.id;
	this.project_img_file.style.position = "absolute";

	this.project_img_file.style.top = "318px";
	this.project_img_file.style.left = "150px";

	this.project_img_file.style.width = "140px";
	this.project_img_file.style.height = "24px";

	this.project_img_file.style.color = text_color;

	this.project_img_file.style.fontFamily = "Varta";
	this.project_img_file.style.fontSize = "13px";

	this.project_img_file.innerHTML = "Folder:";

	this.project_div.appendChild(this.project_img_file);

	this.project_img_text = document.createElement("input");
	this.project_img_text.id = data.id + "_img";
	this.project_img_text.style.position = "absolute";

	this.project_img_text.style.top = "313px";
	this.project_img_text.style.left = "193px";

	this.project_img_text.style.paddingLeft = "4px";

	this.project_img_text.style.width = "445px";
	this.project_img_text.style.height = "20px";

	this.project_img_text.style.color = text_color;

	this.project_img_text.style.backgroundColor = back_color;
	this.project_img_text.style.borderStyle = "solid";
	this.project_img_text.style.borderColor = border_color;

	this.project_img_text.style.fontFamily = "Varta";
	this.project_img_text.style.fontSize = "13px";

	this.project_div.appendChild(this.project_img_text);

	this.img_dir = document.createElement("button");
	this.img_dir.id = data.id;
	this.img_dir.style.position = "absolute";

	this.img_dir.style.top = "313px";
	this.img_dir.style.left = "650px";

	this.img_dir.style.width = "26px";
	this.img_dir.style.height = "26px";

	this.img_dir.style.color = text_color;

	this.img_dir.style.backgroundColor = back_color;
	this.img_dir.style.borderStyle = "solid";
	this.img_dir.style.borderColor = border_color;

	this.img_dir.style.fontFamily = "Varta";
	this.img_dir.style.fontSize = "13px";

	this.img_dir.innerHTML = "...";

	this.project_div.appendChild(this.img_dir);

	this.img_dir.onclick = (function (this_project)
	{
		return function(evt)
		{
			open_type = "img_folder";

			document.getElementById("projectDialog").nwworkingdir = process.cwd();
			document.getElementById("projectDialog").multiple = false;
			chooseFile("#projectDialog");
		}
	}) (this);

	this.project_create = document.createElement("button");
	this.project_create.id = data.id;
	this.project_create.style.position = "absolute";

	this.project_create.style.top = (data.height - 38) + "px";
	this.project_create.style.left = (data.width - 90) + "px";

	this.project_create.style.paddingTop = "4px";
	this.project_create.style.width = "80px";
	this.project_create.style.height = "27px";

	this.project_create.style.color = text_color;

	this.project_create.style.backgroundColor = back_color;
	this.project_create.style.borderStyle = "solid";
	this.project_create.style.borderColor = border_color;

	this.project_create.style.fontFamily = "Varta";
	this.project_create.style.fontSize = "13px";

	this.project_create.innerHTML = "Create";

	this.project_div.appendChild(this.project_create);

	this.project_create.onclick = (function (this_project)
	{
		return function(evt)
		{
			main_project.hide();
			build_output_window();

			var output_text = document.getElementById("output_text");
			output_text.innerHTML = "";

			project_folder = document.getElementById("project_dialog_loc").value + "/" + document.getElementById("project_dialog_projname").value;
			output_text.innerHTML += "Creating folder " + project_folder + "...<br>";

			if (!fs.existsSync(project_folder))
			{
				try
				{
					fs.mkdirSync(project_folder);
					output_text.innerHTML += "Folder created successfully...<br>";
				} 
				catch (e) 
				{
					output_text.innerHTML += e.message + "<br>";
					return;
				}
			}
			else
				output_text.innerHTML += "Folder already exists...<br>";

		    output_text.innerHTML += "Creating folder " + project_folder + "/img...<br>";

			if (!fs.existsSync(project_folder + "/img"))
			{
				try
				{
					fs.mkdirSync(project_folder + "/img");
					output_text.innerHTML += "Folder created successfully...<br>";
				} 
				catch (e) 
				{
					output_text.innerHTML += e.message + "<br>";
					return;
				}
			}
			else
				output_text.innerHTML += "Folder already exists...<br>";

		    output_text.innerHTML += "Copying image files from " + document.getElementById("project_dialog_img").value + " to " + project_folder + "...<br>";

		    try
		    {
				fs.copyFileSync(system_folder + "/img/checkbox_on.png", project_folder + "/img/checkbox_on.png");
				fs.copyFileSync(system_folder + "/img/checkbox_off.png", project_folder + "/img/checkbox_off.png");
				fs.copyFileSync(system_folder + "/img/adjuster_left.png", project_folder + "/img/adjuster_left.png");
				fs.copyFileSync(system_folder + "/img/adjuster_right.png", project_folder + "/img/adjuster_right.png");

				output_text.innerHTML += "Image files copied successfully...<br>";
		    }
		    catch (e)
		    {
				output_text.innerHTML += e.message + "<br>";
				return;
		    }

		    output_text.innerHTML += "Copying runtime files from " + document.getElementById("project_dialog_img").value + " to " + project_folder + "...<br>";

		    try
		    {
	  			fs.copyFileSync(system_folder + "/digero_runtime.html", project_folder + "/digero_runtime.html");
	  			fs.copyFileSync(system_folder + "/digero_runtime.js", project_folder + "/digero_runtime.js");
	  			fs.copyFileSync(system_folder + "/object_template.json", project_folder + "/object_template.json");

				output_text.innerHTML += "Runtime files copied successfully...<br>";
		    }
		    catch (e)
		    {
				output_text.innerHTML += e.message + "<br>";
				return;
		    }

		    output_text.innerHTML += "Creating project files...<br>";

		    try
		    {
  				project_data = {}
	  			project_data.name = document.getElementById("project_dialog_projfile").value;
	  			project_data.file = project_folder + "/" + project_data.name + ".prj";
	  			project_data.runtime_html = "digero_runtime.html";
	  			project_data.runtime_js = "digero_runtime.js";
	  			project_data.open_form = 0;

	  			project_data.templates = new Array();
	  			project_data.tables = new Array();

	  			fs.writeFileSync(project_folder + "/" + project_data.name, JSON.stringify(project_data, null, 1));

				output_text.innerHTML += "Project files created successfully...<br>";
		    }
		    catch (e)
		    {
				output_text.innerHTML += e.message + "<br>";
				return;
		    }

			output_text.innerHTML += "Extracting files from " + document.getElementById("project_dialog_nwjs").value + " to " + project_folder + "...<br>";

			cp.exec("tar -xf " + nwjs_file + " --strip-components=1 -C " + project_folder, (error, stdout, stderr) => {
			    if (error) {
			        output_text.innerHTML += "Error: " + error.message;
			        return;
			    }
			    if (stderr) {
			        output_text.innerHTML += "Error: " + stderr;
			        return;
			    }

			    output_text.innerHTML += "Files extracted successfully...<br>";

			    output_text.innerHTML += "Finalizing project initialization...<br>";

			    try
			    {
					main_formspace.clear_tabs();
		  			main_formspace.add_tab(true);
					main_formspace.add_code({"index" : 1});
					main_formspace.set_tab_focus(0);

					main_properties.add_properties(0);

					create_templates();

					fs.writeFileSync(project_folder + "/" + project_data.name + ".prj", JSON.stringify(project_data, null, 1));
					fs.writeFileSync(project_folder + "/" + form_file, JSON.stringify(objects, null, 1));
					fs.writeFileSync(project_folder + "/" + project_file, JSON.stringify(project_data, null, 1));
					
					if (!fs.existsSync(project_folder + "/code"))
						fs.mkdirSync(project_folder + "/code");

			  		fs.copyFileSync(system_folder + "/package.json", project_folder + "/package.json");
					fs.writeFileSync(project_folder + "/digero_objects.json", JSON.stringify(objects, null, 1));
					fs.writeFileSync(project_folder + "/sf.txt", "0");

					for (var i = 0; i < main_formspace.tab_types.length; i++)
					{
						if (main_formspace.tab_types[i] == "code")
						{
							var this_file = main_formspace.tab_names[i].innerHTML;
							var this_code = main_formspace.tab_editors[i].getValue();

							fs.writeFileSync(project_folder + "/code/" + this_file, this_code);
						}
					}

					fs.writeFileSync(project_data.file, JSON.stringify(project_data, null, 1));

					update_package(project_data.open_form);

				    output_text.innerHTML += "Project created successfully...<br>";
				    document.body.removeChild(document.getElementById("output_window"));
			    }
			    catch (e)
			    {
					output_text.innerHTML += e.message + "<br>";
					return;
			    }
			});
		}
	}) (this);

	this.project_cancel = document.createElement("button");
	this.project_cancel.id = data.id;
	this.project_cancel.style.position = "absolute";

	this.project_cancel.style.top = (data.height - 38) + "px";
	this.project_cancel.style.left = (data.width - 175) + "px";
 
	this.project_cancel.style.paddingTop = "4px";
	this.project_cancel.style.width = "80px";
	this.project_cancel.style.height = "27px";

	this.project_cancel.style.color = text_color;

	this.project_cancel.style.backgroundColor = back_color;
	this.project_cancel.style.borderStyle = "solid";
	this.project_cancel.style.borderColor = border_color;

	this.project_cancel.style.fontFamily = "Varta";
	this.project_cancel.style.fontSize = "13px";

	this.project_cancel.innerHTML = "Cancel";

	this.project_div.appendChild(this.project_cancel);

	this.project_cancel.onclick = (function (this_project)
	{
		return function(evt)
		{
			this_project.hide();		
		}
	}) (this);

	this.show = function()
	{
		this.project_div.style.top = Math.floor((window.innerHeight - parseInt(this.project_div.style.height)) / 2) + "px";
		this.project_div.style.left = Math.floor((window.innerWidth - parseInt(this.project_div.style.width)) / 2) + "px";

		var counter = 1;
		var proj_exists = true;

		while (proj_exists)
		{
			if (fs.existsSync(homedir + "/DigeroProject" + counter))
				counter++;
			else
				proj_exists = false;			
		}

		document.getElementById("project_dialog_projname").value = "DigeroProject" + counter;
		document.getElementById("project_dialog_loc").value = homedir;
		document.getElementById("project_dialog_projfile").value = "DigeroProject" + counter;

		this.project_div.style.visibility = "visible";

		document.getElementById("project_dialog_projname").focus();
		document.getElementById("project_dialog_projname").select();

		document.getElementById("project_dialog_nwjs").value = nwjs_file.substring(nwjs_file.lastIndexOf("/") + 1, nwjs_file.length);
		document.getElementById("project_dialog_img").value = img_folder;
	}

	this.hide = function()
	{
		this.project_div.style.visibility = "hidden";
	}
}

function propex_div()
{
	this.select_resize = function(quant, side)
	{
		if (side == "left")
		{
			main_properties.properties_div.style.left = (parseInt(main_properties.properties_div.style.left) + quant) + "px";
			main_properties.properties_div.style.width = (parseInt(main_properties.properties_div.style.width) - quant) + "px";

			main_properties.properties_div_header.style.width = (parseInt(main_properties.properties_div_header.style.width) - quant) + "px";
			main_properties.properties_div_list.style.width = (parseInt(main_properties.properties_div_list.style.width) - quant) + "px";
			main_properties.properties_list_container.style.width = (parseInt(main_properties.properties_list_container.style.width) - quant) + "px";

			for (var i = 0; i < main_properties.property_items.length; i++)
			{
				main_properties.property_items[i].style.width = Math.floor(parseInt(main_properties.properties_div_header.style.width) / 2.2) + "px";

				main_properties.property_values[i].style.left = Math.floor(parseInt(main_properties.properties_div_header.style.width) / 2.2) + "px";
				main_properties.property_values[i].style.width = (parseInt(main_properties.properties_div_header.style.width) - Math.floor(parseInt(main_properties.properties_div_header.style.width) / 2.2) - 11) + "px";

				if (main_properties.property_files[i] != undefined)
				{
					if (main_properties.property_files[i].id.search("color") == -1)
						main_properties.property_files[i].style.left = (parseInt(main_properties.properties_div_header.style.width) - 28) + "px";
					else
						main_properties.property_files[i].style.left = (parseInt(main_properties.properties_div_header.style.width) - 58) + "px";
				}
			}

			main_explore.explore_div.style.left = (parseInt(main_explore.explore_div.style.left) + quant) + "px";
			main_explore.explore_div.style.width = (parseInt(main_explore.explore_div.style.width) - quant) + "px";

			main_explore.explore_div_header.style.width = (parseInt(main_explore.explore_div_header.style.width) - quant) + "px";
			main_explore.explore_container.style.width = (parseInt(main_explore.explore_container.style.width) - quant) + "px";
			main_explore.explore_highlight.style.width = (parseInt(main_explore.explore_highlight.style.width) - quant) + "px";
		}
	}
}

function resize_div(data)
{
	this.id = data.id;

	this.resize_div = document.createElement("div");
	this.resize_div.id = data.id;
	this.resize_div.style.position = "absolute";

	this.resize_div.style.width = data.width + "px";
	this.resize_div.style.height = data.height + "px";

	this.resize_div.style.top = data.y + "px";
	this.resize_div.style.left = data.x + "px";

	this.resize_div.style.visibility = "visible";
	//this.resize_div.style.backgroundColor = "#ff0000";

	document.body.appendChild(this.resize_div);

	this.element1 = data.element1;
	this.element2 = data.element2;
	this.dir = data.dir;
	this.mousedown = false;

	this.old_x = -1;
	this.old_y = -1;

	if (this.dir == "horizontal")
	{
		this.resize_div.style.cursor = "ew-resize";

		this.resize_div.onmousedown = (function (this_resize)
		{
			return function(evt)
			{
				var rect = this.getBoundingClientRect();
				var x = evt.clientX;
				var y = evt.clientY;
				
				this_resize.old_x = x;
				this_resize.old_y = y;

				this_resize.mousedown = true;
			}
		}) (this);

		this.resize_div.onmouseup = (function (this_resize)
		{
			return function(evt)
			{				
				this_resize.mousedown = false;
			}
		}) (this);

		this.resize_div.onmousemove = (function (this_resize)
		{
			return function(evt)
			{
				if (this_resize.mousedown == true)
				{
					var rect = this.getBoundingClientRect();
					var x = evt.clientX;
					var y = evt.clientY;

					if (this_resize.dir == "horizontal")
					{
						var quant = (x - this_resize.old_x);

						if (this_resize.element1 != undefined)
							this_resize.element1.select_resize(quant, "right");

						if (this_resize.element2 != undefined)
							this_resize.element2.select_resize(quant, "left");

						this_resize.resize_div.style.left = (parseInt(this_resize.resize_div.style.left) + quant) + "px"; 
					}

					this_resize.old_x = x;
					this_resize.old_y = y;
				}
			}
		}) (this);
	}
	else if (this.dir == "vertical")
	{
		this.resize_div.style.cursor = "ns-resize";

		this.resize_div.onmousedown = (function (this_resize)
		{
			return function(evt)
			{
				var rect = this.getBoundingClientRect();
				var x = evt.clientX;
				var y = evt.clientY;
				
				this_resize.old_x = x;
				this_resize.old_y = y;

				this_resize.mousedown = true;
			}
		}) (this);

		this.resize_div.onmouseup = (function (this_resize)
		{
			return function(evt)
			{				
				this_resize.mousedown = false;
			}
		}) (this);

		this.resize_div.onmousemove = (function (this_resize)
		{
			return function(evt)
			{
				if (this_resize.mousedown == true)
				{
					var rect = this.getBoundingClientRect();
					var x = evt.clientX;
					var y = evt.clientY;

					if (this_resize.dir == "vertical")
					{
						var quant = (y - this_resize.old_y);

						if (this_resize.element1 != undefined)
							this_resize.element1.select_resize(quant, "bottom");

						if (this_resize.element2 != undefined)
							this_resize.element2.select_resize(quant, "top");

						this_resize.resize_div.style.top = (parseInt(this_resize.resize_div.style.top) + quant) + "px"; 
					}

					this_resize.old_x = x;
					this_resize.old_y = y;
				}
			}
		}) (this);
	}
}

function functions_dialog(data)
{
	this.id = data.id;
	this.functionss = new Array();
	this.candidates = new Array();
	this.funcs = new Array();

	this.select = -1;

	// create main div for functions using supplied data
	this.functions_div = document.createElement("div");
	this.functions_div.id = data.id;
	this.functions_div.style.position = "absolute";

	this.functions_div.style.width = data.width + "px";
	this.functions_div.style.height = data.height + "px";

	this.functions_div.style.top = Math.floor((window.innerHeight - data.height) / 2) + "px";
	this.functions_div.style.left = Math.floor((window.innerWidth - data.width) / 2) + "px";

	this.functions_div.style.backgroundColor = data.background;

	this.functions_div.style.borderWidth = "1px";
	this.functions_div.style.borderStyle = "solid";
	this.functions_div.style.borderColor = "#000000";

	this.functions_div.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";
	this.functions_div.style.zIndex = 100;

	this.functions_div.style.visibility = "hidden";

	// add div to application page
	document.body.appendChild(this.functions_div);

	// create main div header for functions using supplied data
	this.functions_div_header = document.createElement("div");
	this.functions_div_header.id = data.id;
	this.functions_div_header.style.position = "absolute";

	this.functions_div_header.style.top = "0px";
	this.functions_div_header.style.left = "0px";

	this.functions_div_header.style.width = (data.width - 7) + "px";
	this.functions_div_header.style.height = "24px";

	this.functions_div_header.style.backgroundColor = data.background_header;
	this.functions_div_header.style.color = "#000000";

	this.functions_div_header.style.fontFamily = "Varta";
	this.functions_div_header.style.fontSize = "13px";

	this.functions_div_header.style.paddingLeft = "7px";
	this.functions_div_header.style.paddingTop = "5px";

	this.functions_div_header.innerHTML = "Function Explorer";

	// add div to main functions div
	this.functions_div.appendChild(this.functions_div_header);

	this.header_boxx = document.createElement("div");
	this.header_boxx.id = "fx_header_boxx";
	this.header_boxx.style.position = "absolute";

	this.header_boxx.style.top = "0px";
	this.header_boxx.style.left = (data.width - 45) + "px";
	this.header_boxx.style.paddingTop = "5px";

	this.header_boxx.style.width = "45px";
	this.header_boxx.style.height = "25px";

	this.header_boxx.style.backgroundColor = "transparent"; 
	this.header_boxx.innerHTML = "<center><img id = \"fx_header_boxx_img\" src = \"img/window_x.png\"></center>";

	this.functions_div.appendChild(this.header_boxx);	

	this.header_boxx.addEventListener("mouseover", function ()
	{
		return function(evt)
		{
			this.style.backgroundColor = "#e81123";

			var x_id = this.id + "_img";
			document.getElementById(x_id).src = "img/window_redx.png";
		}
	} (), false);

	this.header_boxx.addEventListener("mouseout", function ()
	{
		return function(evt)
		{
			this.style.backgroundColor = "transparent";

			var x_id = this.id + "_img";
			document.getElementById(x_id).src = "img/window_x.png";
		}
	} (), false);

	this.header_boxx.addEventListener("click", function (this_functions)
	{
		return function(evt)
		{
			this_functions.hide();
		}
	} (this), false);

	this.functions_div_search = document.createElement("input");
	this.functions_div_search.id = data.id + "_search";
	this.functions_div_search.style.position = "absolute";

	this.functions_div_search.style.top = "30px";
	this.functions_div_search.style.left = "1px";

	this.functions_div_search.style.width = (data.width - 12) + "px";
	this.functions_div_search.style.height = "20px";

	this.functions_div_search.style.backgroundColor = "#ffffff";
	this.functions_div_search.style.color = "#000000";

	this.functions_div_search.style.borderStyle = "solid";
	this.functions_div_search.style.borderColor = "#808080";

	this.functions_div_search.style.fontFamily = "ABeeZee";
	this.functions_div_search.style.fontSize = "12px";

	this.functions_div_search.style.paddingLeft = "4px";
	//this.functions_div_search.style.paddingTop = "2px";

	this.functions_div_search.placeholder = "Search";

	this.functions_div.appendChild(this.functions_div_search);

	this.functions_div_search.addEventListener("input", function (this_functions, funcs)
	{
		return function(evt)
		{
			this_functions.search(0, false);
		}
	} (this, this.funcs), false);

	this.functions_div_name = document.createElement("div");
	this.functions_div_name.id = data.id;
	this.functions_div_name.style.position = "absolute";

	this.functions_div_name.style.top = "53px";
	this.functions_div_name.style.left = "1px";

	this.functions_div_name.style.width = (Math.floor((data.width / 5) * 3) - 4) + "px";
	this.functions_div_name.style.height = "18px";

	this.functions_div_name.style.backgroundColor = "#4c5968";
	this.functions_div_name.style.color = "#ffffff";

	this.functions_div_name.style.fontFamily = "ABeeZee";
	this.functions_div_name.style.fontSize = "13px";

	this.functions_div_name.style.paddingLeft = "4px";
	this.functions_div_name.style.paddingTop = "2px";

	this.functions_div_name.innerHTML = "Name";

	// add div to main functions div
	this.functions_div.appendChild(this.functions_div_name);

	this.functions_div_file = document.createElement("div");
	this.functions_div_file.id = data.id;
	this.functions_div_file.style.position = "absolute";

	this.functions_div_file.style.top = "53px";
	this.functions_div_file.style.left = (parseInt(this.functions_div_name.style.width) + 5) + "px";

	this.functions_div_file.style.width = (Math.floor((data.width / 5) * 2) - 7) + "px";
	this.functions_div_file.style.height = "18px";

	this.functions_div_file.style.backgroundColor = "#4c5968";
	this.functions_div_file.style.color = "#ffffff";

	this.functions_div_file.style.fontFamily = "ABeeZee";
	this.functions_div_file.style.fontSize = "13px";

	this.functions_div_file.style.paddingLeft = "4px";
	this.functions_div_file.style.paddingTop = "2px";

	this.functions_div_file.innerHTML = "File";

	// add div to main functions div
	this.functions_div.appendChild(this.functions_div_file);

	this.explore_container = document.createElement("div");
	this.explore_container.id = data.id + "container";
	this.explore_container.style.position = "absolute";

	this.explore_container.style.top = "74px";
	this.explore_container.style.left = "1px";

	this.explore_container.style.backgroundColor = "#303841";

	this.explore_container.style.width = (data.width - 2) + "px";
	this.explore_container.style.height = (data.height - 101) + "px";

	this.explore_container.style.overflowY = "scroll";
	this.explore_container.style.overflowX = "hidden";

	this.functions_div.appendChild(this.explore_container);

	this.go_functions = function()
	{
		this.funcs.length = 0;

  		for (var i = 0; i < main_formspace.tab_names.length; i++)
		{
			if (main_formspace.tab_editors[i] != undefined)
			{
				var code = main_formspace.tab_editors[i].getValue();

				var start_pos = 0;
				var func_pos;

				do
				{
					func_pos = code.indexOf("= function(", start_pos);

					if (func_pos != -1)
					{
						var name_start_pos = func_pos - 1;

						while (code.substr(name_start_pos, 1) == " ")
							name_start_pos--;

						while(code.substr(name_start_pos, 1) != "\n" && code.substr(name_start_pos, 1) != " ")
							name_start_pos--;

						name_start_pos++;

						var name_end_pos = name_start_pos;

						while(code.substr(name_end_pos, 1) != " " && code.substr(name_end_pos, 1) != "=")
							name_end_pos++;

						var index = this.funcs.length;

						this.funcs[index] = {};
						this.funcs[index].name = code.substring(name_start_pos, name_end_pos);
						this.funcs[index].type = "function";
						this.funcs[index].file = main_formspace.tab_names[i].innerHTML;

						var code_pos = name_start_pos;

						while(code.substr(code_pos, 1) != "\n")
							code_pos++;

						this.funcs[index].code = code.substring(name_start_pos, code_pos);

						if (this.funcs[index].name.substring(0, 5) == "this.")
						{
							parent_index = index - 1;

							if (this.funcs[parent_index].childs == undefined)
								this.funcs[parent_index].childs = new Array();

							this.funcs[parent_index].childs[this.funcs[parent_index].childs.length] = this.funcs[index].name;
								this.funcs.splice(index, 1);
						}

						start_pos = func_pos + 1;
					}

				} while (func_pos != -1);

				var start_pos = 0;
				var func_pos;

				do
				{
					func_pos = code.indexOf("addEventListener", start_pos);

					if (func_pos != -1)
					{
						var object_end_pos = func_pos - 1;

						while (code.substr(object_end_pos, 1) != "\"")
							object_end_pos--;

						object_start_pos = object_end_pos - 1;

						while (code.substr(object_start_pos, 1) != "\"")
							object_start_pos--;						

						var object_name = code.substring(object_start_pos + 1, object_end_pos);

						var func_start_pos = object_start_pos;

						while(code.substr(func_start_pos, 8) != "document")
							func_start_pos--;

						var event_start_pos = func_pos;

						while (code.substr(event_start_pos, 1) != "\"")
							event_start_pos++;

						event_end_pos = event_start_pos + 1;

						while (code.substr(event_end_pos, 1) != "\"")
							event_end_pos++;						

						var event_name = code.substring(event_start_pos + 1, event_end_pos);

						if (code.substr(object_start_pos - 1, 1) == "(")
						{
							var index = this.funcs.length;

							this.funcs[index] = {};
							this.funcs[index].name = object_name + "." + event_name;
							this.funcs[index].type = "event";
							this.funcs[index].file = main_formspace.tab_names[i].innerHTML;						

							var code_pos = func_start_pos;

							while(code.substr(code_pos, 1) != "\n")
								code_pos++;

							this.funcs[index].code = code.substring(func_start_pos, code_pos);
						}

						start_pos = func_pos + 1;
					}

				} while (func_pos != -1);
			}
		}

		this.funcs = sortByKey(this.funcs, "name");
		
		this.functions_div.removeChild(this.explore_container);

		this.explore_container = document.createElement("div");
		this.explore_container.id = data.id + "container";
		this.explore_container.style.position = "absolute";

		this.explore_container.style.top = "74px";
		this.explore_container.style.left = "1px";

		this.explore_container.style.backgroundColor = "#303841";

		this.explore_container.style.width = (data.width - 2) + "px";
		this.explore_container.style.height = (data.height - 101) + "px";

		this.explore_container.style.overflowY = "scroll";
		this.explore_container.style.overflowX = "hidden";

		this.functions_div.appendChild(this.explore_container);

		var index = 0;

		for (var i = 0; i < this.funcs.length; i++)
		{
			var entry_div = document.createElement("div");
			entry_div.id = this.id + "_entry_" + index;
			entry_div.style.position = "absolute";

			entry_div.style.top = (index * 20) + "px";
			entry_div.style.left = "0px";

			entry_div.style.width = this.explore_container.style.width
			entry_div.style.height = "20px";

			this.explore_container.appendChild(entry_div);

			entry_div.addEventListener("click", function (this_functions, index)
			{
				return function(evt)
				{
					this_functions.highlight(index);
				}
			} (this, index), false);

			entry_div.addEventListener("dblclick", function (this_functions, func)
			{
				return function(evt)
				{
					this_functions.hide();
					this_functions.jumpto();
				}
			} (this, this.funcs[index]), false);

			var entry_name_div = document.createElement("div");
			entry_name_div.id = data.id;
			entry_name_div.style.position = "absolute";

			entry_name_div.style.top = "0px";
			entry_name_div.style.left = "0px";

			entry_name_div.style.width = (Math.floor((data.width / 5) * 3) - 4) + "px";
			entry_name_div.style.height = "18px";

			entry_name_div.style.color = "#eeeeee";

			entry_name_div.style.fontFamily = "ABeeZee";
			entry_name_div.style.fontSize = "12px";

			entry_name_div.style.paddingLeft = "4px";
			entry_name_div.style.paddingTop = "2px";

			entry_name_div.innerHTML = this.funcs[index].name;

			entry_div.appendChild(entry_name_div);

			var entry_file_div = document.createElement("div");
			entry_file_div.id = data.id;
			entry_file_div.style.position = "absolute";

			entry_file_div.style.top = "0px";
			entry_file_div.style.left = (parseInt(entry_name_div.style.width) + 5) + "px";

			entry_file_div.style.width = (Math.floor((data.width / 5) * 2) - 7) + "px";
			entry_file_div.style.height = "18px";

			entry_file_div.style.color = "#eeeeee";

			entry_file_div.style.fontFamily = "ABeeZee";
			entry_file_div.style.fontSize = "12px";

			entry_file_div.style.paddingLeft = "4px";
			entry_file_div.style.paddingTop = "2px";

			entry_file_div.innerHTML = this.funcs[index].file;

			entry_div.appendChild(entry_file_div);

			index++;
		}
	}

	this.highlight = function(index)
	{
		this.select = index;

		for (var i = 0; i < this.funcs.length; i++)
			document.getElementById(this.id + "_entry_" + i).style.backgroundColor = "transparent";

		document.getElementById(this.id + "_entry_" + index).style.backgroundColor = "#4c73a0";
	}

	this.jumpto = function()
	{
		for (i = 0; i < main_formspace.tab_names.length; i++)
		{
			if (main_formspace.tab_names[i].innerHTML == this.funcs[this.select].file)
			{
				main_formspace.set_tab_focus(i);

				var tab_left = parseInt(main_formspace.tabspace_div.style.left);
				var tab_width = parseInt(main_formspace.tabspace_container.style.width);
				var tab_select = parseInt(main_formspace.tab_names[main_formspace.tab_focus_index].style.left);

				if (tab_select + main_formspace.tab_name_width > tab_width - tab_left)
					main_formspace.tabspace_div.style.left = parseInt(main_formspace.tabspace_div.style.left) - ((tab_select + main_formspace.tab_name_width) - (tab_width - tab_left)) + "px";
				else if (tab_left + tab_select < 0)
					main_formspace.tabspace_div.style.left = parseInt(main_formspace.tabspace_div.style.left) + Math.abs(tab_left + tab_select) + "px";

				var editor = main_formspace.tab_editors[i];

				var range = editor.find(this.funcs[this.select].code, {
				    wrap: true,
				    caseSensitive: true, 
				    wholeWord: true,
				    regExp: false,
				    preventScroll: false
				});

				if (range != null)
				{
					editor.selection.setRange(range);
					editor.selection.clearSelection();
					editor.focus();
				}
			}
		}
	}

	this.search = function(start_index, wrap)
	{
		var i = start_index;

		while (i < this.funcs.length && this.funcs[i].name.search(this.functions_div_search.value) == -1)
			i++;

		if (i < this.funcs.length)
		{
			this.highlight(i);

			var top_pos = document.getElementById(this.id + "_entry_" + i).offsetTop;
			this.explore_container.scrollTop = top_pos;
		}
		else if (wrap == true)
		{
			this.search(0, false);
		}
	}

	this.show = function()
	{
		this.functions_div.style.top = Math.floor((window.innerHeight - parseInt(this.functions_div.style.height)) / 2) + "px";
		this.functions_div.style.left = Math.floor((window.innerWidth - parseInt(this.functions_div.style.width)) / 2) + "px";

		this.functions_div.style.visibility = "visible";
		this.functions_div_search.focus();
	}

	this.hide = function()
	{
		this.functions_div.style.visibility = "hidden";
		this.functions_div_search.value = "";
	}
}

function template_dialog(data)
{
	this.id = data.id;
	this.templates = new Array();
	this.candidates = new Array();

	this.select = -1;

	// create main div for template using supplied data
	this.template_div = document.createElement("div");
	this.template_div.id = data.id;
	this.template_div.style.position = "absolute";

	this.template_div.style.width = data.width + "px";
	this.template_div.style.height = data.height + "px";

	this.template_div.style.top = Math.floor((window.innerHeight - data.height) / 2) + "px";
	this.template_div.style.left = Math.floor((window.innerWidth - data.width) / 2) + "px";

	this.template_div.style.backgroundColor = data.background;

	this.template_div.style.borderWidth = "1px";
	this.template_div.style.borderStyle = "solid";
	this.template_div.style.borderColor = "#000000";

	this.template_div.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";
	this.template_div.style.zIndex = 100;

	this.template_div.style.visibility = "hidden";

	// add div to application page
	document.body.appendChild(this.template_div);

	// create main div header for template using supplied data
	this.template_div_header = document.createElement("div");
	this.template_div_header.id = data.id;
	this.template_div_header.style.position = "absolute";

	this.template_div_header.style.top = "0px";
	this.template_div_header.style.left = "0px";

	this.template_div_header.style.width = (data.width - 7) + "px";
	this.template_div_header.style.height = "24px";

	this.template_div_header.style.backgroundColor = data.background_header;
	this.template_div_header.style.color = "#000000";

	this.template_div_header.style.fontFamily = "Varta";
	this.template_div_header.style.fontSize = "13px";

	this.template_div_header.style.paddingLeft = "7px";
	this.template_div_header.style.paddingTop = "5px";

	this.template_div_header.innerHTML = "Templates";

	// add div to main template div
	this.template_div.appendChild(this.template_div_header);

	this.template_div_list = document.createElement("div");
	this.template_div_list.id = data.id + "_list";
	this.template_div_list.style.position = "absolute";

	this.template_div_list.style.top = "60px";
	this.template_div_list.style.left = "15px";

	this.template_div_list.style.width = "180px";
	this.template_div_list.style.height = (data.height - 110) + "px";

	this.template_div_list.style.backgroundColor = "#ffffff";

	this.template_div_list.style.borderWidth = "1px";
	this.template_div_list.style.borderStyle = "solid";
	this.template_div_list.style.borderColor = "#000000";

	this.template_div_list.style.overflowX = "hidden";
	this.template_div_list.style.overflowY = "scroll";

	this.template_div.appendChild(this.template_div_list);

	this.template_list_header = document.createElement("div");
	this.template_list_header.id = data.id;
	this.template_list_header.style.position = "absolute";

	this.template_list_header.style.top = "42px";
	this.template_list_header.style.left = "18px";

	this.template_list_header.style.width = "140px";
	this.template_list_header.style.height = "24px";

	this.template_list_header.style.color = "#000000";

	this.template_list_header.style.fontFamily = "Varta";
	this.template_list_header.style.fontSize = "13px";

	this.template_list_header.innerHTML = "Existing Templates:";

	this.template_div.appendChild(this.template_list_header);

	this.template_add = document.createElement("button");
	this.template_add.id = data.id;
	this.template_add.style.position = "absolute";

	this.template_add.style.top = (data.height - 38) + "px";
	this.template_add.style.left = "28px";

	this.template_add.style.width = "70px";
	this.template_add.style.height = "24px";

	this.template_add.style.color = "#000000";

	this.template_add.style.fontFamily = "Varta";
	this.template_add.style.fontSize = "13px";

	this.template_add.innerHTML = "Add";

	this.template_div.appendChild(this.template_add);

	this.template_add.onclick = (function (this_template)
	{
		return function(evt)
		{
			var counter = 1;

			for (i = 0; i < project_data.templates.length; i++)
				if (project_data.templates[i].name.indexOf("Template") != -1)
					counter++;

			for (var i = 0; i < this_template.candidates.length; i++)
			{
				this_template.candidates[i].style.color = "#000000";
				this_template.candidates[i].style.backgroundColor = "transparent";
			}

			var index = project_data.templates.length;

			project_data.templates[index] = {};
			project_data.templates[index].name = "Template" + counter;
			project_data.templates[index].element = null;
			project_data.templates[index].objects = new Array();

			this_template.create_list();
			this_template.select = index;

			for (var i = 0; i < this_template.templates.length; i++)
			{
				if (i == index)
				{
					this_template.templates[i].style.color = "#ffffff";
					this_template.templates[i].style.backgroundColor = "#007acc";
				}
				else
				{
					this_template.templates[i].style.color = "#000000";
					this_template.templates[i].style.backgroundColor = "transparent";
				}
			}

			this_template.template_name_text.value = project_data.templates[index].name;
			this_template.template_name_text.select();
			this_template.template_name_text.focus();
		}
	}) (this);

	this.template_remove = document.createElement("button");
	this.template_remove.id = data.id;
	this.template_remove.style.position = "absolute";

	this.template_remove.style.top = (data.height - 38) + "px";
	this.template_remove.style.left = "108px";

	this.template_remove.style.width = "70px";
	this.template_remove.style.height = "24px";

	this.template_remove.style.color = "#000000";

	this.template_remove.style.fontFamily = "Varta";
	this.template_remove.style.fontSize = "13px";

	this.template_remove.innerHTML = "Remove";

	this.template_div.appendChild(this.template_remove);

	this.data_context_close = document.createElement("button");
	this.data_context_close.id = data.id;
	this.data_context_close.style.position = "absolute";

	this.data_context_close.style.top = (data.height - 38) + "px";
	this.data_context_close.style.left = "341px";

	this.data_context_close.style.width = "70px";
	this.data_context_close.style.height = "24px";

	this.data_context_close.style.color = "#000000";

	this.data_context_close.style.fontFamily = "Varta";
	this.data_context_close.style.fontSize = "13px";

	this.data_context_close.innerHTML = "Close";

	this.template_div.appendChild(this.data_context_close);

	this.data_context_close.onclick = (function (this_template)
	{
		return function(evt)
		{
			this_template.hide();		
		}
	}) (this);

	this.template_candidates = document.createElement("div");
	this.template_candidates.id = data.id + "_list";
	this.template_candidates.style.position = "absolute";

	this.template_candidates.style.top = "60px";
	this.template_candidates.style.left = "230px";

	this.template_candidates.style.width = "180px";
	this.template_candidates.style.height = (data.height - 160) + "px";

	this.template_candidates.style.backgroundColor = "#ffffff";

	this.template_candidates.style.borderWidth = "1px";
	this.template_candidates.style.borderStyle = "solid";
	this.template_candidates.style.borderColor = "#000000";

	this.template_candidates.style.overflowX = "hidden";
	this.template_candidates.style.overflowY = "scroll";

	this.template_div.appendChild(this.template_candidates);

	this.template_candidates_header = document.createElement("div");
	this.template_candidates_header.id = data.id;
	this.template_candidates_header.style.position = "absolute";

	this.template_candidates_header.style.top = "42px";
	this.template_candidates_header.style.left = "233px";

	this.template_candidates_header.style.width = "140px";
	this.template_candidates_header.style.height = "24px";

	this.template_candidates_header.style.color = "#000000";

	this.template_candidates_header.style.fontFamily = "Varta";
	this.template_candidates_header.style.fontSize = "13px";

	this.template_candidates_header.innerHTML = "Candidate Elements:";

	this.template_div.appendChild(this.template_candidates_header);

	this.template_name_header = document.createElement("div");
	this.template_name_header.id = data.id;
	this.template_name_header.style.position = "absolute";

	this.template_name_header.style.top = "258px";
	this.template_name_header.style.left = "233px";

	this.template_name_header.style.width = "140px";
	this.template_name_header.style.height = "24px";

	this.template_name_header.style.color = "#000000";

	this.template_name_header.style.fontFamily = "Varta";
	this.template_name_header.style.fontSize = "13px";

	this.template_name_header.innerHTML = "Name:";

	this.template_div.appendChild(this.template_name_header);

	this.template_name_text = document.createElement("input");
	this.template_name_text.id = data.id;
	this.template_name_text.style.position = "absolute";

	this.template_name_text.style.top = "275px";
	this.template_name_text.style.left = "230px";

	this.template_name_text.style.width = "170px";
	this.template_name_text.style.height = "20px";

	this.template_name_text.style.color = "#000000";

	this.template_name_text.style.fontFamily = "Varta";
	this.template_name_text.style.fontSize = "13px";

	this.template_div.appendChild(this.template_name_text);

	this.template_name_text.onblur = (function (this_template)
	{
		return function(evt)
		{
			if (this_template.select != -1)
			{
				project_data.templates[this_template.select].name = this.value;
				this_template.create_list();
			}
		}
	}) (this);

	this.create_list = function()
	{
		this.templates.length = 0;

		var elements = this.template_div_list.children;

		for (var i = 0; i < elements.length; i++)
			this.template_div_list.removeChild(elements[i]);

		for (var i = 0; i < project_data.templates.length; i++)
		{
			this.templates[i] = document.createElement("div");
			this.templates[i].id = this.id + "_label_" + i;
			this.templates[i].style.position = "absolute";

			this.templates[i].style.top = (19 * i) + "px";
			this.templates[i].style.left = "0px";

			this.templates[i].style.width = (parseInt(this.template_div_list.style.width) - 9) + "px";
			this.templates[i].style.height = "17px";

			this.templates[i].style.color = "#000000";

			this.templates[i].style.fontFamily = "Varta";
			this.templates[i].style.fontSize = "13px";

			this.templates[i].style.paddingLeft = "3px";
			this.templates[i].style.paddingBottom = "3px";

			this.templates[i].innerHTML = project_data.templates[i].name;

			this.template_div_list.appendChild(this.templates[i]);

			if (this.select == i)
			{
				this.templates[i].style.color = "#ffffff";
				this.templates[i].style.backgroundColor = "#007acc";				
			}

			this.templates[i].onclick = (function (this_template, index)
			{
				return function(evt)
				{
					this_template.select = index;

					for (var i = 0; i < this_template.templates.length; i++)
					{
						if (i == index)
						{
							this_template.templates[i].style.color = "#ffffff";
							this_template.templates[i].style.backgroundColor = "#007acc";
						}
						else
						{
							this_template.templates[i].style.color = "#000000";
							this_template.templates[i].style.backgroundColor = "transparent";
						}
					}

					for (var i = 0; i < this_template.candidates.length; i++)
					{
						if (this_template.candidates[i].innerHTML == project_data.templates[index].element)
						{
							this_template.candidates[i].style.color = "#ffffff";
							this_template.candidates[i].style.backgroundColor = "#007acc";
						}
						else
						{
							this_template.candidates[i].style.color = "#000000";
							this_template.candidates[i].style.backgroundColor = "transparent";
						}
					}

					this_template.template_name_text.value = project_data.templates[index].name;
				}
			}) (this, i);	
		}
	}

	this.create_candidates = function()
	{
		this.candidates.length = 0;

		var elements = this.template_candidates.children;

		for (var i = 0; i < elements.length; i++)
			this.template_candidates.removeChild(elements[i]);

		var objects_temp = new Array();

		for (var i = 0; i < objects.length; i++)
			if (objects[i].container == true)
				objects_temp[objects_temp.length] = objects[i];

		for (var i = 0; i < objects_temp.length; i++)
		{
			this.candidates[i] = document.createElement("div");
			this.candidates[i].id = this.id + "_label_" + i;
			this.candidates[i].style.position = "absolute";

			this.candidates[i].style.top = (19 * i) + "px";
			this.candidates[i].style.left = "0px";

			this.candidates[i].style.width = (parseInt(this.template_div_list.style.width) - 9) + "px";
			this.candidates[i].style.height = "17px";

			this.candidates[i].style.color = "#000000";

			this.candidates[i].style.fontFamily = "Varta";
			this.candidates[i].style.fontSize = "13px";

			this.candidates[i].style.paddingLeft = "3px";
			this.candidates[i].style.paddingBottom = "3px";

			this.candidates[i].innerHTML = objects_temp[i].name;

			this.template_candidates.appendChild(this.candidates[i]);

			this.candidates[i].onclick = (function (this_template, index)
			{
				return function(evt)
				{
					project_data.templates[this_template.select].element = this_template.candidates[index].innerHTML;

					for (var i = 0; i < this_template.candidates.length; i++)
					{
						if (i == index)
						{
							this_template.candidates[i].style.color = "#ffffff";
							this_template.candidates[i].style.backgroundColor = "#007acc";
						}
						else
						{
							this_template.candidates[i].style.color = "#000000";
							this_template.candidates[i].style.backgroundColor = "transparent";
						}
					}

					project_data.templates[this_template.select].objects.length = 0;

					var active_objects = new Array();
					active_objects[0] = project_data.templates[this_template.select].element;

					var start_x = -1;
					var start_y = -1;

					while (active_objects.length > 0)
					{
						for (var i = 0; i < objects.length; i++)
						{
							var obj_len = active_objects.length;

							for (var j = 0; j < obj_len; j++)
							{
								if (objects[i].name == active_objects[j])
								{
									var obj_index = project_data.templates[this_template.select].objects.length;
									project_data.templates[this_template.select].objects[obj_index] = JSON.parse(JSON.stringify(objects[i]));

									if (start_x == -1 && start_y == -1)
									{
										start_x = parseInt(get_property(i, "Left").value);
										start_y = parseInt(get_property(i, "Top").value);
									}
								}
								else if (objects[i].parent == active_objects[j])
								{
									var obj_index = project_data.templates[this_template.select].objects.length;
									project_data.templates[this_template.select].objects[obj_index] = JSON.parse(JSON.stringify(objects[i]));

									if (objects[i].container == true)
										active_objects[active_objects.length] = objects[i].name;
								}
							}
						}

						active_objects.splice(0, obj_len);
					}

					for (i = 0; i < project_data.templates[this_template.select].objects.length; i++)
					{
						if (project_data.templates[this_template.select].objects[i].name == project_data.templates[this_template.select].element)
						{
							project_data.templates[this_template.select].objects[i].left = project_data.templates[this_template.select].objects[i].left - start_x;

							for (var j = 0; j < project_data.templates[this_template.select].objects[i].properties.length; j++)	
								if (project_data.templates[this_template.select].objects[i].properties[j].name == "Left")
									break;

							project_data.templates[this_template.select].objects[i].properties[j].value = project_data.templates[this_template.select].objects[i].properties[j].value - start_x;

							project_data.templates[this_template.select].objects[i].top = project_data.templates[this_template.select].objects[i].top - start_y;

							for (var j = 0; j < project_data.templates[this_template.select].objects[i].properties.length; j++)	
								if (project_data.templates[this_template.select].objects[i].properties[j].name == "Top")
									break;

							project_data.templates[this_template.select].objects[i].properties[j].value = project_data.templates[this_template.select].objects[i].properties[j].value - start_y;
						}
					}

					console.log(project_data.templates[this_template.select]);
				}
			}) (this, i);	
		}
	}

	this.show = function()
	{
		this.template_div.style.top = Math.floor((window.innerHeight - parseInt(this.template_div.style.height)) / 2) + "px";
		this.template_div.style.left = Math.floor((window.innerWidth - parseInt(this.template_div.style.width)) / 2) + "px";

		this.template_div.style.visibility = "visible";

		if (this.select == -1)
		{
			this.create_list();
			this.create_candidates();
		}
	}

	this.hide = function()
	{
		this.template_div.style.visibility = "hidden";
	}
}

create_templates = function()
{
	for (var k = 0; k < project_data.templates.length; k++)
	{
		project_data.templates[k].objects.length = 0;

		var active_objects = new Array();
		active_objects[0] = project_data.templates[k].element;

		var start_x = -1;
		var start_y = -1;

		while (active_objects.length > 0)
		{
			for (var i = 0; i < objects.length; i++)
			{
				var obj_len = active_objects.length;

				for (var j = 0; j < obj_len; j++)
				{
					if (objects[i].name == active_objects[j])
					{
						var obj_index = project_data.templates[k].objects.length;
						project_data.templates[k].objects[obj_index] = JSON.parse(JSON.stringify(objects[i]));

						if (start_x == -1 && start_y == -1)
						{
							start_x = parseInt(get_property(i, "Left").value);
							start_y = parseInt(get_property(i, "Top").value);
						}
					}
					else if (objects[i].parent == active_objects[j])
					{
						var obj_index = project_data.templates[k].objects.length;
						project_data.templates[k].objects[obj_index] = JSON.parse(JSON.stringify(objects[i]));

						if (objects[i].container == true)
							active_objects[active_objects.length] = objects[i].name;
					}
				}
			}

			active_objects.splice(0, obj_len);
		}

		for (i = 0; i < project_data.templates[k].objects.length; i++)
		{
			if (project_data.templates[k].objects[i].name == project_data.templates[k].element)
			{
				project_data.templates[k].objects[i].left = project_data.templates[k].objects[i].left - start_x;

				for (var j = 0; j < project_data.templates[k].objects[i].properties.length; j++)	
					if (project_data.templates[k].objects[i].properties[j].name == "Left")
						break;

				project_data.templates[k].objects[i].properties[j].value = project_data.templates[k].objects[i].properties[j].value - start_x;

				project_data.templates[k].objects[i].top = project_data.templates[k].objects[i].top - start_y;

				for (var j = 0; j < project_data.templates[k].objects[i].properties.length; j++)	
					if (project_data.templates[k].objects[i].properties[j].name == "Top")
						break;

				project_data.templates[k].objects[i].properties[j].value = project_data.templates[k].objects[i].properties[j].value - start_y;

				for (var j = 0; j < project_data.templates[k].objects[i].properties.length; j++)	
					if (project_data.templates[k].objects[i].properties[j].name == "Visibility")
						break;

				project_data.templates[k].objects[i].properties[j].value = "visible";
			}
		}
	}
}

write_status_bar = function(text)
{
	main_statusbar.statusbar_div.innerHTML = text;
	setTimeout(clear_bar, 6000);
}

clear_bar = function()
{
	main_statusbar.statusbar_div.innerHTML = "";
}

get_object = function(this_name)
{
	for (var i = 0; i < objects.length; i++)
		if (objects[i].name == this_name)
			return objects[i];

	return null;
}

get_object_index = function(this_name)
{
	for (var i = 0; i < objects.length; i++)
		if (objects[i].name == this_name)
			return i;

	return null;
}

get_parent = function(this_name)
{
	for (var i = 0; i < objects.length; i++)
		if (objects[i].name == this_name)
			break;

	is_container = false;
	this_object = objects[i];

	while (is_container == false)
	{
		if (this_object.container == true || this_object.type == "form")
			is_container = true;
		else
			this_object = get_object(this_object.parent); 
	}

	return this_object;
}

update_package = function(form_num)
{
	var package = JSON.parse(fs.readFileSync(project_folder + "/package.json", "utf8"));

	package.name = project_data.name;
	package.main = project_data.runtime_html;

	var form_index = get_form_index(form_num);

	package.window.width = parseInt(get_property(form_index, "Width").value);
	package.window.height = parseInt(get_property(form_index, "Height").value);

	fs.writeFileSync(project_folder + "/package.json", JSON.stringify(package, null, 1));
}

load_window = function()
{
	nwin.title = "Digero Debug";
	nwin.resizeTo(400,400);
}

change_property = function(obj_id, obj_property, obj_value, obj_focus)
{
	for (var i = 0; i < objects.length; i++)
		if (objects[i].name == obj_id)
			break;

	if (i < objects.length)
	{
		for (var j = 0; j < objects[i].properties.length; j++)
			if (objects[i].properties[j].name == obj_property)
				break;

		if (j < objects[i].properties.length)
		{
			objects[i].properties[j].value = obj_value;

			if (obj_focus == true)
			{
				if (objects[i].properties[j].type == "string" || objects[i].properties[j].type == "number" || objects[i].properties[j].type == "file")
					main_properties.property_values[j].value = obj_value;
			}
		}
	}
}

get_form_index = function(index)
{
	for (var i = 0; i < objects.length; i++)
		if (objects[i].form == index && objects[i].type == "form")
			return i;

	return null;
}

get_form_name = function(index)
{
	for (var i = 0; i < objects.length; i++)
		if (objects[i].form == index && objects[i].type == "form")
			return objects[i].name;

	return null;
}

add_object_fxs = function(this_object)
{
	this_object.setProperty = function(this_property, this_value)
	{
		console.log(this_property + " " + this_value);
	}
}

add_tool = function(name, create_fx)
{
	var index = tools_fx.length;
	tools_fx[index] = {};
	tools_fx[index].name = name;

	tools_fx[index].create = create_fx;
}

add_new_form = function()
{
	main_formspace.add_tab(true);
	main_formspace.add_code({"index" : main_formspace.form_count});
}

add_new_data = function()
{
	main_formspace.add_data();
}

add_new_code = function()
{
	main_formspace.add_code({"index": 0, "name": "NewCode" + main_formspace.tabs + ".js"});
}

paste_object = function()
{
	var stop_flag = false;
	var paste_focus = get_object(main_formspace.outlines_focus[paste_form].id);

	while (stop_flag == false)
	{
		if (paste_focus.type == "form" || paste_focus.container == true)
			stop_flag = true;
		else
			paste_focus = get_object(paste_focus.parent);
	}

	if (copy_type == "cut")
	{
		for (i = 0; i < objects_reserve.length; i++)
		{
			objects_reserve[i].parent = paste_focus.name;
			objects_reserve[i].form = paste_focus.form;
			objects_reserve[i].left = paste_x + (objects_reserve[i].left - copy_left);
			objects_reserve[i].top = paste_y + (objects_reserve[i].top - copy_top);

			objects[objects.length] = objects_reserve[i];
			index = objects.length - 1;

			objects[index].element.style.left = objects_reserve[i].left + "px";
			objects[index].element.style.top = objects_reserve[i].top + "px";

			document.getElementById(objects[index].parent + get_object(objects[index].parent).container_suffix).appendChild(objects[index].element);
			main_formspace.set_outline_focus(objects[index].name);

			change_property(objects[index].name, "Left", objects_reserve[i].left, true);
			change_property(objects[index].name, "Top", objects_reserve[i].top, true);

			draw_element(index);
		}
	}
	else if (copy_type == "copy")
	{
		for (var i = 0; i < objects_reserve.length; i++)
		{
			var index = objects.length;
			objects[index] = JSON.parse(JSON.stringify(objects_reserve[i]));

			copy_num = 1;
			var valid_name = false;

			while (valid_name == false)
			{
				if (get_object(objects[index].name + "_copy" + copy_num) == null)
					valid_name = true;
				else
					copy_num++;
			}

			objects[index].name = objects[index].name + "_copy" + copy_num;
			set_property(index, "Name", objects[index].name)

			objects[index].parent = paste_focus.name;
			objects[index].form = paste_focus.form;
			objects[index].left = paste_x + (objects[index].left - copy_left);
			objects[index].top = paste_y + (objects[index].top - copy_top);

			set_property(index, "Left", objects[index].left);
			set_property(index, "Top", objects[index].top);

	  		objects[index].element = document.createElement(objects[index].element_type);
			objects[index].element.id = objects[index].name;
			objects[index].element.style.position = "absolute";

			document.getElementById(objects[index].parent + get_object(objects[index].parent).container_suffix).appendChild(objects[index].element);

			eval("if (typeof " + objects[index].type + "_create === \"function\") " + objects[index].type + "_create(objects[index].element, index);");
			draw_element(index);

			objects[index].element.addEventListener("mousedown", function(evt)
			{
				if (main_toolbox.select == 0)
				{
					main_formspace.set_outline_focus(this.id);
					element_flag = true;
				}
			}, false);

			for (var j = 0; j < objects.length; j++)
			{
				if (objects[j].parent == objects_reserve[i].name)
				{
					var index = objects.length;

					objects[index] = JSON.parse(JSON.stringify(objects[j]));
					objects[index].name = objects[index].name + "_copy" + copy_num;
					objects[index].parent = objects[index].parent + "_copy" + copy_num;
					set_property(index, "Name", objects[index].name)

			  		objects[index].element = document.createElement(objects[index].element_type);
					objects[index].element.id = objects[index].name;
					objects[index].element.style.position = "absolute";

					document.getElementById(objects[index].parent + get_object(objects[index].parent).container_suffix).appendChild(objects[index].element);

					eval("if (typeof " + objects[index].type + "_create === \"function\") " + objects[index].type + "_create(objects[index].element, index);");
					draw_element(index);

					objects[index].element.addEventListener("mousedown", function(evt)
					{
						if (main_toolbox.select == 0)
						{
							main_formspace.set_outline_focus(this.id);
							element_flag = true;
						}
					}, false);
				}
			}
		}
	}
}

is_reserve_parent = function(index)
{
	var this_parent = objects_reserve[index].parent;

	for (var i = 0; i < objects_reserve.length; i++)
		if (objects_reserve[i].name == this_parent)
			return true;

	return false;
}

delete_current_object = function()
{
	copy_type = "cut";

	if (main_formspace.outlines_focus[current_form].id == "#group")
	{
		objects_reserve.length = 0;

		for (var i = 0; i < select_group.length; i++)
		{
			var del_object = select_group[i];
			document.getElementById(del_object.parent + get_object(del_object.parent).container_suffix).removeChild(document.getElementById(del_object.name));

			objects_reserve[i] = objects.splice(get_object_index(select_group[i].name), 1)[0];
		}

		copy_left = parseInt(main_formspace.tab_outlines[current_form].style.left);
		copy_top = parseInt(main_formspace.tab_outlines[current_form].style.top);
	}
	else if (main_formspace.outlines_focus[current_form].type != "form")
	{
		objects_reserve.length = 0;

		var del_object = get_object(main_formspace.outlines_focus[current_form].id);
		var del_index = main_formspace.outlines_focus[current_form].index;

		main_formspace.set_outline_focus(del_object.parent);
		document.getElementById(del_object.parent + get_object(del_object.parent).container_suffix).removeChild(document.getElementById(del_object.name));

		reserve_index = objects_reserve.length;
		objects_reserve = objects.splice(del_index, 1);
		
		copy_left = objects_reserve[0].left;
		copy_top = objects_reserve[0].top;
	}
}

copy_current_object = function()
{
	copy_type = "copy";

	if (main_formspace.outlines_focus[current_form].id == "#group")
	{
		objects_reserve.length = 0;

		for (var i = 0; i < select_group.length; i++)
		{
			var del_object = select_group[i];
			//document.getElementById(del_object.parent + get_object(del_object.parent).container_suffix).removeChild(document.getElementById(del_object.name));

			objects_reserve[i] = objects[get_object_index(select_group[i].name)];
		}

		copy_left = parseInt(main_formspace.tab_outlines[current_form].style.left);
		copy_top = parseInt(main_formspace.tab_outlines[current_form].style.top);
	}
	else if (main_formspace.outlines_focus[current_form].type != "form")
	{
		objects_reserve.length = 0;

		var del_object = get_object(main_formspace.outlines_focus[current_form].id);
		var del_index = main_formspace.outlines_focus[current_form].index;

		main_formspace.set_outline_focus(del_object.parent);
		//document.getElementById(del_object.parent + get_object(del_object.parent).container_suffix).removeChild(document.getElementById(del_object.name));

		reserve_index = objects_reserve.length;
		objects_reserve[0] = objects[del_index];
		
		copy_left = objects_reserve[0].left;
		copy_top = objects_reserve[0].top;
	}
}

get_property = function(index, property_name)
{
	for (var i = 0; i < objects[index].properties.length; i++)
		if (objects[index].properties[i].name == property_name)
			return objects[index].properties[i];

	return null;
}

set_property = function(index, property_name, value)
{
	for (var i = 0; i < objects[index].properties.length; i++)
	{
		if (objects[index].properties[i].name == property_name)
		{
			objects[index].properties[i].value = value;
			break;
		}
	}
}

get_object_property = function(this_name, property_name)
{
	for (var i = 0; i < objects.length; i++)
		if (objects[i].name == this_name)
			break;

	if (i == objects.length)
		return null;

	var index = i;

	for (var i = 0; i < objects[index].properties.length; i++)
		if (objects[index].properties[i].name == property_name)
			return objects[index].properties[i];

	return null;
}

click_timer_run = function()
{
	click_timer++;
}

is_array = function(this_name)
{
	for (var i = 0; i < arrays.length; i++)
		if (arrays[i].name == this_name)
			return true;

	return false;
}

get_array_type = function(this_name)
{
	for (var i = 0; i < arrays.length; i++)
		if (arrays[i].name == this_name)
			return arrays[i].type;

	return null;
}

is_child = function(object_id, select_id)
{
	result = false;
	this_obj = select_id;

	if (get_object(this_obj).type == "form")
		return result;

	while(get_object(get_object(this_obj).parent).type != "form")
	{
		if (get_object(this_obj).parent == object_id);
			result = true;

		this_obj = get_object(this_obj).parent;
	}

	return result;
}

chooseFile = function(name) 
{
	var chooser = document.querySelector(name);
	chooser.click();

	chooser.addEventListener("change", function(evt)
	{
  		if (name == "#loadDialog")
  		{
  			if (open_type == "property" && this.value != "")
  			{
  				var file_array = this.value.split(";");
  				var file_list = "";

  				this.value = "";

  				for (var i = 0; i < file_array.length; i++)
  				{
		  			var this_folder = project_folder.replaceAll("\\", "/");
		  			var this_file = file_array[i].replaceAll("\\", "/");

		  			var this_url = this_file.replace(this_folder, "");
		  			this_url = this_url.substring(1, this_url.length);

		  			file_list += this_url + ",";
	  			}

	  			file_list = file_list.substring(0, file_list.length - 1);

	  			if (objects[file_object_index].properties[file_property_index].type == "file")
					change_property(objects[file_object_index].name, objects[file_object_index].properties[file_property_index].name, file_list, true);
	  			else if (objects[file_object_index].properties[file_property_index].type == "file_mult")
	  			{
	  				if (get_property(file_object_index, objects[file_object_index].properties[file_property_index].name).value == "")
						change_property(objects[file_object_index].name, objects[file_object_index].properties[file_property_index].name, file_list, true);
	  				else
						change_property(objects[file_object_index].name, objects[file_object_index].properties[file_property_index].name, get_property(file_object_index, objects[file_object_index].properties[file_property_index].name).value + "," + file_list, true);
	  			}
				
				draw_element(file_object_index);
	  		}
	  		else if (open_type == "project")
	  		{
	  			main_formspace.clear_tabs();

	  			var this_file = this.value.replaceAll("\\", "/");
	  			var this_folder = this_file.substring(0, this_file.lastIndexOf("/"));

	  			project_folder = this_folder;
				project_data = JSON.parse(fs.readFileSync(this_file, "utf8"));

				var objects_array = fs.readFileSync(project_folder + "/" + form_file, "utf8");

				objects.length = 0;
				objects = (JSON.parse(objects_array));

				var main_code = fs.readFileSync("lib/digero_main.js", "utf8");

	  			for (var i = 0; i < objects.length; i++)
	  			{
	  				if (objects[i].type == "form")
	  				{
	  					main_formspace.add_tab(false);
	  					draw_element(i);

	  					var this_code = get_property(i, "Script").value;
						main_formspace.add_code({"index" : objects[i].form + 1, "name" : this_code});

						main_formspace.get_code_editor(objects[i].form).setValue(fs.readFileSync(project_folder + "/code/" + this_code, "utf8"));
						main_formspace.get_code_editor(objects[i].form).selection.clearSelection();
						main_formspace.get_code_editor(objects[i].form).navigateFileStart();
	  				}
	  			}

	  			for (var i = 0; i < objects.length; i++)
	  			{
	  				if (objects[i].type != "form")
	  				{
	  					var main_code_sub1 = main_code.substring(main_code.indexOf("objects[obj_index].type = \"" + objects[i].type + "\""), main_code.length);
	  					var main_code_sub2 = main_code_sub1.substring(0, main_code_sub1.indexOf("main_toolbox.set_tool(0)"));

	  					var main_code_index = 0;
	  					var code_properties = new Array();

	  					while (main_code_index != -1)
	  					{
	  						main_code_index = main_code_sub2.indexOf("index = objects[obj_index].properties.length");

	  						if (main_code_index != -1)
	  						{
	  							var prop_name_start = main_code_sub2.indexOf("[index].name", main_code_index) + 16;
	  							var prop_name_end = main_code_sub2.indexOf("\";", prop_name_start);

	  							var property_name = main_code_sub2.substring(prop_name_start, prop_name_end);
	  							
	  							var index = code_properties.length;

	  							code_properties[index] = {};
	  							code_properties[index].name = property_name;

	  							var prop_name_start = main_code_sub2.indexOf("[index].type", main_code_index) + 16;
	  							var prop_name_end = main_code_sub2.indexOf("\";", prop_name_start);

	  							var property_type = main_code_sub2.substring(prop_name_start, prop_name_end);
	  							code_properties[index].type = property_type;

	  							if (property_type == "select")
	  							{
		  							var prop_name_start = main_code_sub2.indexOf("[index].options", main_code_index) + 19;
		  							var prop_name_end = main_code_sub2.indexOf("\";", prop_name_start);

		  							var property_options = main_code_sub2.substring(prop_name_start, prop_name_end);
		  							code_properties[index].options = property_options;	  								
	  							}
	  							else if (property_type == "file")
	  							{
		  							var prop_name_start = main_code_sub2.indexOf("[index].ext", main_code_index) + 15;
		  							var prop_name_end = main_code_sub2.indexOf("\";", prop_name_start);

		  							var property_ext = main_code_sub2.substring(prop_name_start, prop_name_end);
		  							code_properties[index].ext = property_ext;	  								
	  							}

	  							var prop_name_start = main_code_sub2.indexOf("[index].value", main_code_index) + 16;
	  							var prop_name_end = main_code_sub2.indexOf(";", prop_name_start);

	  							var property_value = main_code_sub2.substring(prop_name_start, prop_name_end);

	  							if (property_value.substr(0, 1) == "\"" && property_value.substr(property_value.length - 1, 1) == "\"")
	  								property_value = property_value.substring(1, property_value.length - 1);

	  							code_properties[index].value = property_value;

	  							main_code_sub2 = main_code_sub2.substring(main_code_index + 1, main_code_sub2.length);
	  						}
	  					}

	  					for (var j = 0; j < code_properties.length; j++)
	  					{
	  						for (k = 0; k < objects[i].properties.length; k++)
	  							if (objects[i].properties[k].name == code_properties[j].name)
	  								break;

	  						if (k == objects[i].properties.length)
	  						{
	  							if (code_properties[j].name.indexOf(".") == -1)
	  							{
			  						for (k = 1; k < objects[i].properties.length; k++)
			  						{
			  							if (!(objects[i].properties[k].name < code_properties[j].name))
			  								break;
			  							else if (objects[i].properties[k].name == "IsArray")
			  								break;
			  						}

			  						objects[i].properties.splice(k, 0, JSON.parse(JSON.stringify(code_properties[j])));					
		  						}
	  						}
	  					}

	  					objects[i].element = document.createElement(objects[i].element_type);
						objects[i].element.id = objects[i].name;
						objects[i].element.style.position = "absolute";

						document.getElementById(objects[i].parent + get_object(objects[i].parent).container_suffix).appendChild(objects[i].element);

						eval("if (typeof " + objects[i].type + "_create === \"function\") " + objects[i].type + "_create(objects[i].element, i);");
						draw_element(i);

						objects[i].element.addEventListener("mousedown", function(evt)
						{
							if (main_toolbox.select == 0)
							{
								main_formspace.set_outline_focus(this.id);
								element_flag = true;
							}
						}, false);
	  				}
	  			}

	  			if (project_data.codes != "")
	  			{
		  			var codes = project_data.codes.split(";");

		  			for (var i = 0; i < codes.length; i++)
		  			{
	  					var this_code = codes[i];
						main_formspace.add_code({"index" : 0, "name" : this_code});

						main_formspace.get_editor_name(this_code).setValue(fs.readFileSync(project_folder + "/code/" + this_code, "utf8"));
						main_formspace.get_editor_name(this_code).selection.clearSelection();
						main_formspace.get_editor_name(this_code).navigateFileStart();	  				
		  			}
	  			}

	  			for (var i = 0; i < project_data.tables.length; i++)
	  			{
	  				main_formspace.add_data();
	  				var index = main_formspace.tabs - 1;

	  				main_formspace.tab_names[index].innerHTML = project_data.tables[i].name;
	  				main_formspace.table_ui[index].name_input.value = project_data.tables[i].name;

	  				main_formspace.tab_datatable[index].name = project_data.tables[i].name;

	  				main_formspace.tab_datatable[index].load_cols(project_data.tables[i].columns);
	  				main_formspace.tab_datatable[index].load_data(project_data.tables[i].data);
	  				main_formspace.tab_datatable[index].load_codes();

	  				main_formspace.tab_datatable[index].add_row();
	  				main_formspace.tab_datatable[index].do_tab_order();

					for (var j = 0; j < main_formspace.tab_datatable[index].col_title.length; j++)
						if (main_formspace.tab_datatable[index].col_type[j] == "code")
							main_formspace.tab_datatable[index].create_code(j, main_formspace.tab_datatable[index].row_label.length - 1);

	  				if (project_data.tables[i].row_height != undefined)
	  					main_formspace.tab_datatable[index].adjust_row_height(0, main_formspace.tab_datatable[index].row_height[0] - project_data.tables[i].row_height);

					main_formspace.tab_datatable[index].new_row = main_formspace.tab_datatable[index].row_label.length - 1;
	  			}
					
				main_explore.go_project();

				main_formspace.set_tab_focus(0);
				write_status_bar("Opened " + this_file);
	  		}
	  		else if (open_type == "nwjs_file")
	  		{
	  			var this_file = this.value.replaceAll("\\", "/");
	  			var this_folder = this_file.substring(0, this_file.lastIndexOf("/"));
	  			var this_name = this_file.substring(this_file.lastIndexOf("/") + 1, this_file.length);

	  			if (this_name.substring(0, 4) != "nwjs")
	  			{
	  				alert("This is not a valid NW.js zip file.");
	  			}
	  			else
	  			{
	  				var go = true;

	  				if (this_name.search("sdk") == -1)
	  				{
	  					var option = confirm("This is not an SDK version of NW.js. You will be unable to open the console when your project is running. This will make it very difficult to track errors in your code. You can always copy the production version of NW.js into your project later. Click OK if you wish to proceed with using this NW.js file.")

	  					if (option == false)
	  						go = false;
	  				}

	  				if (go)
	  				{
	  					nwjs_file = this_file;
						document.getElementById("project_dialog_nwjs").value = nwjs_file.substring(nwjs_file.lastIndexOf("/") + 1, nwjs_file.length);
	  				}
	  			}
	  		}
  		}
  		else if (name == "#saveDialog")
  		{
  			if (open_type == "project_new")
  			{
	  			var this_file = this.value.replaceAll("\\", "/");
	  			var this_folder = this_file.substring(0, this_file.lastIndexOf("/"));

	  			project_folder = this_folder;

	  			fs.copyFileSync(system_folder + "/digero_runtime.html", project_folder + "/digero_runtime.html");
	  			fs.copyFileSync(system_folder + "/digero_runtime.js", project_folder + "/digero_runtime.js");
	  			fs.copyFileSync(system_folder + "/object_template.json", project_folder + "/object_template.json");

	  			project_data = {}
	  			project_data.name = this_file.substring(this_file.lastIndexOf("/") + 1, this_file.search(".prj"));
	  			project_data.file = this_file;
	  			project_data.runtime_html = "digero_runtime.html";
	  			project_data.runtime_js = "digero_runtime.js";
	  			project_data.open_form = 0;

	  			project_data.templates = new Array();
	  			project_data.tables = new Array();

	  			fs.writeFileSync(this_file, JSON.stringify(project_data, null, 1));

	  			main_formspace.clear_tabs();
	  			main_formspace.add_tab(true);
				main_formspace.add_code({"index" : 1});
				main_formspace.set_tab_focus(0);

				main_properties.add_properties(0);
	  		}
		}
  		else if (name == "#projectDialog")
  		{
  			if (open_type == "project_new")
  			{
	  			var this_folder = this.value.replaceAll("\\", "/");
	  			//var this_folder = this_file.substring(0, this_file.lastIndexOf("/"));

	  			project_folder = this_folder;
	  			document.getElementById("project_dialog_loc").value = project_folder;
	  		}
	  		else if (open_type == "img_folder")
	  		{
	  			img_folder = this.value.replaceAll("\\", "/");
				document.getElementById("project_dialog_img").value = img_folder;
	  		}
  		}
	}, false);
}

update_data = function(this_table)
{
	var table_name = this_table.name;

	for (var i = 0; i < project_data.tables.length; i++)
		if (project_data.tables[i].name == table_name)
			break;

	project_data.tables[i].row_height = this_table.row_height[0];
	project_data.tables[i].data.length = 0;

	for (var j = 0; j < this_table.row_label.length; j++)
	{
		if (j != this_table.new_row)
		{
			project_data.tables[i].data[j] = {};

			for (var k = 0; k < this_table.table_data[j].length; k++)
			{
				if (this_table.table_data[j][k] != undefined)
				{
					if (this_table.table_codes[j][k] == undefined)
						project_data.tables[i].data[j][this_table.col_title[k]] = this_table.table_data[j][k].innerHTML;
					else
						project_data.tables[i].data[j][this_table.col_title[k]] = this_table.code_divs[this_table.table_codes[j][k]].getValue();
				}
			}
		}	
	}

	console.log(JSON.stringify(project_data.tables, null, 1));

	//project_data.tables[i].columns = this_table.getColumnDefinitions();
	//project_data.tables[i].data = this_table.getData();
	//console.log(project_data);
}

update_cols = function(this_table)
{
	var table_name = this_table.name;

	for (var i = 0; i < project_data.tables.length; i++)
		if (project_data.tables[i].name == table_name)
			break;

	if (i == project_data.tables.length)
	{
		project_data.tables[i] = {};
		project_data.tables[i].name = table_name;
		project_data.tables[i].columns = new Array();
		project_data.tables[i].data = new Array();
	}

	project_data.tables[i].columns.length = 0;

	for (var j = 0; j < this_table.col_title.length; j++)
	{
		project_data.tables[i].columns[j] = {};
		project_data.tables[i].columns[j].title = this_table.col_title[j];
		project_data.tables[i].columns[j].width = this_table.col_width[j];
		project_data.tables[i].columns[j].type = this_table.col_type[j];

		if (this_table.col_sub[j] != undefined)
			project_data.tables[i].columns[j].sub = this_table.col_sub[j];

		if (this_table.col_params[j] != undefined)
			project_data.tables[i].columns[j].params = this_table.col_params[j];

		project_data.tables[i].columns[j].editor = true;
	}

	//console.log(JSON.stringify(project_data.tables, null, 1));
}

update_table_name = function(old_name, new_name)
{
	for (var i = 0; i < project_data.tables.length; i++)
		if (project_data.tables[i].name == old_name)
			break;

	if (i < project_data.tables.length)
		project_data.tables[i].name = new_name;
}

build_output_window = function()
{
	var output_window = document.createElement("div");	
	output_window.id = "output_window";
	output_window.style.position = "absolute";
	output_window.style.zIndex = 100;

	var window_width = Math.floor(window.innerWidth * 0.8);

	output_window.style.top = (Math.floor(window.innerHeight / 2) - 150) + "px";
	output_window.style.left = Math.floor((window.innerWidth - window_width) / 2) + "px";

	output_window.style.width = window_width + "px";
	output_window.style.height = "300px";

	output_window.style.backgroundColor = "#252526";

	output_window.style.borderWidth = "1px";
	output_window.style.borderStyle = "solid";
	output_window.style.borderColor = "#ababab";

	output_window.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";

	document.body.appendChild(output_window);

	var output_text = document.createElement("div");	
	output_text.id = "output_text";
	output_text.style.position = "absolute";

	var window_width = parseInt(output_window.style.width) - 17;

	output_text.style.top = "5px";
	output_text.style.left = "5px";

	output_text.style.width = window_width + "px";
	output_text.style.height = "250px";

	output_text.style.backgroundColor = "#202020";
	output_text.style.overflowY = "scroll";

	output_text.style.paddingLeft = "5px";
	output_text.style.paddingTop = "5px";

	output_text.style.borderWidth = "1px";
	output_text.style.borderStyle = "solid";
	output_text.style.borderColor = "#505050";

	output_text.style.fontFamily = "Courier New";
	output_text.style.fontSize = "12px";
	output_text.style.color = "#eeeeee";

	output_window.appendChild(output_text);

	var output_button = document.createElement("button");	
	output_button.id = "output_close";
	output_button.style.position = "absolute";

	output_button.style.top = "265px";
	output_button.style.left = "5px";

	output_button.style.width = "50px";
	output_button.style.height = "30px";

	output_button.style.paddingLeft = "2px";
	output_button.style.paddingTop = "2px";

	output_button.style.fontFamily = "ABeeZee";
	output_button.style.fontSize = "12px";

	output_button.innerHTML = "Close";
	output_window.appendChild(output_button);

	output_button.addEventListener("click", function (index)
	{
		document.body.removeChild(document.getElementById("output_window"));
	}, false);
}

parse_code = function()
{
	var err_total = 0;

	var output_text = document.getElementById("output_text");
	output_text.innerHTML = "";

	for (var i = 0; i < main_formspace.tab_types.length; i++)
	{
		if (main_formspace.tab_types[i] == "code")
		{
			var this_file = main_formspace.tab_names[i].innerHTML;
			var this_code = main_formspace.tab_editors[i].getValue();

			output_text.innerHTML += "Parsing " + this_file + "...<br>";

			try 
			{
			    const script = new vm.Script(this_code); 
			    output_text.innerHTML += "No errors.<br><br>";
			} 
			catch (e) 
			{
				err_total++;
				var message = e.stack;

				message = message.replaceAll("\n", "<br>");
				message = message.replaceAll("evalmachine.", "Error line ");

				message = message.substring(0, message.search("at new") - 2);
			    output_text.innerHTML += message + "<br><br>";
			}
		}
	}

	output_text.innerHTML += err_total + " error(s) total.<br>";
	output_text.scrollTop = output_text.scrollHeight;

	return err_total;
}

move_tooltip = function()
{
	tooltip.style.left = mouse_x + 12 + "px";
	tooltip.style.top = mouse_y + 4 + "px";
}

add_default_fonts = function()
{
	project_data.fonts = new Array();

	project_data.fonts[0] = {};
	project_data.fonts[0].name = "ABeeZee";
	project_data.fonts[0].url = "url(fonts/ABeeZee-Regular.otf)";

	project_data.fonts[1] = {};
	project_data.fonts[1].name = "Varta";
	project_data.fonts[1].url = "url(fonts/Varta-Regular.ttf)";

	console.log(project_data);
}

// MENU FUNCTIONS
// ==============

new_project = function()
{
	open_type = "project_new";

	document.getElementById("saveDialog").nwworkingdir = project_folder;
	document.getElementById("saveDialog").accept = ".prj";
	document.getElementById("loadDialog").multiple = false;
	chooseFile("#saveDialog");
}

save_project = function()
{
	add_default_fonts();
	create_templates();

	fs.writeFileSync(project_folder + "/" + project_data.name + ".prj", JSON.stringify(project_data, null, 1));
	fs.writeFileSync(project_folder + "/" + form_file, JSON.stringify(objects, null, 1));
	fs.writeFileSync(project_folder + "/" + project_file, JSON.stringify(project_data, null, 1));

	for (var i = 0; i < main_formspace.tab_types.length; i++)
	{
		if (main_formspace.tab_types[i] == "code")
		{
			var this_file = main_formspace.tab_names[i].innerHTML;
			var this_code = main_formspace.tab_editors[i].getValue();

			fs.writeFileSync(project_folder + "/code/" + this_file, this_code);
		}
	}

	write_status_bar("Saved project to " + project_folder);
}

open_project = function()
{
	open_type = "project";

	document.getElementById("loadDialog").nwworkingdir = project_folder;
	document.getElementById("loadDialog").accept = ".prj";
	document.getElementById("loadDialog").multiple = false;
	chooseFile("#loadDialog");
}

run_project = function()
{
	build_output_window();
	var err = parse_code();

	if (err == 0)
	{
		document.body.removeChild(document.getElementById("output_window"));
		create_templates();

		fs.copyFileSync(system_folder + "/digero_runtime.html", project_folder + "/digero_runtime.html");
  		fs.copyFileSync(system_folder + "/digero_runtime.js", project_folder + "/digero_runtime.js");
  		fs.copyFileSync(system_folder + "/object_template.json", project_folder + "/object_template.json");
  		fs.copyFileSync(system_folder + "/package.json", project_folder + "/package.json");

		fs.writeFileSync(project_folder + "/digero_objects.json", JSON.stringify(objects, null, 1));
		fs.writeFileSync(project_folder + "/sf.txt", "0");

		var codes = "";

		for (var i = 0; i < main_formspace.tab_types.length; i++)
		{
			if (main_formspace.tab_types[i] == "code")
			{
				var this_file = main_formspace.tab_names[i].innerHTML;
				var this_code = main_formspace.tab_editors[i].getValue();

				fs.writeFileSync(project_folder + "/code/" + this_file, this_code);

				if (main_formspace.tab_codes_forms[i] < 0)
					codes += this_file + ";";
			}
		}

		if (codes != "")
			codes = codes.substring(0, codes.length - 1);

		project_data.codes = codes;
		fs.writeFileSync(project_data.file, JSON.stringify(project_data, null, 1));

		update_package(project_data.open_form);

		cp.execFile(project_folder + "/nw");
	}
}

window.addEventListener("mousemove", function(evt)
{
	mouse_x = evt.pageX / window_zoom;
	mouse_y = evt.pageY / window_zoom;
}, false);

window.onkeydown = function(evt) 
{
	// code borrowed from https://stackoverflow.com/questions/8916620/disable-arrow-key-scrolling-in-users-browser
	if([37, 38, 39, 40].indexOf(evt.keyCode) > -1) 
	{
        //evt.preventDefault();
    }

	if (evt.keyCode == 17)
	{
		ctrl_flag = 1;
	}
	else if (evt.keyCode == 9)
	{
		var active = document.activeElement;
		
		if (active.id.search("value") != -1)
		{
			var obj_index = active.id.substring(0, active.id.indexOf("_"));
			var property_index = active.id.substring(active.id.lastIndexOf("_") + 1, active.id.length);

			focus_element = document.getElementById(obj_index + "_value_" + (parseInt(property_index) + 1));
		}
		else if (active == main_functions.functions_div_search)
		{
			main_functions.search(main_functions.select + 1, true);
			main_formspace.search_flag = true;
		}		
	}
	else if (evt.keyCode == 39)
	{
		if (get_object(main_formspace.outlines_focus[current_form].id).type != "form" && document.activeElement.id.search("value") == -1)
		{
			var move_element = document.getElementById(main_formspace.outlines_focus[current_form].id);

			move_element.style.left = (parseInt(move_element.style.left) + 1) + "px";
			main_formspace.set_outline_focus(main_formspace.outlines_focus[current_form].id);

			get_object(main_formspace.outlines_focus[current_form].id).left = parseInt(move_element.style.left);
			change_property(main_formspace.outlines_focus[current_form].id, "Left", parseInt(move_element.style.left), true);
		}
	}
	else if (evt.keyCode == 40)
	{
		if (get_object(main_formspace.outlines_focus[current_form].id).type != "form" && document.activeElement.id.search("value") == -1)
		{
			var move_element = document.getElementById(main_formspace.outlines_focus[current_form].id);

			move_element.style.top = (parseInt(move_element.style.top) + 1) + "px";
			main_formspace.set_outline_focus(main_formspace.outlines_focus[current_form].id);

			get_object(main_formspace.outlines_focus[current_form].id).top = parseInt(move_element.style.top);
			change_property(main_formspace.outlines_focus[current_form].id, "Top", parseInt(move_element.style.top), true);
		}		
	}
	else if (evt.keyCode == 37)
	{
		if (get_object(main_formspace.outlines_focus[current_form].id).type != "form" && document.activeElement.id.search("value") == -1)
		{
			var move_element = document.getElementById(main_formspace.outlines_focus[current_form].id);

			move_element.style.left = (parseInt(move_element.style.left) - 1) + "px";
			main_formspace.set_outline_focus(main_formspace.outlines_focus[current_form].id);

			get_object(main_formspace.outlines_focus[current_form].id).left = parseInt(move_element.style.left);
			change_property(main_formspace.outlines_focus[current_form].id, "Left", parseInt(move_element.style.left), true);
		}
	}
	else if (evt.keyCode == 38)
	{
		if (get_object(main_formspace.outlines_focus[current_form].id).type != "form" && document.activeElement.id.search("value") == -1)
		{
			var move_element = document.getElementById(main_formspace.outlines_focus[current_form].id);

			move_element.style.top = (parseInt(move_element.style.top) - 1) + "px";
			main_formspace.set_outline_focus(main_formspace.outlines_focus[current_form].id);

			get_object(main_formspace.outlines_focus[current_form].id).top = parseInt(move_element.style.top);
			change_property(main_formspace.outlines_focus[current_form].id, "Top", parseInt(move_element.style.top), true);
		}		
	}
	else if (evt.keyCode == 46)
	{
		if (column_select != null)
		{
			var del_user = confirm("Delete Column?");

			if (del_user)
			{
				column_select.delete();
				column_select = null;
			}
		}
		else
		{
			delete_current_object();
		}
	}
	else if (evt.keyCode == 83)
	{
		if (ctrl_flag == 1)
   		{
   			create_templates();
   			//console.log(project_data);

			var codes = "";

			for (var i = 0; i < main_formspace.tab_types.length; i++)
			{
				if (main_formspace.tab_types[i] == "code")
				{
					var this_file = main_formspace.tab_names[i].innerHTML;
					var this_code = main_formspace.tab_editors[i].getValue();

					fs.writeFileSync(project_folder + "/code/" + this_file, this_code);

					if (main_formspace.tab_codes_forms[i] < 0)
						codes += this_file + ";";
				}
			}

			if (codes != "")
				codes = codes.substring(0, codes.length - 1);

			project_data.codes = codes;

			fs.writeFileSync(project_folder + "/" + project_data.name + ".prj", JSON.stringify(project_data, null, 1));
			fs.writeFileSync(project_folder + "/" + form_file, JSON.stringify(objects, null, 1));
			fs.writeFileSync(project_folder + "/" + project_file, JSON.stringify(project_data, null, 1));

			for (var i = 0; i < main_formspace.tab_types.length; i++)
			{
				if (main_formspace.tab_types[i] == "code")
				{
					var this_file = main_formspace.tab_names[i].innerHTML;
					var this_code = main_formspace.tab_editors[i].getValue();

					fs.writeFileSync(project_folder + "/code/" + this_file, this_code);
				}
			}

			write_status_bar("Saved project to " + project_folder);
   		}
   	}
   	else if (evt.keyCode == 119)
	{
		main_functions.go_functions();
		main_functions.show();
	}
}

window.onkeyup = function(e) 
{
	evt = e || window.event;

	if (evt.keyCode == 17)
	{
		ctrl_flag = 0;
	}
	else if (evt.keyCode == 9)
	{
		if (main_formspace.search_flag == true)
		{
			main_functions.functions_div_search.focus();
			main_formspace.search_flag = false;
		}
	}
	else if (evt.keyCode == 13)
	{
		if (document.activeElement == main_functions.functions_div_search)
		{
			main_functions.hide();
			main_functions.jumpto();
		}
	}
}

window.onmousemove = function(evt)
{
	if (resize_tools.mousedown == true)
	{
		document.body.style.cursor = "ew-resize";

		var x = evt.clientX;
		var y = evt.clientY;

		var quant = (x - resize_tools.old_x);

		if (resize_tools.element1 != undefined)
			resize_tools.element1.select_resize(quant, "right");

		if (resize_tools.element2 != undefined)
			resize_tools.element2.select_resize(quant, "left");

		resize_tools.resize_div.style.left = (parseInt(resize_tools.resize_div.style.left) + quant) + "px";

		resize_tools.old_x = x;
		resize_tools.old_y = y;
	}

	if (resize_propex.mousedown == true)
	{
		document.body.style.cursor = "ew-resize";

		var x = evt.clientX;
		var y = evt.clientY;

		var quant = (x - resize_propex.old_x);

		if (resize_propex.element1 != undefined)
			resize_propex.element1.select_resize(quant, "right");

		if (resize_propex.element2 != undefined)
			resize_propex.element2.select_resize(quant, "left");

		resize_propex.resize_div.style.left = (parseInt(resize_propex.resize_div.style.left) + quant) + "px";

		resize_propex.old_x = x;
		resize_propex.old_y = y;
	}

	if (resize_properties.mousedown == true)
	{
		document.body.style.cursor = "ns-resize";

		var x = evt.clientX;
		var y = evt.clientY;

		var quant = (y - resize_properties.old_y);

		if (resize_properties.element1 != undefined)
			resize_properties.element1.select_resize(quant, "bottom");

		if (resize_properties.element2 != undefined)
			resize_properties.element2.select_resize(quant, "top");

		resize_properties.resize_div.style.top = (parseInt(resize_properties.resize_div.style.top) + quant) + "px";

		resize_properties.old_x = x;
		resize_properties.old_y = y;
	}
}

window.onmouseup = function(evt)
{
	document.body.style.cursor = "default";

	resize_tools.mousedown = false;
	resize_propex.mousedown = false;
	resize_properties.mousedown = false;

	if (main_contextmenu.menu_div.style.visibility == "visible")
	{
		block_context--;

		if (block_context < 0)
		{
			main_contextmenu.hide();

			var index = main_formspace.get_form_tab_index(get_form_name(get_object(object_focus).form));
			main_formspace.tab_expand[index].innerHTML = "<img class = 'nonDraggableImage' src = 'img/expand_menu.png'>";
		}
	}
}

window.onresize = function()
{
	main_menubar.menubar_div.style.width = window.innerWidth + "px";
	main_toolbar.toolbar_div.style.width = window.innerWidth + "px";

	main_statusbar.statusbar_div.style.width = window.innerWidth + "px";
	main_statusbar.statusbar_div.style.top = (window.innerHeight - 24) + "px";

	main_toolbox.toolbox_div.style.height = window.innerHeight - 57 - toolbar_height + "px";
	main_toolbox.toolbox_div_list.style.height = window.innerHeight - 77 - toolbar_height + "px";

	propex.style.left = (window.innerWidth - parseInt(propex.style.width) - 5) + "px";

	//main_properties.properties_div.style.left = window.innerWidth - 297 + "px";
	main_properties.properties_div.style.height = (((window.innerHeight - 84) / 2) - 5) + "px";
	main_properties.properties_div_list.style.height = (((window.innerHeight - 84) / 2) - 25) + "px";
	main_properties.properties_list_container.style.height = (((window.innerHeight - 84) / 2) - 25) + "px";

	//main_explore.explore_div.style.left = window.innerWidth - 297 + "px";
	main_explore.explore_div.style.top = 5 + parseInt(main_properties.properties_div.style.height) + "px";
	main_explore.explore_div.style.height = (((window.innerHeight - 84) / 2) - 5) + "px";
	main_explore.explore_container.style.height = (((window.innerHeight - 84) / 2) - 25) + "px";

	var formspace_width = window.innerWidth - (parseInt(main_toolbox.toolbox_div.style.width) + parseInt(main_properties.properties_div.style.width) + 18);

	main_formspace.formspace_div.style.width = formspace_width + "px";
	main_formspace.formspace_div.style.height = window.innerHeight - 57 - toolbar_height + "px";

	main_formspace.tabspace_container.style.width = (formspace_width - 69) + "px";
	main_formspace.tabmoves_div.style.left = (formspace_width - 69) + "px";

	for (var i = 0; i < main_formspace.tabs; i++)
	{
		main_formspace.tab_divs[i].style.width = formspace_width + "px";
		main_formspace.tab_divs[i].style.height = (parseInt(main_formspace.formspace_div.style.height) - 23) + "px";

		if (main_formspace.tab_types[i] == "code")
		{
			main_formspace.tab_codes[i].style.width = (formspace_width - 10) + "px";
			main_formspace.tab_codes[i].style.height = (parseInt(main_formspace.formspace_div.style.height) - 23) + "px";

			main_formspace.tab_codes_objects[i].style.width = Math.floor((formspace_width - 10) / 2) + "px";
			main_formspace.tab_codes_events[i].style.left = Math.floor((formspace_width - 10) / 2) + "px";	
			main_formspace.tab_codes_events[i].style.width = Math.floor((formspace_width - 10) / 2) + "px";		
		}
		else if (main_formspace.tab_types[i] == "data")
		{
			main_formspace.tab_data[i].style.width = (formspace_width - 10) + "px";
			main_formspace.tab_data[i].style.height = (parseInt(main_formspace.formspace_div.style.height) - 105) + "px";

			//main_formspace.table[i].redraw(true);
		}
	}

	resize_tools.resize_div.style.height = window.innerHeight - 81 + "px";
	resize_propex.resize_div.style.height = window.innerHeight - 81 + "px";

	resize_propex.resize_div.style.left = parseInt(propex.style.left) - 5 + "px";

	resize_properties.resize_div.style.left = propex.style.left;
	resize_properties.resize_div.style.top = (parseInt(main_properties.properties_div.style.height) + parseInt(propex.style.top)) + "px";
	resize_properties.resize_div.style.width = main_properties.properties_div.style.width;
}

getInt = function(value)
{
	var int_val = parseInt(value);

	if (isNaN(int_val))
		return 0;
	else
		return int_val;
}

// code borrowed from https://stackoverflow.com/questions/8837454/sort-array-of-objects-by-single-key-with-date-value
function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

// code borrowed from https://stackoverflow.com/questions/4434076/best-way-to-alphanumeric-check-in-javascript
function isAlphaNumeric(str) {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
};

// code borrowed from https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript
String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};
