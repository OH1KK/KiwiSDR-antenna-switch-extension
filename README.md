# KiwiSDR-antenna-switch-extension

This MS-S7-WEB is antenna switch extension to KiwiSDR software defined radio.

### Depencies

MS-S7-WEB script uses curl.

Install it to your KiwiSDR

    apt-get install curl



### Installation

open ssh connection to your KiwiSDR as root user

copy files from github to /root folder

then

    cp -varf extension/ant_switch /root/Beagle_SDR_GPS/extensions/
    cp -varf web/extension/ant_switch /root/Beagle_SDR_GPS/web/extensions/
    cp ms-s7-web /usr/local/bin
    chmod a+rx /usr/local/bin/ms-s7-web
    cd /root/Beagle_SDR_GPS/extensions/
    make
    make install
    m stop
    m start
 
### More info

About MS-S7-WEB antenna switch and MS-S7-WEB remote control unit: http://www.anteni.net

You can buy MS-S7 antenna switch and MS-S7-WEB remote control unit from  ebay.

About KiwiSDR software defined receiver see http://www.kiwisdr.com/
