# KiwiSDR-antenna-switch-extension

This MS-S7-WEB is antenna switch extension to KiwiSDR software defined radio.

This extensions controls LZ2RR's MS-S7 antenna switch using MS-S7-WEB remote control units. You can buy both hardware pieces from ebay. Search for MS-S7 antenna switch and MS-S7-WEB remote control.

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

edit /usr/local/bin/ms-s7-web script and change IPADDRESS if you dont use factory defaults 192.168.11.100.
Save file

Test read currenly selected antenna 
  
    /usr/local/bin/ms-s7-web s

Test antenna switching 

   /usr/local/bin/ms-s7-web 2
   
If antenna status reading and switching works ok, proceed installation

    cd /root/Beagle_SDR_GPS/extensions/
    make
    make install

This will take some time. When finished, restart KiwiSDR

    m stop
    m start


### More info
About KiwiSDR software defined receiver see http://www.kiwisdr.com/

About MS-S7-WEB antenna switch and MS-S7-WEB remote control unit: http://www.anteni.net
