# KiwiSDR-antenna-switch-extension

This MS-S7-WEB is antenna switch extension to KiwiSDR software defined radio.

### Depencies

MS-S7-WEB script uses curl.

Install it to your KiwiSDR

    apt-get install curl unzip



### Installation

open ssh connection to your KiwiSDR as root user

dowload files from github

    curl -L https://github.com/OH1KK/KiwiSDR-antenna-switch-extension/archive/master.zip > master.zip

unzip files

    unzip master.zip

copy files from github to /root folder

then

    cp -varf KiwiSDR-antenna-switch-extension-master/extension/ant_switch /root/Beagle_SDR_GPS/extensions/
    cp -varf KiwiSDR-antenna-switch-extension-master/web/extension/ant_switch /root/Beagle_SDR_GPS/web/extensions/
    cp KiwiSDR-antenna-switch-extension-master/ms-s7-web /usr/local/bin
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
