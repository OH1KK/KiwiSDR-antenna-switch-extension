




**This extension repository is obsolete and retired. Antenna switch extension will be part of next KiwiSDR version.**
**See [KiwiSDR](http://www.kiwisdr.com) official webpage for newer versions of antenna switch extension.**






# KiwiSDR-antenna-switch-extension

This is an antenna switch extension for the KiwiSDR software defined radio.

The antenna switch can control out-of-stock antenna switches and utilize Beaglebone GPIO-pins.
You can also write your own backend for third party antenna switches.

![MS-S7-WEB kit](http://oh1kk.toimii.fi/ant_switch_extension/MS-S7-WEB.jpg)

## Features

* Basic antenna switching.
* Antenna mixing. In antenna mix mode multiple antennas can be selected simultaneously.
* Admin can lock/unlock antenna switching from admin panel.
* Admin can enable/disable antenna mixing from admin panel.
* Admin can deny antenna switching if more than one user is online.
* Antenna switching can be time scheluded using Beaglebone's crontab.
  * Look at docs/antenna-schedules-using-crontab.txt
* Switching back to default antennas when no users are online.
  * Look at docs/reset-to-default-antennas-when-no-users-online.txt
* Thunderstorm mode. In thunderstorm mode all antennas are forced to ground and switching is denied.
* Telnet daemon (optional). You can switch antennas using telnet commands.
  * Usage scenarios: Arduino based hardware antenna control box, automating antenna grounding based lightning strikes information.
  * Look at docs/ant-switch-daemon-wrapper.txt
* The Kiwi frequency scale offset can be set for each antenna selection. Supports transverters or downconverters that are switched together with the antenna.
* Antenna switching can be made from the http url with a parameter,  
e.g. my\_kiwi:8073/?ext=ant,6 would select antenna #6 and  
my\_kiwi:8073/?ext=ant,6,3 would select antennas #6 and #3. Instead of an antenna number
a sub-string of the antenna description can be specified. See the extension help button for details.
  
## Required hardware

You will need the KiwiSDR software-defined radio (SDR) kit.

You will need antenna switch hardware.

## Available backends for hardware

* ms-s7-web for controlling LZ2RR's MS-S7-WEB antenna switch
* ms-s4a-web for controlling LZ2RR's MS-S4A-WEB antenna switch
* beagle-gpio for controlling up to ten Beaglebone Green/Black/AI/AI-64 GPIO pins
* snaptekk for controlling Snaptekk Wifi ham radio 8 antenna switch
* kmtronic for controlling KMTronic LAN Ethernet IP 8 channels WEB Relay
* kmtronic-udp for controlling KMTronic LAN Ethernet IP 8 channels UDP Relay
* arduino-netshield for Arduino Nano V3.0 GPIO pins. ENC28J60 Ethernet Shield needed.
* example-backend is an example script for your own backend development

## Version compability

* This version 0.5 (16 Jun 2023) requires KiwiSDR version v1.608 or later
* Tested to work with MS-S7-WEB firmware v1.01
* Tested to work with MS-S4A-WEB
* Tested to work with Snaptekk WiFi wireless 8 antenna switch
* Tested to work with KMTronic LAN Ethernet IP 8 channels WEB Relay
* Tested to work with KMTronic LAN Ethernet IP 8 channels UDP Relay
* Tested to work with Beaglebone Green/Black/AI/AI-64 GPIO pins

## Installation

Open ssh connection to your KiwiSDR as root user and type the commands below.
Do not install from the "console" tab of the Kiwi admin page.
This is because the install script rebuilds and restarts the Kiwi software
and this cannot be done while connected to the Kiwi using the console tab.

    cd /root
    git clone https://github.com/OH1KK/KiwiSDR-antenna-switch-extension.git
    cd KiwiSDR-antenna-switch-extension
    bash ./ant-switch-extension-installer

The installer copies the files to the correct place, creates a configuration file
and recompiles the KiwiSDR server.
This will take several minutes. After the compile is finished, the KiwiSDR will be restarted.
After restart the antenna switch extension is installed on the KiwiSDR.

## Configuration

Open your KiwiSDR admin panel. Then Extensions -> Antenna Switch.

![ant switch extenstion admin interface](http://oh1kk.toimii.fi/ant_switch_extension/admin_interface_20180123.png)

By default users can switch antennas and select multiple simultaneous antennas.

Describe your antennas 1-8. If you leave antenna description empty, antenna button won't be visible to users.

Antenna switch failure or unknown status decription will be show to users if antenna switch is unreachable or malfunctioning. 

## Usage

Open your KiwiSDR as user. Enable ant_switch extension from extension drop down menu. Antenna switch will show.

![ant switch extension user interface launch](http://oh1kk.toimii.fi/ant_switch_extension/user_interface_launch_20180123.png)
![ant_switch_extension_user_interface](http://oh1kk.toimii.fi/ant_switch_extension/user_interface_20180123.png)

Single antenna mode: Click to select antenna. 

Antenna mixing mode: you can select multiple antennas simultaneously. Click antennas on/off. 

If admin has disable antenna switching, buttons are grey and you cannot click them.

## Uninstalling extension

Open an ssh connection to your KiwiSDR as the root user and type:

    cd /root/KiwiSDR-antenna-switch-extension
    bash ./ant-switch-extension-uninstaller
    cd /root
    rm -rf KiwiSDR-antenna-switch-extension

## Demo site

KiwiSDR Kaustinen http://sdr.vy.fi

## Donate
If you want to support this project, you can [send a donation via PayPal](https://www.paypal.me/oh1kk).

## License

[The MIT License (MIT)](LICENSE)

Copyright (c) 2019-2023 Kari Karvonen
