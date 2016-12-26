# KiwiSDR-antenna-switch-extension

This is antenna switch extension to KiwiSDR software defined radio.

This extensions controls LZ2RR's MS-S7 antenna switch using MS-S7-WEB remote control unit. MS-S7 antenna switch has seven antenna connectors so you can select between several different listening antennas.

![MS-S7-WEB kit](http://oh1kk.toimii.fi/ant_switch_extension/MS-S7-WEB.jpg)

### Required hardware

You need KiwiSDR is a software-defined radio (SDR) kit, MS-S7 antenna switch and MS-S7-WEB remote control unit.

You can buy KiwiSDR kit from Seed https://www.seeedstudio.com/KiwiSDR-Board-p-2725.html

You can buy MS-S7 antenna switch and MS-S7-WEB remote control units from ebay. Search by seller LZ2RR. http://www.ebay.com/sch/lz2rr/m.html?_nkw=&_armrs=1&_ipg=&_from=

### Version compability

* Tested to work with KiwiSDR v1.35 
* Tested to work with MS-S7-WEB firmware v1.01

### Installation

open ssh connection to your KiwiSDR as root user

    cd /root
    git clone https://github.com/OH1KK/KiwiSDR-antenna-switch-extension.git
    cd KiwiSDR-antenna-switch-extension
    bash ./ms-s7-web-installer

Installer copies ant_switch files on place, creates configuration file and recompiles KiwiSDR. This will take several minutes. After compile is finished, KiwiSDR will be restarted. After restart ant_switch extension is installed to KiwiSDR.

### Configuration

Open your KiwiSDR admin panel. Then Extensions -> Antenna Switch.

![ant switch extenstion admin interface](http://oh1kk.toimii.fi/ant_switch_extension/admin_interface.png)

Describe your antennas 1-7. If you leave antenna description empty, antenna button won't be visible to users.

Antenna switch failure or unknown status decription will be show to users if antenna switch is unreachable or malfunctioning. 

### Usage

Open your KiwiSDR as user. Enable ant_switch extension from extension drop down menu. Antenna switch will show. Click to select antenna.

![ant switch extension user interface launch](http://oh1kk.toimii.fi/ant_switch_extension/user_interface_launch.png)
![ant_switch_extension_user_interface](http://oh1kk.toimii.fi/ant_switch_extension/user_interface_v1.png)

### Uninstalling

open ssh connection to your KiwiSDR as root user

    cd /root
    cd KiwiSDR-antenna-switch-extension
    bash ./ms-s7-web-uninstaller

### KiwiSDR automatic update

This extension will be wiped out on KiwiSDR updates. You have to install this again if KiwiSDR gets updated. You can disable KiwiSDR automatic updates from KiwiSDR admin panel.

### LICENSE

[The MIT License (MIT)](LICENSE)

Copyright (c) 2016 Kari Karvonen
