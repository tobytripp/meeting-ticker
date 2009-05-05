/*
ClockPick, by Josh Nathanson
Timepicker plugin for jQuery
See copyright at end of file
Complete documentation at http://www.oakcitygraphics.com/jquery/clockpick/trunk/ClockPick.cfm

name	 clockpick
type	 jQuery
param	 options                  hash                    object containing config options
param	 options[starthour]       int                     starting hour (use military int)
param	 options[endhour]         int                     ending hour (use military int)
param	 options[showminutes]     bool                    show minutes
param 	 options[minutedivisions] int                     number of divisions, i.e. 4 = :00, :15, :30, :45
param 	 options[military]        bool                    use 24hr time if true
param	 options[event]           string                  mouse event to trigger plugin
param	 options[layout]          string                  set div layout to vertical or horizontal
                                  ('vertical','horizontal')
param	 options[valuefield]      string                  field to insert time value, if not same as click field
                                  (name of input field)
param	 callback                 function                callback function
*/

jQuery.fn.clockpick = function(options, callback) {

	var settings = {
		starthour       : 8,
		endhour         : 18,
		showminutes     : true,
		minutedivisions : 4,
		military        : false,
		event           : 'click',
		layout			: 'vertical',
		valuefield		: null,
		useBgiframe		: false
		};
		
	if(options) {
		jQuery.extend(settings, options);
	};
	
	var callback = callback || function() { },
	 	v = (settings.layout == 'vertical'); // boolean for vertical, shorten footprint
	errorcheck();	
	
	jQuery(this)[settings.event](function(e) {
										  										  
		var self = this;
		if (!settings.valuefield) {
			jQuery(this).bind( "keydown", keyhandler );
		}
		// clear any malingerers
		jQuery("#CP_hourcont").remove();
		jQuery("#CP_minutecont").remove();
		
		// append hourcont to body
		// add class "CP" for mouseout recognition, although there is only
		// one hourcont on the screen at a time
		$hourcont = jQuery("<div id='CP_hourcont' class='CP' />");
		jQuery("body").append($hourcont);
		binder($hourcont);
			
		$hourcol1 = jQuery("<div class='CP_hourcol' id='hourcol1' />");
		jQuery("body").append($hourcol1);
		
		$hourcol2 = jQuery("<div class='CP_hourcol' id='hourcol2' />");
		jQuery("body").append($hourcol2);
		
		// if showminutes, append minutes cont to body
		if (settings.showminutes) {
			$mc = jQuery("<div id='CP_minutecont' class='CP' />");
			jQuery("body").append($mc);
			binder($mc);
		}
		if (!v) {
			$hourcont.css("width","auto");
			$mc.css("width","auto");
		}
		else {
			$hourcol1.addClass('floatleft');
			$hourcol2.addClass('floatleft');
		}
				
		// all the action right here
		// fill in the hours container (minutes rendered in hour mouseover)
		// then make hour container visible
		renderhours();
		putcontainer();
		
		/*----------------------helper functions below-------------------------*/
				
		function renderhours() {
			// fill in the $hourcont div
			var c = 1; 
			// counter as index 2 of hr id, gives us index 
			// in group of hourdivs for calculating where to put minutecont on keydown
			for (h=settings.starthour; h<=settings.endhour; h++) {
				
				if(h==12) { c = 1; } // reset counter for col 2
				
				displayhours = ((!settings.military && h > 12) ? h - 12 : h) + set_tt(h);
				// rectify zero hour
				if (!settings.military && h == 0) {
					displayhours = '12' + set_tt(h);
				}				
				$hd = jQuery("<div class='CP_hour' id='hr_" + h + "_" + c + "'>" + displayhours + "</div>");
				// shrink width a bit if military
				if (settings.military) { $hd.width(20); }
				binder($hd);
				if (!v) {
					$hd.css("float","left");
				}
				(h<12) ? $hourcol1.append($hd) : $hourcol2.append($hd);
				c++;
			}
			$hourcont.append($hourcol1);
			!v ? $hourcont.append("<div style='clear:left' />") : '';
			$hourcont.append($hourcol2);
		}
		
		function renderminutes(h) {
			realhours = h;
			displayhours = (!settings.military && h > 12) ? h - 12 : h;
			if (!settings.military && h == 0) {
				displayhours = '12';
			}
			$mc.empty();
			var n = 60 / settings.minutedivisions,
				tt = set_tt(realhours),
				counter = 1;
		
			for(m=0;m<60;m=m+n) {
				$md = jQuery("<div class='CP_minute' id='" + realhours + "_" + m + "'>" 
							 + displayhours + ":" + ((m<10) ? "0" : "") + m + tt 
							 + "</div>");
				if (!v) {
					$md.css("float","left");
					if (settings.minutedivisions > 6 
						&& counter == settings.minutedivisions / 2 + 1) {
						// long horizontal, kick in extra row after half
						$mc.append("<div style='clear:left' />");
					}
				}
				$mc.append($md);
				binder($md);
				counter++;
			}
		}
		
		function set_tt(realhours) {
			if (!settings.military) { 
				return (realhours >= 12) ? ' PM' : ' AM'; 
				}
			else { 
				return '';
			}
		}
		
		function putcontainer() {
			if (!jQuery.browser.safari) {
				$hourcont
				.css("left",e.pageX - 5)
				.css("top",e.pageY - (Math.floor($hourcont.height() / 2)));
				rectify($hourcont);
			}
			else 
				jQuery(self).after($hourcont);
			$hourcont.show();
			
			if ( settings.useBgiframe )
				bgi( $hourcont );			
		}
		
		function rectify($obj) { 
			// if a div is off the screen, move it accordingly
			var ph = document.documentElement.clientHeight;
			var pw = document.documentElement.clientWidth;
			if (!jQuery.browser.safari) {
				var t = parseInt($obj.css("top"));
				var l = parseInt($obj.css("left"));
			}
			else {
				var t = $obj[0].offsetTop;
				var l = $obj[0].offsetLeft;
			}
			var st = document.documentElement.scrollTop;
			// run off top
			if ( t <= st && !$obj.is("#CP_minutecont") ) {
				$obj.css("top",st+10+'px');
			}
			else if (t + $obj.height() - st > ph) {
				$obj.css("top",st + ph - $obj.height() - 10);
			}
		}
		
		function bgi( ob ) {
			if ( typeof jQuery.fn.bgIframe == 'function' )
				ob.bgIframe();
			else
				alert('bgIframe plugin not loaded.');
		}
		
		function binder($obj) {
		// all the binding is done here
		// event handlers have been abstracted out,
		// so they can handle mouse or key events
		
			// bindings for hc (hours container)
			if($obj.attr("id") == 'CP_hourcont') {
				$obj.mouseout(function(e) { hourcont_out(e) });
			}
			
			// bindings for mc (minute container)
			else if ($obj.attr("id") == 'CP_minutecont') {
				$obj.mouseout(function(e) { minutecont_out(e) });
			}
			
			// bindings for $hd (hour divs)
			else if ($obj.attr("class") == 'CP_hour') {
				$obj.mouseover(function(e) { hourdiv_over($obj, e) });
				$obj.mouseout(function() { hourdiv_out($obj) });					
				$obj.click(function() {	hourdiv_click($obj) });
			}
			
			// bindings for $md (minute divs)
			else if ($obj.attr("class") == 'CP_minute') {
				$obj.mouseover(function() { minutediv_over($obj) });
				$obj.mouseout(function() { minutediv_out($obj) });					
				$obj.click(function() {	minutediv_click($obj) });
			}
		};
		
		function hourcont_out(e) {
			/*
			this tells divs to clear only if rolling all the way 
			out of hourcont.
			relatedTarget "looks ahead" to see where the mouse
			has moved to on mouseOut.
			IE uses the more sensible "toElement".
			try/catch for Mozilla bug on relatedTarget-input field.
			*/
			try {
				t = (e.toElement) ? e.toElement : e.relatedTarget;
				if (!(jQuery(t).is("div[@class^=CP], iframe"))) {
					// Safari incorrect mouseover/mouseout
					if (!jQuery.browser.safari) {
						cleardivs();
					}
				}	
			}
			catch(e) {
				cleardivs();
			}
		}
		
		function minutecont_out(e) {
			try {
				t = (e.toElement) ? e.toElement : e.relatedTarget;
				if (!(jQuery(t).is("div[@class^=CP], iframe"))) {
					if (!jQuery.browser.safari) {
						cleardivs();
					}
				}		
			}
			catch(e) {
				cleardivs();
			}
		}
		
		function hourdiv_over($obj, e) {
			var h = $obj.attr("id").split('_')[1],
				i = $obj.attr("id").split('_')[2];
			$obj.addClass("CP_over");
			if (settings.showminutes) {
				
				$mc.hide();
				renderminutes(h);
				
				// set position & show minutes container
				if (v) {
					t = (e.type == 'mouseover') 
						? e.pageY - 10
						: parseInt($hourcont.css("top")) + 2 + ($obj.height() * i);
					if (h<12) {
						// place minutes div to left of hourcont
						// safari hack: use offsetLeft, as it has undefined "left" value in absolute div
						if (!jQuery.browser.safari) {
							l = parseInt($hourcont.css("left")) - $mc.width();
						}
						else {
							l = $hourcont[0].offsetLeft - $mc.width();
						}
					}
					else {
						// place minutes div to right of hourcont
						// safari hack: use offsetLeft, as it has undefined "left" value in hourcont
						if (!jQuery.browser.safari) {
							l = parseInt($hourcont.css("left")) + $hourcont.width();
						}
						else {
							l = $hourcont[0].offsetLeft + $hourcont.width();
						}
					}
				}
				else {
					l = (e.type == 'mouseover') 
						? e.pageX - 10 
						: parseInt($hourcont.css("left")) + ($obj.width()-5) * i;
					if(h<12) {
						if (!jQuery.browser.safari) {
							t = parseInt($hourcont.css("top")) - $mc.height();
						}
						else {
							// safari hack: use offsetTop, as it has undefined "top" value in hourcont
							t = $hourcont[0].offsetTop - $mc.height();
						}
					}
					else {
						if (!jQuery.browser.safari) {
							t = parseInt($hourcont.css("top")) + $hourcont.height();
						}
						else {
							// safari hack: use offsetTop, as it has undefined "top" value in hourcont
							t = $hourcont[0].offsetTop + $hourcont.height();
						}
					}
				}
				$mc.css("left",l).css("top",t);
				rectify( $mc );
				$mc.show();
				
				if ( settings.useBgiframe )
					bgi( $mc );
			}
			return false;
		}
		
		
		
		function hourdiv_out($obj) {
			$obj.removeClass("CP_over");
			return false;
		}
		
		function hourdiv_click($obj) {
			h = $obj.attr("id").split('_')[1];
			tt = set_tt(h);
			str = $obj.text();
			if(str.indexOf(' ') != -1) {
				cleanstr = str.substring(0,str.indexOf(' '));
			}
			else {
				cleanstr = str;
			}
			$obj.text(cleanstr + ':00' + tt);
			setval($obj);
			cleardivs();
		}
		
		function minutediv_over($obj) {
			$obj.addClass("CP_over");
			return false;
		}
		
		function minutediv_out($obj) {
			$obj.removeClass("CP_over");	
			return false;
		}
		
		function minutediv_click($obj) {
			setval($obj);
			cleardivs();
		}
		
		function setval($obj) { // takes either hour or minute obj
			if(!settings.valuefield) {
				self.value = $obj.text();
			}
			else {
				jQuery("input[@name=" + settings.valuefield + "]").val($obj.text());
			}
			callback.apply(jQuery(self));
			// unbind keydown handler, otherwise it will double-bind if 
			// field is activated more than once
			jQuery(self).unbind( "keydown", keyhandler );
		}
		
		function cleardivs() {
			if (settings.showminutes) {
				$mc.remove();
			}
			$hourcont.remove();
			jQuery(self).unbind( "keydown", keyhandler );
		}
		
		// keyboard handling
		
		function keyhandler( e ) {
			
			// $obj is current active div
			var $obj = $("div.CP_over").size() ? $("div.CP_over") : $("div.CP_hour:first"),
				divtype = $obj.is(".CP_hour") ? 'hour' : 'minute',
				hi = (divtype == 'hour') ? $obj[0].id.split('_')[2] : 0, // hour index
				h = (divtype == 'minute') ? $obj[0].id.split('_')[0] : $obj[0].id.split('_')[1]; // real hour 
				
			if (divtype == 'minute') 
				{ var curloc = h<12 ? 'm1' : 'm2' }
			else 
				{ var curloc = h<12 ? 'h1' : 'h2' }
			
			function divprev($obj) {
				if ($obj.prev().size()) {
					eval(divtype + 'div_out($obj)');
					eval(divtype + 'div_over($obj.prev(), e)');
				}
				else { return false }
			}
			
			function divnext($obj) {
				if ($obj.next().size()) {
					eval(divtype + 'div_out($obj)');
					eval(divtype + 'div_over($obj.next(), e)');
				}
				else { return false }
			}
			
			function hourtohour($obj) {
				var ctx = h>=12 ? '#hourcol1' : '#hourcol2';
				$newobj = jQuery(".CP_hour[@id$=_" + hi + "]", ctx );
				if ($newobj.size()) {
					hourdiv_out($obj);
					hourdiv_over($newobj, e);
				}
				else { return false }
			}
			
			function hourtominute($obj) {
				hourdiv_out($obj);
				minutediv_over($(".CP_minute:first"));
			}
			
			function minutetohour($obj) {
				minutediv_out($obj);
				var ctx = h>=12 ? '#hourcol2' : '#hourcol1';
				// extract hour from minutediv, then find hourdiv with that hour
				var $newobj = jQuery(".CP_hour[@id^=hr_" + h + "]", ctx);
				hourdiv_over($newobj, e);
			}

			switch (e.keyCode) {
				case 37: // left arrow
					if (v) {
						switch (curloc) {
							case 'm1':
								return false;
								break;
							case 'm2':
								minutetohour($obj);
								break;
							case 'h1':
								hourtominute($obj);
								break;
							case 'h2':
								hourtohour($obj);
								break;
						}
					}
					else {
						divprev($obj);
					}
					break;
					
				case 38: // up arrow
					if(v) {
						divprev($obj);
					}
					else {
						switch (curloc) {
							case 'm1':
								return false;
								break;
							case 'm2':
								minutetohour($obj);
								break;
							case 'h1':
								hourtominute($obj);
								break;
							case 'h2':
								hourtohour($obj);
								break;
						}
					}
					break;
				case 39: // right arrow
					if (v) {
						switch (curloc) {
							case 'm1':
								minutetohour($obj);
								break;
							case 'm2':
								return false;
								break;
							case 'h1':
								hourtohour($obj);
								break;
							case 'h2':
								hourtominute($obj);
								break;
						}
					}
					else {
						divnext($obj);
					}
					break;
				
				case 40: // down arrow
					if(v) {
						divnext($obj);
					}
					else {
						switch (curloc) {
							case 'm1':
								minutetohour($obj);
								break;
							case 'm2':
								return false;
								break;
							case 'h1':
								hourtohour($obj);
								break;
							case 'h2':
								hourtominute($obj);
								break;
						}
					}
					break;
					
				case 13: // return
					eval(divtype + 'div_click($obj)');
					break;
			}
					
		return false;
			
		}

	return false;
	});
	
	function errorcheck() {
		if (settings.starthour >= settings.endhour) {
			alert('Error - start hour must be less than end hour.');
			return false;
		}
		else if (60 % settings.minutedivisions != 0) {
			alert('Error - param minutedivisions must divide evenly into 60.');
			return false;
		}
	}
	
return(this);

}

/*
+-----------------------------------------------------------------------+
| Copyright (c) 2007 Josh Nathanson                  |
| All rights reserved.                                                  |
|                                                                       |
| Redistribution and use in source and binary forms, with or without    |
| modification, are permitted provided that the following conditions    |
| are met:                                                              |
|                                                                       |
| o Redistributions of source code must retain the above copyright      |
|   notice, this list of conditions and the following disclaimer.       |
| o Redistributions in binary form must reproduce the above copyright   |
|   notice, this list of conditions and the following disclaimer in the |
|   documentation and/or other materials provided with the distribution.|
|                                                                       |
| THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS   |
| "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT     |
| LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR |
| A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT  |
| OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, |
| SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT      |
| LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, |
| DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY |
| THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT   |
| (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE |
| OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.  |
|                                                                       |
+-----------------------------------------------------------------------+
*/