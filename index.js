var PowerMate	= require('node-powermate');
var http	= require('http');
var _		= require('lodash');
var config	= require('./config');

var BROWSER_ID = config.browserId;
var PANOPTICHROME_API_ROOT = config.apiRoot;

var powermate;

try {
    powermate = new PowerMate();
} catch(err){
    if(err.indexOf("cannot open device with path") === 0 && process.getuid() !== 0){
	console.error("Unable to open HID device. Make sure you are running panoptichrome-powermate as root.");
    } else {
	console.error(err);
    }
    process.exit(1);
}

var wheelClicks = 0;
powermate.on('wheelTurn', _.wrap(function(wheelDelta){
    var isClockwise = (wheelDelta > 0);
    var direction = (isClockwise ? 'next' : 'previous');
    
    var req = http.request({
	method: 'PATCH',
	host: PANOPTICHROME_API_ROOT.host,
	port: PANOPTICHROME_API_ROOT.port,
	path: '/cgi-bin/browsers/'+BROWSER_ID+'/tabs/'+direction,
	headers: {
	    'Content-Type': 'application/json'
	}
    });
    req.end(JSON.stringify({ active: true }));
    console.log(direction+" tab");
}, function(inner, wheelData){
    if((++wheelClicks % 8) === 0){
	wheelClicks = 0;
	inner(wheelData);
    }
}));

powermate.on('buttonDown', function(){
    var req = http.request({
	method: 'POST',
	host: PANOPTICHROME_API_ROOT.host,
	port: PANOPTICHROME_API_ROOT.port,
	path: '/cgi-bin/browsers/'+BROWSER_ID+'/message',
	headers: {
	    'Content-Type': 'application/json'
	}
    });
    req.end(JSON.stringify({ powermate: { buttonPressed: true }}));
    console.log("button pressed");
});

powermate.on('buttonUp', function(){
    //console.log('button released');
});

console.log("Ready");