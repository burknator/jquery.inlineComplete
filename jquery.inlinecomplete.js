/*
* jQuery inlineComplete Plugin
* Examples and documentation at: http://patrickburke.de/index.php/jquery-inlinecomplete
* Version: 0.12 ALPHA
* Requires: jQuery v1.5
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
    /**
      * Guts of the inlineComplete plugin.
      */
    $._inlineComplete = {
        _defaultOptions: {
            matchCase: false,
            submitOnReturn: false
        },

        /**
          * Performs the actual inline complete. Usually the body of the event callback.
          * @param {DOMElement} inputElement The element which should have the inline complete.
          * @param {Object} event
          * @param {Object} options
          */
        _performComplete: function(inputElement, event, options) {
            var $this = $._inlineComplete.sub(inputElement);

            if (event.which == 13) {
                $this.select($this.val().length, $this.val().length);

                if(options.submitOnReturn)
                    $this.parents('form').submit();
                else
                    $this.blur();

                return false;
            }

            // Prevent this method from being called twice on key pressing by excluding either
            // keydown or keyup...

            // This data value is set further down
            if(event.type == 'keyup' && $this.data('__inlineComplete_noKeyUp') == true) {
                $this.data('__inlineComplete_noKeyUp', false);

                return true;

            // This is the case when the user enters the first letter or deleted the selection
            // made by this plugin and then starts typing again.
            } else if(event.type == 'keydown' && $this.selection('start') == $this.selection('end')) {
                return true;
            }

            // Backspace/Delete deletes current selection created by prior auto-complete action, if any.
            // Backspace or delete or no data
            if (event.which == 8 || event.which == 46 || !options.terms || options.terms.length == 0) {
                return true;
            } else if(event.which == 16) {
                return this;
            }

            // Get the letter the user pressed and trim the any whitespace
            var letter = String.fromCharCode(event.which).replace(/^\s\s*/, '').replace(/\s\s*$/, '');

            if(letter == '')
                return true;

            // String.fromCharCode returns uppercase...
            if(!event.shiftKey)
                letter = letter.toLowerCase();

            var termList    = options.terms,
                curPos      = $this.cursorPosition(),
                searchTerm  = $this.val().substring(0, curPos),
                returnValue = true;

            if(!options.matchCase) {
                searchTerm = searchTerm.toLowerCase();
            }

            if(searchTerm != '') {
                
                for(var i = 0; i < termList.length; i++) {
                    currentTerm = termList[i];

                    if(!options.matchCase) {
                        currentTerm = currentTerm.toLowerCase();
                    }

                    if(currentTerm.indexOf(searchTerm) === 0) {
                        // True if the current letter equals the next letter
                        // in matched term, the event is keydown and if there
                        // is selected text.
                        
                        if(termList[i].substr(curPos, 1) == letter
                            && event.type == 'keydown'
                            && $this.selection('start') != $this.selection('end')
                        ) {
                            $this.select(curPos + 1, currentTerm.length);

                            // If this execution branch was reached, there is no need to
                            // execute at keyup again since the inline-completion is already done.
                            $this.data('__inlineComplete_noKeyUp', true);

                            // Returning false makes sure the key pressed by the user isn't
                            // inserted into the text field.
                            returnValue = false;
                        } else  {
                            $this.val(termList[i]).select(curPos, currentTerm.length);
                        }

                        break;
                    }
                }
            }

            return returnValue;
        }
    };

    // Grab a clone of jQuery and store it inside of the plugin
    $._inlineComplete.sub = $.sub();

    /**
      * Sets and gets the cursor position inside the selected element(s).
      * @param {Number} pos Index of position to set.
      */
    $._inlineComplete.sub.fn.cursorPosition = function(pos) {
        if (pos) {
            this.filter('input[type=text]').each(function() {
                $._inlineComplete.sub(this).select(pos, pos);
            });

            return this;
        } else {
            return this.selection('start');
        }
    }

    /**
      * Register the select plugin in the inlineComplete settings. Selects a range in the selected text fields.
      * @param {Number} startPos
      * @param {Number} endPos
      */
    $._inlineComplete.sub.fn.select = function(startPos, endPos) {
        if (typeof startPos == 'number' && typeof endPos == 'number') {
            // No element filtering done here since we're checking for the existence of selectionStart/-End and select().
            this.filter('[type=text]').each(function() {
                if (typeof this.selectionStart != "undefined") {
                    // Cool browsers
                    this.selectionStart = startPos;
                    this.selectionEnd = endPos;
                } else if (document.selection && document.selection.createRange && this.select) {
                    // IE
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
      * Get the selection start or end point.
      * @param {String} type Either 'start' or 'end'.
      */
    $._inlineComplete.sub.fn.selection = function(type) {
        type = type.toLowerCase();

        if (type == 'start' || type == 'end') {
            var returnValue = '',
            $this           = $._inlineComplete.sub(this.get(0)),
            el              = this.get(0);

            if (typeof el.selectionStart != "undefined") {
                if (type == 'start') {
                    returnValue = el.selectionStart;
                } else if (type == 'end') {
                    returnValue = el.selectionEnd;
                }
            } else if (document.selection && document.selection.createRange) {
                // IE branch
                // TODO This does not work at all
                var range = document.selection.createRange(),
                start = $this.val().indexOf(range.text);

                if (type == 'start') {
                    returnValue = start;
                } else if (type == 'end') {
                    returnValue = start + range.text.length;
                }
            }

            return returnValue;
        }

        return this;
    }

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
            // TODO Why can't I use jQuery.live() here?!
            this.filter('input[type=text], textarea').bind('keyup keydown', function(e) {
                return $._inlineComplete._performComplete(this, e, options);
            });
        }

        return this;
    }
})(jQuery);