// This is an in-memory credentialToken => samlResponse cache.
// This implementation does not scale beyond a single instance.

if (!Accounts.saml) {
  Accounts.saml = {};
}

Accounts.saml._loginResultForCredentialToken = {};

// Inserted during IdP -> SP Callback
Accounts.saml.insertCredential = function (credentialToken, profile) {
  Accounts.saml._loginResultForCredentialToken[credentialToken] = {profile: profile};
};

// Retrieved in account login handler
Accounts.saml.retrieveCredential = function(credentialToken) {
  var result = Accounts.saml._loginResultForCredentialToken[credentialToken];
  delete Accounts.saml._loginResultForCredentialToken[credentialToken];
  return result;
};
