/* SAML Attributes cannot be stored directly in Mongo due to dot notation.
 * This implementation converts SAML attributes to their friendly format.
 * Not all SAML attributes included.
 */

if (!Accounts.saml) {
  Accounts.saml = {};
}

Accounts.saml._attributeMap = {
  "urn:oid:0.9.2342.19200300.100.1.1": "uid",
  "urn:oid:2.5.4.42": "givenName",
  "urn:oid:1.3.6.1.4.1.4447.1.59": "eduPersonScopedAffiliation",
  "urn:oid:0.9.2342.19200300.100.1.3": "mail",
  "urn:oid:2.5.4.4": "sn"
};

Accounts.saml.isSamlAttribute = function (attribute) {
 return _.has(Accounts.saml._attributeMap, attribute);
};

Accounts.saml.getSamlAttributeFriendlyName = function (attribute) {
  return Accounts.saml._attributeMap[attribute];
}

