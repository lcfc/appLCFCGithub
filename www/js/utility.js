var urlGestionale = "http://gestione.lcfc.it/gestionale.php/";
var urlGestionale = "http://lcfc/gestionale.php/";
var giorni_settimana = ['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'];
var lettere = ['', 'bis', 'ter', 'quater', 'quinquies', 'sexies', 'septies', 'octies', 'novies', 'decies'];
var secret = 'J8|tw&2ZpEyyB*#UHCB|%*q0x(R~T%F3lO8eZW#k[65OenAk^]S1|,5F,QqX:<D.';
var tipoTessere = ['', 'BA', 'BS', 'IA', 'IB'];

// funzioni aggiuntive
var Utility = {
  formatDate: function(date) {
	  var date = new Date(date);
	  if(date != "Invalid Date"){
  	  var dd = date.getDate();
  	  var mm = date.getMonth()+1;
  	  var yy = date.getFullYear();

  	  dd = (dd < 10) ? "0"+dd : dd;
  	  mm = (mm < 10) ? "0"+mm : mm;

  	  return dd+"/"+mm+"/"+yy;
	  } else {
	    return "";
	  }
  },

  formatHour: function(hour) {
    return hour != null ? hour.substring(0,5) : "";
  },

	internetConnection: function(){
    //if(typeof navigator !== "undefined" && (navigator.connection == null || navigator.connection.type == Connection.NONE))
      //$.mobile.changePage('no-internet.html');
	},

	boolInternetConnection: function(){
    return typeof navigator !== "undefined" && (navigator.connection == null || navigator.connection.type == Connection.NONE);
	},

};
