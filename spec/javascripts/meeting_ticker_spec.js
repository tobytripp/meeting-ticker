describe( "MeetingTicker", function () {
  var ticker;

  beforeEach( function() {
    loadFixtures( 'ticker.html' );
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

  describe( "start_time", function() {
    var startTime= new Date();

    beforeEach( function() {
      spyOn( MeetingTicker.Time, 'now' ).andReturn( startTime );
    });

    it( "defaults to the current time", function() {
      expect( $("#start_time").val() ).toEqual( startTime.getHours() + ":" + startTime.getMinutes() );
    });

    it( "is updated from the #start_time input" );
  });

  describe( "#start", function() {
    beforeEach( function() {
      ticker.start();
    });

    it( "updates the 'started at' text", function() {
      // expect( $("#started_at") ).toHaveText( "(we began at " );
    });
  });
});
