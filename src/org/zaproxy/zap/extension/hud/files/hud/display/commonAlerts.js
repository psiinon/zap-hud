
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
