$(document).ready(function(){ 
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAPErt1o9Y_qplds8re62jDfPy87jY0s1c",
    authDomain: "rs-train-scheduler-b.firebaseapp.com",
    databaseURL: "https://rs-train-scheduler-b.firebaseio.com",
    storageBucket: "rs-train-scheduler-b.appspot.com",
    messagingSenderId: "183006034915"
  };
  firebase.initializeApp(config);

  // Create a variable to reference the database.
  var database = firebase.database();

  // Initial Values
  var trainNameVal = "";
  var destinationVal = "";
  var firstTrainTimeVal = "";
  var frequencyVal = 0;

  //Function calculate the next train arrival
  //Receive Initial train Time (Military Time) and Frequency in Minutes
  //Returns an array with Next Train time and Minutes until next train 
  function nextArrivalFunction(timeIn, freq){
    var convertedTime = moment(timeIn, 'HH:mm').subtract(1,'y');
    var currentTime = moment();
    var diffTime = currentTime.diff(convertedTime, 'm');
    var timeRemainder = diffTime % freq;
    var minutesUntilTrain = freq - timeRemainder;
    var nextTrain = moment().add(minutesUntilTrain, 'm');

    return ([nextTrain, minutesUntilTrain]);

  }

  //Clear the Train schedule content
  function clearContent(){
    $("table tbody").empty();
  }

  function refreshTable(){
    $('#displayTrainInfo').load()
  }
  // Capture Add Button Click
  $("#addTrain").on("click", function() {
    clearContent();
    // Grabbed values from text-boxes 
    trainNameVal = $("#trainNameInput").val().trim();
    destinationVal = $("#destinationInput").val().trim();
    firstTrainTimeVal = $("#firstTrainTimeInput").val().trim();
    frequencyVal = $("#frequencyInput").val().trim();

    if (trainNameVal.length > 0){
      // Code for "Setting values in the database"
      database.ref().push({
        train_name: trainNameVal,
        destination: destinationVal,
        first_train_time: firstTrainTimeVal,
        frequency: frequencyVal
      });
      }else{
        $("#trainNameInput").addClass(".has-error");
      }
    // Don't refresh the page!
    return false;
  });//end add button function

  // Firebase watcher + initial loader
  database.ref().on("value", function(snapshot) {

    var val = snapshot.val();
    var val_arr = Object.keys(val);

    //We go over the array that contain the keys from the DB
    for (var i = val_arr.length - 1; i >= 0; i--) {
 
      key = val_arr[i];
      train = val[key];
  
      var name = train.train_name;
      var destin = train.destination;
      var freq = train.frequency;
      var next = train.first_train_time;
      var nextTrainInfo = nextArrivalFunction(next,freq);

      //Create each train line and append to the list
      var newTrainLine = "<tr><td>" 
      + name + "</td><td>" 
      + destin + "</td><td>" 
      + freq + "</td><td>"
      + moment(nextTrainInfo[0]).format('HH:mm') + "</td><td>"
      + nextTrainInfo[1] + "</td></tr>";
      $("table tbody").append(newTrainLine).addClass("dropdown");

    }
  // Handle the errors
  }, function(errorObject) {
  console.log("Errors handled: " + errorObject.code);
  });

  refreshTable();
});//End document ready function

