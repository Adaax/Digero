var nw = require('nw.gui');
var fs = require('fs');
var vm = require('vm');

var objects;
var project_data;
var thisForm = nw.Window.get();
var element;
var background_div;
var starting_form;

var runtime_code;
var primary_form;

var project_folder = process.cwd();
var drag_index = -1;

var window_zoom = 1;
var mouse_click = false;

var startIDs = new Array();
var element_arrays = new Array();
var object_events = new Array();

var mouse_x;
var mouse_y;

var mouse_bite;
var mouse_resize;

var tooltip;
var tooltip_flag;
var tooltip_id;

var window_zoom;
var master_code = "";

var tick = 0;
var goid;

var project_fonts = new Array();
var fonts_total;
var fonts_count;

window.onload = function()
{
	project_folder = project_folder.replaceAll("\\", "/");

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
	object_events[index].type = "picturebox";
	object_events[index].events = "click,mousedown,mousemove,mouseover,mouseup";

	index = object_events.length;
	object_events[index] = {};
	object_events[index].type = "pictureframe";
	object_events[index].events = "click,mousedown,mousemove,mouseover,mouseup";

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

	runtime_code = "";
	objects = JSON.parse(fs.readFileSync('digero_objects.json', 'utf8'));
	project_data = JSON.parse(fs.readFileSync('digero_project.json', 'utf8'));
	object_template = JSON.parse(fs.readFileSync('object_template.json', 'utf8'));

	add_fonts();
	build_data();
}

window.addEventListener("mousemove", function(evt)
{
	var old_x = mouse_x;
	var old_y = mouse_y;

	mouse_x = evt.pageX / window_zoom;
	mouse_y = evt.pageY / window_zoom;

	if (mouse_bite != undefined)
	{
		var element = document.getElementById(mouse_bite);

		element.style.left = (parseInt(element.style.left) + (mouse_x - old_x)) + "px";
		element.style.top = (parseInt(element.style.top) + (mouse_y - old_y)) + "px";
	}
	else if (mouse_resize != undefined && mouse_resize.element.cursor != "default")
	{
		if (mouse_resize.dir == "ns")
		{
			mouse_resize.element.style.height = (parseInt(mouse_resize.element.style.height) + (mouse_y - old_y)) + "px";

			var mouse_object = getObject(mouse_resize.element.id);
			set_property(mouse_object.index, "Height", parseInt(mouse_resize.element.style.height));

			var selectEvent = new CustomEvent("resize", {detail: {ns: (mouse_y - old_y), ew: null}});
			mouse_resize.element.dispatchEvent(selectEvent);

			eval("if (typeof " + mouse_object.type + "_draw_runtime === \"function\") " + mouse_object.type + "_draw_runtime(mouse_resize.element, mouse_object.index);");
		}
		else if (mouse_resize.dir == "ew")
		{
			mouse_resize.element.style.width = (parseInt(mouse_resize.element.style.width) + (mouse_x - old_x)) + "px";

			var mouse_object = getObject(mouse_resize.element.id);
			set_property(mouse_object.index, "Width", parseInt(mouse_resize.element.style.width));

			var selectEvent = new CustomEvent("resize", {detail: {ns: null, ew: (mouse_x - old_x)}});
			mouse_resize.element.dispatchEvent(selectEvent);

			eval("if (typeof " + mouse_object.type + "_draw_runtime === \"function\") " + mouse_object.type + "_draw_runtime(mouse_resize.element, mouse_object.index);");
		}
		else if (mouse_resize.dir == "nsew")
		{
			mouse_resize.element.style.width = (parseInt(mouse_resize.element.style.width) + (mouse_x - old_x)) + "px";
			mouse_resize.element.style.height = (parseInt(mouse_resize.element.style.height) + (mouse_y - old_y)) + "px";

			var mouse_object = getObject(mouse_resize.element.id);
			set_property(mouse_object.index, "Width", parseInt(mouse_resize.element.style.width));
			set_property(mouse_object.index, "Height", parseInt(mouse_resize.element.style.height));

			var selectEvent = new CustomEvent("resize", {detail: {ns: (mouse_y - old_y), ew: (mouse_x - old_x)}});
			mouse_resize.element.dispatchEvent(selectEvent);

			eval("if (typeof " + mouse_object.type + "_draw_runtime === \"function\") " + mouse_object.type + "_draw_runtime(mouse_resize.element, mouse_object.index);");
		}
	}
}, false);

window.addEventListener("mouseup", function(evt)
{
	mouse_bite = undefined;
	mouse_resize = undefined;
}, false);

thisForm.on("resize", function(width, height){
});

add_fonts = function()
{
	if (project_data.fonts != undefined)
	{
		fonts_total = project_data.fonts.length;
		fonts_count = 0;

		for (var i = 0; i < fonts_total; i++)
		{
			project_fonts[i] = new FontFace(project_data.fonts[i].name, project_data.fonts[i].url);

			project_fonts[i].load().then(function(loadedFont) 
			{
	        	document.fonts.add(loadedFont);
	        	fonts_count++;

	        	if (fonts_count == fonts_total)
					launch_program();
	    	}).catch(function(error) 
	    	{
	       		console.log('Failed to load font: ' + error)
	    	})
		}
	}
	else
		launch_program();
}

build_data = function()
{
	for (var i = 0; i < project_data.tables.length; i++)
	{
		var table_name = project_data.tables[i].name;
		var table_data = JSON.stringify(project_data.tables[i].data);

		for (j = 0; j < project_data.tables[i].columns.length; j++)
		{
			var col_name = project_data.tables[i].columns[j].title;

			var get_code = "get_" + table_name + "_by_" + col_name + " = function(" + col_name + "_data)\n";
			get_code += "{\n\tfor (var i = 0; i < " + table_name + ".length; i++)\n";
			get_code += "\t\t if (" + table_name + "[i]." + col_name + " == " + col_name + "_data)\n";
			get_code += "\t\t\treturn " + table_name + "[i];\n";
			get_code += "\n\t return null;\n}\n";

			eval(get_code);
		}

		eval(table_name + " = " + table_data);

		for (j = 0; j < project_data.tables[i].columns.length; j++)
		{
			if (project_data.tables[i].columns[j].type == "code" && project_data.tables[i].columns[j].sub == "javascript")
			{
				for (var k = 0; k < parseInt(eval(table_name + ".length")); k++)
				{
					if (project_data.tables[i].columns[j].params != undefined)
						var params = project_data.tables[i].columns[j].params;
					else
						var params = "";

					eval(table_name + "[" + k + "]." + project_data.tables[i].columns[j].title + " = function(" + params + ") {" + project_data.tables[i].data[k][project_data.tables[i].columns[j].title] + "}");
				}
			}
		}
	}
}

launch_program = function()
{
	//var starting_form = parseInt(fs.readFileSync("sf.txt", "utf8"));
	starting_form = 0;
	open_form(starting_form);

	primary_form = starting_form;

	for (var i = 0; i < objects.length; i++)
	{
		if (objects[i].type == "form" && objects[i].form != starting_form)
		{
			runtime_code = "";

			objects[i].index = i;
			var element = document.createElement("div")
			element.id = objects[i].name;
			element.style.position = "absolute";
			element.style.visibility = "hidden";
			element.style.overflow = "hidden";

			document.body.appendChild(element);
			element.style.zIndex = 100;
			draw_element(i);

			runtime_code += objects[i].name + " = objects[" + i + "];\n";			
			runtime_code += "add_object_fxs(" + objects[i].name + ");\n";

			element_arrays.length = 0;

			for (var j = 0; j < objects.length; j++)
			{
				if (objects[j].form == objects[i].form && objects[j].type != "form")
				{
					object = get_object(objects[j].name);

					objects[j].index = j;
					element = document.createElement(objects[j].element_type);
					element.id = objects[j].name;
					element.style.position = "absolute";
					element.style.visibility = "hidden";
					//element.style.visibility = get_property(j, "Visibility").value;

					document.getElementById(objects[j].parent + get_object(objects[j].parent).container_suffix).appendChild(element);

					eval("if (typeof " + objects[j].type + "_create_runtime === \"function\") " + objects[j].type + "_create_runtime(element, j);");
					draw_element(j);


					runtime_code += objects[j].name + " = objects[" + j + "];\n";			
					runtime_code += "add_object_fxs(" + objects[j].name + ");\n";

					if (get_property(j, "IsArray").value == "true")
					{
						for (var k = 0; k < element_arrays.length; k++)
							if (element_arrays[k].name == get_property(j, "ArrayName").value)
								break;

						if (k == element_arrays.length)
						{
							element_arrays[k] = {};
							element_arrays[k].name = get_property(j, "ArrayName").value;
							element_arrays[k].type = objects[j].type;
							element_arrays[k].elements = objects[j].name;

							runtime_code += "var " + element_arrays[k].name + " = new Array();\n";
						}
						else
						{
							element_arrays[k].elements += "," + objects[j].name;
						}

						runtime_code += element_arrays[k].name + "[" + get_property(j, "Index").value + "] = " + objects[j].name + ";\n"; 
					}
				}
			}

			console.log(runtime_code);
			(1, eval) (runtime_code);

			var script_file = get_property(i, "Script").value;
			var script_code = fs.readFileSync("code/" + script_file, "utf8");

			//eval(script_code);
			master_code += "code/" + script_code;

			run_element_array_events(script_code);

		    var scriptTag = document.createElement("script");
		    scriptTag.src = "code/" + script_file;
		    document.head.appendChild(scriptTag);
		}
	}

	if (project_data.codes != "")
	{
		var codes = project_data.codes.split(";");

		for (var i = 0; i < codes.length; i++)
		{
			master_code += fs.readFileSync("code/" + codes[i], "utf8");

		    var scriptTag = document.createElement("script");
		    scriptTag.src = "code/" + codes[i];
		    document.head.appendChild(scriptTag);
		}
	}

	//eval(master_code);
	//goid = setInterval(do_frame, 17);
}

