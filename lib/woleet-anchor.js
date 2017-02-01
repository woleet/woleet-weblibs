;(function (root, factory) {
    root.woleet = factory(root.woleet)
})(window, function (woleet) {

    var api = woleet || {};
    api.receipt = api.receipt || {};
    api.anchor = api.anchor || {};
    api.verify = api.verify || {};

    var hashStringOrFile = api._hashStringOrFile;
    var getJSON = api._getJSON;
    var woleetAPI = api._woleetAPI;

    var _token = null;

    api.token = {
        set: (token) => {
            _token = token
        },
        get: (user, pass) => {
        }
    };

    /**
     * @param {File|String} file
     * @param {Function} [progressCallback]
     * @returns {Promise.<Object[]>}
     */
    api.anchor.create = function (file, progressCallback) {

        return hashStringOrFile(file, progressCallback)
            .then((hash) => {
                var data = {
                    public: true,
                    name: file.name,
                    hash: hash
                };
                return getJSON(woleetAPI + '/anchor', {data: data, method: 'POST', token: _token})
            })
            .then(console.info)
    };


    return api;
});