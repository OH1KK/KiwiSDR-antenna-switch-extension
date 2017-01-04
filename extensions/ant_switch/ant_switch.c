// Copyright (c) 2016 Kari Karvonen, OH1KK
//
// You need snmpget and snmpset external commands
//  sudo apt-get install snmp
#include "ext.h"	// all calls to the extension interface begin with "ext_", e.g. ext_register()

#include "kiwi.h"

#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <math.h>
#include <strings.h>
#include <sys/types.h>
#include <sys/wait.h>

#define ANT_SWITCH_DEBUG_MSG	true
//#define ANT_SWITCH_DEBUG_MSG	false

// rx_chan is the receiver channel number we've been assigned, 0..RX_CHAN
// We need this so the extension can support multiple users, each with their own ant_switch[] data structure.

struct ant_switch_t {
	int rx_chan;
	int run;
};

static ant_switch_t ant_switch[RX_CHANS];

int ant_switch_queryantenna() {
	char line[256], *cp, *cp2;
	int n;
	char selectedantenna = '0';
	
	non_blocking_cmd("/usr/local/bin/ms-s7-web s", line, sizeof(line), NULL);
	
	// find last line of output
	int slen = strlen(line);
	cp = &line[slen-1];
	if (slen >= 2 && *cp == '\n') {
		cp2 = rindex(cp-1, '\n') + 1;
		if (cp2) cp = cp2;
		n = sscanf(cp, "Selected antenna: %c", &selectedantenna);
		if (!n) printf("ant_switch_queryantenna BAD STATUS? <%s>\n", line);
	}
	
	return(selectedantenna);
}

int ant_switch_setantenna(int antenna) {
	char line[256];
	int status;
	int n;
	char *antennastr;
	
	if (antenna == 8)
		asprintf(&antennastr, "/usr/local/bin/ms-s7-web g"); // 8 = ground all antennas
	else
		asprintf(&antennastr, "/usr/local/bin/ms-s7-web %d", antenna);
	line[0] = '\0';
	n = non_blocking_cmd(antennastr, line, sizeof(line), &status);
	if (ANT_SWITCH_DEBUG_MSG) printf("ant_switch_setantenna: %s\n",line);
	free(antennastr);
    return(status);
}


bool ant_switch_msgs(char *msg, int rx_chan)
{
	ant_switch_t *e = &ant_switch[rx_chan];
	int n=0;
        int antenna;	
    
	printf("### ant_switch_msgs RX%d <%s>\n", rx_chan, msg);
	
	if (strcmp(msg, "SET ext_server_init") == 0) {
		e->rx_chan = rx_chan;	// remember our receiver channel number
		ext_send_msg(e->rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT ready");
		return true;
	}

        n = sscanf(msg, "SET Antenna=%d", &antenna);
        if (n == 1) {
            if (antenna > 0 && antenna < 8) {
                 ant_switch_setantenna(antenna);   
                 return true;
            }
        }

        if (strcmp(msg, "SET Antenna=g") == 0) {
            // 8 = ground all atennas
            ant_switch_setantenna(8);
            return true;
        }

        if (strcmp(msg, "GET Antenna") == 0) {
            int selected_antenna = ant_switch_queryantenna();
            ext_send_msg(e->rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT Antenna=%d", selected_antenna);
            return true;
        }

    	return false;
}

void ant_switch_close(int rx_chan)
{
    // do nothing
}

void ant_switch_main();

ext_t ant_switch_ext = {
	"ant_switch",
	ant_switch_main,
	ant_switch_close,
	ant_switch_msgs,
};

void ant_switch_main()
{
	ext_register(&ant_switch_ext);
}
