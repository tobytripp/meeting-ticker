describe( "MeetingTicker", function () {
  var SECONDS_PER_HOUR = 60.0 * 60.0;
  var UPDATE_INTERVAL  = 125;

  var ticker;
  var now = new Date( Date.parse( "January 1, 1970 13:07" ) );

  beforeEach( function() {
    loadFixtures( 'ticker.html' );
    var mnow = new MeetingTicker.Time( now );
    spyOn( MeetingTicker.Time, 'now' ).andReturn( mnow );
  });

  describe( "after initialization", function() {
    beforeEach( function() {
      $('.ticker').meetingTicker();
      ticker = $('.ticker').data("meeting-ticker").ticker;
    });

    afterEach( function() {
      ticker.stop();
    });

    it( "hides the #display element", function() {
      expect( $("#display") ).toBeHidden();
    });

    describe( "on #start", function() {
      beforeEach( function() {
        ticker.hourlyRate( "200" );
        ticker.attendeeCount("12");
        ticker.start();
      });

      it( "shows the display element", function() {
        expect( $("#display") ).toBeVisible();
      });

      it( "hides the form", function() {
        expect( $("form") ).toBeHidden();
      });
    });

    describe( "#hourlyRate", function() {
      afterEach( function() {
        ticker._rate = null;
      });

      it( "is converted to a float", function() {
        ticker.hourlyRate( "200" );
        expect( ticker.hourlyRate() ).toEqual( 200.00 );
      });

      it( "is fetched from the input field", function() {
        $("#hourly_rate").val( "14" );
        expect( ticker.hourlyRate() ).toEqual( 14 );
      });

      it( "accepts fractional values", function() {
        ticker.hourlyRate( "200.05" );
        expect( ticker.hourlyRate() ).toEqual( 200.05 );
      });

      it( "throws an exception if the rate is not set", function() {
        expect( function() { ticker.hourlyRate() }).toThrow( "Rate is not set." );
      });
    });

    describe( "#attendeeCount", function() {
      it( "is converted to an integer", function() {
        ticker.attendeeCount( "25" );
        expect( ticker.attendeeCount() ).toEqual( 25 );
      });

      it( "is fetched from the input field", function() {
        $("#attendees").val( "14" );
        expect( ticker.attendeeCount() ).toEqual( 14 );
      });

      it( "throws an Error if the count is not set", function() {
        console.log( "attendees: " + $("#attendees").val() );
        expect( function() { ticker.attendeeCount() }).toThrow( "Attendee Count is not set." );
      });
    });

    describe( "start_time", function() {
      it( "defaults to the current time", function() {
        expect( $("#start_time").val() ).toEqual( "13:07" );
      });

      it( "pulls its value from the form (clockpick does not fire #change)", function() {
        ticker.hourlyRate( "200" );
        ticker.attendeeCount("12");
        $("#start_time").val( "03:30" );
        ticker.start();
        expect( ticker.startTime().toString() ).toEqual( "3:30" );
      });
    });

    describe( "form events", function() {
      it( "on the hourly_rate field update the hourlyRate property", function() {
        $("#hourly_rate").val( "125" );
        $("#hourly_rate").change();

        expect( ticker.hourlyRate() ).toEqual( 125.0 );
      });

      it( "on the attendees field update the attendeeCount property", function() {
        $("#attendees").val( "26" );
        $("#attendees").change();

        expect( ticker.attendeeCount() ).toEqual( 26 );
      });

      it( "on submit hides the form's container", function() {
        $("#hourly_rate").val( "125" );
        $("#attendees").val( "12" );

        $("form.ticker").submit();

        expect( $("div#form") ).toBeHidden();
      });

      it( "captures the text of the selected currency option", function() {
        $("form.ticker select").val( "yen" );
        expect( ticker.currency() ).toEqual( "yen" );
      });

      it( "stops the timer when the stop form is submitted", function() {
        ticker.hourlyRate( "4" );
        ticker.attendeeCount( "7" );
        ticker.start();

        $("form.stop").submit();

        expect( ticker.isRunning() ).toBeFalsy();
      });

      it( "captures changes to the start time input", function() {
        $("form.ticker input[name=start_time]").val( "03:30" ).change();
        expect( ticker.startTime().toString() ).toEqual( "3:30" );
      });
    });

    describe( "burn rate", function() {
      var expectedHourlyBurn = 200.0 * 12.0;

      beforeEach( function() {
        ticker.hourlyRate( "200" );
        ticker.attendeeCount( "12" );
      });

      it( "per hour is the multiple of the hourly rate and the attendee count", function() {
        expect( ticker.hourlyBurn() ).toEqual( expectedHourlyBurn );
      });

      it( "per second is also calculated", function() {
        expect( ticker.perSecondBurn() ).
          toEqual( expectedHourlyBurn / SECONDS_PER_HOUR );
      });
    });

    describe( "#cost", function() {
      beforeEach( function() {
        spyOn( MeetingTicker.Time.now(), "secondsSince" ).
          andReturn( 1 * SECONDS_PER_HOUR );

        ticker.hourlyRate( "200" );
        ticker.attendeeCount( "12" );

        ticker.start();
      });

      it( "knows the time elapsed (in seconds) since start", function() {
        expect( ticker.elapsedSeconds() ).toEqual( 3600 );
      });

      it( "calculates the cost based on hourly burn and time elapsed", function() {
        expect( ticker.cost() ).toEqual( 200 * 12 * 1 );
      });

    });

    describe( "#cost before ticker is valid", function() {
      var update_triggered = false;
      beforeEach( function() {
        $(".odometer").bind( "update", function( event, value ) {
          update_triggered = true;
        });
      });

      afterEach( function() {
        ticker.stop();
      });

      it( "stops the timer, no longer triggering updates", function() {
        runs( function() {
          ticker.hourlyRate( "200" );
          ticker.attendeeCount( "12" );
          ticker.start();
        });

        waits( UPDATE_INTERVAL );

        runs( function() {
          expect( update_triggered ).toBeTruthy();
          update_triggered = false;
          $("#hourly_rate").val("");
          ticker._rate = null;
        });

        waits( UPDATE_INTERVAL );

        runs( function() {
          expect( update_triggered ).toBeFalsy();
        });
      });

      it( "raises the error", function() {
        expect( function() { ticker.cost(); } ).toThrow( new Error("Rate is not set.") );
      });
    });

    describe( "#start when inputs are valid", function() {
      var update_triggered = false;
      beforeEach( function() {
        ticker.hourlyRate( "180" );
        ticker.attendeeCount( "5" );
        update_triggered = false;
        $(".odometer").bind( "update", function( event, value ) {
          console.log( "update triggered on odometer with " + value );
          update_triggered = true;
        });
      });

      it( "updates the 'started at' text", function() {
        ticker.start();
        expect( $("#started_at") ).toHaveText( "(we began at 13:07)" );
      });

      it( "sets up the odometer", function() {
        spyOn( ticker.odometerElement, 'odometer' )
        ticker.start();

        expect( ticker.odometerElement.odometer ).toHaveBeenCalled();
      });

      it( "triggers an 'update' event on the odometer after a delay", function() {
        runs( function() {
          ticker.hourlyRate( "180" );
          ticker.attendeeCount( "24" );

          ticker.start();
          expect( update_triggered ).toBeFalsy();
        });

         waits( UPDATE_INTERVAL );

        runs( function() { expect( update_triggered ).toBeTruthy() });
      });

      it( "triggers an 'update' event on the odometer with the current cost", function() {
        var update_value = 0;
        spyOn( MeetingTicker.Time.now(), "secondsSince" ).
          andReturn( 3 * SECONDS_PER_HOUR );

        $(".odometer").bind( "update", function( event, value ) { update_value = value; } );

        runs( function() {
          ticker.hourlyRate( "180" );
          ticker.attendeeCount( "24" );

          ticker.start();
        });

        waits( UPDATE_INTERVAL );

        runs( function() { 
          expect( update_value ).toEqual( ticker.cost() );
        });
      });

      it( "sets the currency prefix for the odometer", function() {
        ticker.start();
        expect( ticker.currencyLabel() ).toEqual( "$" );
        expect( $(".odometer span.prefix") ).toHaveText( "$" );
      });
    });

    describe("#start when inputs are not valid", function() {
      var update_triggered = false;
      beforeEach( function() {
        update_triggered = false;
        $(".odometer").bind( "update", function( event, value ) {
          update_triggered = true;
        });
      });

      it( "does not trigger an update if not correctly set up", function() {
        runs( function() {
          ticker._rate = null;
          ticker.start();
        });

        waits( UPDATE_INTERVAL );

        runs( function() { expect( update_triggered ).toBeFalsy() });
      });

      it( "does not hide the form if not valid", function() {
        ticker._rate = null;
        $("input[hourly_rate]").val( "" );
        ticker.start();
        expect( $("#form") ).toBeVisible();
      });
    });
  });

  describe( ".Time", function() {
    it( "accepts ms since epoch in its constructor", function() {
      var msSinceEpoch = Date.parse( "January 1, 1970 13:07" );
      var time = new MeetingTicker.Time( msSinceEpoch );

      expect( time.toString() ).toEqual( "13:07" );
    });

    it( "accepts a Date object in its constructor", function() {
      var ms = Date.parse( "January 2, 1980 14:02" );
      var time = new MeetingTicker.Time( new Date( ms ) );

      expect( time.toString() ).toEqual( "14:02" );
    });

    it( "can accept another Time object in its constructor", function() {
      var time = new MeetingTicker.Time( now );
      expect( new MeetingTicker.Time( time ).toString() ).
        toEqual( time.toString() );
    });

    it( "can accept an HH:MM formatted string in its constructor", function() {
      var time = new MeetingTicker.Time( "19:42" );
      expect( time.toString() ).toEqual( "19:42" );
    });

    it( "sets the seconds to zero if given a string", function() {
      var time = new MeetingTicker.Time( "19:42" );
      expect( time.time.getSeconds() ).toEqual( 0 );
    });

    it( "can calculate the number of seconds passed since a given Time", function() {
      var then = new MeetingTicker.Time( Date.parse( "January 2, 1980 14:02:00" ) );
      var now  = new MeetingTicker.Time( Date.parse( "January 2, 1980 14:03:35" ) );

      expect( now.secondsSince( then ) ).toEqual( 95 );
    });
  });

  describe( "currency locale setup for en-gb", function() {
    var locale;
    beforeEach( function() {
      locale = new MeetingTicker.Locale( "gb" );
      spyOn( MeetingTicker.Locale, "current" ).andReturn( locale );
      $('.ticker').meetingTicker();
      ticker = $('.ticker').data("meeting-ticker").ticker;
      $("input[name=attendees]").val( "12" );
      $("input[name=hourly_rate]").val("12.50");
    });

    it( "sets its language to 'gb'", function() {
      expect( locale.language ).toEqual( 'gb' );
    });

    it( "has a currency value of 'pound'", function() {
      expect( locale.currency() ).toEqual( "pound" );
    });

    it( "sets the currency select to 'pound'", function() {
      expect( $(".ticker select[name=units]") ).toHaveValue( "pound" );
    });

    it( "sets the odometer prefix to the correct currency", function() {
      ticker.start();
      expect( ticker.currencyLabel() ).toEqual( "£" );
      expect( $(".odometer span.prefix") ).toHaveText( "£" );
    });
  });

  describe( "with currency locale setup for nl", function() {
    beforeEach( function() {
      spyOn( MeetingTicker.Locale, "current" ).
        andReturn( new MeetingTicker.Locale( "nl" ) );
      $('.ticker').meetingTicker();
      ticker = $('.ticker').data("meeting-ticker").ticker;
    });

    it( "has a currency value of 'euro'", function() {
      var locale = new MeetingTicker.Locale( "nl" );
      expect( locale.currency() ).toEqual( "euro" );
    });

    it( "sets the select to 'euro'", function() {
      expect( $(".ticker select[name=units]") ).toHaveValue( "euro" );
    });
  });

  describe( "with currency locale setup for sweden", function() {
    beforeEach( function() {
      spyOn( MeetingTicker.Locale, "current" ).
        andReturn( new MeetingTicker.Locale( "sv" ) );
      $('.ticker').meetingTicker();
      ticker = $('.ticker').data("meeting-ticker").ticker;
    });

    it( "has a currency value of 'Kr'", function() {
      var locale = new MeetingTicker.Locale( "sv" );
      expect( locale.currency() ).toEqual( "Kr" );
    });

    it( "sets the select to 'Kr'", function() {
      expect( $(".ticker select[name=units]") ).toHaveValue( "Kr" );
    });
  });
});
