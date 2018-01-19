/**
 * Created by zhaojm on 10/01/2018.
 */


window.App = (function () {
    var host = window.location.host;
    // var host = "192.168.10.232:8000";
    var base_url = "http://" + host + "/common";


    var _config = {};
    // _config = _config.result.hook_cards_config;


    var _log = console.log;

    function _error(msg) {
        $("#error").html(msg);
    }

    function _success() {
        _error('success!!');
    }




    function onBtnFixClick() {
        _log("onBtnFixClick");
        var isPass = true;

        // 数量多的，或者 数字不正确的先报错。
        _config.rule.forEach(function (r) {

            var txt = $('#' + r.name).val();
            var cards = _get_cards_list(txt);

            $('#' + r.name + '-list').html('[' + cards.join(',') + ']');
            $('#' + r.name + '-error').html('');
            $('#error').html('');
            r.list = [];

            // 数量检查
            if (parseInt(r.count) == -1 || cards.length <= parseInt(r.count) || (r.allow_pass && cards.length == 0)) {

                // 数字正确性
                var not_allow = _check_not_allow(cards);
                if (not_allow.length == 0) {

                    r.list = cards;

                    return true;
                } else {

                    $('#' + r.name + '-error').html('error allow [' + not_allow.join(',') + ']');
                    isPass = false;
                    return false;
                }


            } else {

                $('#' + r.name + '-error').html('error count');
                isPass = false;
                return false;
            }


        });

        if (!isPass) {
            $('#error').html('error');
            return false;
        }

        var all_cards = _get_all_input_cards();
        var error_count_items = _check_item_count(all_cards);
        if (error_count_items.length > 0) {
            $('#error').html('error item count [' + error_count_items.join(',') + ']');
            return false;
        }

        // fix数量少的
        // var all_cards = _get_all_input_cards();
        var all_allow = _get_all_allow();
        var item_count = _config.item_count;

        var new_all_allow = [];
        while (item_count > 0) {
            item_count--;
            new_all_allow = new_all_allow.concat(all_allow);
        }

        all_cards.forEach(function (t) {
            for (var i = 0; i < new_all_allow.length; i++) {
                if (t == new_all_allow[i]) {
                    new_all_allow.splice(i, 1);
                }
            }
        });

        new_all_allow.sort(function (a, b) {
            return Math.random() > .5 ? -1 : 1;
        });

        _config.rule.forEach(function (r) {
            if (r.count > 0) {
                while (r.list.length < r.count) {
                    r.list.push(new_all_allow.pop());
                }
            }
            $('#' + r.name + '-list').html('[' + r.list.join(',') + ']');
        });

        // all_cards = _get_all_input_cards();

        _show_result();

        $('#error').html('success');


        return true;


    }


    function _get_cards_list(txt) {
        _log(txt);
        var cards = [];

        var numstr = "";
        for (var i = 0; i < txt.length; i++) {
            var char = txt.charAt(i);
            // _log(char);
            if (!isNaN(parseInt(char))) {
                // int
                numstr += char;
            }
            else {
                // not int
                var numInt = parseInt(numstr);
                if (!isNaN(numInt)) {
                    cards.push(numInt);
                }
                numstr = "";
            }
        }
        if (numstr != "") {
            var numInt = parseInt(numstr);
            if (!isNaN(numInt)) {
                cards.push(numInt);
            }
        }
        // _log(cards);
        return cards;

    }


    function _get_all_allow() {
        var ret = [];
        var allows = _config.allow;
        allows.forEach(function (s) {
            var allow = s.split(':');
            var a = parseInt(allow[0]);
            var b = parseInt(allow[1]);
            for (var i = a; i <= b; i++) {
                ret.push(i);
            }
        });
        // _log("_get_all_allow", ret);
        return ret;
    }

    function _contains(arr, obj) {
        // _log('_contains', arr, obj);
        var i = arr.length;
        while (i--) {
            if (arr[i] == obj) {
                return true;
            }
        }
        return false;
    }

    function _check_not_allow(cards) {
        var not_allow = [];
        var all_allow = _get_all_allow();
        cards.forEach(function (c) {
            if (!_contains(all_allow, c)) {
                not_allow.push(c);
            }
        });
        // _log("_check_not_allow", not_allow);
        return not_allow;
    }


    function _get_all_input_cards() {
        var all = [];
        _config.rule.forEach(function (rule) {
            rule.list.forEach(function (card) {
                all.push(card);
            })
        });
        return all;
    }

    function _get_all_head_cards() {
        var all = [];
        _config.rule.forEach(function (rule) {
            if (!rule.last) {
                rule.list.forEach(function (card) {
                    all.push(card);
                })
            }
        });
        return all;
    }

    function _get_all_last_cards() {
        var all = [];
        _config.rule.forEach(function (rule) {
            if (rule.last) {
                rule.list.forEach(function (card) {
                    all.push(card);
                })
            }
        });
        return all;
    }

    function _check_item_count(cards) {

        var obj = {};
        var count_error_items = [];
        cards.forEach(function (card) {
            if (obj[card]) {
                obj[card] += 1;
                if (obj[card] > 4 && !_contains(count_error_items, card)) {
                    count_error_items.push(card);
                }
            } else {
                obj[card] = 1;
            }
        });

        return count_error_items

    }


    function _get_set_cards(gameId, playMode, head_cards, last_cards, cb) {
        _log(gameId, playMode);

        $.ajax({
            url: base_url,
            data: {
                a: "hook_cards",
                sa: "set",
                gameId: gameId,
                playMode: playMode,
                head: head_cards.join(','),
                last: last_cards.join(',')
            },
            type: "GET",
            dataType: 'JSON', // 'jsonp',
            success: function (data) {
                _log('data', data);

                data.retcode = 0;
                if (data.result && data.result.success == 1) {
                    data.retcode = 0;
                } else {
                    data.retcode = -1;
                }

                cb(data);
            },
            error: function (err) {
                _log('err', err);

                cb({
                    retcode: -1,
                    msg: "net error"
                })
            }
        })
    }

    // function _gameId() {
    //     return $('#gameId').val()
    // }
    //
    // function _playMode() {
    //     return $('#playMode').val()
    // }

    function onBtnSetClick() {
        _log("onBtnSetClick....");

        if (_check_input_list()) {
            _get_set_cards(_config.gameId, _config.playMode, _get_all_head_cards(), _get_all_last_cards(), function (result) {
                _log("result", result);
                if (result.retcode < 0) {
                    _error(JSON.stringify(result));
                    return false;
                }

                _success();

            });
        }

    }

    function _get_clear_cards(gameId, playMode, cb) {
        _log(gameId, playMode);

        $.ajax({
            url: base_url,
            data: {
                a: "hook_cards",
                sa: "clear",
                gameId: gameId,
                playMode: playMode
            },
            type: "GET",
            dataType: 'JSON', // 'jsonp',
            success: function (data) {
                _log('data', data);

                cb({
                    retcode: 0,
                    result: data.result
                });
            },
            error: function (err) {
                _log('err', err);

                cb({
                    retcode: -1,
                    msg: "net error"
                })
            }
        })
    }

    function _clear_all_input() {
        _config.rule.forEach(function (r) {

            $('#' + r.name).val('');
        });
    }

    function _show_result() {
        var head_cards = _get_all_head_cards();
        var last_cards = _get_all_last_cards();
        $('#head-result').html('head result: [' + head_cards.join(',') + ']');
        $('#last-result').html('last result: [' + last_cards.join(',') + ']');
    }

    function onBtnClearClick() {
        _log("onBtnClearClick....");
        _get_clear_cards(_config.gameId, _config.playMode, function (result) {
            _log("result", result);
            if (result.retcode < 0) {
                _error(JSON.stringify(result));
                return false;
            }

            _clear_all_input();
            _check_input();

            _success();
        })
    }

    function _check_input_list() {
        _log('_check_input_list');
        var isPass = true;
        _config.rule.forEach(function (r) {

            // var txt = $('#' + r.name).val();
            // var cards = _get_cards_list(txt);

            // $('#' + r.name + '-list').html('[' + cards.join(',') + ']');
            $('#' + r.name + '-error').html('');
            $('#error').html('');
            // r.list = [];

            // 数量检查
            if (parseInt(r.count) == -1 || r.list.length == parseInt(r.count) || (r.allow_pass && r.list.length == 0)) {

                // 数字正确性
                var not_allow = _check_not_allow(r.list);
                if (not_allow.length == 0) {

                    // r.list = cards;

                    return true;
                } else {

                    $('#' + r.name + '-error').html('error allow [' + not_allow.join(',') + ']');
                    isPass = false;
                    return false;
                }


            } else {

                $('#' + r.name + '-error').html('error count');
                isPass = false;
                return false;
            }


        });

        if (!isPass) {
            $('#error').html('error');
            return false;
        }


        var all_cards = _get_all_input_cards();
        var error_count_items = _check_item_count(all_cards);
        if (error_count_items.length > 0) {
            $('#error').html('error item count [' + error_count_items.join(',') + ']');
            return false;
        }

        _show_result();

        return true;
    }


    function _check_input() {
        var isPass = true;
        _config.rule.forEach(function (r) {

            var txt = $('#' + r.name).val();
            var cards = _get_cards_list(txt);

            $('#' + r.name + '-list').html('[' + cards.join(',') + ']');
            $('#' + r.name + '-error').html('');
            $('#error').html('');
            r.list = cards;
        });

        return _check_input_list();


    }


    function onBtnCheckClick() {
        _log("onBtnClearClick....");
        _check_input();
    }

    function _init_view(config) {
        _log("init_view", config);

        var result = "";

        result += "<h2>" + config.title + "</h2>";

        result += '<div>';
        config.desc.forEach(function (d) {
            result += '<span>' + d + '</span><br/>'
        });
        result += '</div>';
        result += '<hr/>';


        result += '<div>';
        config.rule.forEach(function (r) {
            result += '<div>' +
                '<span>' + r.desc + ': </span><r/>' +
                '<input type="text" id="' + r.name + '" class="input-width"/> ' +
                '<span> (count: ' + r.count + ')     </span>' +
                '<span> (allow pass: ' + r.allow_pass + ')     </span>' +
                '<span> (last: ' + r.last + ')     </span>' +
                '<span id="' + r.name + '-list" class="result-cards-color"></span>' +
                '<span id="' + r.name + '-error" class="error-color"></span>' +
                '</div>';
        });
        result += '</div>';

        result += '<hr/>';

        result += '<div>';
        // config.buttons.forEach(function (b) {
        //
        // });

        result +=
            '<button id="btn-check">check</button>' +
            '<button id="btn-fix">fix</button>' +
            '<button id="btn-set">set</button>' +
            '<button id="btn-clear">clear</button>';

        result += '</div>';


        $('#main').html(result);
        $("#btn-check").click(onBtnCheckClick);
        $("#btn-fix").click(onBtnFixClick);
        $("#btn-set").click(onBtnSetClick);
        $("#btn-clear").click(onBtnClearClick);

    }

    function _get_init(gameId, playMode, cb) {

        _log(gameId, playMode);

        $.ajax({
            url: base_url,
            data: {
                a: "hook_cards",
                sa: "init",
                gameId: gameId,
                playMode: playMode
            },
            type: "GET",
            dataType: 'JSON', // 'jsonp',
            success: function (data) {
                _log('data', data);
                data.retcode = 0;
                cb(data);
            },
            error: function (err) {
                _log('err', err);

                cb({
                    retcode: -1,
                    msg: "net error"
                })
            }
        })

    }


    function onBtnShowClick() {
        _log('onBtnShowClick');
        $('#main').html('');
        $('#error').html('');
        var gameId = $('#gameId').val().replace(/\s+/g, "");
        var playMode = $('#playMode').val().replace(/\s+/g, "");

        if (!parseInt(gameId) || !playMode) {
            $('#error').html('gameId or playMode error', gameId, playMode);
            return false;
        }

        _log(gameId, playMode);

        _get_init(gameId, playMode, function (result) {
            _log("result", result);
            if (result.retcode < 0) {
                _error(result.msg);
                return false;
            }

            if (!result.result) {
                _error(JSON.stringify(result));
                return false;
            }

            _config = result.result.hook_cards_config;

            _log("_config", _config);

            if (!_config || JSON.stringify(_config) == '{}') {
                _error(JSON.stringify(result));
                return false;
            }
            _config.gameId = gameId;
            _config.playMode = playMode;
            _init_view(_config);


        });


    }



    function _init() {
        _log('init...');
        $('#host').html('HOST:' + host);
        $('#main').html('');
        // _init_view(_config);
        $('#gameId').val(721);
        $('#playMode').val('classic');
        $('#btn-show').click(onBtnShowClick);


    }

    return {

        init: _init

    };


})();


window.onload = function () {
    console.log('onload...');

    window.App.init();


};
