var current_amount = 0;
var start_time = null;
var uls = [];

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
  }, 100);
 
  insertNumberLists();

  return timer;
}

function insertNumberLists() {
  for( var a = 1; a < 11; a++ ) {
  	var ul = document.createElement( 'ul' );
  	$(ul).addClass( 'list' );
  	$(ul).attr( 'id', 'list_' + a );
  	$(ul).css({ right:90 * (a - 1) });
  	
    for(var b = 0; b < 10; b++) {     
      var li   = document.createElement( 'li' );
  	  var span = document.createElement( 'span' );
  	  $(span).text( b );
  	  $(span).appendTo( li );
  	  $(li).appendTo( ul );
    }
    
    var li   = document.createElement( 'li' );
  	var span = document.createElement( 'span' );
  	$(span).text( '.' );
  	$(span).appendTo( li );
  	$(li).appendTo( ul );

  	uls.push( ul );
  	$(ul).appendTo( $('.cost_display') );
  }
}

function valid( data ) {
  var valid   = false;
  
  for( key in data ) {    
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
  
  $(".odometer").odometer( "value", current_total );
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
    
    $(".odometer").odometer();
    
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
