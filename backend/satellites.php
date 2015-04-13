<?php

$stations = file_get_contents('stations.txt');
$stations = explode("\n", $stations);

$rval = array('stations' => array());
foreach($stations as $station) {
  $firstChar = substr($station, 0, 1);
  if(!empty($station) && strcmp($firstChar, '1') && strcmp($firstChar, '2')) {
    $rval['stations'][] = trim($station);
  }
}

header('Content Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode($rval);



