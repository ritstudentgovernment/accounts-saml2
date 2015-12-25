# accounts-saml2

This Meteor package implements SAML2 authentication. It is a wrapper for the node `passport-saml` module. It provides middleware routes for processing login, callback, and metadata requests.

Install
=======

```
meteor add athyuttamre:accounts-saml2
```

Config
======

Supply passport-saml SAML properties in the Meteor `settings.json` like so:

```
{
  "saml": {
    "loginUrl": "/login",
    "protocol": "https",
    "host": "local.cis-dev.brown.edu:3000",
    "path": "/login/callback",
    // Supply remaining passport-saml options here.
  }
}
```

For file options, inline the values. There isn't a clean way to read files from Packages. Options include using Node's `fs`,
or the app reading the file and passing to the package. The Assets API isn't available i.e. packages can't read user assets.
For more discussion, see this: https://github.com/meteor/meteor/issues/1382. For a hacky fix, see this: https://github.com/lookback/meteor-emails/blob/master/utils.coffee.

There are extra (non passport-saml) options that be provided. They are:
- `serviceProviderCert`: Path to the Service Provider certificate file.
- `metadataUrl`: URL which metadata can be read from.

See the [Usage](https://github.com/bergie/passport-saml) section of passport-saml documentation for options that can be specified.
