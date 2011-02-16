(function() {
  var MeetingTicker, Time, root;
  root = typeof exports != "undefined" && exports !== null ? exports : this;
  MeetingTicker = (function() {
    function MeetingTicker(form, settings) {
      this.options = settings;
      this.form = $(form);
      this.display = $(this.options.displaySelector);
      this.display.hide();
    }
    MeetingTicker.prototype.stop = function() {};
    MeetingTicker.prototype.amount = 0;
    return MeetingTicker;
  })();
  Time = (function() {
    function Time() {}
    Time.now = function() {
      return new Time();
    };
    return Time;
  })();
  MeetingTicker.Time = Time;
  root.MeetingTicker = MeetingTicker;
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
}).call(this);
