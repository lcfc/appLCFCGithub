var Application = {

  // Application Constructor
  initialize: function() {
      this.bindEvents();
  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
      document.addEventListener('deviceready', this.onDeviceReady, false);
      window.addEventListener('orientationchange',this.orientationChange,false);
  },

  onDeviceReady: function() {
    version = parseFloat(window.device.version) >= 7.0 ? "ios7" : "";
    $('html').addClass(version);
    Application.orientationChange();
    var contentScroll = new iScroll('scroll');
    window.gaInterval = setInterval(function(){
      if ( typeof window.plugins.gaPlugin != "undefined" ){
        window.gaPlugin = window.plugins.gaPlugin;
        window.gaPlugin.init(function(){}, function(){}, "UA-36975208-2", 10);
        clearInterval(window.gaInterval);
      }
      
    }, 250);

    pushNotification = window.plugins.pushNotification;

    $("#platform").append('<li>registering ' + device.platform + '</li>');
    if ( device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos" ){
      pushNotification.register(
      Application.successHandler,
      Application.errorHandler,
      {
        senderID:"131249646320",
        ecb:"Application.onNotification"
      });
    } else {
      pushNotification.register(
      Application.tokenHandler,
      Application.errorHandler,
      {
        "badge":"true",
        "sound":"true",
        "alert":"true",
        "ecb":"Application.onNotificationAPN"
      });
    }

  }, //fine device ready

  successHandler: function(result) {
    console.log('result = ' + result);
  },

  errorHandler: function(error) {
    console.log('error = ' + error);
  },

  tokenHandler: function(result) {
    localStorage.setItem('token',result);
    Application.registerToken("ios");
  },

  registerToken: function(so) {
    $.ajax({
      url: urlGestionale+"push_notification/token",
      data: {
        sistema_operativo: so,
        token: localStorage.getItem('token'),
        anagrafica_id: localStorage.getItem('anagrafica_id'),
        cellulare: MD5(cellulare), 
        secret: MD5(MD5(cellulare)+secret),
      },
      type: 'post',
      crossDomain: true,
      dataType: 'jsonp',
      success: function(data) {
        if(data.msg == 'ok') {
          alert('inserito');
        } else {
          alert('non inserito '+data);
        }
      },
      error: function(data) {
        alert('ko'+data);
      }
    });
  },

  // iOS
  onNotificationAPN: function(event) {
      var pushNotification = window.plugins.pushNotification;
      $("#platform").append("Received a notification! " + event.alert);
      $("#platform").append("event sound " + event.sound);
      $("#platform").append("event badge " + event.badge);
      $("#platform").append("event " + event);
      if (event.alert) {
          navigator.notification.alert(event.alert);
      }
      if (event.badge) {
          console.log("Set badge on  " + pushNotification);
          pushNotification.setApplicationIconBadgeNumber(this.successHandler, event.badge);
      }
      if (event.sound) {
          var snd = new Media(event.sound);
          snd.play();
      }
  },
  // onNotificationAPN: function(e) {
  //   alert('notifica');
  //   if(e.alert) { navigator.notification.alert(e.alert); }
  //   if(e.sound) {
  //     var snd = new Media(event.sound);
  //     snd.play();
  //   }
  //   if(e.badge) { pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, e.badge); }
  // },

  // android
  onNotification: function(e) {
    switch(e.event) {
      case 'registered':
        if ( e.regid.length > 0 ) {
          localStorage.setItem('token',e.regid);
          Application.registerToken("android");
        }
      break;
      case 'message':
        // if this flag is set, this notification happened while we were in the foreground.
        // you might want to play a sound to get the user's attention, throw up a dialog, etc.
        if (e.foreground) {
          $("#platform").append('<br/>--INLINE NOTIFICATION--' + '</li>');

          // on Android soundname is outside the payload.
          // On Amazon FireOS all custom attributes are contained within payload
          var soundfile = e.soundname || e.payload.sound;
          // if the notification contains a soundname, play it.
          var my_media = new Media("/android_asset/www/"+ soundfile);
          my_media.play();
        } else {  // otherwise we were launched because the user touched a notification in the notification tray.
          if ( e.coldstart ) {
            $("#platform").append('<br/>--COLDSTART NOTIFICATION--');
          } else {
            $("#platform").append('<br/>--BACKGROUND NOTIFICATION--');
          }
        }
        navigator.notification.alert(e.payload.message);
        $("#platform").append('<br/>MESSAGE -> MSG: ' + e.payload.message);
        //Only works for GCM
        $("#platform").append('<br/>MESSAGE -> MSGCNT: ' + e.payload.msgcnt);
      break;
      case 'error':
        $("#platform").append('<br/>ERROR -> MSG:' + e.msg);
      break;
      default:
        $("#platform").append('<br/>EVENT -> Unknown, an event was received and we do not know what it is');
      break;
    }
  },

  orientationChange: function(e) {
    if(window.orientation == 90 || window.orientation == -90) {
       $('.portrait').hide();$('.landscape').show();
    } else {
       $('.landscape').hide();$('.portrait').show();
    }
  },

//Index
	initIndex: function() {
    // Application.sendStatistichePagine();
    var markup = "";
    squadra = localStorage.getItem('squadra');
    squadraId = localStorage.getItem('squadra_id');
    if(squadra)
    {
      $('.home-info').removeClass('none');
      $('.home-no-squadra').addClass('none');
      $('.home-info-squadra').html(Application.showDatiSquadra()).trigger('create');

      Application.initUltimoIncontro(squadraId);
      Application.initProssimoIncontro(squadraId);
    }
    else
    {
      $('.home-no-squadra').removeClass('none');
      $('.home-info').addClass('none');
      markup += "<div class='ui-grid-solo'>"+
        "<div class='ui-block-a'>"+
          "<div class='ui-body ui-body-d showdatisquadra'>Con questa app ci proponiamo di raggiungere il più ampio numero di soci, per metterli nelle condizioni di essere protagonisti e di ricevere sempre migliori servizi e informazioni puntuali. </div>"+
        "</div>"+
      "</div>"+
      "<div class='ui-grid-solo suggerimenti'>"+
        "<div class='ui-block-a'>"+
					"<div class='ui-body ui-body-d'>Per visualizzare velocemente i dati della tua squadra preferita inseriscila dal menù opzioni.<a data-role='button' class='settings-button' href='settings.html'>Opzioni</a></div>"+
        "</div>"+
      "</div>";
      $('.home-no-squadra').html(markup).trigger('create');
    }

    $(".show-dati-altre-squadre").on('click, tap', 'a', function(){
      var squadra_id = $(this).attr('data-parm');
      if(squadra_id != '') {
        Application.setDatiSquadra(squadra_id,1);
        Application.clearCache();
        $.mobile.changePage('home.html',{reloadPage:true});
      }
    });

    $(".home-prossimo-incontro").on('click, tap', 'a', function(){
      var id = $(this).attr('data-parm');
      if(id != ''){
        $.mobile.changePage('risultati.html');
      }
    });
    
    $(".home-ultimo-incontro").on('click, tap', 'a', function(){
      var id = $(this).attr('data-parm');
      if(id != ''){
        localStorage.setItem('referto_id',id);
        $.mobile.changePage('referto.html');
      }
    });

	}, //Index fine

//Home
  initHome: function() {
    Application.initIndex();
  }, //Home fine

//Prossimo incontro
  initProssimoIncontro: function(squadra) {
		$.getJSON(urlGestionale+"squadra/exportProssimoRefertoPerApp?id="+squadra+"&callback=?", function(result) {
      markup = "<div class='ui-grid-solo'>"+
        "<div class='ui-block-a'>";
      if(typeof result !== "undefined"  && Object.keys(result).length > 0){
  		  markup += "<div class='ui-body ui-body-d a-center'>"+
  		    result.data+" h."+result.ora+"<br/>"+
  		    "<small>"+result.impianto+"</small><br/>"+
  		    "<h3><a>"+result.locale+" - "+result.ospite+"</a></h3>"+
  		  "</div>";
      } else {
        markup += "<div class='ui-body ui-body-d a-center'>Nessun incontro previsto</div>";
      }
		  markup +="</div>"+
		  "</div>";
      $('.home-prossimo-incontro').html(markup).trigger('create');
		});
  }, //Prossimo incontro fine

//Ultimo incontro
  initUltimoIncontro: function(squadra) {
		$.getJSON(urlGestionale+"squadra/exportUltimoRefertoPerApp?id="+squadra+"&callback=?", function(result) {
      markup = "<div class='ui-grid-solo'>"+
        "<div class='ui-block-a'>";
      if(typeof result !== "undefined" && Object.keys(result).length > 0)
      {
  		  markup += "<div class='ui-body ui-body-d a-center'>"+
  		    result.data+" h."+result.ora+"<br/>"+
  		    "<h3><a data-parm='"+result.id+"'>"+result.locale+" - "+result.ospite+"</a></h3>"+
  		    "<h2>"+result.reti_locale+" - "+result.reti_ospite+"</h2>"+
          "<a data-role='button' data-parm='"+result.id+"' class='referto-voto'>Vota Arbitro</a>"+
  		  "</div>";
      } else {
        markup += "<div class='ui-body ui-body-d a-center'>Nessun incontro trovato o ancora disputato</div>";
      }
		  markup +="</div>"+
		  "</div>";
      $('.home-ultimo-incontro').html(markup).trigger('create');
		});
  }, //Prossimo incontro fine

//Referto
  initReferto: function() {
    Utility.internetConnection();
    var girone = localStorage.getItem('girone_id') || localStorage.getItem('girone_last_id'),
      refertoId = localStorage.getItem('referto_id'),
      url = urlGestionale+"referto/exportPerSito?id="+refertoId+"&callback=?",
      $content = $("#referto-content"),
      markup = "";
    if(refertoId === null) {
      markup = "<h3>Referto</h3><p>Referto non valido</p>";
      $content.html(markup).trigger('create');
    } else {
      $.mobile.loading('show');
      $.getJSON(url, function(referto) {
				$("#referto-header h1").html(referto.codice);
				markup += "<div id='referto-box'>"+
				  "<div class='ui-grid-a'>"+
				    "<div class='ui-block-a'><div class='ui-body ui-body-d referto-locale'>"+referto.locale+"</div></div>"+
				    "<div class='ui-block-b'><div class='ui-body ui-body-d referto-ospite'>"+referto.ospite+"</div></div>"+
				  "</div>"+
				  "<div class='ui-grid-a'>"+
				    "<div class='ui-block-a'><div class='ui-body ui-body-d referto-locale-gol'>"+(referto.retilocale === null ? '-' : referto.retilocale)+"</div></div>"+
				    "<div class='ui-block-b'><div class='ui-body ui-body-d referto-ospite-gol'>"+(referto.retiospite === null ? '-' : referto.retiospite)+"</div></div>"+
				  "</div>"+
				  Application.garaSospesaRinviata(referto)+
				  "<div class='ui-grid-solo'>"+
				    "<div class='ui-block-a'>"+
				      "<div class='ui-body ui-body-d referto-arbitro'>"+
				        Utility.formatDate(referto.data)+" "+(Utility.formatHour(referto.ora) || '')+" - Arb. "+(referto.arbitro_abbreviato || 'non ancora designato')+"<br/>"+referto.impianto+"<br/>"+
				        Application.votoArbitroPossibile(referto)+
  				    "</div>"+
  				  "</div>"+
  			  "</div>"+
  			  "<div id='form-voto-arbitro' class='ui-grid-solo none'>"+
  			    "<div class='ui-block-a'>"+
  			      "<div class='ui-body ui-body-d'>"+
                "<label for='slider-fill'>Comportamento</label>: <strong></strong>"+
                "<input type='range' name='comportamento' id='arbitro-comportamento' value='0' min='0' max='3' step='1' data-highlight='true'>"+
                "<label for='slider-fill'>Prestazione tecnica</label>: <strong></strong>"+
                "<input type='range' name='prestazione-tecnica' id='arbitro-prestazione-tecnica' value='0' min='0' max='3' step='1' data-highlight='true'>"+
                "<label for='slider-fill'>Prestazione atletica</label>: <strong></strong>"+
                "<input type='range' name='prestazione-atletica' id='arbitro-prestazione-atletica' value='0' min='0' max='3' step='1' data-highlight='true'>"+
                "<a data-role='button' data-theme='a' id='referto-voto-invio'>Invia voto</a>"+
              "</div>"+
            "</div>"+
          "</div>"+
				  "<div class='ui-grid-solo'>"+
				    "<div class='ui-block-a'>"+
				      "<div class='ui-body ui-body-d referto-top'>"+
				        Application.votoTopPossibile(referto)+
                "<div id='top-locale-selected'></div>"+
                "<div id='top-ospite-selected'></div>"+
  				    "</div>"+
  				  "</div>"+
  			  "</div>"+
  			  "<div id='form-voto-top' class='ui-grid-solo none'>"+
  			    "<div class='ui-block-a'>"+
  			      "<div class='ui-body ui-body-d'>"+
                "<select name='top-locale' id='top-locale'>"+Application.selectTop(referto.formazione_locale, "locale")+"</select>"+
                "<select name='top-ruolo-locale' id='top-ruolo-locale'>"+Application.selectRuoloTop()+"</select>"+
                "<select name='top-ospite' id='top-ospite'>"+Application.selectTop(referto.formazione_ospite, "ospite")+"</select>"+
                "<select name='top-ruolo-ospite' id='top-ruolo-ospite'>"+Application.selectRuoloTop()+"</select>"+
                "<a data-role='button' data-theme='a' id='top-voto-invio'>Invia voto</a>"+
              "</div>"+
            "</div>"+
          "</div>"+
          "<div class='ui-grid-a'>"+
            Application.formazioneReferto(referto.formazione_locale,referto.sanzione_locale)+
            Application.formazioneReferto(referto.formazione_ospite,referto.sanzione_ospite)+
          "</div>"+
        "</div>";
				$.mobile.loading('hide');
				$content.html(markup).trigger('create');

        $('#button-voto-arbitro').on('click', function(){
          var url = urlGestionale+'arbitro/esisteGiudizioPerApp?referto_id='+refertoId+'&giudicante_id='+localStorage.getItem('anagrafica_id')+'&callback=?';
          $.mobile.loading('show');
          $.getJSON(url, function(giudizio) {
            if(giudizio.msg == 'ok'){
              markup = '<strong>Voto già espresso</strong>'+
                '<p>Comportamento: <strong>'+giudizio.giudizio.Comportamento+'</strong></p>'+
                '<p>Prestazione tecnica: <strong>'+giudizio.giudizio.PrestazioneTecnica+'</strong></p>'+
                '<p>Prestazione atletica: <strong>'+giudizio.giudizio.PrestazioneAtletica+'</strong></p>';
              $('#form-voto-arbitro div div').html(markup);
            }
            $('#form-voto-arbitro').show();
            $.mobile.loading('hide');
          });
        });

        $('#form-voto-arbitro input').on('slidestop', function(){
          values = ['seleziona un voto da 1 a 3','negativo', 'sufficiente', 'positivo'];
          $(this).parent().prev().html(values[$(this).val()]);
        });

        $('#referto-voto-invio').on('click', function(){
          var comportamento = $('#arbitro-comportamento').val(),
            prestazioneTecnica = $('#arbitro-prestazione-tecnica').val(),
            prestazioneAtletica = $('#arbitro-prestazione-atletica').val(),
            cellulare = typeof device === "undefined" ? '0' : device.uuid;
          if(comportamento > 0 && prestazioneTecnica > 0 && prestazioneAtletica > 0) {
            $.ajax({
              url: urlGestionale+'arbitro/giudizioDaApp',
              data: {
                anagrafica_id: referto.arbitro_id, 
                referto_id: refertoId,
                squadra_id: localStorage.getItem('squadra_id'),
                giudicante_id: localStorage.getItem('anagrafica_id'),
                cellulare: MD5(cellulare), 
                comportamento: comportamento,
                prestazione_tecnica: prestazioneTecnica,
                prestazione_atletica: prestazioneAtletica,
                secret: MD5(MD5(cellulare)+secret),
              },
              type: 'post',
              crossDomain: true,
              dataType: 'jsonp',
              success: function(data) {
                if(data.msg == 'ok')
                {
                  markup = '<strong>Voto inviato</strong>'+
                    '<p>Comportamento: <strong>'+$('#arbitro-comportamento').val()+'</strong></p>'+
                    '<p>Prestazione tecnica: <strong>'+$('#arbitro-prestazione-tecnica').val()+'</strong></p>'+
                    '<p>Prestazione atletica: <strong>'+$('#arbitro-prestazione-atletica').val()+'</strong></p>';
                } else {
                  markup = '<strong>Voto non inviato a causa di qualche errore</strong>';
                }
                $('#form-voto-arbitro div div').html(markup);
              },
              error: function() {
                $('#form-voto-arbitro div div').html('<strong>Voto non inviato a causa di qualche errore</strong>');
              },
            });
          } else {
            alert('Devi indicare un voto da 1 a 3 per ogni voce');
          }
        });

        $('#button-voto-top').on('click', function(){
          var url = urlGestionale+'top/esisteTopPerApp?referto_id='+refertoId+'&giudicante_id='+localStorage.getItem('anagrafica_id')+'&callback=?';
          $.mobile.loading('show');
          $.getJSON(url, function(giudizio) {
            if(giudizio.msg == 'ok'){
              votoLocale = (referto.locale_id in giudizio.top) ? giudizio.top[referto.locale_id].anagrafica : "";
              votoOspite = (referto.ospite_id in giudizio.top) ? giudizio.top[referto.ospite_id].anagrafica : "";
              votoRuoloLocale = (referto.locale_id in giudizio.top && giudizio.top[referto.locale_id].ruolo != "") ? " - "+giudizio.top[referto.locale_id].ruolo : "";
              votoRuoloOspite = (referto.ospite_id in giudizio.top && giudizio.top[referto.ospite_id].ruolo != "") ? " - "+giudizio.top[referto.ospite_id].ruolo : "";
              markup = '<strong>Voto già espresso</strong>'+
                '<p>Locale: '+votoLocale+votoRuoloLocale+'</p>'+
                '<p>Ospite: '+votoOspite+votoRuoloOspite+'</p>';
              $('.referto-top').html(markup);
            }
            else
            {
              $('#form-voto-top').show();
            }
            $.mobile.loading('hide');
          });
        });

        $('#top-voto-invio').on('click', function(){
          var topLocale = $('#top-locale option:selected').val(),
            ruoloLocale = $('#top-ruolo-locale option:selected').val(),
            topOspite = $('#top-ospite option:selected').val(),
            ruoloOspite = $('#top-ruolo-ospite option:selected').val(),
            cellulare = typeof device === "undefined" ? '0' : device.uuid;
          if(topLocale > 0) {
            $.ajax({
              url: urlGestionale+'top/topDaApp',
              data: {
                anagrafica_id: topLocale,
                referto_id: refertoId,
                squadra_id: referto.locale_id,
                giudicante_id: localStorage.getItem('anagrafica_id'),
                cellulare: MD5(cellulare), 
                ruolo_id: ruoloLocale,
                secret: MD5(MD5(cellulare)+secret),
              },
              type: 'post',
              crossDomain: true,
              dataType: 'jsonp',
              success: function(data) {
                if(data.msg == 'ok')
                {
                  $('#button-voto-top').hide();
                  ruolo = $('#top-ruolo-locale option:selected').val() > 0 ? ' - '+$('#top-ruolo-locale option:selected').text() : '';
                  markup = '<p>Locale: '+$('#top-locale option:selected').text()+ruolo+'</p>';
                } else {
                  markup = 'Voto locale non inviato a causa di qualche errore';
                }
                $('#form-voto-top').hide();
                $('#top-locale-selected').html(markup);
              },
              error: function() {
                $('#form-voto-top').hide();
                $('#top-locale-selected').html('Voto locale non inviato a causa di qualche errore');
              },
            });
          }

          if(topOspite > 0) {
            $.ajax({
              url: urlGestionale+'top/topDaApp',
              data: {
                anagrafica_id: topOspite,
                referto_id: refertoId,
                squadra_id: referto.ospite_id,
                giudicante_id: localStorage.getItem('anagrafica_id'),
                cellulare: MD5(cellulare), 
                ruolo_id: ruoloOspite,
                secret: MD5(MD5(cellulare)+secret),
              },
              type: 'post',
              crossDomain: true,
              dataType: 'jsonp',
              success: function(data) {
                if(data.msg == 'ok')
                {
                  $('#button-voto-top').hide();
                  ruolo = $('#top-ruolo-ospite option:selected').val() > 0 ? ' - '+$('#top-ruolo-ospite option:selected').text() : '';
                  markup = '<p>Ospite: '+$('#top-ospite option:selected').text()+ruolo+'</p>';
                } else {
                  markup = 'Voto ospite non inviato a causa di qualche errore';
                }
                $('#form-voto-top').hide();
                $('#top-ospite-selected').html(markup);
              },
              error: function() {
                $('#form-voto-top').hide();
                $('#top-ospite-selected').html('Voto ospite non inviato a causa di qualche errore');
              },
            });
          }
        });

      });
    }
  }, // Referto fine

//Formazione Referto
  formazioneReferto: function(formazione,sanzioni) {
		markup = "<div class='ui-block-b'><div class='ui-body ui-body-d referto-formazione'>";
		markup += "<ul class='referto'>";
    var ordine = [], formazioneOrdinata = [];
    for (r in formazione) {
      var riga = formazione[r];
      ordine.push(riga.anagrafica.nominativo);
      formazioneOrdinata[riga.anagrafica.nominativo] = riga;
    }
    ordine.sort();
		for (r in ordine) {
			var riga = formazioneOrdinata[ordine[r]];
      if(riga.formazione !== undefined) {
  			markup += "<li>"+riga.anagrafica.nominativo_abbreviato;
  			markup += "<div><small>"+Utility.formatDate(riga.anagrafica.data_nascita)+"</small>";
  			if(riga.dirigente != undefined) {
  				markup += " <img src='images/"+riga.dirigente+".png' width='24px' height='24px' /> ";
  			}
  			if(riga.marcatore >= 1) {
  				markup += " <img src='images/pallone.png' width='24px' height='24px'/> ";
  				markup += (riga.marcatore > 1 ? " x "+riga.marcatore : "");
  			}
  			if(riga.ammonito == "A") {
  				markup += " <img src='images/cartellino-giallo.png' width='24px' height='24px'/> ";
  			}
        if(riga.anagrafica.id in sanzioni) {
  			  markup += " <img src='images/cartellino-rosso.png' width='24px' height='24px'/> ";
        }
  			markup += "</div>";
  			markup += "</li>";
      }
		}
		markup += "</ul>";
		markup += "</div></div>";

    return markup;
  },//Formazione Referto fine

//Select Top
  selectTop: function(formazione,localeOspite) {
		markup = "<option value='0'>Seleziona tesserato "+localeOspite+"</option>";
    var ordine = [], formazioneOrdinata = [];
    for (r in formazione) {
      var riga = formazione[r];
      ordine.push(riga.anagrafica.nominativo);
      formazioneOrdinata[riga.anagrafica.nominativo] = riga;
    }
    ordine.sort();
		for (r in ordine) {
			var riga = formazioneOrdinata[ordine[r]];
      if(riga.formazione !== undefined) {
  			markup += "<option value='"+riga.anagrafica.id+"'>"+riga.anagrafica.nominativo_abbreviato+" "+Utility.formatDate(riga.anagrafica.data_nascita)+"</option>";
      }
		}

    return markup;
  },//Formazione Referto fine

//Select Ruolo Top
  selectRuoloTop: function(formazione) {
		markup = "<option value=0>Ruolo</option>";
    markup += localStorage.getItem('ruoli_option')

    return markup;
  },//Formazione Referto fine

//Voto Arbitro possibile
  votoArbitroPossibile: function(referto) {
    aa = referto.data.substr(0,4);
    mm = parseInt(referto.data.substr(5,2))-1;
    gg = referto.data.substr(8,2);
    hh = referto.inizioprimotempo.substr(0,2) || 20;
    ii = referto.inizioprimotempo.substr(3,2) || 0;

    var now = new Date().getTime(),
      refertoData = new Date(aa,mm,gg,hh,ii).getTime(),
      markup = "";
    if(localStorage.getItem('anagrafica_id') == null) markup = "<strong>Non puoi votare l'arbitro perchè non hai effettuato il login. Solo i tesserati LCFC possono esprimere un voto all'arbitro.</strong>";
    else if(now < refertoData) markup = "<strong>Non puoi votare l'arbitro perchè la gara deve ancora essere giocata</strong>";
    else if(now - refertoData < 3*24*60*60*1000) markup = "<a data-role='button' id='button-voto-arbitro' class='referto-voto'>Vota Arbitro</a>";
    else markup = "<strong>Non è più possibile votare l'arbitro.</strong>";
    return markup;
  }, //Voto Arbitro possibile fine

//Voto Top possibile
  votoTopPossibile: function(referto) {
    aa = referto.data.substr(0,4);
    mm = parseInt(referto.data.substr(5,2))-1;
    gg = referto.data.substr(8,2);
    hh = referto.inizioprimotempo.substr(0,2) || 20;
    ii = referto.inizioprimotempo.substr(3,2) || 0;

    var now = new Date().getTime(),
      refertoData = new Date(aa,mm,gg,hh,ii).getTime(),
      markup = "";
    if(localStorage.getItem('anagrafica_id') == null) markup = "<strong>Non puoi votare i top perchè non hai effettuato il login. Solo i tesserati LCFC possono esprimere un voto per i top.</strong>";
    else if(now < refertoData) markup = "<strong>Non puoi votare i top perchè la gara deve ancora essere giocata</strong>";
    else if(now - refertoData < 1000*24*60*60*1000) markup = "<a data-role='button' id='button-voto-top' class='referto-voto'>Vota TOP</a>";
    else markup = "<strong>Non è più possibile votare i top.</strong>";
    return markup;
  }, //Voto Top possibile fine

//Gara sospesa/rinviata
  garaSospesaRinviata: function(referto) {
    var markup = "";
    if((referto.rinviatamotivo != '' && referto.rinviatamotivo != null) || (referto.sospesamotivo != '' && referto.sospesamotivo != null))
    {
		  markup += "<div class='ui-grid-solo'>"+
		    "<div class='ui-block-a'>"+
		      "<div id='referto-sospesa-rinviata' class='ui-body ui-body-d'>"+
            (referto.rinviatamotivo != '' && referto.rinviatamotivo != null ? "Gara rinviata. Motivo: "+referto.rinviatamotivo : "")+
            (referto.sospesamotivo != '' && referto.sospesamotivo != null ? "Gara sospesa al "+referto.sospesaminuto+" min. Motivo: "+referto.sospesamotivo : "")+
          "</div>"+
        "</div>"+
      "</div>";
    }
    return markup;
  }, //Gara sospesa/rinviata fine

//Referti
  initReferti: function() {
    Utility.internetConnection();
    var squadra_id = localStorage.getItem('squadra_id'),
      url = urlGestionale+"referto/refertiSquadraPerApp/action?squadra_id="+squadra_id+"&callback=?",
      $ul = $("#referti-squadra"),
      markup = "";
    if(squadra_id === null) {
      markup = "<li><a href='settings.html'>Devi prima selezionare la squadra dal menu opzioni</a></li>";
      $ul.html(markup).listview("refresh").trigger("updatelayout");
    } else {
      $.mobile.loading('show');
      $.getJSON(url, function(referti) {
        if(referti.length == 0) {
          markup += "<li><a><h2>Nessun referto trovato</h2><p>Da qui sono visibili solo i referti passati</p></a></li>";
        } else {
          for (r in referti) {
            label = referti[r].label.split(':');
            markup += "<li><a data-parm='"+referti[r].value+"'><h2>"+label[0]+"</h2><p>"+label[1]+"</p></a></li>";
          }
        }
        $.mobile.loading('hide');
        $ul.html(markup).listview("refresh").trigger("updatelayout");
     });
   }

   $("#referti-autocomplete").on("listviewbeforefilter", function (e, data) {
      var $ul = $(this),
        $input = $(data.input),
        value = $input.val(),
        html = "";
      $ul.html("");
      if (value && value.length > 2) {
        $ul.html("<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>").listview("refresh");
        $.ajax({
          url: urlGestionale+"referto/searchPerApp?callback=?",
          dataType: "jsonp",
          crossDomain: true,
          data: { q: $input.val() }
        })
        .then( function (response) {
          $.each(response, function (i, val) {
            label = val.label.split(':');
            html += "<li><a data-parm='"+val.value+"'><h2>"+label[0]+"</h2><p>"+label[1]+"</p></a></li>";
          });
          $ul.html(html).listview("refresh").trigger("updatelayout");
        });
      }
    });

    $(".referti").on('click, tap', 'a', function(){
      $(".referti li").remove().end();
      var id = $(this).attr('data-parm');
      if(id != '')
      {
       localStorage.setItem('referto_id',id);
       $.mobile.changePage('referto.html');
      }
    });
  }, //Referti fine

//Classifica
  initClassifica: function() {
    Utility.internetConnection();
    var girone = localStorage.getItem('girone_tmp_id') || localStorage.getItem('girone_id') || localStorage.getItem('girone_last_id'),
      url = urlGestionale+"classifica/generaPerSito/action?classifica[girone_id]="+girone+"&classifica[data]=&callback=?",
      $content = $("#classifica-show"),
      markup = "";
    if(girone === null) { 
      markup = "<h3>Classifica</h3><p>Per visualizzare la classifica puoi selezionare un girone oppure se hai una squadra preferita la puoi aggiungere dal menù impostazioni.<a data-role='button' class='settings-button' href='settings.html'>Impostazioni</a><br/></p>";
      $content.html(markup).trigger('create');
      $('#campionato-girone').html(Application.campionatoGirone('classifica')).trigger('create');
    } else {
      classifica = localStorage.getItem('cache_classifica');
      cacheGirone = localStorage.getItem('cache_classifica_girone_id');
      cacheTime = localStorage.getItem('cache_classifica_time');
      if(classifica && girone == cacheGirone && cacheTime > new Date().getTime() - 60*60*1000) { // la cache dura 60 minuti
        $content.html(classifica).trigger('create');
      } else {
        $.mobile.loading('show');
        $.getJSON(url, function(classifica) {
          markup += "<h3>Classifica "+classifica.titolo+"</h3>";
          markup += "<table class=\"w100\">";
            markup += "<thead>";
              markup += "<tr>";
                markup += "<th class=\"a-left\">Squadra</th>";
                markup += "<th class=\"a-right\">PT</th>";
                markup += "<th class=\"a-right\">GG</th>";
                markup += "<th class=\"a-right landscape\">GF</th>";
                markup += "<th class=\"a-right landscape\">GS</th>";
                markup += "<th class=\"a-right\">CD</th>";
                markup += "<th class=\"a-right landscape\">CF</th>";
                markup += "<th class=\"a-right landscape\">A</th>";
              markup += "</tr>";
            markup += "</thead>";
            markup += "<tbody>";
              for (c in classifica.classifica) {
                var riga = classifica.classifica[c];
                markup += "<tr class=\""+(riga.SquadraId == localStorage.getItem('squadra_id') ? "evidenziato" : "" )+"\">";
                  markup += "<td class=\"squadra\"><a data-parm='"+riga.SquadraId+"'>"+riga.squadra+"</a></td>";
                  markup += "<td class=\"a-right\">"+riga.Punti+"</td>";
                  markup += "<td class=\"a-right\">"+riga.Giocate+"</td>";
                  markup += "<td class=\"a-right landscape\">"+riga.GolFatti+"</td>";
                  markup += "<td class=\"a-right landscape\">"+riga.GolSubiti+"</td>";
                  markup += "<td class=\"a-right\">"+riga.CoppaDisciplina+"</td>";
                  markup += "<td class=\"a-right landscape\">"+riga.CorsoCrediti+"</td>";
                  markup += "<td class=\"a-right landscape\">"+riga.Accompagnatore+"/"+riga.Giocate+"</td>";
                markup += "</tr>";
              }
            markup += "</tbody>";
          markup += "</table>";
          markup += "<a href=\"risultati.html\" data-role=\"button\">Visualizza i risultati</a>";
          markup += "<br/>";
          $.mobile.loading('hide');
          $content.html(markup).trigger('create');

          localStorage.setItem('cache_classifica', markup);
          localStorage.setItem('cache_classifica_girone_id', girone);
          localStorage.setItem('cache_classifica_time', new Date().getTime());

        });
      }
      $('#campionato-girone').html(Application.campionatoGirone('classifica')).trigger('create');
    }

    $(".squadra").on('click, tap', 'a', function(){
      var id = $(this).attr('data-parm');
      if(id != ''){
        localStorage.setItem('squadra_tmp_id',id);
        $.mobile.changePage('squadra.html');
      }
    });

    $('#classifica-refresh').on('click',function() {
      localStorage.removeItem('cache_classifica');
      localStorage.removeItem('cache_classifica_girone_id');
      localStorage.removeItem('cache_classifica_time');
      $.mobile.changePage('classifica.html',{reloadPage:true, transition:'none'});
    });
  }, // Classifica fine

//Risultati
  initRisultati: function(){
    Utility.internetConnection();
    var girone = localStorage.getItem('girone_tmp_id') || localStorage.getItem('girone_id') || localStorage.getItem('girone_last_id'),
      giornata = localStorage.getItem('giornata') || 1,
      url = urlGestionale+"referto/risultatiPerSito?girone_id="+girone+"&giornata="+giornata+"&callback=?",
      $content = $("#risultati-show"),
      markup = "";
    if(girone === null) { 
      markup = "<h3>Risultati</h3><p>Per visualizzare i risultati puoi selezionare un girone oppure se hai una squadra preferita la puoi aggiungere dal menù impostazioni.<a data-role='button' class='settings-button' href='settings.html'>Impostazioni</a><br/></p>";
      $content.html(markup).trigger('create');
      $('#campionato-girone').html(Application.campionatoGirone('risultati')).trigger('create');
    } else {
      risultati = localStorage.getItem('cache_risultati');
      cacheGirone = localStorage.getItem('cache_risultati_girone_id');
      cacheGiornata = localStorage.getItem('cache_giornata');
      cacheTime = localStorage.getItem('cache_risultati_time');
      if(risultati && giornata == cacheGiornata && girone == cacheGirone && cacheTime > new Date().getTime() - 60*60*1000) { // la cache dura 60 minuti
        $content.html(risultati).trigger('create');
      } else {
        $.mobile.loading('show');
        $.getJSON(url, function(risultati) {
          var numeroPartite = risultati.partite.length,
          markup = "<h3>"+risultati.titolo+"</h3>";
          markup += "<div class=\"giornate\">";
            markup += "<select id=\"giornata\">";
            markup += "<option>Giornate</option>"
            for(g in risultati.giornate){
              var giornate = risultati.giornate[g];
              markup += "<option "+(giornate == giornata ? "selected=\"selected\"" : "")+" value=\""+giornate+"\">Giornata n."+giornate+"</option> ";
            }
            markup += "</select>";
            markup += "<input type=\"hidden\" id=\"risultati_girone_id\" value=\""+girone+"\" />";
          markup += "</div>";
          markup += "<table class=\"w100\">";
            markup += "<thead>";
              markup += "<tr>";
                markup += "<th class=\"a-left portrait\">Data</th>";
                markup += "<th class=\"a-left landscape\">Data</th>";
                markup += "<th class=\"a-left portrait\">Incontro</th>";
                markup += "<th class=\"a-left landscape\">Incontro</th>";
                markup += "<th class=\"a-center portrait\">Reti</th>";
                markup += "<th class=\"a-center landscape\">Reti</th>";
              markup += "</tr>";
            markup += "</thead>";
            markup += "<tbody>";
            for (p in risultati.partite) {
              var partita = risultati.partite[p],
                data = partita.data !== null ? partita.data : '',
                risultato = partita.reti_locale !== null ? partita.reti_locale+" - "+partita.reti_ospite : '-';
              markup += "<tr class=\""+(partita.locale == localStorage.getItem('squadra') ? "evidenziato" : "" )+" "+(partita.ospite == localStorage.getItem('squadra') ? "evidenziato" : "" )+"\">";
                markup += "<td class=\"portrait\"><small>"+data.substring(0,5).replace('/','.')+"</small><br/>"+data.substring(6,10)+"</td>";
                markup += "<td class=\"landscape\">"+data+"</td>";
                markup += "<td class=\"portrait partita\"><a data-parm='"+partita.id+"'>"+partita.locale+"<br/>"+partita.ospite+"</a></td>";
                markup += "<td class=\"landscape partita\"><a data-parm='"+partita.id+"'>"+partita.locale+" - "+partita.ospite+"</a></td>";
                markup += "<td class=\"a-center portrait\">"+(partita.reti_locale !== null ? partita.reti_locale+"<br/>"+partita.reti_ospite : "-<br/>-")+"</td>";
                markup += "<td class=\"a-center landscape\">"+risultato+"</td>";
              markup += "</tr>";
            }
            markup += "</tbody>";
          markup += "</table>";
          markup += "<a href=\"classifica.html\" data-role=\"button\">Visualizza la classifica</a>";
          markup += "<br/>";
          $.mobile.loading('hide');
          $content.html(markup).trigger('create');

          localStorage.setItem('cache_risultati', markup);
          localStorage.setItem('cache_risultati_girone_id', girone);
          localStorage.setItem('cache_giornata', giornata);
          localStorage.setItem('cache_risultati_time', new Date().getTime());

          $(".partita").on('click, tap', 'a', function(){
            var id = $(this).attr('data-parm');
            if(id != ''){
              localStorage.setItem('referto_id',id);
              $.mobile.changePage('referto.html');
            }
          });
        });
      }
      $('#campionato-girone').html(Application.campionatoGirone('risultati')).trigger('create');

      $("#risultati").on('change', '#giornata',function(e, data){
        if($(this).val() > 0)
        {
          localStorage.setItem('girone_tmp_id',girone);
          localStorage.setItem('giornata',$(this).val());
          $.mobile.changePage('risultati.html',{reloadPage:true, transition:'none'});
        }
      });

      $('#risultati-refresh').on('click',function() {
        localStorage.removeItem('cache_risultati');
        localStorage.removeItem('cache_risultati_girone_id');
        localStorage.removeItem('cache_risultati_time');
        $.mobile.changePage('risultati.html',{reloadPage:true, transition:'none'});
      });
    }
  },//Risultati fine

//Classifica marcatori
  initClassificaMarcatori: function() {
    Utility.internetConnection();
    var girone = localStorage.getItem('girone_tmp_id') || localStorage.getItem('girone_id') || localStorage.getItem('girone_last_id'),
      url = urlGestionale+"classifica_marcatori/generaPerSito/action?classifica_marcatori[girone_id]="+girone+"&classifica[data]=&callback=?",
      $content = $("#classifica-marcatori-show"),
      markup = "";
    if(girone === null){ 
      markup = "<h3>Classifica marcatori</h3><p>Per visualizzare la classifica marcatori puoi selezionare un girone oppure se hai una squadra preferita la puoi aggiungere dal menù impostazioni.<a data-role='button' class='settings-button' href='settings.html'>Impostazioni</a><br/></p>";
      $content.html(markup).trigger('create');
      $('#campionato-girone').html(Application.campionatoGirone('classifica-marcatori')).trigger('create');
    } else {
      classifica = localStorage.getItem('cache_classifica_marcatori');
      cacheGirone = localStorage.getItem('cache_classifica_marcatori_girone_id');
      cacheTime = localStorage.getItem('cache_classifica_marcatori_time');
      if(classifica && girone == cacheGirone && cacheTime > new Date().getTime() - 60*60*1000) { // la cache dura 60 minuti
        $content.html(classifica).trigger('create');
      } else {
        $.mobile.loading('show');
        $.getJSON(url, function(classifica) {
          markup += "<h3>"+classifica.titolo+"</h3>";
          markup += "<table class=\"w100\">";
            markup += "<thead>";
              markup += "<tr>";
                markup += "<th class=\"a-left portrait\">Tesserato<br/>Squadra</th>";
                markup += "<th class=\"a-right portrait\">Gol<br/>CD</th>";
                markup += "<th class=\"a-left landscape\">Tesserato</th>";
                markup += "<th class=\"a-center landscape\">Gol</th>";
                markup += "<th class=\"a-left landscape\">Squadra</th>";
                markup += "<th class=\"a-right landscape\">CD</th>";
              markup += "</tr>";
            markup += "</thead>";
            markup += "<tbody>";
            for (c in classifica.classifica) {
              var riga = classifica.classifica[c];
              markup += "<tr class=\""+(riga.Squadra == localStorage.getItem('squadra') ? "evidenziato" : "" )+"\">";
                markup += "<td class=\"a-left portrait\">"+riga.Anagrafica+"<br/><span class=\"corsivo\">"+riga.Squadra+"</span></td>";
                markup += "<td class=\"a-right portrait\">"+riga.Gol+"<br/>"+riga.CoppaDisciplina+"</td>";
                markup += "<td class=\"a-left landscape\">"+riga.Anagrafica+"</td>";
                markup += "<td class=\"a-center landscape\">"+riga.Gol+"</td>";
                markup += "<td class=\"a-left landscape\">"+riga.Squadra+"</td>";
                markup += "<td class=\"a-right landscape\">"+riga.CoppaDisciplina+"</td>";
              markup += "</tr>";
            }
            markup += "</tbody>";
          markup += "</table>";
          markup += "<br/>";
          $.mobile.loading('hide');
          $content.html(markup).trigger('create');

          localStorage.setItem('cache_classifica_marcatori', markup);
          localStorage.setItem('cache_classifica_marcatori_girone_id', girone);
          localStorage.setItem('cache_classifica_marcatori_time', new Date().getTime());
        });
      }
      $('#campionato-girone').html(Application.campionatoGirone('classifica-marcatori')).trigger('create');
    }
    $('#classifica-marcatori-refresh').on('click',function() {
      localStorage.removeItem('cache_classifica_marcatori');
      localStorage.removeItem('cache_classifica_marcatori_girone_id');
      localStorage.removeItem('cache_classifica_marcatori_time');
      $.mobile.changePage('classifica-marcatori.html',{reloadPage:true, transition:'none'});
    });
  }, // Classifica marcatori fine

//Classifica formazione
  initClassificaFormazione: function() {
    Utility.internetConnection();
    var anagraficaAssociazione = localStorage.getItem('classifica_formazione_scelta') || 'S',
      url = urlGestionale+"classifica_formazione/generaPerSito/action?classifica_formazione[anagrafica_squadra]="+anagraficaAssociazione+"&callback=?",
      $content = $("#classifica-formazione-show"),
      markup = "";
    $('#classifica-formazione-group input:radio[value='+anagraficaAssociazione+']').attr('checked','checked');

    classifica = localStorage.getItem('cache_classifica_formazione');
    cacheClassificaFormazioneScelta = localStorage.getItem('cache_classifica_formazione_scelta');
    cacheTime = localStorage.getItem('cache_classifica_formazione_time');
    if(classifica && anagraficaAssociazione == cacheClassificaFormazioneScelta && cacheTime > new Date().getTime() - 60*60*1000) { // la cache dura 60 minuti
      $content.html(classifica).trigger('create');
    } else {
      $.mobile.loading('show');
      $.getJSON(url, function(classifica) {
        markup += "<h3>Classifica Formazione</h3>";
        markup += "<table class=\"w100\">";
          markup += "<thead>";
            markup += "<tr>";
              markup += "<th class=\"a-left\">"+(anagraficaAssociazione == 'A' ? 'Anagrafica' : 'Associazione')+"</th>";
              markup += "<th class=\"a-right\">Tot</th>";
              markup += "<th class=\"a-right\">Att</th>";
        			for(anno = classifica.anno-1; anno >= 2012; anno--) {
                markup += "<th class=\"a-right landscape\">"+anno+"</th>";
              }
            markup += "</tr>";
          markup += "</thead>";
          markup += "<tbody>";
            for (c in classifica.classifica) {
              var riga = classifica.classifica[c];
              markup += "<tr>";
                markup += "<td class=\"a-left\">"+(anagraficaAssociazione == 'A' ? riga.anagrafica : riga.associazione)+"</td>";
                markup += "<td class=\"a-right\">"+riga.CreditiTotali+"</td>";
                markup += "<td class=\"a-right\">"+(riga.Crediti || 0)+"</td>";
          			var parziali = JSON.parse(riga.CreditiParziali);
          			for(anno = classifica.anno-1; anno >= 2012; anno--) {
                  markup += "<td class=\"a-right landscape\">"+(parziali[anno] || 0)+"</td>";
          			}
              markup += "</tr>";
            }
          markup += "</tbody>";
        markup += "</table>";
        $.mobile.loading('hide');
        $content.html(markup).trigger('create');

        localStorage.setItem('cache_classifica_formazione', markup);
        localStorage.setItem('cache_classifica_formazione_scelta', anagraficaAssociazione);
        localStorage.setItem('cache_classifica_formazione_time', new Date().getTime());
      });
    }

    $('#classifica-formazione-group input:radio').on('click',function() {
      localStorage.setItem('classifica_formazione_scelta',$(this).val());
      $.mobile.changePage('classifica-formazione.html',{reloadPage:true, transition:'none'});
    });

    $('#classifica-formazione-refresh').on('click',function() {
      localStorage.removeItem('cache_classifica_formazione');
      localStorage.removeItem('cache_classifica_formazione_scelta');
      localStorage.removeItem('cache_classifica_formazione_time');
      $.mobile.changePage('classifica-formazione.html',{reloadPage:true, transition:'none'});
    });
  }, // Classifica formazion fine

//Calendario
  initCalendario: function() {
    Utility.internetConnection();
    var girone = localStorage.getItem('girone_tmp_id') || localStorage.getItem('girone_id') || localStorage.getItem('girone_last_id'),
      url = urlGestionale+"referto/calendarioGironePerSito/action?girone_id="+girone+'&callback=?',
      $content = $("#calendario-show"),
      markup = "",
      squadraId = parseInt(localStorage.getItem('squadra_id'));
    if(girone === null) { 
      markup = "<h3>Calendario</h3><p>Devi prima selezionare il girone dal menu impostazioni</p>";
      $content.html(markup).trigger('create');
    } else {
      calendario = localStorage.getItem('cache_calendario');
      cacheGirone = localStorage.getItem('cache_calendario_girone_id');
      cacheTime = localStorage.getItem('cache_calendario_time');
      if(calendario && girone == cacheGirone && cacheTime > new Date().getTime() - 60*60*1000) { // la cache dura 60 minuti
        $content.html(calendario).trigger('create');
      } else {
        $.mobile.loading('show');
        $.getJSON(url, function(calendario) {
          markup += "<h3>Calendario "+calendario.titolo+"</h3>";
          for (c in calendario.partite) {
            var giornata = calendario.partite[c];
            markup += "<strong>Giornata n°"+c+"</strong>"+
              "<div class='ui-grid-solo'>"+
                "<div class='ui-block-a'><div class='ui-body ui-body-d'>";
                  for (g in giornata) {
                    var riga = giornata[g];
                    markup += "<div class='giornata-calendario "+(riga.locale_id == squadraId || riga.ospite_id == squadraId ? "evidenziato" : "" )+"'>"+
                      "<small>"+riga.data+" "+riga.ora+"</small><br/>"+
                      "<strong>"+riga.locale+'-'+riga.ospite+"</strong><br/>"+
                      "<small>"+riga.impianto+"</small>"+
                    "</div>";
                  }
                  markup += "</div>"+
                    "</div>"+
                  "</div><br/>";
          }
          markup += "<br/>";
          $.mobile.loading('hide');
          $content.html(markup).trigger('create');

          localStorage.setItem('cache_calendario', markup);
          localStorage.setItem('cache_calendario_girone_id', girone);
          localStorage.setItem('cache_calendario_time', new Date().getTime());
        });
      }
      $('#campionato-girone').html(Application.campionatoGirone('calendario')).trigger('create');
    }

    $('#calendario-refresh').on('click',function() {
      localStorage.removeItem('cache_calendario');
      localStorage.removeItem('cache_calendario_girone_id');
      localStorage.removeItem('cache_calendario_time');
      $.mobile.changePage('calendario.html',{reloadPage:true, transition:'none'});
    });
  }, // Calendario fine

//Arbitro giudizi
  initArbitroGiudizio: function() {
    Utility.internetConnection();
    var campionato = localStorage.getItem('campionato_giudizio_id') || '',
      girone = localStorage.getItem('girone_giudizio_id') || '',
      url = urlGestionale+"arbitro/exportGiudizioSquadra/?giudizio[girone_id]="+girone+"&giudizio[campionato_id]="+campionato+"&callback=?",
      $content = $("#arbitro-giudizio-show"),
      markup = "";
    classifica = localStorage.getItem('cache_arbitro_giudizi');
    cacheTime = localStorage.getItem('cache_arbitro_giudizi_time');
    if(classifica && cacheTime > new Date().getTime() - 60*60*1000) { // la cache dura 60 minuti
      $content.html(classifica).trigger('create');
    } else {
      $.mobile.loading('show');
      $.getJSON(url, function(classifica) {
        markup += "<h3>Voti arbitri</h3>";
        markup += "<table class=\"w100\">";
          markup += "<thead>";
            markup += "<tr>";
              markup += "<th class=\"a-left\">Arbitro</th>";
              markup += "<th class=\"a-left landscape\">Comport.</th>";
              markup += "<th class=\"a-left landscape\">Tecnica</th>";
              markup += "<th class=\"a-left landscape\">Atletica</th>";
              markup += "<th class=\"a-left\">Media</th>";
              markup += "<th class=\"a-right\">Voti</th>";
              markup += "<th class=\"a-right\">Gare</th>";
            markup += "</tr>";
          markup += "</thead>";
          markup += "<tbody>";
            for (c in classifica) {
              var riga = classifica[c];
              markup += "<tr>";
                markup += "<td class=\"a-left\">"+riga.anagrafica_abbreviata+"</td>";
                markup += "<td class=\"a-left landscape\">"+Application.drawStars(riga.comportamento)+"</td>";
                markup += "<td class=\"a-left landscape\">"+Application.drawStars(riga.prestazione_tecnica)+"</td>";
                markup += "<td class=\"a-left landscape\">"+Application.drawStars(riga.prestazione_atletica)+"</td>";
                markup += "<td class=\"a-left\">"+Application.drawStars(riga.media)+" <sup>"+riga.media+"</sup>"+"</td>";
                markup += "<td class=\"a-right\">"+riga.count+"</td>";
                markup += "<td class=\"a-right\">"+riga.gare+"</td>";
              markup += "</tr>";
            }
          markup += "</tbody>";
        markup += "</table>";
        markup += "<br/>";
        $.mobile.loading('hide');
        $content.html(markup).trigger('create');

        localStorage.setItem('cache_arbitro_giudizi', markup);
        localStorage.setItem('cache_arbitro_giudizi_time', new Date().getTime());
      });
    }

    $('#arbitro-giudizio-refresh').on('click',function() {
      localStorage.removeItem('cache_arbitro_giudizi');
      localStorage.removeItem('cache_arbitro_giudizi_time');
      $.mobile.changePage('arbitro-giudizio.html',{reloadPage:true, transition:'none'});
    });
  }, // Arbitro giudizi fine

//Draw stars
  drawStars: function(value) {
    markup = "";
    for(i = 0;i < Math.floor(value);i++) {
      markup += "<img src='images/icon-star-full-16.png'/>";
    }
    if(value - Math.floor(value) >= 0.5) {
      markup += "<img src='images/icon-star-half-full-16.png'/>";
    }
    return markup;
  }, // Draw stars fine

//Campionato girone
  campionatoGirone: function(page){
     var markup = "",
       url = urlGestionale+"campionato/exportPerSito?callback=?";
     markup = "<select name='campionato_id' id='campionato_id'>";
       markup+= "<option>Campionato</option>";
     markup+= "</select>";
     markup+= "<select name='girone_id' id='girone_id'>";
       markup+= "<option>Girone</option>";
     markup+= "</select>";

     $.getJSON(url, function(result) {
       var html = "<option>Campionato</option>";
       for(r in result['campionati']){
         var profondita = "";
         for(p=0;p<result['campionati'][r].Profondita;p++) profondita += "- ";
         // html += "<option value='"+result['campionati'][r].Id+"'>"+profondita+result['campionati'][r].Abbreviazione+"</option>";
         html += "<option value='"+result['campionati'][r].Id+"'>"+profondita+result['campionati'][r].Nome+"</option>";
       }
       $("select#campionato_id").find('option').remove().end().append(html).trigger('create');
     });

     $("#risultati, #classifica, #classifica-marcatori, #calendario, #arbitro-giudizio").on('change', '#campionato_id', function(e){
       var url = urlGestionale+"girone/exportPerSitoByCampionato?campionato_id="+$(this).val()+"&callback=?";
       $.getJSON(url, function(result) {
         var html = "<option>Girone</option>";
         for(r in result) 
           html += "<option value='"+result[r].Id+"'>"+result[r].Abbreviazione+"</option>";
         $("select#girone_id").find('option').remove().end().append(html).trigger('create');
         e.preventDefault();
       });
     });

     $("#risultati, #classifica, #classifica-marcatori, #calendario, #arbitro-giudizio").on('change', '#girone_id',function(e, data){
       if($(this).val() > 0)
       {
         localStorage.setItem('campionato_tmp_id',$('#campionato_id').val());
         localStorage.setItem('girone_tmp_id',$(this).val());
         localStorage.setItem('giornata',1);
         $.mobile.changePage(page+".html",{reloadPage:true});
       }
     });

     return markup;
  },//Campionato girone fine

//Squadra
  initSquadra: function() {
    Utility.internetConnection();
    var squadraId = localStorage.getItem('squadra_tmp_id') || localStorage.getItem('squadra_id'),
      url = urlGestionale+"squadra/exportPerApp?id="+squadraId+"&callback=?",
      $content = $("#squadra-content"),
      markup = "";
    if(squadraId === null) {
      markup = "<p>Squadra non trovata</p>";
      $content.html(markup).trigger('create');
    } else {
      $.mobile.loading('show');
      $.getJSON(url, function(squadra) {
				$("#squadra-header h1").html(squadra.squadra_codice+ " "+squadra.squadra);
        url = encodeURI('http://maps.google.it?q='+squadra.impianto_indirizzo);
        numero_tesserati = squadra.numero_tesserati == null ? new Array() : squadra.numero_tesserati;
        tessere = "";
        for(t in numero_tesserati)
        {
          tessere += "<strong>"+t+"</strong><em>"+numero_tesserati[t]+"</em> ";
        }
        responsabili_squadra = "";
        responsabili = squadra.responsabili;
        for(r in responsabili)
        {
          tel1 = responsabili[r].telefono1 != '' ? "<a href='tel:"+responsabili[r].telefono1+"'>"+responsabili[r].telefono1+"</a>" : "";
          tel2 = responsabili[r].telefono2 != '' ? "<a href='tel:"+responsabili[r].telefono2+"'>"+responsabili[r].telefono1+"</a>" : "";
          tel3 = responsabili[r].telefono3 != '' ? "<a href='tel:"+responsabili[r].telefono3+"'>"+responsabili[r].telefono1+"</a>" : "";
          mail1 = responsabili[r].mail1 != '' ? "<a href='mailto:"+responsabili[r].mail1+"'>"+responsabili[r].mail1+"</a>" : "";
          mail2 = responsabili[r].mail2 != '' ? "<a href='mailto:"+responsabili[r].mail2+"'>"+responsabili[r].mail2+"</a>" : "";
          responsabili_squadra += "<li>"+
            "<strong>"+responsabili[r].nominativo+"</strong><br/>"+
            "<em>Tel: "+tel1+" "+tel2+" "+tel3+"</em><br/>"+
            "<em>Email: "+mail1+" "+mail2+"</em><br/>"+
            "</li>";
        }

        tesserati_squadra = "";
        tesserati = squadra.tesserati;
        for(t in tesserati)
        {
          tesserati_squadra += "<li>"+
            "<strong><a data-parm='"+tesserati[t].id+"'>"+tesserati[t].nominativo+"</a></strong>"+
            "<div><small>"+tesserati[t].data_nascita+" <strong>"+tesserati[t].tessera+"</strong></small></div>"+
            "</li>";
        }
        markup += "<div class='ui-grid-solo'>"+
          "<div class='ui-block-a'>"+
            "<div class='ui-body ui-body-d'>"+
              "<div>"+squadra.associazione+"</div>"+
              "<div>Partite in casa: "+giorni_settimana[squadra.giorno_partita]+" "+squadra.ora_partita+"</div>"+
              "<div><a href='#' onclick=\"window.open('"+url+"', '_blank', 'location=yes,closebuttoncaption=chiudi')\">"+squadra.impianto_partita+"</a></div>"+
              "<div>Tessere: "+tessere+"</div>"+
            "</div>"+
          "</div>"+
        "</div>"+
        "<div class='ui-grid-solo margin-top'>"+
          "<div class='ui-block-a'>"+
            "<div class='ui-body ui-body-d'>"+
              "<h3>Responsabili</h3><ul class='squadra_responsabili'>"+responsabili_squadra+"</ul>"+
            "</div>"+
          "</div>"+
        "</div>"+
        "<div class='ui-grid-solo margin-top'>"+
          "<div class='ui-block-a'>"+
            "<div class='ui-body ui-body-d'>"+
              "<h3>Tesserati</h3><ul class='squadra_tesserati'>"+tesserati_squadra+"</ul>"+
            "</div>"+
          "</div>"+
        "</div>";

				$.mobile.loading('hide');
				$content.html(markup).trigger('create');

        $(".squadra_tesserati li").on('click, tap', 'a', function(){
          var id = $(this).attr('data-parm');
          if(id != '')
          {
           localStorage.setItem('anagrafica_tmp_id',id);
           $.mobile.changePage('anagrafica.html');
          }
        });

			});

    }
  }, // squadra fine

//squadre
  initSquadre: function() {
    Utility.internetConnection();
    $("#squadre-autocomplete").on("listviewbeforefilter", function (e, data) {
       var $ul = $(this),
         $input = $(data.input),
         value = $input.val(),
         html = "";
       $ul.html("");
       if (value && value.length > 2) {
         $ul.html("<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>").listview("refresh");
         $.ajax({
           url: urlGestionale+"squadra/searchPerApp?callback=?",
           dataType: "jsonp",
           crossDomain: true,
           data: { q: $input.val() }
         })
         .then( function (response) {
           $.each(response, function (i, val) {
             label = val.label.split(':');
             html += "<li><a data-parm='"+val.value+"'><h2>"+label[0]+"</h2><p>"+label[1]+"</p></a></li>";
           });
           $ul.html(html).listview("refresh").trigger("updatelayout");
         });
       }
     });

     $(".squadre").on('click, tap', 'a', function(){
       $(".squadre li").remove().end();
       var id = $(this).attr('data-parm');
       if(id != '')
       {
        localStorage.setItem('squadra_tmp_id',id);
        $.mobile.changePage('squadra.html');
       }
     });
  }, // fine squadre

//anagrafica
  initAnagrafica: function() {
    Utility.internetConnection();
    var anagraficaId = localStorage.getItem('anagrafica_tmp_id') || localStorage.getItem('anagrafica_id'),
      url = urlGestionale+"anagrafica/exportPerSitoSquadra?id="+anagraficaId+"&callback=?",
      $content = $("#anagrafica-content"),
      markup = "";
    if(anagraficaId === null) {
      markup = "<p>Tesserato non trovato</p>";
      $content.html(markup).trigger('create');
    } else {
      $.mobile.loading('show');
      $.getJSON(url, function(anagrafica) {
				$("#anagrafica-header h1").html(anagrafica.anagrafica.Cognome+ " "+anagrafica.anagrafica.Nome);

        squadre = "";
        tesserati = anagrafica.tesserato;
        for(t in tesserati)
        {
          squadre += "<h3>"+tesserati[t].squadra.Sponsor+" "+tesserati[t].squadra.campionato_girone+"</h3>"+
            "<div>"+
              "<strong>"+(tesserati[t].reti || 0)+"</strong> <img src='images/pallone.png' width='16px' height='16px' /> "+
              "<strong>"+(tesserati[t].ammonizioni || 0)+"</strong> <img src='images/cartellino-giallo.png' width='16px' height='16px' /> "+
              "<strong>"+tesserati[t].sanzioni.length+"</strong> <img src='images/cartellino-rosso.png' width='16px' height='16px' /> "+
              "</div>";
          if(tesserati[t].referti.length > 0)
          {
            squadre += "<ul class='anagrafica_referti'>";
            for(r in tesserati[t].referti)
            {
              referto = tesserati[t].referti[r];
              squadre += "<li>"+
                "<a data-parm='"+referto.id+"'>"+referto.partita+"</a> "+referto.risultato+"<br/>"+
                "<small>"+referto.data+" - GG: "+referto.giornata+" <strong>"+referto.ruolo+"</strong></small>"+
              "</li>";
            }
            squadre += "</ul>";
          }
        }

        if(anagrafica.anagrafica.file_exists) img = urlGestionale.substring(0, urlGestionale.lastIndexOf("/"))+"images/"+anagrafica.anagrafica.path;
        else img = "images/anonimo.png";

        vm = anagrafica.anagrafica.scaduta == true ? "SCADUTA" : Utility.formatDate(anagrafica.anagrafica.VisitaMedicaAl);
        if(tipoTessere[anagrafica.anagrafica.TesseraId] == "BS") vm = "SOCIO";

        markup += "<div class='ui-grid-solo'>"+
          "<div class='ui-block-a'>"+
            "<div class='ui-body ui-body-d'>"+
              "<div><img src='"+img+"' height='150px' align='left' id='anagrafica_foto'/></div>"+
              "<div><strong>"+anagrafica.anagrafica.Cognome+"</strong></div>"+
              "<div><strong>"+anagrafica.anagrafica.Nome+"</strong></div>"+
              "<div>"+anagrafica.anagrafica.CodiceFiscale+"</div>"+
              "<div>"+anagrafica.anagrafica.LuogoNascita+"</div>"+
              "<div>"+Utility.formatDate(anagrafica.anagrafica.DataNascita)+"</div>"+
              "<div><img src='images/med.png' width='20px' height='20px' /> "+vm+"</div>"+
              "<div><img src='images/id_card.png' width='20px' height='20px' /> "+tipoTessere[anagrafica.anagrafica.TesseraId]+" "+anagrafica.anagrafica.NumeroTessera+"</div>"+
            "</div>"+
          "</div>"+
        "</div>"+
        "<div class='ui-grid-solo margin-top'>"+
          "<div class='ui-block-a'>"+
            "<div class='ui-body ui-body-d'>"+
              "<div>"+squadre+"</div>"+
            "</div>"+
          "</div>"+
        "</div>";

				$.mobile.loading('hide');
				$content.html(markup).trigger('create');

        $(".anagrafica_referti").on('click, tap', 'a', function(){
          $(".anagrafica_referti li").remove().end();
          var id = $(this).attr('data-parm');
          if(id != '')
          {
           localStorage.setItem('referto_id',id);
           $.mobile.changePage('referto.html');
          }
        });

			});
    }
  }, // squadra fine

//Albo d'oro
  initAlboOro: function() {
    Utility.internetConnection();
    var anno = localStorage.getItem('albo_oro_anno') || localStorage.getItem('cache_albo_oro_anno'),
      url = urlGestionale+"albo_oro/exportPerSito/action?anno="+anno+"&callback=?",
      $content = $("#albo-oro-show"),
      markup = "",
      options = "<option>Seleziona anno</option>";
    for(var i = 1985; i < 2010; i++) {
      options += "<option value='"+i+"'>"+i+"</option>";
    }
    var select = "<select id='albo-oro-anno'>"+options+"</select>";
    $('#albo-oro-select').html(select).trigger('create');
    if(anno === null) { 
      markup = "<h3>Albo d'oro</h3><p>Per visualizzare l'albo d'oro seleziona prima l'anno di tuo interesse</p>";
      $content.html(markup).trigger('create');
    } else {
      cacheAlboOro = localStorage.getItem('cache_albo_oro');
      cacheAlboOroAnno = localStorage.getItem('cache_albo_oro_anno');
      cacheTime = localStorage.getItem('cache_albo_oro_time');
      if(cacheAlboOro && anno == cacheAlboOroAnno && cacheTime > new Date().getTime() - 60*60*1000) { // la cache dura 60 minuti
        $content.html(cacheAlboOro).trigger('create');
      } else {
        $.mobile.loading('show');
        $.getJSON(url, function(alboOro) {

          markup += "<h3>Albo d'oro "+alboOro.Anno+"</h3>"+alboOro.Testo+"<br/>";
          $.mobile.loading('hide');
          $content.html(markup).trigger('create');

          localStorage.setItem('cache_albo_oro', markup);
          localStorage.setItem('cache_albo_oro_anno', anno);
          localStorage.setItem('cache_albo_oro_time', new Date().getTime());
        });
      }
    }

    $('#albo-oro-select').on('change', '#albo-oro-anno', function() {
      localStorage.setItem('albo_oro_anno', $('#albo-oro-anno option:selected').val());
      $.mobile.changePage('albo-oro.html',{reloadPage:true, transition:'none'});
    });
  }, // Classifica fine

//Normativa
  initNormativa: function() {
    $.mobile.loading('show');
    var $content = $("#normativa-show"),
      markup = "<ul data-role='listview' data-theme='c' class='listview-top'>";

    for(s in normativa['sezione']){
      var numero_articoli = 0;
      for(t in normativa['sezione'][s]['sezione_titolo'])
      {
        if('articolo' in normativa['sezione'][s]['sezione_titolo'][t])
        numero_articoli += Object.keys(normativa['sezione'][s]['sezione_titolo'][t]['articolo']).length;
      }
      markup += "<li>";
      markup += "<a data-parm='"+s+"' class='ui-link-inherit'>";
      markup += "<img src='images/sezione_"+s+".png' class='ui-li-thumb' />";
      markup += "<h3 class='ui-li-heading'>"+normativa['sezione'][s].Titolo+"</h3>";
      markup += "<p class='ui-li-desc'>n. articoli: "+numero_articoli+"</p>";
      markup += "</a>";
      markup += "</li>";
    }
    markup += "</ul>";
    $.mobile.loading('hide');
    $content.html(markup).find(":jqmData(role=listview)").listview();

    $('#normativa-show').on('click', 'a', function(){
      localStorage.setItem('sezione_id',$(this).attr('data-parm'));
      $.mobile.changePage("normativa-sezione.html",{reloadPage:true});
    });

    $('#cerca-normativa').on('keypress', function(){
      var text = $(this).val();
      if(text.length > 2) {
        markup = "<ul data-role='listview' data-theme='c' class='listview-top'>";
        for(s in normativa['sezione']) {
          var sezione = normativa['sezione'][s], 
            dividerSezione = "<li data-role='list-divider'>"+sezione.Titolo+"</li>",
            numeroArticoli = 0,
            articoli = '';
          for(t in sezione['sezione_titolo']) {
            var titolo = sezione['sezione_titolo'][t];
            for (a in titolo['articolo']) {
              var articolo = titolo['articolo'][a];
              if(articolo.Titolo.indexOf(text) > 0 || articolo.Testo.indexOf(text) > 0)
              {
                articoli += "<li>";
                articoli += "<a href=\"normativa-articolo.html?articolo_id="+s+"|"+t+"|"+a+"\" class=\"ui-link-inherit\">";
                articoli += articolo.Numero+lettere[articolo.Lettera]+". "+articolo.Titolo;
                articoli += "</a>";
                articoli += "</li>";
                numeroArticoli++;
              }
            }
          }
          if(numeroArticoli > 0) {
            markup += dividerSezione + articoli;
          }
        }
        markup += "</ul>";
        $content.html(markup).find(":jqmData(role=listview)").listview();
      }
    });

  }, //Normativa fine

//Normativa: sezione
  initNormativaSezione: function() {
    $.mobile.loading('show');
    var sezioneId = localStorage.getItem('sezione_id');
      $content = $("#normativa-sezione-show"),
      sezione = normativa['sezione'][sezioneId],
      markup = "<h3>"+normativa['sezione'][sezioneId].Titolo+"</h3>";

    markup += "<ul data-role='listview' data-theme='c' class='listview-bottom'>";
    for (t in sezione['sezione_titolo']) {
      markup += sezione['sezione_titolo'][t].Titolo != "" ? "<li data-role='list-divider'>"+sezione['sezione_titolo'][t].Titolo+"</li>" : "";
      for (a in normativa['sezione'][sezioneId]['sezione_titolo'][t]['articolo']) {
        markup += "<li>";
          markup += "<a data-parm='"+sezioneId+"|"+t+"|"+a+"' class='ui-link-inherit'>";
            markup += normativa['sezione'][sezioneId]['sezione_titolo'][t]['articolo'][a].Numero;
            markup += lettere[normativa['sezione'][sezioneId]['sezione_titolo'][t]['articolo'][a].Lettera]+". ";
            markup += normativa['sezione'][sezioneId]['sezione_titolo'][t]['articolo'][a].Titolo;
          markup += "</a>";
        markup += "</li>";
      }
    }
    markup += "</ul>";
    $content.html(markup).find(":jqmData(role=listview)").listview();
    $.mobile.loading('hide');

    $('#normativa-sezione-show').on('click', 'a', function(){
      localStorage.setItem('articolo_id',$(this).attr('data-parm'));
      $.mobile.changePage("normativa-articolo.html",{reloadPage:true});
    });

  }, //Normativa Sezione fine

//Normativa: articolo
  initNormativaArticolo: function() {
    $.mobile.loading('show');
    ids = localStorage.getItem('articolo_id').split('|')
    if(ids.length==3 || ids.length==4) {
      var trovato = false,
        preferiti = localStorage.getItem('preferiti') == null ? new Array() : JSON.parse(localStorage.getItem('preferiti'));
      for(e in preferiti) {
        if(preferiti[e] == $('#articolo_id').val()){
          trovato = true;
          break;
        }
      }
      var $header = $("#normativa-articolo-header"),
        $content = $("#normativa-articolo-show"),
        sezione = normativa['sezione'][ids[0]],
        titolo = normativa['sezione'][ids[0]]['sezione_titolo'][ids[1]].Titolo,
        articolo = normativa['sezione'][ids[0]]['sezione_titolo'][ids[1]]['articolo'][ids[2]],
        dataIcon = (trovato || ids[3] == 'P') ? 'minus-star' : 'plus-star';
        markup = "<a id='normativa-preferito' class='right "+dataIcon+"' ></a><h4>"+sezione.Titolo;
      if(titolo.Visibile === true)
        markup += " - "+titolo.Titolo
      markup += "</h4>";
      if(articolo.Abrogato !== null)
        markup += "<h3 class='abrogato'>Abrogato il "+Utility.formatDate(articolo.Abrogato)+"</h3>";
      markup += "<h3>"+articolo.Numero+lettere[articolo.Lettera]+". "+articolo.Titolo+"</h3>";
      markup += "<div class='a-justify'>"+articolo.Testo+"</div>";
      if(articolo.Data !== null)
        markup += "<em class=\"in-vigore\">In vigore dal "+Utility.formatDate(articolo.Data)+"</em>";
      if(articolo.Commenti !== null && articolo.Commenti != "")
        markup += "<br/><strong>Commenti</strong><br/>"+articolo.Commenti+"</em>";
      markup += "<input type='hidden' id='articolo_id' value='"+ids[0]+"|"+ids[1]+"|"+ids[2]+"' />";
      $.mobile.loading('hide');
      if(ids[3] == 'P')
        $('#normativa-indietro').attr('href','normativa-preferiti.html');
      else
        $('#normativa-indietro').attr('data-parm',ids[0]);
      $content.html(markup);
      $header.trigger('create');
    }
    $('#normativa-preferito').on('click, tap',function() {Application.aggiungiRimuoviNormativaPreferito();});

    $('#normativa-indietro').on('click', function(){
      ids = localStorage.getItem('articolo_id').split('|')
      if(ids.length==4) {
        $.mobile.changePage("normativa-preferiti.html",{reloadPage:true});
      } else {
        localStorage.setItem('sezione_id',$(this).attr('data-parm'));
        $.mobile.changePage("normativa-sezione.html",{reloadPage:true});
      }
    });

  },//Normativa Articolo fine

//Normativa: preferiti
  initNormativaPreferiti: function() {
    var preferiti = localStorage.getItem('preferiti') == null ? new Array() : JSON.parse(localStorage.getItem('preferiti')),
      $content = $('#normativa-preferiti-show'),
      sezione = 0,
      markup = "";
    if(Object.keys(preferiti).length > 0) {
      markup += "<ul data-role='listview' data-filter='true' data-filter-placeholder='Cerca...'>";
    for (p in preferiti) {
      var ids = preferiti[p].split('|');
      if(sezione != ids[0])
        markup += "<li data-role='list-divider'>"+normativa['sezione'][ids[0]].Titolo+"</li>";
      markup += "<li>";
        markup += "<a data-parm='"+preferiti[p]+"|P"+"' class='ui-link-inherit'>";
          markup += normativa['sezione'][ids[0]]['sezione_titolo'][ids[1]]['articolo'][ids[2]].Numero;
          markup += lettere[normativa['sezione'][ids[0]]['sezione_titolo'][ids[1]]['articolo'][ids[2]].Lettera]+". ";
          markup += normativa['sezione'][ids[0]]['sezione_titolo'][ids[1]]['articolo'][ids[2]].Titolo;
        markup += "</a>";
      markup += "</li>";
      sezione = ids[1];
    }
    markup += "</ul>";
    } else {
      markup += "<p>Al momento non sono stati inseriti articoli preferiti.<br/>Per inserire un preferito, devi cliccare sull'icona a forma di stella vuota in alto a destra nella pagina dell'articolo; dopo averla cliccata la stella diventerà piena; per rimuovere il preferito sar&agrave; sufficiente ricliccare l'icona che passer&agrave; da piena a vuota.</p>";
    }
    $content.html(markup).find(":jqmData(role=listview)").listview();

    $('#normativa-preferiti-show').on('click', 'a', function(){
      localStorage.setItem('articolo_id',$(this).attr('data-parm'));
      $.mobile.changePage("normativa-articolo.html",{reloadPage:true});
    });
  },//normativa preferiti fine

// Preferito: aggiunta/cancellazione
  aggiungiRimuoviNormativaPreferito: function(){
    var preferiti = localStorage.getItem('preferiti') == null ? new Array() : JSON.parse(localStorage.getItem('preferiti'));
    var trovato = false;
    for(e in preferiti) {
      if(preferiti[e] == $('#articolo_id').val()) {
        preferiti.splice(e,1);
        trovato = true;
        $("#normativa-preferito").removeClass('minus-star').addClass("plus-star");
      }
    }
    if(!trovato) {
      preferiti.push($('#articolo_id').val());
      preferiti.sort();
      $("#normativa-preferito").removeClass('plus-star').addClass("minus-star");
    }
    localStorage.setItem('preferiti', JSON.stringify(preferiti));
  },

// Preferiti: reset
  resetPreferiti: function(){
    if(confirm('Sei sicuro di voler cancellare tutti i preferiti?')){
      localStorage.removeItem('preferiti');
      alert('Preferiti cancellati');
    }
  },

//Comunicato Ufficiale
  initComunicatoUfficiale: function(){
    Utility.internetConnection();
    $.mobile.loading('show');
    var categoria = localStorage.getItem('comunicato_categoria') || '61';
    $("#comunicato-anno option[value="+categoria+"]").attr('selected','selected');//.trigger('create');
    $.getJSON('http://www.lcfc.it/?json=get_category_posts&id='+categoria+'&count=100&callback=?', function(data) {
      var markup = '<h3>Comunicati '+$("#comunicato-anno option:selected").text()+'</h3>',
        posts = data.posts;
      markup += '<ul data-role="listview" data-inset="true" data-theme="c">';
      for(var i = 0; i< posts.length; i++) {
        var href = '', content = posts[i].content;
        var match = content.match(/href="([^\s"]+)/);
        href = match[0].replace('href="','');
         markup += '<li><a data-parm="'+href+'">'+posts[i].title_plain.replace('Comunicato Ufficiale nr.','n&deg;')+'</a></li>'; 
      }
      markup += '</ul>';
      $('#comunicato-lista').html(markup).trigger('create');
      $.mobile.loading('hide');
    });

    $("#comunicato-anno").on('change', function(e, data) {
      var categoriaComunicato = $(this).val();
      if(categoriaComunicato > 0) {
        localStorage.setItem('comunicato_anno',$(this).text());
        localStorage.setItem('comunicato_categoria',categoriaComunicato);
        $.mobile.changePage('comunicato.html',{reloadPage:true});
      }
    });

    $('#comunicato-lista').on('click, tap', 'a', function() {
      window.open(encodeURI("http://docs.google.com/viewer?url="+$(this).attr('data-parm')), '_blank', 'location=yes,closebuttoncaption=chiudi');
    });
  }, // Comunicato Ufficiale fine

