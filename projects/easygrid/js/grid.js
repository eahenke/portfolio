(function() {
	"use strict";

	$(document).ready(function() {
		initialize();
		$("[type=range]").change(initialize);
		$("button").click(generate);
		$('.close').click(close);
		detectBrowser();

	});

	// Detects browser and displays a warning for Android's stock browser - 
	// it doesn't handle range inputs very well.
	function detectBrowser() {
		var ua = navigator.userAgent;
		var isNativeAndroid = ((ua.indexOf('Mozilla/5.0') > -1 && ua.indexOf('Android ') > -1 && ua.indexOf('AppleWebKit') > -1) && (ua.indexOf('Version') > -1));

		if(isNativeAndroid) {
			$('.android-warning').removeClass('hidden');
		}	
	}

	function close(event) {
		event.preventDefault();
		var warning = $(this).parents('.warning');
		$(warning).addClass('hidden');
	}

	function initialize() {
		$(".row").empty();

		output();

		var cols = $("[name=cols]").val()
		var gutter = $("[name=gutter]").val();
		var padding = $("[name=padding]").val();
		var rowGut = $("[name=rowGut]").val();
		var rowEls = $('.row');

		//1em arbitrarily 16px for this page.
		var gutterSize = gutter * 16;
		var paddingSize = padding * 16;
		var rowGutSize = rowGut * 16;


		//Calculate margins for gutter effect
		var totalWidth = $(".example").width();
		var totalHeight = $(".example").height();
		var totalMargin = (cols - 1) * gutterSize;
		var totalRowGut = (rowEls.length - 1) * rowGutSize;		
		
		/* Firefox and Chrome appear to round fractional pixels differently
			The one extra pixel there prevents the grid from breaking in Firefox
			and is (hopefully) barely noticable	 */ 
		var colWidth = ((totalWidth - totalMargin) - 1) / cols;
		var rowHeight = (totalHeight - totalRowGut) / rowEls.length;

		//Add the correct number of columns to each row
		rowEls.each(function(idx, row) {
			//push divs to array to save on DOM touches
			var divs = [];
			for(var i = 0; i < cols; i++) {
				var div = "<div><div></div></div>";
				divs.push(div);
			}
			$(row).append(divs.join(""));
		});


		var outer = $(".row > div");
		var inner = $(".row > div > div");
		//give width, height, padding, and margin
		outer.addClass("col-1").width(colWidth).height(rowHeight).css("marginRight", gutter + "em");
		outer.css("padding", padding + "em");

		rowEls.each(function(idx, row){
			//the first row shouldn't have a top margin
			if(idx != 0) {
				$(row).css('marginTop', rowGut + 'em');
			}
		});

		if(inner.width() <= 0) {
			$(inner).width(0);
			$(".size-warning").removeClass('hidden')
		} else {
			// $(".size-warning").addClass('hidden');
		}		
	}


	function output() {
		$(".output").each(function(index){

			var input = $(this).siblings("input");
			var output = input.val();

			//if padding or gutter
			if(input.attr("name") != "cols") {
				output += " em";
			}
			$(this).text(output);
		});
	}

	/* Select all text on click
	From http://stackoverflow.com/questions/1173194/select-all-div-text-with-single-mouse-click */
	function selectText(element) {
	    var doc = document,
			text = doc.getElementById(element),
			range,
			selection;

		if (doc.body.createTextRange) { //ms
		    range = doc.body.createTextRange();
		    range.moveToElementText(text);
		    range.select();
		} else if (window.getSelection) { //all others
			selection = window.getSelection();        
			range = doc.createRange();
			range.selectNodeContents(text);
			selection.removeAllRanges();
			selection.addRange(range);
    	}
    }

	function generate() {
		var cols = $("[name=cols]").val()
		var gutter = $("[name=gutter]").val();
		var padding = $("[name=padding]").val();
		var rowGut = $("[name=rowGut]").val();
		var url = "php/generate.php?cols=" + cols + "&gutters=" + gutter + "&pad=" + padding + "&row=" + rowGut;

		$.ajax({
			url: url,

			type: "GET",

			dataType: "html",

			success: function(html) {
				$(".grid-code").empty().append(html);
				$(".grid-code-wrap").show();
				$(".usage-wrap").show();
				//slow scroll to results
				$('html, body').animate({
    				scrollTop: $(".grid-code-wrap").offset().top
				}, 1000);
				//allow one-click text selection
				$(".grid-code, .usage").click(function() {
					var select = $(this).find("code");
					select = select.attr("id");
					selectText(select);
				});

			},

			error: function() {
				alert("There was an error communicating with the server");
			}
		});
	}

})();