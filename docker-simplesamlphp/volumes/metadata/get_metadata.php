<?php
function get_metadata_from_db() {
    $dsn = 'mysql:host=' . getenv('MYSQL_HOST') . ';'
           . 'dbname=' . getenv('MYSQL_DB') . ';';
    $db = new PDO($dsn, getenv('MYSQL_USER'), getenv('MYSQL_PASSWORD'));

    $metadata = array();
    foreach($db->query('SELECT
        metadata_url,
        login_callback_url as AssertionConsumerService,
        logout_callback_url as SingleLogoutService
        FROM sso_sp_list;', PDO::FETCH_ASSOC) as $row) {
        $metadata_url = $row['metadata_url'];
        unset($row['metadata_url']);
        $metadata[$metadata_url] = $row; 
    }

    $db = null;
    return $metadata;
}