//News
  initNews: function(){
    Utility.internetConnection();
    $.mobile.loading('show');
    $.getJSON('http://www.lcfc.it/?json=get_recent_posts&count=15&callback=?', function(data) {
      var markup = '<h3>News</h3>',
        posts = data.posts;
      markup += '<ul data-role="listview" data-inset="true" data-theme="c">';
      for(var i = 0; i< posts.length; i++) {
        markup += '<li><a href="news-singola.html?id='+posts[i].id+'">'+posts[i].title_plain+'</a></li>'; 
      }
      markup += '</ul>';
      $('#news-lista').html(markup).trigger('create');
      $.mobile.loading('hide');
    });
  }, // News fine

//News singola
  initNewsSingola: function(){
    Utility.internetConnection();
    $.mobile.loading('show');
    id = $.url(window.location.href).param('id');
    $.getJSON('http://www.lcfc.it/?json=get_post&post_id='+id+'&callback=?', function(data) {
      var post = data.post,
        markup = '<h3>'+post.title_plain+'</h3><div>'+post.content+'</div>';
      $('#news-singola-content').html(markup).trigger('create');
      $.mobile.loading('hide');
    });
  }, // News singola fine

// Settings
  initSettings: function() {
    Application.showSettings();

    if(localStorage.getItem('anagrafica_id') !== null) {
      $('#login-form').hide();
    }

    var url = urlGestionale+'top/ruoloTopPerApp?callback=?';
    $.getJSON(url, function(ruoli) {
      if(ruoli.length > 0) {
        markup = "";
        for (r in ruoli) {
          markup += "<option value='"+ruoli[r].id+"'>"+ruoli[r].ruolo+"</option>";
        }
      }
      localStorage.setItem('ruoli_option',markup);
    });

    $('#login-submit').click(function() {
      var username = $('#login-username').val(),
        password = $('#login-password').val();
      if(username != '' && password != '') {
        var url = urlGestionale+"anagrafica/loginApp/action?username="+username+"&password="+password+"&callback=?",
          markup = markupLi = "";
        $.mobile.loading('show');
        $.getJSON(url, function(anagrafica) {
          if('error' in anagrafica) {
            $.mobile.loading('hide');
            $('#login-descrizione').html("<p id='error-login'>"+anagrafica.error+"</p>");
          } else {
            $('#login-form form').hide();
            markup += "<p>Ciao "+anagrafica.anagrafica.Nome+" "+anagrafica.anagrafica.Cognome+", ";
            tesserati = Object.keys(anagrafica.tesserato).length;
            tesserato = anagrafica.tesserato;
            localStorage.removeItem('altre_squadre');
            if(tesserati == 0) {
              markup += "purtroppo non ci risulti tesserato con nessuna squadra</p>";
            } else if(tesserati == 1) {
              localStorage.setItem('anagrafica_id',anagrafica.anagrafica.Id);
              localStorage.setItem('anagrafica',anagrafica.anagrafica.Nome+" "+anagrafica.anagrafica.Cognome);
              for (t in tesserato) {
                markup += "abbiamo già impostato la preferenza per la squadra "+tesserato[t].squadra.Codice+" <strong>"+tesserato[t].squadra.Sponsor+"</strong>, "+tesserato[t].squadra.campionato+"</p>";
                Application.setDatiSquadra(tesserato[t].squadra.Id, 0);
              }
            } else {
              localStorage.setItem('anagrafica_id',anagrafica.anagrafica.Id);
              localStorage.setItem('anagrafica',anagrafica.anagrafica.Nome+" "+anagrafica.anagrafica.Cognome);
              markup += "abbiamo visto che sei tesserato con "+tesserati+" squadre; clicca su quella principale per impostare la preferenza</p>";
              var altreSquadre = {};
              for (t in tesserato) {
                markupLi += "<li><a href='#' data-parm='"+tesserato[t].squadra.Id+"'><h2>"+tesserato[t].squadra.Sponsor+"</h2><p>"+tesserato[t].squadra.campionato+"</p></a></li>";
                altreSquadre[tesserato[t].squadra.Id] = tesserato[t].squadra.Sponsor+" ["+tesserato[t].squadra.campionato+"]";
              }
              localStorage.setItem('altre_squadre',JSON.stringify(altreSquadre));
              $('#login-tesserati').html(markupLi).listview("refresh").trigger("updatelayout");
            }
            $.mobile.loading('hide');
            $('#login-descrizione').html(markup);
            $('#login-frase').hide();
          }
        });
      }
    });

    $("#login-tesserati").on('click, tap', 'a', function(){
      var squadra_id = $(this).attr('data-parm');
      if(squadra_id != '') {
        Application.setDatiSquadra(squadra_id,1);
      }
    });

    $("#settings-autocomplete").on("listviewbeforefilter", function (e, data) {
      var $ul = $(this),
        $input = $(data.input),
        value = $input.val(),
        html = "";
      $ul.html("");
      if (value && value.length > 2) {
        $ul.html("<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>").listview("refresh");
        $.ajax({
          url: urlGestionale+"squadra/ajaxPerApp?callback=?",
          dataType: "jsonp",
          crossDomain: true,
          data: {
            term: $input.val()
          },
          error: function() {
            alert('Questa funzione richiede una connessione internet');
          },
        })
        .then( function (response) {
          $.each(response, function (i, val) {
            html += "<li><a data-parm='"+val.value+"'>"+val.label+"</a></li>";
          });
          $ul.html(html).listview("refresh").trigger("updatelayout");
        });
      }
    });

    $("#settings-autocomplete").on('click, tap', 'a', function(){
      $("#settings-autocomplete li").remove().end();
      var id = $(this).attr('data-parm');
      if(id != '') {
        var url = urlGestionale+"squadra/exportPerApp?id="+id+"&callback=?";
        $.getJSON(url, function(result) {
          for(r in result) {
            if(r == 'numero_tesserati') localStorage.setItem(r,JSON.stringify(result[r]));
            else localStorage.setItem(r,result[r]);
          }
          Application.showSettings();
        });
      }
    });

    $('#show-login').on('click, tap',function() {Application.resetDatiLogin();});
    $('#settings-reset-preferiti').on('click, tap',function() {Application.resetPreferiti();});
  },// Settings fine

