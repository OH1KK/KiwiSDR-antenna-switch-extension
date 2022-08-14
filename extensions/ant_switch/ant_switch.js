// Copyright (c) 2018-2021 Kari Karvonen, OH1KK

var antsw = {
   not_configured: false,
   exantennas: 0,    // to avoid console.log spam on timer updates
   
   // ordering for backward compatibility with cfg.ant_switch.denyswitching
   deny_s: [ 'everyone', 'local connections only', 'local connections or user password only' ],
};

var ant_switch_ext_name = 'ant_switch';      // NB: must match ant_switch.c:ant_switch_ext.name
var ant_switch_first_time = true;
var ant_switch_poll_interval;

// initially set to blank so "extension not configured" condition can be detected
var ant_switch_denyswitching = ext_get_cfg_param_string('ant_switch.denyswitching', '', EXT_NO_SAVE);
antsw.not_configured = (ant_switch_denyswitching == '');
var ant_switch_denymixing = ext_get_cfg_param_string('ant_switch.denymixing', '', EXT_NO_SAVE);
var ant_switch_thunderstorm = ext_get_cfg_param_string('ant_switch.thunderstorm', '', EXT_NO_SAVE);

function ant_switch_main()
{
   ext_switch_to_client(ant_switch_ext_name, ant_switch_first_time, ant_switch_recv);     // tell server to use us (again)
   if (!ant_switch_first_time)
      ant_switch_controls_setup();
   ant_switch_first_time = false;
}

function ant_switch_recv(data)
{
   var firstChars = arrayBufferToStringLen(data, 3);
   
   // process data sent from server/C by ext_send_data_msg()
   if (firstChars == "DAT") {
      var ba = new Uint8Array(data, 4);
      var cmd = ba[0];
      console.log('ant_switch_recv: DATA UNKNOWN cmd='+ cmd +' len='+ (ba.length-1));
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
         case "Thunderstorm":
            var arg = param[1];
            if (arg == 1) {
               ant_switch_thunderstorm=1;
               ant_switch_denyswitching=1;
            } else {
                ant_switch_thunderstorm=0;
            }
            ant_switch_showpermissions();
            break;
         default:
            console.log('ant_switch_recv: UNKNOWN CMD '+ param[0]);
            break;
      }
   }
}

var ant_switch_n_ant = 8;
var ant_switch_url_ant = null;
var ant_switch_url_deselected = false;
var ant_switch_url_idx = 0;

var ant_switch_desc_lc = [];

function ant_switch_controls_setup()
{
  
   var buttons_html = '';
   var antdesc = [ ];
   var tmp;
   for (tmp=1; tmp <= ant_switch_n_ant; tmp++) antdesc[tmp] = ext_get_cfg_param_string('ant_switch.ant'+ tmp +'desc', '', EXT_NO_SAVE);
   console.log('ant_switch: Antenna configuration');
   var n_ant = 0;
   for (tmp = 1; tmp <= ant_switch_n_ant; tmp++) {
      if (antdesc[tmp] == undefined || antdesc[tmp] == null || antdesc[tmp] == '') {
         antdesc[tmp] = ''; 
      }  else {
         buttons_html += w3_div('w3-valign w3-margin-T-8',
            w3_button('', 'Antenna '+tmp, 'ant_switch_select_antenna_cb', tmp),
            w3_div('w3-margin-L-8', antdesc[tmp])
         );
         n_ant++;
      }
      ant_switch_desc_lc[tmp] = antdesc[tmp].toLowerCase();
      console.log('ant_switch: Antenna '+ tmp +': '+ antdesc[tmp]);
   }

   //console.log('ant_switch: Antenna g: Ground all antennas');
   var controls_html =
      w3_div('id-ant_display-controls w3-text-white',
         w3_div('',
              w3_div('w3-medium w3-text-aqua', '<b>Antenna switch</b>'),
                  w3_div('id-ant-display-selected w3-margin-T-8', 'Selected antenna: unknown'),
                  w3_div('id-ant-display-permissions', 'Permissions: unknown'),
                  w3_div('', buttons_html)
         )
      );

   ext_panel_show(controls_html, null, null);
   ext_set_controls_width_height(400, 90 + Math.round(n_ant * 40));
   ant_switch_poll();

	var p = ext_param();
	console.log('ant_switch: URL param = <'+ p +'>');
	if (p) {
	   ant_switch_url_ant = p.split(',');
	}
}

