
/* ==================== */
/* --- Feedly Class --- */
/* ==================== */

var Feedly = function() {
    
    Feedly.call(this); /* Appel du constructeur de la classe parente */

    this.feedly = {
        "host"          : "https://sandbox.feedly.com",
        "client_id"     : "sandbox",
        "client_secret" : "4205DQXBAP99S8SUHXI3",
        "method"        : "GET",
        "token"         : {}
    };

    _Feedly = this;
}
Feedly.prototype = new MyFeeds();

/* =============== */
/* --- Methods --- */
/* =============== */

Feedly.prototype.setToken = function(token) {
    console.log('Feedly.prototype.setToken()', arguments);
    this.feedly.token = token;
}

Feedly.prototype.getToken = function() {
    console.log('Feedly.prototype.getToken()');
    return this.feedly.token;
}

/**
 * @param   {null}
 * @return  {CustomEvent} Feedly.login.done | Feedly.login.error
 * */

Feedly.prototype.login = function() {
    var _url = _Feedly.feedly.host + '/v3/auth/auth' +
        '?client_id=' + encodeURIComponent(_Feedly.feedly.client_id) + 
        '&redirect_uri=' + encodeURIComponent('http://localhost') + 
        '&response_type=code' + 
        '&scope=' + encodeURIComponent('https://cloud.feedly.com/subscriptions');

    window.open(_url);
    return false;
};

Feedly.prototype._loginCallback = function(url) {
    console.log('Feedly.prototype._loginCallback()', arguments);

    var params = [];
    
    if (params = url.match(/code=([^&]+)/)) {
        
        var _url = _Feedly.feedly.host + '/v3/auth/token';

        var _params = 'code=' + encodeURIComponent(params[1]) + 
                '&client_id=' + encodeURIComponent(_Feedly.feedly.client_id) +
                '&client_secret=' + encodeURIComponent(_Feedly.feedly.client_secret) +
                '&redirect_uri=' + encodeURIComponent('http://localhost/') +
                '&state=' + encodeURIComponent(params[0]) +
                '&grant_type=authorization_code';
        
        this.post(_url, _params, function(response) {
            _Feedly.setToken(response);
            document.body.dispatchEvent(new CustomEvent('Feedly.login.done', {"detail": response}));
            console.log('CustomEvent : Feedly.login.done');
        });
        
    } else {
        window.alert('Feedly login error');
        document.body.dispatchEvent(new CustomEvent('Feedly.login.error', {"detail": "Feedly login error"}));
        console.log('CustomEvent : Feedly.login.error');
    }
}

/**
 * get(url, myParams)
 * 
 * @param string url Url to load.
 * @param object myParams You can retrieve this object in response.
 * 
 * */
 
Feedly.prototype.get = function (url, myParams) {
    console.log('Feedly.prototype.get()', arguments);
    
    return new Promise(function(resolve, reject) {
        
        var xhr = new XMLHttpRequest({ mozSystem: true });
        
        xhr.open('GET', url);

        xhr.onload = function() {
            if (xhr.status == 200) {

                var _response = JSON.parse(xhr.response);

                try {
                    _response.responseData._myParams = myParams; // Add extra values
                    resolve(_response);
                } catch(err) {
                    //reject(Error(xhr.statusText));
                    var _response = {"responseData": {"_myParams": myParams}};
                    reject(Error(_response));
                }
                
            } else {
                reject(Error(xhr.statusText));
            }
        };

        xhr.onerror = function() {
            var _response = {"responseData": {"_myParams": myParams}};
            reject(Error(_response));
        };
        
        xhr.send();
    });
}

/**
 * post(url, params, callback)
 * 
 * @param {string} url Url to load.
 * @param {string} params Url parameters.
 * @param {string} callback.
 * 
 * */
 
Feedly.prototype.post = function (url, params, callback) {
    console.log('Feedly.prototype.post()', arguments);
    
    return new Promise(function(resolve, reject) {

        var xhr = new XMLHttpRequest({ mozSystem: true });

        xhr.open('POST', url, true);

        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhr.onload = function() {
            var _response = JSON.parse(xhr.response);
            typeof callback === 'function' && callback(_response);
        };

        xhr.onerror = function(e) {
            typeof callback === 'function' && callback(Error(e));
        };
        
        xhr.send(params);
    });
}

