const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const version = require(path.resolve(__dirname, './package.json')).version;

// Initialize placeholder to use when getting and exporting all of the individual schemas below
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
    .filter(val => val.widget != 'list')
    .value();

  const appFields = _.chain(schemaContainer.fields)
    .filter(['name', 'apps'])
    .first()
    .get('fields')
    .value();
  schema.app = _(appFields)
    .filter(val => val.widget != 'list')
    .value();

  const appletFields = _.chain(appFields)
    .filter(['name', 'applets'])
    .first()
    .get('fields')
    .value();
  schema.applet = _(appletFields)
    .filter(val => val.widget != 'list')
    .value();

  schema.view = _.chain(appletFields)
    .filter(['name', 'views'])
    .first()
    .get('fields')
    .value();
} catch (e) {
  console.log(e);
}

module.exports = {
  schema,
  version
};
