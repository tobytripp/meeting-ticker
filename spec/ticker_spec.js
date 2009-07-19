
Screw.Unit( function() {
  var submitButton = $("form input[type=submit]");
  var dom = $(".content").hide().remove();
  
  before( function() {
    $("body").append( dom.clone() );
  });
  
  after( function() {
    
  });
  
  describe( "form validation", function() {
    it( "should not be valid if the count field is empty", function() {
      
    });
  });
});