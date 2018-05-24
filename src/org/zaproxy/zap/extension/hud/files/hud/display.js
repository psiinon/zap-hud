// app is the main Vue object controlling everything
var app;

// the Event wrapper class will act as an Event dispatcher for Vue
window.Event = new class {
	constructor() {
		this.vue = new Vue();
	}

	fire(event, data = null) {
		this.vue.$emit(event, data);
	}

	listen(event, callback) {
		this.vue.$on(event, callback);
	}
}

/* Vue Components */
Vue.component('modal', {
	template: '#modal-template',
	props: ['show', 'title', 'text'],
	methods: {
		close: function () {
			this.$emit('close');
		},
		afterLeave: function (el) {
			if (!app.keepShowing) {
				hideDisplayFrame();
			}
			app.keepShowing = false;
		}
	}
})

Vue.component('dialog-modal', {
	template: '#dialog-modal-template',
	props: ['show', 'title', 'text'],
	methods: {
		close: function() {
			this.$emit('close');
		},
		buttonClick: function(id) {
			this.port.postMessage({'action': 'dialogSelected', id: id});
			this.close();
		}
	},
	data() {
		return {
			port: null,
			buttons: [
				{text: "Okay", id:"okay"},
				{text: "Cancel", id:"cancel"}
			]
		}
	},
	created: function() {
		let self = this;

		Event.listen('showDialogModal', function(data) {

			app.isDialogModalShown = true;
			app.dialogModalTitle = data.title;
			app.dialogModalText = data.text;

			self.buttons = data.buttons;
			self.port = data.port;
		})
	}
});

Vue.component('select-tool-modal', {
	template: '#select-tool-modal-template',
	props:['show', 'title'],
	methods: {
		close: function() {
			this.$emit('close');
		},
	},
	data() {
		return {
			port: null,
			tools: []
		}
	},
	created: function() {
		let self = this;

		Event.listen('showSelectToolModal', function(data) {
			app.isSelectToolModalShown = true;
			
			self.tools = data.tools;
			self.port = data.port;
		});
	}
})

Vue.component('tool-li', {
	template: '#tool-li-template',
	props:['image', 'label', 'toolname', 'port'],
	methods: {
		close: function() {
			this.$emit('close');
		},
		toolSelect: function() {
			this.port.postMessage({'action': 'toolSelected', 'toolname': this.toolname})
			this.close();
		}
	}
})

Vue.component('all-alerts-modal', {
	template: '#all-alerts-modal-template',
	props: ['show', 'title'],
	methods: {
		close: function () {
			this.$emit('close');
		}
	},
	data() {
		return {
			port: null,
			alerts: {}
		}
	},
	created: function() {
		let self = this;
		
		Event.listen('showAllAlertsModal', function(data) {
			app.isAllAlertsModalShown = true;
			app.allAlertsModalTitle = data.title;

			self.alerts = data.alerts;
			self.port = data.port;
		})
	}
})

Vue.component('alert-list-modal', {
	template: '#alert-list-modal-template',
	props:['show', 'title'],
	methods: {
		close: function() {
			this.$emit('close');
		},
	},
	data() {
		return {
			port: null,
			alerts: {}
		}
	},
	created() {
		let self = this;

		Event.listen('showAlertListModal', function(data) {
			app.isAlertListModalShown = true;
			app.alertListModalTitle = data.title;

			self.alerts = data.alerts;
			self.port = data.port;
		});
	}
})

Vue.component('alert-accordion', {
	template: '#alert-accordion-template',
	props:['title', 'alerts', 'port'],
	methods: {
		close: function() {
			this.$emit('close');
		},
		urlCount: function(alert) {
			let count = 0;
			for (var url in alert) {
				count += 1;
			}
			return count;
		},
		alertSelect: function(alert) {
			// set keepShowing so that we don't hide the display frame
			app.keepShowing = true;
			app.isAlertListModalShown = false;
			app.isAllAlertsModalShown = false;

			this.port.postMessage({'action': 'alertSelected', 'alertId': alert.alertId})
		}
	}
})

Vue.component('alert-details-modal', {
	template: '#alert-details-modal-template',
	props: ['show', 'title'],
	methods: {
		close: function() {
			this.$emit('close');
		}
	},
	data() {
		return {
			port: null,
			details: {}
		}
	},
	created() {
		let self = this;

		Event.listen('showAlertDetailsModal', function(data) {
			app.isAlertDetailsModalShown = true;
			app.alertDetailsModalTitle = data.title;
			
			self.details = data.details;
			self.port = data.port;
		})
	}
})

Vue.component('simple-menu-modal', {
	template: '#simple-menu-modal-template',
	props: ['show', 'title'],
	methods: {
		close: function() {
			this.$emit('close');
		},
		itemSelect: function(itemId) {
			this.port.postMessage({'action': 'itemSelected', 'id': itemId}); 
			this.close();
		}
	},
	data() {
		return {
			port: null,
			items: {}
		}
	},
	created() {
		let self = this;

		Event.listen('showSimpleMenuModal', function(data) {
			app.isSimpleMenuModalShown = true;
			app.simpleMenuModalTitle = data.title;

			self.items = data.items;
			self.port = data.port;
		})
	}
})

Vue.component('tabs', {
	template: '#tabs-template',
    data() {
        return { 
			tabs: [] 
		};
    },
    methods: {
        selectTab(selectedTab) {
            this.tabs.forEach(tab => {
                tab.isActive = (tab.href == selectedTab.href);
            });
        }
    },
    created() {
        this.tabs = this.$children;
    },

});

