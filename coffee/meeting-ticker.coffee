UPDATE_INTERVAL  = 125
SECONDS_PER_HOUR = 60.0 * 60.0

class MeetingTicker
  constructor: (form, settings) ->
    @options = settings
    @form    = $(form)
    @display = $( @options.displaySelector )
    @odometerElement = $(".odometer")

    @display.hide()

    this.startTime( Time.now() ) unless this.startTime()?

    this._bindFormEvents()

  start: () ->
    @display.show()
    @form.parent().hide()
    $("#started_at").text "(we began at #{this.startTime().toString()})"
    @odometerElement.odometer({ prefix: this.currencyLabel() })

    @timer = setInterval(
      (() => @odometerElement.trigger( "update", this.cost() )),
      UPDATE_INTERVAL )

  stop: () ->
    clearInterval @timer

  cost: () ->
    try
      this.perSecondBurn() * this.elapsedSeconds()
    catch e
      this.stop()
      throw e

  hourlyRate: (rate) ->
    @_rate = parseFloat( rate ) if rate?
    throw new Error( "Rate is not set." ) unless @_rate?
    @_rate

  attendeeCount: (count) ->
    @_attendees = parseInt( count ) if count?
    throw new Error( "Attendee Count is not set." ) unless @_attendees?
    @_attendees

  startTime: (time) ->
    if time?
      @_startTime = new Time( time )
      @form.find( "input[name=start_time]" ).val( @_startTime.toString() )

    @_startTime

  elapsedSeconds: () ->
      Time.now().secondsSince this.startTime()

  hourlyBurn: () ->
    this.hourlyRate() * this.attendeeCount()

  perSecondBurn: () ->
    this.hourlyBurn() / SECONDS_PER_HOUR

  currency: () ->
    @form.find( "select[name=units]" ).val()

  currencyLabel: () ->
    @form.find( "select[name=units] option:selected" ).text()

  _bindFormEvents: () ->
    @form.find( "input[name=start_time]" ).change (event) =>
      event.preventDefault()
      this.startTime( $(event.target).val() )

    @form.find( "input[name=hourly_rate]" ).change (event) =>
      event.preventDefault()
      this.hourlyRate $(event.target).val()

    @form.find( "input[name=attendees]" ).change (event) =>
      event.preventDefault
      this.attendeeCount $(event.target).val()

    @form.submit (event) =>
      event.preventDefault
      this.start()

class Time
  @now: () ->
    new Time()

  constructor: (time) ->
    if time? and time.getMinutes?
      @time = time
    else if typeof time == "number"
      @time = new Date( time )
    else if typeof time == "string"
      [hours, minutes] = time.split ":"
      @time = new Date()
      @time.setHours parseInt( hours )
      @time.setMinutes parseInt( minutes )
    else if time instanceof Time
      @time = time.time
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

