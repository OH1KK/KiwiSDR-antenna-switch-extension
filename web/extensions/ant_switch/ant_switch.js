// Copyright (c) 2016 Kari Karvonen, OH1KK

var ant_switch_ext_name = 'ant_switch';		// NB: must match ant_switch.c:ant_switch_ext.name

var ant_switch_first_time = true;

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
	var firstChars = getFirstChars(data, 3);
	
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
				var arg = String.fromCharCode(param[1]).charAt(0);
                                ant_switch_process_reply(arg);
				break;

			default:
				console.log('ant_switch_recv: UNKNOWN CMD '+ param[0]);
				break;
		}
	}
}

function ant_switch_controls_setup()
{
  
   var antdesc = [ ];
   antdesc[1] = ext_get_cfg_param_string('ant_switch.ant1desc', '');
   antdesc[2] = ext_get_cfg_param_string('ant_switch.ant2desc', '');
   antdesc[3] = ext_get_cfg_param_string('ant_switch.ant3desc', '');
   antdesc[4] = ext_get_cfg_param_string('ant_switch.ant4desc', '');
   antdesc[5] = ext_get_cfg_param_string('ant_switch.ant5desc', '');
   antdesc[6] = ext_get_cfg_param_string('ant_switch.ant6desc', '');
   antdesc[7] = ext_get_cfg_param_string('ant_switch.ant7desc', '');

   var buttons_html = ''
   
   var tmp;
   console.log('ant_switch: Antenna configuration');
   for (tmp = 1; tmp<8; tmp++) {
           if (antdesc[tmp] == undefined || antdesc[tmp] == null || antdesc[tmp] == '') {
                antdesc[tmp] = ''; 
           }  else {
                buttons_html+=w3_divs('','', w3_inline('', '', w3_btn('Antenna '+tmp, 'ant_switch_select_'+tmp),antdesc[tmp]));
           }
           console.log('ant_switch: Antenna '+ tmp +': '+ antdesc[tmp]);
   }

   buttons_html+=w3_inline('', '', w3_btn('Ground all', 'ant_switch_select_groundall'), 'Ground all antennas');
   console.log('ant_switch: Antenna g: Ground all antennas');
      
   var data_html =
      '<div id="id-ant_switch-data"></div>';
	var controls_html =
		w3_divs('id-ant_display-controls w3-text-white', '',
			data_html,
        		w3_divs('w3-container', 'w3-tspace-8',
			        w3_divs('', 'w3-medium w3-text-aqua', '<b>MS-S7-WEB Antenna switch</b>'),
                                w3_divs('id-ant-display-selected', '','Selected antenna: unknown'),
                                w3_divs('', '',buttons_html),
                                w3_divs('', '','')
                        )
		);

	ext_panel_show(controls_html, null, null);
	ant_switch_visible(1);
	ext_send('GET Antenna');
	ant_display_update();
}

function ant_switch_blur()
{
	console.log('### ant_switch_blur');
	ant_switch_visible(0);		// hook to be called when controls panel is closed
}

// called to display HTML for configuration parameters in admin interface
function ant_switch_config_html()
{
	ext_admin_config(ant_switch_ext_name, 'Antenna switch',
		w3_divs('id-ant_switch w3-text-teal w3-hide', '',
			'<b>MS-S7-WEB Antenna switch configuration</b>' +
			'<br/>Leave Antenna description field empty if you want to disable antenna' + 
			'<hr>' +
			w3_third('', 'w3-container',
				w3_divs('', 'w3-margin-bottom',
					w3_input_get_param('Antenna 1 description', 'ant_switch.ant1desc', 'admin_string_cb'),
					w3_input_get_param('Antenna 2 description', 'ant_switch.ant2desc', 'admin_string_cb'),
					w3_input_get_param('Antenna 3 description', 'ant_switch.ant3desc', 'admin_string_cb'),
					w3_input_get_param('Antenna 4 description', 'ant_switch.ant4desc', 'admin_string_cb'),
					w3_input_get_param('Antenna 5 description', 'ant_switch.ant5desc', 'admin_string_cb'),
					w3_input_get_param('Antenna 6 description', 'ant_switch.ant6desc', 'admin_string_cb'),
					w3_input_get_param('Antenna 7 description', 'ant_switch.ant7desc', 'admin_string_cb'),
					w3_input_get_param('Antenna switch failure or unknown status decription', 'ant_switch.ant0desc', 'admin_string_cb')
				), '', ''
			)
		)
	);
}

function ant_switch_visible(v)
{
	visible_block('id-ant_switch-data', v);
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

function ant_switch_select_groundall(path,val) {
        setTimeout('w3_radio_unhighlight('+ q(path) +')', w3_highlight_time);
        ant_switch_select_antenna('g');
}

function ant_switch_select_antenna(ant) {
        console.log('ant_switch: switching to antenna '+ant);
	ext_send('SET Antenna='+ant);
        ext_send('GET Antenna');
}

function ant_switch_process_reply(ant) {
        ant_selected_antenna = ant;
        
        for (var tmp=0; tmp<7; tmp++) {
                var elid='cl-id-btn-grp-'+tmp;
                if (w3_el_id(elid) !=  null) w3_unhighlight(elid);
        }

        if (ant == 'g') {
                console.log('ant_switch: all antennas grouded');
                ant_display_update('Thunderstorm mode. All antennas are grounded.');
        } else {
                console.log('ant_switch: antenna '+ ant_selected_antenna +' in use');
                ant_display_update('Antenna '+ant_selected_antenna + ": "+ext_get_cfg_param_string('ant_switch.ant'+ant_selected_antenna+'desc', ''));
                for (tmp=0; tmp<6; tmp++) {
                        if (ant == (tmp+1)) {
                                 var elid='cl-id-btn-grp-'+tmp;
                                 if (w3_el_id(elid) != null) w3_highlight(elid);
                        }
                }
        }
}

function ant_display_update(ant) {
        html('id-ant-display-selected').innerHTML = ant;
        var el = html('rx-antenna');
        if (el != undefined && ant) {
                el.innerHTML = ant;
        }
}
