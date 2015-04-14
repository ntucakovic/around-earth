<?php
header('Content Type: application/json');
header('Access-Control-Allow-Origin: *');

$satellite = escapeshellarg($_REQUEST['satellite']);
$userLatitude = escapeshellarg($_REQUEST['user_latitude']);
$userLongitude = escapeshellarg($_REQUEST['user_longitude']);
$userAltitude = escapeshellarg($_REQUEST['user_altitude']);

$tleSource = new TleSource();
$tle = $tleSource->getTle($satellite);
if(!$tle) {
	//error
}

echo shell_exec("python calculate.py $satellite $userLatitude $userLongitude $userAltitude {$tle['line1']} {$tle['line2']}");