Vue.component('tab', {
    template: '#tab-template',
    props: {
        name: { required: true },
        selected: { default: false }
    },
    data() {
        return {
            isActive: false
        };
    },
    computed: {
        href() {
            return '#' + this.name.toLowerCase().replace(/ /g, '-');
        }
    },
    mounted() {
        this.isActive = this.selected;
    },
});

Vue.component('scope-modal', {
	template: '#scope-modal-template',
	props: ['show', 'title'],
	methods: {
		close: function() {
			this.$emit('close');
		},
		save: function() {
			// TODO check they are valid regexes
			var incRegexJson = [];
			var regexArray = this.incRegexs.split('\n');
			for (var i = 0; i < regexArray.length; i++) {
				var regex = regexArray[i];
				try {
					new RegExp(regex);
				} catch(e) {
					this.errorMessage = 'Invalid \'include\' regex: ' + regex
					return;
				}
				incRegexJson.push(regex);
			}
			
			this.port.postMessage({'action': 'scopeUpdated', 'incRegexs': incRegexJson});
			this.close();
		},
		addDomainToScope: function() {
			if (this.incRegexs.length > 0 && ! this.incRegexs.endsWith('\n')) {
				this.incRegexs += "\n";
			}
			this.incRegexs += this.domain + ".*";
			this.addedDomain = true;
			// Move cursor to end of textarea to make it more obvious that the domains been added
			var textarea = this.$el.querySelector("#increg");
			textarea.setSelectionRange(textarea.value.length,textarea.value.length);
		},
		addUrlToScope: function() {
			if (this.incRegexs.length > 0 && ! this.incRegexs.endsWith('\n')) {
				this.incRegexs += "\n";
			}
			// TODO need to pass this in
			this.incRegexs += window.location.href;
		}
	},
	data() {
		return {
			port: null,
			details: {},
			domain: null,
			incRegexs : null,
			excRegexs : null,
			addedDomain: false,
			errorMessage: ''
		}
	},
	created() {
		let self = this;

		Event.listen('showScopeModal', function(data) {
			log (LOG_DEBUG, 'display.js', 'Got showScopeModal event'); // TODO remove
			app.isScopeModalShown = true;
			app.scopeModalTitle = data.title;
			self.incRegexs = JSON.parse(data.context.includeRegexs).join('\n');
			self.excRegexs = JSON.parse(data.context.excludeRegexs).join('\n');
			self.domain = data.domain;
			self.details = data.details;	// TODO dont need?
			self.port = data.port;
			self.addedDomain = false;
			self.errorMessage = '';
		})
	}
})

document.addEventListener("DOMContentLoaded", function() {

	/* Vue app */
	app = new Vue({
		el: '#app',
		data: {
			isDialogModalShown: false,
			dialogModalTitle: "HUD Modal",
			dialogModalText: "text",
			isSelectToolModalShown: false,
			isAlertListModalShown: false,
			alertListModalTitle: "Alerts",
			isAllAlertsModalShown: false,
			allAlertsModalTitle: "All Alerts",
			isAlertDetailsModalShown: false,
			alertDetailsModalTitle: "Alert Details",
			isSimpleMenuModalShown: false,
			simpleMenuModalTitle: "Menu",
			isScopeModalShown: false,
			scopeModalTitle: "Scope",
			keepShowing: false,
		},
	});
});

navigator.serviceWorker.addEventListener("message", function(event) {
	var action = event.data.action;
	var config = event.data.config;
	var port = event.ports[0];
	log (LOG_ERROR, 'display.js', 'Got message with action: ' + action);
	
	switch(action) {
		case "showDialog":
			Event.fire('showDialogModal', {
				title: config.title, 
				text: config.text,
				buttons: config.buttons,
				port: port
			});
			
			break;

		case "showAddToolList":
			Event.fire('showSelectToolModal', {
				tools: config.tools,
				port: port
			});
		
			break;

		case "showAlerts":
			Event.fire('showAlertListModal', {
				title: config.title,
				alerts: config.alerts,
				port: port
			});
		
			break;

		case "showAllAlerts":
			Event.fire('showAllAlertsModal', {
				title: config.title,
				alerts: config.alerts,
				port: port
			});
		
			break;

		case "showAlertDetails":
			Event.fire('showAlertDetailsModal', {
				title: config.title,
				details: config.details,
				port: port
			});
		
			break;

		case "showButtonOptions":
			Event.fire('showSimpleMenuModal', {
				title: config.toolLabel,
				items: config.options,
				port: port
			});
		
			break;

		case "showHudSettings":
			Event.fire('showSimpleMenuModal', {
				title: 'HUD Settings',
				items: config.settings,
				port: port
			});
		
		case "showScope":
			log (LOG_DEBUG, 'display.js', 'Got showScope event');
			Event.fire('showScopeModal', {
				title: 'Scope',
				items: config.settings,
				port: port,
				context: config.context,
				domain: config.domain
			});
		
			break;

		case "showHttpMessage":
			//TODO: implement when fixing break & timeline
			break;

		default:
			log (LOG_ERROR, 'display.js', 'Unexpected action: ' + action);
			break;
	}

	// show the display frame
	showDisplayFrame();
});

/* the injected script makes the main frame visible */
function showDisplayFrame() {
	return messageWindow(parent, {action: "showMainDisplay"}, document.referrer);
}

/* the injected script makes the main frame invisible */
function hideDisplayFrame() {
	parent.postMessage({action:"hideMainDisplay"}, document.referrer);
}