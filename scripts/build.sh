#!/usr/bin/env bash
if [ $1 == "mac" ] || [ $1 == "MacOs" ] || [ $1 == "Mac" ]
then
    echo "Running build....."
    echo `git clone https://github.com/pavel-a/usb-relay-hid.git`
    echo `cd usb-relay-hid/commandline/makemake && make`
    echo `mv usb-relay-hid/commandline/makemake/hidusb-relay-cmd scripts/relaycmd`
    echo `rm -rf mv usb-relay-hid`
    echo "Finished Compiling!"

else
    echo "Please specify OS (currently only compatible with MacOS)"
fi