//Settings: show
  showSettings: function(){
    $('#settings-autocomplete').val(localStorage.getItem('squadra_codice'));
    var markup = Application.showDatiSquadra();
    $('#show-dati-squadra').html(markup).trigger('create').show();
  },//Settings: show fine

//Dati squadra: show
  showDatiSquadra: function(){
    squadra = localStorage.getItem('squadra');
    associazione = localStorage.getItem('associazione');
    squadra_codice = localStorage.getItem('squadra_codice')
    campionato_esteso = localStorage.getItem('campionato_esteso');
    girone_last = localStorage.getItem('girone_last');
    giorno_partita = giorni_settimana[localStorage.getItem('giorno_partita')];
    ora_partita = localStorage.getItem('ora_partita');
    impianto_partita = localStorage.getItem('impianto_partita');
    impianto_indirizzo = localStorage.getItem('impianto_indirizzo');
    altre_squadre = localStorage.getItem('altre_squadre') == null ? new Array() : JSON.parse(localStorage.getItem('altre_squadre'));
    numero_tesserati = localStorage.getItem('numero_tesserati') == null ? new Array() : JSON.parse(localStorage.getItem('numero_tesserati'));
    squadre = "";
    for(s in altre_squadre)
    {
      if(s != localStorage.getItem('squadra_id'))
      squadre += "<a data-parm="+s+">"+altre_squadre[s]+"<a><br/>";
    }
    tessere = "";
    for(t in numero_tesserati)
    {
      tessere += "<strong>"+t+"</strong><em>"+numero_tesserati[t]+"</em> ";
    }

    var markup = "";
    if(squadra)
    {
      url = encodeURI('http://maps.google.it?q='+impianto_indirizzo);
      markup += "<div class='ui-grid-solo'>"+
          "<div class='ui-block-a'>"+
            "<div class='ui-body ui-body-d'>"+
              "<div class='show-dati-codice a-center right'>"+squadra_codice+"<br/><span class='girone'>"+girone_last+"</span></div>"+
              "<div class='show-dati-squadra'>"+squadra+"</div>"+
              "<div class='show-dati-associazione'>"+associazione+"</div>"+
              "<div class='show-dati-campionato'>"+campionato_esteso+"</div>"+
              "<div class='show-dati-gara'>"+
                "<strong>Partite in casa:</strong><br/>"+giorno_partita+" "+ora_partita+"<br/>"+
                "<a href='#' onclick=\"window.open('"+url+"', '_blank', 'location=yes,closebuttoncaption=chiudi')\">"+impianto_partita+"</a>"+
              "</div>"+
              "<div class='show-dati-tesserati'>Tessere: "+tessere+"</div>"+
              (squadre != "" ? "<div class='show-dati-altre-squadre'>Altre squadre in cui sei tesserato:<br/> "+squadre+"</div>" : "")+
            "</div>"+
          "</div>"+
        "</div>";
    }
    return markup;
  },//Dati squadra: show fine

  setDatiSquadra: function(id,hide) {
	  var url = urlGestionale+"squadra/exportPerApp?id="+id+"&callback=?";
		$.getJSON(url, function(result) {
			for(r in result) {
        if(r == 'numero_tesserati') localStorage.setItem(r,JSON.stringify(result[r]));
        else localStorage.setItem(r,result[r]);
			}
      var markup = Application.showDatiSquadra();
      if(hide === null || hide == 1) {
        $('#login-form').hide();
      }
      $('#show-dati-squadra').html(markup).trigger('create').removeClass('none');
		});
  },

  resetDatiLogin: function(){
    if(confirm('Sei sicuro di voler cancellare i dati?')) {
      localStorage.removeItem('anagrafica_id');
      localStorage.removeItem('anagrafica');
      localStorage.removeItem('altre_squadre');
      $.mobile.changePage('home.html');
    }
  },

  clearCache: function(){
    cache = ['cache_classifica','cache_classifica_formazione', 'cache_classifica_formazione_scelta', 'cache_classifica_formazione_time', 'cache_classifica_girone_id', 'cache_classifica_marcatori', 'cache_classifica_marcatori_girone_id', 'cache_classifica_marcatori_time', 'cache_classifica_time', 'cache_giornata', 'cache_risultati', 'cache_risultati_girone_id', 'cache_risultati_time', 'girone_tmp_id', 'campionato_tmp_id'];
    for(e in cache) {
      localStorage.removeItem(cache[e]);
    }
  },

  // setStatistichePagine: function() {
  //   var page = $.mobile.activePage.attr('id');
  //   var statistiche = localStorage.getItem('statistiche') == null ? {} : JSON.parse(localStorage.getItem('statistiche'));
  //   statistiche[page] = (statistiche[page] || 0) + 1;
  //   localStorage.setItem('statistiche', JSON.stringify(statistiche));
  // },

  // sendStatistichePagine: function() {
  //   if(new Date().getTime() - localStorage.getItem('statistiche_datetime') > 5*60*60*1000) {
  //     var stats = localStorage.getItem('statistiche'),
  //       cellulare = typeof device === "undefined" ? '0' : device.uuid;
  //     $.ajax({
  //       url: urlGestionale+'statistica/importStatisticheApp',
  //       data: {
  //         cellulare: MD5(cellulare), 
  //         stats: stats,
  //         secret: MD5(MD5(cellulare)+secret),
  //       },
  //       type: 'post',
  //       crossDomain: true,
  //       dataType: 'jsonp',
  //       success: function(data) {
  //         localStorage.removeItem('statistiche');
  //         localStorage.removeItem('statistiche_datetime');
  //         Application.setStatistichePagine();
  //         localStorage.setItem('statistiche_datetime', new Date().getTime());
  //       },
  //       error: function(e) {
  //         console.log(e);
  //       },
  //     });
  //   }
  // },

  initMenu: function() {
    $.mobile.loading('hide');
    // $.get('menu.html',function(data){$(":jqmData(role=page)").append(data).trigger('create');});
    $.ajax({
      url: 'menu.html',
      isLocal: true, 
      success: function(data) {
        $(":jqmData(role=page)").append(data).trigger('create');
      },
    });
  },


