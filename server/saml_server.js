var Fiber = Meteor.npmRequire('fibers');
var bodyParser = Meteor.npmRequire('body-parser');
var saml = Meteor.npmRequire('passport-saml');
var fs = Meteor.npmRequire('fs');

var samlOpts = {};

var init = function () {
  if (!Accounts.saml) {
    Accounts.saml = {};
  }
  // In Memory Cache. Does not scale beyond a single instance!
  // credentialToken => SAML Response Profile

  Accounts.saml._loginResultForCredentialToken = {};
  Accounts.saml.insertCredential = function (credentialToken, profile) {
    Accounts.saml._loginResultForCredentialToken[credentialToken] = {profile: profile};
  };
  Accounts.saml.hasCredential = function(credentialToken) {
    return _.has(Accounts.saml._loginResultForCredentialToken, credentialToken);
  }
  Accounts.saml.retrieveCredential = function(credentialToken) {
    var result = Accounts.saml._loginResultForCredentialToken[credentialToken];
    delete Accounts.saml._loginResultForCredentialToken[credentialToken];
    return result;
  };

  RoutePolicy.declare(Meteor.settings.saml.loginUrl, 'network');
  RoutePolicy.declare(Meteor.settings.saml.callbackUrl, 'network');

  samlOpts = _.pick(Meteor.settings.saml, "path", "protocol", "callbackUrl",
               "entryPoint", "issuer", "cert", "privateCert", "decryptionPvk", "additionalParams",
               "additionalAuthorizeParams", "identifierFormat", "acceptedClockSkewMs",
               "attributeConsumingServiceIndex", "disableRequestedAuthnContext", "authnContext",
               "forceAuthn", "validateInResponseTo", "requestIdExpirationPeriodMs",
               "cacheProvider", "passReqToCallback", "logoutUrl", "additionalLogoutParams");

  if (samlOpts.decryptionPvk) {
    samlOpts.decryptionPvk = fs.readFileSync(samlOpts.decryptionPvk, 'utf-8');
  }

  if (samlOpts.cert) {
    samlOpts.cert = fs.readFileSync(samlOpts.cert, 'utf-8');
  }

  if (samlOpts.callbackUrl) {
    samlOpts.callbackUrl = Meteor.absoluteUrl() + samlOpts.callbackUrl.substring(1);
    console.log(JSON.stringify(samlOpts)); 
 }

  Accounts.saml.samlStrategy = new saml.Strategy(samlOpts,
    function (profile, done) {
      return done(null, profile); 
    }
  );

};

init();

Accounts.registerLoginHandler(function (loginRequest) {
  // Only apply this handler if a credentialToken exists.
  var error = new Error("Could not a user with the specified identifier.");
  if (!loginRequest.credentialToken) {
    var profile = Accounts.saml.retrieveCredential(loginRequest.credentialToken);
    if (profile && profile[Meteor.settings.saml.userIdentifier]) {
      var query = {};
      query["profile." + Meteor.settings.saml.userIdentifier] = profile[Meteor.settings.saml.userIdentifier];
      var user = Meteor.users.findOne(query);
      if (!user) {
        throw error;
      } else {
        return addLoginTokenToUser(user);
      }
    } else {
      throw error;
    }
  }
});

var addLoginTokenToUser = function (user) {
  var stampedToken = Accounts._generateStampedLoginToken();
  Meteor.users.update(user, {
    $push: {'services.resume.loginTokens': stampedToken}
  });
  return {
    id: user._id,
    token: stampedToken.token
  };
};

// Listen to incoming SAML http requests
WebApp.connectHandlers
  .use(bodyParser.urlencoded({ extended: false }))
  .use(function(req, res, next) {
    Fiber(function() {
      try {
        // redirect to IdP (SP -> IdP)
        if (req.url === Meteor.settings.saml.loginUrl) {
          Accounts.saml.samlStrategy._saml.getAuthorizeUrl(req, function (err, result) {
            res.writeHead(302, {
              'Location': result
            });
            res.end();
          });
        }
        // callback from IdP (IdP -> SP)
        else if (req.url === Meteor.settings.saml.callbackUrl) {
          Accounts.saml.samlStrategy._saml.validatePostResponse(req.body, function (err, result) {
            Accounts.saml.insertCredential(req.body.SAMLResponse, {profile: result});
          });
          onSamlEnd(null, res);
        }
        // Ignore requests that aren't for SAML.
        else {
          next();
          return;
        }
      } catch (err) {
        onSamlEnd(err, res);
      }
    }).run();
});

var onSamlEnd = function (err, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var content = err ?  "An error occured in the SAML Middleware process." : "";
  res.end(content, 'utf-8');
};

