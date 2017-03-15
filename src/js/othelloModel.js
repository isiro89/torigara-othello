this.OthelloModel = this.OthelloModel || {};
(function(g) {
    var OthelloModel, p, self;

    /**
     *  @constructor
     *  @extends EventDispatcher
     */
    (OthelloModel = function() {
        this.player             = 0;
        this.currentPlayer      = 0;
        this.mode               = 0;
        this.cellData           = [];
        this.cellIdData         = [];
        this.usedCellCount      = 0;
        this.passData           = [false, false];
        this.acquisitionCells   = [0, 0];
        self = this;
    }).prototype = new g.EventDispatcher();
    p = OthelloModel.prototype;

    /**
     *  初期化
     *  @method initialize
     */
    p.initialize = function() {
        for (var y = 0; y < CELL_Y; ++y) {
            this.cellData.push([]);
            for (var x = 0; x < CELL_X; ++x) {
                this.cellData[y][x] = { cellId: this.cellIdData.length, type: 0 };
                this.cellIdData.push({ y: y, x: x });
            }
        }

        for (var i = 0, l = INITIAL_PLAY_DATA.length; i < l; ++i) {
            this.cellData[INITIAL_PLAY_DATA[i].y][INITIAL_PLAY_DATA[i].x].type = INITIAL_PLAY_DATA[i].type;
            ++this.acquisitionCells[INITIAL_PLAY_DATA[i].type-1];
            ++this.usedCellCount;
        }
        this.player = Math.floor(Math.random() * 2) + 1;
        this.currentPlayer = PLAYER_BLACK;

        if (!this.hasEvent(MODEL_REQ_MODE_UPDATE)) {
            this.addEvent(MODEL_REQ_MODE_UPDATE, function(e) {
                self.mode = e.result.mode;
            });
        }

        if (!this.hasEvent(MODEL_REQ_CELL_CHECK)) {
            this.addEvent(MODEL_REQ_CELL_CHECK, function(e) {
                var enabledCellData = self.getEnabledCellData();
                self.dispatch(VIEW_DONE_CELL_CHECK, enabledCellData);
            });
        }

        if (!this.hasEvent(MODEL_REQ_CELL_UPDATE)) {
            this.addEvent(MODEL_REQ_CELL_UPDATE, function(e) {
                var data    = [],
                    cells   = [],
                    res     = { player: (self.player === self.currentPlayer), type: self.currentPlayer, cellId: e.result.cellId, changedCellData: []},
                    pos     = self.getCellPositionByCellId(e.result.cellId);
                data.push({ y: pos.y, x: pos.x });
                for (var i = 0; i < DIR_TOTAL; ++i) {
                    cells = self.getChangeableCell(pos.y, pos.x, [], i);
                    if (!cells.length) {
                        continue;
                    }
                    for (var j = 0, l = cells.length; j < l; ++j) {
                        data.push({ y: cells[j].y, x: cells[j].x });
                        res.changedCellData.push({ cellId: cells[j].cellId, dir: i, delay: cells[j].delay });
                    }
                }
                ++self.usedCellCount;
                self.passData[self.currentPlayer-1] = false;
                self.updateCellData(data, 0);
                self.dispatch(VIEW_DONE_CELL_UPDATE, res);
            });
        }

        if (!this.hasEvent(MODEL_REQ_PLAY_TURN_UPDATE)) {
            this.addEvent(MODEL_REQ_PLAY_TURN_UPDATE, function(e) {
                if (e.result.pass) {
                    self.passData[self.currentPlayer-1] = true;
                }
                self.currentPlayer = self.currentPlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
            });
        }

        if (!this.hasEvent(MODEL_REQ_RESET)) {
            this.addEvent(MODEL_REQ_RESET, function(e) {
                self.resetData();
            });
        }
    };

    /**
     *  データのリセット
     *  @method resetData
     */
    p.resetData = function() {
        this.player             = 0;
        this.currentPlayer      = 0;
        this.mode               = 0;
        this.cellData           = [];
        this.cellIdData         = [];
        this.usedCellCount      = 0;
        this.passData           = [false, false];
        this.acquisitionCells   = [0, 0];
        this.initialize();
    };

    /**
     *  セルデータの更新
     *  @method updateCellData
     *  @params {object} data セル更新データ
     *  @params {number} player プレイヤータイプ(強制)
     */
    p.updateCellData = function(data, player) {
        var type = white = black = 0;
        for (var i = 0, l = data.length; i < l; ++i) {
            this.cellData[data[i].y][data[i].x].type = (player >= PLAYER_WHITE && player <= PLAYER_BLACK) ? player : this.currentPlayer;
        }
        for (var y = 0; y < CELL_Y; ++y) {
            for (var x = 0; x < CELL_X; ++x) {
                type = this.cellData[y][x].type;
                if (type === 0) {
                    continue;
                } else if (type === PLAYER_BLACK) {
                    ++black;
                    continue;
                }
                ++white;
            }
        }
        this.acquisitionCells.length = 0;
        this.acquisitionCells = [black, white];
    };

    /**
     *  有効セルデータの取得
     *  @method getEnabledCellData
     *  @return {object} 有効セル情報
     */
    p.getEnabledCellData = function() {
        var cellData        = [],
            npc             = this.player === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK,
            enabledCellData = { hint: false, diff: 0, enabledCellIds: [], type: this.currentPlayer, player: false };
        for (var y = 0; y < CELL_Y; ++y) {
            for (var x = 0; x < CELL_X; ++x) {
                if (this.cellData[y][x].type !== 0) {
                    continue;
                }
                for (var i = 0; i < DIR_TOTAL; ++i) {
                    cellData = this.getChangeableCell(y, x, [], i);
                    if (!cellData.length) {
                        continue;
                    }
                    enabledCellData.enabledCellIds.push(this.getCellIdByCellPosition(y, x));
                    break;
                }
            }
        }
        if (this.player === this.currentPlayer) {
            enabledCellData.hint    = true;
            enabledCellData.player  = true;
            enabledCellData.diff    = this.acquisitionCells[this.player-1] - this.acquisitionCells[npc-1];
        } else {
            enabledCellData.diff = this.acquisitionCells[npc-1] - this.acquisitionCells[this.player-1];
            if (!!enabledCellData.enabledCellIds.length) {
                enabledCellData.enabledCellIds = this.selectCellId(enabledCellData.enabledCellIds);
            }
        }
        return enabledCellData;
    };

    /**
     *  セルIDの選択
     *  @method selectCellId
     *  @params {array} cellIds セルIDリスト
     *  @return {array} セルID
     */
    p.selectCellId = function(cellIds) {
        var npc             = this.player === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK,
            diff            = this.acquisitionCells[npc-1] - this.acquisitionCells[this.player-1],
            pos             = null,
            acquisitonData  = {},
            selectCellIds   = [];
        for (var i = 0, l = cellIds.length; i < l; ++i) {
            pos = this.getCellPositionByCellId(cellIds[i]);
            acquisitonData[cellIds[i]] = 0;
            for (var j = 0; j < DIR_TOTAL; ++j) {
                acquisitonData[cellIds[i]] += this.getChangeableCell(pos.y, pos.x, [], j).length;
            }
        }
        for (i = 0, l = cellIds.length; i < l; ++i) {
            if (!selectCellIds.length) {
                selectCellIds.push(cellIds[i]);
                continue;
            }
            if (this.mode === MODE_TYPE_EASY) {
                if (diff <= 0) {
                    selectCellIds.push(cellIds[i]);
                    continue;
                }
                if (acquisitonData[selectCellIds[0]] > acquisitonData[cellIds[i]]) {
                    selectCellIds.length = 0;
                    selectCellIds.push(cellIds[i]);
                    continue;
                } else if (acquisitonData[selectCellIds[0]] === acquisitonData[cellIds[i]]) {
                    selectCellIds.push(cellIds[i]);
                    continue;
                }
            } else if (this.mode === MODE_TYPE_NORMAL) {
                if (diff >= 0) {
                    selectCellIds.push(cellIds[i]);
                    continue;
                }
                if (acquisitonData[selectCellIds[0]] < acquisitonData[cellIds[i]]) {
                    selectCellIds.length = 0;
                    selectCellIds.push(cellIds[i]);
                    continue;
                } else if (acquisitonData[selectCellIds[0]] === acquisitonData[cellIds[i]]) {
                    selectCellIds.push(cellIds[i]);
                    continue;
                }
            }
        }
        if (selectCellIds.length > 1) {
            return [selectCellIds[Math.floor(Math.random() * selectCellIds.length)]];
        }
        return selectCellIds;
    };

    /**
     *  変更可能セルデータの取得
     *  @method getChangeableCell
     *  @params {number} y セルポジション(y軸)
     *  @params {number} x セルポジション(x軸)
     *  @params {array} cellData 変更可能セルデータ
     *  @params {number} dir チェック方向
     *  @return {array} 変更可能セルデータ
     */
    p.getChangeableCell = function(y, x, cellData, dir) {
        var target = this.currentPlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
        switch (dir) {
            case DIR_TOP            : y--; break;
            case DIR_BOTTOM         : y++; break;
            case DIR_RIGHT          : x++; break;
            case DIR_LEFT           : x--; break;
            case DIR_TOP_RIGHT      : y--; x++; break;
            case DIR_TOP_LEFT       : y--; x--; break;
            case DIR_BOTTOM_RIGHT   : y++; x++; break;
            case DIR_BOTTOM_LEFT    : y++; x--; break;
        }
        if (y < 0 || y >= CELL_Y || x < 0 || x >= CELL_X) {
            return [];
        }
        if (this.cellData[y][x].type === target) {
            cellData.push({ cellId: this.getCellIdByCellPosition(y, x), y: y, x: x, delay: cellData.length });
            return this.getChangeableCell(y, x, cellData, dir);
        } else if (this.cellData[y][x].type === this.currentPlayer) {
            return cellData;
        }
        return [];
    };

    /**
     *  セルIDの取得
     *  @method getCellIdByCellPosition
     *  @param {number} y セルポジション(y軸)
     *  @param {number} x セルポジション(x軸)
     *  @return {number} セルID
     */
    p.getCellIdByCellPosition = function(y, x) {
        return this.cellData[y][x].cellId;
    };

    /**
     *  セルポジションの取得
     *  @method getCellPositionByCellId
     *  @param {number} cellId セルID
     *  @return {object} セルポジション
     */
    p.getCellPositionByCellId = function(id) {
        return { y: this.cellIdData[id].y, x: this.cellIdData[id].x };
    };

    /**
     *  プレイヤータイプの取得
     *  @method getPlayer
     *  @return {number} プレイヤータイプ
     */
    p.getPlayer = function() {
        return this.player;
    };

    /**
     *  現在ターン(手番)の取得
     *  @method getCurrentTurn
     *  @return {number} プレイヤータイプ
     */
    p.getCurrentTurn = function() {
        return this.currentPlayer;
    };

    /**
     *  自ターン(手番)の判定
     *  @method isPlayerTurn
     *  @return {boolean} 手番判定
     */
    p.isPlayerTurn = function() {
        return this.player === this.currentPlayer;
    };

    /**
     *  継続判定
     *  @method isContinue
     *  @return {boolean} 継続判定
     */
    p.isContinue = function() {
        if (
            (this.passData[PLAYER_BLACK-1] && this.passData[PLAYER_WHITE-1])
            || this.acquisitionCells[PLAYER_BLACK-1] === 0
            || this.acquisitionCells[PLAYER_WHITE-1] === 0
            || this.usedCellCount === CELL_TOTAL
        ) {
            return false;
        }
        return true;
    };

    /**
     *  リザルトデータの取得
     *  @method getResultData
     *  @return {object} リザルトデータ
     */
    p.getResultData = function() {
        return {
            player              : this.player,
            acquisitionCells    : this.acquisitionCells,
            result              : this.getResult()
        };
    };

    /**
     *  勝敗の取得
     *  @method getResult
     *  @return {number} 勝敗タイプ
     */
    p.getResult = function() {
        if (this.acquisitionCells[PLAYER_BLACK-1] === this.acquisitionCells[PLAYER_WHITE-1]) {
            return RESULT_TYPE_DRAW;
        } else if (this.acquisitionCells[PLAYER_BLACK-1] > this.acquisitionCells[PLAYER_WHITE-1]) {
            return this.player === PLAYER_BLACK ? RESULT_TYPE_WIN : RESULT_TYPE_LOSE;
        }
        return this.player === PLAYER_BLACK ? RESULT_TYPE_LOSE : RESULT_TYPE_WIN;
    };

    g.OthelloModel = OthelloModel;
})(this);
