# accounts-saml2

This Meteor web application demonstrates SAML2 authentication. It is a wrapper for the `passport-saml` package. This package will be refactored for generic usage in any Meteor app in the near future.

Config
======

Supply passport-saml SAML properties in the Meteor `settings.json` like so:

```
{
  "saml": {
    "loginUrl": "/login",
    "callbackUrl": "/login/callback",
    // Supply remaining passport-saml options here.
  }
}
```

For file options, specify a canonical path.
For URL's, specify a relative path which will be resolved.

There are extra (non passport-saml) options that be provided. They are:
- `serviceProviderCert`: Path to the Service Provider certificate file.
- `metadataUrl`: URL which metadata can be read from.

See the [Usage](https://github.com/bergie/passport-saml) section of passport-saml documentation for options that can be specified.

Usage
=====

From the project root directory, run:

```
meteor --settings settings.json
```

