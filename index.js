var PowerMate	= require('node-powermate');
var _		= require('lodash');
var config	= require('./config');
var request     = require('request');

var BROWSER_ID = config.browserId;
var PANOPTICHROME_API_ROOT = config.apiRoot;
var DELAY_BEFORE_RESUMING_TAB_CYCLE = 30*1000;

var powermate;
var resumeTabCycleDebounced;

try {
    powermate = new PowerMate();
} catch(err){
    if(err.indexOf && err.indexOf("cannot open device with path") === 0 && process.getuid() !== 0){
	console.error("Unable to open HID device. Make sure you are running panoptichrome-powermate as root.");
    } else {
	console.error(err.message);
    }
    process.exit(1);
}

var wheelClicks = 0;
powermate.on('wheelTurn', _.wrap(function(wheelDelta){
    var isClockwise = (wheelDelta > 0);
    var direction = (isClockwise ? 'next' : 'previous');
  
    request({
	url: PANOPTICHROME_API_ROOT+"/browsers/"+BROWSER_ID+"/tabs/"+direction,
	method: "PATCH",
	json: { active: true }
    });

    pauseTabCycle();
    
    console.log(direction+" tab");
}, function(inner, wheelData){
    if((++wheelClicks % 8) === 0){
	wheelClicks = 0;
	inner(wheelData);
    }
}));

powermate.on('buttonDown', function(){
    request({
	url: PANOPTICHROME_API_ROOT+"/browsers/"+BROWSER_ID+"/message",
	method: "POST",
	json: {
	    powermate: { buttonPressed: true }
	}
    });
    console.log("button pressed");
});

function pauseTabCycle(){
    request({
	url: PANOPTICHROME_API_ROOT+"/browsers/"+BROWSER_ID,
	json: true
    }, function(err, res, body){
	var wasPaused = body.isCyclePaused;
	
	if(!wasPaused){
	    console.log("pausing tab cycle");
	    request({
		url: PANOPTICHROME_API_ROOT+"/browsers/"+BROWSER_ID,
		method: 'PATCH',
		json: {
		    isCyclePaused: true
		}
	    });

	    resumeTabCycleDebounced = _.debounce(resumeTabCycle, DELAY_BEFORE_RESUMING_TAB_CYCLE);
	    resumeTabCycleDebounced();
	} else {
	    console.log("tab cycle already paused, ignoring");
	}
    });

    resumeTabCycleDebounced && resumeTabCycleDebounced();
}

function resumeTabCycle(){
    resumeTabCycleDebounced = null;

    console.log("resuming tab cycle");
    request({
	url: PANOPTICHROME_API_ROOT+"/browsers/"+BROWSER_ID,
	method: 'PATCH',
	json: {
	    isCyclePaused: false
	}
    });
}

powermate.on('buttonUp', function(){
    //console.log('button released');
});

console.log("Ready");