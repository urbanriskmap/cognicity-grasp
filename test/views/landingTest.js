'use strict';

var casper;
var root = 'http://localhost:3000';


//2nd argument is the number of tests
casper.test.begin('check scrolling through cards', 5, function(test){
  casper.start(root+'/report/rcardtest', function() {
    test.assertTitle('Flood Report', 'landing title is correct');
  });

  casper.then(function(){
    test.assertExists('button#resetLocation');
    this.click('button#resetLocation');
  });

  casper.wait(1400, function(){
    test.assertExists('#cardFrame  p#cardTitle');
    test.assertSelectorHasText('#cardFrame p#cardTitle', 'Select Location', "correct card switch" );
  });

  casper.run(function(){
    test.done();
  });
});
