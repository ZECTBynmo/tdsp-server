window.DemoByGuidView = Backbone.View.extend({

    initialize:function () {
    	var _this = this;

    	// First, render ourselves
        this.render();

        var dat = this.model.attributes;

        var audioInputHTML = getAudioInputHTML( document.location.origin + "/raw/" + dat.guid + "." + dat.id + "." + "default.mp3" ),
        	originalInputHTML = getAudioInputHTML( document.location.origin + "/raw/" + dat.guid + ".original.mp3" ),
        	presetsHTML = "";

        // For each preset, insert a choice into the preset selection dropdown
        for( var iPreset in dat.presets ) {
        	var presetName = dat.presets[iPreset].key.split(":")[2];
        	console.log( JSON.parse(dat.presets[iPreset].value) )
        	presetsHTML += "<li><a presetName='" + presetName + "' class='preset'>" + presetName + "</a></li>";
        }

		$("#presetSelector", this.el).html( presetsHTML );

		// Hide the previews area until the user uploads a file
		$(".previews", _this.el).hide();


		$(".preset", this.el).click( function() {
			var name = $(this).attr('presetName');

			// Ask for the server to process a file with the selected preset
			$.get( "/requestProcess/" + dat.guid + "/" + dat.id + "/" + name, function( data ) {
				// Make sure the previews area is visible
				$(".previews", _this.el).show();

				// Insert a row into the previews table with the newly processed audio
				$(".previews", _this.el).append( "<tr><td>" + name + "</td><td>" + getAudioInputHTML("raw/" + data.fullName + ".mp3") + "</td></tr>" );
			});
		});

		// Update the file bar 
		$("#originalFile", this.el).html( originalInputHTML );
		$("#defaultSettings", this.el).html( audioInputHTML );
    },

    render:function () {
        $(this.el).html( this.template(this.model.toJSON()) );

        return this;
    }

});


function getAudioInputHTML( source ) {
	var audioInputHTML = '\
	<div id="player" style="display: none" class="">\
	  	<button onClick="document.getElementById("audio").play()">Play</button>\
	  	<button onClick="document.getElementById("audio").pause()">Pause</button>\
	</div>\
	\
		<audio id="audio_with_controls" controls>\
		  	<source id="audioSource" src="' + source + '" type="audio/mpeg" />\
		  	<object class="playerpreview" type="application/x-shockwave-flash" data="http://www.html5rocks.com/en/tutorials/audio/quick/player_mp3_mini.swf" width="200" height="20">\
		  	  	<param name="movie" value="http://www.html5rocks.com/en/tutorials/audio/quick/player_mp3_mini.swf" />\
		  	  	<param name="bgcolor" value="#085c68" />\
		  	  	<param name="FlashVars" value="mp3=' + source + '" />\
		  	  	<embed href="http://www.html5rocks.com/en/tutorials/audio/quick/player_mp3_mini.swf" \
		  	  	       bgcolor="#085c68" width="200" height="20" name="movie" align="" type="application/x-shockwave-flash"\
		  	  	       flashvars="mp3=' + source + '" />\
		  	</object>\
		</audio>\
	<div id="default_player_fallback"></div>';

	return audioInputHTML;
};