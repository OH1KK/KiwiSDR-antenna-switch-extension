// Copyright (c) 2018-2019 Kari Karvonen, OH1KK

#include "ext.h"	// all calls to the extension interface begin with "ext_", e.g. ext_register()

#include "kiwi.h"
#include "cfg.h"
#include "str.h"

#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <math.h>
#include <strings.h>
#include <sys/types.h>
#include <sys/wait.h>

//#define ANT_SWITCH_DEBUG_MSG	true
#define ANT_SWITCH_DEBUG_MSG	false

// rx_chan is the receiver channel number we've been assigned, 0..RX_CHAN
// We need this so the extension can support multiple users, each with their own ant_switch[] data structure.

struct ant_switch_t {
	u1_t rx_chan;
};

// Can't use RX_CHANS since 8-channel mode was introduced.
// But also can't use the new MAX_RX_CHANS because of the backward compatibility issue.
// So just define our own plausible maximum.
#define ANT_SW_MAX_RX_CHANS    32
static ant_switch_t ant_switch[ANT_SW_MAX_RX_CHANS];

char * ant_switch_queryantennas() {
	char *cmd, *reply;
	static char selected_antennas[256];
	int n;
	asprintf(&cmd, "/root/extensions/ant_switch/frontend/ant-switch-frontend s");
	reply = non_blocking_cmd(cmd, NULL);
	n = sscanf(kstr_sp(reply), "Selected antennas: %250s", selected_antennas);
	free(cmd);
	//printf("frontend: s n=%d reply=<%s>\n", n, kstr_sp(reply));
	if (!n) printf("ant_switch_queryantenna BAD STATUS? <%s>\n", kstr_sp(reply));
	kstr_free(reply);
	return(selected_antennas);
}

int ant_switch_setantenna(char* antenna) {
    char *cmd, *reply;
	int status;
	int n;
    asprintf(&cmd, "/root/extensions/ant_switch/frontend/ant-switch-frontend %s", antenna);
	//printf("frontend: %s\n", antenna);
	reply = non_blocking_cmd(cmd,NULL);
	free(cmd);
	kstr_free(reply);
	return(0);
}

int ant_switch_toggleantenna(char* antenna) {
    char *cmd, *reply;
	int status;
	int n;
    asprintf(&cmd, "/root/extensions/ant_switch/frontend/ant-switch-frontend t%s", antenna);
	//printf("frontend: t%s\n", antenna);
	reply = non_blocking_cmd(cmd, NULL);
	free(cmd);
	kstr_free(reply);
	return(0);
}

int ant_switch_validate_cmd(char *cmd) {
    return (cmd[0] >= '1' && cmd[0] <= '9');
}

bool ant_switch_read_denyswitching() {
    bool error;
    int result = cfg_int("ant_switch.denyswitching", &error, CFG_OPTIONAL);
    // error handling: if deny parameter is not defined, or it is 0, then switching is allowed
    if (result == 1) return true; else return false;
}

bool ant_switch_read_denymixing() {
    bool error;
    int result = cfg_int("ant_switch.denymixing", &error, CFG_OPTIONAL);
    // error handling: if deny parameter is not defined, or it is 0, then mixing is allowed
    if (result == 1) return true; else return false;
}

bool ant_switch_read_denymultiuser() {
    bool error;
    int result = cfg_int("ant_switch.denymultiuser", &error, CFG_OPTIONAL);
    // error handling: if deny parameter is not defined, or it is 0, then switching is allowed
    if (result == 1) {
        // option is set. Now check if more than 1 user online rx_util.cpp current_nusers variable
        if (current_nusers > 1) return true; else return false;
    } else {
        return false;
    }
}

bool ant_switch_read_thunderstorm() {
    bool error;
    int result = cfg_int("ant_switch.thunderstorm", &error, CFG_OPTIONAL);
    // error handling: if deny parameter is not defined, or it is 0, then mixing is allowed
    if (result == 1) return true; else return false;
}

bool ant_switch_msgs(char *msg, int rx_chan)
{
	ant_switch_t *e = &ant_switch[rx_chan];
	int n=0;
	char antenna[256];

	//rcprintf(rx_chan, "### ant_switch_msgs <%s>\n", msg);
	
	if (strcmp(msg, "SET ext_server_init") == 0) {
		e->rx_chan = rx_chan;	// remember our receiver channel number
		ext_send_msg(e->rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT ready");
		return true;
	}

    n = sscanf(msg, "SET Antenna=%s", antenna);
    if (n == 1) {
        rcprintf(rx_chan, "ant_switch: %s\n", msg);
        if (ant_switch_read_denyswitching()==true || ant_switch_read_denymultiuser()==true) {
            ext_send_msg(e->rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT AntennaDenySwitching=1");
            return true;            
        } else {
            ext_send_msg(e->rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT AntennaDenySwitching=0");                 
        }

        // FIXME: or toggle antenna if antenna mixing is allowed
        if (ant_switch_validate_cmd(antenna)) {
            if (ant_switch_read_denymixing() == 1) {
                ant_switch_setantenna(antenna);
            } else {
                ant_switch_toggleantenna(antenna);
            }
        } else {
            rcprintf(rx_chan, "ant_switch: Command not valid SET Antenna=%s", antenna);   
        }

        return true;
    }

    if (strcmp(msg, "GET Antenna") == 0) {
        char *selected_antennas = ant_switch_queryantennas();
        ext_send_msg(e->rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT Antenna=%s", selected_antennas);

        if (ant_switch_read_denyswitching()==true || ant_switch_read_denymultiuser()==true) {
            ext_send_msg(e->rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT AntennaDenySwitching=1");
        } else {
            ext_send_msg(e->rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT AntennaDenySwitching=0");
        }

        if (ant_switch_read_denymixing()==true) {
            ext_send_msg(e->rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT AntennaDenyMixing=1");
        } else {
            ext_send_msg(e->rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT AntennaDenyMixing=0");
        }
        if (ant_switch_read_thunderstorm()==true) {
            ext_send_msg(e->rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT Thunderstorm=1");
            // also ground antenna if not grounded
            if (strcmp(selected_antennas, "g")!=0)  {
                char* groundall=(char*)"g\0";
                ant_switch_setantenna(groundall);
                ext_send_msg(e->rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT Antenna=g");
            }
            return true;
        } else {
                ext_send_msg(e->rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT Thunderstorm=0");
        }
        return true;
    }

    int freq_offset_ant;
    n = sscanf(msg, "SET freq_offset=%d", &freq_offset_ant);
    if (n == 1) {
        rcprintf(rx_chan, "ant_switch: freq_offset %d\n", freq_offset_ant);
        cfg_set_float_save("freq_offset", (double) freq_offset_ant);
        freq_offset = freq_offset_ant;
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
