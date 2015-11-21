"use strict";

var _ = require('lodash');


/**
 * Scope object that manages the scope
 * @constructor
 */
function Scope() {

  this.$$watches = [];
  this.$$lastDirtyWatch = null;
}

Scope.prototype.$watch = function(watchFn, listenerFn, valueEq){

  var watcher = {
    watchFn: watchFn,
    listenerFn: listenerFn || function() {},
    valueEq: !!valueEq,
    last: initWatchValue
  };

  this.$$watches.push(watcher);
  this.$$lastDirtyWatch = null;

};

Scope.prototype.$eval = function (fn, locals) {

  return fn(this, locals);

};

Scope.prototype.$digest = function() {
  var dirty
    , ttl = 10;
  this.$$lastDirtyWatch = null;
  do{
    dirty = this.$$digestOnce();
    if(dirty && !(ttl--)) {
      throw "10 digest iterations reached";
    }
  } while(dirty);
};

Scope.prototype.$$digestOnce = function(){
  var self = this
    , newValue
    , oldValue
    , dirty;

  _.forEach(this.$$watches, function(watcher) {

    newValue = watcher.watchFn(self);
    oldValue = watcher.last;

    if(!self.$$areEqual(newValue, oldValue, watcher.valueEq)){
      self.$$lastDirtyWatch = watcher;
      watcher.last = (watcher.valueEq ? _.cloneDeep(newValue) : newValue);
      watcher.listenerFn(newValue,
          (oldValue === initWatchValue ? newValue: oldValue), self);
      dirty = true;
    } else if(self.$$lastDirtyWatch === watcher){
      return false;
    }
  });

  return dirty;
};

Scope.prototype.$$areEqual = function(newValue, oldValue, valueEq) {
  if(valueEq) {
    return _.isEqual(newValue, oldValue);
  }else{
    return newValue === oldValue ||
      (typeof newValue === 'number' && typeof oldValue == 'number' &&
      isNaN(newValue) && isNaN(oldValue));
  }
};


function initWatchValue() {}

module.exports = Scope;
