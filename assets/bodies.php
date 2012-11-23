<?php

$js = file_get_contents(dirname(__FILE__) . '/js/bodies.js');
$json = preg_replace('/^.*?\[/', '[', $js);
$data = json_decode($json);
$matches = array();
foreach ($data as $body) {
	if (stripos($body->label, @$_GET['name']) !== false) {
		$matches[] = $body;
	}
}
header('Content-type: application/json');
echo json_encode($matches);
