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

char * ant_switch_queryantennas() {
	char *cmd, *reply;
	static char selected_antennas[64 + SPACE_FOR_NULL];
	int n;
	asprintf(&cmd, "/root/extensions/ant_switch/frontend/ant-switch-frontend s");
	reply = non_blocking_cmd(cmd, NULL);
	n = sscanf(kstr_sp(reply), "Selected antennas: %64s", selected_antennas);
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
	reply = non_blocking_cmd(cmd, NULL);
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

bool ant_switch_read_denyswitching(int rx_chan) {
    bool deny = false;
    bool error;
    int deny_val = cfg_int("ant_switch.denyswitching", &error, CFG_OPTIONAL);
    
    #if (VERSION_MAJ > 1) || (VERSION_MAJ == 1 && VERSION_MIN >= 448)
        // values used by admin menu
        #define ALLOW_EVERYONE 0
        #define ALLOW_LOCAL_ONLY 1
        #define ALLOW_LOCAL_OR_PASSWORD_ONLY 2
        
        if (error) deny_val = ALLOW_EVERYONE;
        ext_auth_e auth = ext_auth(rx_chan);
        if (deny_val == ALLOW_LOCAL_ONLY && auth != AUTH_LOCAL) deny = true;
        if (deny_val == ALLOW_LOCAL_OR_PASSWORD_ONLY && auth == AUTH_USER) deny = true;
        //rcprintf(rx_chan, "ANTSW deny_val=%d auth=%d => deny=%d\n", deny_val, auth, deny);
    #else
        // error handling: if deny parameter is not defined, or it is 0, then switching is allowed
        if (error) deny_val = 0;
        deny = (deny_val == 1);
    #endif
    
    return (deny)? true : false;
}

bool ant_switch_read_denymixing() {
    int result = cfg_int("ant_switch.denymixing", NULL, CFG_OPTIONAL);
    // error handling: if deny parameter is not defined, or it is 0, then mixing is allowed
    if (result == 1) return true; else return false;
}

bool ant_switch_read_denymultiuser() {
    int result = cfg_int("ant_switch.denymultiuser", NULL, CFG_OPTIONAL);
    // error handling: if deny parameter is not defined, or it is 0, then switching is allowed
    if (result == 1) {
        // option is set. Now check if more than 1 user online rx_util.cpp current_nusers variable
        if (current_nusers > 1) return true; else return false;
    } else {
        return false;
    }
}

bool ant_switch_read_thunderstorm() {
    int result = cfg_int("ant_switch.thunderstorm", NULL, CFG_OPTIONAL);
    // error handling: if deny parameter is not defined, or it is 0, then mixing is allowed
    if (result == 1) return true; else return false;
}

bool ant_switch_msgs(char *msg, int rx_chan)
{
	int n=0;
	char antenna[256];

	//rcprintf(rx_chan, "### ant_switch_msgs <%s>\n", msg);
	
	if (strcmp(msg, "SET ext_server_init") == 0) {
		ext_send_msg(rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT ready");
		return true;
	}

    n = sscanf(msg, "SET Antenna=%s", antenna);
    if (n == 1) {
        //rcprintf(rx_chan, "ant_switch: %s\n", msg);
        if (ant_switch_read_denyswitching(rx_chan) == true || ant_switch_read_denymultiuser() == true) {
            ext_send_msg(rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT AntennaDenySwitching=1");
            return true;            
        } else {
            ext_send_msg(rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT AntennaDenySwitching=0");                 
        }

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
        ext_send_msg(rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT Antenna=%s", selected_antennas);

        // setup user notification of antenna change
        #if (VERSION_MAJ > 1) || (VERSION_MAJ == 1 && VERSION_MIN >= 449)
            static char last_selected_antennas[64];
            if (strncmp(selected_antennas, last_selected_antennas, 64)) {
                char *s;
                if (strcmp(selected_antennas, "g") == 0)
                    s = (char *) "All antennas now grounded.";
                else
                    s = stprintf("Selected antennas are now: %s", selected_antennas);
                static u4_t seq;
                ext_notify_connected(rx_chan, seq++, s);
                kiwi_strncpy(last_selected_antennas, selected_antennas, 64);
            }
        #endif

        if (ant_switch_read_denyswitching(rx_chan) == true || ant_switch_read_denymultiuser() == true) {
            ext_send_msg(rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT AntennaDenySwitching=1");
        } else {
            ext_send_msg(rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT AntennaDenySwitching=0");
        }

        if (ant_switch_read_denymixing() == true) {
            ext_send_msg(rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT AntennaDenyMixing=1");
        } else {
            ext_send_msg(rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT AntennaDenyMixing=0");
        }

        if (ant_switch_read_thunderstorm() == true) {
            ext_send_msg(rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT Thunderstorm=1");
            // also ground antenna if not grounded
            if (strcmp(selected_antennas, "g")!=0)  {
                char* groundall=(char*)"g\0";
                ant_switch_setantenna(groundall);
                ext_send_msg(rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT Antenna=g");
            }
            return true;
        } else {
                ext_send_msg(rx_chan, ANT_SWITCH_DEBUG_MSG, "EXT Thunderstorm=0");
        }

        return true;
    }

    int freq_offset_ant;
    n = sscanf(msg, "SET freq_offset=%d", &freq_offset_ant);
    if (n == 1) {
        //rcprintf(rx_chan, "ant_switch: freq_offset %d\n", freq_offset_ant);
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
