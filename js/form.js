(function() {
	var form = $('#contact-form')
	var formResult = form.find('.form-result');
	var buttonText = 'Send';

	form.submit(function(e) {
		e.preventDefault();
		formResult.removeClass('success error');
		var data = form.serialize();

		loading(true);

		$.ajax({
			type: 'POST',
			url: form.attr('action'),
			data: data

		}).done(function(response) {
			loading(false);
			formResult.removeClass('error');
			formResult.addClass('success');
			formResult.text(response);

			//clear all fields in form
			form.find('input, textarea').val('');

		}).fail(function(data) {
			loading(false);
			formResult.removeClass('success');
			formResult.addClass('error');
			if(data.responseText !== '') {
				formResult.text(data.responseText);
			} else {
				formResult.text('Uh oh, something went wrong. Your message could not be sent');
			}
		});
	});

	function loading(bool) {
		if(bool) {
			form.find('.loader').show();
			form.find('button').text('');
		} else {
			form.find('.loader').hide();
			form.find('button').text(buttonText);
		}
	}
})();