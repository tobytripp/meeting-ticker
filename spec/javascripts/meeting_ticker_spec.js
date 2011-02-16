describe( "MeetingTicker", function () {
  var SECONDS_PER_HOUR = 60.0 * 60.0;
  var UPDATE_INTERVAL  = 250;

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

    describe( "upon initialization", function() {
      it( "has an amount property of 0", function() {
        expect( ticker.amount ).toEqual( 0 );
      });

      it( "hides the #display element", function() {
        expect( $("#display") ).toBeHidden();
      });
    });

    describe( "on #start", function() {
      beforeEach( function() {
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
      it( "is converted to a float", function() {
        ticker.hourlyRate( "200" );
        expect( ticker.hourlyRate() ).toEqual( 200.00 );
      });

      it( "throws an exception if the rate is not set", function() {
        expect( ticker.hourlyRate ).toThrow( "Rate is not set." );
      });
    });

    describe( "#attendeeCount", function() {
      it( "is converted to an integer", function() {
        ticker.attendeeCount( "25" );
        expect( ticker.attendeeCount() ).toEqual( 25 );
      });

      it( "throws an Error if the count is not set", function() {
        expect( ticker.attendeeCount ).toThrow( "Attendee Count is not set." );
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
    });

    describe( "start_time", function() {
      it( "defaults to the current time", function() {
        expect( $("#start_time").val() ).toEqual( "13:07" );
      });

      it( "is updated from the #start_time input" );
    });

    describe( "#start", function() {
      var update_triggered = false;
      beforeEach( function() {
        $(".odometer").bind( "update", function( event, value ) {
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

      it( "does not trigger an update if not correctly set up", function() {
        runs( function() {
          ticker.start();
          expect( update_triggered ).toBeFalsy();
        });

        waits( UPDATE_INTERVAL );

        runs( function() { expect( update_triggered ).toBeFalsy() });
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

        runs( function() { expect( update_value ).toEqual( ticker.cost() ) });
      });

      it( "sets the currency prefix for the odometer", function() {
        ticker.start();
        expect( ticker.currencyLabel() ).toEqual( "$" );
        expect( $(".odometer span.prefix") ).toHaveText( "$" );
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

    it( "can calculate the number of seconds passed since a given Time", function() {
      var then = new MeetingTicker.Time( Date.parse( "January 2, 1980 14:02" ) );
      var now  = new MeetingTicker.Time( Date.parse( "January 2, 1980 14:03" ) );

      expect( now.secondsSince( then ) ).toEqual( 60 );
    });
  });

  describe( "currency locale setup for en-gb", function() {
    beforeEach( function() {
      spyOn( MeetingTicker.Locale, "current" ).
        andReturn( new MeetingTicker.Locale( "gb" ) );
      $('.ticker').meetingTicker();
      ticker = $('.ticker').data("meeting-ticker").ticker;
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

    it( "sets the select to 'euro'", function() {
      expect( $(".ticker select[name=units]") ).toHaveValue( "euro" );
    });
  });

});
