if (!Accounts.saml) {
  Accounts.saml = {};
}

var loginUrl = "login";
Meteor.call("getLoginUrl", function(err, res) {
  loginUrl = res;
});

Meteor.startup(function () {
  var saml = Reload._migrationData("saml");
  if (! (saml && saml.credentialToken)) {
    return;
  }

  var methodArguments = [{saml: true, credentialToken: saml.credentialToken}];
  Accounts.callLoginMethod({
    methodArguments: methodArguments,
    userCallback: function (err) {
      Accounts._pageLoadLogin({
        type: "saml",
        allowed: !err,
        error: err,
        methodName: "login",
        methodArguments: methodArguments
      });
    }
  });
});

Accounts.saml.saveDataAndRedirect = function(credentialToken) {
  Reload._onMigrate("saml", function () {
    return [true, {credentialToken: credentialToken}];
  });
  Reload._migrate(null, {immediateMigration: true});
  Meteor.call("insertCredentialForRedirect", credentialToken,
    window.location.pathname, function (err, res) {
      if (err) {
        console.error(err);
      } else {
        console.log("Succesfully saved credential, redirecting...");
        window.location = loginUrl + "?RelayState=" + credentialToken;
      }
    });
};

Accounts.saml.initiateLogin = function(options, callback) {
  if(options.loginStyle === "redirect") {
    Accounts.saml.saveDataAndRedirect(options.credentialToken);
  } else {
    // Popup
    var popup = openCenteredPopup(Meteor.absoluteUrl(loginUrl + 
      "?RelayState=" + options.credentialToken), 650, 500);

    var checkPopupOpen = setInterval(function() {
      try {
        var popupClosed = popup.closed || popup.closed === undefined;
      } catch (e) {
        return;
      }
      if (popupClosed) {
        clearInterval(checkPopupOpen);
        callback(null, options.credentialToken);
      }
    }, 100);
  }
};

var openCenteredPopup = function(url, width, height) {
  var screenX = typeof window.screenX !== 'undefined'
        ? window.screenX : window.screenLeft;
  var screenY = typeof window.screenY !== 'undefined'
        ? window.screenY : window.screenTop;
  var outerWidth = typeof window.outerWidth !== 'undefined'
        ? window.outerWidth : document.body.clientWidth;
  var outerHeight = typeof window.outerHeight !== 'undefined'
        ? window.outerHeight : (document.body.clientHeight - 22);
  // XXX what is the 22?

  // Use `outerWidth - width` and `outerHeight - height` for help in
  // positioning the popup centered relative to the current window
  var left = screenX + (outerWidth - width) / 2;
  var top = screenY + (outerHeight - height) / 2;
  var features = ('width=' + width + ',height=' + height +
                  ',left=' + left + ',top=' + top + ',scrollbars=yes');

  var popup = window.open(url, 'loginPopup', features);
  if (popup.focus)
    popup.focus();
  return popup;
};

Meteor.loginWithSaml = function(options, callback) {
  // Support a callback without options
  if (! callback && typeof options === "function") {
    callback = options;
    options = null;
  }

  options = options || {};
  options.credentialToken = Random.id();

  Accounts.saml.initiateLogin(options, function (error, result) {
    Accounts.callLoginMethod({
      methodArguments: [{saml: true, credentialToken: options.credentialToken}],
      userCallback: callback
    });
  });
};
