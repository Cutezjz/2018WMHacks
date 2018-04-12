(function() {

  var api = {};
  var events = {};
  var path = 'https://flask.nextdoor.com/pixel';

  api.track = function(params) {
    if (window.console && (!params[1] || !params[2])) {
      window.console.warn('Nextdoor pixel: track requires two parameters: an event name followed by an event body.');
    } else {
      events[params[1]] = params[2];
    }
  };

  var dequeue = function() {
    var params = window.ndp.queue.shift();
    var libraryFunc = params[0].toLowerCase();
    if (typeof api[libraryFunc] === 'function') {
      api[libraryFunc].call(window, params);
    } else if (window.console) {
      window.console.error('Nextdoor pixel: library function, ' + libraryFunc + ', does not exist.');
    }
  };

  var execute = function() {
    // Referrer has been historically spelled incorrectly.
    // Here we use "Referer" to stay consistent with the name that Go uses and thus the name we use on the Go endpoint.
    var payload = {'referer': document.referrer, 'custom_events': events};
    var xhr = new XMLHttpRequest();
    xhr.open('POST', path);
    xhr.withCredentials = true;
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 204) {
          events = {};
        } else {
          window.console.warn('Request failed to ' + path + ' .');
        }
      }
    };
    xhr.send(JSON.stringify(payload));
  };

  window.ndp.send = function() {
    while (window.ndp.queue.length > 0) {
      dequeue();
    }
    execute();
  };

})();
