var Fiber = Npm.require('fibers');
var bodyParser = Npm.require('body-parser');
var saml = Npm.require('passport-saml');
var url = Npm.require('url');

var samlOpts = {};

var init = function () {
  if(!(Meteor.settings || Meteor.settings.saml))
    throw new Error("No SAML settings specified.")

  samlOpts = _.pick(Meteor.settings.saml, "protocol", "host", "path", "callbackUrl",
               "entryPoint", "issuer", "cert", "privateCert", "decryptionPvk", "additionalParams",
               "additionalAuthorizeParams", "identifierFormat", "acceptedClockSkewMs",
               "attributeConsumingServiceIndex", "disableRequestedAuthnContext", "authnContext",
               "forceAuthn", "validateInResponseTo", "requestIdExpirationPeriodMs",
               "cacheProvider", "passReqToCallback", "logoutUrl", "additionalLogoutParams",
               "serviceProviderCert", "metadataUrl");

  // NOTE: Inline all files in settings.json for now

  // Make loginUrl accessible from client
  Meteor.methods({
    getLoginUrl: function() {
      return Meteor.settings.saml.loginUrl;
    }
  });

  if (!samlOpts.callbackUrl) {
    samlOpts.callbackUrl = samlOpts.protocol + "://" + samlOpts.host + samlOpts.path;
  }
  RoutePolicy.declare(samlOpts.path, 'network');

  Accounts.saml.samlStrategy = new saml.Strategy(samlOpts,
    function (profile, done) {
      return done(null, profile); 
    }
  );
};

init();

Accounts.registerLoginHandler(function (loginRequest) {
  if (loginRequest.credentialToken && loginRequest.saml) {
    var profile = Accounts.saml.retrieveProfile(loginRequest.credentialToken);
    if (profile) {
      updateUserProfile(profile);
      var user = Meteor.users.findOne({email: profile.email});
      return addLoginTokenToUser(user);
    } else {
      throw new Meteor.Error("no-credential-token", 
        "Could not find a samlResponse with the specified credentialToken.",
        loginRequest.credentialToken);
    }
  }
});

var cleanResponseForMongo = function (samlResponse) {
  var profile = {};
  for (var key in samlResponse) {
    var value = samlResponse[key];
    // Only save values that are Strings or arrays, not objects. This avoids 
    // having to make sure that the inner keys don't have periods.
    if (typeof value === "string" || value.constructor === Array) {
      if (Accounts.saml.isSamlAttribute(key)) {
        profile[Accounts.saml.getSamlAttributeFriendlyName(key)] = value;
      }
      else if (key.indexOf(".") == -1) {
        // Only insert other keys that don't contain a period in them. 
        // Mongo can't handle periods in keys.
        profile[key] = value;
      }
    }
  }

  return profile;
}

var updateUserProfile = function (profile) {
  Meteor.users.update({email: profile.email},
      { $set: {email: profile.email, profile: profile} }, {upsert:true});
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

// Listen to incoming SAML HTTP requests
WebApp.connectHandlers
  .use(bodyParser.urlencoded({ extended: false }))
  .use(function(req, res, next) {
    Fiber(function() {
      try {
        // Redirect to IdP (SP -> IdP)
        if (url.parse(req.url).pathname === Meteor.settings.saml.loginUrl) {
          Accounts.saml.samlStrategy._saml.getAuthorizeUrl(req, function (err, result) {
            res.writeHead(302, { 'Location': result });
            res.end();
          });
        }
        // Callback from IdP (IdP -> SP)
        else if (req.url === Meteor.settings.saml.path) {
          var credentialToken = null;
          Accounts.saml.samlStrategy._saml.validatePostResponse(req.body, Meteor.bindEnvironment(function (err, result) {
            if (!err) { 
              credentialToken = req.body.RelayState;
              Accounts.saml.insertProfile(credentialToken, cleanResponseForMongo(result));
              if (Accounts.saml.isRedirect(credentialToken)) {
                var redirectPath = Accounts.saml.retrieveRedirectPath(credentialToken) || Meteor.absoluteUrl();
                res.writeHead(302, { "Location": redirectPath });
                return res.end();
              }
            } else {
              console.log("err", err);
              console.log("req.body", req.body);
            }

            onSamlEnd(err, res);
          }));
        }
        // Metadata requests
        else if (Meteor.settings.saml.metadataUrl && req.url === Meteor.settings.saml.metadataUrl) {
          res.writeHead(200, {'Content-Type': 'application/xml'});
          res.end(Accounts.saml.samlStrategy._saml.generateServiceProviderMetadata(samlOpts.serviceProviderCert), 'utf-8');
        }
        // Ignore requests that aren't for SAML
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
  var content;

  if(err) {
    console.log(err);
    content = "An error occured in the SAML Middleware process.";
  } else {
    // If popup login, close popup and let client call loginMethod.
    content = "<html><head><script>window.close()</script></head></html>";
  }

  res.end(content, 'utf-8');
};
