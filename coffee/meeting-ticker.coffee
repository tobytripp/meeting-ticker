
class MeetingTicker
  constructor: (form, settings) ->
    @options = settings
    @form    = $(form)
    @display = $( @options.displaySelector )

    @display.hide()

  start: () ->
    @display.show()
    @form.hide()

  stop: () ->

  amount: 0

class Time
  @now: () ->
    new Time()

  constructor: (time) ->
    if time? and time.getMinutes?
      @time = time
    else if typeof time == "number"
      @time = new Date( time )
    else
      @time = new Date()

  secondsSince: (past) ->
    (@time - past.time) / 1000

  toString: () ->
    minutes = @time.getMinutes()
    minutes = "0" + minutes if minutes < 10
    @time.getHours() + ":" + minutes

$.fn.meetingTicker = (options) ->
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

root = exports ? this # Node.js or DOM?
MeetingTicker.Time = Time
root.MeetingTicker = MeetingTicker

