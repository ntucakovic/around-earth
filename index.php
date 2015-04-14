<?php

define('APP_ROOT', getcwd());

require 'vendor/autoload.php';
require 'backend/TleSource.php';

Twig_Autoloader::register();

// specify where to look for templates
$loader = new Twig_Loader_Filesystem('view');

// initialize Twig environment
// $twig = new Twig_Environment($loader);

$twig = new Twig_Environment($loader, array(
    'autoescape' => false
));

$twig->addFilter('var_dump', new Twig_Filter_Function('var_dump'));

// load template
$template = $twig->loadTemplate('index.html.twig');

if(!class_exists('Memcache')) {
    $satelliteList = array('ISS (ZARYA)');
} else {
    $tleSource = new TleSource();
    $satellites = $tleSource->getSatelliteList();
}

echo $template->render(array(
  'satelliteList' => $satelliteList,
  'satelliteCount' => count($satelliteList),
));