do_frame = function()
{
	tick++;

	if (tick == 10000)
		tick = 0;

	for (var i = 0; i < objects.length; i++)
	{
		if (objects[i].type == "pictureframe")
		{
			var interval = parseInt(get_property(i, "AnimateInterval").value);

			if (interval != 0 && tick % interval == 0)
			{
				var frame = parseInt(get_property(i, "Frame").value);
				frame++;

				if (frame == parseInt(get_property(i, "Frames").value))
					frame = 0;

				set_property(i, "Frame", frame);

				var obj = document.getElementById(objects[i].name)

				if (parseInt(get_property(i, "MoveX").value) != 0)
				{
					var new_left = parseInt(get_property(i, "Left").value) + parseInt(get_property(i, "MoveX").value);

					//set_property(i, "Left", new_left);
					obj.style.left = new_left + "px";
				}

				var obj_image = document.getElementById(objects[i].name + "_image");

				if (obj_image != null)
					obj_image.style.left = -((obj_image.width / parseInt(get_property(i, "Frames").value)) * parseInt(get_property(i, "Frame").value)) + "px";
			}
		}
	}
}

open_form = function(index)
{
	var form_index = get_form_index(index);

	thisForm.resizeTo(parseInt(get_property(form_index, "Width").value), parseInt(get_property(form_index, "Height").value));
	thisForm.title = get_property(form_index, "Text").value;

	if (get_property(form_index, "Center").value == "false")
	{
		thisForm.x = parseInt(get_property(form_index, "Left").value);
		thisForm.y = parseInt(get_property(form_index, "Top").value);
	}
	else
	{
		thisForm.x = Math.floor((screen.width - parseInt(get_property(form_index, "Width").value)) / 2);
		thisForm.y = Math.floor((screen.height - parseInt(get_property(form_index, "Height").value)) / 2);
	}

	document.body.style.width = get_property(form_index, "Width").value + "px";
	document.body.style.height = get_property(form_index, "Height").value + "px";

	document.body.style.margin = "0";
	document.body.style.padding = "0";

	if (get_property(form_index, "Maximize").value == "true")
		thisForm.maximize();

	if (get_property(form_index, "Fullscreen").value == "true")
	{
		thisForm.enterFullscreen();
		document.body.style.zoom = screen.width / parseInt(get_property(form_index, "Width").value);
		window_zoom = screen.width / parseInt(get_property(form_index, "Width").value);
	}

	if (get_property(index, "Image") != null && get_property(index, "Image").value != "")
	{
		document.body.style.backgroundImage = "url(\"" + get_property(index, "Image").value + "\")";
	}

	//if (get_property(form_index, "Image").value != "")
	//	document.body.innerHTML = "<img src = \"" + get_property(index, "Image").value + "\">" + document.body.innerHTML;

	document.body.id = get_property(form_index, "Name").value;
	document.body.style.backgroundColor = get_property(form_index, "BackgroundColor").value;

	runtime_code += get_property(form_index, "Name").value + " = objects[" + form_index + "];\n";			
	runtime_code += "add_object_fxs(" + objects[form_index].name + ");\n";

	element_arrays.length = 0;

	for (var i = 0; i < objects.length; i++)
	{
		if (objects[i].form == index && objects[i].type != "form")
		{
			object = get_object(objects[i].name);

			objects[i].index = i;
			element = document.createElement(objects[i].element_type);
			element.id = objects[i].name;
			element.style.position = "absolute";
			element.style.visibility = get_property(i, "Visibility").value;

			eval("if (typeof " + objects[i].type + "_create_runtime === \"function\") " + objects[i].type + "_create_runtime(element, i);");

			document.getElementById(objects[i].parent + get_object(objects[i].parent).container_suffix).appendChild(element);
			draw_element(i);

			runtime_code += objects[i].name + " = objects[" + i + "];\n";			
			runtime_code += "add_object_fxs(" + objects[i].name + ");\n";

			if (get_property(i, "IsArray").value == "true")
			{
				for (var j = 0; j < element_arrays.length; j++)
					if (element_arrays[j].name == get_property(i, "ArrayName").value)
						break;

				if (j == element_arrays.length)
				{
					element_arrays[j] = {};
					element_arrays[j].name = get_property(i, "ArrayName").value;
					element_arrays[j].type = objects[i].type;
					element_arrays[j].elements = objects[i].name;

					runtime_code += "var " + element_arrays[j].name + " = new Array();\n";
				}
				else
				{
					element_arrays[j].elements += "," + objects[i].name;
				}

				runtime_code += element_arrays[j].name + "[" + get_property(i, "Index").value + "] = " + objects[i].name + ";\n"; 
			}
		}
	}

	//console.log(runtime_code);
	eval(runtime_code);

	var script_file = get_property(form_index, "Script").value;
	var script_code = fs.readFileSync("code/" + script_file, "utf8");

	//eval(script_code);
	master_code += script_code;
	run_element_array_events(script_code);

    var scriptTag = document.createElement("script");
    scriptTag.src = "code/" + script_file;
    document.head.appendChild(scriptTag);

    scriptTag.onload = function() 
    {
    	for (var i = 0; i < objects.length; i++)
			if (objects[i].type == "form" && objects[i].form == starting_form)
				break;

    	document.getElementById(objects[i].name).dispatchEvent(new Event("load"));

    	/*if (typeof(thisForm_load) === "function")
    		thisForm_load();

    	runtime_load = "";

    	for (var i = 0; i < object_events.length; i++)
			if (object_events[index].type == "form_starting")
				break;

		for (var j = 0; j < object_events[i].events.split(",").length; j++)
		{
			var event = object_events[i].events.split(",")[j];

			if (event != "load" && eval("typeof(thisForm_" + event + ")") === "function")
				runtime_code += "document.getElementById('Form1').addEventListener(\"" + event + "\", function(thisObject) {return function(evt){thisForm_" + event + "(evt);}} (Form1), false);\n";
		}

		eval(runtime_code);*/
	}
}

run_element_array_events = function(script_code)
{
	runtime_code = "";

	for (var i = 0; i < element_arrays.length; i++)
	{
		var elements = element_arrays[i].elements.split(",");

		for (var j = 0; j < object_events.length; j++)
			if (object_events[j].type == element_arrays[i].type)
				break;

		if (j < object_events.length)
		{
			var events = object_events[j].events.split(",");

			for (var k = 0; k < events.length; k++)
			{
				if (script_code.search(element_arrays[i].name + "_" + events[k]) != -1)
				{
					for (var l = 0; l < elements.length; l++)
					{
						runtime_code += "document.getElementById(\"" + elements[l] + "\").addEventListener(\"" + events[k] + "\", function (evt) {\n\t" + element_arrays[i].name + "_" + events[k] + "(evt, this, " + get_property(get_object(elements[l]).index, "Index").value + ")\n}, false);\n";
					}
				}
			}
		}
	}

	console.log(runtime_code);
	eval(runtime_code);	
}

remove_object = function(obj_name)
{
	for (var i = 0; i < objects.length; i++)
		if (objects[i].name == obj_name)
			break;

	objects[i].name = null;
	objects[i].properties.length = 0;

	/*if (i < objects.length)
		objects.splice(i, 1);

	for (var i = 0; i < objects.length; i++)
		objects[i].index = i;*/
}

