var hid = require('node-hid');
var _ = require('lodash');
var util = require('util');

var POWERMATE_ID = {
    vendorId: 1917,
    productId: 1040
};

var openDevices = [];

main();


function main(){
    process.on('SIGINT', exit);
    process.on('SIGTERM', exit);

    initPowermateEvents();
}

function initPowermateEvents(){
    var devices = hid.devices();
    var deviceAttrs = _.find(devices, POWERMATE_ID);
    if (deviceAttrs){
	console.log("Connecting to PowerMate..." /*, deviceAttrs*/);
	try {
	    var device = new hid.HID(deviceAttrs.path);
	    openDevices.push(device);
	    console.log("Connected.");

	    device.on('data', onPowermateData);

	} catch (err){
	    console.error("Error: found PowerMate, but was unable to connect:", err);
	}
    } else {
	console.error("Error: no PowerMate attached, exiting.");
    }
}

function onPowermateData(data){
    var clickOffset = 0;
    var directionOffset = 1;
    var clockwiseRaw = 0x01;
    var counterclockwiseRaw = 0xff;

    var directionRaw = data.readInt8(directionOffset);
    var event = {
	isClicked: !!data.readUInt8(clickOffset),
	direction: null,
	raw: data
    };
    if(directionRaw !== 0){
	event.direction = (directionRaw > 0) ? "clockwise" : "counterclockwise";
    }
    /*if(directionRaw === clockwiseRaw){
	event.direction = "clockwise";
    } else if(directionRaw === counterclockwiseRaw){
	event.direction = "counterclockwise";
    }*/

    onPowermateEvent(event);
    
    //console.log(event);
}

function onPowermateEvent(event){
    var directionLabels = {
	"clockwise": "\u21b7",
	"counterclockwise": "\u21b6"
    };
    var label = directionLabels[event.direction] || "";
    if(event.isClicked){
	label += "\u2193";
    } else if(!event.direction){
	label += "\u2191";
    }
    label += ' ';
    //console.log(label);
    util.print(label);
}

function exit(){
    _.invoke(openDevices, 'close');
    console.log("Disconnected.");
}