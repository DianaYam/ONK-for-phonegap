<?php
	require_once 'errors.php';
	
	class APIController {
		public $request;

		function __construct($request) {
			$this->request = $request;
		}

		function render() {
			$res = new stdClass();

			if (isset($request->command)) {
			} else {
				$res->error = REQUEST_ERROR;
			}

			return $res;
		}
	}
?>