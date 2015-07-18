var Dispatcher = require('../dispatcher/Dispatcher');
var EventEmitter = require('events').EventEmitter;
var {Observable} = require('rx-lite');
var asap = require('asap');

var CHANGE_EVENT = 'change';

class BaseStore {
  constructor() {
    this._emitter = new EventEmitter();

    // subscribe 'dispatch' event from Dispatcher.js
    if ((this: any).handleDispatch) {
      Dispatcher.subscribe((this: any).handleDispatch.bind(this));
    }
  }


  emitChange(data: Object = {}) {
    this._emitter.emit(CHANGE_EVENT, {store: this}, ...data);
  }


  subscribe(
    fn: (data: any) => void
  ): {remove: () => void;} {
    this._emitter.on(CHANGE_EVENT, fn);

    return {
      remove: () => {
        this._emitter.removeListener(CHANGE_EVENT, fn);
      }
    };
  }


  __wrapAsObservable(
    fn: (options: TOptions) => TResult,
    options: TOptions
  ): Observable<TResult> {
    return Observable.create(observer => {
      observer.onNext(fn(options));
      // for CHANGE_EVENT
      var subscription = this.subscribe(() => observer.onNext(fn(options)));
      // use subscription.remove to clean up
      return () => subscription.remove();
    }).distinctUntilChanged(
      /*keySelector*/ null,
      /*comparer*/ (a, b) => a === b,
    );
  }
}


module.exports = BaseStore;