function ant_switch_blur()
{
   kiwi_clearInterval(ant_switch_poll_interval);
   //console.log('### ant_switch_blur');
}

// called to display HTML for configuration parameters in admin interface
function ant_switch_config_html()
{
   var s = '';
   for (var i = 1; i <= 8; i++) {
      s +=
         w3_col_percent('w3-margin-T-16/',
            w3_input_get('', 'Antenna '+ i +' description', 'ant_switch.ant'+ i +'desc', 'w3_string_set_cfg_cb', ''), 50,
            '&nbsp;', 5,
            w3_checkbox_get_param('//w3-label-inline', 'High-side injection', 'ant_switch.ant'+ i +'high_side', 'admin_bool_cb', false), 10,
            '&nbsp;', 3,
            w3_input_get('', 'Frequency scale offset (kHz)', 'ant_switch.ant'+ i +'offset', 'w3_int_set_cfg_cb', 0)
         );
   }

   // *_no_yes: 0 -> 'No', 1 -> 'Yes' in w3_switch() below
   var denyswitching = ext_get_cfg_param('ant_switch.denyswitching', '', EXT_NO_SAVE);
   if (denyswitching == '') denyswitching = 0;
   var denymixing_no_yes = ext_get_cfg_param('ant_switch.denymixing', '', EXT_NO_SAVE)? 0:1;
   var denymultiuser_no_yes = ext_get_cfg_param('ant_switch.denymultiuser', '', EXT_NO_SAVE)? 0:1;
   var thunderstorm_no_yes = ext_get_cfg_param('ant_switch.thunderstorm', '', EXT_NO_SAVE)? 0:1;

	   /*
         w3_div('','If antenna switching is denied then users cannot switch antennas. ' +
            'Admin can always switch antennas from KiwiSDR ssh root console using ' +
            '/root/extensions/ant_switch/frontend/ant-switch-frontend script.') +
         w3_div('w3-margin-T-8', '<b>Deny antenna switching?</b> ' +
            w3_switch('', 'No', 'Yes', 'ant_switch.denyswitching', denyswitching_no_yes, 'ant_switch_conf_denyswitching'));
	   */

   ext_admin_config(ant_switch_ext_name, 'Antenna switch',
      w3_div('id-ant_switch w3-text-teal w3-hide', '<b>Antenna switch configuration</b>' + '<hr>' +
         w3_div('',
            w3_div('', 'Version: 14 Aug 2022 <br><br>' +
               'If antenna switching is denied then users cannot switch antennas. <br>' +
               'Admin can always switch antennas, either from a connection on the local network, or from the <br>' +
               'KiwiSDR ssh root console using the script: <i>/root/extensions/ant_switch/frontend/ant-switch-frontend</i> <br>' +
               'The last option allows anyone connecting using a user password to switch antennas. <br>' +
               'Other connections made without passwords are denied.'
            ),
            w3_select('w3-width-auto w3-label-inline w3-margin-T-8|color:red', 'Allow antenna switching by:', '',
               'ant_switch.denyswitching', denyswitching, antsw.deny_s, 'ant_switch_deny_cb'
            ),

            w3_div('w3-margin-T-16','If antenna mixing is denied then users can select only one antenna at time.'),
            w3_div('w3-margin-T-8', '<b>Deny antenna mixing?</b> ' +
               w3_switch('', 'No', 'Yes', 'ant_switch.denymixing', denymixing_no_yes, 'ant_switch_conf_denymixing')
            ),

            w3_div('w3-margin-T-16','If multiuser is denied then antenna switching is disabled when more than 1 user is online.'),
            w3_div('w3-margin-T-8', '<b>Deny multiuser switching?</b> ' +
               w3_switch('', 'No', 'Yes', 'ant_switch.denymultiuser', denymultiuser_no_yes, 'ant_switch_conf_denymultiuser')
            ),

            w3_div('w3-margin-T-16','If thunderstorm mode is activated, all antennas and forced to ground and switching is disabled.'),
            w3_div('w3-margin-T-8', '<b>Enable thunderstorm mode?</b> ' +
               w3_switch('', 'No', 'Yes', 'ant_switch.thunderstorm', thunderstorm_no_yes, 'ant_switch_conf_thunderstorm')
            ),

            w3_div('','<hr><b>Antenna buttons configuration</b><br>'),
            w3_col_percent('w3-margin-T-16/',
               'Leave Antenna description field empty if you want to hide antenna button from users.', 70, '&nbsp;', 5,
               'Overrides offset value on config tab <br>when any antenna selected. <br>' +
               'No effect if antenna mixing enabled.'
            ),

            w3_div('',
               s,
               w3_col_percent('w3-margin-T-16/',
                  w3_input_get('', 'Antenna switch failure or unknown status decription', 'ant_switch.ant0desc', 'w3_string_set_cfg_cb', ''), 70
               )
            )
         )
      )
   );
}

