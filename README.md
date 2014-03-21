panoptichrome-powermate
=======================

Use a Griffin PowerMate to control a Chrome instance with the Panoptichrome extension.
This assumes that the machine is already registered with Panoptichrome.

# Installation

##Linux prerequisite

	$ sudo apt-get install libusb-1.0-0-dev  #if you're using Linux

##Installing in Linux and MacOS

	$ git clone https://github.com/Aldaviva/panoptichrome-powermate.git && cd panoptichrome-powermate
	$ npm install

# Configuration

1. Copy `config.json.example` to `config.json`
2. Edit the `browserId` field in `config.json` to be the UUID of this machine in Panoptichrome.
3. Set `apiRoot` to your Panoptichrome server.

# Running

	$ node .
