<?php
require_once('connect.php');

$drawing = json_decode($_POST["drawing"]);
$shapes = json_encode($drawing->shapes);
$editable = $drawing->editable;

$newEntry = $_POST["id"];
if($newEntry == 'new'){
    $sqlInsert = "INSERT INTO drawings (shapes, editable) VALUES ('$shapes', '$editable')";
}
else{
    $sqlInsert = "UPDATE drawings SET shapes = '$shapes' WHERE id = '$newEntry'";
}

//upload to database

if ($conn->query($sqlInsert) === TRUE){
  echo("Drawing added");
}
else {
  echo "Error: " . $sqlInsert . "<br>" . $conn->error;
}
?>
