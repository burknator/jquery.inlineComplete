/*
 * jQuery inlineComplete Plugin
 * Examples and documentation at: [place your URL here]
 * Version: 0.1 ALPHA
 * Requires: jQuery v? or later
 *
 * Licensed under the MIT license:
 *
 * Copyright (c) 2011 Patrick Burke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function($) {
	// If jQuery 1.5 is used, we generate a copy of it using the new sub()
	// and create two more plugins called "cursorPosition" and "select" used
	// by inlineComplete.
	var sub = (function() {
		if(typeof $.sub != 'undefined') {
			return $.sub();
		} else {
			return $;
		}
	})();
	
	/**
	 * Sets and gets the cursor position inside the selected element(s).
	 * @param {Number} pos Index of position to set.
	 */
	sub.fn.cursorPosition = function(pos) {
		if(!this.is('input[type=text]'))
			return this;
		
		if (pos) {
			this.each(function() {
				// TODO this doesn't work in IE, see select() "IE branch"
				this.selectionStart = pos;
			});
			return this;
		} else {
			// TODO this doesn't work in IE, see select() "IE branch"
			return this.get(0).selectionStart;
		}
	}
	
	/**
	 * Selects the given range.
	 * @param {Number} startPos
	 * @param {Number} endPos
	 */
	sub.fn.select = function(startPos, endPos) {
		if (startPos && endPos) {
			// No filtering done here since we're checking the existence of selectionStart/-End and select().
			this.each(function() {
				if (typeof this.selectionStart != "undefined") {
					this.selectionStart = startPos;
					this.selectionEnd = endPos;
				}
				else if (document.selection && document.selection.createRange && this.select) {
					// IE branch
					this.focus();
					this.select();
					var range = document.selection.createRange();
					range.collapse(true);
					range.moveEnd("character", endPos);
					range.moveStart("character", startPos);
					range.select();
			 	}
			});
		}
		
		return this;
	}
	
	/**
	 * Guts of the inlineComplete plugin.
	 */
	$._inlineComplete = {
		_defaultOptions: {
			caseInsensitive: true
		},
		
		/**
		 * Performs the actual inline complete. Usually the body of the event callback.
		 * @param {DOMElement} inputElement The element which should have the inline complete.
		 * @param {Object} event
		 * @param {Object} termList
		 */
		_performComplete: function(inputElement, event, options) {
			// Backspace deletes current selection created by prior autocomplete action, if any.
			// Backspace or no data
			if (event.which == 8 || !options.terms || options.terms.length == 0) 
				return true;
			else if (event.which == 13) {
				// TODO Blur and set selection to end of text!
			}
			
			termList = options.terms;
			
			var $this = sub(inputElement),
				curPos = $this.cursorPosition(),
				term = $this.val().substring(0, curPos);
			
			if(options.caseInsensitive == true) {
				term = term.toLowerCase();
			}
			
			if(term !== '') {      
				for(var i = 0; i < termList.length; i++) {
					currentTerm = termList[i];
					
					if(options.caseInsensitive == true) {
						currentTerm = currentTerm.toLowerCase();
					}
					
					if(currentTerm.indexOf(term) === 0) {
						$this.val(termList[i]).select(curPos, currentTerm.length);
						break;
					}
				}
			}
		}
	};
	
	/**
	 * Register inlineComplete plugin. This enables you to use $('input').inlineComplete();
	 * 
	 * In the options object you have to at least include a list of terms you want have completion for.
	 * The index for that list must be "terms". You may also pass a URL. inlineComplete will then
	 * get the list of terms from that source. Again, the response must contain the "terms" index
	 * containing the terms.
	 * @param {Object} options
	 */
	$.fn.inlineComplete = function(options) {
		options = $.extend({}, $._inlineComplete._defaultOptions, options);
		
		if(!options.terms) {
			if(this.data('terms')) {
				if(this.data('terms').indexOf('list') === 0) {
					options.terms = this.data('terms').replace(/^list:/i, '').split('|');
				} else if(this.data('terms').indexOf('url') === 0) {
					options.terms = this.data('terms').replace(/^url:/i, '');
				}
			}
		}
		
		// Still no options? Get the hell out of here!
		if(!options.terms) {
			return this;
		}
		
		// TODO wouldn't it be great if you could pass a jqXHR object which
		// is handled by inlineComplete?
		if(typeof options.terms == 'string') {
			var $that = this;
			$.getJSON(options.terms, function(response) {
				if(!response.terms && window.console && window.console.error)
					console.error("Invalid response for inline complete terms!");
				
				options.terms = response.terms;
				
				$that.inlineComplete(options);
			});
		} else {
			// Why can't I use jQuery.live() here?!
			this.filter('input[type=text]').bind('keyup', function(e) {
				return $._inlineComplete._performComplete(this, e, options);
			});
		}
		
		return this;
	}
})(jQuery);