//foto
  initFoto: function() {
    //scatto foto
    $("#foto").on("click", "#foto-scatta", function() {
      navigator.camera.getPicture(Application.onCameraSuccess, Application.onCameraError,{ 
        quality: 90,
        targetWidth: 100,
        targetHeight: 100,
        correctOrientation: true,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: true });
    });

    //prendo foto da galleria
    $("#foto").on("click", "#scegli-galleria", function() {
      navigator.camera.getPicture(Application.onCameraSuccess, Application.onCameraError,{ 
        quality: 90,
        sourceType: 0,
        correctOrientation: true,
        popoverOptions: CameraPopoverOptions });
    });

    //invio foto selezionate
    $("#foto").on("click", "#foto-invia", function() {
      $("#foto-invio-esito").html("Invio immagini in corso...").css({'margin-bottom': '5px', 'padding': '5px', 'border':'1px solid #fc0', 'background': '#ffc'});
      var params = {};
      params.titolo = $("#foto-titolo").val();
      params.descrizione = $("#foto-descrizione").val();

      // options.params = params;
      $("#foto-anteprime .image-selected img").each(function(i) {
        fileUrl = $(this).attr("src");

        var options = new FileUploadOptions();
        // options.fileKey = "file";
        // options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
        // options.mimeType = "image/jpeg";
        options.params = params;

        var ft = new FileTransfer();
        ft.upload(fileUrl, encodeURI(urlGestionale+"stampa/uploadFotoFromApp"), Application.onUploadFile, Application.onFailUploadFile, options);
        $(this).parent().remove();
      });
      $("#foto-invio-esito").html("Invio immagini completato").fadeOut(4000);
    });

    $("#foto-anteprime").on("click", "div", function(){
      $(this).toggleClass("image-selected");
    });

  }, //foto fine


  onUploadFile: function(r) {
    // $("#foto-invio-esito").html("Foto inviata");
  },

  onFailUploadFile: function(error) {
    $("#foto-invio-esito").html("Impossibile caricare l'immagine");
  },

  onCameraSuccess: function(imageURI) {
    $("#foto-anteprime").prepend("<div class='left'><span></span><img src='"+imageURI+"' /></div>");
    $(".no-foto").hide();
    $("#foto-form").removeClass("none");
  },

  onCameraError: function(errorMessage) {
    navigator.notification.alert(errorMessage, function() {}, "Errore");
  },
};

