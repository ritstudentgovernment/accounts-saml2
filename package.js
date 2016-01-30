Package.describe({
  name: 'athyuttamre:accounts-saml2',
  summary: 'SAML Authentication for Meteor, built for Brown University.',
  version: '0.0.2',
  git: 'https://github.com/athyuttamre/accounts-saml2.git'
});

Npm.depends({
  'fibers': '1.0.8',
  'body-parser': '1.14.2',
  'passport-saml': '0.14.0'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.2.1');
  api.use('underscore');
  api.use(['routepolicy', 'webapp', 'mongo'], ['server']);
  api.use(['accounts-base', 'random'], ['client', 'server']);

  api.addFiles(['server/attribute_map.js', 'server/credential_cache.js', 'server/saml_server.js'], 'server');
  api.addFiles(['client/saml_client.js'], 'client');
});
