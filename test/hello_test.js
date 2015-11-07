
var hello = require('../src/hello.js');

var chai = require('chai')
  , expect = chai.expect
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai');




describe('Hello', function() {
  it('should return Hello David! when called with David', function() {
    var actual = hello("David");

    expect(actual).to.be.eql('Hello, David!');

  })


})
