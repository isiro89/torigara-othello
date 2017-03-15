this.OthelloManager = this.OthelloManager || {};
(function(g) {
    var OthelloController, p, self;

    /**
     *  @constructor
     *  @extends EventDispatcher
     */
    (OthelloManager = function(model) {
        this.currentSequence    = SEQ_INVALID;
        this.requestSequence    = SEQ_INVALID;
        this.sequenceTime       = 0;
        this.model              = new g.OthelloModel();
        self = this;
    }).prototype = new g.EventDispatcher();
    p = OthelloManager.prototype;

    /**
     *  初期化
     *  @method initialize
     */
    p.initialize = function() {
        g.requestAnimationFrame(this.observeSequence);

        this.model.initialize();

        this.addEvent(MANAGER_REQ_SEQ_UPDATE, function(e) {
            switch (self.currentSequence) {
                case SEQ_GAME_TITLE:
                    self.setRequestSequence(SEQ_GAME);
                    break;
                case SEQ_GAME:
                    self.setRequestSequence(SEQ_MODE);
                    break;
                case SEQ_MODE:
                    self.setRequestSequence(SEQ_START_UP);
                    break;
                case SEQ_START_UP:
                    self.setRequestSequence(SEQ_START_UP_TELOP_IN);
                    break;
                case SEQ_START_UP_TELOP_IN:
                    self.setRequestSequence(SEQ_START_UP_TELOP_TEXT_1);
                    break;
                case SEQ_START_UP_TELOP_TEXT_1:
                    self.setRequestSequence(SEQ_START_UP_TELOP_TEXT_2);
                    break;
                case SEQ_START_UP_TELOP_TEXT_2:
                    self.setRequestSequence(SEQ_START_UP_TELOP_OUT);
                    break;
                case SEQ_START_UP_TELOP_OUT:
                    self.setRequestSequence(SEQ_PLAY_TURN_BEGIN);
                    break;
                case SEQ_PLAY_TURN:
                    self.setRequestSequence(SEQ_PLAY_TURN_END);
                    break;
                case SEQ_TURN_TELOP_IN:
                    self.setRequestSequence(SEQ_PLAY_TURN);
                    break;
                case SEQ_TURN_TELOP_OUT:
                    self.setRequestSequence(SEQ_PLAY_TURN_BEGIN);
                    break;
                case SEQ_PASS_TELOP_IN:
                    self.setRequestSequence(SEQ_PASS_TELOP_TEXT);
                    break;
                case SEQ_PASS_TELOP_TEXT:
                    self.setRequestSequence(SEQ_PASS_TELOP_OUT);
                    break;
                case SEQ_PASS_TELOP_OUT:
                    self.setRequestSequence(SEQ_PLAY_TURN_END);
                    break;
                case SEQ_END_TELOP_IN:
                    self.setRequestSequence(SEQ_END_TELOP_TEXT);
                    break;
                case SEQ_END_TELOP_TEXT:
                    self.setRequestSequence(SEQ_END_TELOP_OUT);
                    break;
                case SEQ_END_TELOP_OUT:
                    self.setRequestSequence(SEQ_RESULT);
                    break;
            }
        });

        this.addEvent(MANAGER_REQ_INSERT_PASS_SEQ, function(e) {
            self.setRequestSequence(SEQ_PASS_TELOP_IN);
        });

        this.addEvent(MANAGER_REQ_INSERT_RETRY_SEQ, function(e) {
            self.setRequestSequence(SEQ_MODE);
        });

        this.addEvent(MANAGER_REQ_INSERT_TITLE_SEQ, function(e) {
            self.setRequestSequence(SEQ_GAME_TITLE);
        });

        this.setRequestSequence(SEQ_GAME_TITLE);
    };

    /**
     *  シーケンス変更リクエストの設定
     *  @method setRequestSequence
     *  @params seq {number} シーケンス番号
     */
    p.setRequestSequence = function(seq) {
        this.requestSequence = seq;
    };

    /**
     *  シーケンスの監視
     *  @method observeSequence
     */
    p.observeSequence = function() {
        self.executeSequenceProcess();
        if (self.currentSequence !== self.requestSequence) {
            self.currentSequence = self.requestSequence;
            self.sequenceTime = 0;
        } else {
            if (self.sequenceTime < Number.MAX_SAFE_INTEGER) {
                ++self.sequenceTime;
            }
        }
        g.requestAnimationFrame(self.observeSequence);
    };

    /**
     *  シーケンス処理の実行
     *  @method executeSequenceProcess
     */
    p.executeSequenceProcess = function() {
        switch (self.currentSequence) {
            case SEQ_GAME_TITLE:
                if (self.sequenceTime === 0) {
                    self.dispatch(VIEW_REQ_SHOW_GAME_TITLE);
                    return;
                }
                break;
            case SEQ_GAME:
                if (self.sequenceTime === 33) {
                    self.dispatch(VIEW_REQ_SHOW_GAME);
                    return;
                }
                break;
            case SEQ_MODE:
                if (self.sequenceTime === 10) {
                    self.dispatch(VIEW_REQ_SHOW_MODE);
                    return;
                }
                break;
            case SEQ_START_UP:
                if (self.sequenceTime === 1) {
                    var data = [];
                    for (var i = 0, l = INITIAL_PLAY_DATA.length; i < l; ++i) {
                        data.push({
                            cellId  : self.model.getCellIdByCellPosition(INITIAL_PLAY_DATA[i].y, INITIAL_PLAY_DATA[i].x),
                            type    : INITIAL_PLAY_DATA[i].type
                        });
                    }
                    self.dispatch(VIEW_REQ_SHOW_INITIAL_STONE, data);
                    return;
                }
                break;
            case SEQ_START_UP_TELOP_IN:
                if (self.sequenceTime === 0) {
                    self.dispatch(VIEW_REQ_SHOW_TELOP, {
                        type : TELOP_TYPE_MAIN_IN,
                        text : ''
                    });
                    return;
                }
                break;
            case SEQ_START_UP_TELOP_TEXT_1:
                if (self.sequenceTime === 0) {
                    self.dispatch(VIEW_REQ_SHOW_TELOP, {
                        type : TELOP_TYPE_MAIN_TEXT,
                        text : TEXT_TELOP_START
                    });
                    return;
                }
                break;
            case SEQ_START_UP_TELOP_TEXT_2:
                if (self.sequenceTime === 1) {
                    self.dispatch(VIEW_REQ_SHOW_TELOP, {
                        type : TELOP_TYPE_MAIN_TEXT,
                        text : TEXT_TELOP_PLAYER_TYPE[self.model.getPlayer()-1]
                    });
                    return;
                }
                break;
            case SEQ_START_UP_TELOP_OUT:
                if (self.sequenceTime === 0) {
                    self.dispatch(VIEW_REQ_SHOW_TELOP, {
                        type : TELOP_TYPE_MAIN_OUT,
                        text : ''
                    });
                    return;
                }
                break;
            case SEQ_PLAY_TURN_BEGIN:
                if (self.sequenceTime === 0) {
                    if (self.model.isContinue()) {
                        self.setRequestSequence(SEQ_TURN_TELOP_IN);
                        return;
                    }
                    self.setRequestSequence(SEQ_END_TELOP_IN);
                    return;
                }
                break;
            case SEQ_PLAY_TURN_END:
                if (self.sequenceTime === 0) {
                    if (self.model.isContinue()) {
                        self.setRequestSequence(SEQ_TURN_TELOP_OUT);
                        return;
                    }
                    self.setRequestSequence(SEQ_END_TELOP_IN);
                    return;
                }
                break;
            case SEQ_TURN_TELOP_IN:
                if (self.sequenceTime === 1) {
                    self.dispatch(VIEW_REQ_SHOW_TELOP, {
                        type : TELOP_TYPE_TURN_IN,
                        text : self.model.isPlayerTurn() ? TEXT_TURN_TELOP_PLAYER : TEXT_TURN_TELOP_NPC
                    });
                    return;
                }
                break;
            case SEQ_TURN_TELOP_OUT:
                if (self.sequenceTime === 0) {
                    self.dispatch(VIEW_REQ_SHOW_TELOP, {
                        type : TELOP_TYPE_TURN_OUT,
                        text : ''
                    });
                    return;
                }
                break;
            case SEQ_PASS_TELOP_IN:
                if (self.sequenceTime === 0) {
                    self.dispatch(VIEW_REQ_SHOW_TELOP, {
                        type : TELOP_TYPE_MAIN_IN,
                        text : ''
                    });
                    return;
                }
                break;
            case SEQ_PASS_TELOP_TEXT:
                if (self.sequenceTime === 0) {
                    self.dispatch(VIEW_REQ_SHOW_TELOP, {
                        type : TELOP_TYPE_MAIN_TEXT,
                        text : TEXT_TELOP_PASS
                    });
                    return;
                }
                break;
            case SEQ_PASS_TELOP_OUT:
                if (self.sequenceTime === 0) {
                    self.dispatch(VIEW_REQ_SHOW_TELOP, {
                        type : TELOP_TYPE_MAIN_OUT,
                        text : ''
                    });
                    return;
                }
                break;
            case SEQ_END_TELOP_IN:
                if (self.sequenceTime === 0) {
                    self.dispatch(VIEW_REQ_GAME_END_READY);
                    self.dispatch(VIEW_REQ_SHOW_TELOP, {
                        type : TELOP_TYPE_MAIN_IN,
                        text : ''
                    });
                    return;
                }
                break;
            case SEQ_END_TELOP_TEXT:
                if (self.sequenceTime === 0) {
                    self.dispatch(VIEW_REQ_SHOW_TELOP, {
                        type : TELOP_TYPE_MAIN_TEXT,
                        text : TEXT_TELOP_END
                    });
                    return;
                }
                break;
            case SEQ_END_TELOP_OUT:
                if (self.sequenceTime === 0) {
                    self.dispatch(VIEW_REQ_SHOW_TELOP, {
                        type : TELOP_TYPE_MAIN_OUT,
                        text : ''
                    });
                    return;
                }
                break;
            case SEQ_RESULT:
                if (self.sequenceTime === 10) {
                    self.dispatch(VIEW_REQ_SHOW_RESULT, {
                        data: self.model.getResultData()
                    });
                }
                break;
        }
    };

    g.OthelloManager = OthelloManager;
})(this);
