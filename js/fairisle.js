function init_fairisle() {
	// Default screen resolution, in pixels per inch
	var resolution = 114;
	// Farbtastic colour picker
    var f = $.farbtastic('#picker');
    var p = $('#picker'); //.css('opacity', 0.25);
	// var selected;
	$.rule('.colour0{}').appendTo('style');
	// Number of colours
	function num_colours() { return $('.colorwell').length; }
	// New colour
	function add_colour(s) {
		var newClass = 'colour'+num_colours();
		$.rule('.'+newClass+'{}').appendTo('style');
		// var newColourSection = $('#settings_bar > #palette > p > .colorwell-selected').parent()
		var newColourSection = $('#settings_bar .colour_section').eq($('.colorwell').index($('.colorwell-selected'))).clone();
		if (!s) { var s = newColourSection.children('.colorwell').eq(0).val(); }
		newColourSection.css({'display':'none','height': 'auto'}).insertBefore($('#settings_bar > #palette > #add_colour_section'));
		newColourSection.children('.colorwell').eq(0).attr({id: newClass, name: newClass })
					.removeClass().addClass('colorwell').addClass(newClass).val(s)
                    .prev('.rem_colour').show();
		focus_colorwell($('#'+newClass));
		newColourSection.slideDown();
		return newColourSection;
	}
	function show_numbers() { $('#numbers_visible').val(1); $('#maingrid td').removeClass('transparent'); }
	function hide_numbers() { $('#numbers_visible').val(0); $('#maingrid td').addClass('transparent');    }
	function rem_colour() {
		if(confirm("Delete colour?")) {
			var button = this;
			var thisClass = $(button).next('.colorwell').attr('id');
			// Change all cells to use colour0
			var cells = $('#maingrid td.'+thisClass);
    		var num_cells = cells.length;
    		for(var i=0; i<num_cells; i++) {
    			cells.eq(i).removeClass('colour'+cells.eq(i).text()).addClass('colour0').text('0');
    		}
			// If colorwell is focused, change focus to previous colorwell
			if($(button).next('.colorwell').hasClass('colorwell-selected')) {
                // focus_colorwell($(button).parent().prevAll('p:visible').eq(0).children('.colorwell').eq(0));
                // 6 = length('colour')
				focus_colorwell($('#colour'+(parseInt(thisClass.slice(6))-1)));
			}
			// Hide colorwell (removing it would change num_colours, so adding a new colour would overwrite colours after this one)
			$(button).parent().slideUp();
		}
		return false;
	}
	// Functions for resizing table
	function num_rows() { return $('#maingrid tr').length; }
	function num_cols() { return $('#maingrid td').length/num_rows(); }
	function redraw() {
		// Display
		var zoom = $('#zoom').val()/100.0;
		$('#maingrid').css('width',(zoom*resolution/(parseFloat($('#num_colgauge').val())/4.0)*num_cols()+50)+'px');
		$('#maingrid').css('height',(zoom*resolution/(parseFloat($('#num_rowgauge').val())/4.0)*num_rows())+'px');
		$('#maingrid').css('font-size',zoom*100+"%");
		$('#maingrid tr').each( function(ndx) {$(this).children('th').text(ndx+1);} );
	}
	function rem_col(i) {
		if(!i) {
			alert('No stitch specified!');
			// $('#maingrid tr th:odd').prev().remove();
		} else {
			$('#maingrid tr').each(function() {
				$(this).find('td:eq('+(parseInt(i)-1)+')').remove();
			});
			$('#num_cols').val(num_cols());
		}
		redraw();
	}
	function add_row_after(i) {
		if(!i) {
			alert('No row specified!');
			// $('#maingrid tr:last').clone(true).insertAfter($('#maingrid tr:last'))
			// 	.children('th').siblings('td').removeClass().addClass('colour0');
			// $('#num_rows').val(num_rows());
		} else {
            // $('#maingrid tr:last').clone(true).insertAfter($('#maingrid tr:eq('+(parseInt(i)-1)+')'))
                // .children('th').siblings('td').removeClass().addClass('colour0');
            // $('#num_rows').val(num_rows());
            add_rows(1,i);
    		$('#num_rows').val(num_rows());
			redraw();
		}
	}
	function rem_row(i) {
		if(!i) {
			alert('No row specified!');
            // $('#maingrid tr:last').remove();
		} else {
			$('#maingrid tr:eq('+(parseInt(i)-1)+')').remove();
		}
		$('#num_rows').val(num_rows());
		redraw();
	}
	// Add many rows at the same time
	function add_rows(n,i) {
        // Are numbers transparent?
		var transClass;
		if($('#maingrid td:eq(1)').hasClass('transparent')) { 
		    transClass = ' transparent';
		} else {
		    transClass = '';
		}
		// Make text for a single row
		var cols = num_cols();
		var rowText = '<tr><th>&nbsp;</th>';
		for(var c=0; c<cols; c++) {
			rowText += '<td class="colour0'+transClass+'">0</td>';
		}
		rowText += '<th>&nbsp;</th></tr>';
		// Duplicate the row text n times
		var textToInsert = [];
		for(var r=0; r<n; r++) {
			textToInsert[r]  = rowText;
		}
		if(!i) {
    		// Add the whole thing to the table
    		$('#maingrid').append(textToInsert.join(''));
		} else {
		    $('#maingrid tr:eq('+(parseInt(i)-1)+')').after(textToInsert.join(''));
		}
		// $('#testarea').val(textToInsert.join(''));
	}
	function rem_rows(n) { $('#maingrid tr').slice(-n).remove(); }
	function add_cols(n) {
        // Are numbers transparent?
		var transClass;
		if($('#maingrid td:eq(1)').hasClass('transparent')) { 
		    transClass = ' transparent';
		} else {
		    transClass = '';
		}
		// Make text for additional cols in a single row
		var rowText = '';
		for(var c=0; c<n; c++) {
			rowText += '<td class="colour0'+transClass+'">0</td>';
		}
		// Insert the text into each row
		var rows = num_rows();
		for(var r=0; r<rows; r++) {
			$(rowText).insertBefore($('#maingrid tr:eq('+r+') th:eq(1)'))
		}
	}
	function rem_cols(n) {
		var rows = num_rows();
		for(var r=0; r<rows; r++) {
			$('#maingrid tr:eq('+r+') td').slice(-n).remove();
		}		
	}
	function set_rows(n,do_redraw) {
		if(!do_redraw) { do_redraw = true; }
		var d = parseInt(n) - parseInt(num_rows());
		if(d>=0) {
			add_rows(d);
		} else {
			d = -d;
			rem_rows(d);
		}
		$('#num_rows').val(n);
		if(do_redraw) { redraw(); }
	}
	function set_cols(n,do_redraw) {
		if(!do_redraw) { do_redraw = true; }
		var d = parseInt(n) - parseInt(num_cols());
		if(d>=0) {
			add_cols(d);
		} else {
			d = -d;
			rem_cols(d);
		}
		$('#num_cols').val(n);
		if(do_redraw) { redraw(); }
	}
	// Functions to encode / decode saved patterns
	function encode_pattern() {
		var pattern = [];
		var cells = $('#maingrid td');
		var num_cells = cells.length;
		for(var i=0; i<num_cells; i++) {
			pattern[i] = parseInt(cells.eq(i).text());
		}
		var patt = {
			// Pattern size
			"stitches": num_cols(), 
			"rows": num_rows(), 
			// Pattern gauge
			"colgauge": $('#num_colgauge').val(), 
			"rowgauge": $('#num_rowgauge').val(), 
			// Colours
			"colours": $('.colorwell').map(function() { return $(this).val(); }).get(),
			"visiblecolours": $('.colorwell').map(function() { return $(this).is(':visible'); }).get(),
			// Pattern serialized as an array
			"pattern": pattern,
			// "pattern": $('#maingrid td').map(
			// 	function() {
			// 		var nc=num_colours();
			// 		for(var c=0; c<nc; c++) {
			// 			if($(this).hasClass('colour'+c)) {
			// 				return c;
			// 			}
			// 		}
			// 	}).get()
			};
		return JSON.stringify(patt);
	}
	function decode_pattern(pattJSON) {
		if(pattJSON == '') { alert('Empty pattern!'); return false; }
		var patt = JSON.parse(pattJSON);
		// Pattern size
		// $('#num_cols').val(patt.stitches);
		// $('#num_rows').val(patt.rows);
		// Pattern gauge
		$('#num_colgauge').val(patt.colgauge);
		$('#num_rowgauge').val(patt.rowgauge);
		// Colours
		focus_colorwell($('#colour0'));
		$('#settings_bar > #palette > p > .colorwell:not(#colour0)').parent().remove();
		$.each(patt.colours,function(i){
			if(i>0) {
				var newSec = add_colour(patt.colours[i]);
    			if(!patt.visiblecolours[i]) { newSec.hide(); }
			} else {
            	$('#colour0').val(patt.colours[i]);
                focus_colorwell($('#colour0'));
                // f.setColor(patt.colours[i]);
			}
            // $('#colour'+i).val();
            // focus_colorwell($('#colour'+i));
		});
		// Set size
		set_cols(patt.stitches,false);
		set_rows(patt.rows,false);
		// Set pattern
		var cells = $('#maingrid td');
		var num_cells = cells.length;
		// $('#progressbar_subsection').slideDown();
		cells.removeClass();
		for(var i=0; i<num_cells; i++) {
			cells.eq(i).addClass('colour'+patt.pattern[i]).text(patt.pattern[i]);
		}
		if($('#numbers_visible').val()=="0") {
		    $('#maingrid td').addClass('transparent');
		}
		// $('#maingrid td').each(function(i) {
			// $(this).removeClass().addClass('colour'+patt.pattern[i]);
			// $('#progressbar').progressBar(100*i/num_cells);
		// });
		// $('#progressbar_subsection').slideUp();
		redraw();
		return true;
	}
	// Buttons
	$('.button').live('mousedown', function() { return false; }); // prevent mousedowns from selecting text
	$('.inc').live('click', function()    { var tbox=$(this).siblings('.tablesize:eq(0)'); tbox.val(parseInt(tbox.val())+1);   tbox.focus(); return false; });
	$('.dec').live('click', function()    { var tbox=$(this).siblings('.tablesize:eq(0)'); tbox.val(parseInt(tbox.val())-1);   tbox.focus(); return false; });
	$('.double').click(function() { var tbox=$(this).siblings('.tablesize:eq(0)'); tbox.val(parseInt(tbox.val())*2.0); tbox.focus(); });
	$('.half').click(function()   { var tbox=$(this).siblings('.tablesize:eq(0)'); tbox.val(parseInt(tbox.val())/2.0); tbox.focus(); });
	$('#set_cols').click(function() {
		var n = parseInt($('#num_cols').val());
		if(n>=num_cols() || confirm("Really delete some stitches?")) {
			set_cols(n);
		}
	});
	$('#rem_specific_col').click(function(){ rem_col($('#specific_col').val());	});
	$('#set_rows').click(function() {
		var n = parseInt($('#num_rows').val());
		if(n>=num_rows() || confirm("Really delete some rows?")) {
			set_rows(n);
		}
	});
	$('#rem_specific_row').click(function(){ rem_row($('#specific_row').val());	});
	$('#insert_row').click(function(){ add_row_after($('#insert_row_after').val());	});
	$('#set_zoom').click(redraw);
	$('#set_colgauge').click(redraw);
	$('#set_rowgauge').click(redraw);
	$('input').live('click', function() { $(this).select(); return false; });
	$('#add_colour').click( function() { add_colour(); } );
	$('.rem_colour').live('click', rem_colour);
	$('.set_colour').live('click', function() { $(this).prev().focus(); return false; });
	function focus_colorwell(selected) {
		// deselect currently selected colorwell
		// if(selected) { $(selected).css('opacity', 1).removeClass('colorwell-selected'); }
		$('.colorwell').removeClass('colorwell-selected');
		// illuminate this colorwell
        // var selected = this;
		$(selected).addClass('colorwell-selected');
		// callback when this colour is modified
		f.linkTo(function(c) {
			$.rule('.'+$(selected).attr('id'),'style').css('background-color',c).css('color',f.hsl[2] > 0.5 ? '#000' : '#fff');
			// $.rule('.'+$(selected).attr('id')+' { background-color: '+c+' }').appendTo('style');
			$(selected).val(c);
		});
		f.setColor($(selected).val());
	}
	$('.colorwell').live('click', function() { focus_colorwell(this); return false; });
	$('.colorwell').live('focus', function() { focus_colorwell(this); return false; } );
	$('textarea').click(function() { $(this).select(); });
	$('.tablesize').keypress(function(e) { if(e.which == 13) { $(this).siblings('.set:eq(0)').click(); $(this).select(); } });
	$('#load').click(function() { // from JSONcookie example
		if(confirm("Load new pattern?\nThis will overwrite the current pattern.")) { 
			decode_pattern($('#textbox').val());
			$('#textbox').val('');
		}
		// var name = $('#cookieName').val(),
		// o = $.JSONCookie(name);
		// $('#cookieObject').val('').val(JSON.stringify(obj));
		// return false;
	});
	$('#save').click(function() { // from JSONcookie example
		$('#textbox').val(encode_pattern());
		// var name = $('#cookieName').val(),
		// val = $('#cookieObject').val();
		// eval('obj = ' + val, window);
		// $.JSONCookie(name, obj, {path: '/'});
		// return false;
	});
	$('#show_numbers').click(show_numbers);
	$('#hide_numbers').click(hide_numbers);
	// Initialize table
	set_cols(30, false);
	set_rows(20, false);
	hide_numbers();
	redraw();
	// Initialize all table cells to have class colour0
	$('#maingrid td').addClass('colour0');
	// Functions for clicking on table cell
	var mouseisdown = false;
	var currcolourname;
	var currcolourid;
	$('#maingrid td').live('mousedown', function() {
		mouseisdown = true;
		currcolourname = $('.colorwell-selected').attr('id');
		currcolourid = currcolourname.slice(6);
		$(this).removeClass('colour'+$(this).text()).addClass(currcolourname).text(currcolourid);
		return false;
	});
	$('#maingrid td').live('mouseenter', function() {
		if(mouseisdown) {
            // var s = $('.colorwell-selected').attr('id');
			$(this).removeClass('colour'+$(this).text()).addClass(currcolourname).text(currcolourid);
		}
		return false;
	});
	$('#maingrid').bind('selectstart', function() {
		return false;
	});
	$('body').mouseleave(function() { mouseisdown = false; });
	$('body').mouseup(function() { mouseisdown = false; });
	// Select current_colour colorwell
    focus_colorwell($('#colour0'));
	// set colour0 to white
	f.setColor('#ffffff');
	// Add one extra colour to start with
	add_colour('#334499');
	$('#colour0').prev('.rem_colour').hide();
    // f.setColor();
	// Setup subsection and progressbar
	// $('#progressbar').progressBar();
	$('#progressbar_subsection').hide();
	// $('#progressbar_subsection').modal();
}
