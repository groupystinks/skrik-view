const router = require('../router');

function select(process: ?Object) {
  if (process) {
    router.transitionTo(
      'process',
      {threadTitle: encodeURI(process.name)}
    );
  } else {
    router.transitionTo('app');
  }
}

module.exports = {
  select,
};
