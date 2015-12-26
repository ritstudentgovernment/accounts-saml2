# accounts-saml2

This Meteor package implements SAML2 authentication. It is a wrapper for the node `passport-saml` module. It provides middleware routes for processing login, callback, and metadata requests.

Install
=======

```
meteor add athyuttamre:accounts-saml2
```

Config
======

## Meteor Setup

To get SAML authentication working on your local machine, you need three things:

1. Run Meteor on SSL using [this guide](http://stackoverflow.com/questions/27963749/setup-https-ssl-on-localhost-for-meteor-development). Make sure SSL is running on port 3000; your app can run on any other port, such as 3100.
2. If developing for Brown University, add an entry to your computer's hosts file for `127.0.0.1` to `local.cis-dev.brown.edu`.
3. Add the settings below to `settings.json`.

Finally, run your app so: `meteor --settings settings.json --port 3100`, and navigate to `https://local.cis-dev.brown.edu:3000` in an incognito window. It's important to run this in a private window so that you can debug your login session. Right now, logout isn't supported.

Couple of tips to help you debug:
- Monitor the Network tab within Chrome Developer Tools as you go through the login flow. Make sure `Preserve Logs` is checked; this way logs persist even after redirects.
- Use http://samltools.com/decode.php to read the values of `SAMLRequest` and `SAMLResponse`, the two pieces of information that'll be sent around during these redirects. You can read the values from the Network tab above.

## Package Setup

For the package itself, supply passport-saml SAML properties in the Meteor `settings.json` like so:

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

Specify your `callbackUrl` in parts as `protocol`, `host`, and `path`. For all other URLs, specify relative paths beginning with a `/`. For files, inline the values.

Unfortunately, there isn't a clean way to read files from within a Package. Options include using Node's `fs`,
or the app reading the file and passing to the package. The Assets API isn't available i.e. packages can't read user assets.
For more discussion, see this: https://github.com/meteor/meteor/issues/1382. For a hacky fix, see this: https://github.com/lookback/meteor-emails/blob/master/utils.coffee.

There are extra (non passport-saml) options that be provided. They are:
- `serviceProviderCert`: Path to the Service Provider certificate file.
- `metadataUrl`: URL which metadata can be read from.

See the [Usage](https://github.com/bergie/passport-saml) section of passport-saml documentation for options that can be specified.
