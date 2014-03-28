window.DSPModuleView = Backbone.View.extend({

    initialize:function () {
        this.render();  
    },

    render:function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }

});


function updateParamValues() {
	var params = {};

	for( var iParam in $(".param") ) {
		var paramName = $(".paramName").get(iParam).innerText,
			paramType = $(".paramType").get(iParam).innerText;

		if( paramName != undefined ) {
			if( paramType == "bool" ) {
				if( $(".param").get(iParam).value == "true" )
					params[paramName] = true;
				else
					params[paramName] = false;
			} else {
				params[paramName] = Number( $(".param").get(iParam).value );
			}
		}
	}

	var name = $(".dspName").text();

	if( $("#newPresetName").get(0).value.indexOf(" ") != -1 ) {
		alert("No spaces allowed in preset names" );
	} else {
		var paramFile = {
			name: name,
			parameters: params,
			presetName: $("#newPresetName").get(0).value
		};

		console.log( paramFile );

		$.post('/updateParams', paramFile, function(data, textStatus, jqXHR) {});	
	}
}