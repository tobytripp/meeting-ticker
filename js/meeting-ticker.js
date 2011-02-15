;var MeetingTicker;

(function($) {
  var SECONDS_PER_HOUR = 60.0 * 60.0;
  var UPDATE_INTERVAL  = 250; // ms

  MeetingTicker = function( form, settings ) {
    this.form     = $(form);
    this.settings = settings;

    this.odometerElement = $(".odometer");

    this.init();
  }

  MeetingTicker.prototype = {
    init: function() {
      self = this;
      this.display().hide();
      this.amount = 0;

      this._bindEvents();
      this._initForm();
      this._detectCurrency();
    },

    display: function() {
      if( !this.settings.display ) {
        this.settings.display = $( this.settings.displaySelector );
      }
      return this.settings.display;
    },

    start: function() {
      var self = this;
      this.form.parent().hide();

      $("#started_at").text( "(we began at " + this.startTime().toString() + ")" );

      this.display().fadeIn( 1500 );
      this.odometerElement.odometer({ prefix: self.currencyLabel() });

      this.timer = setInterval( function() {
        self.odometerElement.trigger( "update", self.cost() );
      }, UPDATE_INTERVAL );
    },

    stop: function() {
      clearInterval( this.timer );
    },

    cost: function() {
      return this.perSecondBurn() * this.elapsedSeconds();
    },

    hourlyRate: function( rate ) {
      if( rate ) { this.rate = parseFloat( rate ); }
      if( !this.rate ) { throw new Error( "Rate is not set." ); }
      return this.rate;
    },

    attendeeCount: function( count ) {
      if( count ) { this.count = parseInt( count ); }
      if( !this.count ) { throw new Error( "Attendee Count is not set." ); }
      return this.count;
    },

    currency: function( newCurrency ) {
      var view = this.form.find( "select[name=units]" );
      if( newCurrency ) {
        if( view.val() != newCurrency ) {
          view.val( newCurrency );
        }
      }

      return view.val();
    },

    currencyLabel: function() {
      return this.form.find( "select[name=units] option:selected" ).text();
    },

    hourlyBurn: function() {
      return this.hourlyRate() * this.attendeeCount();
    },

    perSecondBurn: function() {
      return this.hourlyBurn() / SECONDS_PER_HOUR;
    },

    elapsedSeconds: function() {
      return MeetingTicker.Time.now().secondsSince( this.startTime() );
    },

    startTime: function( time ) {
      if( time ) {
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
    },

    _detectCurrency: function() {
      var locale = MeetingTicker.Locale.current();
      console.log( "Setting currency to " + locale.currency() );
      this.currency( locale.currency() );
    },
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

  MeetingTicker.Time.prototype.secondsSince = function( then ) {
    return (this.time - then.time) / 1000;
  }
})(jQuery);

(function($) {
  MeetingTicker.Locale = function( language ) {
    if( language ) { this.language = language; return; }

    var lang;
    if( typeof navigator != null ) {
      lang = navigator.language ? navigator.language : navigator.userLanguage;
    } else {
      lang = "en-us"; // Fall-back
    }

    lang = lang.toLowerCase().split("-");
    if( lang[0] === "en" ) {
      this.language = lang[1];
    } else {
      this.language = lang[0];
    }
  }

  MeetingTicker.Locale.prototype = {
    euro:   "euro",
    dollar: "$",
    yen:    "yen",
    pound:  "pound",

    currency: function() {
      return {
        'us': this.dollar,
        'gb': this.pound,
        'ca': this.euro,
        'de': this.euro,
        'el': this.euro,
        'es': this.euro,
        'et': this.euro,
        'fi': this.euro,
        'fr': this.euro,
        'ga': this.euro,
        'it': this.euro,
        'lb': this.euro,
        'mt': this.euro,
        'nl': this.euro,
        'pt': this.euro,
        'sk': this.euro,
        'sl': this.euro,
        'sv': this.euro,
        'ja': this.yen
      }[this.language];
    }
  }

  MeetingTicker.Locale.current = function() { return new MeetingTicker.Locale(); }
})(jQuery);

$(function() { $('.ticker').meetingTicker() });





var current_amount = 0;
var start_time = null;

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