add_object_fxs = function(this_object)
{
	this_object.setProperty = function(this_property, this_value)
	{
		for (var i = 0; i < this.properties.length; i++)
			if (this.properties[i].name == this_property)
				break;

		if (i < this.properties.length)
		{
			this.properties[i].value = this_value;

			if (document.getElementById(this.name) != undefined)
				draw_element(this.index);
		}
	}

	this_object.getProperty = function(this_property)
	{
		for (var i = 0; i < this.properties.length; i++)
			if (this.properties[i].name == this_property)
				break;

		if (i < this.properties.length)
		{
			if (this.properties[i].options != undefined && this.properties[i].options == "true,false")
			{
				if (this.properties[i].value == "true")
					return true;
				else if(this.properties[i].value == "false")
					return false;
			}
			else if(!isNaN(this.properties[i].value))
			{
				return Number(this.properties[i].value);
			}
		
			return this.properties[i].value;
		}
	}

	this_object.remove = function()
	{
		var del_elements = new Array();

		var active_objects = new Array();
		active_objects[0] = this_object.name;

		//document.getElementById(this_object.parent + get_object(this_object.parent).container_suffix).removeChild(document.getElementById(this_object.name));
		del_elements[0] = {}
		del_elements[0].id = this_object.name;

		//var objects_reserve = objects.splice(this_object.index, 1);

		while (active_objects.length > 0)
		{
			for (var i = 0; i < objects.length; i++)
			{
				var obj_len = active_objects.length;

				for (var j = 0; j < obj_len; j++)
				{
					if (objects[i].parent == active_objects[j])
					{
						if (objects[i].container == true)
							active_objects[active_objects.length] = objects[i].name;

						var index = del_elements.length;

						del_elements[index] = {};
						del_elements[index].id = objects[i].name;

						//var objects_reserve = objects.splice(objects[i].index, 1);						
					}
				}
			}

			active_objects.splice(0, obj_len);

			for (var i = del_elements.length - 1; i >= 0; i--)
			{
				document.getElementById(del_elements[i].id).parentElement.removeChild(document.getElementById(del_elements[i].id));	
				remove_object(del_elements[i].id);
			}
		}
	}

	if (this_object.type == "form")
	{
		this_object.show = function()
		{
			var element = document.getElementById(this_object.name);
			element.style.visibility = "visible";

			//setProperty(this_object.index, "Visibility", "visible");

			for (var i = 0; i < objects.length; i++)
			{
				if (objects[i].form == this_object.form && objects[i].type != "form")
				{
					document.getElementById(objects[i].name).style.visibility = get_property(i, "Visibility").value;
				}
			}
		}

		this_object.hide = function()
		{
			var element = document.getElementById(this_object.name);
			element.style.visibility = "hidden";

			//this.setProperty("Visibility", "hidden");

			for (var i = 0; i < objects.length; i++)
			{
				if (objects[i].form == this_object.form && objects[i].type != "form")
				{
					document.getElementById(objects[i].name).style.visibility = "hidden";
				}
			}
		}
	}

	if (this_object.type == "form" || this_object.container == true)
	{
		this_object.addElement = function(this_element)
		{
			var form_element = document.getElementById(this_object.name);
			var index = get_object_index(this_element.name);

			element = document.createElement(objects[index].element_type);
			element.id = objects[index].name;
			element.style.position = "absolute";

			objects[index].parent = this.name;
			objects[index].form = this.form;

			if (get_object(objects[index].parent).container_suffix != undefined)
				document.getElementById(objects[index].parent + get_object(objects[index].parent).container_suffix).appendChild(element);
			else
				document.getElementById(objects[index].parent).appendChild(element);

			eval("if (typeof " + objects[index].type + "_create_runtime === \"function\") " + objects[index].type + "_create_runtime(element, index);");			
			draw_element(index);

			var active_objects = new Array();
			active_objects[0] = objects[index].name;

			while (active_objects.length > 0)
			{
				for (var i = 0; i < objects.length; i++)
				{
					var obj_len = active_objects.length;

					for (var j = 0; j < obj_len; j++)
					{
						if (objects[i].parent == active_objects[j])
						{
							element = document.createElement(objects[i].element_type);
							element.id = objects[i].name;
							element.style.position = "absolute";

							objects[i].form = this.form;

							if (get_object(objects[i].parent).container_suffix != undefined)
								document.getElementById(objects[i].parent + get_object(objects[i].parent).container_suffix).appendChild(element);
							else
								document.getElementById(objects[i].parent).appendChild(element);

							eval("if (typeof " + objects[i].type + "_create_runtime === \"function\") " + objects[i].type + "_create_runtime(element, i);");
							draw_element(i);

							if (objects[i].container == true)
								active_objects[active_objects.length] = objects[i].name;			
						}
					}
				}

				active_objects.splice(0, obj_len);
			}		
		}
	}
}

newElement = function(element_name, element_type)
{
	for (var i = 0; i < object_template.length; i++)
		if (object_template[i].name == element_type)
			break;

	if (i < object_template.length)
	{
		for (var j = 0; j < objects.length; j++)
			if (objects[j].name == null)
				break;

		index = j;

		objects[index] = {};
		objects[index] = JSON.parse(JSON.stringify(object_template[i]));

		objects[index].name = element_name;
		set_property(index, "Name", element_name);

		objects[index].index = index;

		runtime_code = objects[index].name + " = objects[" + index + "];\n";			
		runtime_code += "add_object_fxs(" + objects[index].name + ");\n";

		eval(runtime_code);
	}
}

newFromTemplate = function(template_name, copy_name)
{
	for (var i = 0; i < project_data.templates.length; i++)
		if (project_data.templates[i].name == template_name)
			break;

	if (i < project_data.templates.length)
	{
		var this_template = {};

		for (j = 0; j < project_data.templates[i].objects.length; j++)
		{
			index = objects.length;

			objects[index] = {};
			objects[index] = JSON.parse(JSON.stringify(project_data.templates[i].objects[j]));

			eval("this_template." + objects[index].name + " = objects[index];");

			objects[index].name = copy_name + "_" + objects[index].name;
			set_property(index, "Name", objects[index].name);

			if (j > 0)
				objects[index].parent = copy_name + "_" + objects[index].parent;

			objects[index].index = index;

			runtime_code = objects[index].name + " = objects[" + index + "];\n";			
			runtime_code += "add_object_fxs(" + objects[index].name + ");\n";

			eval(runtime_code);
		}
	}

	return this_template;
}

getObject = function(object_name)
{
	for (var i = 0; i < objects.length; i++)
		if (objects[i].name == object_name)
			return objects[i];

	return null;
}

get_form_index = function(index)
{
	for (var i = 0; i < objects.length; i++)
		if (objects[i].form == index && objects[i].type == "form")
			return i;

	return null;
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

draw_element = function(index)
{
	var element = document.getElementById(objects[index].name);
	var old_name = objects[index].name;

	if (objects[index].type == "form")
	{
		//var tab_id = "main_formspace_name_" + objects[index].form;
		//document.getElementById(tab_id).innerHTML = get_property(index, "Name").value;

		element.style.left = objects[index].left + "px";
		element.style.top = objects[index].top + "px";

		if (get_property(index, "Center").value == "true")
		{
			element.style.left = (Math.floor(get_property(get_form_index(primary_form), "Width").value - get_property(index, "Width").value) / 2) + "px";
			element.style.top = (Math.floor(get_property(get_form_index(primary_form), "Height").value - get_property(index, "Height").value) / 2) + "px";
		}
		else
		{
			element.style.left = get_property(index, "Left").value + "px";
			element.style.top = get_property(index, "Top").value + "px";
		}

		element.style.width = get_property(index, "Width").value + "px";
		element.style.height = get_property(index, "Height").value + "px";
		element.style.zIndex = get_property(index, "ZIndex").value;

		element.style.visibility = get_property(index, "Visibility").value;

		element.style.backgroundColor = get_property(index, "BackgroundColor").value;

		element.style.borderColor = get_property(index, "BorderColor").value;
		element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
		element.style.borderStyle = get_property(index, "BorderStyle").value;
		element.style.borderWidth = get_property(index, "BorderWidth").value + "px";

		if (get_property(index, "BoxShadow").value == "true")
			element.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";

		if (get_property(index, "Image") != null && get_property(index, "Image").value != "" && get_property(index, "Image").value != objects[index].image)
		{
			objects[index].image = get_property(index, "Image").value;

			if (get_property(index, "Image").value.indexOf(":") == -1 && get_property(index, "Image").value.indexOf("..") == -1)
				element.innerHTML = "<img id = \"" + element.id + "_image\" src = \"" + project_folder + "/" + get_property(index, "Image").value + "\">";
			else
				element.innerHTML = "<img id = \"" + element.id + "_image\" src = \"" + get_property(index, "Image").value + "\">";
		}

		objects[index].width = parseInt(get_property(index, "Width").value);
		objects[index].height = parseInt(get_property(index, "Height").value);

		objects[index].name = get_property(index, "Name").value;
		element.id = objects[index].name;
	}
	else if (objects[index].type == "label")
	{
		element.style.left = get_property(index, "Left").value + "px";
		element.style.top = get_property(index, "Top").value + "px";
		element.style.zIndex = get_property(index, "ZIndex").value;

		objects[index].left = get_property(index, "Left").value; 
		objects[index].top = get_property(index, "Top").value;

		if (get_property(index, "Cursor") != null)
			element.style.cursor = get_property(index, "Cursor").value;

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

		if (document.getElementById(objects[get_form_index(objects[index].form)].name).style.visibility != "hidden")
			element.style.visibility = get_property(index, "Visibility").value;

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
	else if (objects[index].type == "panel")
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
		element.style.visibility = get_property(index, "Visibility").value;

		element.style.width = get_property(index, "Width").value + "px";
		element.style.height = get_property(index, "Height").value + "px";

		objects[index].width = parseInt(get_property(index, "Width").value);
		objects[index].height = parseInt(get_property(index, "Height").value);

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
		element.style.visibility = get_property(index, "Visibility").value;

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
		eval("if (typeof " + objects[index].type + "_draw_runtime === \"function\") " + objects[index].type + "_draw_runtime(element, index);");
	}

	var child_elements = element.children;
	var child_elements_array = Array.from(child_elements);

	child_elements_array.forEach((item) => {
		if (item.id.substring(0, item.id.lastIndexOf("_")) == old_name)
			item.id = objects[index].name + item.id.substring(item.id.lastIndexOf("_"), item.id.length);
	});
}

adjuster_create_runtime = function(element, index)
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

	element_sub1.addEventListener("click", function (index)
	{
		return function(evt)
		{
			var selectEvent = new CustomEvent("leftclick");
			document.getElementById(objects[index].name).dispatchEvent(selectEvent);
		}
	} (index), false);

	element_sub3.addEventListener("click", function (index)
	{
		return function(evt)
		{
			var selectEvent = new CustomEvent("rightclick");
			document.getElementById(objects[index].name).dispatchEvent(selectEvent);
		}
	} (index), false);
}

button_create_runtime = function(element, index)
{
	element.addEventListener("mousedown", function (index)
	{
		return function(evt)
		{	
			this.style.borderStyle = get_property(index, "MouseDown.BorderStyle").value;
			this.style.lineHeight = get_property(index, "MouseDown.LineHeight").value + "px";
		}
	} (index), false);

	element.addEventListener("mouseup", function (index)
	{
		return function(evt)
		{	
			this.style.borderStyle = get_property(index, "BorderStyle").value;
			this.style.lineHeight = get_property(index, "LineHeight").value + "px";
		}
	} (index), false);

	element.addEventListener("mouseout", function (index)
	{
		return function(evt)
		{	
			this.style.backgroundColor = get_property(index, "MouseOut.BackgroundColor").value;
		}
	} (index), false);

	element.addEventListener("mouseover", function (index)
	{
		return function(evt)
		{	
			this.style.backgroundColor = get_property(index, "MouseOver.BackgroundColor").value;
		}
	} (index), false);
}

