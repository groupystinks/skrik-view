var App = require('./App');
var ThreadView = require('./components/ThreadView');
var React = require('react');
var Router = require('react-router');

var Route = Router.Route;

var routes = (
  <Route handler={App} name="app" path="/">
    <Route
      handler={ThreadView}
      name="thread"
      path="/thread/:threadTitle/passage/:passageName"
    />
  </Route>
);

module.exports = routes;
