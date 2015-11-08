"use strict";

var chai = require('chai')
  , expect = chai.expect
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , _ = require('lodash');

chai.should();
chai.use(sinonChai);


var Scope = require('../src/scope.js');

describe("Scope", function() {

  it("can be constructed and used as an object", function() {

    var scope = new Scope();
    scope.aProperty = 1;

    expect(scope.aProperty).to.be.eql(1);

  });

  describe('digest', function() {

    var scope;

    beforeEach(function() {
      scope = new Scope();
    });

    it("calls the listener function of a watch on first $digest", function() {
      var watchFn = function(){ return 'wat'; };
      var listenerFn = sinon.spy();

      scope.$watch(watchFn, listenerFn);

      scope.$digest();

      listenerFn.should.have.been.calledOnce;

    });

    it("calls the watch function with the scope of the argument", function(){

      var watchFn = sinon.spy();
      var listenerFn = function() {};

      scope.$watch(watchFn, listenerFn);

      scope.$digest();

      watchFn.should.have.been.calledWith(scope);

    });

    it("calls the listener function when the watched value changes", function() {
      scope.someValue = 'a';
      scope.counter = 0;

      scope.$watch(
        function(scope){ return scope.someValue;},
        function(newValue, oldValue, scope){ scope.counter++; }
      );

      expect(scope.counter).to.be.eql(0);

      scope.$digest();
      expect(scope.counter).to.be.eql(1);

      scope.$digest();
      expect(scope.counter).to.be.eql(1);

      scope.someValue = 'b';
      expect(scope.counter).to.be.eql(1);

      scope.$digest();
      expect(scope.counter).to.be.eql(2);


    });

    it("calls listener when watch value is first undefined", function() {

      scope.counter = 0;

      scope.$watch(
        function(scope){ return scope.someValue;},
        function(newValue, oldValue, scope){ scope.counter++; }
      );

      scope.$digest();
      expect(scope.counter).to.be.eql(1);


    });

    it("calls listener with newValue as old value the first time", function() {

      scope.someValue = 123;
      var oldValueGiven;

      scope.$watch(
        function(scope){ return scope.someValue;},
        function(newValue, oldValue, scope){ oldValueGiven = oldValue; }
      );

      scope.$digest();
      expect(oldValueGiven).to.be.eql(123);


    });

    it("should have watchers that omit the listener function", function() {
      var watchFn = sinon.spy();
      scope.$watch(watchFn);
      scope.$digest();

      watchFn.should.have.been.called;

    });

    it("trigger chained watchers in the same digest", function() {
      scope.name = 'Jane';



      scope.$watch(
        function(scope){ return scope.nameUpper; },
        function(newValue, oldValue, scope){
          if(newValue) {
            scope.initial = newValue.substring(0,1) + '.';
          }
        }
      );

      scope.$watch(
        function(scope){ return scope.name; },
        function(newValue, oldValue, scope){
          if(newValue) {
            scope.nameUpper = newValue.toUpperCase();
          }
        }
      );

      scope.$digest();
      expect(scope.initial).to.be.eql('J.');

      scope.name = "Bob";
      scope.$digest();
      expect(scope.initial).to.be.eql('B.');



    });

    it("gives up on the watches after 10 iterations", function() { scope.counterA = 0;
      scope.counterB = 0;

      scope.$watch(
        function(scope) { return scope.counterA; },
        function(newValue, oldValue, scope) {
          scope.counterB++;
        }
      );
      scope.$watch(
        function(scope) { return scope.counterB; },
        function(newValue, oldValue, scope) {
          scope.counterA++;
        }
      );

      expect((function() { scope.$digest(); })).to.throw();
    });

    it("ends the digest when the last watch is clean", function(){

      scope.array = _.range(100);
      var watchExecutions = 0;

      _.times(100, function(i) {
        scope.$watch(
          function(scope) {
            watchExecutions++;
            return scope.array[i];
          },
          function(newValue, oldValue, scope){

          }
        );
      });

      scope.$digest();
      expect(watchExecutions).to.be.eql(200);

      scope.array[0] = 420;
      scope.$digest();
      expect(watchExecutions).to.be.eql(301);

    });

    it("does not end digest so that new watches are not run", function() {

      scope.aValue = 'abc';
      scope.counter = 0;

      scope.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.$watch(
            function(scope){ return scope.aValue; },
            function(newValue, oldValue, scope) {
              scope.counter++;
            }
          );
        }
      );

      scope.$digest();
      expect(scope.counter).to.be.eql(1);


    });

    it("compares based on value if enabled", function() {
      scope.aValue = [1,2,3];
      scope.counter = 0;

      scope.$watch(
        function(scope){ return scope.aValue},
        function(newValue, oldValue, scope) {
          scope.counter++;
        },
        true
      );

      scope.$digest();
      expect(scope.counter).to.be.eql(1);

      scope.aValue.push(4);
      scope.$digest();
      expect(scope.counter).to.be.eql(2);

    });

    it("correctly handles NaNs", function() {
      scope.number = 0/0;
      scope.counter = 0;

      scope.$watch(
        function(scope){ return scope.number;},
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );

      scope.$digest();
      expect(scope.counter).to.be.eql(1);

      scope.$digest();
      expect(scope.counter).to.be.eql(1);

    })


  });



});
