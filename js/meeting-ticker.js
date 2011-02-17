(function() {
  var MeetingTicker, SECONDS_PER_HOUR, Time, UPDATE_INTERVAL, root;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  UPDATE_INTERVAL = 125;
  SECONDS_PER_HOUR = 60.0 * 60.0;
  MeetingTicker = (function() {
    function MeetingTicker(form, settings) {
      this.options = settings;
      this.form = $(form);
      this.display = $(this.options.displaySelector);
      this.odometerElement = $(".odometer");
      this.display.hide();
      if (this.startTime() == null) {
        this.startTime(Time.now());
      }
      this._bindFormEvents();
    }
    MeetingTicker.prototype.start = function() {
      this.display.show();
      this.form.parent().hide();
      $("#started_at").text("(we began at " + (this.startTime().toString()) + ")");
      this.odometerElement.odometer();
      return this.timer = setInterval((__bind(function() {
        return this.odometerElement.trigger("update", 0);
      }, this)), UPDATE_INTERVAL);
    };
    MeetingTicker.prototype.stop = function() {
      return clearInterval(this.timer);
    };
    MeetingTicker.prototype.hourlyRate = function(rate) {
      if (rate != null) {
        this._rate = parseFloat(rate);
      }
      if (this._rate == null) {
        throw new Error("Rate is not set.");
      }
      return this._rate;
    };
    MeetingTicker.prototype.attendeeCount = function(count) {
      if (count != null) {
        this._attendees = parseInt(count);
      }
      if (this._attendees == null) {
        throw new Error("Attendee Count is not set.");
      }
      return this._attendees;
    };
    MeetingTicker.prototype.startTime = function(time) {
      if (time != null) {
        this._startTime = new Time(time);
        this.form.find("input[name=start_time]").val(this._startTime.toString());
      }
      return this._startTime;
    };
    MeetingTicker.prototype.elapsedSeconds = function() {
      return Time.now().secondsSince(this.startTime());
    };
    MeetingTicker.prototype.hourlyBurn = function() {
      return this.hourlyRate() * this.attendeeCount();
    };
    MeetingTicker.prototype.perSecondBurn = function() {
      return this.hourlyBurn() / SECONDS_PER_HOUR;
    };
    MeetingTicker.prototype.currency = function() {
      return this.form.find("select[name=units]").val();
    };
    MeetingTicker.prototype._bindFormEvents = function() {
      this.form.find("input[name=start_time]").change(__bind(function(event) {
        event.preventDefault();
        return this.startTime($(event.target).val());
      }, this));
      this.form.find("input[name=hourly_rate]").change(__bind(function(event) {
        event.preventDefault();
        return this.hourlyRate($(event.target).val());
      }, this));
      this.form.find("input[name=attendees]").change(__bind(function(event) {
        event.preventDefault;
        return this.attendeeCount($(event.target).val());
      }, this));
      return this.form.submit(__bind(function(event) {
        event.preventDefault;
        return this.start();
      }, this));
    };
    return MeetingTicker;
  })();
  Time = (function() {
    Time.now = function() {
      return new Time();
    };
    function Time(time) {
      var hours, minutes, _ref;
      if ((time != null) && (time.getMinutes != null)) {
        this.time = time;
      } else if (typeof time === "number") {
        this.time = new Date(time);
      } else if (typeof time === "string") {
        _ref = time.split(":"), hours = _ref[0], minutes = _ref[1];
        this.time = new Date();
        this.time.setHours(parseInt(hours));
        this.time.setMinutes(parseInt(minutes));
      } else if (time instanceof Time) {
        this.time = time.time;
      } else {
        this.time = new Date();
      }
    }
    Time.prototype.secondsSince = function(past) {
      return (this.time - past.time) / 1000;
    };
    Time.prototype.toString = function() {
      var minutes;
      minutes = this.time.getMinutes();
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      return this.time.getHours() + ":" + minutes;
    };
    return Time;
  })();
  $.fn.meetingTicker = function(options) {
    var settings;
    settings = {
      displaySelector: "#display"
    };
    return this.each(function() {
      var $this, data;
      $this = $(this);
      if (options) {
        $.extend(settings, options);
      }
      data = $this.data('meeting-ticker');
      if (!data) {
        return $this.data("meeting-ticker", {
          target: this,
          ticker: new MeetingTicker(this, settings)
        });
      }
    });
  };
  root = typeof exports != "undefined" && exports !== null ? exports : this;
  MeetingTicker.Time = Time;
  root.MeetingTicker = MeetingTicker;
}).call(this);
