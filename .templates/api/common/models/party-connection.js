'use strict';

module.exports = function(partyConnection) {
  partyConnection.validatesFormatOf('cid', {
    with: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    message: '(Connection ID) referential integrity is not enforced, but it must be supplied and look like a valid GUID string',
    allowNull: false
  });
};
