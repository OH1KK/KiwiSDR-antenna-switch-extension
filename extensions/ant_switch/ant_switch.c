// Copyright (c) 2016 Kari Karvonen, OH1KK
//
// You need snmpget and snmpset external commands
//  sudo apt-get install snmp
#include "ext.h"	// all calls to the extension interface begin with "ext_", e.g. ext_register()

#ifndef EXT_ANT_SWITCH
	void ant_switch_main() {}
#else

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

static int exec_prog(const char **argv)
{
    pid_t   my_pid;
    int     status, timeout /* unused ifdef WAIT_FOR_COMPLETION */;

    if (0 == (my_pid = fork())) {
            if (-1 == execve(argv[0], (char **)argv , NULL)) {
                    perror("child process execve failed [%m]");
                    return -1;
            }
    }

    timeout = 1000;

    while (0 == waitpid(my_pid , &status , WNOHANG)) {
            if ( --timeout < 0 ) {
                    perror("timeout");
                    return -1;
            }
            sleep(1);
    }

    printf("%s WEXITSTATUS %d WIFEXITED %d [status %d]\n",
            argv[0], WEXITSTATUS(status), WIFEXITED(status), status);

    if (1 != WIFEXITED(status) || 0 != WEXITSTATUS(status)) {
            perror("%s failed, halt system");
            return -1;
    }

    return 0;
}

int ant_switch_queryantenna() {
	pid_t pid = 0;
	int pipefd[2];
	FILE* output;
	char line[256];
	int status;
	int n;
	int selectedantenna = 0;

	pipe(pipefd); //create a pipe
	pid = fork(); //span a child process
	if (pid == 0) {
		// Child. Let's redirect its standard output to our pipe and replace process with tail
		 close(pipefd[0]);
		 dup2(pipefd[1], STDOUT_FILENO);
		 dup2(pipefd[1], STDERR_FILENO);
		 execl("/usr/local/bin/ms-s7-web", "/usr/local/bin/ms-s7-web", "s", (char*) NULL);
	}

	//Only parent gets here. Listen to what the tail says
	close(pipefd[1]);
	output = fdopen(pipefd[0], "r");

	while(fgets(line, sizeof(line), output)) //listen to what tail writes to its standard output
	{
		n = sscanf(line, "Selected antenna: %d", &selectedantenna);
		/*
		if you need to kill the tail application, just kill it:
		if(something_goes_wrong) kill(pid, SIGKILL);
		*/
	}
	//or wait for the child process to terminate
	waitpid(pid, &status, 0);
	return(selectedantenna);
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

	if (strcmp(msg, "SET Antenna=1") == 0) {
        	const char *my_argv[128] = {"/usr/local/bin/ms-s7-web", "1", NULL};
        	int rc = exec_prog(my_argv);
        	return true;
	}
	if (strcmp(msg, "SET Antenna=2") == 0) {
        	const char *my_argv[128] = {"/usr/local/bin/ms-s7-web", "2", NULL};
        	int rc = exec_prog(my_argv);
        	return true;
	}
	if (strcmp(msg, "SET Antenna=3") == 0) {
        	const char *my_argv[128] = {"/usr/local/bin/ms-s7-web", "3", NULL};
        	int rc = exec_prog(my_argv);
        	return true;
	}
	if (strcmp(msg, "SET Antenna=4") == 0) {
        	const char *my_argv[128] = {"/usr/local/bin/ms-s7-web", "4", NULL};
        	int rc = exec_prog(my_argv);
        	return true;
	}
	if (strcmp(msg, "SET Antenna=5") == 0) {
        	const char *my_argv[128] = {"/usr/local/bin/ms-s7-web", "5", NULL};
        	int rc = exec_prog(my_argv);
        	return true;
	}
	if (strcmp(msg, "SET Antenna=6") == 0) {
        	const char *my_argv[128] = {"/usr/local/bin/ms-s7-web", "6", NULL};
        	int rc = exec_prog(my_argv);
        	return true;
	}
	if (strcmp(msg, "SET Antenna=7") == 0) {
        	const char *my_argv[128] = {"/usr/local/bin/ms-s7-web", "7", NULL};
        	int rc = exec_prog(my_argv);
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

#endif
