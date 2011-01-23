describe( "MeetingTicker", function () {
  var ticker;
  var now = new Date( Date.parse( "January 1, 1970 13:07" ) );

  beforeEach( function() {
    loadFixtures( 'ticker.html' );

    var mnow = new MeetingTicker.Time( now );
    spyOn( MeetingTicker.Time, 'now' ).andReturn( mnow );

    $('.ticker').meetingTicker();
    ticker = $('.ticker').data("meeting-ticker").ticker;
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
  });

  describe( "#attendeeCount", function() {
    it( "is converted to an integer", function() {
      ticker.attendeeCount( "25" );
      expect( ticker.attendeeCount() ).toEqual( 25 );
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
      $("form.ticker").submit();
      expect( $("div#form") ).toBeHidden();
    });
  });

  describe( ".Time", function() {
    it( "accepts a ms since epoch in its constructor", function() {
      var msSinceEpoch = Date.parse( "January 1, 1970 13:07" );
      var time = new MeetingTicker.Time( msSinceEpoch );

      expect( time.toString() ).toEqual( "13:07" );
    });

    it( "accepts a Date object in its constructor", function() {
      var ms = Date.parse( "January 2, 1980 14:02" );
      var time = new MeetingTicker.Time( new Date( ms ) );

      expect( time.toString() ).toEqual( "14:02" );
    });
  });

  describe( "start_time", function() {

    it( "defaults to the current time", function() {
      expect( $("#start_time").val() ).toEqual( "13:07" );
    });

    it( "is updated from the #start_time input" );
  });

  describe( "#start", function() {
    beforeEach( function() {
      ticker.start();
    });

    it( "updates the 'started at' text", function() {
      expect( $("#started_at") ).toHaveText( "(we began at 13:07)" );
    });
  });
});
