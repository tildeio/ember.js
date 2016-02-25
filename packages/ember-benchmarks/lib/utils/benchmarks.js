import buildOwner from './build-owner';
import { OWNER } from 'container/owner';
import Component from 'ember-views/components/component';
import { default as GlimmerHelper, glimmerHelper } from 'ember-glimmer/helper';
import { DOMHelper as GlimmerDOMHelper } from 'glimmer-runtime';
import { Renderer as GlimmerRenderer } from 'ember-glimmer/ember-metal-views';
import { default as compileGlimmer } from 'ember-glimmer/ember-template-compiler/system/compile';
import { Environment as GlimmerEnv } from 'ember-glimmer'

import { default as Helper, helper } from 'ember-htmlbars/helper';
import { default as DOMHelper } from 'ember-htmlbars/system/dom-helper';
import { Renderer } from 'ember-metal-views';
import { default as compile } from 'ember-template-compiler/system/compile';

import ComponentLookup from 'ember-views/component_lookup';
import run from 'ember-metal/run_loop';

function runAppend(view) {
  run(view, 'appendTo', '#bench-harness');
}

function runDestroy(destroyed) {
  if (destroyed) {
    run(destroyed, 'destroy');
  }
}

class Environment {}

class AbstractBenchmark {
  constructor() {
    let owner = this.owner = buildOwner();
    this.env = null;
    this.element = document.getElementById('bench-harness');
    this.renderer = null;
    this.component = null;
    this.snapshot = null;
    this.perf = performance;
    owner.register('component-lookup:main', ComponentLookup);
    owner.registerOptionsForType('component', { singleton: false });
    owner.registerOptionsForType('helper', { instantiate: false });
  }

  get context() {
    return this.component;
  }

  registerComponent(name, { ComponentClass = null, template = null }) {
    let { owner } = this;

    if (ComponentClass) {
      owner.register(`component:${name}`, ComponentClass);
    }
  }

  render(context = {}) {
    let { renderer, owner } = this;
    let attrs = Object.assign({}, context, {
      tagName: '',
      [OWNER]: owner,
      renderer,
      template: owner.lookup('template:-top-level')
    });

    this.component = Component.create(attrs);

    runAppend(this.component);
  }

  tearDown() {
    if (this.component) {
      runDestroy(this.component);
      runDestroy(this.owner);
    }
  }

  setup() {}

  start() {}
}

class GlimmerBenchmark extends AbstractBenchmark {
  constructor() {
    super();
    let owner = this.owner;
    let dom = new GlimmerDOMHelper(document);
    let env = this.env = new GlimmerEnv({ owner: this.owner, dom });
    this.renderer = new GlimmerRenderer(dom, { destinedForDOM: true, env });
    owner.register('component-lookup:main', ComponentLookup);
    owner.register('service:-glimmer-env', this.env, { instantiate: false });
    owner.inject('template', 'env', 'service:-glimmer-env');
  }

  registerTopLevelTemplate(templateStr) {
    this.owner.register('template:-top-level', compileGlimmer(templateStr));
  }

  registerComponent(name, { ComponentClass = null, template = null }) {
    super.registerComponent(...arguments);
    if (typeof template === 'string') {
      this.owner.register(`template:components/${name}`, compileGlimmer(template, { env: this.env }));
    }
  }
}

class HTMLBarsBenchmark extends AbstractBenchmark {
  constructor() {
    super();
    let dom = new DOMHelper(document);
    let env = this.env = new Environment({ owner: this.owner, dom });
    this.renderer = new Renderer(dom, { destinedForDOM: true, env });
    this.owner.registerOptionsForType('template', { instantiate: false });
  }

  registerTopLevelTemplate(templateStr) {
    this.owner.register('template:-top-level', compile(templateStr));
  }

  registerComponent(name, { ComponentClass = null, template = null }) {
    super.registerComponent(...arguments);
    if (typeof template === 'string') {
      this.owner.register(`template:components/${name}`, compile(template, { env: this.env }));
    }
  }
}

const decorateClass = (Klass, mixins) => {
  mixins.forEach(mixin => {
    Object.assign(Klass.prototype, mixin);
  });
};

class BenchmarkFactory {
  static create(name, ...mixins) {
    let bench;
    let atI = name.indexOf('@');
    let space = name.indexOf(' ');
    let type = name.slice(atI + 1, space);

    switch (type) {
      case 'ember-glimmer':
        decorateClass(GlimmerBenchmark, mixins);
        bench = new GlimmerBenchmark();
        break;
      case 'ember-htmlbars':
        decorateClass(HTMLBarsBenchmark, mixins);
        bench = new HTMLBarsBenchmark();
        break;
      default:
        throw new Error('Please pass a benchmark type.');
    }

    bench.setup();
    return bench;
  }
}

export default BenchmarkFactory;