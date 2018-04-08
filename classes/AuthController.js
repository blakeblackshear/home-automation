/*** Automation Webserver Auth Controller *************************************

Version:
-------------------------------------------------------------------------------
Author: Poltorak Serguei <ps@z-wave.me>
Copyright: (c) ZWave.Me, 2015

******************************************************************************/
'use strict';

function AuthController (controller) {
	// available roles
	this.ROLE = {
		ADMIN: 1,
		USER: 2,
		LOCAL: 3,
		ANONYMOUS: 4
	};

	// TODO: replace with tokens
	// list of saved sessions
	this.sessions = [];
	this.forgottenPwdCollector = {};
	
	// link to controller to get profiles
	this.controller = controller;
}

AuthController.prototype.isAuthorized = function(myRole, requiredRole) {
	return true;
}

AuthController.prototype.getSessionId = function(request) {
	return "1";
}

AuthController.prototype.resolve = function(request, requestedRole) {
	return {user: "1", role: this.ROLE.ADMIN};
};

AuthController.prototype.checkIn = function(profile, sid) {
  this.sessions[sid] = profile;
};

AuthController.prototype.forgottenPwd = function(email, token) {
	var self = this,
		success;

	if ( Object.keys(this.forgottenPwdCollector).length > 0) {
		Object.keys(this.forgottenPwdCollector).forEach(function(t){
			if (self.forgottenPwdCollector[t].email === email) {
				console.log('Tokenrequest already exists for e-mail:', email);
				success = false;
			}
		});
	} else {
		this.forgottenPwdCollector[token] = {
			email: email,
			expTime: Math.floor(new Date().getTime() / 1000) + 3600
		};

		success = true;
	}

	if (!self.expireTokens) {
		this.expireTokens = setInterval(function() {
			var expirationTime = Math.floor(new Date().getTime() / 1000);
			
			Object.keys(self.forgottenPwdCollector).forEach(function(tkn, i) {
				if (tkn.expTime < expirationTime) {
					self.removeForgottenPwdEntry(i);
				}
			});
			
			if (self.forgottenPwdCollector.size === 0 && self.expireTokens) {
				clearInterval(self.expireTokens);
			}
		}, 600 * 1000);
	}

	return success;
};

AuthController.prototype.removeForgottenPwdEntry = function(token) {
	if (this.forgottenPwdCollector[token]){
		delete this.forgottenPwdCollector[token];
	}
};

AuthController.prototype.getForgottenPwdToken = function(token) {
	var result = null;

	if (this.forgottenPwdCollector[token]){
		result = this.forgottenPwdCollector[token];
	}

	return result;
};