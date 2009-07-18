;(function($){
  
$.widget( "ui.odometer", {
  
  _init: function() {
    var options = this.options;
    
    this.element.addClass( "odometer" );
    
    this.columns = this._addLists( this.element, this.options.columns );
    if( this.options.prefix ) {
      var prefix = $("<span/>").text( this.options.prefix ).addClass( "prefix" );
      $(this.element).prepend( prefix );
    }
    
    this.value( this.options.initialValue );
  },
  
  value: function( n ) {
    var val = n.toFixed( 2 );

    for( var i = val.length - 1; i >= 0; i-- ) {
      this.setColumn( val.length - 1 - i, val[i] );
    }
  },
  
  setColumn: function( index, value ) {

    if( value == '.' ) {
      $( this.columns[index] ).animate({
        top: -(10 * $(this.element).height() )
      }, { duration: 25 });
    } else {
      $( this.columns[index] ).animate({
        top: -( value * $(this.element).height() )
      }, { duration: 75 });
    }
    
    $( this.columns[index] ).addClass( 'active' );
  },
  
  _addLists: function( element, columns ) {
    var uls = [];
    
    for( var i = 1; i <= columns; i++ ) {
      var ul = $( "<ul/>" ).addClass( "odometer_column" ).
        css({ right: 90 * (i - 1)});
      
      for( var j = 0; j < 10; j++ ) {
        var li = $("<li/>").append( $("<span/>").text( j ) );
        ul.append( li );
      }
      
      var li = $("<li/>").append( $("<span/>").text( '.' ) );
      ul.append( li );
      
      this.element.append( ul );
      uls.push( ul )
    }
    
    return uls;
  }
  
});
  
$.extend( $.ui.odometer, {
  defaults: {
    interval:     100,
    columns:       10,
    prefix:       "$",
    initialValue: 0.00
  },
  getter: ""
});

})(jQuery);