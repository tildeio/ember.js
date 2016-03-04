import { OWNER } from 'container/owner';
import Component from 'ember-views/components/component';
import ComponentLookup from 'ember-views/component_lookup';
import buildOwner from 'container/tests/test-helpers/build-owner';
import run from 'ember-metal/run_loop';
import symbol from 'ember-metal/symbol';

export const TEST_OWNER = symbol('TEST_OWNER');
export const TEST_MAIN_COMPONENT = symbol('TEST_MAIN_COMPONENT');

function runAppend(view) {
  run(view, 'appendTo', '#qunit-fixture');
}

function runDestroy(destroyed) {
  if (destroyed) {
    run(destroyed, 'destroy');
  }
}

function moduleForApp(moduleName, options={}) {
  let setup = function() {
    this[TEST_OWNER] = buildOwner();
    this[TEST_OWNER].registerOptionsForType('component', { singleton: false });
    this[TEST_OWNER].registerOptionsForType('template', { instantiate: false });
    this[TEST_OWNER].register('component-lookup:main', ComponentLookup);

    this.getOwner = () => this[TEST_OWNER];
    this.register = register;
    this.render = render;
    this.rerender = rerender;
    this.$ = customSelector;

    if (typeof options.setup === 'function') {
      options.setup.apply(this, arguments);
    }
  };

  let teardown = function() {
    if (typeof options.teardown === 'function') {
      options.teardown.apply(this, arguments);
    }

    if (this[TEST_MAIN_COMPONENT]) {
      runDestroy(this[TEST_MAIN_COMPONENT]);
    }

    runDestroy(this[TEST_OWNER]);

    this[TEST_MAIN_COMPONENT] = this[TEST_OWNER] = null;
  };

  QUnit.module(moduleName, {
    setup,
    teardown
  });
}

function register(fullName, factory, options) {
  this.getOwner().register(fullName, factory, options);
  return factory;
}

function render(template, hash={}) {
  if (this[TEST_MAIN_COMPONENT]) {
    ok(false, 'you cannot render twice in the same test');
    return;
  }

  this[TEST_MAIN_COMPONENT] = Component.extend({
    template,
    [OWNER]: this.getOwner()
  }).create(hash);

  runAppend(this[TEST_MAIN_COMPONENT]);

  return this[TEST_MAIN_COMPONENT];
}

function rerender() {
  if (this[TEST_MAIN_COMPONENT]) {
    run(this[TEST_MAIN_COMPONENT], 'rerender');
  }
}

function customSelector() {
  return this[TEST_MAIN_COMPONENT].$(...arguments);
}

export {
  moduleForApp,
  runAppend,
  runDestroy
};
