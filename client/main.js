if (Meteor.isClient) {
  Template.samlDemo.events({
    'click .saml-login': function (event, template) {
      event.preventDefault();
      Meteor.loginWithSaml({}, function (error, result) {
        debugger;
      });
    }
  });
}
