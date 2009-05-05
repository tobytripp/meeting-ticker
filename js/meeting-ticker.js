var current_amount = 0;
var start_time = null;

function begin( form ) {
  var data = {
    hourly_rate: $("input[name=hourly_rate]").val(),
    attendees:   $("input[name=attendees]").val()
  }
  var display = $(".cost_display");

  if( !valid( data ) ) return false;
  
  var hourly_burn  = Number( data.hourly_rate ) * Number( data.attendees );

  var selected_time_segments = $("#start_time").eq(0).val().split(':');
  var hours   = Number( selected_time_segments[0] );
  var minutes = Number( selected_time_segments[1] );
  
  start_time = new Date();
  start_time.setHours( hours );
  start_time.setMinutes( minutes );
  start_time.setSeconds( 0 );

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
  
  var current_total   = seconds_elapsed * rate_per_second;
  element.text( "$" + current_total.toFixed( 2 ) );
  
  var new_size = current_total * 0.001;
  if( new_size < 1  ) new_size = 1;
  if( new_size > 15 ) new_size = 20;
  
  element.css( "font-size", new_size + "em" );
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
  var minutes = now.getMinutes();
  if( minutes < 10 ) minutes = "0" + minutes;
  
  $("#start_time").eq(0).val( now.getHours() + ":" + minutes );
  
  $("#start_time").clockpick({
    military: true,
    layout  : "horizontal"
  });
 } );
