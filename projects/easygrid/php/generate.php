<?php
	
$cols = $_GET["cols"];
$gutters = $_GET["gutters"];
$pad = $_GET["pad"];
$row = $_GET["row"];

?>

<pre>
	<code id="css">
	html {
		box-sizing: border-box;
	}

	*, *:before, *:after {
		box-sizing: inherit;
	}

	/* Only gutters between rows, not before the first or after the last */ 
	.row + .row {
		margin-top: <?=$row ?>em;
	}

	.row:before, .row:after {
		content: "";
		display: table;
		clear: both;
	}

	[class*='col-'] {
		float: left;
		min-height: 1px;
		padding-right: <?=$gutters ?>em;
	}

	[class*='col-']:last-of-type {
		padding-right: 0;
	}

	.column-content {
		height: 100%;
		width: 100%;
		padding: <?=$pad ?>em;
	}

	<?php
		for($i = 1; $i <= $cols; $i++) {
			$width = ((100 / $cols) * $i) . "%"; ?>
.col-<?=$i ?> {
	    width: <?=$width ?>;
	}

	<?php	} ?>
	</code>
</pre>