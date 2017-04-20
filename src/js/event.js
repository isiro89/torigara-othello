this.Event2 = this.Event2 || {};
(function(g) {
    var Event2;

    (Event2 = function(type) {
        this.type       = type;
        this.instance   = null;
        this.result     = null;
    });

    g.Event2 = Event2;
})(this);

this.EventDispatcher = this.EventDispatcher || {};
(function(g) {
    var EventDispatcher, p;

    (EventDispatcher = function() {
    });
    p = EventDispatcher.prototype;

    p._listeners = {};

    p.addEvent = function(type, listener) {
        var listeners = this._listeners = this._listeners || {};
        var arr = listeners[type];
        if (arr) {
            this.removeEvent(type, listener);
            arr = listeners[type];
        }
        if (!arr) {
            listeners[type] = [listener];
        } else {
            arr.push(listener);
        }
        return listener;
    };

    p.removeEvent = function(type, listener) {
        var arr;
        var listeners = this._listeners;
        if (!Object.keys(listeners).length) {
            return;
        }
        arr = listeners[type];
        for (var i = 0, l = arr.length; i < l; ++i) {
            if (arr[i] === listener) {
                if (l === 1) {
                    delete listeners[type];
                } else {
                    arr.splice(i, 1);
                    break;
                }
            }
        }
    };

    p.removeEventAll = function(type) {
        if (!type) {
            this._listeners = {};
        } else {
            if (!!this._listeners[type]) {
                delete this._listeners[type];
            }
        }
    };

    p.hasEvent = function(type) {
        var listeners = this._listeners;
        return !!(Object.keys(listeners).length && listeners[type]);
    }

    p.dispatch = function(event, result) {
        var listeners;
        if (typeof event === 'string') {
            listeners = this._listeners;
            if (!Object.keys(listeners).length || !listeners[event]) {
                return true;
            }
            event = new g.Event2(event);
        } else if (typeof event !== 'object' || !(event instanceof Evnet2)) {
            return true;
        }
        this._dispatch(event, result);
        return true;
    };

    /** @private */
    p._dispatch = function(event, result) {
        var l, fn, arr;
        var listeners = this._listeners;
        if (event && !!Object.keys(listeners)) {
            arr = listeners[event.type];
            if (!arr || !(l = arr.length)) {
                return;
            }
            try {
                event.instance = this;
                if (result) {
                    event.result = result;
                }
            } catch (err) {
                return;
            }
            for (var i = 0; i < l; ++i) {
                fn = arr[i];
                fn(event);
            }
        }
    }

    g.EventDispatcher = EventDispatcher;
})(this);
