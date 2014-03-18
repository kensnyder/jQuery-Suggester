<?php

$js = file_get_contents(dirname(__FILE__) . '/js/bodies.js');
$json = preg_replace('/^.*?\[/', '[', $js);
$data = json_decode($json);
$matches = array();
$i = 0;
foreach ($data as $body) {
	if (stripos($body->value, @$_GET['name']) !== false) {
		$matches[++$i] = $body;
	}
	if ($i >= 10) {
		break;
	}
}
header('Content-type: application/json');
echo json_encode($matches);
