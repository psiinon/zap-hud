/*
 * Injection Module
 *
 * Description goes here...
 */

 var injection  = (function () {
	// Injected strings
	var URL = '<<URL>>';
	var ZAP_HUD_FILES = '<<ZAP_HUD_FILES>>';
	var ZAP_SHARED_SECRET = '<<ZAP_SHARED_SECRET>>';
	
	var HUD_PREFIX = 'zap-hud-';
	var LEFT_PANEL = HUD_PREFIX + 'left-panel';
	var RIGHT_PANEL = HUD_PREFIX + 'right-panel';
	var BOTTOM_DRAWER = HUD_PREFIX + 'bottom-drawer';
	var MAIN_DISPLAY = HUD_PREFIX + 'main-display';
	var GROWLER_ALERTS = HUD_PREFIX + 'growler-alerts';
	var MANAGEMENT = HUD_PREFIX + 'management';

	 let tabId = '';

	/* HELPERS */
	function isFromTrustedOrigin (message) {
		return (
			message.origin === "https://zap"
			|| message.isTrusted
		);
	}

	function generateTabId() {
		let millis = new Date().getTime();
		let r = Math.floor(Math.random()*1000);
		let tabId = '' + millis + '-' + r;

		return tabId.substring(6);
	}

	/* TARGET INTERACTIONS */
	// code that will interact with the target domain will go here

	function showPanel(panel) {
		return 0;
	}

	/* change width of iframe for expanding buttons*/
	function expandPanel(panelOrientation){
		// todo: is this too hacky?
		var panel = document.getElementById(HUD_PREFIX + panelOrientation+"-panel");

		panel.style.width = "300px";
	}

	function contractPanel(panelOrientation){
		var panel = document.getElementById(HUD_PREFIX + panelOrientation+"-panel");
		
		panel.style.width = "110px";
	}

	/* dynamically size growler iframes with number of alerts */
	function heightenGrowlerFrame(lines) {
		var panel = document.getElementById(GROWLER_ALERTS);
		var offset = 56 + 30 * lines;

		panel.style.height = (panel.offsetHeight + offset) + "px";
	}

	function shortenGrowlerFrame(lines) {
		var panel = document.getElementById(GROWLER_ALERTS);
		var offset = 56 + 30 * lines;

		panel.style.height = (panel.offsetHeight - offset) + "px";
	}

	/* dynamically size iframes with number of buttons */
	function heighten(panelOrientation) {
		var panel = document.getElementById(HUD_PREFIX + panelOrientation+"-panel");

		panel.style.height = (panel.offsetHeight + 33) + "px";
	}

	function shorten(panelOrientation) {
		var panel = document.getElementById(HUD_PREFIX + panelOrientation+"-panel");

		panel.style.height = (panel.offsetHeight - 33) + "px";
	}

	function showHudPanels() {
		document.getElementById(LEFT_PANEL).style.display = "";
		document.getElementById(RIGHT_PANEL).style.display = "";
		var panel = document.getElementById(BOTTOM_DRAWER);
		panel.style.width = "100%";
		panel.style.left = "0px";
		panel.style.right = "";
	}

	function hideHudPanels() {
		document.getElementById(LEFT_PANEL).style.display = "none";
		document.getElementById(RIGHT_PANEL).style.display = "none";
		var panel = document.getElementById(BOTTOM_DRAWER);
		panel.style.width = "90px";
		panel.style.left = "";
		panel.style.right = "0px";
	}

	function hideAllDisplayFrames() {
		document.getElementById(LEFT_PANEL).style.display = "none";
		document.getElementById(RIGHT_PANEL).style.display = "none";
		document.getElementById(BOTTOM_DRAWER).style.display = "none";
		document.getElementById(GROWLER_ALERTS).style.display = "none";
	}

	function showAllDisplayFrames() {
		document.getElementById(LEFT_PANEL).style.display = "";
		document.getElementById(RIGHT_PANEL).style.display = "";
		document.getElementById(BOTTOM_DRAWER).style.display = "";
		document.getElementById(GROWLER_ALERTS).style.display = "";
	}

	function refreshAllFrames() {
		document.getElementById(LEFT_PANEL).src = document.getElementById(LEFT_PANEL).src;
		document.getElementById(RIGHT_PANEL).src = document.getElementById(RIGHT_PANEL).src;
		document.getElementById(MAIN_DISPLAY).src = document.getElementById(MAIN_DISPLAY).src;
		document.getElementById(BOTTOM_DRAWER).src = document.getElementById(BOTTOM_DRAWER).src;
		document.getElementById(GROWLER_ALERTS).src = document.getElementById(GROWLER_ALERTS).src;
		document.getElementById(MANAGEMENT).src = document.getElementById(MANAGEMENT).src;
	}

	function refreshDisplayFrames() {
		document.getElementById(LEFT_PANEL).src = document.getElementById(LEFT_PANEL).src;
		document.getElementById(RIGHT_PANEL).src = document.getElementById(RIGHT_PANEL).src;
		document.getElementById(MAIN_DISPLAY).src = document.getElementById(MAIN_DISPLAY).src;
		document.getElementById(BOTTOM_DRAWER).src = document.getElementById(BOTTOM_DRAWER).src;
		document.getElementById(GROWLER_ALERTS).src = document.getElementById(GROWLER_ALERTS).src;
	}

	function refreshManagementFrame() {
		document.getElementById(MANAGEMENT).src = document.getElementById(MANAGEMENT).src;
	}

	/* hide or show main iframe for popups and dialogs */
	function showMainDisplay() {
		document.getElementById(MAIN_DISPLAY).style.display = "";
	}

	function hideMainDisplay() {
		document.getElementById(MAIN_DISPLAY).style.display = "none";
	}
	
	function showBottomDrawer() {
		document.getElementById(BOTTOM_DRAWER).style.height = "30%";
	}

	function hideBottomDrawer() {
		document.getElementById(BOTTOM_DRAWER).style.height = "50px";
	}


	function expandManagement() {
		document.getElementById(MANAGEMENT).style.width = "100%";
		document.getElementById(MANAGEMENT).style.height = "100%";
	}

	function contractManagement() {
		document.getElementById(MANAGEMENT).style.width = "0px";
		document.getElementById(MANAGEMENT).style.height = "0px";
	}
	
	// TODO showEnable section - put this code in a separate file and inject ?
	var showEnabled = false;
	var showEnabledCount = 0;
	var showEnableTypeHiddenFields = [];
	var showEnableDisplayNoneFields = [];
	var showEnableDisplayHiddenFields = [];
	var showEnabledDisabled = [];
	var showEnabledReadOnly = [];

	function showEnableOn() {
		var inputs, index;

		inputs = document.getElementsByTagName('input');
		for (index = 0; index < inputs.length; ++index) {
			var counted = false;
			if (inputs[index].disabled) {
				inputs[index].disabled = false;
				inputs[index].style.borderColor = 'blue';
				showEnabledDisabled.push(inputs[index]);
				// We dont count disabled fields as they are still visible
			}
			if (inputs[index].readOnly) {
				inputs[index].readOnly = false;
				inputs[index].style.borderColor = 'blue';
				showEnabledReadOnly.push(inputs[index]);
				// We dont count readonly fields as they are still visible
			}
			if (inputs[index].type == "hidden") {
				inputs[index].type = "";
				inputs[index].style.borderColor = 'purple';
				showEnableTypeHiddenFields.push(inputs[index]);
				showEnabledCount++;
				counted = true;
			}
			if (inputs[index].style.display == "none") {
				inputs[index].style.display = "";
				inputs[index].style.borderColor = 'purple';
				showEnableDisplayNoneFields.push(inputs[index]);
				if (! counted) {
					showEnabledCount++;
					counted = true;
				}
			}
			if (inputs[index].style.visibility == "hidden") {
				inputs[index].style.visibility = "";
				inputs[index].style.borderColor = 'purple';
				showEnableTypeHiddenFields.push(inputs[index]);
				if (! counted) {
					// If any checks are added after this will also need to inc counted
					showEnabledCount++;
				}
			}
		}
		showEnabled = true;
	}

	function showEnableOff() {
		var index;
		for (index = 0; index < showEnableTypeHiddenFields.length; ++index) {
			showEnableTypeHiddenFields[index].type = 'hidden';
			showEnableTypeHiddenFields[index].style.borderColor = '';
		}
		for (index = 0; index < showEnableDisplayNoneFields.length; ++index) {
			showEnableDisplayNoneFields[index].style.display = 'none';
			showEnableDisplayNoneFields[index].style.borderColor = '';
		}
		for (index = 0; index < showEnableDisplayHiddenFields.length; ++index) {
			showEnableDisplayHiddenFields[index].style.visibility = 'hidden';
			showEnableDisplayHiddenFields[index].style.borderColor = '';
		}
		for (index = 0; index < showEnabledDisabled.length; ++index) {
			showEnabledDisabled[index].disabled = true;
			showEnabledDisabled[index].style.borderColor = '';
		}
		for (index = 0; index < showEnabledReadOnly.length; ++index) {
			showEnabledReadOnly[index].readOnly = true;
			showEnabledReadOnly[index].style.borderColor = '';
		}
		showEnableTypeHiddenFields = [];
		showEnableDisplayNoneFields = [];
		showEnableDisplayHiddenFields = [];
		showEnabledDisabled = [];
		showEnabledReadOnly = [];
		showEnabled = false;
		showEnabledCount = 0;
	}
	

	function showEnableCount() {
		var count = 0;
		if (showEnabled) {
			count = showEnabledCount;
		} else {
			// Count the number of hidden fields
			var inputs = document.getElementsByTagName('input');
			for (let index = 0; index < inputs.length; ++index) {
				if (inputs[index].type == "hidden") {
					count++;
				} else if (inputs[index].style.display == "none") {
					count++;
				} else if (inputs[index].style.visibility == "hidden") {
					count++;
				}
			}
		}
		// Send to the management frame with the shared secret
		var iframe = document.getElementById(MANAGEMENT);
		iframe.contentWindow.postMessage({action: 'showEnable.count', tabId: tabId, count: count, sharedSecret: ZAP_SHARED_SECRET}, ZAP_HUD_FILES);
	}
	
	function highlightAlert(alert) {
		var id = alert.param;
		var el = document.getElementById(id);
		if (!el) {
			var els = document.getElementsByName(id);
			for (var i=0; i < els.length; i++) {
				if (els[i] instanceof HTMLInputElement) {
					el = els[i];
					break;
				}
			}
		}
		if (el) {
			const colours = {
				'Informational': 'blue',
				'Low': 'yellow',
				'Medium': 'orange',
				'High': 'red'
			};
			let colour = colours[alert.risk];
			el.style.borderColor = colour || 'red';
			el.insertAdjacentHTML('afterend',
				'<img src="' + ZAP_HUD_FILES + '/image/flag-' + colour + '.png" ' +
				'id="zapHudAlert-' + alert.id + '" ' +
				'title="' + alert.name + '" height="16" width="16" ' +
				'onclick="injection.showZapAlert(' + alert.id + ');" />');
		}
	}
	
	// End of showEnable section
	
	// TODO showComments section - put this code in a separate file and inject ?
	let commentImages = [];
	
	function includeComment(commentNode) {
		return commentNode.textContent.trim().length > 0;
	}

	function isSuspiciousComment(commentNode, suspiciousList) {
		var textUc = commentNode.textContent.toUpperCase();
		for (var i = 0; i < suspiciousList.length; i++) {
			if (textUc.indexOf(suspiciousList[i]) > -1) {
				return true;
			}
		}
		return false;
	}

	function showCommentsOn(suspiciousList) {
		let x = document.evaluate('//comment()', document, null, XPathResult.ANY_TYPE, null);
		let count = 0;
		let comments = [];
		let comment = null;
		// Can't change the DOM while iterating through the results, so put them in a list
		while (comment = x.iterateNext()) {
			if (includeComment(comment)) {
				comments.push(comment);
			}
		}
		let first = document.body.firstChild;
		comments.forEach(comment => {
			count += 1;
			let img = new Image(16, 16);
			img.src = ZAP_HUD_FILES + '/image/balloon.png';
			img.title = comment.textContent;
			img.id = 'zapHudComment-' + count;
			img.style.zIndex="1000000";
			img.onclick = function() {navigator.clipboard.writeText(comment.textContent);};
			
			if (isSuspiciousComment(comment, suspiciousList)) {
				img.src = ZAP_HUD_FILES + '/image/balloon-yellow-exclamation.png';
			}
			
			try {
				if (document.body.contains(comment)) {
					comment.parentNode.insertBefore(img, comment);
				} else {
					// Inject into the top of the body otherwise it wont be visible
					if (first) {
						// Keep the same 'first' node to keep the comments in order
						document.body.insertBefore(img, first);
					} else {
						// Nothing in the body, unlikely but possible
						document.body.appendChild(img);
					}
				}
				commentImages.push(img);
			} catch (err) {
				console.log("Failed to add comment icon " + err.message);
			}
		});
	}

	function showCommentsOff() {
		commentImages.forEach(img => {
			img.parentNode.removeChild(img);
		})
		commentImages = [];
	}
	

	function showCommentsCount(suspiciousList) {
		let x = document.evaluate('//comment()', document, null, XPathResult.ANY_TYPE, null);
		let comment = null;
		let count = 0;
		let sus = 0;
	
		while (comment = x.iterateNext()) {
			if (includeComment(comment)) {
				count += 1;
				if (isSuspiciousComment(comment, suspiciousList)) {
					sus += 1;
				}
			}
		}
		// Send to the management frame with the shared secret
		var iframe = document.getElementById(MANAGEMENT);
		iframe.contentWindow.postMessage({action: 'showComments.count', tabId: tabId, 
			count: count, suspicious: sus, sharedSecret: ZAP_SHARED_SECRET}, ZAP_HUD_FILES);
	}
	
	// End of showComments section


	function showZapAlertInternal (alertId) {
		// Send to the management frame with the shared secret
		var iframe = document.getElementById(MANAGEMENT);
		iframe.contentWindow.postMessage({action: 'commonAlerts.showAlert', alertId: alertId, tabId: tabId, sharedSecret: ZAP_SHARED_SECRET}, ZAP_HUD_FILES);
	}


	/* COMMUNICATIONS */
	function receiveMessages (event) {

		if (!isFromTrustedOrigin(event)) {
			return;
		}

		var message = event.data;

		switch(message.action) {
			case "showPanel":
				showPanel(message.orientation);
				break;

			case "showHudPanels":
				showHudPanels();
				break;

			case "hideHudPanels":
				hideHudPanels();
				break;

			case "showMainDisplay":
				showMainDisplay();
				event.ports[0].postMessage({isDisplayShown:"true"});
				break;

			case "hideMainDisplay":
				hideMainDisplay();
				break;
			
			case "showBottomDrawer":
				showBottomDrawer();
				break;

			case "hideBottomDrawer":
				hideBottomDrawer();
				break;

			case "hideAllDisplayFrames":
				hideAllDisplayFrames();
				break;

			case "showAllDisplayFrames":
				showAllDisplayFrames();
				break;

			case "expandPanel":
				expandPanel(message.orientation);
				break;

			case "contractPanel":
				contractPanel(message.orientation);
				break;

			case "expandManagement":
				expandManagement();
				break;

			case "contractManagement":
				contractManagement();
				break;

			case "refresh":
				window.location.reload(false);
				break;

			case "refreshAllFrames":
				refreshAllFrames();
				break;

			case "refreshDisplayFrames":
				refreshDisplayFrames();
				break;

			case "refreshManagementFrame":
				refreshManagementFrame();
				break;

			case "heighten":
				heighten(message.orientation);
				break;

			case "shorten":
				shorten(message.orientation);
				break;

			case "heightenGrowlerFrame":
				heightenGrowlerFrame(message.lines);
				break;

			case "shortenGrowlerFrame":
				shortenGrowlerFrame(message.lines);
				break;

			case "showEnable.on":
				showEnableOn();
				break;

			case "showEnable.off":
				showEnableOff();
				break;

			case "showEnable.count":
				showEnableCount();
				break;
				
			case "showComments.on":
				showCommentsOn(message.suspicious);
				break;

			case "showComments.off":
				showCommentsOff();
				break;

			case "showComments.count":
				showCommentsCount(message.suspicious);
				break;
				
			case "commonAlerts.alert":
				highlightAlert(message);
				break;

			default:
				break;
		}
	}

	/* initializes the HUD Frames */
	if (window.top == window.self) {
		tabId = generateTabId();

		window.addEventListener("message", receiveMessages);

		var template = document.createElement("template");
		template.innerHTML = 
			'<iframe id="' + MANAGEMENT + '" src="' + ZAP_HUD_FILES + '/file/management.html?frameId=management&amp;tabId=' + tabId + '" scrolling="no" style="position: fixed; right: 0px; bottom: 50px; width:28px; height:60px; border: medium none; overflow: hidden; z-index: 2147483647"></iframe>\n' +
			'<iframe id="' + LEFT_PANEL + '" src="' + ZAP_HUD_FILES + '/file/panel.html?url=' + URL + '&amp;orientation=left&amp;frameId=leftPanel&amp;tabId=' + tabId + '" scrolling="no" style="position: fixed; border: medium none; top: 30%; border: medium none; left: 0px; width: 110px; height: 300px; z-index: 2147483646;"></iframe>\n' +
			'<iframe id="' + RIGHT_PANEL + '" src="' + ZAP_HUD_FILES + '/file/panel.html?url=' + URL + '&amp;orientation=right&amp;frameId=rightPanel&amp;tabId=' + tabId + '" scrolling="no" style="position: fixed; border: medium none; top: 30%; overflow: hidden; right: 0px; width: 110px; height: 300px; z-index: 2147483646;"></iframe>\n' +
			'<iframe id="' + BOTTOM_DRAWER + '" src="' + ZAP_HUD_FILES + '/file/drawer.html?frameId=drawer&amp;tabId=' + tabId + '" scrolling="no" style="position: fixed; border: medium none; overflow: hidden; left: 0px; bottom: 0px; width: 100%; height: 50px; z-index: 2147483646;"></iframe>\n' +
			'<iframe id="' + MAIN_DISPLAY + '" src="' + ZAP_HUD_FILES + '/file/display.html?frameId=display&amp;tabId=' + tabId + '" style="position: fixed; right: 0px; top: 0px; width: 100%; height: 100%; border: 0px none; display: none; z-index: 2147483647;"></iframe>\n' +
			'<iframe id="' + GROWLER_ALERTS + '" src="' + ZAP_HUD_FILES + '/file/growlerAlerts.html?frameId=growlerAlerts&amp;tabId=' + tabId + '" style="position: fixed; right: 0px; bottom: 30px; width: 500px; height: 0px;border: 0px none; z-index: 2147483647;"></iframe>';
		document.body.appendChild(template.content);
		document.body.style.marginBottom = "50px";
		
		let zapReplaceOffset = window.location.href.indexOf('zapHudReplaceReq=');
		if (zapReplaceOffset > 0) {
			// Hide the zapHudReplaceReq injected when resending a message in the browser
			// But dont loose any fragment
			var fragment = window.location.hash.substr(1);
			var origUrl = window.location.href.substring(0, zapReplaceOffset-1);
			if (fragment) {
				origUrl += "#" + fragment;
			}
			history.pushState({},document.title,origUrl);
		}
	}
	
	return {
		showZapAlert: function(alertId) {
			showZapAlertInternal(alertId);
		}
	};
})();
