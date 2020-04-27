<?php

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

require_once 'docAPIBaseInfo_2.php';

define('ONKERR_MESSAGENOAUTH','001 - Авторизация не пройдена!');
define('ONKERR_MESSAGEREQUESTFAIL','002 - Запрос не распознан!');
define('ONKERR_MESSAGEQUERYFAILED','003 - Данные из базы не получены!');
define('ONKERR_MESSAGEFORBIDDEN','004 - Действие запрещено!');
define('ONKERR_MESSAGELASTADMIN','005 - Нельзя удалить последнего администратора!');
define('ONKERR_MESSAGEEMPTYGROUP','006 - Нельзя задать пустую группу!');
define('ONKERR_MESSAGEEMPTYFILE','007 - Файл не найден!');


class docAPIClass {
   public $version = '0.01'; 
   public $con = false;
   
   function __construct() {
        $this->con = new PDO('mysql:host=' . ONKDB_HOST, ONKDB_USER, ONKDB_PASS,
                        array(PDO::ATTR_PERSISTENT => true,PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
        $this->con->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->con->exec("USE " . ONKDB_NAME);
   }
   
   private function intToDate($timestamp) {
       if ((int)$timestamp==0) { return ''; }
       
       return date('d.m.Y', (int)$timestamp);
   }
   
   private function rozhToDate($rozhdate) {
       $rozhdate = trim($rozhdate," \n\r\t");
       if ($rozhdate=='') { return ''; }
       
       $pieces = explode('/', $rozhdate);
       
       return implode('.', $pieces);
   }
    
   public function isLogin($role=0) {
        //return true;
        if (isset( $_SESSION['dacUserID']) && (int)$_SESSION['dacUserID']>0 && (int)$_SESSION['dacUserRole']>=(int)$role) { return true; }
        else { return false; }
   }
   
   public function getCurrentUser() {
       return (int)$_SESSION['dacUserID']; 
   }
   
   public function checkUserByRole($id) {
       if ($this->isLogin()!=true) { return 0; }
       if ($this->getCurrentUser()!=(int)$id && (int)$_SESSION['dacUserRole']<1) { return 0; }
       
       $query = 'select * from ' . ONKDB_PREFIX . 'users  where ID=\'' . (int)$id . '\'';
       $rows = $this->con->query($query);
       if (!$rows) return 0;
       
       $row = $rows->fetch(PDO::FETCH_OBJ);
       
       if (!$row) { return 0; }
       else { return $row->ID; }
   }
   
   public function getResponse($request) {
       
       //if ($this->isLogin()!=true) { return ONKERR_MESSAGENOAUTH; }
       if (!isset($request) || !is_object($request)) { return ONKERR_MESSAGEREQUESTFAIL; }
       
       $request->command = mb_strtolower($request->command);
       
       if ($request->command=='logout') { return $this->logOut(); }
       if ($request->command=='login') { return $this->logIn($request); }
       if ($request->command=='deleteuser') { return $this->deleteUser($request); }
       if ($request->command=='user') { return $this->getUsers($request->id); }
       if ($request->command=='useredit') { return $this->getUserEdit($request); }
       if ($request->command=='messages') { return $this->getMessages(0,$request->limit); }
       if ($request->command=='users') { return $this->getUsers(0,$request->limit); }
       
       if ($request->command=='compalintstype') { return $this->getCompalintsType($request->id,$request->limit); }
       if ($request->command=='compalintstypeedit') { return $this->getCompalintsTypeEdit($request); }
       
       if ($request->command=='compalintsstatus') { return $this->getCompalintsStatus($request->id,$request->limit); }
       if ($request->command=='compalintsstatusedit') { return $this->getCompalintsStatusEdit($request); }
       
       if ($request->command=='penitentiaries') { return $this->getPenitentiaries($request->id,$request->limit); }
       if ($request->command=='penitentiariesedit') { return $this->getPenitentiariesEdit($request); }
       
       if ($request->command=='complaints') { return $this->getComplaints($request->id,$request->limit,$request); }
       if ($request->command=='compalintsedit') { return $this->getCompalintsEdit($request); }
       

       if ($request->command=='uploaddoc') { return $this->getSaveDoc($request); }
       if ($request->command=='deletedoc') { return $this->getDelDoc($request); }

       /*========================================= New Code =============================================*/

       if ($request->command == "all_messages") { return $this->getAllMessages(); }
       if ($request->command == "all_docs") { return $this->getAllDocs(); }
       if ($request->command == "all_comments") { return $this->getAllComments(); }
       
       return ONKERR_MESSAGEQUERYFAILED;
   }
   
   private function addslashes($str) {
       $str = preg_replace("/(select|update|insert|right|left|join)/imsu", '###', $str);
       $str = addslashes($str);
       
       return $str;
   }
   
   public function logOut() {
       unset($_SESSION['dacUserRole']);
       unset($_SESSION['dacUserID']);
       unset($_SESSION['dacUserInfo']);
       
       $res = new stdClass();
       $res->error = false;
       
       return $res;
   }
   
   public function logIn($request) {
       $this->logOut();
       
       $query = 'select * from ' . ONKDB_PREFIX . 'users  where STATUS=0 and EMAIL=\'' . $this->addslashes($request->username) . '\' and PASSWORD=\'' . $this->addslashes($request->password) . '\' limit 1';
       $rows = $this->con->query($query);
       if (!$rows) return ONKERR_MESSAGEQUERYFAILED;
       
       $found = false;
       while ($row = $rows->fetch(PDO::FETCH_OBJ)){
          $found = true;
           
          break;
       }
       
       if (!$found || !$row) {
           $res = ONKERR_MESSAGENOAUTH;
       } else {
           $res = new stdClass();
           $res->error = false;
           
           $row->fio = '';
           if (isset($row->LAST_NAME) && trim($row->LAST_NAME)!='') { $row->fio = trim($row->LAST_NAME); }
           if (isset($row->FATHER_NAME) && trim($row->FATHER_NAME)!='') { $row->fio = trim($row->FATHER_NAME) . ' ' . $row->fio; }
           if (isset($row->FIRST_NAME) && trim($row->FIRST_NAME)!='') { $row->fio = trim($row->FIRST_NAME) . ' ' . $row->fio; }
           
           $res->fio = $row->fio;
           $res->id = $row->ID;
           $res->role = $row->role;
           
           $_SESSION['dacUserID'] = $row->ID;
           $_SESSION['dacUserRole'] = $row->role;
           $_SESSION['dacUserInfo'] = serialize($row);
       }    
       
       return $res;
   }
   
    function fix_filename($str, $transliteration, $convert_spaces = false, $replace_with = "_", $is_folder = false)
    {
            if ($convert_spaces)
            {
                    $str = str_replace(' ', $replace_with, $str);
            }

            if ($transliteration)
            {
                    if (function_exists('transliterator_transliterate'))
                    {
                             $str = transliterator_transliterate('Accents-Any', utf8_encode($str));
                    }
                    else
                    {
                            $str = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $str);
                    }

                    $str = preg_replace("/[^a-zA-Z0-9\.\[\]_| -]/", '', $str);
            }

            $str = str_replace(array( '"', "'", "/", "\\" ), "", $str);
            $str = strip_tags($str);

            // Empty or incorrectly transliterated filename.
            // Here is a point: a good file UNKNOWN_LANGUAGE.jpg could become .jpg in previous code.
            // So we add that default 'file' name to fix that issue.
            if (strpos($str, '.') === 0 && $is_folder === false)
            {
                    $str = 'file' . $str;
            }

            return trim($str);
    }

   public function getDelDoc($request) {
       if ($this->isLogin()!=true) { return ONKERR_MESSAGENOAUTH; }

        $query = 'select * from ' . ONKDB_PREFIX . 'docs where ID=' . (int)$request->id;
        $rows = $this->con->query($query);
        while ($row = $rows->fetch(PDO::FETCH_OBJ)){
           $todir = dirname(__FILE__) . '/../../upload/files/';
           $targetFile = $todir . $row->NAME;
           unlink($targetFile);
        }
                
        $query = 'delete from ' . ONKDB_PREFIX . 'docs where ID=' . (int)$request->id;
        $cnt = $this->con->exec($query);

        $res = new stdClass();
        $res->error = false;
        $res->rowsUpdated = $cnt;
        
        return $res;
   }
   
   public function getSaveDoc($request) {
       if ($this->isLogin()!=true) { return ONKERR_MESSAGENOAUTH; }

       if (!isset($_FILES['file']) || $_FILES['file']['error'] != 0) { return ONKERR_MESSAGEEMPTYFILE; }  
       
       
       if ((int)$_SESSION['dacUserRole']<1) {
        //$query = 'select count(*) as cnt from ' . ONKDB_PREFIX . 'complaint where ';
       }
       
       $filename = $_FILES['file']['name'];
       $tempFile = $_FILES['file']['tmp_name'];
       $tofile = $this->fix_filename($filename,true,true);
       $t1ofile = $tofile;
       $todir = dirname(__FILE__) . '/../../upload/files/';
       $targetFile = $todir . $tofile; $idx = 1;
       while (file_exists($targetFile)) {
           $t1ofile = $idx . '_' . $tofile;
           $targetFile = $todir . $t1ofile;
           $idx++;
       }
       if (!move_uploaded_file($tempFile,$targetFile)) { return ONKERR_MESSAGEEMPTYFILE; }
       chmod($targetFile, 0755);
       
        $query = 'insert into ' . ONKDB_PREFIX . 'docs set NAME="' . $this->addslashes($t1ofile) . '",ORIGINAL_NAME="' . $this->addslashes($filename) . '",COMPLAINT_ID="' . (int)$request->id . '",'
                .                                'USER_ID="' . (int)$_SESSION['dacUserID'] . '"';
        $cnt = $this->con->exec($query);

        $res = new stdClass();
        $res->error = false;
        $res->rowsUpdated = $cnt;
        $res->insertedID = $this->con->lastInsertId();
        
        return $res;
}

   public function getUserEdit($request) {
       if ($this->isLogin()!=true) { return ONKERR_MESSAGENOAUTH; }
       
       if (!isset($request) || !isset($request->method) || !in_array($request->method, array('update','insert','delete'))) { return ONKERR_MESSAGEREQUESTFAIL; }

       if ((int)$request->id!=$this->getCurrentUser() && (int)$_SESSION['dacUserRole']<1) { return ONKERR_MESSAGEFORBIDDEN; }
       
       $setfieldsarr = $request->setfields;
        $setfields = '';
       if (isset($setfieldsarr)) { 
        if (isset($setfieldsarr->uemail)) { $setfields .= ' EMAIL=\''. $this->addslashes($setfieldsarr->uemail) . '\','; unset($setfieldsarr->uemail); }
        if (isset($setfieldsarr->uname)) {
            $fio = array_filter(explode(' ', $setfieldsarr->uname));
            $name = array_shift($fio);
            if (isset($name)) { $setfields .= ' FIRST_NAME=\''. $this->addslashes($name) . '\','; }
            $name = array_shift($fio);
            if (isset($name)) { $setfields .= ' FATHER_NAME=\''. $this->addslashes($name) . '\','; }
            $name = array_shift($fio);
            if (isset($name)) { $setfields .= ' LAST_NAME=\''. $this->addslashes($name) . '\','; }
             unset($setfieldsarr->uname);
        }
        if (isset($setfieldsarr->ulocation)) { $setfields .= ' location=\''. $this->addslashes($setfieldsarr->ulocation) . '\','; unset($setfieldsarr->ulocation); }
        if (isset($setfieldsarr->uabout)) { $setfields .= ' about=\''. $this->addslashes($setfieldsarr->uabout) . '\','; unset($setfieldsarr->uabout); }
        if (isset($setfieldsarr->uvk)) { $setfields .= ' vk=\''. $this->addslashes($setfieldsarr->uvk) . '\','; unset($setfieldsarr->uvk); }
        if (isset($setfieldsarr->uphone)) { $setfields .= ' phone=\''. $this->addslashes($setfieldsarr->uphone) . '\','; unset($setfieldsarr->uphone); }
        if (isset($setfieldsarr->uuserpic)) {
          $setfields .= ' userpic=\''. $this->addslashes($setfieldsarr->uuserpic) . '\',';
          unset($setfieldsarr->uuserpic); 
         }

         foreach ($setfieldsarr as $key => $value) {
             if (mb_strtolower($key)=='id') { continue; }
             $setfields .= ' `'. $this->addslashes($key) . '`=\''. $this->addslashes($value) . '\',';
         }

         $setfields = trim($setfields," ,");
       }
       
       switch ($request->method) {
           case 'update':
                if ($setfields=='') { return ONKERR_MESSAGEREQUESTFAIL; }
                $query = 'update ' . ONKDB_PREFIX . 'users set ' . $setfields . ' where ID=' . (int)$request->id;
                $cnt = $this->con->exec($query);
                $res = new stdClass();
                $res->error = false;
                $res->rowupdated = $cnt;
               break;

           case 'insert':
                if ($setfields=='') { return ONKERR_MESSAGEREQUESTFAIL; }
                $query = 'insert into ' . ONKDB_PREFIX . 'users set ' . $setfields;
                $cnt = $this->con->exec($query);
                
                $res = new stdClass();
                $res->error = false;
                $res->rowsUpdated = $cnt;
                $res->insertedID = $this->con->lastInsertId();
               break;
               
           case 'delete':
               
                $query = 'select count(*) as cnt from ' . ONKDB_PREFIX . 'users where role=2 and STATUS=0 and ID<>' . (int)$request->id;
                $rows = $this->con->query($query);
                if (!$rows) return ONKERR_MESSAGEQUERYFAILED;
                $row = $rows->fetch(PDO::FETCH_OBJ);
                if (!$row) return ONKERR_MESSAGEQUERYFAILED;
                
                if ($row->cnt<1) return ONKERR_MESSAGELASTADMIN;
           
                $query = 'delete from ' . ONKDB_PREFIX . 'users where ID=' . (int)$request->id;
                $cnt = $this->con->exec($query);
                
                $res = new stdClass();
                $res->error = false;
                $res->rowsUpdated = $cnt;
               break;
           default:
                return ONKERR_MESSAGEREQUESTFAIL;
               break;
       }
       
       return $res;
   }
   
   public function deleteUser($request) {
       if ($this->isLogin()!=true) { return ONKERR_MESSAGENOAUTH; }
       
       if (!isset($request) || (int)$request->id<1) { return ONKERR_MESSAGEREQUESTFAIL; }

       if ((int)$request->id!=$this->getCurrentUser() && (int)$_SESSION['dacUserRole']<1) { return ONKERR_MESSAGEFORBIDDEN; }
       
                $query = 'select count(*) as cnt from ' . ONKDB_PREFIX . 'users where role=2 and STATUS=0 and ID<>' . (int)$request->id;
                $rows = $this->con->query($query);
                if (!$rows) return ONKERR_MESSAGEQUERYFAILED;
                $row = $rows->fetch(PDO::FETCH_OBJ);
                if (!$row) return ONKERR_MESSAGEQUERYFAILED;
                
                if ($row->cnt<1) return ONKERR_MESSAGELASTADMIN;
       
       $outdata = new stdClass();
       $outdata->method = 'update';
       $outdata->id = (int)$request->id;
       $outdata->setfields = new stdClass();
       $outdata->setfields->STATUS = 1;
       
       return $this->getUserEdit($outdata);
   }
   
   public function getPenitentiaries($id=0,$limit='') {
       if ($this->isLogin(0)!=true) { return ONKERR_MESSAGENOAUTH; }
       
       $where = '';
       
       if ((int)$id>0) { $where = 'where u.ID='. (int)$id; } 
       
       if (!isset($limit)) { $limit = ''; }
       if ($limit!='') { $limit = ' limit ' . $this->addslashes($limit); }
       
       $query = 'select * from ' . ONKDB_PREFIX . 'uch_groups  order by NAME';
       $rows = $this->con->query($query);
       if (!$rows) return ONKERR_MESSAGEQUERYFAILED;
       $resg = array();
       while ($row = $rows->fetch(PDO::FETCH_OBJ)){
           $r = new stdClass();
           $r->id = $row->ID;
           $r->name = $row->NAME;
           array_push($resg,$r);
       }    
       
       
       $query = 'select u.*,ug.NAME as groupname from ' . ONKDB_PREFIX . 'uch u left join ' . ONKDB_PREFIX . 'uch_groups ug on u.GROUP_ID=ug.ID ' . $where . ' order by ug.NAME, u.NAME ' . $limit;
       $rows = $this->con->query($query);
       if (!$rows) return ONKERR_MESSAGEQUERYFAILED;
       $res = array();
       while ($row = $rows->fetch(PDO::FETCH_OBJ)){
           $r = new stdClass();
           $r->id = $row->ID;
           $r->name = $row->NAME;
           $r->groupid = $row->GROUP_ID;
           $r->groupname = $row->groupname;
           array_push($res,$r);
       }    
       
       $r = new stdClass();
       $r->groups = $resg;
       $r->rows = $res;
       return $r;
   }
   
   public function getPenitentiariesEdit($request) {
       if ($this->isLogin(1)!=true) { return ONKERR_MESSAGENOAUTH; }
       
       if (!isset($request) || !isset($request->method) || !in_array($request->method, array('update','insert','delete'))) { return ONKERR_MESSAGEREQUESTFAIL; }

       if ((int)$_SESSION['dacUserRole']<1) { return ONKERR_MESSAGEFORBIDDEN; }
       
       $setfieldsarr = $request->setfields;
        $setfields = '';
       if (isset($setfieldsarr)) { 

         foreach ($setfieldsarr as $key => $value) {
             $value = trim($value);
             if (mb_strtolower($key)=='id') { continue; }
             if (mb_strtolower($key)=='groupname') {
                if (mb_strtolower($value)=='' || mb_strtolower($value)=='null' || mb_strtolower($value)=='undefined') { return ONKERR_MESSAGEEMPTYGROUP; } 
               $query = 'select * from ' . ONKDB_PREFIX . 'uch_groups where LOWER(NAME)=LOWER(\''. $this->addslashes($value) . '\') limit 1';
               $rows = $this->con->query($query);
               if (!$rows) return ONKERR_MESSAGEQUERYFAILED;
               $row = $rows->fetch(PDO::FETCH_OBJ);
               if ($row) {
                   $setfields .= ' `GROUP_ID`=\''. $row->ID . '\',';
               } else {
                   $query = 'insert into ' . ONKDB_PREFIX . 'uch_groups SET NAME=\''. $this->addslashes($value) . '\'';
                   $rows = $this->con->exec($query);
                   if ($rows) {
                       $id = $this->con->lastInsertId();
                   } else { $id = 0; }
                   $setfields .= ' `GROUP_ID`=\''. (int)$id . '\',';
               }
             } else {
               $setfields .= ' `'. $this->addslashes($key) . '`=\''. $this->addslashes($value) . '\',';
             }
         }

         $setfields = trim($setfields," ,");
       }
       
       switch ($request->method) {
           case 'update':
                if ($setfields=='') { return ONKERR_MESSAGEREQUESTFAIL; }
                $query = 'update ' . ONKDB_PREFIX . 'uch set ' . $setfields . ' where ID=' . (int)$request->id;
                $cnt = $this->con->exec($query);
                
                $res = new stdClass();
                $res->error = false;
                $res->rowupdated = $cnt;
               break;

           case 'insert':
                if ($setfields=='') { return ONKERR_MESSAGEREQUESTFAIL; }
                $query = 'insert into ' . ONKDB_PREFIX . 'uch set ' . $setfields;
                $cnt = $this->con->exec($query);
                
                $res = new stdClass();
                $res->error = false;
                $res->rowsUpdated = $cnt;
                $res->insertedID = $this->con->lastInsertId();
               break;
               
           case 'delete':
                $query = 'delete from ' . ONKDB_PREFIX . 'uch where ID=' . (int)$request->id;
                $cnt = $this->con->exec($query);
                
                $res = new stdClass();
                $res->error = false;
                $res->rowsUpdated = $cnt;
               break;
           default:
                return ONKERR_MESSAGEREQUESTFAIL;
               break;
       }
       
       return $res;
   }
   
   public function getCompalintsStatus($id=0,$limit='') {
       if ($this->isLogin(0)!=true) { return ONKERR_MESSAGENOAUTH; }
       
       $where = '';
       
       if ((int)$id>0) { $where = 'where ID='. (int)$id; } 
       
       if (!isset($limit)) { $limit = ''; }
       if ($limit!='') { $limit = ' limit ' . $this->addslashes($limit); }
       
       $query = 'select * from ' . ONKDB_PREFIX . 'statuses ' . $where . ' order by NAME ' . $limit;
       $rows = $this->con->query($query);
       if (!$rows) return ONKERR_MESSAGEQUERYFAILED;
       $res = array();
       while ($row = $rows->fetch(PDO::FETCH_OBJ)){
           $r = new stdClass();
           $r->id = $row->ID;
           $r->name = $row->NAME;
           array_push($res,$r);
       }    
       
       return $res;
   }
   
   public function getCompalintsStatusEdit($request) {
       if ($this->isLogin(1)!=true) { return ONKERR_MESSAGENOAUTH; }
       
       if (!isset($request) || !isset($request->method) || !in_array($request->method, array('update','insert','delete'))) { return ONKERR_MESSAGEREQUESTFAIL; }

       if ((int)$_SESSION['dacUserRole']<1) { return ONKERR_MESSAGEFORBIDDEN; }
       
       $setfieldsarr = $request->setfields;
        $setfields = '';
       if (isset($setfieldsarr)) { 

         foreach ($setfieldsarr as $key => $value) {
             if (mb_strtolower($key)=='id') { continue; }
             $setfields .= ' `'. $this->addslashes($key) . '`=\''. $this->addslashes($value) . '\',';
         }

         $setfields = trim($setfields," ,");
       }
       
       switch ($request->method) {
           case 'update':
                if ($setfields=='') { return ONKERR_MESSAGEREQUESTFAIL; }
                $query = 'update ' . ONKDB_PREFIX . 'statuses set ' . $setfields . ' where ID=' . (int)$request->id;
                $cnt = $this->con->exec($query);
                
                $res = new stdClass();
                $res->error = false;
                $res->rowupdated = $cnt;
               break;

           case 'insert':
                if ($setfields=='') { return ONKERR_MESSAGEREQUESTFAIL; }
                $query = 'insert into ' . ONKDB_PREFIX . 'statuses set ' . $setfields;
                $cnt = $this->con->exec($query);
                
                $res = new stdClass();
                $res->error = false;
                $res->rowsUpdated = $cnt;
                $res->insertedID = $this->con->lastInsertId();
               break;
               
           case 'delete':
                $query = 'delete from ' . ONKDB_PREFIX . 'statuses where ID=' . (int)$request->id;
                $cnt = $this->con->exec($query);
                
                $res = new stdClass();
                $res->error = false;
                $res->rowsUpdated = $cnt;
               break;
           default:
                return ONKERR_MESSAGEREQUESTFAIL;
               break;
       }
       
       return $res;
   }
   
   
   public function getCompalintsType($id=0,$limit='') {
       if ($this->isLogin(0)!=true) { return ONKERR_MESSAGENOAUTH; }
       
       $where = '';
       
       if ((int)$id>0) { $where = 'where ID='. (int)$id; } 
       
       if (!isset($limit)) { $limit = ''; }
       if ($limit!='') { $limit = ' limit ' . $this->addslashes($limit); }
       
       $query = 'select * from ' . ONKDB_PREFIX . 'categories ' . $where . ' order by NAME ' . $limit;
       $rows = $this->con->query($query);
       if (!$rows) return ONKERR_MESSAGEQUERYFAILED;
       $res = array();
       while ($row = $rows->fetch(PDO::FETCH_OBJ)){
           $r = new stdClass();
           $r->id = $row->ID;
           $r->name = $row->NAME;
           array_push($res,$r);
       }    
       
       return $res;
   }
   
   public function getCompalintsTypeEdit($request) {
       if ($this->isLogin(1)!=true) { return ONKERR_MESSAGENOAUTH; }
       
       if (!isset($request) || !isset($request->method) || !in_array($request->method, array('update','insert','delete'))) { return ONKERR_MESSAGEREQUESTFAIL; }

       if ((int)$_SESSION['dacUserRole']<1) { return ONKERR_MESSAGEFORBIDDEN; }
       
       $setfieldsarr = $request->setfields;
        $setfields = '';
       if (isset($setfieldsarr)) { 

         foreach ($setfieldsarr as $key => $value) {
             if (mb_strtolower($key)=='id') { continue; }
             $setfields .= ' `'. $this->addslashes($key) . '`=\''. $this->addslashes($value) . '\',';
         }

         $setfields = trim($setfields," ,");
       }
       
       switch ($request->method) {
           case 'update':
                if ($setfields=='') { return ONKERR_MESSAGEREQUESTFAIL; }
                $query = 'update ' . ONKDB_PREFIX . 'categories set ' . $setfields . ' where ID=' . (int)$request->id;
                $cnt = $this->con->exec($query);
                
                $res = new stdClass();
                $res->error = false;
                $res->rowupdated = $cnt;
               break;

           case 'insert':
                if ($setfields=='') { return ONKERR_MESSAGEREQUESTFAIL; }
                $query = 'insert into ' . ONKDB_PREFIX . 'categories set ' . $setfields;
                $cnt = $this->con->exec($query);
                
                $res = new stdClass();
                $res->error = false;
                $res->rowsUpdated = $cnt;
                $res->insertedID = $this->con->lastInsertId();
               break;
               
           case 'delete':
                $query = 'delete from ' . ONKDB_PREFIX . 'categories where ID=' . (int)$request->id;
                $cnt = $this->con->exec($query);
                
                $res = new stdClass();
                $res->error = false;
                $res->rowsUpdated = $cnt;
               break;
           default:
                return ONKERR_MESSAGEREQUESTFAIL;
               break;
       }
       
       return $res;
   }
   
   public function getUsers($fromid=0,$limit='') {
       if ($this->isLogin()!=true) { return ONKERR_MESSAGENOAUTH; }
       
       $fromid = $this->checkUserByRole($fromid);
       
       if ((int)$fromid>0) { $where = 'where u.ID='. (int)$fromid; } 
       else { 
           $where = ''; 
           if ((int)$_SESSION['dacUserRole']<1) { $where = 'where u.ID='. $this->getCurrentUser(); }
       }
       
       if (!isset($limit)) { $limit = ''; }
       if ($limit!='') { $limit = ' limit ' . $this->addslashes($limit); }
       
       $query = 'select u.*,(select count(*) from ' . ONKDB_PREFIX . 'complaint c where c.USER_ID=u.ID) as complaints, '
               . '(select count(*) from ' . ONKDB_PREFIX . 'comments cm where cm.USER_ID=u.ID) as requests,'
               . '(select count(*) from ' . ONKDB_PREFIX . 'uch uc) as penitentiaries,'
               . '(select count(*) from ' . ONKDB_PREFIX . 'complaint c2 where c2.UCH_ID in (select ID from ' . ONKDB_PREFIX . 'uch u2)) as current,'
               . '(select count(*) from ' . ONKDB_PREFIX . 'comments cm2) as requestsall,'
               . '(select count(*) from ' . ONKDB_PREFIX . 'complaint cp) as complaintsall'
               . ' from ' . ONKDB_PREFIX . 'users u ' . $where . ' order by u.role desc, u.STATUS asc,u.FIRST_NAME, u.FATHER_NAME, u.LAST_NAME ' . $limit;
       $rows = $this->con->query($query);
       if (!$rows) return ONKERR_MESSAGEQUERYFAILED;
       
       $imgsid = array(1,4,2);
       $idx = 0;
       $res = array();
       while ($row = $rows->fetch(PDO::FETCH_OBJ)){
           $r = new stdClass();
           $r->id = $row->ID;
           $r->profile_link = './profile.html?id=' . $r->id;
           $r->login = $row->EMAIL;
           $r->username = '';
           if (isset($row->LAST_NAME) && trim($row->LAST_NAME)!='') { $r->username = trim($row->LAST_NAME); }
           if (isset($row->FATHER_NAME) && trim($row->FATHER_NAME)!='') { $r->username = trim($row->FATHER_NAME) . ' ' . $r->username; }
           if (isset($row->FIRST_NAME) && trim($row->FIRST_NAME)!='') { $r->username = trim($row->FIRST_NAME) . ' ' . $r->username; }
           
           $r->role = $row->role;
           $r->status = $row->STATUS;

          if($row->userpic) {
            $r->img = trim($row->userpic);
            $avatarPath = $r->img;
            $r->avatar_status='true';
          }
          else {
            $avatarPath = "./img/post/user_nophoto.png";
            $r->img = "./img/post/user_nophoto.png";
            $r->avatar_status = 'false';
          }

           $r->email = $row->EMAIL;
           $r->vk = trim($row->vk);
           if (!isset($r->vk) || $r->vk=='') { $r->vk = "https://vk.com/feed"; }
           $r->phone = $row->PHONE;
           $r->about = trim($row->about);
           $r->location = trim($row->location);
           $r->password = '';
           $r->date_of_registration = $this->intToDate($row->DATE_CREATE);
           $r->last_visit = $this->intToDate($row->DATE_ACTIVE);
           $r->complaints = $row->complaints;
           $r->complaintsall = $row->complaintsall;
           $r->complaints_data = '';//"9,4,8,6,5,6,4,8,3,5,9,5";
           $r->requests = $row->requests;
           $r->requestsall = $row->requestsall;
           $r->requests_data = '';//"1,4,8,3,5,6,4,8,3,3,9,5";
           $r->penitentiaries = $row->penitentiaries;
           $r->penitentiaries_data = '';//"4,2,8,2,5,6,3,8,3,5,9,5";
           $r->current = $row->current;
           $r->current_data = '';//"2,4,8,4,5,7,4,7,3,5,7,5";
           array_push($res,$r);
           $idx++;
           if ($idx>=count($imgsid)) { $idx = 0; }
       }
       
       return $res;
   }
   
   public function getMessages($fromid=0,$limit='') {
       if ($this->isLogin()!=true) { return ONKERR_MESSAGENOAUTH; }
       
       if ((int)$fromid>0) { $where = 'where c.USER_ID='. (int)$fromid; } else { $where = ''; }

      $query = 'select c.*,u.FIRST_NAME,u.LAST_NAME,u.FATHER_NAME,u.userpic from ' . ONKDB_PREFIX . 'comments c left join ' . ONKDB_PREFIX . 'users u on c.USER_ID=u.ID ' . $where . ' order by DATE DESC';

       if (isset($limit) && $limit!='') { $query .= ' ' . $limit;}
       $rows = $this->con->query($query);
       if (!$rows) return ONKERR_MESSAGEQUERYFAILED;
       
       $imgsid = array(1,4,2);
       $idx = 0;
       $res = array();
       while ($row = $rows->fetch(PDO::FETCH_OBJ)){
           $r = new stdClass();
           $r->id = $row->USER_ID;
           $r->userphoto = trim($row->userpic);
           if (!isset($r->userphoto) || $r->userphoto=='') { $r->userphoto = "./img/post/user_nophoto.png"; }
           $r->username = '';
           if (isset($row->LAST_NAME) && trim($row->LAST_NAME)!='') { $r->username = trim($row->LAST_NAME); }
           if (isset($row->FATHER_NAME) && trim($row->FATHER_NAME)!='') { $r->username = trim($row->FATHER_NAME) . ' ' . $r->username; }
           if (isset($row->FIRST_NAME) && trim($row->FIRST_NAME)!='') { $r->username = trim($row->FIRST_NAME) . ' ' . $r->username; }
           $r->complaintsurl = "./complaint.html";
           $r->messagecontent = $row->TEXT;
           array_push($res,$r);
           $idx++;
           if ($idx>=count($imgsid)) { $idx = 0; }
       }
       
       return $res;
   }

   public function getAllMessages() {
    if ($this->isLogin() != true) { return ONKERR_MESSAGENOAUTH; }
    $query = 'select * from ' . ONKDB_PREFIX . 'comments';

    $rows = $this->con->query($query);

    $res = array();
    while ($row = $rows->fetch(PDO::FETCH_OBJ)) {
      $r = new stdClass();
      $r->id = $row->ID;
      $r->user_id = $row->USER_ID;
      $r->complaint_id = $row->COMPLAINT_ID;
      $r->text = $row->TEXT;
      $r->date = $row->DATE;

      array_push($res, $r);
    }

    return $res;
   }

   public function getAllDocs() {
    if ($this->isLogin() != true) { return ONKERR_MESSAGENOAUTH; }

    $query = 'select * from ' . ONKDB_PREFIX . 'docs';
    $rows = $this->con->query($query);

    $res = array();

    while ($row = $rows->fetch(PDO::FETCH_OBJ)) {
      $r = new stdClass();
      $r->id = $row->ID;
      $r->name = $row->NAME;
      $r->original_name = $row->ORIGINAL_NAME;
      $r->complaint_id = $row->COMPLAINT_ID;
      $r->letter_id = $row->LETTER_ID;
      $r->user_id = $row->USER_ID;

      array_push($res, $r);
    }

    return $res;
   }

   public function getAllComments() {
    if ($this->isLogin() != true) { return ONKERR_MESSAGENOAUTH; }

    $query = 'select * from ' . ONKDB_PREFIX . 'comments';

    $rows = $this->con->query($query);
    $res = array();

    while ($row = $rows->fetch(PDO::FETCH_OBJ)) {
      $r = new stdClass();
      $r->id = $row->ID;
      $r->user_id = $row->USER_ID;
      $r->complaint_id = $row->COMPLAINT_ID;
      $r->text = $row->TEXT;
      $r->date = $row->DATE;

      $nQuery = 'select * from ' . ONKDB_PREFIX . 'users where ID=' . $r->user_id;
      $nRows = $this->con->query($nQuery);
      while($nrow = $nRows->fetch(PDO::FETCH_OBJ)) {
        $r->fio = $nrow->FIRST_NAME . ' ' . $nrow->FATHER_NAME . ' ' . $nrow->LAST_NAME;
      }

      array_push($res, $r);
    }

    return $res;
   }
   
      public function getCompalintsEdit($request) {
       if ($this->isLogin(0)!=true) { return ONKERR_MESSAGENOAUTH; }
       
       if (!isset($request) || !isset($request->method) || !in_array($request->method, array('update','insert','delete'))) { return ONKERR_MESSAGEREQUESTFAIL; }

       
       $setfieldsarr = $request->setfields;
        $setfields = '';
       if (isset($setfieldsarr)) { 

         foreach ($setfieldsarr as $key => $value) {
             if (mb_strtolower($key)=='id') { continue; }
             
             if ($key=='applicant') {
                 $setfields .= ' `FIO`=\''. $this->addslashes($value) . '\',';
             } elseif ($key=='gender') {
                 $setfields .= ' `SEX`=\''. $this->addslashes($value) . '\',';
             } elseif ($key=='dataofbirth') {
                 $setfields .= ' `DATE_ROZH`=\''. $this->addslashes($value) . '\',';
             } elseif ($key=='type') {
                 $setfields .= ' `CATEGORY_ID`=\''. (int)$value . '\',';
             } elseif ($key=='statusid') {
                 $setfields .= ' `STATUS`=\''. (int)$value . '\',';
             } elseif ($key=='penitentiary') {
                 $setfields .= ' `UCH_ID`=\''. (int)$value . '\',';
             } elseif ($key=='mentor') {
                 $setfields .= ' `ADD_USER_ID`=\''. $this->getCurrentUser() . '\',';
             } elseif ($key=='mentorid') {
                 if ((int)$_SESSION['dacUserRole']<1) { $value = (int)$this->getCurrentUser(); }
                 elseif ((int)$value<1) { $value = (int)$this->getCurrentUser(); }
                 $setfields .= ' `USER_ID`=\''. (int)$value . '\',';
             } elseif ($key=='text') {
                 $setfields .= ' `TEXT`=\''. $this->addslashes($value) . '\',';
             } else {
                 $setfields .= ' `'. $this->addslashes($key) . '`=\''. $this->addslashes($value) . '\',';
             }
         }

         $setfields = trim($setfields," ,");
       }
       
       if ((int)$_SESSION['dacUserRole']<1) { $fromid = (int)$_SESSION['dacUserID']; }
       if ((int)$fromid>0 && isset($request->isMy) && $request->isMy) { $where = 'where c.USER_ID='. (int)$fromid; } else { $where = ''; }
       
       if (isset($request->id)) {
           $query = 'select USER_ID from ' . ONKDB_PREFIX . 'complaint where ID=' . (int)$request->id;
           $rows = $this->con->query($query);
           if (!$rows) return ONKERR_MESSAGEQUERYFAILED;

           $row = $rows->fetch(PDO::FETCH_OBJ);
           if ($row) {
               $cuid = (int)$row->USER_ID;
           } else {
               $cuid = -1;
           }
       }
       
       switch ($request->method) {
           case 'update':
               if ((int)$_SESSION['dacUserRole']<1 && $fromid!=$cuid) {
                   return ONKERR_MESSAGEFORBIDDEN;
               }
                if ($setfields=='') { return ONKERR_MESSAGEREQUESTFAIL; }
                $query = 'update ' . ONKDB_PREFIX . 'complaint set ' . $setfields . ' where ID=' . (int)$request->id;
                $cnt = $this->con->exec($query);
                
                $res = new stdClass();
                $res->error = false;
                $res->rowupdated = $cnt;
               break;

           case 'insert':
                if ($setfields=='') { return ONKERR_MESSAGEREQUESTFAIL; }
                $dt = new DateTime();
                $dt = $dt->getTimestamp();
                $query = 'insert into ' . ONKDB_PREFIX . 'complaint set ' . $setfields . ', DATE="' . (int)$dt . '"';
                $cnt = $this->con->exec($query);
                
                $res = new stdClass();
                $res->error = false;
                $res->rowsUpdated = $cnt;
                $res->insertedID = $this->con->lastInsertId();
                
                $query = 'update ' . ONKDB_PREFIX . 'docs set COMPLAINT_ID=' . (int)$res->insertedID . ' where USER_ID=' . $this->getCurrentUser() . ' and COMPLAINT_ID=0';
                $cnt = $this->con->exec($query);
               break;
               
           case 'delete':
                if ((int)$_SESSION['dacUserRole']<1) { return ONKERR_MESSAGEFORBIDDEN; }
                $query = 'select * from ' . ONKDB_PREFIX . 'docs where COMPLAINT_ID=' . (int)$request->id;
                $rows = $this->con->query($query);
                while ($row = $rows->fetch(PDO::FETCH_OBJ)){
                   $todir = dirname(__FILE__) . '/../../upload/files/';
                   $targetFile = $todir . $row->NAME;
                   unlink($targetFile);
                }
                
                $query = 'delete from ' . ONKDB_PREFIX . 'docs where COMPLAINT_ID=' . (int)$request->id;
                $cnt = $this->con->exec($query);
                
                $query = 'delete from ' . ONKDB_PREFIX . 'complaint where ID=' . (int)$request->id;
                $cnt = $this->con->exec($query);
                
                $res = new stdClass();
                $res->error = false;
                $res->rowsUpdated = $cnt;
               break;
           default:
                return ONKERR_MESSAGEREQUESTFAIL;
               break;
       }
       
       return $res;
   }

   public function getComplaints($fromid=0,$limit='',$request) {
       if ($this->isLogin()!=true) { return ONKERR_MESSAGENOAUTH; }
       
       $where = ''; $filtered = false;
       
       if (!isset($limit)) { $limit = ''; }
       if ($limit!='') { $limit = ' limit ' . $this->addslashes($limit); }
       
       
       if ((int)$_SESSION['dacUserRole']<1) { $fromid = (int)$_SESSION['dacUserID']; }
       if ((int)$fromid>0 && isset($request->isMy) && $request->isMy) { $where = 'where c.USER_ID='. (int)$fromid; } else { $where = ''; }
       
       if (isset($request) && is_object($request)) {
          if (isset($request->filtered)) { $filtered = $request->filtered; } 
          
          if (isset($request->cid)) { 
             if ($where!='') { $where = $where . ' and c.ID='. (int)$request->cid; } else { $where = 'where c.ID='. (int)$request->cid; }
             //if ((int)$_SESSION['dacUserRole']<1) { $where = $where . ' and c.USER_ID=' . (int)$_SESSION['dacUserID']; }
          } 
          
          if (isset($request->mentor) && (int)$request->mentor>0) {
                $filtered = true;
                
                if ((int)$_SESSION['dacUserRole']<1) { $request->mentor = (int)$_SESSION['dacUserID']; }
                
                if ($where!='') { $where = $where . ' and c.USER_ID='. (int)$request->mentor; } else { $where = 'where c.USER_ID='. (int)$request->mentor; }
          } 
          if (isset($request->status) && (int)$request->status>0) {
                $filtered = true;
                
                if ($where!='') { $where = $where . ' and c.STATUS='. (int)$request->status; } else { $where = 'where c.STATUS='. (int)$request->status; }
          } 
          if (isset($request->uch) && (int)$request->uch>0) {
                $filtered = true;
                
                if ($where!='') { $where = $where . ' and c.UCH_ID='. (int)$request->uch; } else { $where = 'where c.UCH_ID='. (int)$request->uch; }
          } 
          if (isset($request->isMy) && (int)$request->isMy>0) {
                if ($where!='') { $where = $where . ' and c.USER_ID='. (int)$_SESSION['dacUserID']; } else { $where = 'where c.USER_ID='. (int)$_SESSION['dacUserID']; }
          } 
       }
       
       $query = 'select c.*,u.FIRST_NAME,u.LAST_NAME,u.FATHER_NAME,s.NAME as STATUSNAME,uc.NAME as UCHNAME,ca.NAME as CATNAME, '
               . '(select count(*) from ' . ONKDB_PREFIX . 'docs d where d.COMPLAINT_ID=c.ID) as DOCCOUNT from ' . ONKDB_PREFIX . 'complaint c '
               . 'left join ' . ONKDB_PREFIX . 'statuses s on c.STATUS=s.ID '
               . 'left join ' . ONKDB_PREFIX . 'uch uc on c.UCH_ID=uc.ID '
               . 'left join ' . ONKDB_PREFIX . 'categories ca on c.CATEGORY_ID=ca.ID '
               . 'left join ' . ONKDB_PREFIX . 'users u on c.USER_ID=u.ID ' . $where . ' order by DATE DESC ' . $limit;
               
//file_put_contents('2.txt', print_r($request,true) . $query);               
               
       $rows = $this->con->query($query);
       if (!$rows) return ONKERR_MESSAGEQUERYFAILED;
       
       $res = array();
       while ($row = $rows->fetch(PDO::FETCH_OBJ)){
           $r = new stdClass();
           $r->id = $row->ID;
           $r->applicant = $row->FIO;
           $r->gender = $row->SEX;
           $r->applicantDateOfBirth = $this->rozhToDate($row->DATE_ROZH);
           $r->status = $row->STATUSNAME;
           $r->statusid = $row->STATUS;
           $r->penitentiary = $row->UCHNAME;
           $r->userid = $row->USER_ID;
           $r->username = '';
           if (isset($row->LAST_NAME) && trim($row->LAST_NAME)!='') { $r->username = trim($row->LAST_NAME); }
           if (isset($row->FIRST_NAME) && trim($row->FIRST_NAME)!='') { $r->username = $r->username . ' ' . trim($row->FIRST_NAME); }
           if (isset($row->FATHER_NAME) && trim($row->FATHER_NAME)!='') { $r->username = $r->username . ' ' . trim($row->FATHER_NAME); }
           $r->type = $row->CATNAME;
           $r->typeid = $row->CATEGORY_ID;
           $r->uchid = $row->UCH_ID;
           $r->content = $row->TEXT;
           $r->document = $row->DOCCOUNT>0;
           $r->date = $this->intToDate($row->DATE);
           $r->url = "./complaint.html?id=" . $r->id;
           $r->links = array();
           $query = 'select d.* from ' . ONKDB_PREFIX . 'docs d where d.COMPLAINT_ID=' . $row->ID . ' order by d.ID';
           $drows = $this->con->query($query);
           if ($drows) {
               while ($drow = $drows->fetch(PDO::FETCH_OBJ)){
                   $dr = new stdClass();
                   $dr->url = "./upload/files/" . $drow->NAME;
                   $dr->name = $drow->ORIGINAL_NAME;
                   $dr->id = $drow->ID;
                   array_push($r->links,$dr);
               }
           }

           array_push($res,$r);
       }
       
       $users = array();
       //if ((int)$_SESSION['dacUserRole']>=1) { 
           $query = 'select ID,FIRST_NAME,LAST_NAME,FATHER_NAME from ' . ONKDB_PREFIX . 'users  ';
           if ((int)$_SESSION['dacUserRole']<1) { 
               $query .= ' where ID=' . (int)$_SESSION['dacUserID'];
           }    
           $query .= ' order by role desc, LAST_NAME, FIRST_NAME, FATHER_NAME';
           $rows = $this->con->query($query);
           if (!$rows) return ONKERR_MESSAGEQUERYFAILED;
           while ($row = $rows->fetch(PDO::FETCH_OBJ)){
               $r = new stdClass();
               $r->id = $row->ID;
           $r->username = '';
           if (isset($row->LAST_NAME) && trim($row->LAST_NAME)!='') { $r->username = trim($row->LAST_NAME); }
           if (isset($row->FIRST_NAME) && trim($row->FIRST_NAME)!='') { $r->username = $r->username . ' ' . trim($row->FIRST_NAME); }
           if (isset($row->FATHER_NAME) && trim($row->FATHER_NAME)!='') { $r->username = $r->username . ' ' . trim($row->FATHER_NAME); }
               array_push($users,$r);
           }    
      // }


       $statuses = array();
       $query = 'select * from ' . ONKDB_PREFIX . 'statuses  order by NAME';
       $rows = $this->con->query($query);
       if (!$rows) return ONKERR_MESSAGEQUERYFAILED;
       while ($row = $rows->fetch(PDO::FETCH_OBJ)){
           $r = new stdClass();
           $r->id = $row->ID;
           $r->name = $row->NAME;
           array_push($statuses,$r);
       }    

       $uchs = array();
       $query = 'select u.*,ug.NAME as groupname from ' . ONKDB_PREFIX . 'uch u left join ' . ONKDB_PREFIX . 'uch_groups ug on u.GROUP_ID=ug.ID  order by ug.NAME, u.NAME ';
       $rows = $this->con->query($query);
       if (!$rows) return ONKERR_MESSAGEQUERYFAILED;
       while ($row = $rows->fetch(PDO::FETCH_OBJ)){
           $r = new stdClass();
           $r->id = $row->ID;
           $r->name = $row->NAME;
           $r->groupid = $row->GROUP_ID;
           $r->groupname = $row->groupname;
           array_push($uchs,$r);
       }    
       
       $types = array();
       $query = 'select * from ' . ONKDB_PREFIX . 'categories  order by NAME';
       $rows = $this->con->query($query);
       if (!$rows) return ONKERR_MESSAGEQUERYFAILED;
       while ($row = $rows->fetch(PDO::FETCH_OBJ)){
           $r = new stdClass();
           $r->id = $row->ID;
           $r->name = $row->NAME;
           array_push($types,$r);
       }    
       
       
       $r = new stdClass();
       $r->rows = $res;
       $r->users = $users;
       $r->statuses = $statuses;
       $r->uchs = $uchs;
       $r->types = $types;
       $r->filtered = $filtered;
       
       return $r;
   }
}