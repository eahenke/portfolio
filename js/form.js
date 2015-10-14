(function() {
	var form = $('#contact-form')
	var formResult = form.find('.form-result');

	form.submit(function(e) {
		e.preventDefault();
		formResult.removeClass('success error');
		var data = form.serialize();

		$.ajax({
			type: 'POST',
			url: form.attr('action'),
			data: data

		}).done(function(response) {
			formResult.removeClass('error');
			formResult.addClass('success');
			formResult.text(response);

			//clear all fields in form
			form.find('input, textarea').val('');

		}).fail(function(data) {
			formResult.removeClass('success');
			formResult.addClass('error');
			if(data.responseText !== '') {
				formResult.text(data.responseText);
			} else {
				formResult.text('Uh oh, something went wrong. Your message could not be sent');
			}
		});
	});
})();