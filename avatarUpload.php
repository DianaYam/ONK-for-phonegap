<?php	
	if (isset($_POST['avatar_file_upload'])) {
		$uploaddir = './avatars';

		if (!is_dir($uploaddir)) mkdir($uploaddir, 0777);

		$files = $_FILES;
		$done_files = array();

		foreach ($files as $file) {
		 	$name = $file['name'];
			// $new_file_name = uniqid('avatar_', false);
			$new_file_name = (string)$_POST['avatar_file_upload'];

			$fileDataArray = explode('.', $name);
			$fileType = $fileDataArray[1];
			$new_file_name = $new_file_name . "." . $fileType;

		 	$tmp_name = $file['tmp_name'];
		 	$new_file_name = './avatars/' . $new_file_name;
		 	file_put_contents('avatars.txt', $new_file_name);
		 	$fileMoved = rename($tmp_name, $new_file_name);
		 }
	}
?>