canvas_create_runtime = function(element, index)
{
	element_canvas = document.createElement("canvas");
	element_canvas.id = objects[index].name + "_canvas";
	element_canvas.style.position = "absolute";

	element_canvas.style.top = "0px";
	element_canvas.style.left = "0px";

	element.appendChild(element_canvas);

	objects[index].getContext = function()
	{
		return document.getElementById(objects[index].name + "_canvas").getContext("2d");
	}
}

checkbox_create_runtime = function(element, index)
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

	element_sub1.addEventListener("click", function (index, this_box)
	{
		return function(evt)
		{
			if (get_property(index, "Check").value == "false")
			{
				set_property(index, "Check", "true")
				this.src = get_property(index, "Checked.Image").value;
			}
			else
			{
				set_property(index, "Check", "false")
				this.src = get_property(index, "Unchecked.Image").value;	
			}
		}
	} (index, this), false);
}

console_create_runtime = function(element, index)
{
	element_text = document.createElement("div");
	element_text.id = objects[index].name + "_text";
	element_text.style.position = "absolute";

	element_text.style.top = get_property(index, "PaddingTop").value + "px";
	element_text.style.left = get_property(index, "PaddingLeft").value + "px";

	element_text.style.width = (parseInt(get_property(index, "Width").value)) + "px";
	element_text.style.height = (parseInt(get_property(index, "Height").value)) + "px";

	element_text.style.lineHeight = parseInt(get_property(index, "LineHeight").value) + "px";
	element_text.style.overflowY = get_property(index, "OverflowY").value;

	element.appendChild(element_text);

	//for (var i = 0; i < 200; i++)
		//set_property(index, "Text", get_property(index, "Text").value + "<br>");

	element_text.innerHTML = get_property(index, "Text").value + "&gt;&nbsp;<input type='text' spellcheck='false' class='terminal_inputbox' id='" + get_property(index, "Name").value + "_prompt'>";

	element.addEventListener("keypress", function(index)
	{
		return function(evt)
		{
			if (evt.keyCode == 13)
			{
				var selectEvent = new CustomEvent("enter", {detail: {command: document.getElementById(this.id + "_prompt").value}});

				log_content = get_property(index, "Text").value + "&gt;&nbsp;" + document.getElementById(this.id + "_prompt").value + "<br>";
				document.getElementById(this.id + "_text").innerHTML = log_content;

				set_property(index, "Text", log_content);

				this.dispatchEvent(selectEvent);

				document.getElementById(this.id + "_text").innerHTML += "&gt;&nbsp;<input type='text' spellcheck='false' class='terminal_inputbox' id='" + this.id + "_prompt'>";

				var element_prompt = document.getElementById(this.id + "_prompt");

				element_prompt.style.borderStyle = "none";
				element_prompt.style.backgroundColor = "rgba(0, 0, 0, 0)";

				element_prompt.style.marginTop = "-2px";
				element_prompt.style.marginLeft = "-2px";

				element_prompt.style.fontFamily = get_property(index, "FontFamily").value;
				element_prompt.style.fontSize = get_property(index, "FontSize").value;
				element_prompt.style.color = get_property(index, "FontColor").value;

				element_prompt.value = "";
				element_prompt.focus();
			}
		}
	} (index), false);

	objects[index].print = function(text)
	{
		var element = document.getElementById(this.name);
		log_content = get_property(this.index, "Text").value + text + "<br>";

		set_property(this.index, "Text", log_content);
		document.getElementById(this.name + "_text").innerHTML += text + "<br>";
	}

	objects[index].focus = function()
	{
		document.getElementById(this.name + "_prompt").focus();
	}
}

picturebox_create_runtime = function(element, index)
{
	objects[index].image = "";

	element.addEventListener("mouseover", function(index)
	{
		return function(evt)
		{
			if (get_property(index, "MouseOver.BackgroundColor") != null)
				this.style.backgroundColor = get_property(index, "MouseOver.BackgroundColor").value;

			if (get_property(index, "Tooltip.Tooltip") != null && get_property(index, "Tooltip.Tooltip").value == "true")
			{
				tooltip.style.fontFamily = get_property(index, "Tooltip.FontFamily").value;
				tooltip.style.fontSize = get_property(index, "Tooltip.FontSize").value;
				tooltip.style.color = get_property(index, "Tooltip.FontColor").value;
				tooltip.style.backgroundColor = get_property(index, "Tooltip.BackgroundColor").value;

				tooltip.innerHTML = get_property(index, "Tooltip.Text").value;
				tooltip_flag = 1;
				tooltip_id = setTimeout(move_tooltip, 500);
			}
		}
	} (index), false);

	element.addEventListener("mouseout", function(index)
	{
		return function(evt)
		{
			if (get_property(index, "MouseOut.BackgroundColor") != null)
				this.style.backgroundColor = get_property(index, "MouseOut.BackgroundColor").value;

			if (get_property(index, "Tooltip.Tooltip") != null && get_property(index, "Tooltip.Tooltip").value == "true")
			{
				tooltip.style.left = "-1000px";
				tooltip_flag = 0;
				clearTimeout(tooltip_id);
			}
		}
	} (index), false);
}

pictureframe_create_runtime = function(element, index)
{
	element.addEventListener("mouseover", function(index)
	{
		return function(evt)
		{
			if (get_property(index, "MouseOver.BackgroundColor") != null)
				this.style.backgroundColor = get_property(index, "MouseOver.BackgroundColor").value;

			if (get_property(index, "Tooltip.Tooltip") != null && get_property(index, "Tooltip.Tooltip").value == "true")
			{
				tooltip.style.fontFamily = get_property(index, "Tooltip.FontFamily").value;
				tooltip.style.fontSize = get_property(index, "Tooltip.FontSize").value;
				tooltip.style.color = get_property(index, "Tooltip.FontColor").value;
				tooltip.style.backgroundColor = get_property(index, "Tooltip.BackgroundColor").value;

				tooltip.innerHTML = get_property(index, "Tooltip.Text").value;
				tooltip_flag = 1;
				tooltip_id = setTimeout(move_tooltip, 500);
			}
		}
	} (index), false);

	element.addEventListener("mouseout", function(index)
	{
		return function(evt)
		{
			if (get_property(index, "MouseOut.BackgroundColor") != null)
				this.style.backgroundColor = get_property(index, "MouseOut.BackgroundColor").value;

			if (get_property(index, "Tooltip.Tooltip") != null && get_property(index, "Tooltip.Tooltip").value == "true")
			{
				tooltip.style.left = "-1000px";
				tooltip_flag = 0;
				clearTimeout(tooltip_id);
			}
		}
	} (index), false);
}

textbox_create_runtime = function(element, index)
{
	element.addEventListener("keyup", function (index)
	{
		return function(evt)
		{	
			set_property(index, "Text", this.value);
		}
	} (index), false);
}

move_tooltip = function()
{
	tooltip.style.left = mouse_x + 12 + "px";
	tooltip.style.top = mouse_y + 4 + "px";
}

scrollpanel_create_runtime = function(element, index)
{
	element_panel = document.createElement("div");
	element_panel.id = objects[index].name + "_panel";
	element_panel.style.position = "absolute";

	element_panel.style.top = "0px";
	element_panel.style.left = "0px";

	element.appendChild(element_panel);
}

tabcontrol_create_runtime = function(element, index)
{
	var tab_panel = new Array();
	var tab_tab = new Array();
	var tab_total = parseInt(get_property(index, "Tabs.Amount").value);
	var tab_height = parseInt(get_property(index, "Tabs.Height").value);

	var width = parseInt(get_property(index, "Width").value);
	var height = parseInt(get_property(index, "Height").value);

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

		if (i == parseInt(get_property(index, "Tabs.Select").value))
		{
			tab_tab[i].style.borderBottom = "0px";
			tab_tab[i].style.height = (parseInt(get_property(index, "Tabs.Height").value) + parseInt(get_property(index, "Tabs.BorderWidth").value)) + "px";
			//tab_tab[i].style.paddingBottom = parseInt(get_property(index, "Tabs.BorderWidth").value) + "px";
			tab_tab[i].style.backgroundColor = get_property(index, "Tabs.SelectColor").value;
		}

		element.appendChild(tab_tab[i]);

		tab_tab[i].addEventListener("click", function (element, index)
		{
			return function(evt)
			{
			    var tab_select = parseInt(this.id.substring(this.id.search("tab") + 4, this.id.length));

			    set_property(index, "Tabs.Select", tab_select);
				tabcontrol_draw_runtime(element, index);
			}
		} (element, index), false);
	}
}