Application.initialize();

$(document).on('pageshow','.page',function() {Application.initMenu();
  page = $(this).attr("id")+".html";
  if(page == "index.html") page = "home.html";
  // Application.setStatistichePagine();
  if( typeof window.gaPlugin  != "undefined")
    window.gaPlugin.trackPage(function(){}, function(){}, page);
  });
$(document).on('pageinit','#index',function() {Application.initIndex();});
$(document).on('pageshow','#home',function() {Application.initIndex();});

$(document).on('click','.go-home',function() {$.mobile.changePage('home.html',{reloadPage:true});});

$(document).on('pageshow','#normativa',function() {Application.initNormativa();});
$(document).on('pageshow','#normativa-sezione',function() {Application.initNormativaSezione();});
$(document).on('pageshow','#normativa-articolo',function() {Application.initNormativaArticolo();});
$(document).on('pageshow','#normativa-preferiti',function() {Application.initNormativaPreferiti();});
$(document).on('pageshow','#albo-oro',function() {Application.initAlboOro();});

// referti
$(document).on('pageshow','#referto',function() {Application.initReferto();});
$(document).on('pageinit','#referti',function() {Application.initReferti();});

//squadra e tesserato
$(document).on('pageshow','#squadra',function() {Application.initSquadra();});
$(document).on('pageinit','#squadre',function() {Application.initSquadre();});
$(document).on('pageshow','#anagrafica',function() {Application.initAnagrafica();});

