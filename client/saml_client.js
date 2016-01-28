// Client-side code that exposes login methods
// and handles redirect and pop-up functionality.

// Setup

if (!Accounts.saml) {
  Accounts.saml = {};
}

var loginUrl = "login";
Meteor.call("getLoginUrl", function(err, res) {
  loginUrl = res;
  if(loginUrl.indexOf("/") == 0)
    loginUrl = loginUrl.substring(1);
});


// Login

Meteor.loginWithSaml = function(options, callback) {
  // Support a callback without options
  if (!callback && typeof options === "function") {
    callback = options;
    options = null;
  }

  options = options || {};
  options.credentialToken = Random.id();

  Accounts.saml.initiateLogin(options, function() {
    Accounts.callLoginMethod({
      methodArguments: [{saml: true, credentialToken: options.credentialToken}],
      userCallback: callback
    });
  });
};

Accounts.saml.initiateLogin = function(options, callback) {
  if(options.loginStyle === "redirect") {
    // Redirect
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
        callback();
      }
    }, 100);
  }
};


// Helpers

function openCenteredPopup(url, width, height) {
  var screenX = typeof window.screenX !== 'undefined'
        ? window.screenX : window.screenLeft;
  var screenY = typeof window.screenY !== 'undefined'
        ? window.screenY : window.screenTop;
  var outerWidth = typeof window.outerWidth !== 'undefined'
        ? window.outerWidth : document.body.clientWidth;
  var outerHeight = typeof window.outerHeight !== 'undefined'
        ? window.outerHeight : (document.body.clientHeight - 22);

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
