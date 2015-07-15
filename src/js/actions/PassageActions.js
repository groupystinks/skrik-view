var router = require('../router');

function select(passage: ?Object) {
  if (passage) {
    router.transitionTo(
      "thread",
      {passageName: passage.name, threadTitle: passage.title}
    );
  } else {
    router.transitionTo('app');
  }
}

module.exports = {
  select,
};
