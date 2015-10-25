<?php

send_mail();

function send_mail() {
	if ($_SERVER['REQUEST_METHOD'] == 'POST') {
		$name = strip_tags(trim($_POST['name']));
		// strip multilines
		$name = str_replace(array("\r","\n"),array(" "," "),$name);
		$email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
		$subject = strip_tags(trim($_POST['subject']));
		$message = trim($_POST['message']);

		if(empty($name) || empty($subject) || empty($message) ||
			!filter_var($email, FILTER_VALIDATE_EMAIL)) {
			//400 Bad Request
			http_response_code(400);
			echo 'There is a problem with your submission. Please fill out the form again.';
			exit();
		}

		$recipient = "eahenke@gmail.com";

		//Email content
		$email_content = "Name: $name\n";
		$email_content .= "Subject: $subject\n";
		$email_content .= "Email: $email \n\n";
		$email_content .= "Message: \n$message\n";

		//headers
		$email_header = "From: $name <$email>";
		// $from = "From: $email";

		//Send
		if(mail($recipient, $subject, $email_content, $email_header)) {
			//success
			http_response_code(200);
			echo "Success! Your message was sent.";
		} else {
			//server error
			http_response_code(500);
			echo "Uh oh, something went wrong. Your message could not be sent.";
		}

	} else {
		//In the case that it's not a post request - ie, direct url access, set code as forbidden and redirect to not found.
		http_response_code(403);
		// echo "There was a problem with your submission.  Please try again.";


		header("Location: /error-pages/404.html");
	}
}?>