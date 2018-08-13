'use strict';

module.exports = function(party) {
  // Hide certain endpoints related to ConnectedParties that either
  // don't make sense to support or simply don't work properly.
  // For example, testing shows that "count" is returning count of *all* Parties
  // in the system instead of the count of items in the HXRefParties array.
  party.disableRemoteMethodByName('prototype.__count__ConnectedParties');
  // ...and the same thing for the PartyConnections "transient" model relationship
  party.disableRemoteMethodByName('prototype.__get__PartyConnections');
  party.disableRemoteMethodByName('prototype.__create__PartyConnections');
  party.disableRemoteMethodByName('prototype.__delete__PartyConnections');
  party.disableRemoteMethodByName('prototype.__findById__PartyConnections');
  party.disableRemoteMethodByName('prototype.__updateById__PartyConnections');
  party.disableRemoteMethodByName('prototype.__destroyById__PartyConnections');
  party.disableRemoteMethodByName('prototype.__count__PartyConnections');

  // console.log('>>> party model extension running...');
  // console.dir(party.definition);

  // party.afterInitialize = function() {
  //   console.log('>>> party.afterInitialize...');
  //   console.dir(this);
  // };

  // party.observe('access', function(ctx, next) {
  //   console.log(`>>> Accessing ${ctx.Model.modelName}`);
  //   if (typeof loopback != 'undefined' && loopback) console.dir(loopback.getCurrentContext());
  //   next();
  // });

  // party.observe('loaded', function(ctx, next) {
  //   console.log(`>>> In Loaded Operation for ${ctx.Model.pluralModelName}. Raw data...`);
  //   console.dir(ctx.data);
  //   next();
  // });
};
