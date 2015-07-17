var router = require('../router');

function select(passage: ?Object) {
  if (passage) {
    router.transitionTo(
      "thread",
      {threadTitle: encodeURI(passage.title), passageName: encodeURI(passage.name)}
    );
  } else {
    router.transitionTo('app');
  }
}

module.exports = {
  select,
};
