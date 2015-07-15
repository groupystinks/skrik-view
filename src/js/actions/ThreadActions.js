var ActionType = require('../constants/ActionType');
var Dispatcher = require('../dispatcher/Dispatcher');

function refresh() {
  Dispatcher.dispatch({type: ActionType.Thread.REFRESH});
}

module.exports = {
  refresh,
};
