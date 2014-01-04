all:

run:
#	root is required to read HID in Linux
	@sudo node hid-test.js

install-deps:
#	to fix missing libusb.h in Debian/Ubuntu
	@apt-get install libusb-1.0-0-dev
	@npm install