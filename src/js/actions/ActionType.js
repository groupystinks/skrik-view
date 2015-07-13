var ActionType = {
  Passage: {
    ADD_MANY: '',
    SELECT: '',
  },

  Thread: {
    REFRESH: '',
  }
};

var ActionTypeCopy = ActionType;
Object.keys(ActionTypeCopy).forEach(category => {
  Object.keys(ActionTypeCopy[category]).forEach(actionType => {
    ActionTypeCopy[category][actionType] = category + '.' + actionType;
  });
});

module.exports = ActionType;
