;(function($){
  
$.widget( "ui.odometer", {
  
  _init: function() {
    var options = this.options;
    
    this.element.addClass( "odometer" );
    
    this.columns = this._addLists( this.element, this.options.columns );
    if( this.options.prefix ) {
      var prefix = $("<span/>").text( this.options.prefix ).addClass( "prefix" );
      $(this.element).append( prefix );
    }
    
    this.value( this.options.initialValue );
  },
  
  value: function( n ) {
    if( typeof n === 'undefined' ) { return this.val; }
    
    var val = n.toFixed( 2 );
    
    if( val < this.val ) { 
      for( var i = 0; i < this.options.columns; i++ ) {
        this.setColumn( i, 0 );
      }
      $( this.element ).find( ".odometer_column" ).removeClass( 'active' );
    }

    for( var i = val.length - 1; i >= 0; i-- ) {
      this.setColumn( val.length - 1 - i, val[i] );
    }
    
    this.val = val;
  },
  
  setColumn: function( index, value ) {
    if( index > this.columnCount ) { return; }
    
    if( value == '.' ) {
      $( this.columns[index] ).animate({
        top: -( 10 * $(this.element).height() )
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
    this.element.empty();
    
    var containerHeight = this.element.height();
    var fontSize     = (containerHeight - containerHeight * 0.10);
    var columnWidth  = fontSize * 0.75
    var maxColumns   = Math.round( this.element.width() / columnWidth ) - 1;
    this.columnCount = Math.min( columns, maxColumns );
    
    this.element.css({
      'font-size': fontSize + 'px'
    })
    
    function span( char ) {
      return $("<span/>").text( char ).
        height( containerHeight + 'px' ).
        width( columnWidth + 'px' );
    }
    
    for( var i = 1; i <= this.columnCount; i++ ) {
      var ul = $( "<ul/>" ).addClass( "odometer_column" ).
        css({ right: columnWidth * (i - 1)});
      
      for( var j = 0; j < 10; j++ ) {
        var li = $("<li/>").append( span( j ) );
        ul.append( li );
      }
      
      var li = $("<li/>").append( span( '.' ) );
      ul.append( li );
      
      this.element.append( ul );
      uls.push( ul )
    }
    
    return uls;
  }
  
});
  
$.extend( $.ui.odometer, {
  defaults: {
    interval:      100,
    columns:        10,
    prefix:        "$",
    initialValue:  0.00
  },
  getter: ""
});

})(jQuery);