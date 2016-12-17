# KiwiSDR-antenna-switch-extension

This is antenna switch extension to KiwiSDR software defined radio.

This extensions controls LZ2RR's MS-S7 antenna switch using MS-S7-WEB remote control unit. MS-S7 antenna switch has seven antenna connectors so you can select between several different listening antennas.

### Required hardware

You need hardware KiwiSDR software defined receiver, MS-S7 antenna switch and MS-S7-WEB remote control unit.

You can buy KiwiSDR software receiver from Seed https://www.seeedstudio.com/KiwiSDR-Board-p-2725.html

You can buy MS-S7 antenna switch and MS-S7-WEB remote control units from ebay.

### Software depencies

ms-s7-web script uses curl for communication. unzip is needed during installation. These are not istalled on KiwiSDR by default.

Open ssh connection to your KiwiSDR as root user.

Install software depencies to your KiwiSDR

    apt-get install curl unzip

### Installation

open ssh connection to your KiwiSDR as root user

dowload KiwiSDR-antenna-switch-extension files from Github

    cd /root
    curl -L https://github.com/OH1KK/KiwiSDR-antenna-switch-extension/archive/master.zip > master.zip

unzip files

    unzip master.zip

then copy files

    cp -varf KiwiSDR-antenna-switch-extension-master/extensions/ant_switch/ /root/Beagle_SDR_GPS/extensions/
    cp -varf KiwiSDR-antenna-switch-extension-master/web/extensions/ant_switch /root/Beagle_SDR_GPS/web/extensions/
    cp KiwiSDR-antenna-switch-extension-master/ms-s7-web /usr/local/bin
    chmod a+rx /usr/local/bin/ms-s7-web

If your antenna switch does not use factory default IP 192.168.11.100, you have to mofidy 
/usr/local/bin/ms-s7-web script and change IPADDRESS. 

At this point test that you can control script from KiwiSDR console.

To read currently selected antenna 
  
    /usr/local/bin/ms-s7-web s

To switch antenna to antenna 2

    /usr/local/bin/ms-s7-web 2
   
If antenna status reading and switching works ok, proceed installation

    cd /root/Beagle_SDR_GPS/extensions/
    make
    make install

This will take some time. When finished, restart KiwiSDR

    m stop
    m start

### Configuration

Open your KiwiSDR admin panel. Then Extensions -> Antenna Switch.

Describe your antennas 1-7. If you leave antenna description empty, antenna button won't be visible to users.

Antenna switch failure or unknown status decription will be show to users if antenna switch is unreachable or malfunctioning. 

### Usage

Open your KiwiSDR as user. Enable ant_switch extension from extension drop down menu. Antenna switch will show. Click to select antenna.

### demo site

TODO

