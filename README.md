# accounts-saml2

This Meteor web application demonstrates SAML2 authentication. It is a wrapper for the `passport-saml` package. This package will be refactored for generic usage in any Meteor app in the near future.

Config
======

Supply SAML properties in the Meteor `settings.json` like so:

```
{
  "saml": {
    "loginUrl": "/login",
    "callbackUrl": "/login/callback",
    "entryPoint": "https://shibboleth-test.main.ad.rit.edu/idp/profile/SAML2/Redirect/SSO",
    "issuer": "https://evals-test.rit.edu/shibboleth",
    "decryptionPvk": "/path/to/key.pem",
    "cert": "/path/to/idp_cert.pem"
  }
}
```

See the [Usage](https://github.com/bergie/passport-saml) section of passport-saml documentation for more options.


Usage
=====

From the project root directory, run:

```
meteor
```
