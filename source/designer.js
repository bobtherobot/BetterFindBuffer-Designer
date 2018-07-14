// BetterFindBuffer style designer by:
// Mike Gieson
// www.gieson.com

var findDesigner = (function(){
	
	var isWin = navigator.platform.toUpperCase().indexOf('Windows') > -1;
	var newline = isWin ? "\r\n" : "\n";
	
	// These is essentially doing "internal" CSS.
	// We could just rely on an external CSS file to set up the default, 
	// but that prohibits some browser's ability to load/run the CSS 
	// from the local machine since some browsers block file://
	// 
	// In other words, keeping it internal allows folks to run the "designer.html" locally without a server.
	var themes = {
						bfb : {
							"main" : {
								"background-color" : "#ffffff",
								"color" : "#000000"
							},
							"active-line-mark" : {
								"background-color" : "#ff0000"
							},
							"selection" : {
								"background-color" : "#ffff00",
								"color" : "#ff0000",
								"outline-color" : "#ff0000"
							},
							"query" : {
								"color" : "#419900"
							},
							"results-number" : {
								"color" : "#660099"
							},
							"footer" : {
								"background-color" : "#dcdcdc",
								"color" : "#000000"
							},
							"footer-count-matches" : {
								"color" : "#009121"
							},
							"footer-count-files" : {
								"color" : "#660099"
							},
							"filename" : {
								"background-color" : "#568eff",
								"color" : "#ffffff"
							},
							"match-line" : {
								"background-color" : "#fef1b2"
							},
							"match-line" : {
								"color" : "#000000"
							},
							"line-number-match" : {
								"background-color" : "#fef1b2",
								"color" : "#000000"
							},
							"line-number-match-colon" : {
								"background-color" : "#fef1b2",
								"color" : "#fef1b2"
							},
							"caret" : {
								"outline-color" : "#ff0000"
							},
							"line-number-incontext" : {
								"background-color" : "#ffffff",
								"color" : "#000000"
							},
							"query" : {
								"font-weight" : "bold"
							},
							"results-number" : {
								"font-weight" : "bold"
							},
							"footer-count-matches" : { 
								"font-weight" : null
							},
							"footer-count-files" : {
								"font-weight" : null
							},
							"main" : {
								"font-family" : "Arial",
								"font-size" : 12
							},
							"line" : {
								"margin-top" : "0px",
								"margin-bottom" : "0px"
							}
						}
					};
	
	var startupTheme = themes.bfb;
	
	// These need to be hard-wired to match sublime <--> css
	startupTheme.caret["outline-style"] = "solid";
	startupTheme.caret["outline-width"] = "1px";
	startupTheme.selection["outline-style"] = "solid";
	startupTheme.selection["outline-width"] = "1px";

	
	var fontSettingsTemplate = `
	{
		"color_scheme": "Packages/User/BetterFindBuffer/Find Results.hidden-tmTheme",
		"font_face": "__FONT__",
		"font_size": __SIZE__,
		"line_padding_top": __PAD_TOP__,
		"line_padding_bottom": __PAD_BOTTOM__,
		"draw_indent_guides": false,
		"gutter": false,
		"margin": 0,
		"rulers": [],
		"spell_check": false,
		"word_wrap": false
	}`;

	var xmlFileFront = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>name</key>
	<string>Sublime Find Results</string>
	<key>settings</key>
	<array>
`;

	var xmlFileBack = `
	</array>
	<key>uuid</key>
	<string>edcc9b28-ac04-4b4a-8fa3-f4be3c0d3b02</string>
</dict>
</plist>
`;
	
	var xmlTemplate = `
	<dict>
		<key>scope</key>
		<string>__SCOPE__</string>
		<key>settings</key>
		<dict>
__LIST__
		</dict>
	</dict>
`;
	
	var xmlTemplateSettings = `
	<dict>
		<key>settings</key>
		<dict>
__LIST__
		</dict>
	</dict>
`;

	
	var cssToSub = {
		"main_font-family" 					: "font > family",
		"main_font-size" 					: "font > size",
		"main_margin-top" 					: "font > margin-top",
		"main_margin-bottom" 				: "font > margin-bottom",
		"main_background-color" 			: "settings > background",
		"main_color" 						: "settings > foreground",
		"caret_outline-color" 				: "settings > caret",
		"selection_background-color" 		: "settings > selection",
		"selection_outline-color" 			: "settings > selectionBorder",
		"selection_color" 					: "settings > selectionForeground",
		"active-line-mark_background-color" : "settings > lineHighlight",
		"query_color" 						: "string.query.find-in-files > foreground",
		"query_font-weight" 				: "string.query.find-in-files > fontStyle",
		"results-number_color" 				: "variable.total_files_count.find-in-files > foreground",
		"results-number_font-weight" 		: "variable.total_files_count.find-in-files > fontStyle",
		"filename_color" 					: "entity.name.filename.find-in-files > foreground",
		"filename_background-color" 		: "entity.name.filename.find-in-files > background",
	
		"footer_color" 						: "footer.find-in-files > foreground",
		"footer_background-color" 			: "footer.find-in-files > background",
		"footer-count-matches_color" 		: "variable.matched_count.find-in-files > foreground",
		"footer-count-matches_font-weight" 	: "variable.matched_count.find-in-files > fontStyle",
		"footer-count-files_color" 			: "variable.matched_files_count.find-in-files > foreground",
		"footer-count-files_font-weight" 	: "variable.matched_files_count.find-in-files > fontStyle",
	
		"filename_color" 					: "entity.name.filename.find-in-files > foreground",
		"filename_background-color" 		: "entity.name.filename.find-in-files > background",
	
		"match-line_color" 					: "match.find-in-files > foreground",
		"match-line_background-color" 		: "match.find-in-files > background",
		"line-number-match_color" 			: "constant.numeric.line-number.match.find-in-files > foreground",
		"line-number-match_background-color" : "constant.numeric.line-number.match.find-in-files > background",
		"line-number-match-colon_color" 	: "punctuation.line-number.match.find-in-files > foreground",
		"line-number-match-colon_background-color" : "punctuation.line-number.match.find-in-files > background",
		"line-number-incontext_color" 		: "constant.numeric.line-number.find-in-files > foreground",
		"line-number-incontext_background-color" : "constant.numeric.line-number.find-in-files > background"
	};


	var subToCss = {};
	for(var prop in cssToSub){
		subToCss[ cssToSub[prop] ] = prop;
	}
	
	
	function getCssFileRules(filename){
		
		var sheets = document.styleSheets;
		var findsSheet;
		
		for(var i=0; i<sheets.length; i++){
			var item = sheets[i];
			var url = item.href;
			var Aurl = url.split("/");
			var fn = Aurl.pop();
			
			if(fn == filename){
				findsSheet = item;
				break;
			}
		}
		
		return cssRulesToObject(findsSheet);
		
	}
	
	function cssRulesToObject(sheet){
		var cssRules = sheet.cssRules;
		
		var list = {};
		for(var i=0; i<cssRules.length; i++){
			var rule = cssRules[i];
			var selText = rule.selectorText;
			// Remove the .dot class (and #id) if exists. We're only dealing with classes in the project)
			selText = selText.substr(1, selText.length);
			list[selText] = rule.style;
		}
		return list;
	}
	function createStyleSheet(){
	    var style = document.createElement('style');
	    style.type = 'text/css';
	    document.getElementsByTagName('head')[0].appendChild(style);
	    return style.styleSheet || style.sheet;
	}
	
	function createCssRule(sheet, name, Vrules){
		if( ! sheet.insertRule) {
	        sheet.addRule(name, Vrules);
	    } else {
	        sheet.insertRule( name + "{" + Vrules + "}" , 0 );
		}
	}
	
	function updateCheckbox(e){
		var targ = e.target;
		var val = targ.checked ? "bold" : null
		updateEverything(targ.dataset.iid, val);
	}
	
	function updateColor(e){
		var targ = e.target;
		targ.style.opacity = 1;
		updateEverything(targ.dataset.iid, targ.value);
	}
	
	function getListValue (obj) {
		var retval = null;
		if (obj) {
			var opts = obj.options;
			for (var i = opts.length; i--;) {
				var item = opts[i];
				if(item.selected){
					return item.value;
				}
			}
		}
		return null;
	}
	
	function applyFontFamily(e){
	
		var targ = e;
		var val = getListValue(e);
		var elem = document.getElementById("font-main_font-family");
		if(val == "Default"){
			elem.value = "";
		} else {
			elem.value = val;
		}
		updateFontFamily(elem)
	}
	
	function updateFontFamily(targ){
		//con sole.log("targ.dataset.iid", targ.dataset.iid);
		//con sole.log("targ.value", targ.value);
		
		updateEverything(targ.dataset.iid, targ.value);
	}
	
	function updateFontSize(e){
		var targ = e.target;
		console.log("targ.dataset.iid", targ.dataset.iid)
		var val = parseFloat(targ.value) + "px";
		updateEverything(targ.dataset.iid, val);
	}

	function updateFontPadding(e){
		var targ = e.target;
		console.log("targ.dataset.iid", targ.dataset.iid)
		var val = parseFloat(targ.value) + "px";
		updateEverything(targ.dataset.iid, val, "line");
	}
	
	function clearColor(e){
		var iid = e.target.dataset.iid
		var obj = ccsMap[iid];
		obj.elem.value = null;
		obj.elem.style.opacity = 0.2;
		updateEverything(iid, null, "color");
	}
	
	function updateEverything(iid, val, phoRule){
		var obj = ccsMap[iid];
		console.log(phoRule, iid, val, obj);

		myRules[phoRule || obj.rule][obj.style] = val;
		obj.val = val;
	
		clearXML();
	}
	
	function clearXML(){
		xmlResult.value = "Click the MAKE button chump.";
		jsonResult.value = "Click the MAKE button chump.";
	}
	
	function generate(){

		var subObj = {};
		
		for(var prop in ccsMap){
			var item = ccsMap[prop]
			var subRef = item.subRef;
			var Asub = subRef.split(" > ");
			var scope = Asub[0];
			var style = Asub[1];
			var targ = subObj[scope];
			if( ! targ ){
				targ = subObj[scope] = {};
			}
			targ[style] = item.val;
		}
		
		var xml = xmlFileFront
		
		// Put the "settings" thing on top
		var str = xmlTemplateSettings;
		var list = buildXmlList(subObj.settings);
		str = str.replace(/__LIST__/m, list);
		xml += str;
		for(var prop in subObj){
			if(prop != "settings"){
				var str = xmlTemplate;
				str = str.replace(/__SCOPE__/m, prop);
				list = buildXmlList(subObj[prop]);
				str = str.replace(/__LIST__/m, list);
				xml += str;
			}
		}
		
		xml += xmlFileBack;
		xmlResult.value = xml;
		
		console.log(subObj)
		var json = fontSettingsTemplate.replace(/__FONT__/g, subObj.font.family);
		json = json.replace(/__SIZE__/g, subObj.font.size.replace("px", ""));
		json = json.replace(/__PAD_TOP__/g, (subObj.font["margin-top"] || "0").replace("px", ""));
		json = json.replace(/__PAD_BOTTOM__/g, (subObj.font["margin-bottom"] || "0").replace("px", ""));
		jsonResult.value = json;
		
		
		var elem = document.getElementById("userSettingsPath");
		if(isWin){
			elem.value = "C:\\Users\\%username%\\AppData\\Roaming\\Sublime Text 2\\Packages\\User\\Find Results.sublime-settings";
		} else {
			elem.value = "/Users/YOUR_USER_NAME/Library/Application Support/Sublime Text 3/Packages/User/Find Results.sublime-settings";
		}

		var elem = document.getElementById("themePath");
		if(isWin){
			elem.value = "C:\\Users\\%username%\\AppData\\Roaming\\Sublime Text 2\\Packages\\User\\MY_THEME.hidden-tmTheme";
		} else {
			elem.value = "/Users/YOUR_USER_NAME/Library/Application Support/Sublime Text 3/Packages/User/MY_THEME.hidden-tmTheme";
		}
		
		//if(!myAcc){
		//	myAcc = jbeeb.Accordian.getAccordian("myAcc");
		//}
		//myAcc.openItem("generateTreeItem");
		jbeeb.Accordian.openItem("generateTreeItem");
		
	}
	
	var myAcc;
	
	var xmlResult;
	
	//xmlTemplate += '			<key>foreground</key>' + newline;
	//xmlTemplate += '			<string>#660099</string>' + newline;
	function buildXmlList(obj){
		var str = "";
		for(var prop in obj){
			var val = obj[prop];
			if(val){
				if(val.substr(0,3) == "rgb"){
					val = rgb2hex(val);
				}
				str += "			<key>" + prop + "</key>" + newline;
				str += "			<string>" + val + "</string>" + newline;
			}
			
		}
		return str;
	}
	
	function rgb2hex(rgb){
	 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
	 return (rgb && rgb.length === 4) ? "#" +
	  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
	  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
	  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
	}
	
	
	
	
	var ccsMap = {};
	var myRules;
	var editor;
	var makeButton;
	//var mySheet;
	function init(){
		makeButton = document.getElementById("generate");
		makeButton.addEventListener("click", generate);
		xmlResult = document.getElementById("xmlResult");
		
		var mySheet = createStyleSheet();
		
		for(var prop in startupTheme){
			var name = "." + prop;
			var rules = "";
			var item = startupTheme[prop]
			for(var r in item){
				rules += r + " : " + item[r] + ";";
			}
			createCssRule(mySheet, name, rules);
		}
		
		myRules = cssRulesToObject(mySheet);
		
		editor = document.getElementById("editor");
		
		
		// Create an array containing all our form controls
		var colorInputs = [].slice.call( editor.querySelectorAll('input[type="color"]') );
		var bolders 	= [].slice.call( editor.querySelectorAll('input[type="checkbox"]') );
		var controls 	= [].concat(colorInputs, bolders);
		controls.push(document.getElementById("font-main_font-family"));
		controls.push(document.getElementById("font-main_font-size"));
		controls.push(document.getElementById("font-main_margin-top"));
		controls.push(document.getElementById("font-main_margin-bottom"));
		
		
		for(var i=0; i<controls.length; i++){
			var elem = controls[i];
			var id = elem.id;
			
			// get prefix
			//        cp-match-line_background-color
			//       ^--^
			var Aiid = id.split("-"); 
			var kind = Aiid.shift();  // peel off prefix
			
			
			 // get iid (same, sans prefix)
			//        cp-match-line_background-color
			//          ^--------------------------^
			var iid = Aiid.join("-");
			
			// get object reference to css style
			//        cp-match-line_background-color
			//           ^-------^  ^--------------^
			//            obj ref      css style
			
			var Aiid = iid.split("_");
			var mappedToRule = Aiid[0];
			var mappedToStyle = Aiid[1];
			
			// get/set value based on startupTheme;
			var val = startupTheme[mappedToRule][mappedToStyle];

			if(val){
				elem.value = val;
			}
			
			var obj = {
				elem : elem,
				iid : iid,
				val : val,
				subRef : cssToSub[iid],
				rule : mappedToRule,
				style : mappedToStyle
			}
			
			var func;
			if(kind == "cp"){
				func = updateColor;
			} else if (kind == "cb"){
				func = updateCheckbox;
			} else if (kind == "font"){
				if( /family/.test(id) ) {
					func = updateFontFamily;
				} else if( /margin/.test(id) ) {
					func = updateFontPadding;
				} else {
					func = updateFontSize;
				}
				
			}
			elem.addEventListener("change", func);
			elem.dataset.iid = iid;
			ccsMap[iid] = obj;
			
			updateEverything(iid, val);
		}
		
		
		// clear color-izers
		var clearers = editor.querySelectorAll('.clearVal');
		
		for(var i=0; i<clearers.length; i++){
			var elem = clearers[i];
			var id = elem.id;
			var iid = id.replace("clear-", "");
			
			elem.addEventListener("click", clearColor);
			elem.dataset.iid = iid;
			
		}

		
		// gotta man-handle the font size 
		var iid = "main_font-size";
		updateEverything(iid, ccsMap[iid].val + "px");

		iid = "main_margin-top";
		updateEverything(iid, (ccsMap[iid].val || "0") + "px");

		iid = "main_margin-bottom";
		updateEverything(iid, (ccsMap[iid].val || "0") + "px");
		
	}
	


	
	return {
		init : init,
		applyFontFamily : applyFontFamily
	}
}());
document.addEventListener("DOMContentLoaded", findDesigner.init);
