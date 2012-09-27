// Knockout Now.js Integration
// (c) James Keane <james.keane.github@gmail.com>
// License: MIT (http://www.opensource.org/licenses/mit-license.php)
(function() {
  // We need this to detect if it is an observable array
  ko.observableArray.fn.__ko_now_isObservableArray = true;

  // All there is, really! now.js is pretty cool
  ko.observable.fn.now = function(name) {
    var sub = this,
        cb = function() {},
        ns = 'now.'+name;
    
    // Subscribe to changes
    sub.subscribe(function(val) {
        if(now[name] != val) now[name] = val;
    });

    // Check if we have an observable array, we need to handle it differently
    if(this.__ko_now_isObservableArray) {
      var re = new RegExp(ns+'.\\d+');

      // Make sure we handle the delete request
      now.core.on('del', function(va) {
        if(re.test(va) && now[name] !== undefined) {
          sub(now[name]);
        }
      });

      // now.js sends array updates as 'now.array.%index', so
      // we have to song and dance this
      now.core.on('rv', function(data) {
        for(var k in data) {
          if(re.test(k)) {
            sub(now[name]);
            break;
          }
        }
      });
    } else {
      // simple update, key -> value
      now.core.on('rv', function(data) {
        if(data[ns] !== undefined ) sub(data[ns]);
      });
    }
    
    // Initialize the data, nowjs will query the server
    now.ready(function() {
      if(now[name] !== undefined) sub(now[name]);
    });
    // Always return the observable
    return sub;
  }
})();

