var AppRouter = Backbone.Router.extend({

    routes: { // leto-marker-main-route-list
        "": "home",
        'dsp': "dspList",
        "about": "about",
        "presets": "preset",
        'dsp/:id': 'dspDetails',
        'presets/:id': 'preset',
        'dsp/:id/demo': 'dspDemo',
        'dsp/page/:page': "dspList",
        'processed/:id': 'processed',
        'dsp/:id/demo/:guid': 'demoByGuid',
        'presets/:id/:presetName': 'preset',
    },

    dspList: function( page ) {
        var p = page ? parseInt(page, 10) : 1;
        var dspList = new DSPModuleCollection();
        dspList.fetch({success: function() {
            console.log( dspList );
            $("#content").html(new DSPModuleListView({model: dspList, page: p}).el);
        }});
        this.headerView.selectMenuItem('home-menu');
    },

    dspDetails: function ( id ) {

        var dspModule = new DSPModule({id: id});
        dspModule.fetch({success: function(){
            $("#content").html(new DSPModuleView({model: dspModule}).el);
        },error: function(m,r) {
          console.log("error");
          console.log(r.responseText);
        }});
        
        this.headerView.selectMenuItem();
    },

    dspDemo: function ( id ) {

        var dspModule = new DSPModuleDemo({id: id});
        dspModule.fetch({success: function(){
            $("#content").html(new DemoView({model: dspModule}).el);
        },error: function(m,r) {
          console.log("error");
          console.log(r.responseText);
        }});
        
        this.headerView.selectMenuItem();
    },

    demoByGuid: function ( id, guid ) {

        var dspModule = new DSPModuleDemoByGuid({id: id, guid: guid});
        dspModule.fetch({success: function() {
            $("#content").html(new DemoByGuidView({model: dspModule}).el);
        },error: function(m,r) {
          console.log("error");
          console.log(r.responseText);
        }});
        
        this.headerView.selectMenuItem();
    },

    preset: function ( id, presetName ) {

        var preset = new Preset({id: id, presetName: presetName});
        preset.fetch({success: function() {
            $("#content").html(new PresetView({model: preset}).el);
        },error: function(m,r) {
          console.log("error");
          console.log(r.responseText);
        }});
        
        this.headerView.selectMenuItem();
    },

    initialize: function () {
        this.headerView = new HeaderView();
        $('.header').html(this.headerView.el);
    },

    // leto-marker-router-functions
	processed: function ( id ) {
		var dsp = new ProcessedFile({guid: id});

		this.processedView = new ProcessedView({model:dsp});
		
        $('#content').html(this.processedView.el);
		this.headerView.selectMenuItem('home-menu');
	},


    home: function (id) {
        if (!this.homeView) {
            this.homeView = new HomeView();
        }
        $('#content').html(this.homeView.el);
        this.headerView.selectMenuItem('home-menu');
    },

    about: function () {
        if (!this.aboutView) {
            this.aboutView = new AboutView();
        }
        $('#content').html(this.aboutView.el);
        this.headerView.selectMenuItem('about-menu');
    }

});

var templateFiles = [ // leto-marker-html-template-list
    'HomeView', 
    'DemoView',
    'AboutView',
    'HeaderView', 
    'PresetView',
    'ProcessedView',
    'DSPModuleView',
    'DemoByGuidView',
    'DSPModuleListItemView',
];

utils.loadTemplate( templateFiles, function() {
    app = new AppRouter();
    Backbone.history.start();
});
