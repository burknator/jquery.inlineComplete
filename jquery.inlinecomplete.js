(function ($) {
    'use strict';
    /**
     * Guts of the inlineComplete plugin.
     */
    var _inlineComplete = {
        _defaultOptions:{
            list: [],
            matchCase:false,
            submitOnReturn:false,
            startChar: '',
            startCharCi: true,
            disableDatalist: false
        },

        _searchTerm: function(userInput, terms) {
            for (var i in terms) {
                if (terms[i].substr(0, userInput.length) == userInput) {
                    return terms[i];
                }
            }

            return null;
        },

        _getCurrentWord: function(text, cursorPosition) {
            var start = text.substr(0, cursorPosition).lastIndexOf(' ') + 1;

            return text.substr(start, cursorPosition);
        },

        /**
         * Performs the actual inline complete. Usually the body of the event callback.
         * @param {DOMElement} inputElement The element which should have the inline complete.
         * @param {Object} event
         * @param {Object} options
         */
        _performComplete:function (inputElement, event, options) {
            console.log('Performing complete with list:', options.list);
            if (event.which == 8 || event.which == 46 // Backspace, del
                || event.ctrlKey || event.which == 17 // Ctrl + Letter, or Ctrl
                || !options.list || options.list.length == 0
            ) {
                return true;
            } else if (event.which == 16) {
                return this;
            }

            var $inputElement = $(inputElement),
                userInput     = this._getCurrentWord($inputElement.val()),
                returnValue   = true;

            if (userInput != '') {
                if (!options.matchCase) {
                    userInput = userInput.toLowerCase();
                }

                if (event.type == 'keydown') {
                    // Move selection
                    var selection = $inputElement.__getSelection(),
                        letter    = String.fromCharCode(event.which);

                    if (letter == '')
                        return returnValue;

                    // String.fromCharCode returns uppercase...
                    if (!event.shiftKey) {
                        letter = letter.toLowerCase();
                    }

                    if (letter == selection.substr(0, 1)) {
                        $inputElement.__moveSelectionStart(1);

                        returnValue = false;
                    }
                } else if(event.type == 'keyup') {
                    var curPos     = $inputElement.__cursorPosition(),
                        inputValue = $inputElement.val();

                    // Make selection
                    var foundTerm = this._searchTerm(userInput, options.list);

                    if (foundTerm !== null) {
                        var beforeCursor = inputValue.substr(0, curPos),
                            afterCursor  = inputValue.substr(curPos, inputValue.length),
                            curPosInWord = userInput.length;

                        $inputElement.val(beforeCursor + foundTerm.substr(curPosInWord, foundTerm.length) + afterCursor);

                        $inputElement.__select(curPos, foundTerm.substr(curPosInWord, foundTerm.length).length + curPos);
                    }
                }
            }

            return returnValue;
        }
    };

    /**
     * Register the select plugin in the inlineComplete settings. Selects a range in the selected text fields.
     * @param {Number} startPos
     * @param {Number} endPos
     */
    $.fn.__select = function (startPos, endPos) {
        if (typeof startPos == 'number' && typeof endPos == 'number') {
            this.each(function () {
                var start;
                if (typeof this.selectionStart !== "undefined") {
                    this.selectionStart = startPos;
                    this.selectionEnd = endPos;
                }
                else {
                    var range = document.selection.createRange();
                    this.select();
                    var range2 = document.selection.createRange();

                    range2.setEndPoint("EndToStart", range);
                    start = range2.text.length;

                    this.select();
                    range = document.selection.createRange();
                    range.moveStart("character", start);
                    range.select();
                }
            });
        }

        return this;
    };

    $.fn.__getSelection = function() {
        var el = this.get(0);

        if (typeof el.selectionStart != 'undefined') {
            return this.val().substr(el.selectionStart, el.selectionEnd);
        } else {
            var range = document.selection.createRange();

            return range.text;
        }
    };

    $.fn.__moveSelectionStart = function(amount) {
        if (typeof amount == 'number') {
            this.each(function() {
                if (typeof this.selectionStart !== 'undefined') {
                    this.selectionStart += amount;
                } else { // ie
                    var range = document.selection.createRange();
                    range.moveStart("character", amount);
                    range.select();
                }
            });
        }
    };

    $.fn.__cursorPosition = function() {
        if (typeof this.get(0).selectionStart !== 'undefined') {
            return this.get(0).selectionStart;
        } else { // ie
            var range = document.selection.createRange();
            range.moveStart("character", amount);
            range.select();
        }
    };

    /**
     * Register inlineComplete plugin. This enables you to use $('input').inlineComplete();
     *
     * In the options object you have to at least include a list of list you want have completion for.
     * The index for that list must be "list". You may also pass a URL. inlineComplete will then
     * get the list of list from that source. Again, the response must contain the "list" index
     * containing the list.
     * @param {Object} options
     */
    $.fn.inlineComplete = function (options) {
        var datalistSupport = !!(document.createElement('datalist') && window.HTMLDataListElement);

        this.filter('input[type=text], textarea').each(function (e) {
            var $this = $(this),
                instanceOptions = $.extend(true, {}, _inlineComplete._defaultOptions, options);

            if (instanceOptions.list.length == 0) {
                if ($this.data('list')) {
                    if ($this.data('list').indexOf('list') === 0) {
                        instanceOptions.list = $this.data('list').replace(/^list:/i, '').split('|');
                    } else if ($this.data('list').indexOf('url') === 0) {
                        instanceOptions.list = $this.data('list').replace(/^url:/i, '');
                    }
                } else if(typeof $this.attr('list') != 'undefined') {
                    var $datalist = $('#' + $this.attr('list'));
                    if ($datalist.length > 0) {
                        if (datalistSupport) {
                            var datalistOptions = $datalist.get(0).options;
                            for(var i in datalistOptions) {
                                datalistOptions[i].value && instanceOptions.list.push(datalistOptions[i].value);
                            }
                        } else {
                            instanceOptions.list = [];
                            $datalist.find('option').each(function() {
                                instanceOptions.list.push($this.attr('value'));
                            });
                        }

                        if (instanceOptions.disableDatalist) {
                            $this.removeAttr('list');
                        }
                    }
                }
            } else if (typeof instanceOptions.list == 'string') {
                if (/^http:\/\//i.test(instanceOptions.list)) {
                    $.getJSON(instanceOptions.list, function (response) {
                        if (!response.list && window.console && window.console.error)
                            console.error("Invalid response for inline complete list!");

                        instanceOptions.list = response.list;
                    });
                }
            }

            var cleanList = [];
            for(var i in instanceOptions.list) {
                if (instanceOptions.list[i].replace(/\s*/, '') != '') {
                    cleanList.push(instanceOptions.list[i]);
                }
            }

            instanceOptions.list = cleanList;

            // Still no options? Get the hell out of here!
            if (instanceOptions.list.length == 0) {
                return true;
            }

            $this.on('keyup keydown', function (e) {
                return _inlineComplete._performComplete($this, e, instanceOptions);
            });

            return true;
        });

        return this;
    };
})(jQuery);