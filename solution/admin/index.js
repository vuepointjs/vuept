const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const schema = {
  suite: null,
  app: null,
  applet: null,
  view: null
};

// We use Netlify CMS config.yml spec as source of truth and parse individual schemas from it
try {
  const config = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, './config.yml'), 'utf8'));
  const schemaContainer = config.collections[0].files[0].fields[0];

  schema.suite = _(schemaContainer.fields)
    .filter(val => val.name != 'apps')
    .value();

  const appFields = _.chain(schemaContainer.fields)
    .filter(['name', 'apps'])
    .first()
    .get('fields')
    .value();
  schema.app = _(appFields)
    .filter(val => val.name != 'applets')
    .value();

  const appletFields = _.chain(appFields)
    .filter(['name', 'applets'])
    .first()
    .get('fields')
    .value();
  schema.applet = _(appletFields)
    .filter(val => val.name != 'views')
    .value();

  schema.view = _.chain(appletFields)
    .filter(['name', 'views'])
    .first()
    .get('fields')
    .value();

  // console.log(suiteSchema);
} catch (e) {
  console.log(e);
}

module.exports = {
  schema
};
