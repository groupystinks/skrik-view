const ActionType = require('../constants/ActionType');
const Dispatcher = require('../dispatcher/Dispatcher');

function refresh() {
  Dispatcher.dispatch({type: ActionType.Thread.REFRESH});
}

module.exports = {
  refresh,
};
