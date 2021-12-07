<?php
require_once('connect.php');


$id = $_POST["id"];
$sql = "SELECT * FROM drawings WHERE id = '$id'";
$result = $conn->query($sql);

$object = null;

if($result->num_rows > 0){
  while($row = $result->fetch_assoc()){
    $object = (object) [
      'id' => $row['id'],
      'shapes' => $row['shapes'],
      'editable' => $row['editable']
    ];
  }
}
echo json_encode($object);
?>
