# KiwiSDR-antenna-switch-extension

This MS-S7-WEB is antenna switch extension to KiwiSDR software defined radio.

This extensions controls LZ2RR's MS-S7 antenna switch using MS-S7-WEB remote control unit. You can buy both hardware pieces from ebay. Search for MS-S7 antenna switch and MS-S7-WEB remote control.

### Depencies

MS-S7-WEB script uses curl. unzip is also needed on installation.

open ssh connection to your KiwiSDR as root user.

Install depencies to your KiwiSDR

    apt-get install curl unzip

### Installation

open ssh connection to your KiwiSDR as root user

dowload files from github

    cd /root
    curl -L https://github.com/OH1KK/KiwiSDR-antenna-switch-extension/archive/master.zip > master.zip

unzip files

    unzip master.zip

copy files from github to /root folder

then

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

Open your KiwiSDR admin panel. Then Extension -> Antenna Switch.

Describe your antennas 1-7. If you leave antenna description empty, it won't be show to users.

Antenna switch failure or unknown status decription is show to user if antenna switch is unreachable or malfunctioning. 

### Usage

Open your KiwiSDR as user

Enable antenna switch extension from box right corner.

Antenna switch will show. Click to select antenna.

### demo site

TODO

### More info
About KiwiSDR software defined receiver see http://www.kiwisdr.com/

About MS-S antenna switch box and MS-S7-WEB remote control unit: http://www.anteni.net
