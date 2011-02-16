root = exports ? this # Node.js or DOM?

class MeetingTicker
  constructor: (form, settings) ->
    @options = settings
    @form    = $(form)
    @display = $( @options.displaySelector )

    @display.hide()

  stop: () ->

  amount: 0

class Time
  @now: () ->
    new Time()

MeetingTicker.Time = Time
root.MeetingTicker = MeetingTicker

$.fn.meetingTicker = ( options ) ->
  settings =
    displaySelector: "#display"

  this.each ->
    $this = $(this)
    $.extend( settings, options ) if options

    data = $this.data( 'meeting-ticker' )
    if !data
      $this.data( "meeting-ticker", {
        target: this,
        ticker: new MeetingTicker( this, settings )
      })
