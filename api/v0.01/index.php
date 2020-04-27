<?php

/**
 * The main index file for api on doc.onkspb.ru
 *
 * This is the most generic file for api on doc.onkspb.ru
 * It is used to display answer when queried.
 *
 **/

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");

$request = file_get_contents("php://input");
if (!isset($request) || $request=='') { $request = $HTTP_RAW_POST_DATA; }

//file_put_contents('1.txt',  print_r($_REQUEST,true) . print_r($request,true));

require_once 'docAPIClass.php';

try {
    $docapi = new docAPIClass();
    
    $request = json_decode($request);
    if (is_string($request)) { $request = json_decode($request); }
    if (!isset($request) || !is_object($request)) {
       $request = new stdClass(); 
    }
    
    if (isset($_REQUEST['cmd'])) { 
        $request->command = $_REQUEST['cmd']; 
        if ($request->command=='uploaddoc' && isset($_REQUEST['id'])) {
           $request->id = (int)$_REQUEST['id']; 
        }
    } 
    else { 
        if (!isset($request->command)) { $request->command = ''; }
    }

    
    $res =  $docapi->getResponse($request); 
    
    if (!is_object($res) && !is_array($res)) {
       if (!isset($res)) { throw new Exception('Response not found!'); }
       else  { throw new Exception($res); } 
    }
    
} catch (Exception $exc) {
    $res = new stdClass();
    $res->error = true;
    $res->message = $exc->getMessage();
}

echo json_encode($res);




