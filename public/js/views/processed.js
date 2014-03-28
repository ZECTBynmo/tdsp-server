window.ProcessedView = Backbone.View.extend({

    initialize:function () {
		this.render();
    	
    	if( document.createElement('audio').canPlayType ) {
		  	if( !document.createElement('audio').canPlayType('audio/mpeg')
	  	  	 && !document.createElement('audio').canPlayType('audio/ogg') ) {
		  	  	swfobject.embedSWF("http://www.html5rocks.com/en/tutorials/audio/quick/player_mp3_mini.swf",
		  	  	                   "default_player_fallback", "200", "20", "9.0.0", "",
		  	  	                   {"mp3":"http://www.html5rocks.com/en/tutorials/audio/quick/test.mp3"},
		  	  	                   {"bgcolor":"#085c68"}
		  	  	                  );
		  	  	swfobject.embedSWF("http://www.html5rocks.com/en/tutorials/audio/quick/player_mp3_mini.swf",
		  	  	                   "custom_player_fallback", "200", "20", "9.0.0", "",
		  	  	                   {"mp3":"http://www.html5rocks.com/en/tutorials/audio/quick/test.mp3"},
		  	  	                   {"bgcolor":"#085c68"}
		  	  	                  );
		  	  	document.getElementById('audio_with_controls').style.display = 'none';
		  	} else {
		  	  	// HTML5 audio + mp3 support
		  	  	//document.getElementById('player').style.display = 'block';
		  	}
		}        

        function html5_audio(){
			var a = document.createElement('audio');
			return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
		}
		 
		var play_html5_audio = false;
		if(html5_audio()) play_html5_audio = true;
		 
		function play_sound(url){
			if(play_html5_audio){
				var snd = new Audio(url);
				snd.load();
				snd.play();
			} else {
				$("#sound").remove();
				var sound = $("<embed id='sound' type='audio/mpeg' />");
				sound.attr('src', url);
				sound.attr('loop', false);
				//sound.attr('hidden', true);
				sound.attr('autostart', true);
				$('body').append(sound);
			}
		}

		var source = 'http://mvegeto-pc:5000/raw/' + this.options.guid + ".wav";

		console.log( source )

		$("#audioSource").attr( "src", source );
		 
		play_sound('http://mvegeto-pc:5000/raw/' + this.options.guid + ".wav" );
    },

    render:function () {
    	console.log( "Rendering" );
        $(this.el).html(this.template());
        return this;
    }
});