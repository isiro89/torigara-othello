this.OthelloView = this.OthelloView || {};
(function(g, doc) {
    var OthelloView, p, self;

    /**
     *  @constructor
     *  @extends EventDispatcher
     */
    (OthelloView = function() {
        this.baseArea = {
            title       : null,
            game        : null,
            nowloading  : null
        };
        this.titleArea = {
            startBtn : null
        };
        this.gameArea = {
            table       : null,
            cells       : [],
            telop       : null,
            telopText   : null
        };
        this.popupArea = {
            popup               : null,
            popupTitle          : null,
            modeContent         : null,
            easyBtn             : null,
            normalBtn           : null,
            resultContent       : null,
            resultInfo          : null,
            acquisitionBlack    : null,
            acquisitionWhite    : null,
            result              : null,
            retryBtn            : null,
            titleBtn            : null
        };
        this.sideArea = {
            character   : null,
            textBox     : null,
            telopText   : null
        };
        this.stockCellIds   = [];
        self = this;
    }).prototype = new g.EventDispatcher();
    p = OthelloView.prototype;

    /**
     *  初期化
     *  @method initialize
     */
    p.initialize = function() {
        var elem;
        this.baseArea.title         = doc.getElementById('game-title');
        this.baseArea.game          = doc.getElementById('game');
        this.baseArea.nowloading    = doc.getElementById('nowloading');
        this.titleArea.startBtn     = doc.getElementById('start-btn');
        this.titleArea.startBtn.addEventListener('click', function(e) {
            if (!+e.target.getAttribute('data-enable')) {
                return;
            }
            e.target.setAttribute('data-enable', '0');
            self.showNowloading(function() {
                self.dispatch(MANAGER_REQ_SEQ_UPDATE);
            });
        });
        this.gameArea.table     = doc.getElementById('othello');
        this.gameArea.telop     = doc.getElementById('telop-frame');
        this.gameArea.telopText = this.gameArea.telop.getElementsByTagName('span')[0];
        for (var i = 1; i <= CELL_TOTAL; ++i) {
            elem = doc.getElementById('cell-' + i);
            elem.addEventListener('click', this);
            this.gameArea.cells.push(elem);
        }
        this.popupArea.popup            = doc.getElementById('popup');
        this.popupArea.popupTitle       = doc.getElementById('popup-title').getElementsByTagName('span')[0];
        this.popupArea.modeContent      = doc.getElementById('mode-content');
        this.popupArea.easyBtn          = doc.getElementById('easy-btn');
        this.popupArea.normalBtn        = doc.getElementById('normal-btn');
        this.popupArea.resultContent    = doc.getElementById('result-content');
        this.popupArea.resultInfo       = doc.getElementById('result-info').getElementsByTagName('span')[0];
        this.popupArea.result           = doc.getElementById('result').getElementsByTagName('span')[0];
        this.popupArea.acquisitionBlack = doc.getElementById('acquisition-black').getElementsByTagName('span')[0];
        this.popupArea.acquisitionWhite = doc.getElementById('acquisition-white').getElementsByTagName('span')[0];
        this.popupArea.retryBtn         = doc.getElementById('retry-btn');
        this.popupArea.titleBtn         = doc.getElementById('title-btn');
        this.popupArea.easyBtn.addEventListener('click', function(e) {
            if (!+e.target.getAttribute('data-enable')) {
                return;
            }
            self.dispatch(MODEL_REQ_MODE_UPDATE, { mode: MODE_TYPE_EASY });
            self.hideMode();
        });
        this.popupArea.normalBtn.addEventListener('click', function(e) {
            if (!+e.target.getAttribute('data-enable')) {
                return;
            }
            self.dispatch(MODEL_REQ_MODE_UPDATE, { mode: MODE_TYPE_NORMAL });
            self.hideMode();
        });
        this.popupArea.retryBtn.addEventListener('click', function(e) {
            if (!+e.target.getAttribute('data-enable')) {
                return;
            }
            self.setCharacterMessage(CHARA_MSG_RETRY, CHARA_CLASSNAME_NORMAL, null);
            self.dispatch(MODEL_REQ_RESET);
            self.resetStone();
            self.hideResult(function() {
                self.dispatch(MANAGER_REQ_INSERT_RETRY_SEQ);
            });
        });
        this.popupArea.titleBtn.addEventListener('click', function(e) {
            if (!+e.target.getAttribute('data-enable')) {
                return;
            }
            self.dispatch(MODEL_REQ_RESET);
            self.resetStone();
            self.showNowloading(function() {
                self.hideResult(function() {
                    self.dispatch(MANAGER_REQ_INSERT_TITLE_SEQ);
                });
            });
        });
        this.sideArea.character = doc.getElementById('character');
        this.sideArea.textBox   = doc.getElementById('character-textbox').getElementsByTagName('span')[0];
        this.sideArea.telopText = doc.getElementById('turn-telop-frame').getElementsByTagName('span')[0];

        this.addEvent(VIEW_REQ_SHOW_GAME_TITLE, function(e) {
            self.hideNowloading();
            self.showGameTitle();
        });

        this.addEvent(VIEW_REQ_SHOW_GAME, function(e) {
            self.showGame();
        });

        this.addEvent(VIEW_REQ_SHOW_MODE, function(e) {
            self.showMode();
        });

        this.addEvent(VIEW_REQ_SHOW_RESULT, function(e) {
            self.showResult(e.result.data);
        });

        this.addEvent(VIEW_REQ_SHOW_INITIAL_STONE, function(e) {
            self.showInitialStone(e.result);
        });

        this.addEvent(VIEW_REQ_SHOW_TELOP, function(e) {
            self.showTelop(e.result);
        });

        this.addEvent(VIEW_REQ_GAME_END_READY, function(e) {
            self.sideArea.telopText.innerText = '';
            self.sideArea.telopText.className = '';
            self.setCharacterMessage(CHARA_MSG_RESULT, CHARA_CLASSNAME_NORMAL, null);
        });

       this.addEvent(VIEW_DONE_CELL_CHECK, function(e) {
            if (!e.result.enabledCellIds.length) {
                self.dispatch(MODEL_REQ_PLAY_TURN_UPDATE, { pass: true });
                if (e.result.player) {
                    self.setCharacterMessage(CHARA_MSG_PLAYTURN_PASS, self.getCharacterTypeByDiff(e.result.diff), null);
                } else {
                    self.setCharacterMessage(CHARA_MSG_NPC_PLAYTURN_PASS, self.getCharacterTypeByDiff(e.result.diff), null);
                }
                setTimeout(function() {
                    self.dispatch(MANAGER_REQ_INSERT_PASS_SEQ);
                }, 200);
                return;
            }
            if (e.result.player) {
                if (e.result.hint) {
                    self.showHintCell(e.result.enabledCellIds, e.result.type);
                }
                self.stockCellIds = e.result.enabledCellIds;
                self.gameArea.table.setAttribute('data-enable', '1');
                self.setCharacterMessage.apply(self, self.createPlayTurnCharacterMessageData(e.result.player, e.result.diff));
            } else {
                self.setCharacterMessage.apply(self, self.createPlayTurnCharacterMessageData(e.result.player, e.result.diff));
                setTimeout(function() {
                    self.dispatch(MODEL_REQ_CELL_UPDATE, {
                        cellId: e.result.enabledCellIds[0]
                    });
                }, 400);
            }
        });

        this.addEvent(VIEW_DONE_CELL_UPDATE, function(e) {
            self.showStone(e.result);
        });
    };

    /**
     *  ハンドルイベント
     *  @method handleEvent
     *  @params {Event} e イベントオブジェクト
     */
    p.handleEvent = function(e) {
        var cellId,
            enabled = !!+this.gameArea.table.getAttribute('data-enable');
        if (!enabled) {
            return;
        }
        cellId = +e.target.getAttribute('data-key');
        if (this.stockCellIds.indexOf(cellId) !== -1) {
            this.setCharacterMessage(CHARA_MSG_STONE_SET, null, null);
            this.hideHintCell(this.stockCellIds);
            this.stockCellIds.length = 0;
            this.gameArea.table.setAttribute('data-enable', '0');
            setTimeout(function() {
                self.dispatch(MODEL_REQ_CELL_UPDATE, { cellId: cellId });
            }, 100);
        }
    };

    /**
     *  ゲームタイトルの表示
     *  @method showGameTitle
     */
    p.showGameTitle = function() {
        if (this.baseArea.game.className === '') {
            this.baseArea.game.className = 'none';
        }
        this.baseArea.title.className = '';
        this.titleArea.startBtn.setAttribute('data-enable', '1');
    };

    /**
     *  ゲーム画面の表示
     *  @method showGame
     */
    p.showGame = function() {
        this.baseArea.title.className   = 'none';
        this.baseArea.game.className    = '';
        this.setCharacterMessage(CHARA_MSG_DEFAULT, CHARA_CLASSNAME_NORMAL, null);
        this.hideNowloading(function() {
            self.dispatch(MANAGER_REQ_SEQ_UPDATE);
        });
    };

    /**
     *  モード選択の表示
     *  @method showMode
     */
    p.showMode = function() {
        this.popupArea.popup.addEventListener('animationend', function(e) {
            e.target.removeEventListener('animationend', arguments.callee);
            e.target.className = '';
            // btn enable
            self.popupArea.easyBtn.setAttribute('data-enable',   '1');
            self.popupArea.normalBtn.setAttribute('data-enable', '1');
            self.setCharacterMessage(CHARA_MSG_MODE_SELECT, CHARA_CLASSNAME_NORMAL, null);
        });
        this.popupArea.modeContent.className    = '';
        this.popupArea.popupTitle.innerText     = TEXT_MODE_TITLE;
        this.popupArea.popup.className          = 'play-open';
    };

    /**
     *  モード選択の非表示
     *  @method hideMode
     */
    p.hideMode = function() {
        this.popupArea.popup.addEventListener('animationend', function(e) {
            e.target.removeEventListener('animationend', arguments.callee);
            e.target.className = 'none';
            self.popupArea.easyBtn.setAttribute('data-enable',   '0');
            self.popupArea.normalBtn.setAttribute('data-enable', '0');
            self.popupArea.popupTitle.innerText     = '';
            self.popupArea.modeContent.className    = 'none';
            self.setCharacterMessage(CHARA_MSG_GAME_START, CHARA_CLASSNAME_NORMAL, null);
            self.dispatch(MANAGER_REQ_SEQ_UPDATE);
        });
        this.popupArea.popup.className = 'play-close';
    };

    /**
     *  リザルトの表示
     *  @method showResult
     *  @params {object} data リザルトデータ
     */
    p.showResult = function(data) {
        this.popupArea.popup.addEventListener('animationend', function(e) {
            e.target.removeEventListener('animationend', arguments.callee);
            e.target.className = '';
            self.setCharacterMessage.apply(self, self.createResultCharacterMessageData(data.result));
            self.popupArea.retryBtn.setAttribute('data-enable', '1');
            self.popupArea.titleBtn.setAttribute('data-enable', '1');

        });
        this.popupArea.resultContent.className      = '';
        this.popupArea.resultInfo.innerText         = TEXT_RESULT_INFO[data.player-1];
        this.popupArea.result.innerText             = TEXT_RESULT[data.result];
        this.popupArea.acquisitionBlack.innerText   = data.acquisitionCells[PLAYER_BLACK-1];
        this.popupArea.acquisitionWhite.innerText   = data.acquisitionCells[PLAYER_WHITE-1];
        this.popupArea.popupTitle.innerText         = TEXT_RESULT_TITLE;
        this.popupArea.popup.className              = 'play-open';
    };

    /**
     *  リザルトの非表示
     *  @method hideResult
     *  @params {function} callback コールバック関数
     */
    p.hideResult = function(callback) {
        this.popupArea.popup.addEventListener('animationend', function(e) {
            e.target.removeEventListener('animationend', arguments.callee);
            e.target.className = 'none';
            self.popupArea.retryBtn.setAttribute('data-enable', '0');
            self.popupArea.titleBtn.setAttribute('data-enable', '0');
            self.popupArea.popupTitle.innerText         = '';
            self.popupArea.resultContent.className      = 'none';
            self.popupArea.resultInfo.innerText         = '';
            self.popupArea.result.innerText             = '';
            self.popupArea.acquisitionBlack.innerText   = '';
            self.popupArea.acquisitionWhite.innerText   = '';
            if (!!callback) {
                callback();
            }
        });
        this.popupArea.popup.className = 'play-close';
    };

    /**
     *  初期石の表示
     *  @method showInitialStone
     *  @params {object} data 配置データ
     */
    p.showInitialStone = function(data) {
        var current = 0;
        for (var i = 0, l = data.length; i < l; ++i) {
            this.gameArea.cells[data[i].cellId].addEventListener('animationend', function(e) {
                e.target.removeEventListener('animationend', arguments.callee);
                e.target.className = self.createStoneClassName(PREFIX_TYPE_NONE, data[current].type, 0);
                if (++current === l) {
                    self.dispatch(MANAGER_REQ_SEQ_UPDATE);
                }
            });
            this.gameArea.cells[data[i].cellId].className = this.createStoneClassName(PREFIX_TYPE_FIRST_SET, data[i].type, i);
        }
    };

    /**
     *  テロップの表示
     *  @method showTelop
     *  @params {object} data テロップデータ
     */
    p.showTelop = function(data) {
        switch (data.type) {
            case TELOP_TYPE_MAIN_IN:
                this.gameArea.telop.addEventListener('animationend', function(e) {
                    e.target.removeEventListener('animationend', arguments.callee);
                    e.target.className = '';
                    self.dispatch(MANAGER_REQ_SEQ_UPDATE);
                });
                this.gameArea.telop.className = 'play-in';
                break;
            case TELOP_TYPE_MAIN_TEXT:
                this.gameArea.telopText.addEventListener('animationend', function(e) {
                    e.target.removeEventListener('animationend', arguments.callee);
                    e.target.className = '';
                    e.target.innerText = '';
                    self.dispatch(MANAGER_REQ_SEQ_UPDATE);
                });
                this.gameArea.telopText.innerText = '' + data.text;
                this.gameArea.telopText.className = 'play';
                break;
            case TELOP_TYPE_MAIN_OUT:
                this.gameArea.telop.addEventListener('animationend', function(e) {
                    e.target.removeEventListener('animationend', arguments.callee);
                    e.target.className = 'none';
                    self.dispatch(MANAGER_REQ_SEQ_UPDATE);
                });
                this.gameArea.telop.className = 'play-out';
                break;
            case TELOP_TYPE_TURN_IN:
                this.sideArea.telopText.addEventListener('animationend', function(e) {
                    e.target.removeEventListener('animationend', arguments.callee);
                    self.dispatch(MANAGER_REQ_SEQ_UPDATE);
                    self.dispatch(MODEL_REQ_CELL_CHECK);
                });
                this.sideArea.telopText.innerText = '' + data.text;
                this.sideArea.telopText.className = 'play-in';
                break;
            case TELOP_TYPE_TURN_OUT:
                this.sideArea.telopText.innerText = '';
                this.sideArea.telopText.className = '';
                this.dispatch(MANAGER_REQ_SEQ_UPDATE);
                break;
        }
    };

    /**
     *  Nowloadingの表示
     *  @method showNowloading
     *  @params {function} callback コールバック関数
     */
    p.showNowloading = function(callback) {
        this.baseArea.nowloading.addEventListener('animationend', function(e) {
            e.target.removeEventListener('animationend', arguments.callee);
            e.target.className = '';
            if (!!callback) {
                callback();
            }
        });
        this.baseArea.nowloading.className = 'play-open';
    };

    /**
     *  Nowloadingの非表示
     *  @method hideNowloading
     *  @params {function} callback
     */
    p.hideNowloading = function(callback) {
        this.baseArea.nowloading.addEventListener('animationend', function(e) {
            e.target.removeEventListener('animationend', arguments.callee);
            e.target.className = 'none';
            if (!!callback) {
                callback();
            }
        });
        this.baseArea.nowloading.className = 'play-close';
    };

    /**
     *  ヒントセルの表示
     *  @method showHintCell
     *  @params {array} cellIds セルID
     *  @params {number} type 色タイプ
     */
    p.showHintCell = function(cellIds, type) {
        for (var i = 0, l = cellIds.length; i < l; ++i) {
            this.gameArea.cells[cellIds[i]].className = this.createStoneClassName(PREFIX_TYPE_HINT, type, 0);
        }
    };

    /**
     *  ヒントセルの非表示
     *  @method hideHintCell
     *  @params {array} cellIds セルID
     */
    p.hideHintCell = function(cellIds) {
        for (var i = 0, l = cellIds.length; i < l; ++i) {
            if (this.gameArea.cells[cellIds[i]].className.indexOf('hint') === -1) {
                continue;
            }
            this.gameArea.cells[cellIds[i]].className = this.createStoneClassName(PREFIX_TYPE_HIDE, 0, 0);
        }
    };

    /**
     *  石の表示
     *  @method showStone
     *  @params {object} data プレイデータ
     */
    p.showStone = function(data) {
        this.gameArea.cells[data.cellId].addEventListener('animationend', function(e) {
            e.target.removeEventListener('animationend', arguments.callee);
            e.target.className = self.createStoneClassName(PREFIX_TYPE_NONE, data.type, 0);
            self.changeStone(data);
        });
        this.gameArea.cells[data.cellId].className = this.createStoneClassName(PREFIX_TYPE_SET, data.type, 0);
    };

    /**
     *  石の変更
     *  @method changeStone
     *  @params {object} data プレイデータ
     */
    p.changeStone = function(data) {
        var current = 0,
            total   = data.changedCellData.length;
        data.changedCellData.forEach(function(v, i) {
            self.gameArea.cells[v.cellId].addEventListener('animationend', function(e) {
                e.target.removeEventListener('animationend', arguments.callee);
                e.target.className = self.createStoneClassName(PREFIX_TYPE_NONE, data.type, 0);
                if (++current === total) {
                    self.dispatch(MODEL_REQ_PLAY_TURN_UPDATE, { pass: false });
                    self.dispatch(MANAGER_REQ_SEQ_UPDATE);
                }
            });
            self.gameArea.cells[v.cellId].className = self.createStoneClassName(v.dir, data.type, v.delay);
        });
        if (data.player) {
            if (data.changedCellData.length > GET_CELL_CRITICAL) {
                this.setCharacterMessage(CHARA_MSG_STONE_GET_CRITICAL, CHARA_CLASSNAME_ROOM, null);
            } else {
                this.setCharacterMessage(CHARA_MSG_STONE_GET_NORMAL, null, { cellCount: data.changedCellData.length });
            }
        } else {
            if (data.changedCellData.length > GET_CELL_CRITICAL) {
                this.setCharacterMessage(CHARA_MSG_STONE_LOST_CRITICAL, CHARA_CLASSNAME_PINCH, null);
            } else {
                this.setCharacterMessage(CHARA_MSG_STONE_LOST_NORMAL, null, { cellCount: data.changedCellData.length });
            }
        }
    };

    /**
     *  石のリセット
     *  @method resetStone
     */
    p.resetStone = function() {
        for (var i = 0; i < CELL_TOTAL; ++i) {
            this.gameArea.cells[i].className = this.createStoneClassName(PREFIX_TYPE_HIDE, 0, 0);
        }
    };

    /**
     *  キャラクターメッセージの設定
     *  @method setCharacterMessage
     *  @params {string} msg メッセージ
     *  @params {string} type キャラタイプ(className)
     *  @params {object} option オプション
     */
    p.setCharacterMessage = function(msg, type, option) {
        if (!!type && this.sideArea.character.className !== type) {
            this.sideArea.character.className = type;
        }
        if (!!option) {
            if (!!option.cellCount) {
                this.sideArea.textBox.innerText = '' + option.cellCount + msg;
            }
        } else {
            this.sideArea.textBox.innerText = msg;
        }
    };

    /**
     *  差分(取得セル)によるキャラタイプ(className)の取得
     *  @method getCharacterTypeByDiff
     *  @method {number} diff 差分(取得セル)
     *  @params {string} キャラタイプ(className)
     */
    p.getCharacterTypeByDiff = function(diff) {
        if (diff >= DIFF_TYPE_ROOM) {
            return CHARA_CLASSNAME_ROOM;
        } else if (diff <= DIFF_TYPE_PINCH) {
            return CHARA_CLASSNAME_PINCH;
        }
        return CHARA_CLASSNAME_NORMAL;
    };

    /**
     *  勝敗キャラクターメッセージデータの作成
     *  @method createResultCharacterMessageData
     *  @method {number} type 勝敗タイプ
     *  @params {array} 勝敗キャラクターメッセージデータ
     */
    p.createResultCharacterMessageData = function(type) {
        if (type === RESULT_TYPE_WIN) {
            return [CHARA_MSG_WIN, CHARA_CLASSNAME_ROOM, null];
        } else if (type === RESULT_TYPE_LOSE) {
            return [CHARA_MSG_LOSE, CHARA_CLASSNAME_PINCH, null];
        }
        return [CHARA_MSG_DRAW, CHARA_CLASSNAME_NORMAL, null];
    };

    /**
     *  ターン開始キャラクターメッセージデータの作成
     *  @method createPlayTurnCharacterMessageData
     *  @params {boolean} player プレイヤーフラグ
     *  @params {number} diff 差分(取得セル)
     *  @return {array} ターン開始キャラクターメッセージデータ
     */
    p.createPlayTurnCharacterMessageData = function(player, diff) {
        if (player) {
            if (diff >= DIFF_TYPE_ROOM) {
                return [CHARA_MSG_PLAYTURN_ROOM, CHARA_CLASSNAME_ROOM, null];
            } else if (diff <= DIFF_TYPE_PINCH) {
                return [CHARA_MSG_PLAYTURN_PINCH, CHARA_CLASSNAME_PINCH, null];
            }
            return [CHARA_MSG_PLAYTURN_NORMAL, CHARA_CLASSNAME_NORMAL, null];
        } else {
            if (diff >= DIFF_TYPE_ROOM) {
                return [CHARA_MSG_NPC_PLAYTURN_NORMAL, CHARA_CLASSNAME_PINCH, null];
            } else if (diff <= DIFF_TYPE_PINCH) {
                return [CHARA_MSG_NPC_PLAYTURN_NORMAL, CHARA_CLASSNAME_ROOM, null];
            }
            return [CHARA_MSG_NPC_PLAYTURN_NORMAL, CHARA_CLASSNAME_NORMAL, null];
        }
    };

    /**
     *  石クラス名(HTML要素)の作成
     *  @method createStoneClassName
     *  @params {number} prefix プリフィックスタイプ
     *  @params {number} type 色タイプ
     *  @params {number} delay 遅延タイプ
     *  @return {string} クラス名
     */
    p.createStoneClassName = function(prefix, type, delay) {
        var className = 'stone ';
        switch(prefix) {
            case PREFIX_TYPE_TOP:
                className += 'top-';
                break;
            case PREFIX_TYPE_BOTTOM:
                className += 'bottom-';
                break;
            case PREFIX_TYPE_RIGHT:
                className += 'right-';
                break;
            case PREFIX_TYPE_LEFT:
                className += 'left-';
                break;
            case PREFIX_TYPE_TOP_RIGHT:
                className += 'top-right-';
                break;
            case PREFIX_TYPE_TOP_LEFT:
                className += 'top-left-';
                break;
            case PREFIX_TYPE_BOTTOM_RIGHT:
                className += 'bottom-right-';
                break;
            case PREFIX_TYPE_BOTTOM_LEFT:
                className += 'bottom-left-';
                break;
            case PREFIX_TYPE_FIRST_SET:
                className += 'first-put-';
                break;
            case PREFIX_TYPE_SET:
                className += 'put-';
                break;
            case PREFIX_TYPE_HINT:
                className += 'hint-';
                break;
            case PREFIX_TYPE_HIDE:
                className += 'none';
                break;
            case PREFIX_TYPE_NONE:
                break;
        }
        if (prefix !== PREFIX_TYPE_HIDE) {
            className += type === PLAYER_BLACK ? 'black' : 'white';
        }
        if (prefix < PREFIX_TYPE_SET) {
            className += '-delay-' + delay;
        }
        return className;
    };

    g.OthelloView = OthelloView;
})(this, this.document);
