//////////////////////////////////////////////////////////////////////////
// DSPModule - A a piece of TestableDSP 
window.DSPModule = Backbone.Model.extend({
	urlRoot: "/dsp",
	url: function() {
        return document.location.hash.slice(1);
    },

    defaults: {
    	name: "default_name",
    	params: {
    		default_param: {
    			default: 0.0,
    			min: -1.0,
    			min: 1.0,
    		}
    	},
    	image: "pics/generic.jpg"
    }
});

window.DSPModuleCollection = Backbone.Collection.extend({
    model: DSPModule,

    url: function() {
        return "/dsp";
    }
});


//////////////////////////////////////////////////////////////////////////
// ProcessedFile - A file that's had some processing applied
window.ProcessedFile = Backbone.Model.extend({
	urlRoot: "/processed",
	url: function() {
        return document.location.hash.slice(1);
    },

    defaults: {
    	guid: 0,
    }
});

window.ProcessedFileCollection = Backbone.Collection.extend({

    model: ProcessedFile,

    url: function() {
        return "/processed";
    }
});

//////////////////////////////////////////////////////////////////////////
// DSPModuleDemo
window.DSPModuleDemo = Backbone.Model.extend({
    url: function() {
        return document.location.hash.slice(1);
    },

    defaults: {
        dsp: {
            name: "default_name",
            params: {
                default_param: {
                    default: 0.0,
                    min: -1.0,
                    min: 1.0,
                }
            },
            image: "pics/generic.jpg"
        },

        presets: [
            {
              "key": "presets:EMT140:default",
              "value": "[object Object]"
            },
        ]
    }
});

window.DSPModuleDemoByGuid = Backbone.Model.extend({
    url: function() {
        return document.location.hash.slice(1);
    },

    defaults: {
        dsp: {
            name: "default_name",
            params: {
                default_param: {
                    default: 0.0,
                    min: -1.0,
                    min: 1.0,
                }
            },
            image: "pics/generic.jpg"
        },

        presets: [
            {
              "key": "presets:EMT140:default",
              "value": "[object Object]"
            },
        ],
        guid: "deadbeef"
    }
});

window.Preset = Backbone.Model.extend({
    url: function() {
        return document.location.hash.slice(1);
    },

    defaults: {
        name: "default_name",
        params: {
            default_param: {
                default: 0.0,
                min: -1.0,
                min: 1.0,
            }
        },
        image: "pics/generic.jpg"
    }
});