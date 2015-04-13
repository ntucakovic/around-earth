<?php

require 'vendor/autoload.php';

Twig_Autoloader::register();

// specify where to look for templates
$loader = new Twig_Loader_Filesystem('view');

// initialize Twig environment
$twig = new Twig_Environment($loader);

// load template
$template = $twig->loadTemplate('index.html.twig');

// set template variables
// render template
echo $template->render(array(
  'name' => 'Clark Kent',
  'username' => 'ckent',
  'password' => 'krypt0n1te',
));