tilemap_create_runtime = function(element, index)
{
	element_map_div = document.createElement("div");
	element_map_div.id = objects[index].name + "_mapdiv";
	element_map_div.style.position = "absolute";

	element_map_div.style.top = "0px";
	element_map_div.style.left = "0px";

	element.appendChild(element_map_div);

	element_map = document.createElement("canvas");
	element_map.id = objects[index].name + "_map";
	element_map.style.position = "absolute";

	element_map.style.top = "0px";
	element_map.style.left = "0px";

	element_map_div.appendChild(element_map);

	element_overlay = document.createElement("canvas");
	element_overlay.id = objects[index].name + "_overlay";
	element_overlay.style.position = "absolute";

	element_overlay.style.top = "0px";
	element_overlay.style.left = "0px";

	element_map_div.appendChild(element_overlay);

	objects[index].drag = false;
	objects[index].drag_x = 0;
	objects[index].drag_y = 0;
	objects[index].start_x = 0;
	objects[index].start_y = 0;

	element_highlight = document.createElement("img");
	element_highlight.id = objects[index].name + "_highlight";
	element_highlight.style.position = "absolute";

	element_highlight.style.top = "0px";
	element_highlight.style.left = "0px";

	element_highlight.style.visibility = "hidden";

	element_map_div.appendChild(element_highlight);

	//var map = document.getElementById(objects[index].name + "_map");
	var ctx = element_map.getContext("2d");

	var map_height = parseInt(get_property(index, "MapHeight").value);
	var map_width = parseInt(get_property(index, "MapWidth").value);
	var tile_height = parseInt(get_property(index, "TileHeight").value);
	var tile_width = parseInt(get_property(index, "TileWidth").value);

	var tile_color = get_property(index, "TileBackgroundColor").value;
	var offset = parseInt(get_property(index, "TileBorderWidth").value);

	element_map.height = map_height * tile_height;
	element_map.width = map_width * tile_width;

	element_overlay.height = map_height * tile_height;
	element_overlay.width = map_width * tile_width;

	objects[index].map = new Array();

	for (var i = 0; i < map_height; i++)
	{
		objects[index].map[i] = new Array();

		for (var j = 0; j < map_width; j++)
		{
			objects[index].map[i][j] = null;

			ctx.fillStyle = tile_color;
			ctx.fillRect((j * tile_width) + offset, (i * tile_height) + offset, tile_width - (offset * 2), tile_height - (offset * 2));
		}
	}

	objects[index].mapTile = function(x, y, image)
	{
		this.map[y][x] = image;

		if (image.complete == true)
		{
			var map_ctx = document.getElementById(this.name + "_map").getContext("2d");
			map_ctx.drawImage(image, x * parseInt(get_property(this.index, "TileWidth").value), y * parseInt(get_property(this.index, "TileHeight").value));
		}
		else
		{
			for (var i = 0; i < startIDs.length; i++)
				if (startIDs[i].use)
					break;

			startIDs[i] = {}
			startIDs[i].id = 0;
			startIDs[i].use = false;
			startIDs[i].id = setInterval(drawTile, 10, this, x, y, image, i);
		}
	}

	objects[index].mapColor = function(x, y, color)
	{
		this.map[y][x] = color;

		var map_ctx = document.getElementById(this.name + "_map").getContext("2d");

		map_ctx.fillStyle = color;
		map_ctx.fillRect(x * parseInt(get_property(this.index, "TileWidth").value), y * parseInt(get_property(this.index, "TileHeight").value), parseInt(get_property(this.index, "TileWidth").value), parseInt(get_property(this.index, "TileHeight").value));
	}

	objects[index].clearTile = function(x, y)
	{
		var map_ctx = document.getElementById(this.name + "_map").getContext("2d");
		map_ctx.clearRect(x * parseInt(get_property(this.index, "TileWidth").value), y * parseInt(get_property(this.index, "TileHeight").value), parseInt(get_property(this.index, "TileWidth").value), parseInt(get_property(this.index, "TileHeight").value));

		var tile_color = get_property(this.index, "TileBackgroundColor").value;
		var offset = parseInt(get_property(this.index, "TileBorderWidth").value);

		var tile_width = parseInt(get_property(this.index, "TileWidth").value);
		var tile_height = parseInt(get_property(this.index, "TileHeight").value)

		ctx.fillStyle = tile_color;
		ctx.fillRect((x * tile_width) + offset, (y * tile_height) + offset, tile_width - (offset * 2), tile_height - (offset * 2));
	}

	objects[index].mapOverlay = function(x, y, image)
	{
		this.map[y][x] = image;

		if (image.complete == true)
		{
			var map_ctx = document.getElementById(this.name + "_overlay").getContext("2d");
			map_ctx.drawImage(image, x * parseInt(get_property(this.index, "TileWidth").value), y * parseInt(get_property(this.index, "TileHeight").value));
		}
		else
		{
			for (var i = 0; i < startIDs.length; i++)
				if (startIDs[i].use)
					break;

			startIDs[i] = {}
			startIDs[i].id = 0;
			startIDs[i].use = false;
			startIDs[i].id = setInterval(drawOverlay, 10, this, x, y, image, i);
		}
	}

	objects[index].clearOverlay = function(x, y, width, height)
	{
		var map_ctx = document.getElementById(this.name + "_overlay").getContext("2d");
		map_ctx.clearRect(x * parseInt(get_property(this.index, "TileWidth").value), y * parseInt(get_property(this.index, "TileHeight").value), width, height);
	}

	objects[index].getTile = function(x, y)
	{
		return this.map[y][x];
	}

	objects[index].shiftTo = function(x, y)
	{
		var map_element = document.getElementById(this.name + "_mapdiv");
		map_element.style.left = -(x) + "px";
		map_element.style.top = -(y) + "px";
	}

	objects[index].doSelect = function(tile_x, tile_y)
	{
		var index = this.index;

		var map_highlight = document.getElementById(this.name + "_highlight");
		map_highlight.style.visibility = "visible";

		map_highlight.style.left = (tile_x * get_property(index, "TileWidth").value) + "px";
		map_highlight.style.top = (tile_y * get_property(index, "TileHeight").value) + "px";

		set_property(index, "SelectX", tile_x);
		set_property(index, "SelectY", tile_y);
	}

	element_map_div.addEventListener("mousedown", function (index)
	{
		return function(evt)
		{
			objects[index].drag = true;
			objects[index].drag_x = evt.pageX;
			objects[index].drag_y = evt.pageY;

			objects[index].start_x = parseInt(this.style.left);
			objects[index].start_y = parseInt(this.style.top);

			drag_index = index;

			mouse_click = true;

			if (get_property(index, "PaintSelect").value == "true")
			{
				var rect = this.getBoundingClientRect();
				var x = (evt.clientX / window_zoom) - rect.left;
				var y = (evt.clientY / window_zoom) - rect.top;

				var tile_x = Math.floor((x / 1) / get_property(index, "TileWidth").value);
				var tile_y = Math.floor((y / 1) / get_property(index, "TileHeight").value);

				set_property(index, "SelectX", tile_x);
				set_property(index, "SelectY", tile_y);

				var selectEvent = new CustomEvent("tileselect", {detail: {tile_x: tile_x, tile_y: tile_y, button: evt.button}});
				document.getElementById(objects[index].name).dispatchEvent(selectEvent);
			}
			else
			{
				setTimeout(function() { mouse_click = false; }, get_property(index, "SelectTimer").value);
			}
		}
	} (index), false);

	element_map_div.addEventListener("mousemove", function (index)
	{
		return function(evt)
		{
			mouse_click = false;

			if (evt.buttons == 1 && get_property(index, "Draggable").value == "true")
			{
				this.style.left = (objects[index].start_x + (evt.pageX - objects[index].drag_x)) + "px";
				this.style.top = (objects[index].start_y + (evt.pageY - objects[index].drag_y)) + "px";

				if (parseInt(this.style.left) > 0)
					this.style.left = "0px";
				else if (parseInt(this.style.left) < -(get_property(index, "MapWidth").value * get_property(index, "TileWidth").value) + get_property(index, "Width").value)
					this.style.left = (-(get_property(index, "MapWidth").value * get_property(index, "TileWidth").value) + get_property(index, "Width").value) + "px";

				if (parseInt(this.style.top) > 0)
					this.style.top = "0px";
				else if (parseInt(this.style.top) < -(get_property(index, "MapHeight").value * get_property(index, "TileHeight").value) + get_property(index, "Height").value)
					this.style.top = (-(get_property(index, "MapHeight").value * get_property(index, "TileHeight").value) + get_property(index, "Height").value) + "px";
			}

			if (get_property(index, "Highlight").value == "follow" || (get_property(index, "Highlight").value == "follow/select" && (parseInt(get_property(index, "SelectX").value) == -1 || parseInt(get_property(index, "SelectY").value) == -1)))
			{
				var rect = this.getBoundingClientRect();
				var x = (evt.clientX / window_zoom)- rect.left;
				var y = (evt.clientY / window_zoom) - rect.top;

				var tile_x = Math.floor((x / 1) / get_property(index, "TileWidth").value);
				var tile_y = Math.floor((y / 1) / get_property(index, "TileHeight").value);

				var map_highlight = document.getElementById(this.id.replace("_mapdiv", "_highlight"));
				map_highlight.style.visibility = "visible";

				map_highlight.style.left = (tile_x * get_property(index, "TileWidth").value) + "px";
				map_highlight.style.top = (tile_y * get_property(index, "TileHeight").value) + "px";
			}

			if (mouse_click == true && get_property(index, "PaintSelect").value == "true")
			{
				var rect = this.getBoundingClientRect();
				var x = (evt.clientX / window_zoom)- rect.left;
				var y = (evt.clientY / window_zoom) - rect.top;

				var tile_x = Math.floor((x / 1) / get_property(index, "TileWidth").value);
				var tile_y = Math.floor((y / 1) / get_property(index, "TileHeight").value);

				if (tile_x != get_property(index, "SelectX").value || tile_y != get_property(index, "SelectY").value)
				{
					set_property(index, "SelectX", tile_x);
					set_property(index, "SelectY", tile_y);

					var selectEvent = new CustomEvent("tileselect", {detail: {tile_x: tile_x, tile_y: tile_y}});
					document.getElementById(objects[index].name).dispatchEvent(selectEvent);
				}
			}
		}
	} (index), false);

	element_map_div.addEventListener("mouseup", function (index)
	{
		return function(evt)
		{
			objects[index].drag = false;
			drag_index = -1;

			if (mouse_click == true)
			{
				var rect = this.getBoundingClientRect();
				var x = (evt.clientX / window_zoom)- rect.left;
				var y = (evt.clientY / window_zoom) - rect.top;

				var tile_x = Math.floor((x / 1) / get_property(index, "TileWidth").value);
				var tile_y = Math.floor((y / 1) / get_property(index, "TileHeight").value);

				set_property(index, "SelectX", tile_x);
				set_property(index, "SelectY", tile_y);

				if (get_property(index, "Highlight").value == "select" || get_property(index, "Highlight").value == "follow/select")
				{
					var map_highlight = document.getElementById(this.id.replace("_mapdiv", "_highlight"));
					map_highlight.style.visibility = "visible";

					map_highlight.style.left = (tile_x * get_property(index, "TileWidth").value) + "px";
					map_highlight.style.top = (tile_y * get_property(index, "TileHeight").value) + "px";					
				}

				if (get_property(index, "PaintSelect").value == "false")
				{
					var selectEvent = new CustomEvent("tileselect", {detail: {tile_x: tile_x, tile_y: tile_y, button: evt.button}});
					document.getElementById(objects[index].name).dispatchEvent(selectEvent);
				}
			}

			mouse_click = false;
		}
	} (index), false);

	element_map_div.addEventListener("mouseout", function (index)
	{
		return function(evt)
		{
			//objects[index].drag = false;
			drag_index = -1;

			if (get_property(index, "Highlight").value == "none" || get_property(index, "Highlight").value == "follow")
			{
				highlight_id = this.id.replace("_mapdiv", "_highlight");
				document.getElementById(highlight_id).style.visibility = "hidden";
			}
		}
	} (index), false);
}

