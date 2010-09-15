function init_fairisle() {
	// Default screen resolution, in pixels per inch
	var resolution = 114;
	// Farbtastic colour picker
    var f = $.farbtastic('#picker');
    var p = $('#picker'); //.css('opacity', 0.25);
	// var selected;
	$.rule('.colour0{}').appendTo('style');
	$('.colorwell')
		.focus(function() {
			// deselect currently selected colorwell
			// if(selected) { $(selected).css('opacity', 1).removeClass('colorwell-selected'); }
			$('.colorwell').removeClass('colorwell-selected');
			// illuminate this colorwell
			var selected = this;
			$(selected).addClass('colorwell-selected');
			// callback when this colour is modified
			f.linkTo(function(c) {
				$.rule('.'+$(selected).attr('id'),'style').css('background-color',c).css('color',f.hsl[2] > 0.5 ? '#000' : '#fff');
				// $.rule('.'+$(selected).attr('id')+' { background-color: '+c+' }').appendTo('style');
				$(selected).val(c);
			});
			f.setColor($(selected).val());
		});
	// Select current_colour colorwell
    $('.colorwell').eq(0).focus().addClass('colour0');
	// Number of colours
	function num_colours() { return $('.colorwell').length; }
	// New colour
	function add_colour() {
		var newClass = 'colour'+num_colours();
		$.rule('.'+newClass+'{}').appendTo('style');
		var newColourSection = $('#settings_bar > #palette > p > .colorwell-selected').parent()
					.clone(true).css({'display': 'none', 'height': 'auto'}).insertBefore($('#settings_bar > #palette > p:last')).slideDown();
		newColourSection.children('.colorwell').eq(0).attr({id: newClass, name: newClass })
					.removeClass().addClass('colorwell').addClass(newClass)
					.focus()
					.prev('.rem_colour').show();
		return newColourSection;
	}
	function rem_colour() {
		if(confirm("Delete colour?")) {
			var button = this;
			var thisClass = $(button).next('.colorwell').attr('id');
			// Change all cells to use colour0
			$('#maingrid td.'+thisClass).removeClass(thisClass).addClass('colour0');
			// If colorwell is focused, change focus to previous colorwell
			if($(button).next('.colorwell').hasClass('colorwell-selected')) {
				$(button).parent().prevAll('p:visible').eq(0).children('.colorwell').eq(0).focus();
			}
			// Hide colorwell (removing it would change num_colours, so adding a new colour would overwrite colours after this one)
			$(button).parent().slideUp();
		}
	}
	$('#add_colour').click(add_colour);
	$('.rem_colour').click(rem_colour);
	$('.set_colour').click(function() { $(this).prev().focus(); });
	// Functions for resizing table
	function num_rows() { return $('#maingrid tr').length; }
	function num_cols() { return $('#maingrid td').length/num_rows(); }
	function redraw() {
		// Display
		var zoom = $('#zoom').val()/100.0;
		$('#maingrid').css('width',(zoom*resolution/(parseFloat($('#num_colgauge').val())/4.0)*num_cols()+50)+'px');
		$('#maingrid').css('height',(zoom*resolution/(parseFloat($('#num_rowgauge').val())/4.0)*num_rows())+'px');
		$('#maingrid tr').each( function(ndx) {$(this).children('th').text(ndx+1);} );
		$('#maingrid td').mousedown(function() { mouseisdown = true; $(this).removeClass().addClass($('.colorwell-selected').attr('id')); return false; });
		$('#maingrid td').mouseenter(function() { if(mouseisdown) { $(this).removeClass().addClass($('.colorwell-selected').attr('id')); } });
	}
	function set_maingrid() {
		// Apply table size modifications
		set_rows($('#num_rows').val());
		set_cols($('#num_cols').val());
		redraw();
	}
	function add_col() {
		$('#maingrid td:last').clone(true).insertBefore($('#maingrid tr th:odd')).removeClass().addClass('colour0');
		redraw();
	}
	function rem_col(i) {
		if(!i) {
			$('#maingrid tr th:odd').prev().remove();
		} else {
			$('#maingrid tr').each(function() {
				$(this).find('td:eq('+(parseInt(i)-1)+')').remove();
			});
			$('#num_cols').val(num_cols());
		}
		redraw();
	}
    // function add_row() { var nr=eval(num_rows()+1); $('#maingrid tr:last').clone(true).insertAfter($('#maingrid tr:last')).children('th').text(nr).siblings('td').removeClass().addClass('colour0'); }
	function add_row(i) {
		if(!i) {
			$('#maingrid tr:last').clone(true).insertAfter($('#maingrid tr:last'))
				.children('th').siblings('td').removeClass().addClass('colour0');
			$('#num_rows').val(num_rows());
		} else {
			$('#maingrid tr:last').clone(true).insertAfter($('#maingrid tr:eq('+(parseInt(i)-1)+')'))
				.children('th').siblings('td').removeClass().addClass('colour0');
			$('#num_rows').val(num_rows());
		}
		redraw();
	}
	function rem_row(i) {
		if(!i) {
			$('#maingrid tr:last').remove();
			$('#num_rows').val(num_rows());
		} else {
			$('#maingrid tr:eq('+(parseInt(i)-1)+')').remove();
			$('#num_rows').val(num_rows());
		}
		redraw();
	}
	// Add many rows at the same time
	function add_rows(n) {
		// Make text for a single row
		var cols = num_cols();
		var rowText = '<tr><th>&nbsp;</th>';
		for(var c=0; c<cols; c++) {
			rowText += '<td class="colour0">&nbsp;</td>';
		}
		rowText += '<th>&nbsp;</th></tr>';
		// Duplicate the row text n times
		var textToInsert = [];
		for(var r=0; r<n; r++) {
			textToInsert[r]  = rowText;
		}
		// Add the whole thing to the table
		$('#maingrid').append(textToInsert.join(''));
		// $('#testarea').val(textToInsert.join(''));
	}
	function rem_rows(n) { $('#maingrid tr').slice(-n).remove(); }
	function add_cols(n) {
		// Make text for additional cols in a single row
		var rowText = '';
		for(var c=0; c<n; c++) {
			rowText += '<td class="colour0">&nbsp;</td>';
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
		// var d = parseInt($('#num_rows').val()) - parseInt(num_rows());
		if(d>=0) {
			add_rows(d);
			// for(var i=0; i<d; i++) { add_row(); }
		} else {
			d = -d;
			rem_rows(d);
			// for(var i=0; i<d; i++) { rem_row(); }
		}
		$('#num_rows').val(n);
		if(do_redraw) { redraw(); }
	}
	function set_cols(n,do_redraw) {
		if(!do_redraw) { do_redraw = true; }
		var d = parseInt(n) - parseInt(num_cols());
		// var d = parseInt($('#num_cols').val()) - parseInt(num_cols());
		if(d>=0) {
			add_cols(d);
			// for(var i=0; i<d; i++) { add_col(); }
		} else {
			d = -d;
			rem_cols(d);
			// for(var i=0; i<d; i++) { rem_col(); }
		}
		$('#num_cols').val(n);
		if(do_redraw) { redraw(); }
	}
	// Functions to encode / decode saved patterns
	function encode_pattern() {
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
			"pattern": $('#maingrid td').map(
				function() {
					var nc=num_colours();
					for(var c=0; c<nc; c++) {
						if($(this).hasClass('colour'+c)) {
							return c;
						}
					}
				}).get()
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
		$('#colour0').focus();
		$('#settings_bar > #palette > p > .colorwell:not(#colour0)').parent().remove();
		$.each(patt.colours,function(i){
			if(i==0) {
				$('#colour0').val(patt.colours[i]).focus();
			} else {
				var newSec = add_colour();
				newSec.children('.colorwell').val(patt.colours[i]).attr('id','colour'+i).focus();
				if(!patt.visiblecolours[i]) { newSec.slideUp(); }
			}
		});
		// Set size
		// set_maingrid();
		// $('#progressbar_subsection').slideDown();
		set_rows(patt.rows,false);
		set_cols(patt.stitches,false);
		// Set pattern
		var num_cells = $('#maingrid td').length;
		$('#maingrid td').each(function(i) {
			$(this).removeClass().addClass('colour'+patt.pattern[i]);
		});
		// $('#progressbar_subsection').slideUp();
		redraw();
		return true;
	}
	// Buttons
	$('.button').mousedown(function() { return false; }); // prevent mousedowns from selecting text
	$('.inc').click(function() { var tbox=$(this).siblings('.tablesize:eq(0)'); tbox.val(parseInt(tbox.val())+1); tbox.focus(); });
	$('.dec').click(function() { var tbox=$(this).siblings('.tablesize:eq(0)'); tbox.val(parseInt(tbox.val())-1); tbox.focus(); });
	$('.double').click(function() { var tbox=$(this).siblings('.tablesize:eq(0)'); tbox.val(parseInt(tbox.val())*2.0); tbox.focus(); });
	$('.half').click(function() { var tbox=$(this).siblings('.tablesize:eq(0)'); tbox.val(parseInt(tbox.val())/2.0); tbox.focus(); });
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
	$('#insert_row').click(function(){ add_row($('#insert_row_after').val());	});
	$('#set_zoom').click(redraw);
	$('#set_colgauge').click(redraw);
	$('#set_rowgauge').click(redraw);
	$('input').click(function() { $(this).select(); });
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
	// Initialize table
	set_maingrid();
	redraw();
	// Initialize all table cells to have class colour0
	$('#maingrid td').addClass('colour0');
	// Functions for clicking on table cell
	var mouseisdown = false;
	$('body').mouseleave(function() { mouseisdown = false; });
	$('body').mouseup(function() { mouseisdown = false; });
	// set colour0 to white
	f.setColor('#ffffff');
	$('#colour0').prev('.rem_colour').hide();
	// Add one extra colour to start with
	add_colour();
	f.setColor('#334499');
	// Setup subsection and progressbar
	$('#progressbar').progressBar();
	$('#progressbar_subsection').hide();
	// $('#progressbar_subsection').modal();
}
