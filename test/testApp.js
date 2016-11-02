'use strict';

/* jshint -W079 */ // Ignore this error for this import only, as we get a redefinition problem
var test = require('unit.js');
/* jshint +W079 */

var fork = require('child_process').fork;

//Test harness for server.js script
describe( 'testApp.js', function() {

	// Can the app launch - and return with a process.exit(0)
	// This tests much of the code in server.js
	it( 'should launch with default configuration and fail with an error', function(done) {
		// Set timeout high to let node launch the child process. Typically takes 1000ms.
		// If the app takes longer than this, the test will fail, which we want to happen in case it hangs due to a bug.
		this.timeout(1000);

		// Launch 'node server.js test-config.js'
		var child = fork('test/testApp/app.js',['test/testApp/sample-app-config.js']);

		// Wait for the child process to exit

		function waitForChild() {
			if (child.exitCode === null) {
				setTimeout( waitForChild, 100);
			} else {
				doTest();
			}
		}

		// Once the child has exited, test the exit code and end the async mocha test
		function doTest() {
			test.value(child.exitCode).is(0);
			done();
		}

		// Start waiting for the child process to exit
		waitForChild();
	});

});

//Test template
//describe( "suite", function() {
//	before( function() {
//	});
//
//	beforeEach( function() {
//	});
//
//	it( 'case', function() {
//	});
//
//	after( function(){
//	});
//});
