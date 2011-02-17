;var MeetingTicker;

(function($) {
  var SECONDS_PER_HOUR = 60.0 * 60.0;
  var UPDATE_INTERVAL  = 125; // ms

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
      if( rate ) { this._rate = parseFloat( rate ); }
      if( !this._rate ) { throw new Error( "Rate is not set." ); }

      return this._rate;
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
      try {
        return this.hourlyRate() * this.attendeeCount();
      } catch( error ) {
        this.stop();
        throw error;
      }
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

        if( $(this).valid() ) {
          $(".error").hide();
          self.start();
        }

        return false;
      });

      this.form.find( "input[name=start_time]" ).change( function(e) {
        e.preventDefault();
        self.startTime( $(e.target).val() );
      });

      this.form.find( "input[name=hourly_rate]" ).change( function( e ) {
        e.preventDefault();
        self.hourlyRate( $(e.target).val() )
      });

      this.form.find( "input[name=attendees]" ).change( function( e ) {
        e.preventDefault();
        self.attendeeCount( $(e.target).val() );
      });

      this.display().find( "form.stop" ).submit( function( event ) {
        event.preventDefault();
        self.stop();
        return false;
      });
    },

    _initForm: function() {
      if( ! this.startTime() ) {
        this.startTime( MeetingTicker.Time.now() );
      }

      $("input.watermark").each( function() {
        $(this).watermark( $(this).attr( "title" ) );
      });

      $("#start_time").clockpick({
        military: true,
        layout  : "horizontal"
      });

      this.form.validate({
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
    },

    _detectCurrency: function() {
      var locale = MeetingTicker.Locale.current();
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
    } else if( typeof time === "string" ) {
      this.time = new Date();
      components = time.split(":");
      this.time.setHours(   parseInt( components[0] ) );
      this.time.setMinutes( parseInt( components[1] ) );
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
