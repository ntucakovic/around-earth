<?php

class TleSource
{
	const tleFile = 'stations.txt';
	const cacheLifeTime = 300;
	const memcacheHost = 'localhost';
	const memcachePort = 11211;

	private $memcache;

	function __construct($memcache) {
		$this->memcache = new Memcache;
		$success        = $this->memcache->connect(self::memcacheHost, self::memcachePort);
		if(!$success) {
			throw new Exception('Memcache could not connect.');
		}
	}

	public function getTle($satellite) {
		$cached = $this->memcache->get('tleList');
		if($cached) {
			$tleList = $cached;
		} else {
			$tleList = $this->parseTleFile();
			$this->memcache->set('tleList', $tleList['tleList'], false, time() + self::cacheLifeTime);
		}

		foreach($tleList as $tle) {
			if(strcmp($satellite, $tleList['name'])) {
				return $tleList;
			}
		}

		return false;
	}

	public function getSatelliteList() {
		$cached = $this->memcache->get('satelliteList');
		if($cached) {
			return $cached;
		}

		$result = $this->parseTleFile();
		$this->memcache->set('satelliteList', $result['satelliteList'], false, time() + self::cacheLifeTime);

		return $result['satelliteList'];
	}

	public function parseTleFile() {
		$stations      = file_get_contents(self::tleFile);
		$stations      = explode("\n", $stations);
		$satelliteList = array();
		$tleList       = array();
		foreach($stations as $key => $station) {
			$firstChar = substr($station, 0, 1);
			if(!empty($station) && strcmp($firstChar, '1') && strcmp($firstChar, '2')) {
				$satelliteList[] = trim($station);
				$tleList         = array(
					'name' => trim($station), 'line1' => trim($stations[$key + 1]), 'line2' => trim($stations[$key + 2]),
				);
			}
		}

		return array(
			'satelliteList' => $satelliteList, 'tleList' => $tleList
		);
	}

}
