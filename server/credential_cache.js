if (!Accounts.saml) {
  Accounts.saml = {};
}

SAMLTokens = new Mongo.Collection("saml_tokens");

Accounts.saml.insertProfile = function (credentialToken, profile, callback) {
  SAMLTokens.update({credentialToken: credentialToken}, 
    {$set: {profile: profile}}, {upsert: true}, callback);
}

Accounts.saml.retrieveProfile = function (credentialToken) {
  var profile = SAMLTokens.findOne({credentialToken: credentialToken}).profile;

  // Delete token from collection
  SAMLTokens.delete({credentialToken: credentialToken});

  return profile;
}

Accounts.saml.insertRedirectPath = function (credentialToken, redirectPath) {
  SAMLTokens.update({credentialToken: credentialToken}, 
    {$set: {redirectPath: redirectPath}}, {upsert: true});
}

Accounts.saml.retrieveRedirectPath = function (credentialToken) {
  var token = SAMLTokens.findOne({credentialToken: credentialToken});
  return token.redirectPath;
}

Meteor.methods({
  insertCredentialForRedirect: function(credentialToken, redirectPath) {
    Accounts.saml.insertRedirectPath(credentialToken, redirectPath, function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("Inserted credential and path from client...");
        console.log("credentialToken", credentialToken);
        console.log("redirectPath", redirectPath);
      }
    });
  }
});
