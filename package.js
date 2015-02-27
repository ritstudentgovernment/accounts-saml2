Package.describe({
  name: 'ritstudentgovernment:accounts-saml2',
  summary: 'SAML Authentication for Meteor',
  version: '0.0.0',
  git: 'https://github.com/ritstudentgovernment/accounts-saml2.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.3.2');
  api.use(['routepolicy','webapp'], ['server']);
  api.use(['accounts-base'], ['client', 'server']);
  api.addFiles(['server/saml_server.js'], 'server');
  api.addFiles(['client/saml_client.js'], 'client');
});

Npm.depends({
  "passport-saml": "0.9.1"
});

