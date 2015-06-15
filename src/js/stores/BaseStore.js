var Dispatcher = require('../dispatcher/Dispatcher');
var EventEmitter = require('events').EventEmitter;
var {Observable} = require('rx-lite');
var asap = require('asap');

var CHANGE_EVENT = 'change';

class BaseStore {
  constructor() {
    this._emitter = new EventEmitter();
    if ((this: any).handleDispatch) {
      Dispatcher.subscribe((this: any).handleDispatch.bind(this));
    }
  }

  emitChange(data: Object = {}) {
    this._emitter.emit(CHANGE_EVENT, {store: this}, ...data);
  }

  loadCachedData() {
    loadCachedData(this);
  }

  /*
  ** Ignore subscribe
  */

  // subscribe(
  //   fn: (data: any) => void
  // ): {remove: () => void;} {
  //   this._emitter.on(CHANGE_EVENT, fn);
  //
  //   return {
  //     remove: () => {
  //       this._emitter.removeListener(CHANGE_EVENT, fn);
  //     }
  //   };
  // }

  __wrapAsObservable<TOptions, TResult>(
    fn: (options: TOptions) => TResult,
    options: TOptions
  ): Observable<TResult> {
    return Observable.create(observer => {
      observer.onNext(fn(options));
      var subscription = this.subscribe(() => observer.onNext(fn(options)));
    }).distincUntilChanged(
      /*keySelector*/ null,
      (a, b) => a === b,
    );
  }
}

function loadCachedData(instance: Object) {
  if (!isOffline()) {
    return;
  }

  Object.keys(instance).forEach(key => {
    var ctor: any = instance.constructor;
    var value = localStorage.getItem(ctor.name + '.' + key);
    if (value) {
      instance[key] = JSON.parse(value);
    }
  });
}

module.exports = BaseStore;
