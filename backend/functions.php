<?php

function get_satellites() {
  $memcache = new Memcache;
  $memcache->connect('localhost', 11211) or die ("Could not connect");


  $cached = $memcache->get('satellites')
  if($cached) {
    $rval = $cached;
  } else {
    $stations = file_get_contents(APP_ROOT . '/backend/stations.txt');
    $stations = explode("\n", $stations);

    $rval = array('stations' => array());
    foreach($stations as $station) {
    $firstChar = substr($station, 0, 1);
      if(!empty($station) && strcmp($firstChar, '1') && strcmp($firstChar, '2')) {
        $rval['stations'][] = trim($station);
      }
    }
    $memcache->set('satellites', $rval, false, time() + 300);
  }

  return $rval;
}
