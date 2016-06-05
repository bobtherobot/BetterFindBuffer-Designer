/*JBEEB::Accordian 1.1

     __ __                __     
    |__|  |__ _____ _____|  |__ 
    |  |  =  |  =__|  =__|  =  |
   _|  |_____|_____|_____|_____|
  |___/


Copyright (c) 2014 Plaino, LLC.
http://jbeeb.com

MIT License

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

this.jbeeb = this.jbeeb||{};

(function(){
	
	
	var accordians = {};

	var Accordian = function(){
		function init(){
			var rootElems = document.querySelectorAll('.Accordian');
			for(var i=0; i<rootElems.length; i++){
				var acc = new AccordianCore(rootElems[i]);
				var id = acc.id;
				accordians[id] = acc;
			}
		}
		
		function getAccordian(id){
			return accordians[id];
		}

		return {
			init : init,
			getAccordian : getAccordian,
			openItem : openItem,
			closeItem : closeItem
		}
	}

	jbeeb.Accordian = Accordian();
	
	
	var openSpeed = 200;
	var dynamicIdPrefix = "DYNID_SACC_";
	var uidCount = 0;
	
	function assignUid(elem){
		// Assign unique ID if not exist
		var id = elem.id;
		if( ! id ){
			id = dynamicIdPrefix + uidCount++;
			elem.id = id;
		}
		return id;
	}
	
	function bindEvent (el, eventName, eventHandler) {
		if (el.attachEvent){
			el.attachEvent('on'+eventName, eventHandler);
		} else if (el.addEventListener){
			el.addEventListener(eventName, eventHandler, false); 
		}
	}
	
	function unbindEvent (el, eventName, eventHandler) {
		if (el.attachEvent){
			el.detachEvent('on'+eventName, eventHandler);
		} else if (el.addEventListener){
			el.removeEventListener(eventName, eventHandler, false); 
		}
	}
	
	function validateObj(ref){
		if(ref){
			var obj = null;
			if(typeof ref == "string"){
				obj = document.getElementById(ref);
			} else {
				obj = ref;
			}
		
			if(obj){
				return obj;
			}
		}
		return null;
	}

	function toggleItem(ref){
		var obj = validateObj(ref);
		var state = obj.dataset.saccstate;
		
		// dataset stuff is always a string.
		if(state == "1"){
			closeItem(obj);
		}else{
			openItem(obj);
		}
		
	}
	
	function closeItem(ref){
		var obj = validateObj(ref);
		if(obj){
			obj.dataset.saccstate = 0;
			obj.style.transition = "height " + openSpeed + "ms ease-out";
			obj.style.height = "0px";
			obj.style.overflow = "hidden";
			//obj.style.display = "none";
		}
	}

	function openItem(ref, now){
		var obj = validateObj(ref);
		if(obj){
			obj.dataset.saccstate = 1;
			obj.style.transition = "height " + openSpeed + "ms ease-out";
			obj.style.height = "auto";
			var calcH = obj.offsetHeight;
			if( ! now ){
				obj.style.height = "0px";
				setTimeout(function(){
					setTimeoutDelay1(obj, calcH);
				}, 50);
			} else {
				setTimeoutDelay1(obj, calcH);
			}
			
		}
	
	}
	
	function setTimeoutDelay1(obj, calcH){
		obj.style.height = calcH + "px";
	}
	
	
var AccordianCore = function(rootElem){
	this.init(rootElem);
}
	
var p = AccordianCore.prototype;

	p._rootElem = null;
	p._pages = null;
	p._startupOpenList = null;
	p.id = null
	
	p.init = function (rootElem){
		
		this._rootElem = rootElem;
		this._pages = [];
		this._startupOpenList = [];

		// Wire menu item
		this.prepareList();
		this.closeAll();
	
		var rootElemID = this._rootElem.id;
		var startupOpenList = this._startupOpenList;
		var pages = this._pages;
		
		this.id = rootElemID;
	
		for(var i=0; i<startupOpenList.length; i++){
			
			var openMe = startupOpenList[i];

			// Walk up the tree to open the parent as well.
			for(var k=0; k<pages.length; k++){
				var item = pages[k];
				if(openMe == item.nextid){
					var mom = item.h1.parentNode;
					while(mom && mom.nodeName.toLowerCase() == "ul" && mom.id != rootElemID){
						openItem(mom);
						mom = mom.parentNode;
					}
				}
			}

			openItem(openMe, true);
		}
		
		// No longer needed, so de-refrence all the elements in there.
		this._startupOpenList = [];
		

	}
	


	// - Creates "_pages" a cross-reference between list (UL) and opener (previous node H1 just above each UL)
	// 		+ my folder (H1)
	//    		--- UL STARTS ---
	//    		- my file 1
	//    		- my file 2
	//
	// - Assigns onclick events to "opener's"
	p.prepareList = function (){

		if(this._rootElem){

			var elems = this._rootElem.querySelectorAll('h1');
			
			for(var i=0; i<elems.length; i++){
				var elem = elems[i];
				var h1id = assignUid(elem);
				var next = elem.nextSibling;
				while(next.nodeType !== 1){
					next = next.nextSibling;
				}
				if(next.nodeName != "h1"){
					var nextid = assignUid(next);

					if(elem.dataset.open === "1"){
						this._startupOpenList.push(nextid);
					}

					// Wire a click even to opener
					bindEvent (elem, "click", this.toggleDyna.bind(this));

					// Add to cross reference
					this._pages.push({nextid:nextid, h1:elem, sticky:elem.dataset.sticky == "1"});
				}
				
			}
		}
	}

	p.toggleDyna = function (e){
		var me = e.target || window.event.srcElement;
		
		var list = this._pages;
		for(i=0;i<list.length;i++){
			var item = list[i];
			if( ! item.sticky && item.h1 != me ){
				closeItem(item.nextid);
			}
		}

		for(var i=0; i<this._pages.length; i++){
			var item = this._pages[i];

			if(item.h1 == me){
				toggleItem(item.nextid);
			}
		}
	}


	p.closeAll = function(){
		var list = this._pages;
		for(i=0;i<list.length;i++){
			closeItem(list[i].nextid);
		}

	}

	p.openAll = function(){
		var list = this._pages;
		for(i=0;i<list.length;i++){
			openItem(list.nextid);
		}
	}
	
	p.openItem = function(id){
		openItem(id);
	}


}());


document.addEventListener("DOMContentLoaded", jbeeb.Accordian.init);
