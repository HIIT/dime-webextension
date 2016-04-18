import artoo from 'artoo-js'
//code is from http://medialab.github.io/artoo/sniffers/
var before = artoo.helpers.before;
var originalXhr = {
    open: XMLHttpRequest.prototype.open,
    send: XMLHttpRequest.prototype.send,
    setRequestHeader: XMLHttpRequest.prototype.setRequestHeader
};
function AjaxSniffer() {
    var self = this;
    this.hooked = false;
    this.listeners = [];
    function hook() {
        if (self.hooked)
            return;
        XMLHttpRequest.prototype.open = before(
            XMLHttpRequest.prototype.open,
            function(method, url, async) {
                var xhr = this;
                xhr._spy = {
                    method: method,
                    url: url,
                    params: artoo.parsers.url(url).query
                };
            }
        );
        XMLHttpRequest.prototype.send = before(
            XMLHttpRequest.prototype.send,
            function(data) {
                var xhr = this;
                if (data) {
                    xhr._spy.querystring = data;
                    xhr._spy.data = artoo.parsers.queryString(data);
                }
                self.listeners.forEach(function(listener) {
                    if (listener.criteria === '*')
                        listener.fn.call(xhr, xhr._spy);
                });
            }
        );
        self.hooked = true;
    }
    function release() {
        if (!self.hooked)
            return;
        XMLHttpRequest.prototype.send = originalXhr.send;
        XMLHttpRequest.prototype.open = originalXhr.open;
        self.hooked = false;
    }
    this.before = function(criteria, callback) {
        if (typeof criteria === 'function') {
            callback = criteria;
            criteria = null;
        }
        criteria = criteria || {};
        hook();
        this.listeners.push({criteria: '*', fn: callback});
    };
    this.after = function(criteria, callback) {
        if (typeof criteria === 'function') {
            callback = criteria;
            criteria = null;
        }
        criteria = criteria || {};
        hook();
        this.listeners.push({criteria: '*', fn: function() {
            var xhr = this,
                originalCallback = xhr.onreadystatechange;
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.prototype.DONE) {
                    var contentType = xhr.getResponseHeader('Content-Type'),
                        data = xhr.response;
                    if (~contentType.search(/json/)) {
                        try {
                            data = JSON.parse(xhr.responseText);
                        }
                        catch (e) {
                            // pass...
                        }
                    }
                    else if (~contentType.search(/xml/)) {
                        data = xhr.responseXML;
                    }
                    callback.call(xhr, xhr._spy, {
                        data: data,
                        headers: artoo.parsers.headers(xhr.getAllResponseHeaders())
                    });
                }
                if (typeof originalCallback === 'function')
                    originalCallback.apply(xhr, arguments);
            };
        }});
    };
    this.off = function(fn) {
        var index = artoo.helpers.indexOf(this.listeners, function(listener) {
            return listener.fn === fn;
        });
        if (!~index)
            throw Error('artoo.ajaxSniffer.off: trying to remove an inexistant ' +
                'listener.');
        this.listeners.splice(index, 1);
        if (!this.listeners.length)
            release();
    };
}
artoo.ajaxSniffer = new AjaxSniffer();
export default artoo
