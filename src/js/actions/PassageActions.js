var router = require('../router');

function select(passage: ?Object) {
  if (passage) {
    router.transitionTo(
      "thread",
      {passageName: encodeURI(passage.name), threadTitle: encodeURI(passage.title)}
    );
  } else {
    router.transitionTo('app');
  }
}

module.exports = {
  select,
};