tileselect_create_runtime = function(element, index)
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

	element_highlight = document.createElement("img");
	element_highlight.id = objects[index].name + "_highlight";
	element_highlight.style.position = "absolute";

	element_highlight.style.top = "0px";
	element_highlight.style.left = "0px";

	element_highlight.style.visibility = "hidden";

	element_griddiv.appendChild(element_highlight);

	objects[index].getSelectSrc = function()
	{
		var tile_num = get_property(this.index, "SelectIndex").value;
		var tile_src = get_property(this.index, "Tileset").value.split(",")[tile_num];

		return tile_src;
	}

	objects[index].getSelectImage = function()
	{
		var tile_element = document.getElementById(get_property(this.index, "Name").value + "_tile_" + get_property(this.index, "SelectIndex").value);
		return tile_element;
	}

	objects[index].addTile = function(this_src)
	{
		this_src = this_src.replaceAll(";", ",");

		if (get_property(this.index, "Tileset").value == "" || get_property(this.index, "Tileset").value == undefined)
		{
			set_property(this.index, "Tileset", this_src);
		}
		else
			set_property(this.index, "Tileset", get_property(this.index, "Tileset").value + "," + this_src);

		tileselect_draw_runtime(document.getElementById(this.name), this.index);
	}

	objects[index].getTile = function(this_num)
	{
		return get_property(this.index, "Tileset").value.split(";")[this_num];
	}

	objects[index].clearTiles = function()
	{
		var grid = document.getElementById(get_property(this.index, "Name").value + "_grid");

		while (grid.firstChild) 
		{
	    	grid.removeChild(grid.lastChild);
		}

		set_property(this.index, "Tileset", "");
	}

	element_griddiv.addEventListener("mousemove", function (index)
	{
		return function(evt)
		{
			if (get_property(index, "Highlight").value == "follow" || (get_property(index, "Highlight").value == "follow/select" && (parseInt(get_property(index, "SelectX").value) == -1 || parseInt(get_property(index, "SelectY").value) == -1)))
			{
				var rect = this.getBoundingClientRect();
				var x = evt.clientX - rect.left;
				var y = evt.clientY - rect.top;

				var tile_x = Math.floor((x / window_zoom) / get_property(index, "TileWidth").value);
				var tile_y = Math.floor((y / window_zoom) / get_property(index, "TileHeight").value);

				var grid_highlight = document.getElementById(this.id.replace("_griddiv", "_highlight"));
				grid_highlight.style.visibility = "visible";

				grid_highlight.style.left = (tile_x * get_property(index, "TileWidth").value) + "px";
				grid_highlight.style.top = (tile_y * get_property(index, "TileHeight").value) + "px";
			}
		}
	} (index), false);

	element_griddiv.addEventListener("mouseup", function (index)
	{
		return function(evt)
		{
			var rect = this.getBoundingClientRect();
			var x = evt.clientX - rect.left;
			var y = evt.clientY - rect.top;

			var tile_x = Math.floor((x / window_zoom) / get_property(index, "TileWidth").value);
			var tile_y = Math.floor((y / window_zoom) / get_property(index, "TileHeight").value);

			var tile_num = (tile_y * get_property(index, "GridWidth").value) + tile_x;
			var tile_src = get_property(index, "Tileset").value.split(",")[tile_num];

			set_property(index, "SelectIndex", tile_num);

			if (get_property(index, "Highlight").value == "select" || get_property(index, "Highlight").value == "follow/select")
			{
				var grid_highlight = document.getElementById(this.id.replace("_griddiv", "_highlight"));
				grid_highlight.style.visibility = "visible";

				grid_highlight.style.left = (tile_x * get_property(index, "TileWidth").value) + "px";
				grid_highlight.style.top = (tile_y * get_property(index, "TileHeight").value) + "px";					
			}

			var selectEvent = new CustomEvent("tileselect", {detail: {tile_num: tile_num, tile_src: tile_src}});
			document.getElementById(objects[index].name).dispatchEvent(selectEvent);
		}
	} (index), false);

	element_griddiv.addEventListener("mouseout", function (index)
	{
		return function(evt)
		{
			//objects[index].drag = false;
			drag_index = -1;

			if (get_property(index, "Highlight").value == "none" || get_property(index, "Highlight").value == "follow")
			{
				highlight_id = this.id.replace("_griddiv", "_highlight");
				document.getElementById(highlight_id).style.visibility = "hidden";
			}
		}
	} (index), false);
}

window_create_runtime = function(element, index)
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

	var header_boxx = document.createElement("div");	
	header_boxx.id =  objects[index].name + "_header_boxx";
	header_boxx.style.position = "absolute";

	header_boxx.style.top = "0px";
	header_boxx.style.left = "0px";

	header_boxx.innerHTML = "<center><img id = \"" + objects[index].name + "_header_x\" src = \"img/window_x.png\"></center>";

	element_header.appendChild(header_boxx);

	var header_boxmax = document.createElement("div");
	header_boxmax.id = objects[index].name + "_header_boxmax";
	header_boxmax.style.position = "absolute";

	header_boxmax.style.top = "0px";
	header_boxmax.style.left = "0px";
	header_boxmax.style.paddingTop = "2px";

	header_boxmax.style.width = "50px";
	header_boxmax.style.height = "20px";

	header_boxmax.style.backgroundColor = "transparent"; 
	header_boxmax.innerHTML = "<center><img id = \"" + objects[index].name  + "_header_max\" src = \"img/window_max.png\"></center>";

	element_header.appendChild(header_boxmax);

	var header_boxmin = document.createElement("div");
	header_boxmin.id = objects[index].name + "_header_boxmin";
	header_boxmin.style.position = "absolute";

	header_boxmin.style.top = "0px";
	header_boxmin.style.left = "0px";
	header_boxmin.style.paddingTop = "2px";

	header_boxmin.style.width = "50px";
	header_boxmin.style.height = "20px";

	header_boxmin.style.backgroundColor = "transparent"; 
	header_boxmin.innerHTML = "<center><img id = \"" + objects[index].name  + "_header_min\" src = \"img/window_min.png\"></center>";

	element_header.appendChild(header_boxmin);

	element.addEventListener("mousemove", function (index)
	{
		return function(evt)
		{
			var element = this;

			var rect = evt.target.getBoundingClientRect();
			var x = evt.clientX - rect.left;
			var y = evt.clientY - rect.top;

			if (parseInt(element.style.height) - y < 5 && parseInt(element.style.width) - x < 5)
			{
				element.style.cursor = "nwse-resize";
			}
			else if (parseInt(element.style.height) - y < 5)
			{
				element.style.cursor = "ns-resize";
			}
			else if (parseInt(element.style.width) - x < 5)
			{
				element.style.cursor = "ew-resize";
			}
			else if (mouse_resize == undefined)
			{
				element.style.cursor = "default";
			}
		}
	} (index), false);

	element.addEventListener("mousedown", function (index)
	{
		if (this.style.cursor == "nwse-resize")
		{
			mouse_resize = {};
			mouse_resize.element = element;
			mouse_resize.dir = "nsew";
		}
		else if (this.style.cursor == "ns-resize")
		{
			mouse_resize = {};
			mouse_resize.element = element;
			mouse_resize.dir = "ns";
		}
		else if (this.style.cursor == "ew-resize")
		{
			mouse_resize = {};
			mouse_resize.element = element;
			mouse_resize.dir = "ew";
		}
	}, false);

	element.addEventListener("mouseup", function (index)
	{
		mouse_resize = undefined;
	}, false);

	element_header.addEventListener("mousedown", function (index)
	{
		return function(evt)
		{
			mouse_bite = this.parentElement.id;
		}
	} (index), false);

	header_boxx.addEventListener("mouseover", function (index)
	{
		return function(evt)
		{
			this.style.backgroundColor = "#e81123";

			var x_id = this.id.substring(0, this.id.length - 4) + "x";
			document.getElementById(x_id).src = "img/window_redx.png";
		}
	} (index), false);

	header_boxx.addEventListener("mouseout", function (index)
	{
		return function(evt)
		{
			this.style.backgroundColor = "transparent";

			var x_id = this.id.substring(0, this.id.length - 4) + "x";
			document.getElementById(x_id).src = "img/window_x.png";
		}
	} (index), false);

	header_boxmax.addEventListener("mouseover", function (index)
	{
		return function(evt)
		{
			this.style.backgroundColor = "#c7cacf"; 
		}
	} (index), false);

	header_boxmax.addEventListener("mouseout", function (index)
	{
		return function(evt)
		{
			this.style.backgroundColor = "transparent"; 
		}
	} (index), false);

	header_boxmin.addEventListener("mouseover", function (index)
	{
		return function(evt)
		{
			this.style.backgroundColor = "#c7cacf"; 
		}
	} (index), false);

	header_boxmin.addEventListener("mouseout", function (index)
	{
		return function(evt)
		{
			this.style.backgroundColor = "transparent"; 
		}
	} (index), false);

	header_boxx.addEventListener("mouseup", function (index)
	{
		return function(evt)
		{
			var selectEvent = new CustomEvent("close", {detail: {button: evt.button}});
			document.getElementById(objects[index].name).dispatchEvent(selectEvent);
		}
	} (index), false);

	header_boxmax.addEventListener("mouseup", function (index)
	{
		return function(evt)
		{
			var selectEvent = new CustomEvent("max", {detail: {button: evt.button}});
			document.getElementById(objects[index].name).dispatchEvent(selectEvent);
		}
	} (index), false);

	header_boxmin.addEventListener("mouseup", function (index)
	{
		return function(evt)
		{
			var selectEvent = new CustomEvent("min", {detail: {button: evt.button}});
			document.getElementById(objects[index].name).dispatchEvent(selectEvent);
		}
	} (index), false);
}

