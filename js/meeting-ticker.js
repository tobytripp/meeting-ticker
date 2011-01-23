;var MeetingTicker;

(function($) {
  MeetingTicker = function( form, settings ) {
    this.form     = $(form);
    this.settings = settings;

    this.init();
  }

  MeetingTicker.prototype = {
    init: function() {
      self = this;
      this.display().hide();
      this.amount = 0;

      this._bindEvents();
      this._initForm();
    },

    display: function() {
      if( !this.settings.display ) {
        this.settings.display = $( this.settings.displaySelector );
      }
      return this.settings.display;
    },

    start: function() {
      this.form.parent().hide();

      $("#started_at").text( "(we began at " + this.startTime().toString() + ")" );

      this.display().show();
    },

    hourlyRate: function( rate ) {
      if( rate ) { this.rate = parseFloat( rate ); }
      return this.rate;
    },

    attendeeCount: function( count ) {
      if( count ) { this.count = parseInt( count ); }
      return this.count;
    },

    startTime: function( time ) {
      if( time ) {
        console.log( time );
        console.log( new MeetingTicker.Time( time ) );

        var start = this.form.find( "input[name=start_time]" );
        this.startedAt = new MeetingTicker.Time( time );
        start.val( this.startedAt.toString() );
      }

      return this.startedAt;
    },

    _bindEvents: function() {
      var self = this;
      this.form.submit( function(e) {
        e.preventDefault();
        self.start();
      });

      this.form.find( "input[name=hourly_rate]" ).change( function( e ) {
        e.preventDefault();
        self.hourlyRate( $(e.target).val() )
      });

      this.form.find( "input[name=attendees]" ).change( function( e ) {
        e.preventDefault();
        self.attendeeCount( $(e.target).val() );
      });

    },

    _initForm: function() {
      if( ! this.startTime() ) {
        this.startTime( MeetingTicker.Time.now() );
      }
    }
  };

  $.fn.meetingTicker = function( options ) {
    var settings = {
      displaySelector: "#display"
    };

    return this.each( function() {
      var $this = $(this);
      if( options) { $.extend( settings, options ); }

      var data = $this.data('meeting-ticker');
      if( !data ) {
        $this.data( "meeting-ticker", {
          target: this,
          ticker: new MeetingTicker( this, settings )
        });
      }
    });
  }
})(jQuery);

(function($) {
  MeetingTicker.Time = function( time ) {
    if( time && time.getHours ) {
      this.time = time;
    } else if( time instanceof MeetingTicker.Time ) { // FIXME: smelly
      this.time = time.time;
    } else if( typeof time === "number" ) {
      this.time = new Date( time );
    } else {
      this.time = new Date();
    }
  }

  MeetingTicker.Time.now = function() {
    return new MeetingTicker.Time();
  }

  MeetingTicker.Time.prototype.toString = function() {
    var minutes = this.time.getMinutes();
    if( minutes < 10 ) minutes = "0" + minutes;
    return this.time.getHours() + ":" + minutes;
  }
})(jQuery);

$(function() { $('.ticker').meetingTicker() });

var current_amount = 0;
var start_time = null;
var uls = [];

function init() {
  var timer = null;
  var self = this;

  $("#display").hide();
  $("input.watermark").each( function() {
    $(this).watermark( $(this).attr( "title" ) );
  } );

  var setupForm = $('form.setup');

  if (typeof navigator != null) {
    var lang = navigator.language ? navigator.language : navigator.userLanguage;
    if (lang) {
      var unit = null;
      lang = lang.toLowerCase().split('-');
      if (lang[0] === 'en' && lang[1] === 'gb') unit = '£';
      else switch (lang[0]) {
        case 'ca':
        case 'de':
        case 'el':
        case 'es':
        case 'et':
        case 'fi':
        case 'fr':
        case 'ga':
        case 'it':
        case 'lb':
        case 'mt':
        case 'nl':
        case 'pt':
        case 'sk':
        case 'sl':
        case 'sv':
          unit = '€';
          break;
        case 'ja':
          unit = '¥';
          break;
      }
      if (unit) setupForm.find('select').val(unit);
    }
  }

  setupForm.validate({
    rules: {
      attendees: {
        required: true,
        min:      1,
        number:   true
      },
      hourly_rate: {
        required: true,
        number:   true,
        min:      0.01
      },
      start_time: "required"
    },

    messages: {
      attendees:   "Must be a number greater than zero.",
      hourly_rate: "Must be a number greater than zero."
    }
  });

  setupForm.submit( function( event ) {
    event.preventDefault();

    if( $(this).valid() ) {
      $(".error").hide();

      timer = begin( this );
      if( timer ) {
        $(this).parent().hide();
        $("#started_at").text( "(we began at " + start_time.toLocaleTimeString() + ")" );
        $("#display").fadeIn( 1500 );
        $(".odometer").odometer({ prefix: self.data.units });
      }
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

}

function begin( form ) {
  this.data = {
    hourly_rate: $(form).find("input[name=hourly_rate]").val(),
    attendees:   $(form).find("input[name=attendees]").val(),
    units:       $(form).find("select").val()
  }
  var display = $(".cost_display");

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

  return timer;
}

function valid( data ) {
  var valid   = false;

  for( key in data ) {
    var error = $("dd:has(:input[name=" + key + "])").find( ".error" );

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

// $(document).ready( function() { init(); });
