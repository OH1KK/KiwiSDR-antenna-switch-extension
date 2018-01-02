// Copyright (c) 2018 Kari Karvonen, OH1KK

var ant_switch_ext_name = 'ant_switch';		// NB: must match ant_switch.c:ant_switch_ext.name
var ant_switch_first_time = true;
var ant_switch_poll_interval;
var ant_switch_data_canvas;
var ant_switch_exantennas=0; // to avoid console.log spam on timerupdates
var ant_switch_denymixing = ext_get_cfg_param_string('ant_switch.denymixing', '', EXT_NO_SAVE);
var ant_switch_denyswitching = ext_get_cfg_param_string('ant_switch.denyswitching', '', EXT_NO_SAVE);

function ant_switch_main()
{
	ext_switch_to_client(ant_switch_ext_name, ant_switch_first_time, ant_switch_recv);		// tell server to use us (again)
	if (!ant_switch_first_time)
		ant_switch_controls_setup();
	ant_switch_first_time = false;
}

var ant_switch_cmd_e = { CMD1:0 };

function ant_switch_recv(data)
{
	var firstChars = arrayBufferToStringLen(data, 3);
	
	// process data sent from server/C by ext_send_data_msg()
	if (firstChars == "DAT") {
		var ba = new Uint8Array(data, 4);
		var cmd = ba[0];

		if (cmd == ant_switch_cmd_e.CMD1) {
			// do something ...
		} else {
			console.log('ant_switch_recv: DATA UNKNOWN cmd='+ cmd +' len='+ (ba.length-1));
		}
		return;
	}
	
	// process command sent from server/C by ext_send_msg() or ext_send_encoded_msg()
	var stringData = arrayBufferToString(data);
	var params = stringData.substring(4).split(" ");

	for (var i=0; i < params.length; i++) {
		var param = params[i].split("=");

		switch (param[0]) {

			case "ready":
				ant_switch_controls_setup();
				break;

			case "Antenna":
				var arg = param[1];
                                ant_switch_process_reply(arg);
				break;
                        case "AntennaDenySwitching":
                                var arg = param[1];
                                if (arg == 1) ant_switch_denyswitching=1; else ant_switch_denyswitching=0;
                                ant_switch_showpermissions();
                                break;
                        case "AntennaDenyMixing":
                                var arg = param[1];
                                if (arg == 1) ant_switch_denymixing=1; else ant_switch_denymixing=0;
                                ant_switch_showpermissions(); 
                                break;
			default:
				console.log('ant_switch_recv: UNKNOWN CMD '+ param[0]);
				break;
		}
	}
}

function ant_switch_controls_setup()
{
  
   var buttons_html = '';
   var antdesc = [ ];
   var tmp;
   for (tmp=1; tmp<9; tmp++) antdesc[tmp] = ext_get_cfg_param_string('ant_switch.ant'+tmp+'desc', '', EXT_NO_SAVE);
   console.log('ant_switch: Antenna configuration');
   for (tmp = 1; tmp<9; tmp++) {
           if (antdesc[tmp] == undefined || antdesc[tmp] == null || antdesc[tmp] == '') {
                antdesc[tmp] = ''; 
           }  else {
                buttons_html+=w3_divs('','', w3_inline('', '', w3_button('','Antenna '+tmp, 'ant_switch_select_'+tmp),antdesc[tmp]));
           }
           console.log('ant_switch: Antenna '+ tmp +': '+ antdesc[tmp]);
   }

   //buttons_html+=w3_inline('', '', w3_button('','Ground all', 'ant_switch_select_groundall'), 'Ground all antennas');
   //console.log('ant_switch: Antenna g: Ground all antennas');
   var data_html =
      '<div id="id-ant_switch-data"></div>';
	var controls_html =
		w3_divs('id-ant_display-controls w3-text-white', '',
			data_html,
        		w3_divs('w3-container', 'w3-tspace-8',
			        w3_divs('', 'w3-medium w3-text-aqua', '<b>Antenna switch</b>'),
                                w3_divs('id-ant-display-selected', '','Selected antenna: unknown'),
                                w3_divs('id-ant-display-permissions', '','Permissions: unknown'),
                                w3_divs('', '',buttons_html),
                                w3_divs('', '','')
                        )
		);

	ext_panel_show(controls_html, null, null);
        ant_switch_data_canvas = w3_el('id-ant_switch-data-canvas');
        ext_set_controls_width_height(400,330);
        ant_switch_poll();
}

