<?php
require_once('connect.php');

$sql = "SELECT id FROM drawings ORDER BY id";
$result = $conn->query($sql);


$ids = [];
if($result->num_rows > 0){
  while($row = $result->fetch_assoc()){
    array_push($ids, $row['id']);
  }
}
echo json_encode($ids);
?>
