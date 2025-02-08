<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Countdown Clock</title>
<style>
  #countdown {
    font-size: 24px;
    text-align: center;
    margin-top: 50px;
  }
</style>
</head>
<body>

<div id="countdown"></div>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script>
  // Function to calculate time remaining until tomorrow
  function calculateCountdown() {
    // Get the current date
    var now = new Date();

    // Calculate tomorrow's date
    var tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set time to midnight

    // Calculate the time remaining until tomorrow
    var distance = tomorrow - now;

    // Calculate days, hours, minutes, and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the countdown in the "countdown" element
    $("#countdown").html(days + "d " + hours + "h "
    + minutes + "m " + seconds + "s ");

    // If the countdown is over, display a message
    if (distance < 0) {
      clearInterval(x);
      $("#countdown").html("EXPIRED");
    }
  }

  // Update the countdown every second
  var x = setInterval(calculateCountdown, 1000);

  // Initial call to display the countdown immediately
  calculateCountdown();
</script>

</body>
</html>
