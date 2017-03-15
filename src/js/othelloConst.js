var CELL_Y          = 8;
var CELL_X          = 8;
var CELL_TOTAL      = CELL_Y * CELL_X;
var PLAYER_BLACK    = 1;
var PLAYER_WHITE    = 2;

var INITIAL_PLAY_DATA = [
    { y: 3, x: 3, type: PLAYER_BLACK },
    { y: 3, x: 4, type: PLAYER_WHITE },
    { y: 4, x: 3, type: PLAYER_WHITE },
    { y: 4, x: 4, type: PLAYER_BLACK }
];

var DIR_TOP                     = 0;
var DIR_BOTTOM                  = 1;
var DIR_RIGHT                   = 2;
var DIR_LEFT                    = 3;
var DIR_TOP_RIGHT               = 4;
var DIR_TOP_LEFT                = 5;
var DIR_BOTTOM_RIGHT            = 6;
var DIR_BOTTOM_LEFT             = 7;
var DIR_TOTAL                   = 8;

var PREFIX_TYPE_TOP             = 0;
var PREFIX_TYPE_BOTTOM          = 1;
var PREFIX_TYPE_RIGHT           = 2;
var PREFIX_TYPE_LEFT            = 3;
var PREFIX_TYPE_TOP_RIGHT       = 4;
var PREFIX_TYPE_TOP_LEFT        = 5;
var PREFIX_TYPE_BOTTOM_RIGHT    = 6;
var PREFIX_TYPE_BOTTOM_LEFT     = 7;
var PREFIX_TYPE_FIRST_SET       = 8;
var PREFIX_TYPE_SET             = 9;
var PREFIX_TYPE_HINT            = 10;
var PREFIX_TYPE_HIDE            = 11;
var PREFIX_TYPE_NONE            = 12;

var TELOP_TYPE_MAIN_IN          = 0;
var TELOP_TYPE_MAIN_TEXT        = 1;
var TELOP_TYPE_MAIN_OUT         = 2;
var TELOP_TYPE_TURN_IN          = 3;
var TELOP_TYPE_TURN_OUT         = 4;

var SEQ_INVALID                 = 0;
var SEQ_GAME_TITLE              = 1;
var SEQ_GAME                    = 2;
var SEQ_MODE                    = 3;
var SEQ_START_UP                = 4;
var SEQ_START_UP_TELOP_IN       = 5;
var SEQ_START_UP_TELOP_TEXT_1   = 6;
var SEQ_START_UP_TELOP_TEXT_2   = 7;
var SEQ_START_UP_TELOP_OUT      = 8;
var SEQ_PLAY_TURN_BEGIN         = 9;
var SEQ_PLAY_TURN               = 10;
var SEQ_PLAY_TURN_END           = 11;
var SEQ_TURN_TELOP_IN           = 12;
var SEQ_TURN_TELOP_OUT          = 13;
var SEQ_PASS_TELOP_IN           = 14;
var SEQ_PASS_TELOP_TEXT         = 15;
var SEQ_PASS_TELOP_OUT          = 16;
var SEQ_END_TELOP_IN            = 17;
var SEQ_END_TELOP_TEXT          = 18;
var SEQ_END_TELOP_OUT           = 19;
var SEQ_RESULT                  = 20;

var MODE_TYPE_EASY      = 0;
var MODE_TYPE_NORMAL    = 1;

var RESULT_TYPE_LOSE    = 0;
var RESULT_TYPE_WIN     = 1;
var RESULT_TYPE_DRAW    = 2;

var DIFF_TYPE_ROOM      = 10;
var DIFF_TYPE_PINCH     = -10;

var GET_CELL_CRITICAL   = 5;

var CHARA_CLASSNAME_NORMAL              = 'normal';
var CHARA_CLASSNAME_ROOM                = 'room';
var CHARA_CLASSNAME_PINCH               = 'pinch';

var VIEW_DONE_CELL_CHECK                = 'viewDoneCellCheck';
var VIEW_DONE_CELL_UPDATE               = 'viewDoneCellUpdate';
var VIEW_DONE_RESET                     = 'viewDoneReset';

