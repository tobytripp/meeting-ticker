/*
 * jquery.watermark.js
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 * NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 */
(function($) {

	$.extend($,{
		clearwatermarks : function() {
			$("[wmwrap='true']").find("input,textarea").watermark({remove:true});
		},
		addwatermarks : function() {
			$("[watermark]").each(function(num,el) {
				$(el).watermark($(el).attr("watermark"));
			});
		},
		watermark : function(o) {
			o.el = $(o.el);
			if(o.remove) {
				if(o.el.parent().attr("wmwrap") == 'true') {
					o.el.parent().replaceWith(o.el);
				}
			} else {
				if(o.el.parent().attr("wmwrap") != 'true') {
					o.el = o.el.wrap("<span wmwrap='true' style='position:relative;'/>");
					var l = $("<label/>");
					
					if(o.html) { l.html(o.html); }
					if(o.cls) { l.addClass(o.cls); }
					if(o.css) { l.css(o.css); }
					
					l.css({
						position:"absolute",
						left:"3px",
						top : parseInt(o.el.css("paddingTop")),
						display:"inline",
						cursor:"text"
					});
					
					if(o.el.is("TEXTAREA")) {
						if($.browser.msie) {
							l.css("width",o.el.width());
						}
						if($.browser.mozilla || $.browser.safari) {
							l.css("top","");
						}
					}
					
					if(!o.cls && !o.css) {
						l.css("color","#ccc");
					}
					
					var focus = function() {
						l.hide();
					};
					
					var blur = function() {
						if(!o.el.val()) {
							l.show();
						} else {
							l.hide();
						}
					};
					
					var click = function() {
						o.el.focus();
					};
					
					if(o.inherit) {
						if(typeof o.inherit == "string") {
							l.css(o.inherit,o.el.css(o.inherit));
						} else {							
							for(var x=0;x<o.inherit.length;x++) {
								l.css(o.inherit[x],o.el.css(o.inherit[x]));
							}							
						}
					}
					
					o.el.focus(focus).blur(blur);
					l.click(click);
					o.el.before(l);
					if(o.el.val()) { l.hide(); }
				}
			}
			return o.el;
		}
	});
	
	$.fn.watermark = function(o) {
		return this.each(function() {
			if(typeof(o) == "string") {
				try {o = eval("(" + o + ")");} catch(ex) {o = {html:o};}
			}
			o.el = this;
			return $.watermark(o);
		});
	};
})(jQuery);

$().ready(function(){
	$.addwatermarks();
});