function ant_switch_blur()
{
        kiwi_clearInterval(ant_switch_poll_interval);
	console.log('### ant_switch_blur');
}

// called to display HTML for configuration parameters in admin interface
function ant_switch_config_html()
{
        var denyswitching = ext_get_cfg_param('ant_switch.denyswitching', '', EXT_NO_SAVE);
        var denymixing = ext_get_cfg_param('ant_switch.denymixing', '', EXT_NO_SAVE);
	ext_admin_config(ant_switch_ext_name, 'Antenna switch',
		w3_divs('id-ant_switch w3-text-teal w3-hide', '',
			'<b>Antenna switch configuration</b>' +
			'<hr>' +
			w3_divs('', 'w3-container',
				w3_divs('', 'w3-margin-bottom',
                                        w3_divs('', '','If antenna switching is denied then users cannot switch antennas. Admin can always switch antennas from KiwiSDR ssh root console using /root/extensions/ant_switch/frontend/ant-switch-frontend script.'),
                                        w3_divs('', '', '<b>Deny antenna switching?</b> ' +
                                                w3_radio_btn('No', 'ant_switch.denyswitching', denyswitching? 0:1, 'ant_switch_conf_denyswitching') +
                                                w3_radio_btn('Yes', 'ant_switch.denyswitching', denyswitching? 1:0, 'ant_switch_conf_denyswitching')
                                        ),
                                        w3_divs('', '','If antenna mixing is denied then users can select only one antenna at time.'),
                                        w3_divs('', '', '<b>Deny antenna mixing?</b> ' +
                                                w3_radio_btn('No', 'ant_switch.denymixing', denymixing? 0:1, 'ant_switch_conf_denymixing') +
                                                w3_radio_btn('Yes', 'ant_switch.denymixing', denymixing? 1:0, 'ant_switch_conf_denymixing')
                                        ),
                                        w3_divs('', '','<b>Thunderstorm</b><br>'),
                                        w3_button('','Ground all antennas immediately and deny switching', 'ant_switch_thunderstorm'), 
                                        w3_divs('', '','<hr><b>Antenna buttons configuration</b><br>'),
                                        w3_divs('', '','Leave Antenna description field empty if you want to hide antenna button from users<br>'),
					w3_input_get_param('Antenna 1 description', 'ant_switch.ant1desc', 'w3_string_set_cfg_cb'),
					w3_input_get_param('Antenna 2 description', 'ant_switch.ant2desc', 'w3_string_set_cfg_cb'),
					w3_input_get_param('Antenna 3 description', 'ant_switch.ant3desc', 'w3_string_set_cfg_cb'),
					w3_input_get_param('Antenna 4 description', 'ant_switch.ant4desc', 'w3_string_set_cfg_cb'),
					w3_input_get_param('Antenna 5 description', 'ant_switch.ant5desc', 'w3_string_set_cfg_cb'),
					w3_input_get_param('Antenna 6 description', 'ant_switch.ant6desc', 'w3_string_set_cfg_cb'),
					w3_input_get_param('Antenna 7 description', 'ant_switch.ant7desc', 'w3_string_set_cfg_cb'),
					w3_input_get_param('Antenna 8 description', 'ant_switch.ant8desc', 'w3_string_set_cfg_cb'),
					w3_input_get_param('Antenna switch failure or unknown status decription', 'ant_switch.ant0desc', 'w3_string_set_cfg_cb')
				), '', ''
			)
		)
	);
}

function ant_switch_select_1(path,val) {
        ant_switch_select_antenna('1');
}
function ant_switch_select_2(path,val) {
        ant_switch_select_antenna('2');
}
function ant_switch_select_3(path,val) {
        ant_switch_select_antenna('3');
}
function ant_switch_select_4(path,val) {
        ant_switch_select_antenna('4');
}
function ant_switch_select_5(path,val) {
        ant_switch_select_antenna('5');
}
function ant_switch_select_6(path,val) {
        ant_switch_select_antenna('6');
}
function ant_switch_select_7(path,val) {
        ant_switch_select_antenna('7');
}
function ant_switch_select_8(path,val) {
        ant_switch_select_antenna('8');
}

