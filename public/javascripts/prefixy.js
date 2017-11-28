const PREFIXY_URL = "https://prefixy.herokuapp.com";

class Prefixy {
  constructor(input, prefixyUrl, opts={}) {
    this.input = input;
    this.completionsUrl = PREFIXY_URL + '/completions';
    this.incrementUrl = PREFIXY_URL + '/increment';
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

  bindEvents() {
    this.input.addEventListener('input', this.valueChanged.bind(this));
    this.input.addEventListener('blur', this.handleBlur.bind(this));
    this.input.addEventListener('keydown', this.handleKeydown.bind(this));
    this.listUI.addEventListener('mousedown', this.handleMousedown.bind(this));

    if (this.form) {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }
  }

  disableHtmlAutocomplete() {
    this.input.setAttribute('autocomplete', 'off');
  }

  wrapInput() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('autocomplete-wrapper');
    this.input.parentNode.insertBefore(wrapper, this.input);
    wrapper.appendChild(this.input);
  }

  createUI() {
    const listUI = document.createElement('ul');
    listUI.style.top = this.input.getBoundingClientRect().height + 'px';
    listUI.classList.add('autocomplete-ui');
    this.input.parentNode.appendChild(listUI);
    this.listUI = listUI;
  }

  draw() {
    let child;
    while (child = this.listUI.lastChild) {
      this.listUI.removeChild(child);
    }

    this.suggestions.forEach((suggestion, index) => {
      const li = document.createElement('li');
      const span1 = document.createElement('span');
      const span2 = document.createElement('span');

      li.classList.add('autocomplete-ui-choice');

      if (index === this.selectedIndex) {
        li.classList.add('selected');
        this.input.value = suggestion;
      }

      const typed = this.input.value.replace(/\s{2,}/, ' ');

      span1.classList.add('suggestion', 'typed');
      span2.classList.add('suggestion');

      // don't bold text if user navigating with arrow keys
      if (this.selectedIndex === null) {
        span1.textContent = suggestion.match(typed);
      }
      span2.textContent = suggestion.slice(span1.textContent.length);

      li.appendChild(span1);
      li.appendChild(span2);
      this.listUI.appendChild(li);
    });
  }

  fetchSuggestions(query, callback) {
    const params = { prefix: query, token: this.token };

    if (this.suggestionCount) {
      params.limit = this.suggestionCount;
    }

    axios.get(this.completionsUrl, { params })
      .then(response => callback(response.data));
  }

  submitCompletion() {
    const completion = this.input.value;
    if (completion.length < this.minChars) { return; }

    axios.put(this.incrementUrl, { completion, token: this.token });
  }

  handleKeydown() {
    switch(event.key) {
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

  handleMousedown() {
    event.preventDefault();

    const element = event.target;

    if (event.target.classList.contains('suggestion')) {
      element = element.parentNode;
    }

    if (element.classList.contains('autocomplete-ui-choice')) {
      this.input.value = element.textContent;
      this.reset();
    }
  }

  handleBlur() {
    if (!this.form) {
      this.submitCompletion();
    }

    this.reset();
  }

  handleSubmit() {
    this.submitCompletion();
    this.input.value = '';
    this.reset();
  }

  reset() {
    this.visible = false;
    this.suggestions = [];
    this.selectedIndex = null;
    this.previousValue = null;
    this.bestSuggestionIndex = null;
    this.draw();
  }

  valueChanged() {
    const value = this.input.value;
    this.previousValue = value;
    if (value.length >= this.minChars) {
      this.fetchSuggestions(value, suggestions => {
        this.visible = true;
        this.suggestions = suggestions;
        this.selectedIndex = null;
        this.bestSuggestionIndex = 0;
        this.draw();
      });
    } else {
      this.reset();
    }
  }

  debounce(func, delay) {
    let timeout;
    return function() {
      const args = arguments;
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(function() {
        func.apply(null, args);
      }, delay);
    };
  }
}
