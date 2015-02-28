Package.describe({
  name: 'ritstudentgovernment:accounts-saml2',
  summary: 'SAML Authentication for Meteor',
  version: '0.0.0',
  git: 'https://github.com/ritstudentgovernment/accounts-saml2.git'
});

Npm.depends({
  'fibers': '1.0.5',
  'body-parser': '1.12.0',
  'passport-saml': '0.9.1'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.0.3.2');
  api.use('underscore');
  api.use(['routepolicy','webapp'], ['server']);
  api.use(['accounts-base'], ['client', 'server']);
  api.addFiles(['server/saml_server.js'], 'server');
  api.addFiles(['client/saml_client.js'], 'client');
});


