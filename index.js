var PowerMate = require('node-powermate');
var powermate = new PowerMate();
var http = require('http');
var _ = require('lodash');

var BROWSER_ID = "ef373ef9-330b-41fc-a60b-263e4c358ccc";
var PANOPTICHROME_API_ROOT = {
    host: "skadi.bluejeansnet.com",
    port: 8081,
};

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
//    console.log(direction+" tab");
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
//    console.log("button pressed");
});

powermate.on('buttonUp', function(){
    //console.log('button released');
});

console.log("Ready");