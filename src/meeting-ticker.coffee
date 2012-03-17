$ = jQuery

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

    this._initForm()
    this._bindFormEvents()
    this._detectCurrency()

  start: ->
    return unless this.valid()

    this.startTime( this._formElement( "start_time" ).val() )

    @display.show()
    @form.parent().hide()
    $("#started_at").text "(we began at #{this.startTime().toString()})"
    @odometerElement.odometer({ prefix: this.currencyLabel() })

    @timer = setInterval(
      (() => @odometerElement.trigger( "update", this.cost() )),
      UPDATE_INTERVAL
    )

  stop: ->
    console.log("Stopped...")
    clearInterval @timer
    @timer = null

  isRunning: -> @timer?

  cost: ->
    try
      this.perSecondBurn() * this.elapsedSeconds()
    catch e
      this.stop()
      throw e

  hourlyRate: (rate) ->
    input = this._formElement( "hourly_rate" )
    if rate?
      @_rate = parseFloat( rate )
      input.val( @_rate )
    else if input.val()?
      @_rate = parseFloat( input.val() )

    throw new Error( "Rate is not set." ) if not @_rate? or isNaN( @_rate )
    @_rate

  attendeeCount: (count) ->
    input = this._formElement( "attendees" );
    if count?
      @_attendees = parseInt( count )
      input.val( @_attendees )
    else if input.val()?
      @_attendees = parseInt( input.val() )

    throw new Error( "Attendee Count is not set." ) if not @_attendees? or isNaN( @_attendees )
    @_attendees

  startTime: (time) ->
    return @_startTime if this.isRunning()
    input = this._formElement( "start_time" )
    if time?
      @_startTime = new Time( time )
      input.val( @_startTime.toString() )

    @_startTime

  elapsedSeconds: ->
      Time.now().secondsSince this.startTime()

  hourlyBurn: ->
    this.hourlyRate() * this.attendeeCount()

  perSecondBurn: ->
    this.hourlyBurn() / SECONDS_PER_HOUR

  currency: (newCurrency) ->
    view = @form.find( "select[name=units]" )
    if newCurrency? and view.val() != newCurrency
      view.val( newCurrency )
    view.val()

  currencyLabel: ->
    @form.find( "select[name=units] option:selected" ).text()

  valid: ->
    @form.valid()

  _initForm: ->
    this.startTime( Time.now() ) unless this.startTime()?
    $("input.watermark").each ->
      $(this).watermark( $(this).attr( "title" ) )
    $("#start_time").clockpick({
      military: true,
      starthour: 0,
      endhour:  23,
      layout: "vertical"
    })
    @form.validate
      rules:
        attendees:
          required: true
          min:      1
          number:   true
        hourly_rate:
          required: true
          number:   true
          min:      0.01
        start_time: "required"
      messages:
        attendees:   "Must be a number greater than zero"
        hourly_rate: "Must be a number greater than zero"

  _bindFormEvents: ->
    this._formElement( "start_time" ).change (event) =>
      event.preventDefault()
      this.startTime( $(event.target).val() )

    this._formElement( "hourly_rate" ).change (event) =>
      event.preventDefault()
      this.hourlyRate $(event.target).val()

    this._formElement( "attendees" ).change (event) =>
      event.preventDefault()
      this.attendeeCount $(event.target).val()

    @form.submit (event) =>
      event.preventDefault()
      this.start()

    $("form.stop").submit (event) =>
      event.preventDefault()
      this.stop()

  _detectCurrency: -> this.currency( Locale.current().currency() )

  _formElement: (name) -> @form.find( "input[name=#{name}]" )

class Time
  @now: ->
    new Time()

  constructor: (time) ->
    if time? and time.getMinutes?
      @time = time
    else if typeof time == "number"
      @time = new Date( time )
    else if typeof time == "string" and time.length > 0
      [hours, minutes] = time.split ":"
      @time = new Date()
      @time.setHours   parseInt( hours )
      @time.setMinutes parseInt( minutes )
      @time.setSeconds 0
    else if time instanceof Time
      @time = time.time
    else
      @time = new Date()

  secondsSince: (past) ->
    diff = @time.getTime() - past.time.getTime()
    diff / 1000.00

  toString: ->
    minutes = @time.getMinutes()
    minutes = "0" + minutes if minutes < 10
    @time.getHours() + ":" + minutes

class Locale
  @current: ->
    new Locale()

  constructor: (language) ->
    if language?
      @language = language
      return

    if navigator?
      lang = navigator.language ? navigator.userLanguage
    else
      lang = "en-us"

    lang = lang.toLowerCase().split("-")
    if lang[0] == "en"
      @language = lang[1]
    else
      @language = lang[0]

  currency: ->
    switch @language
      when "us" then "$"
      when "gb" then "pound"
      when 'ca', 'de', 'el', 'es', 'et', 'fi', \
           'fr', 'ga', 'it', 'lb', 'mt', 'nl', \
           'pt', 'sk', 'sl'
        "euro"
      when 'ja' then "yen"
      when 'sv' then "Kr"


console.log( "installing plugin…" )
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
root.MeetingTicker        = MeetingTicker
root.MeetingTicker.Time   = Time
root.MeetingTicker.Locale = Locale
