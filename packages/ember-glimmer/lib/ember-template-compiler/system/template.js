import EmberObject from 'ember-runtime/system/object';
import { Template } from 'glimmer-runtime';

const Wrapper = EmberObject.extend({
  init() {
    this._super();
    this._entryPoint = null;
    this._layout = null;
    this._parsed = null;
  },

  asEntryPoint() {
    if (!this._entryPoint) {
      let parsed = this._parse();
      let { env } = this;
      this._entryPoint = Template.fromSpec(parsed, env);
    }

    return this._entryPoint;
  },

  asLayout() {
    if (!this._layout) {
      let parsed = this._parse();
      let { env } = this;
      this._layout = Template.layoutFromSpec(parsed, env);
    }

    return this._layout;
  },

  _parse() {
    if (this._parsed) { return this._parsed; }

    let parsed = this._parsed = JSON.parse(this.raw);
    this.raw = null;

    return parsed;
  }
});

export default function template(raw) {
  return Wrapper.extend({ raw });
}
