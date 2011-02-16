(function() {
  var MeetingTicker, Time, root;
  MeetingTicker = (function() {
    function MeetingTicker(form, settings) {
      this.options = settings;
      this.form = $(form);
      this.display = $(this.options.displaySelector);
      this.display.hide();
    }
    MeetingTicker.prototype.start = function() {
      this.display.show();
      return this.form.hide();
    };
    MeetingTicker.prototype.stop = function() {};
    MeetingTicker.prototype.amount = 0;
    return MeetingTicker;
  })();
  Time = (function() {
    Time.now = function() {
      return new Time();
    };
    function Time(time) {
      if ((time != null) && (time.getMinutes != null)) {
        this.time = time;
      } else if (typeof time === "number") {
        this.time = new Date(time);
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
