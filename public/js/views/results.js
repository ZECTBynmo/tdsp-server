window.processedView = Backbone.View.extend({

    initialize:function () {
        this.render();

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
				sound.attr('hidden', true);
				sound.attr('autostart', true);
				$('body').append(sound);
			}
		}
		 
		play_sound('http://mvegeto-pc:5000/results/061bafd0-565a-11e3-aa52-73c713ab5567');
    },

    render:function () {
        $(this.el).html(this.template());
        return this;
    }
});