openfiledialog_create_runtime = function(element, index)
{
	objects[index].show = function()
	{
		var chooser = document.querySelector("#loadDialog");
		chooser.click();
	}

	document.querySelector("#loadDialog").addEventListener("change", function(thisObject)
	{
		return function(evt)
		{
			var this_folder = project_folder.replaceAll("\\", "/") + "/";
			set_property(thisObject.index, "Filename", this.value.replaceAll("\\", "/").replaceAll(this_folder, ""));

			var selectEvent = new CustomEvent("fileselect", {detail: {filename: this.value}});
			document.getElementById(thisObject.name).dispatchEvent(selectEvent);
		}
	} (objects[index]), false);
}

savefiledialog_create_runtime = function(element, index)
{
	objects[index].show = function()
	{
		var chooser = document.querySelector("#saveDialog");
		chooser.click();
	}

	document.querySelector("#saveDialog").addEventListener("change", function(thisObject)
	{
		return function(evt)
		{
			var this_folder = project_folder.replaceAll("\\", "/") + "/";
			set_property(thisObject.index, "Filename", this.value.replaceAll("\\", "/").replaceAll(this_folder, ""));

			var selectEvent = new CustomEvent("fileselect", {detail: {filename: this.value}});
			document.getElementById(thisObject.name).dispatchEvent(selectEvent);
		}
	} (objects[index]), false);
}

drawTile = function(this_object, x, y, image, index)
{
	if (image.complete == true)
	{
		clearInterval(startIDs[index].id);
		startIDs[index].use = true;

		var map_ctx = document.getElementById(this_object.name + "_map").getContext("2d");
		map_ctx.drawImage(image, x * parseInt(get_property(this_object.index, "TileWidth").value), y * parseInt(get_property(this_object.index, "TileHeight").value));
	}
}

drawOverlay = function(this_object, x, y, image, index)
{
	if (image.complete == true)
	{
		clearInterval(startIDs[index].id);
		startIDs[index].use = true;

		var map_ctx = document.getElementById(this_object.name + "_overlay").getContext("2d");
		map_ctx.drawImage(image, x * parseInt(get_property(this_object.index, "TileWidth").value), y * parseInt(get_property(this_object.index, "TileHeight").value));
	}
}

adjuster_draw_runtime = function(element, index)
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

	element_sub1.style.cursor = get_property(index, "LeftArrow.Cursor").value;
	element_sub3.style.cursor = get_property(index, "RightArrow.Cursor").value;

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

	element_sub1.src = get_property(index, "LeftArrow.Image").value;

	element_sub1.addEventListener("load", function (this_height)
	{
		return function(evt)
		{
			this.style.left = "0px";
			this.style.top = Math.floor((this_height - this.height) / 2) + "px";
		}
	} (parseInt(element.style.height)), false);	

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
}

button_draw_runtime = function(element, index)
{
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	element.style.opacity = get_property(index, "Opacity").value;
	element.style.cursor = get_property(index, "Cursor").value;

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

canvas_draw_runtime = function(element, index)
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

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;
	element.style.visibility = get_property(index, "Visibility").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	var element_canvas = document.getElementById(element.id + "_canvas");
	
	if (element_canvas.width != parseInt(get_property(index, "Width").value))
		element_canvas.width = parseInt(get_property(index, "Width").value);
	
	if (element_canvas.height != parseInt(get_property(index, "Height").value))
		element_canvas.height = parseInt(get_property(index, "Height").value);

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

checkbox_draw_runtime = function(element, index)
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

console_draw_runtime = function(element, index)
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
	element.style.color = get_property(index, "FontColor").value;

	element.style.paddingLeft = parseInt(get_property(index, "PaddingLeft").value) + "px";
	element.style.paddingRight = parseInt(get_property(index, "PaddingRight").value) + "px";
	element.style.paddingTop = parseInt(get_property(index, "PaddingTop").value) + "px";
	element.style.paddingBottom = parseInt(get_property(index, "PaddingBottom").value) + "px";

	element.style.marginLeft = parseInt(get_property(index, "MarginLeft").value) + "px";
	element.style.marginRight = parseInt(get_property(index, "MarginRight").value) + "px";
	element.style.marginTop = parseInt(get_property(index, "MarginTop").value) + "px";
	element.style.marginBottom = parseInt(get_property(index, "MarginBottom").value) + "px";

	//element.style.overflowX = get_property(index, "OverflowX").value;
	document.getElementById(element.id + "_text").style.overflowY = get_property(index, "OverflowY").value;

	var gradient = parseInt(get_property(index, "GradientWidth").value);

	if (gradient == 0)
	{
		element.style.backgroundColor = get_property(index, "BackgroundColor").value;
	}
	else
	{
		var colors = get_property(index, "BackgroundColor").value.substring(get_property(index, "BackgroundColor").value.indexOf("rgba(") + 5, get_property(index, "BackgroundColor").value.indexOf(")")).split(",");

		for (var i = 0; i < colors.length; i++)
			colors[i] = parseFloat(colors[i]);

		var stripes = Math.floor(parseFloat(get_property(index, "Height").value) / gradient);
		var step = colors[3] / Math.floor(parseFloat(get_property(index, "Height").value) / gradient);

		var lingrad = "linear-gradient(0deg,";
		var opacity = colors[3];
		var starty = 0;

		for (var i = 0; i < stripes; i++)
		{
			lingrad += " rgba(" + colors[0] + " ," + colors[1] + " ," + colors[2] + " ," + colors[3] + ") " + starty + "px, "

			if (i < stripes - 1)
				lingrad += " rgba(" + colors[0] + " ," + colors[1] + " ," + colors[2] + " ," + colors[3] + ") " + (starty + gradient) + "px, ";
			else
				lingrad += " rgba(" + colors[0] + " ," + colors[1] + " ," + colors[2] + " ," + colors[3] + ") " + (starty + gradient) + "px)";

			starty += gradient;
			colors[3] -= step;
		}

		element.style.backgroundImage = lingrad;
	}

	//element.style.backgroundColor = get_property(index, "BackgroundColor").value;
	//element.style.backgroundImage = "linear-gradient(0deg, rgba(32, 32, 32, 1) 0px, rgba(32, 32, 32, 1) 30px, #465298 30px, #465298 200px)";
	//"repeating-linear-gradient(45deg, #606dbc, #606dbc 10px, #465298 10px, #465298 20px);";
	//get_property(index, "BackgroundColor").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	var element_prompt = document.getElementById(get_property(index, "Name").value + "_prompt");

	element_prompt.style.borderStyle = "none";
	element_prompt.style.backgroundColor = "rgba(0, 0, 0, 0)";

	element_prompt.style.marginTop = "-2px";
	element_prompt.style.marginLeft = "-2px";

	element_prompt.style.fontFamily = get_property(index, "FontFamily").value;
	element_prompt.style.fontSize = get_property(index, "FontSize").value;
	element_prompt.style.color = get_property(index, "FontColor").value;

	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

dropdownlist_draw_runtime = function(element, index)
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

picturebox_draw_runtime = function(element, index)
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

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;

	/*if (get_property(index, "Visibility") != null)
	{
		var visible_flag = true;
		var element_check = element.parentElement;

		while (element_check  != null)
		{
			if (element_check.style.visibility == "hidden")
				visible_flag = false;

			var element_check = element_check.parentElement;			
		}

		if (visible_flag == true)
			element.style.visibility = get_property(index, "Visibility").value;
		else
			element.style.visibility = "inherit";
	}*/

	//if (get_property(index, ImageCenter).value == "true")

	if (get_property(index, "Image").value != "" && get_property(index, "Image").value != objects[index].image)
	{
		objects[index].image = get_property(index, "Image").value;

		if (get_property(index, "Image").value.indexOf(":") == -1 && get_property(index, "Image").value.indexOf("..") == -1)
			element.innerHTML = "<img id = \"" + element.id + "_image\" src = \"" + project_folder + "/" + get_property(index, "Image").value + "\">";
		else
			element.innerHTML = "<img id = \"" + element.id + "_image\" src = \"" + get_property(index, "Image").value + "\">";

		document.getElementById(element.id + "_image").addEventListener("load", function (obj_index)
		{
			return function(evt)
			{
				this.style.position = "absolute";

				if (get_property(index, "Scale") != null && get_property(index, "Scale").value == "true")
				{
					this.width = parseInt(get_property(index, "Width").value);
					this.height = parseInt(get_property(index, "Height").value);
				}

				if (get_property(index, "HorizontalAlign") != null)
				{
					if (get_property(index, "HorizontalAlign").value == "center")
						this.style.left = Math.floor((get_property(index, "ElementWidth").value - this.width) / 2) + "px";
					else if (get_property(index, "HorizontalAlign").value == "right")
						this.style.left = (get_property(index, "ElementWidth").value - this.width) + "px";
					else
						this.style.left = "0px";
				}

				if (get_property(index, "VerticalAlign") != null)
				{
					if (get_property(index, "VerticalAlign").value == "center")
						this.style.top = Math.floor((get_property(index, "ElementHeight").value - this.height) / 2) + "px";
					else if (get_property(index, "VerticalAlign").value == "right")
						this.style.top = (get_property(index, "ElementHeight").value - this.height) + "px";
					else
						this.style.top = "0px";
				}
			}
		} (index), false);
	}

	var tform = "";

	if (get_property(index, "FlipHorizontal") != null)
	{
		if (get_property(index, "FlipHorizontal").value == "true")
			tform += "scaleX(-1) ";
		else
			tform += "scaleX(1) ";
	}

	if (get_property(index, "Rotation") != null)
		tform += "rotate(" + get_property(index, "Rotation").value + ")";

	element.style.transform = tform;

	if (get_property(index, "Opacity") != null)
		element.style.opacity = get_property(index, "Opacity").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	objects[index].name = get_property(index, "Name").value;
	element.id = objects[index].name;
}

