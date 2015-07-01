require('es6-shim');

function run() {
  var React = require('react');
  var router = require('./router');
  router.run((Root, state) => {
    React.render(<Root params={state.params} />, document.body);
  });
}

run();