var VIEW_REQ_SHOW_GAME_TITLE            = 'viewReqShowGameTitle';
var VIEW_REQ_SHOW_GAME                  = 'viewReqShowGame';
var VIEW_REQ_SHOW_MODE                  = 'viewReqShowMode';
var VIEW_REQ_SHOW_INITIAL_STONE         = 'viewReqShowInitialStone';
var VIEW_REQ_SHOW_TELOP                 = 'viewReqShowTelop';
var VIEW_REQ_SHOW_RESULT                = 'viewReqShowResult';
var VIEW_REQ_GAME_END_READY             = 'viewReqGameEndReady';

var MODEL_REQ_CELL_CHECK                = 'modelReqCellCheck';
var MODEL_REQ_MODE_UPDATE               = 'modelReqModeUpdate';
var MODEL_REQ_CELL_UPDATE               = 'modelReqCellUpdate';
var MODEL_REQ_PLAY_TURN_UPDATE          = 'modelReqPlayTurnUpdate';
var MODEL_REQ_RESET                     = 'modelReqReset';

var MANAGER_REQ_SEQ_UPDATE              = 'managerReqSeqUpdate';
var MANAGER_REQ_INSERT_PASS_SEQ         = 'managerReqInsertPassSeq';
var MANAGER_REQ_INSERT_RETRY_SEQ        = 'managerReqInsertRetrySeq';
var MANAGER_REQ_INSERT_TITLE_SEQ        = 'managerReqInsertTitleSeq';

var TEXT_TELOP_START                    = 'ゲームを開始します';
var TEXT_TELOP_END                      = 'ゲームを終了します';
var TEXT_TELOP_PLAYER_TYPE              = ['あなたの手番は黒になります', 'あなたの手番は白になります'];
var TEXT_TELOP_PASS                     = 'パスします';
var TEXT_TURN_TELOP_PLAYER              = 'あなたの手番';
var TEXT_TURN_TELOP_NPC                 = 'あいての手番';
var TEXT_MODE_TITLE                     = '難易度';
var TEXT_RESULT_TITLE                   = 'リザルト';
var TEXT_RESULT_INFO                    = ['あなたの手番：黒', 'あなたの手番：白'];
var TEXT_RESULT                         = ['LOSE', 'WIN', 'DRAW'];

var CHARA_MSG_DEFAULT                   = 'がんばるよー';
var CHARA_MSG_MODE_SELECT               = 'どっちにしようかな？';
var CHARA_MSG_GAME_START                = 'ゲーム開始だよ';
var CHARA_MSG_PLAYTURN_NORMAL           = 'どこに置こうかな？';
var CHARA_MSG_PLAYTURN_ROOM             = '優勢な感じがするよ';
var CHARA_MSG_PLAYTURN_PINCH            = 'むむむ・・・';
var CHARA_MSG_PLAYTURN_PASS             = '置けないからパスするよ';
var CHARA_MSG_STONE_SET                 = 'ここに置くよ！';
var CHARA_MSG_STONE_GET_NORMAL          = '枚とれたよ！';
var CHARA_MSG_STONE_GET_CRITICAL        = 'たくさんとれたー！';
var CHARA_MSG_NPC_PLAYTURN_NORMAL       = 'あいての手番だよ';
var CHARA_MSG_NPC_PLAYTURN_PASS         = 'あいてはパスするみたい';
var CHARA_MSG_STONE_LOST_NORMAL         = '枚とられたよ';
var CHARA_MSG_STONE_LOST_CRITICAL       = 'あいたー！';
var CHARA_MSG_RESULT                    = 'どっちが勝ったかな？';
var CHARA_MSG_WIN                       = '勝てたー！';
var CHARA_MSG_LOSE                      = '負けちゃったよ';
var CHARA_MSG_DRAW                      = '引き分けみたい';
var CHARA_MSG_RETRY                     = 'リトライするよ！'
