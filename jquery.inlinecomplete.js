(function($) {
	$.fn.cursorPosition = function(pos) {
		if(!this.is('input[type=text]'))
			return this;
		
		if (pos) {
			this.get(0).selectionStart = pos;
			return this;
		} else {
			return this.get(0).selectionStart;
		}
	}
	
	$.fn.select = function(startPos, endPos) {
		if(!this.is('input[type=text]'))
			return this;
		
		if (startPos && endPos) {
			var input = this.get(0);
			
			if (typeof input.selectionStart != "undefined") {
				input.selectionStart = startPos;
				input.selectionEnd = endPos;
			}
			else if (document.selection && document.selection.createRange) {
				// IE branch
				input.focus();
				input.select();
				var range = document.selection.createRange();
				range.collapse(true);
				range.moveEnd("character", endPos);
				range.moveStart("character", startPos);
				range.select();
		 	}
		}
		
		return this;
	}
	
	$._inlineComplete = {
		_performComplete: function(inputElement, event, termList) {
			// Deletes current selection created by prior autocomplete action, if any.
			if (event.which == 8) // backspace
				return true;
			
			var $this = $(inputElement);
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
		// TODO Accept term as URL to AJAX resource of terms.
		if(!options.terms)
			return this;
		
		// TODO Filter only input type text elements
		this.live('keyup', function(e) {
			$._inlineComplete._performComplete(this, e, options.terms);
		});
	}
})(jQuery);
