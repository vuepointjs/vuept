'use strict';

module.exports = function(partyLabel) {
  partyLabel.validatesFormatOf('Color', {
    with: /^#[0-9a-fA-F]{6}$/,
    message: '(Color) must be expressed as a valid CSS RGB hex value (e.g., #0D47A1)',
    allowNull: false
  });
};
