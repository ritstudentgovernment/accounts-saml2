var Fiber = Meteor.npmRequire('fibers');
var bodyParser = Npm.require('body-parser');
var saml = Npm.require('passport-saml');
var fs = Meteor.npmRequire('fs');
var url = Meteor.npmRequire('url');

var samlOpts = {};

var init = function () {
  RoutePolicy.declare(Meteor.settings.saml.callbackUrl, 'network');

  samlOpts = _.pick(Meteor.settings.saml, "path", "protocol", "callbackUrl",
               "entryPoint", "issuer", "cert", "privateCert", "decryptionPvk", "additionalParams",
               "additionalAuthorizeParams", "identifierFormat", "acceptedClockSkewMs",
               "attributeConsumingServiceIndex", "disableRequestedAuthnContext", "authnContext",
               "forceAuthn", "validateInResponseTo", "requestIdExpirationPeriodMs",
               "cacheProvider", "passReqToCallback", "logoutUrl", "additionalLogoutParams",
               "serviceProviderCert", "metadataUrl");

  if (samlOpts.decryptionPvk) {
    samlOpts.decryptionPvk = fs.readFileSync(samlOpts.decryptionPvk, 'utf-8');
  }

  if (samlOpts.cert) {
    samlOpts.cert = fs.readFileSync(samlOpts.cert, 'utf-8');
  }

  if (samlOpts.serviceProviderCert) {
    samlOpts.serviceProviderCert = fs.readFileSync(samlOpts.serviceProviderCert, 'utf-8');
  }

  if (samlOpts.callbackUrl) {
    samlOpts.callbackUrl = Meteor.absoluteUrl() + samlOpts.callbackUrl.substring(1);
  }

  Accounts.saml.samlStrategy = new saml.Strategy(samlOpts,
    function (profile, done) {
      return done(null, profile); 
    }
  );

};

init();

Accounts.registerLoginHandler(function (loginRequest) {
  if (loginRequest.credentialToken && loginRequest.saml) {
    var samlResponse = Accounts.saml.retrieveCredential(loginRequest.credentialToken);
    if (samlResponse) {
      updateUserProfile(samlResponse);
      var user = Meteor.users.findOne({email: samlResponse.profile.email});
      return addLoginTokenToUser(user);
    } else {
      throw new Error("Could not find a profile with the specified credentialToken.");
    }
  }
});

var updateUserProfile = function (samlResponse) {
  var profile = {};
  for (var key in samlResponse.profile) {
    if (typeof samlResponse.profile[key] == "string") {
       if (Accounts.saml.isSamlAttribute(key)) {
         profile[Accounts.saml.getSamlAttributeFriendlyName(key)] = samlResponse.profile[key];
       }
       else {
         profile[key] = samlResponse.profile[key];
       }
    }
  }
  Meteor.users.update({email: samlResponse.profile.email}, {$set: {email: samlResponse.profile.email, profile: profile}}, {upsert: true});
};

var addLoginTokenToUser = function (user) {
  var stampedToken = Accounts._generateStampedLoginToken();
  Meteor.users.update(user, {
    $push: {'services.resume.loginTokens': stampedToken}
  });
  return {
    userId: user._id,
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
        if (url.parse(req.url).pathname === Meteor.settings.saml.loginUrl) {
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
            if (!err) { 
              Accounts.saml.insertCredential(req.body.RelayState, result);
            }
            onSamlEnd(err, res);
          });
        }
        // metadata requests
        else if (Meteor.settings.saml.metadataUrl && req.url === Meteor.settings.saml.metadataUrl) {
          res.writeHead(200, {'Content-Type': 'application/xml'});
          res.end(Accounts.saml.samlStrategy._saml.generateServiceProviderMetadata(samlOpts.serviceProviderCert), 'utf-8');
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
  var content = err ?  "An error occured in the SAML Middleware process." : "<html><head><script>window.close()</script></head></html>'";
  res.end(content, 'utf-8');
};

