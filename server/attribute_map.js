// SAML Attributes cannot be stored directly in Mongo due to dot notation.
// This implementation converts SAML attributes to their friendly format.
// Not all SAML attributes included.

if (!Accounts.saml) {
  Accounts.saml = {};
}

// List of attributes Brown gives us. Not the cleanest way
// to treat this information, since it can change in the future.
// Unfortunately passport-saml doesn't automatically parse FriendlyNames,
// which is why we have a manually prescribed list.
//
// Someday in the future, we should automate the parsing of FriendlyNames.
 
Accounts.saml._attributeMap = _.extend({
  "urn:oid:0.9.2342.19200300.100.1.3": "mail",
  "urn:oid:1.3.6.1.4.1.5923.1.1.1.1": "eduPersonAffiliation",
  "urn:oid:1.3.6.1.4.1.5923.1.1.1.5": "eduPersonPrimaryAffiliation",
  "urn:oid:1.3.6.1.4.1.5923.1.1.1.6": "eduPersonPrincipalName",
  "urn:oid:2.16.840.1.113730.3.1.241": "displayName",
  "urn:oid:2.5.4.12": "title",
  "urn:oid:2.5.4.4": "sn",
  "urn:oid:2.5.4.42": "givenName"
}, Meteor.settings.saml.attributeMap || {});

Accounts.saml.isSamlAttribute = function (attribute) {
 return _.has(Accounts.saml._attributeMap, attribute);
};

Accounts.saml.getSamlAttributeFriendlyName = function (attribute) {
  return Accounts.saml._attributeMap[attribute];
}