pictureframe_draw_runtime = function(element, index)
{
	element.id = get_property(index, "Name").value;

	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";

	element.style.overflow = "hidden";

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
	element.style.visibility = get_property(index, "Visibility").value;

	//if (get_property(index, ImageCenter).value == "true")

	if (get_property(index, "Image").value != "" && get_property(index, "Image").value != objects[index].image)
	{
		objects[index].image = get_property(index, "Image").value;
		
		if (get_property(index, "Image").value.indexOf(":") == -1 && get_property(index, "Image").value.indexOf("..") == -1)
			element.innerHTML = "<img id = \"" + element.id + "_image\" src = \"" + project_folder + "/" + get_property(index, "Image").value + "\">";
		else
			element.innerHTML = "<img id = \"" + element.id + "_image\" src = \"" + get_property(index, "Image").value + "\">";

		document.getElementById(element.id + "_image").addEventListener("load", function (obj_index)
		{
			return function(evt)
			{
				this.style.position = "absolute";

				this.style.left = -((this.width / parseInt(get_property(obj_index, "Frames").value)) * parseInt(get_property(obj_index, "Frame").value)) + "px";
				this.style.top = -((this.height / parseInt(get_property(obj_index, "Rows").value)) * parseInt(get_property(obj_index, "Row").value)) + "px";
			}
		} (index), false);
	}

	if (get_property(index, "FlipHorizontal").value == "true")
		element.style.transform = "scaleX(-1)";
	else
		element.style.transform = "scaleX(1)";

	if (get_property(index, "Filter") != null)
		element.style.filter = get_property(index, "Filter").value;

	if (get_property(index, "Opacity") != null)
		element.style.opacity = get_property(index, "Opacity").value;

	element.style.width = (parseInt(get_property(index, "Width").value) - parseInt(get_property(index, "Trim").value)) + "px";
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

scrollpanel_draw_runtime = function(element, index)
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

	if (get_property(index, "BorderImageSource").value != "")
	{
		element.style.borderStyle = "solid";

		element.style.borderImageSource = "url(\"" + project_folder + "/" + get_property(index, "BorderImageSource").value + "\")";
		element.style.borderImageWidth = get_property(index, "BorderImageWidth").value + "px";
		element.style.borderImageRepeat = get_property(index, "BorderImageRepeat").value;
		element.style.borderImageSlice = get_property(index, "BorderImageSlice").value;
		element.style.borderImageOutset = get_property(index, "BorderImageOutset").value + "px";
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
	//panel.style.backgroundColor = get_property(index, "BackgroundColor").value;

	objects[index].name = get_property(index, "Name").value;
	panel.id = objects[index].name + "_panel";
	element.id = objects[index].name;
}

tabcontrol_draw_runtime = function(element, index)
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

		//objects[index].element.appendChild(tab_tab[i]);
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

tilemap_draw_runtime = function(element, index)
{
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	//element.style.zIndex = get_property(index, "ZIndex").value;

	document.getElementById(objects[index].name + "_map").style.zIndex = get_property(index, "ZIndex").value;
	document.getElementById(objects[index].name + "_overlay").style.zIndex = get_property(index, "OverlayZIndex").value;
	document.getElementById(objects[index].name + "_highlight").style.zIndex = get_property(index, "OverlayZIndex").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	element.style.borderColor = get_property(index, "BorderColor").value;
	element.style.borderRadius = get_property(index, "BorderRadius").value + "px";
	element.style.borderStyle = get_property(index, "BorderStyle").value;
	element.style.borderWidth = get_property(index, "BorderWidth").value + "px";

	element.style.backgroundColor = get_property(index, "BackgroundColor").value;
	element.style.visibility = get_property(index, "Visibility").value;

	element.style.width = get_property(index, "Width").value + "px";
	element.style.height = get_property(index, "Height").value + "px";

	element.style.overflow = get_property(index, "Overflow").value;

	var overlay = document.getElementById(objects[index].name + "_overlay");

	//overlay.width = parseInt(document.getElementById(element.id + "_map").style.width);
	//overlay.height = parseInt(document.getElementById(element.id + "_map").style.height);

	objects[index].width = parseInt(get_property(index, "Width").value);
	objects[index].height = parseInt(get_property(index, "Height").value);

	objects[index].name = get_property(index, "Name").value;
	//element.id = objects[index].name;

	/*var map = document.getElementById(element.id + "_map");
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
	}*/

	var map_highlight = document.getElementById(element.id + "_highlight");
	map_highlight.src = get_property(index, "HighlightImage").value;

	document.getElementById(element.id + "_map").id = objects[index].name + "_map";
	document.getElementById(element.id + "_mapdiv").id = objects[index].name + "_mapdiv";
	document.getElementById(element.id + "_overlay").id = objects[index].name + "_overlay";
	document.getElementById(element.id + "_highlight").id = objects[index].name + "_highlight";
	element.id = objects[index].name;
}

tileselect_draw_runtime = function(element, index)
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
	//element.id = objects[index].name;

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

	//element.id = objects[index].name;

	var grid_highlight = document.getElementById(element.id + "_highlight");

	if (grid_highlight != null)
	{
		grid_highlight.src = get_property(index, "HighlightImage").value;
		grid_highlight.id = objects[index].name + "_highlight";
	}

	grid.id = objects[index].name + "_grid";
	element.id = objects[index].name;
}

window_draw_runtime = function(element, index)
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

	element_header.style.backgroundColor = get_property(index, "TitleBar.BackgroundColor").value;

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

openfiledialog_draw_runtime = function(element, index)
{
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	if (get_property(index, "Multiple").value == "true")
		document.getElementById("loadDialog").multiple = true;
	else
		document.getElementById("loadDialog").multiple = false;

	if (get_property(index, "Directory").value == "true")
		document.getElementById("loadDialog").nwdirectory = true;
	else
		document.getElementById("loadDialog").nwdirectory = false;

	if (get_property(index, "Accept").value != "")
		document.getElementById("loadDialog").accept = get_property(index, "Accept").value;

	if (get_property(index, "WorkingDir").value != "")
		document.getElementById("loadDialog").nwworkingdir = get_property(index, "WorkingDir").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	element.style.width = "42px";
	element.style.height = "42px";

	objects[index].width = 42;
	objects[index].height = 42;

	element.style.padding = "0px";
	element.style.margin = "0px";

	element.style.visibility = "hidden";
}

savefiledialog_draw_runtime = function(element, index)
{
	element.style.left = get_property(index, "Left").value + "px";
	element.style.top = get_property(index, "Top").value + "px";
	element.style.zIndex = get_property(index, "ZIndex").value;

	objects[index].left = get_property(index, "Left").value; 
	objects[index].top = get_property(index, "Top").value;

	if (get_property(index, "SaveAs").value == "true")
		document.getElementById("saveDialog").nwsaveas = true;
	else
		document.getElementById("saveDialog").nwsaveas = false

	if (get_property(index, "Accept").value != "")
		document.getElementById("saveDialog").accept = get_property(index, "Accept").value;

	if (get_property(index, "WorkingDir").value != "")
		document.getElementById("saveDialog").nwworkingdir = get_property(index, "WorkingDir").value;

	element.style.width = "42px";
	element.style.height = "42px";

	objects[index].width = 42;
	objects[index].height = 42;

	element.style.padding = "0px";
	element.style.margin = "0px";

	element.style.visibility = "hidden";
}

editor_draw_runtime = function(element, index)
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

// code borrowed from https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript
String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};