function ant_switch_select_groundall(path,val) {
        setTimeout('w3_radio_unhighlight('+ q(path) +')', w3_highlight_time);
        ant_switch_select_antenna('g');
}

function ant_switch_select_antenna(ant) {
        console.log('ant_switch: switching antenna '+ant);
	ext_send('SET Antenna='+ant);
        ext_send('GET Antenna');
}

function ant_switch_poll() {
        kiwi_clearInterval(ant_switch_poll_interval);
        //ant_switch_poll_interval = setInterval(ant_switch_poll, 10000);
        ant_switch_poll_interval = setInterval(function() {ant_switch_poll(0);}, 10000);
        ext_send('GET Antenna');
}

function ant_switch_process_reply(ant) {
        ant_selected_antenna = ant;
        var need_to_inform = false;
        
        if (ant_switch_exantennas != ant) {
                // antenna changed.
                need_to_inform = true;
                ant_switch_exantennas = ant;
        }
        
        if (ant == 'g') {
                if (need_to_inform) console.log('ant_switch: all antennas grouded');
                ant_switch_display_update('Thunderstorm mode. All antennas are grounded.');
        } else {
                if (need_to_inform) console.log('ant_switch: antenna '+ ant_selected_antenna +' in use');
                ant_switch_display_update('Selected antennas are now: '+ant_selected_antenna);
        }

        // update highlight
	var selected_antennas_list = ant.match(/([0-9])/g);
        var inputs = document.getElementsByTagName("button");
        for (var i = 0; i < inputs.length; i++) {
                var re=/^Antenna ([1-8])/i; 
                if (inputs[i].textContent.match(re)) {
                        w3_unhighlight(inputs[i]);
                        for (var tmp=1; tmp<9; tmp++) {
                                var chr = String.fromCharCode(48 + tmp);
        		        if (selected_antennas_list != null && selected_antennas_list.indexOf(chr) >= 0) {
			                 if (inputs[i].textContent == 'Antenna '+tmp) w3_highlight(inputs[i]);
                                }
                        }
                }
	}
}

function ant_switch_lock_buttons(lock) {
        var inputs = document.getElementsByTagName("button");
        for (var i = 0; i < inputs.length; i++) {
                // ant 1-7
                var re=/^Antenna ([1-8])/i;
                if (inputs[i].textContent.match(re)) {
                        if (lock == true) {
                                inputs[i].disabled = true; 
                        } else {
                                inputs[i].disabled = false; 
                        }
                }
                // Ground All
                var re=/^Ground all$/i;
                if (inputs[i].textContent.match(re)) {
                        if (lock == true) {
                                inputs[i].disabled = true;
                        } else {
                                inputs[i].disabled = false; 
                        }
                }

        }                
}

function ant_switch_showpermissions() {
        if (ant_switch_denyswitching == 1) {
                ant_switch_lock_buttons(true);
                html('id-ant-display-permissions').innerHTML = 'Antenna switching is disabled by admin';
        } else {
                ant_switch_lock_buttons(false);
                if (ant_switch_denymixing == 1) {
                        html('id-ant-display-permissions').innerHTML = 'Antenna switching is allowed.';
                } else {
                        html('id-ant-display-permissions').innerHTML = 'Antenna switching and mixing is allowed.';
                }
        }
}

function ant_switch_display_update(ant) {
        // FIXME: How to notify other users about antenna changes?
        html('id-ant-display-selected').innerHTML = ant;
}

function ant_switch_conf_denyswitching(id, idx) {
        var tmp = ext_set_cfg_param(id, idx, EXT_SAVE);
}
function ant_switch_conf_denymixing(id, idx) {
        var tmp = ext_set_cfg_param(id, idx, EXT_SAVE);
}

function ant_switch_thunderstorm() {
        ext_set_cfg_param('ant_switch.denyswitching', 1, true);
        ant_switch_select_antenna('g');
}  