function ant_switch_deny_cb(path, val, first) {
	console.log('ant_switch_deny_cb path='+ path +' val='+ val +' first='+ first);
	w3_int_set_cfg_cb(path, val);
}

function ant_switch_select_groundall(path,val) {
   setTimeout('w3_radio_unhighlight('+ q(path) +')', w3_highlight_time);
   ant_switch_select_antenna('g');
}

function ant_switch_select_antenna_cb(path, val) { ant_switch_select_antenna(val); }

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

var ant_switch_last_offset = -1;
var ant_switch_last_high_side = -1;

function ant_switch_process_reply(ant_selected_antenna) {
   var need_to_inform = false;
   //console.log('ant_switch_process_reply ant_selected_antenna='+ ant_selected_antenna);
   
   ant_switch_denyswitching = ext_get_cfg_param_string('ant_switch.denyswitching', '', EXT_NO_SAVE);
   if (antsw.not_configured) {
      ant_switch_display_update('Antenna switch extension is not configured.');
      return;
   }

   if (antsw.exantennas != ant_selected_antenna) {
      // antenna changed.
      need_to_inform = true;
      antsw.exantennas = ant_selected_antenna;
   }
   
   if (ant_selected_antenna == 'g') {
      if (need_to_inform) console.log('ant_switch: all antennas grounded');
      ant_switch_display_update('All antennas are grounded.');
   } else {
      if (need_to_inform) console.log('ant_switch: antenna '+ ant_selected_antenna +' in use');
      ant_switch_display_update('Selected antennas are now: '+ ant_selected_antenna);
   }
   
   // update highlight
   var selected_antennas_list = ant_selected_antenna.match(/([0-9])/g);
   var inputs = document.getElementsByTagName("button");
   for (var i = 0; i < inputs.length; i++) {
      var re=/^Antenna ([1-8])/i; 
      if (inputs[i].textContent.match(re)) {
         w3_unhighlight(inputs[i]);
         for (var tmp=1; tmp <= ant_switch_n_ant; tmp++) {
            var chr = String.fromCharCode(48 + tmp);
            if (selected_antennas_list != null && selected_antennas_list.indexOf(chr) >= 0) {
               if (inputs[i].textContent == 'Antenna '+tmp) {
                  w3_highlight(inputs[i]);
                  
                  // check for frequency offset and high-side injection change
                  // but only when one antenna is selected and mixing is disabled
                  if (ant_switch_denymixing && selected_antennas_list.length == 1) {
                     var s = 'ant_switch.ant'+ tmp +'offset';
                     var offset = ext_get_cfg_param(s, '', EXT_NO_SAVE);
                     offset = +offset;
                     if (!isNumber(offset)) offset = 0;
                     if (1||offset != ant_switch_last_offset) {
                        console.log('SET freq_offset='+ offset);
                        ext_send('SET freq_offset='+ offset);
                        ant_switch_last_offset = offset;
                     }

                     var s = 'ant_switch.ant'+ tmp +'high_side';
                     var high_side = ext_get_cfg_param(s, '', EXT_NO_SAVE);
                     if (1||high_side != ant_switch_last_high_side) {
                        console.log('SET high_side='+ high_side);
                        ext_send('SET high_side='+ (high_side? 1:0));
                        ant_switch_last_high_side = high_side;
                     }
                  }
               }
            }
         }
      }
   }

   // if switching is allowed process optional URL antenna list (includes multiuser feature)
   if (ant_switch_denyswitching == 0 && ant_switch_url_ant != null && ant_switch_url_ant.length > 0) {
   
      // Start by deselecting all antennas (backends may have memory of last antenna(s) used).
      // This code works because this routine is being routinely polled.
      if (ant_switch_url_deselected == false) {
         ant_switch_select_antenna('g');
         ant_switch_url_deselected = true;
      } else {
         // only allow first antenna if mixing denied
         if (ant_switch_url_idx == 0 || ant_switch_denymixing == 0) {
            var ant = decodeURIComponent(ant_switch_url_ant.shift());
            console.log('ant_switch: URL ant = <'+ ant +'>');
            var n = parseInt(ant);
            if (!(!isNaN(n) && n >= 1 && n <= ant_switch_n_ant)) {
               if (ant == '') {
                  n = 0;
               } else {
                  // try to match on antenna descriptions
                  ant = ant.toLowerCase();
                  for (n = 1; n <= ant_switch_n_ant; n++) {
                     //console.log('ant_switch: CONSIDER '+ n +' <'+ ant +'> <'+ ant_switch_desc_lc[n] +'>');
                     if (ant_switch_desc_lc[n].indexOf(ant) != -1)
                        break;
                  }
               }
            }
            if (n >= 1 && n <= ant_switch_n_ant)
               ant_switch_select_antenna(n);    // this causes poll to re-occur immediately
            ant_switch_url_idx++;
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
   if (antsw.not_configured) {
      w3_innerHTML('id-ant-display-permissions', '');
      return;
   }
   if (ant_switch_denyswitching == 1) {
      ant_switch_lock_buttons(true);
      html('id-ant-display-permissions').innerHTML = 'Antenna switching is denied';
   } else {
      ant_switch_lock_buttons(false);
      if (ant_switch_denymixing == 1) {
         html('id-ant-display-permissions').innerHTML = 'Antenna switching is allowed. Mixing is not allowed.';
      } else {
         html('id-ant-display-permissions').innerHTML = 'Antenna switching and mixing is allowed.';
      }
   }
   if (ant_switch_thunderstorm == 1) {
      ant_switch_lock_buttons(true);
      html('id-ant-display-permissions').innerHTML = 'Thunderstorm. Antenna switching is denied.';
   }
}

function ant_switch_display_update(ant) {
   html('id-ant-display-selected').innerHTML = ant;
}

function ant_switch_conf_denyswitching(id, idx) {
   var tmp = ext_set_cfg_param(id, idx, EXT_SAVE);
}

function ant_switch_conf_denymixing(id, idx) {
   var tmp = ext_set_cfg_param(id, idx, EXT_SAVE);
}

function ant_switch_conf_denymultiuser(id, idx) {
   var tmp = ext_set_cfg_param(id, idx, EXT_SAVE);
}

function ant_switch_conf_thunderstorm(id, idx) {
   var tmp = ext_set_cfg_param(id, idx, EXT_SAVE);
}

function ant_switch_help(show)
{
   if (show) {
      var s = 
         w3_text('w3-medium w3-bold w3-text-aqua', 'Antenna switch help') +
         '<br>Please see the information at ' +
         '<a href="https://github.com/OH1KK/KiwiSDR-antenna-switch-extension" target="_blank">' +
         'github.com/OH1KK/KiwiSDR-antenna-switch-extension</a><br><br>' +
         
         'When starting the extension from the browser URL the antenna(s) to select can be<br>' +
         'specified with a parameter, e.g. my_kiwi:8073/?ext=ant,6 would select antenna #6<br>' +
         'and my_kiwi:8073/?ext=ant,6,3 would select antennas #6 and #3 if antenna mixing<br>' +
         'is allowed.<br><br>' +
         
         'Instead of an antenna number a string can be specified that matches any<br>' +
         'case insensitive sub-string of the antenna description<br>' +
         'e.g. my_kiwi:8073/?ext=ant,loop would match the description "E-W Attic Loop ".<br>' +
         'The first description match wins.' +
         '';
      confirmation_show_content(s, 600, 250);
   }
   return true;
}
