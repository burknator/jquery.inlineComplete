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
	
	$._inlineComplete = {
		_performComplete: function(inputElement, event, termList) {
			// Deletes current selection created by prior autocomplete action, if any.
			if (event.which == 8) // backspace
				return true;
			
			var $this = sub(inputElement);
			var curPos = $this.cursorPosition();
			
			var term = $this.val().substring(0, curPos);
			var result = '';
			
			if(term !== '') {      
				for(var i = 0; i < termList.length; i++) {
					if(termList[i].indexOf(term) === 0) {
						result = termList[i];
						break;
					}
				}
			}
			
			if(result !== '') {
				$this.val(result).select(curPos, result.length);			
			}
		}
	};
	
	$.fn.inlineComplete = function(options) {
		if(!options.terms)
			return this;
		
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
				$._inlineComplete._performComplete(this, e, options.terms);
			});
		}
		
		return this;
	}
})(jQuery);