// risultati e classifiche
$(document).on('pageshow','#risultati',function() {Application.initRisultati();});
$(document).on('pageshow','#classifica',function() {Application.initClassifica();});
$(document).on('pageshow','#classifica-marcatori',function() {Application.initClassificaMarcatori();});
$(document).on('pageshow','#classifica-formazione',function() {Application.initClassificaFormazione();});
$(document).on('pageshow','#calendario',function() {Application.initCalendario();});
$(document).on('pageshow','#arbitro-giudizio',function() {Application.initArbitroGiudizio();});
$(document).on('pageshow','#comunicato',function() {Application.initComunicatoUfficiale();});
$(document).on('pageshow','#news',function() {Application.initNews();});
$(document).on('pageshow','#news-singola',function() {Application.initNewsSingola();});

// settings
$(document).on('pageinit','#settings',function() {Application.initSettings();});

// foto
$(document).on('pageshow','#foto',function() {Application.initFoto();});


// swipe
$(document).on('swipeleft','#classifica',function() {$.mobile.changePage('risultati.html');});
$(document).on('swipeleft','#risultati',function() {$.mobile.changePage('classifica-marcatori.html');});
$(document).on('swipeleft','#classifica-marcatori',function() {$.mobile.changePage('classifica.html');});
// $(document).on('swipeleft','#classifica-marcatori',function() {$.mobile.changePage('classifica-formazione.html');});
// $(document).on('swipeleft','#classifica-formazione',function() {$.mobile.changePage('classifica.html');});
// $(document).on('swiperight','#classifica',function() {$.mobile.changePage('classifica-formazione.html');});
$(document).on('swiperight','#classifica',function() {$.mobile.changePage('classifica-marcatori.html');});
$(document).on('swiperight','#risultati',function() {$.mobile.changePage('classifica.html');});
$(document).on('swiperight','#classifica-marcatori',function() {$.mobile.changePage('risultati.html');});
// $(document).on('swiperight','#classifica-formazione',function() {$.mobile.changePage('classifica-marcatori.html');});
