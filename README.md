# KiwiSDR-antenna-switch-extension

This is antenna switch extension to KiwiSDR software defined radio.

Antenna switch can control out-of-stock antenna switch MS-S7-WEB, or your homemade antenna switches which uses Beaglebone GPIO-pins. You can also write your own backend for third party antenna switch.

![MS-S7-WEB kit](http://oh1kk.toimii.fi/ant_switch_extension/MS-S7-WEB.jpg)

## Features

* Basic antenna switching
* Antenna mixing. In antenna mix mode multiple antennas can be selected simultaniously.
* Thunderstorm mode. In thunderstorm mode all antennas are grounded.
* Admin can lock/unlock antenna switching from admin panel
* Admin can enable/disable antenna mixing from admin panel
* Antenna switching can be time scheluded using Beaglebone's crontab
  * look at docs/antenna-schedules-using-crontab.txt
* Switcing back to default antennas when no users are online
  * look at docs/reset-to-default-antennas-when-no-users-online.txt
  
## Required hardware

You need KiwiSDR is a software-defined radio (SDR) kit

You need antenna switch hardware.

## Available backends for hardware

* ms-s7-web for controlling LZ2RR's MS-S7-WEB antenna switch
* beagle-gpio for controlling Beaglebone green GPIO pins
* arduino-netshield for Arduino Nano V3.0 GPIO pins. ENC28J60 Ethernet Shield needed.
* example-backend is example script for your own backend development

## Version compability

* Tested to work with KiwiSDR v1.90
* Tested to work with MS-S7-WEB firmware v1.01

## Installation

open ssh connection to your KiwiSDR as root user

    cd /root
    git clone https://github.com/OH1KK/KiwiSDR-antenna-switch-extension.git
    cd KiwiSDR-antenna-switch-extension
    bash ./ant-switch-extension-installer

Installer copies ant_switch files on place, creates configuration file and recompiles KiwiSDR. This will take several minutes. After compile is finished, KiwiSDR will be restarted. After restart ant_switch extension is installed to KiwiSDR.

## Configuration

Open your KiwiSDR admin panel. Then Extensions -> Antenna Switch.

![ant switch extenstion admin interface](http://oh1kk.toimii.fi/ant_switch_extension/admin_interface-20170110.png)

By default users can switch antennas and select multiple simultanoius antennas.

Describe your antennas 1-7. If you leave antenna description empty, antenna button won't be visible to users.

Antenna switch failure or unknown status decription will be show to users if antenna switch is unreachable or malfunctioning. 

## Usage

Open your KiwiSDR as user. Enable ant_switch extension from extension drop down menu. Antenna switch will show.

![ant switch extension user interface launch](http://oh1kk.toimii.fi/ant_switch_extension/user_interface_launch.png)
![ant_switch_extension_user_interface](http://oh1kk.toimii.fi/ant_switch_extension/user_interface-20170110.png)

Single antenna mode: Click to select antenna. 

Antenna mixing mode: you can select multiple antennas simultaniously. Click antennas on/off. 

If admin has disable antenna switching, buttons are grey and you cannot click them.

## Uninstalling extension

open ssh connection to your KiwiSDR as root user

    cd /root/KiwiSDR-antenna-switch-extension
    bash ./ant-switch-extension-uninstaller
    cd /root
    rm -rf KiwiSDR-antenna-switch-extension

## Demo site

KiwiSDR Kaustinen http://sdr.vy.fi

## License

[The MIT License (MIT)](LICENSE)

Copyright (c) 2017 Kari Karvonen
