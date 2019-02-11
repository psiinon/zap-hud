/*
 * Break Tool
 *
 * Description goes here...
 */

var Break = (function() {

	// Constants
	// todo: could probably switch this to a config file?
	var NAME = "break";
	var LABEL = I18n.t("break_tool");
	var DATA = {};
		DATA.OFF = I18n.t("common_off");
		DATA.ON = I18n.t("common_on");
	var ICONS = {};
		ICONS.OFF = "break-off.png";
		ICONS.ON = "break-on.png";
	var DIALOG = {};
		DIALOG.START = "Start breaking?";
		DIALOG.STOP = "Stop breaking?";

	//todo: change this to a util function that reads in a config file (json/xml)
	function initializeStorage() {
		var tool = {};
		tool.name = NAME;
		tool.label = LABEL;
		tool.data = DATA.OFF;
		tool.icon = ICONS.OFF;
		tool.isSelected = false;
		tool.isRunning = false;
		tool.panel = "";
		tool.position = 0;

		utils.writeTool(tool);
		registerForZapEvents("org.zaproxy.zap.extension.brk.BreakEventPublisher");
	}

	function toggleBreak(tabId) {
		utils.loadTool(NAME)
			.then(tool => {
				if (tool.data === DATA.OFF) {
					startBreaking(tabId);
				}
				else {
					stopBreaking(tabId);
				}
			})
			.catch(utils.errorHandler)
	}

	function startBreaking(tabId) {
		return apiCallWithResponse("break", "action", "break", { type: "http-all", state: "true" })
			.catch(error => {
				utils.zapApiErrorDialog(tabId, error);
				throw error;
			})
			.then(response => {
				utils.loadTool(NAME)
				.then(tool => {
					tool.isRunning = true;
					tool.data = DATA.ON;
					tool.icon = ICONS.ON;
	
					utils.messageAllTabs(tool.panel, {action: 'broadcastUpdate', tool: {name: NAME, data: DATA.ON, icon: ICONS.ON}})
					utils.writeTool(tool);
				})
			})
			.catch(utils.errorHandler)

	}

	// todo: change this to 'continue' and figure out / fix stopBreaking
	function stopBreaking(tabId) {
		return apiCallWithResponse("break", "action", "continue")
			.catch(error => {
				utils.zapApiErrorDialog(tabId, error);
				throw error;
			})
			.then(response => {
				utils.loadTool(NAME)
					.then(tool => {
						tool.isRunning = false;
						tool.data = DATA.OFF;
						tool.icon = ICONS.OFF;
		
						utils.messageAllTabs(tool.panel, {action: 'broadcastUpdate', tool: {name: NAME, data: DATA.OFF, icon: ICONS.OFF}})
						utils.writeTool(tool)
					})
			})
			.catch(utils.errorHandler);
	}

	function step(tabId) {
		return apiCallWithResponse("break", "action", "step")
			.catch(error => {
				if (tabId) {
					// tabId wont be supplied if we're stepping through reqs that arrive when the window isnt ready
					utils.zapApiErrorDialog(tabId, error);
					throw error;
				}
			});
	}

	function drop(tabId) {
		return apiCallWithResponse("break", "action", "drop")
			.catch(error => {
				utils.zapApiErrorDialog(tabId, error);
				throw error;
			});
	}

	function setHttpMessage(tabId, header, body) {
		return apiCallWithResponse("break", "action", "setHttpMessage", { httpHeader: header, httpBody: body })
			.catch(error => {
				utils.zapApiErrorDialog(tabId, error);
				throw error;
			});
	}

	function showBreakDisplay(data) {
		var config = {
			request: {
				header: '',
				body: ''
			},
			response: {
				header: '',
				body: ''
			},
			isResponseDisabled: true,
			activeTab: "Request"
		};

		if ('responseBody' in data) {
			config.response.header = data.responseHeader.trim();
			config.response.body = data.responseBody;
			config.isResponseDisabled = false;
			config.activeTab = "Response";
		}
		
		config.request.method = utils.parseRequestHeader(data.requestHeader).method;
		config.request.header = data.requestHeader.trim();
		config.request.body = data.requestBody;

		utils.getAllClients('display')
			.then(clients => {
				let isFirefox = this.navigator.userAgent.indexOf("Firefox") > -1 ? true : false;
				let r = false;

				if (isFirefox) {
					for(let i=0; i<clients.length; i++) {
						if (clients[i].visibilityState == 'visible') {
							r = true;
						}
					}
				}
				else {
					if (clients.length > 0) {
						r = true;
					}
				}

				return r;
			})
			.then(isVisible => {
				if (!isVisible) {
					utils.log(LOG_DEBUG, 'break.showBreakDisplay', 'Target window not ready, stepping');
					step();
					utils.messageAllTabs('display', {action:'closeModals'})
					return;
				}
			})
			.catch(utils.errorHandler);

		utils.messageAllTabs("display", {action:"showBreakMessage", config:config})
			.then(response => {
				// Handle button choice
				if (response.buttonSelected === "step") {
					setHttpMessage(response.tabId, response.header, response.body)
						.then(() => {
							step(response.tabId);
							utils.messageAllTabs('display', {action:'closeModals', config: {notTabId: response.tabId}})
						})
						.catch(utils.errorHandler);
				}
				else if (response.buttonSelected === "continue") {
					setHttpMessage(response.tabId, response.header, response.body)
						.then(() => {
							stopBreaking(response.tabId);
							utils.messageAllTabs('display', {action:'closeModals', config: {notTabId: response.tabId}})
						})
						.catch(utils.errorHandler);
				}
				else if (response.buttonSelected === "drop") {
					drop(response.tabId);
					utils.messageAllTabs('display', {action:'closeModals', config: {notTabId: response.tabId}})
				}
				else {
					//cancel
				}
			})
			.catch(utils.errorHandler);
	}

	function showOptions(tabId) {
		var config = {};

		config.tool = NAME;
		config.toolLabel = LABEL;
		config.options = {remove: I18n.t("common_remove"), filter: "Add Filter"};

		utils.messageFrame(tabId, "display", {action:"showButtonOptions", config:config})
			.then(response => {
				// Handle button choice
				if (response.id == "remove") {
					utils.removeToolFromPanel(tabId, NAME);
				}
			})
			.catch(utils.errorHandler);
	}

	self.addEventListener("activate", event => {
		initializeStorage();
	});

	self.addEventListener("message", event => {
		var message = event.data;

		// Broadcasts
		switch(message.action) {
			case "initializeTools":
				initializeStorage();
				break;

			default:
				break;
		}

		// Directed
		if (message.tool === NAME) {
			switch(message.action) {
				case "buttonClicked":
					toggleBreak();
					break;

				case "buttonMenuClicked":
					showOptions(message.tabId);
					break;

				default:
					break;
			}
		}
	});

	self.addEventListener("org.zaproxy.zap.extension.brk.BreakEventPublisher", event => {
		if (event.detail['event.type'] === 'break.active' && event.detail['messageType'] === 'HTTP') {
			showBreakDisplay(event.detail);
		}
	});

	return {
		name: NAME,
		initialize: initializeStorage
	};
})();

self.tools[Break.name] = Break;
