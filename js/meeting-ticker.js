var current_amount = 0;
var start_time = null;

function begin( form ) {
  var data = {
    hourly_rate: $("input[name=hourly_rate]").val(),
    attendees:   $("input[name=attendees]").val()
  }
  var display = $("#timer");

  if( !valid( data ) ) return false;
  
  var hourly_burn  = Number( data.hourly_rate ) * Number( data.attendees );

  var selected_time_segments = $("#start_time").eq(0).val().split(':');
  var hours   = Number( selected_time_segments[0] );
  var minutes = Number( selected_time_segments[1] );
  
  start_time = new Date();
  start_time.setHours( hours );
  start_time.setMinutes( minutes );

  var timer = setInterval( function() {
    update( display, hourly_burn );
  }, 100 );
  
  return timer;
};

function valid( data ) {
  var valid   = false;
  
  for( key in data ) {    
    console.log( data[key] );
    var error = $("dd:has(:input[name=" + key + "])").prev( ".error" );
    
    if( isNaN( data[key] ) ) {
      error.text( "Must be a number" ).show();
      valid = false;
    } else if( data[key] <= 0 ) {
      error.text( "Must be a positive, non-zero, number" ).show();
    } else {
      valid = true;
    }
  }
  
  return valid;
};

function update( element, rate_per_hour ) {
  var current_time    = new Date();
  var difference      = current_time - start_time;
  var seconds_elapsed = difference.valueOf() / 1000;
  var rate_per_second = rate_per_hour / 60 / 60;
  
  element.text( (seconds_elapsed * rate_per_second).toFixed( 2 ) );
}

$(document).ready( function() {
  var timer = null;
  $("#display").hide();
  $("input.watermark").each( function() {
    $(this).watermark( $(this).attr( "title" ) );
  } );
   
  $('form.setup').submit( function( event ) {
    event.preventDefault();
    
    $(".error").hide();
    
    timer = begin( this );
    if( timer ) {
      $(this).hide();
      $("#started_at").text( "(we began at " + start_time.toLocaleTimeString() + ")" );
      $("#display").fadeIn( 1500 );
    }
    
    return false;
  } );
  
  $('form.stop').submit( function( event ) {
    event.preventDefault();
    clearInterval( timer );
    return false;
  });
  
  var now = new Date();
  $("#start_time").eq(0).val( now.getHours() + ":" + now.getMinutes() );
  
  $("#start_time").clockpick({
    military: true,
    layout  : "horizontal"
  });
 } );
