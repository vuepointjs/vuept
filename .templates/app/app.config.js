const pkg = require('./package');

module.exports = {
  // Specify the identifier/key string for one of the supported app scenarios ("flavors" or "personas") of demo
  // (PV = Pharmaceutical industry (Pharmacovigilance), CC = Railroad customer communications, RO = Railroad operations)
  SCENARIO_KEY: 'PV',

  // API_HOST: 'https://api.????.com',
  API_HOST: 'http://localhost:8000'
};
