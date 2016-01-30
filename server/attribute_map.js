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
 
Accounts.saml._attributeMap = {
  "urn:oid:1.3.6.1.4.1.5923.1.1.1.1": "eduPersonAffiliation",
  "urn:oid:1.3.6.1.4.1.5923.1.1.1.5": "eduPersonPrimaryAffiliation",
  "urn:oid:1.3.6.1.4.1.6537.1.25": "brownStatus",
  "urn:oid:2.5.4.4": "sn",
  "urn:oid:1.3.6.1.4.1.5923.1.1.1.9": "eduPersonScopedAffiliation",
  "urn:oid:1.3.6.1.4.1.6537.1.63": "machineID",
  "urn:oid:1.3.6.1.4.1.6537.1.14": "brownNetID",
  "urn:oid:1.3.6.1.4.1.6537.1.19": "brownUUID",
  "https://www.brown.edu/shibboleth/attributes/brownAuthenticationProfiles": "brownAuthenticationProfiles",
  "urn:oid:1.3.6.1.4.1.6537.1.16": "brownBannerID",
  "urn:oid:1.3.6.1.4.1.5923.1.5.1.1": "isMemberOf",
  "urn:oid:0.9.2342.19200300.100.1.3": "mail",
  "urn:oid:1.3.6.1.4.1.5923.1.1.1.6": "eduPersonPrincipalName",
  "urn:oid:2.5.4.42": "givenName",
  "urn:oid:2.5.4.12": "title",
  "urn:oid:1.3.6.1.4.1.5923.1.1.1.7": "eduPersonEntitlement",
  "urn:oid:1.3.6.1.4.1.6537.1.68": "brownAdvanceId",
  "urn:oid:1.3.6.1.4.1.6537.1.13": "brownBruID",
  "urn:oid:1.3.6.1.4.1.6537.1.28": "brownType",
  "urn:oid:1.3.6.1.4.1.6537.1.15": "brownShortID",
  "urn:oid:2.16.840.1.113730.3.1.241": "displayName"
};

Accounts.saml.isSamlAttribute = function (attribute) {
 return _.has(Accounts.saml._attributeMap, attribute);
};

Accounts.saml.getSamlAttributeFriendlyName = function (attribute) {
  return Accounts.saml._attributeMap[attribute];
}
