# KiwiSDR-antenna-switch-extension

This is antenna switch extension to KiwiSDR software defined radio.

This extensions controls LZ2RR's MS-S7 antenna switch using MS-S7-WEB remote control unit. MS-S7 antenna switch has seven antenna connectors so you can select between several different listening antennas.

### Required hardware

You need hardware KiwiSDR software defined receiver, MS-S7 antenna switch and MS-S7-WEB remote control unit.

You can buy KiwiSDR software receiver from Seed https://www.seeedstudio.com/KiwiSDR-Board-p-2725.html

You can buy MS-S7 antenna switch and MS-S7-WEB remote control units from ebay. Search by seller LZ2RR. http://www.ebay.com/sch/lz2rr/m.html?_nkw=&_armrs=1&_ipg=&_from=

### Software depencies

ms-s7-web script uses curl for communication. It is not istalled on KiwiSDR by default.

Open ssh connection to your KiwiSDR as root user.

Install software depencies to your KiwiSDR

    apt-get install curl

### Installation

open ssh connection to your KiwiSDR as root user

Dowload KiwiSDR-antenna-switch-extension files from Github

    cd /root
    git clone https://github.com/OH1KK/KiwiSDR-antenna-switch-extension.git

then copy files

    cp -varf KiwiSDR-antenna-switch-extension/extensions/ant_switch/ /root/Beagle_SDR_GPS/extensions/
    cp -varf KiwiSDR-antenna-switch-extension/web/extensions/ant_switch /root/Beagle_SDR_GPS/web/extensions/
    cp KiwiSDR-antenna-switch-extension/ms-s7-web /usr/local/bin
    chmod a+rx /usr/local/bin/ms-s7-web

If your antenna switch does not use factory default IP 192.168.11.100, you have to mofidy 
/usr/local/bin/ms-s7-web script and change IPADDRESS. 

At this point test that you can control script from KiwiSDR console.

To read currently selected antenna 
  
    /usr/local/bin/ms-s7-web s

To switch antenna to antenna 2

    /usr/local/bin/ms-s7-web 2
   
If antenna status reading and switching works ok, proceed installation

    cd /root/Beagle_SDR_GPS/
    make clean
    make
    make install

This will take some time. When finished, restart KiwiSDR

    reboot
    
### Configuration

Open your KiwiSDR admin panel. Then Extensions -> Antenna Switch.

![ant switch extenstion admin interface](http://oh1kk.toimii.fi/ant_switch_extension/admin_interface.png)

Describe your antennas 1-7. If you leave antenna description empty, antenna button won't be visible to users.

Antenna switch failure or unknown status decription will be show to users if antenna switch is unreachable or malfunctioning. 

### Usage

Open your KiwiSDR as user. Enable ant_switch extension from extension drop down menu. Antenna switch will show. Click to select antenna.

![ant switch extenstion user interface](http://oh1kk.toimii.fi/ant_switch_extension/user_interface.png)

### demo site

TODO

### LICENSE
[The MIT License (MIT)](LICENSE)

Copyright (c) 2016 Kari Karvonen
