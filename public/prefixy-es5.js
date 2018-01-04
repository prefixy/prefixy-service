'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PREFIXY_URL = "https://prefixy.herokuapp.com";

var Prefixy = function () {
  function Prefixy() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Prefixy);

    this.completionsUrl = PREFIXY_URL + '/completions';
    this.incrementUrl = PREFIXY_URL + '/increment';
    this.input = opts.input;
    this.form = opts.form;
    this.delay = opts.delay || 0;
    this.token = opts.token;
    this.suggestionCount = opts.suggestionCount;
    this.minChars = opts.minChars || 1;
    this.listUI = null;

    this.disableHtmlAutocomplete();
    this.wrapInput();
    this.createUI();
    this.valueChanged = this.debounce(this.valueChanged.bind(this), this.delay);
    this.bindEvents();

    this.reset();
  }

  _createClass(Prefixy, [{
    key: 'bindEvents',
    value: function bindEvents() {
      this.input.addEventListener('input', this.valueChanged.bind(this));
      this.input.addEventListener('blur', this.handleBlur.bind(this));
      this.input.addEventListener('keydown', this.handleKeydown.bind(this));
      this.listUI.addEventListener('mousedown', this.handleMousedown.bind(this));

      if (this.form) {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
      }
    }
  }, {
    key: 'disableHtmlAutocomplete',
    value: function disableHtmlAutocomplete() {
      this.input.setAttribute('autocomplete', 'off');
    }
  }, {
    key: 'wrapInput',
    value: function wrapInput() {
      var wrapper = document.createElement('div');
      wrapper.classList.add('autocomplete-wrapper');
      this.input.parentNode.insertBefore(wrapper, this.input);
      wrapper.appendChild(this.input);
    }
  }, {
    key: 'createUI',
    value: function createUI() {
      var listUI = document.createElement('ul');
      listUI.style.top = this.input.getBoundingClientRect().height + 'px';
      listUI.classList.add('autocomplete-ui');
      this.input.parentNode.appendChild(listUI);
      this.listUI = listUI;
    }
  }, {
    key: 'draw',
    value: function draw() {
      var _this = this;

      var child = void 0;
      while (child = this.listUI.lastChild) {
        this.listUI.removeChild(child);
      }

      this.suggestions.forEach(function (suggestion, index) {
        var li = document.createElement('li');
        var span1 = document.createElement('span');
        var span2 = document.createElement('span');

        li.classList.add('autocomplete-ui-choice');

        if (index === _this.selectedIndex) {
          li.classList.add('selected');
          _this.input.value = suggestion;
        }

        var typed = _this.input.value.replace(/\s{2,}/, ' ');

        span1.classList.add('suggestion', 'typed');
        span2.classList.add('suggestion');

        // don't bold text if user navigating with arrow keys
        if (_this.selectedIndex === null) {
          span1.textContent = suggestion.match(typed);
        }
        span2.textContent = suggestion.slice(span1.textContent.length);

        li.appendChild(span1);
        li.appendChild(span2);
        _this.listUI.appendChild(li);
      });
    }
  }, {
    key: 'fetchSuggestions',
    value: function fetchSuggestions(query, callback) {
      var params = { prefix: query, token: this.token };

      if (this.suggestionCount) {
        params.limit = this.suggestionCount;
      }

      axios.get(this.completionsUrl, { params: params }).then(function (response) {
        return callback(response.data);
      });
    }
  }, {
    key: 'submitCompletion',
    value: function submitCompletion() {
      var completion = this.input.value;
      if (completion.length < this.minChars) {
        return;
      }

      axios.put(this.incrementUrl, { completion: completion, token: this.token });
    }
  }, {
    key: 'handleKeydown',
    value: function handleKeydown() {
      switch (event.key) {
        case 'Tab':
          if (this.bestSuggestionIndex !== null) {
            this.input.value = this.suggestions[this.bestSuggestionIndex];
            event.preventDefault();
          }
          this.reset();
          break;
        case 'Enter':
          if (!this.form) {
            this.submitCompletion();
            this.input.value = '';
            this.reset();
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (this.selectedIndex === null || this.selectedIndex === 0) {
            this.selectedIndex = this.suggestions.length - 1;
          } else {
            this.selectedIndex -= 1;
          }
          this.bestSuggestionIndex = null;
          this.draw();
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (this.selectedIndex === null || this.selectedIndex === this.suggestions.length - 1) {
            this.selectedIndex = 0;
          } else {
            this.selectedIndex += 1;
          }
          this.bestSuggestionIndex = null;
          this.draw();
          break;
        case 'Escape':
          this.input.value = this.previousValue;
          this.reset();
          break;
      }
    }
  }, {
    key: 'handleMousedown',
    value: function handleMousedown() {
      event.preventDefault();

      var element = event.target;

      if (event.target.classList.contains('suggestion')) {
        element = element.parentNode;
      }

      if (element.classList.contains('autocomplete-ui-choice')) {
        this.input.value = element.textContent;
        this.reset();
      }
    }
  }, {
    key: 'handleBlur',
    value: function handleBlur() {
      if (!this.form) {
        this.submitCompletion();
      }

      this.reset();
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit(e) {
      e.preventDefault();
      this.submitCompletion();
      this.input.value = '';
      this.reset();
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.visible = false;
      this.suggestions = [];
      this.selectedIndex = null;
      this.previousValue = null;
      this.bestSuggestionIndex = null;
      this.draw();
    }
  }, {
    key: 'valueChanged',
    value: function valueChanged() {
      var _this2 = this;

      var value = this.input.value;
      this.previousValue = value;
      if (value.length >= this.minChars) {
        this.fetchSuggestions(value, function (suggestions) {
          _this2.visible = true;
          _this2.suggestions = suggestions;
          _this2.selectedIndex = null;
          _this2.bestSuggestionIndex = 0;
          _this2.draw();
        });
      } else {
        this.reset();
      }
    }
  }, {
    key: 'debounce',
    value: function debounce(func, delay) {
      var timeout = void 0;
      return function () {
        var args = arguments;
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(function () {
          func.apply(null, args);
        }, delay);
      };
    }
  }]);

  return Prefixy;
}();
