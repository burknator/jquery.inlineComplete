/*
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

*/
$(function() {
	var termListUrls = ["facebook.com", "apple.de", "google.de", "www.golem.de", "golem.de"];
	var termListNames = ["Peter", "Karl", "Patrick", "Leonardo", "Mark"];
	
	$('[name=autocomplete_urls]').inlineComplete({
		terms: termListUrls
	});
	
	$('[name=autocomplete_names]').inlineComplete({
		terms: termListNames
	});
});