import Ember from 'ember-metal/core';
import Component from 'ember-views/components/component';
import GlimmerComponent from 'ember-htmlbars/glimmer-component';
import run from 'ember-metal/run_loop';
import { A as emberA } from 'ember-runtime/system/native_array';
import compile from 'ember-template-compiler/system/compile';
import { RenderingTest, moduleFor } from 'ember-htmlbars/tests/utils/test-case';

moduleFor('component - invocation', class extends RenderingTest {
  ['@test non-block without properties']() {
    expect(1);

    this.registerComponent('non-block', {
      template: 'In layout'
    });

    this.render('{{non-block}}');

    equal(this.textValue(), 'In layout');
  }

  ['@test GlimmerComponent cannot be invoked with curly braces']() {
    this.registerComponent('non-block', {
      ComponentClass: GlimmerComponent.extend(),
      template: 'In layout'
    });

    expectAssertion(() => {
      this.render('{{non-block}}');
    }, /cannot invoke the 'non-block' component with curly braces/);
  }

  ['@test block without properties']() {
    expect(1);

    this.registerComponent('with-block', {
      template: 'In layout - {{yield}}'
    });

    this.render('{{#with-block}}In template{{/with-block}}');

    equal(this.textValue(), 'In layout - In template');
  }

  ['@test non-block with properties on attrs']() {
    expect(1);

    this.registerComponent('non-block', {
      template: 'In layout - someProp: {{attrs.someProp}}'
    });

    this.render('{{non-block someProp="something here"}}');

    equal(this.textValue(), 'In layout - someProp: something here');
  }

  ['@test non-block with properties on attrs and component class']() {
    this.registerComponent('non-block', {
      ComponentClass: Component.extend(),
      template: 'In layout - someProp: {{attrs.someProp}}'
    });

    this.render('{{non-block someProp="something here"}}');

    equal(this.textValue(), 'In layout - someProp: something here');
  }


  ['@test non-block with properties on overridden in init']() {
    this.registerComponent('non-block', {
      ComponentClass: Component.extend({
        someProp: null,

        init() {
          this._super(...arguments);
          this.someProp = 'value set in init';
        }
      }),

      template: 'In layout - someProp: {{someProp}}'
    });

    this.render('{{non-block someProp="something passed when invoked"}}');

    equal(this.textValue(), 'In layout - someProp: value set in init');
  }

  ['@test lookup of component takes priority over property']() {
    expect(1);

    this.registerComponent('some-component', {
      template: 'some-component'
    });

    this.render('{{some-prop}} {{some-component}}', {
      'some-component': 'not-some-component',
      'some-prop': 'some-prop'
    });

    equal(this.textValue(), 'some-prop some-component');
  }

  ['@test component without dash is not looked up']() {
    expect(1);

    this.registerComponent('somecomponent', {
      template: 'somecomponent'
    });

    this.render('{{somecomponent}}', {
      'somecomponent': 'notsomecomponent'
    });

    equal(this.textValue(), 'notsomecomponent');
  }

  ['@test rerendering component with attrs from parent']() {
    let willUpdate = 0;
    let didReceiveAttrs = 0;

    this.registerComponent('non-block', {
      ComponentClass: Component.extend({
        didReceiveAttrs() {
          didReceiveAttrs++;
        },

        willUpdate() {
          willUpdate++;
        }
      }),

      template: 'In layout - someProp: {{attrs.someProp}}'
    });

    this.render('{{non-block someProp=view.someProp}}', {
      someProp: 'wycats'
    });

    equal(didReceiveAttrs, 1, 'The didReceiveAttrs hook fired');

    equal(this.textValue(), 'In layout - someProp: wycats');

    run(() => {
      this.component.set('someProp', 'tomdale');
    });

    equal(this.textValue(), 'In layout - someProp: tomdale');
    equal(didReceiveAttrs, 2, 'The didReceiveAttrs hook fired again');
    equal(willUpdate, 1, 'The willUpdate hook fired once');

    run(() => {
      this.rerender();
    });

    equal(this.textValue(), 'In layout - someProp: tomdale');
    equal(didReceiveAttrs, 3, 'The didReceiveAttrs hook fired again');
    equal(willUpdate, 2, 'The willUpdate hook fired again');
  }

  ['@test [DEPRECATED] non-block with properties on self']() {
    // TODO: attrs
    // expectDeprecation("You accessed the `someProp` attribute directly. Please use `attrs.someProp` instead.");

    this.registerComponent('non-block', {
      template: 'In layout - someProp: {{someProp}}'
    });

    this.render('{{non-block someProp="something here"}}');

    equal(this.textValue(), 'In layout - someProp: something here');
  }

  ['@test block with properties on attrs']() {
    expect(1);

    this.registerComponent('with-block', {
      template: 'In layout - someProp: {{attrs.someProp}} - {{yield}}'
    });

    this.render('{{#with-block someProp="something here"}}In template{{/with-block}}');

    equal(this.textValue(), 'In layout - someProp: something here - In template');
  }

  ['@test [DEPRECATED] block with properties on self']() {
    // TODO: attrs
    // expectDeprecation("You accessed the `someProp` attribute directly. Please use `attrs.someProp` instead.");

    this.registerComponent('with-block', {
      template: 'In layout - someProp: {{someProp}} - {{yield}}'
    });

    this.render('{{#with-block someProp="something here"}}In template{{/with-block}}');

    equal(this.textValue(), 'In layout - someProp: something here - In template');
  }

  ['@test with ariaRole specified']() {
    expect(1);

    this.registerComponent('aria-test', {
      template: 'Here!'
    });

    this.render('{{aria-test id="aria-test" ariaRole="main"}}');

    equal(this.$('#aria-test').attr('role'), 'main', 'role attribute is applied');
  }

  ['@test `template` specified in a component is overridden by block']() {
    expect(1);

    this.registerComponent('with-block', {
      ComponentClass: Component.extend({
        layout: compile('{{yield}}'),
        template: compile('Oh, noes!')
      })
    });

    this.render('{{#with-block}}Whoop, whoop!{{/with-block}}');

    equal(this.textValue(), 'Whoop, whoop!', 'block provided always overrides template property');
  }

  ['@test hasBlock is true when block supplied']() {
    expect(1);

    this.registerComponent('with-block', {
      template: '{{#if hasBlock}}{{yield}}{{else}}No Block!{{/if}}'
    });

    this.render('{{#with-block}}In template{{/with-block}}');

    equal(this.textValue(), 'In template');
  }

  ['@test hasBlock is false when no block supplied']() {
    expect(1);

    this.registerComponent('with-block', {
      template: '{{#if hasBlock}}{{yield}}{{else}}No Block!{{/if}}'
    });

    this.render('{{with-block}}');

    equal(this.textValue(), 'No Block!');
  }

  ['@test hasBlock is false when no block supplied']() {
    expect(1);

    this.registerComponent('with-block', {
      template: '{{#if hasBlock}}{{yield}}{{else}}No Block!{{/if}}'
    });

    this.render('{{with-block}}');

    equal(this.textValue(), 'No Block!');
  }

  ['@test hasBlockParams is true when block param supplied']() {
    expect(1);

    this.registerComponent('with-block', {
      template: '{{#if hasBlockParams}}{{yield this}} - In Component{{else}}{{yield}} No Block!{{/if}}'
    });

    this.render('{{#with-block as |something|}}In template{{/with-block}}');

    equal(this.textValue(), 'In template - In Component');
  }

  ['@test hasBlockParams is false when no block param supplied']() {
    expect(1);

    this.registerComponent('with-block', {
      template: '{{#if hasBlockParams}}{{yield this}}{{else}}{{yield}} No Block Param!{{/if}}'
    });

    this.render('{{#with-block}}In block{{/with-block}}');

    equal(this.textValue(), 'In block No Block Param!');
  }

  ['@test static named positional parameters']() {
    let SampleComponent = Component.extend();
    SampleComponent.reopenClass({
      positionalParams: ['name', 'age']
    });

    this.registerComponent('sample-component', {
      ComponentClass: SampleComponent,
      template: '{{attrs.name}}{{attrs.age}}'
    });

    this.render('{{sample-component "Quint" 4}}');

    equal(this.textValue(), 'Quint4');
  }

  ['@test dynamic named positional parameters']() {
    let SampleComponent = Component.extend();
    SampleComponent.reopenClass({
      positionalParams: ['name', 'age']
    });

    this.registerComponent('sample-component', {
      ComponentClass: SampleComponent,
      template: '{{attrs.name}}{{attrs.age}}'
    });

    this.render('{{sample-component myName myAge}}', {
      myName: 'Quint',
      myAge: 4
    });

    equal(this.textValue(), 'Quint4');

    run(() => {
      this.component.set('myName', 'Edward');
      this.component.set('myAge', '5');
    });

    equal(this.textValue(), 'Edward5');
  }

  ['@test if a value is passed as a non-positional parameter, it takes precedence over the named one']() {
    let SampleComponent = Component.extend();
    SampleComponent.reopenClass({
      positionalParams: ['name']
    });

    this.registerComponent('sample-component', {
      ComponentClass: SampleComponent,
      template: '{{attrs.name}}'
    });

    expectAssertion(() => {
      this.render('{{sample-component notMyName name=myName}}', {
        myName: 'Quint',
        notMyName: 'Sergio'
      });
    }, `You cannot specify both a positional param (at position 0) and the hash argument \`name\`.`);
  }

  ['@test static arbitrary number of positional parameters']() {
    let SampleComponent = Component.extend();
    SampleComponent.reopenClass({
      positionalParams: 'names'
    });

    this.registerComponent('sample-component', {
      ComponentClass: SampleComponent,
      template: '{{#each attrs.names as |name|}}{{name}}{{/each}}'
    });

    this.render('{{sample-component "Foo" 4 "Bar" id="args-3"}}{{sample-component "Foo" 4 "Bar" 5 "Baz" id="args-5"}}{{component "sample-component" "Foo" 4 "Bar" 5 "Baz" id="helper"}}');

    equal(this.textValue('#args-3'), 'Foo4Bar');
    equal(this.textValue('#args-5'), 'Foo4Bar5Baz');
    equal(this.textValue('#helper'), 'Foo4Bar5Baz');
  }

  ['@test arbitrary positional parameter conflict with hash parameter is reported']() {
    let SampleComponent = Component.extend();
    SampleComponent.reopenClass({
      positionalParams: 'names'
    });

    this.registerComponent('sample-component', {
      ComponentClass: SampleComponent,
      template: '{{#each attrs.names as |name|}}{{name}}{{/each}}'
    });

    expectAssertion(() => {
      this.render('{{sample-component "Foo" 4 "Bar" names=numbers id="args-3"}}', {
        numbers: [1, 2, 3]
      });
    }, `You cannot specify positional parameters and the hash argument \`names\`.`);
  }

  ['@test can use hash parameter instead of arbitrary positional param [GH #12444]']() {
    let SampleComponent = Component.extend();
    SampleComponent.reopenClass({
      positionalParams: 'names'
    });

    this.registerComponent('sample-component', {
      ComponentClass: SampleComponent,
      template: '{{#each attrs.names as |name|}}{{name}}{{/each}}'
    });

    this.render('{{sample-component names=things id="args-3"}}', {
      things: ['Foo', 4, 'Bar']
    });

    equal(this.textValue('#args-3'), 'Foo4Bar');
  }

  ['@test can use hash parameter instead of positional param']() {
    let SampleComponent = Component.extend();
    SampleComponent.reopenClass({
      positionalParams: ['first', 'second']
    });

    this.registerComponent('sample-component', {
      ComponentClass: SampleComponent,
      template: '{{attrs.first}} - {{attrs.second}}'
    });

    this.render(`
      {{sample-component "one" "two" id="two-positional"}}
      {{sample-component "one" second="two" id="one-positional"}}
      {{sample-component first="one" second="two" id="no-positional"}}
      `, {
      things: ['Foo', 4, 'Bar']
    });

    equal(this.textValue('#two-positional'), 'one - two');
    equal(this.textValue('#one-positional'), 'one - two');
    equal(this.textValue('#no-positional'), 'one - two');
  }

  ['@test dynamic arbitrary number of positional parameters']() {
    let SampleComponent = Component.extend();
    SampleComponent.reopenClass({
      positionalParams: 'n'
    });
    this.registerComponent('sample-component', {
      ComponentClass: SampleComponent,
      template: '{{#each attrs.n as |name|}}{{name}}{{/each}}'
    });

    this.render('{{sample-component user1 user2 id="direct"}}{{component "sample-component" user1 user2 id="helper"}}', {
      user1: 'Foo',
      user2: 4
    });

    equal(this.textValue('#direct'), 'Foo4');
    equal(this.textValue('#helper'), 'Foo4');

    run(() => {
      this.component.set('user1', 'Bar');
      this.component.set('user2', '5');
    });

    equal(this.textValue('#direct'), 'Bar5');
    equal(this.textValue('#helper'), 'Bar5');

    run(() => {
      this.component.set('user2', '6');
    });

    equal(this.textValue('#direct'), 'Bar6');
    equal(this.textValue('#helper'), 'Bar6');
  }

  ['@test moduleName is available on _renderNode when a layout is present']() {
    expect(1);

    let layoutModuleName = 'my-app-name/templates/components/sample-component';
    let sampleComponentLayout = compile('Sample Component - {{yield}}', {
      moduleName: layoutModuleName
    });

    this.owner.register('template:components/sample-component', sampleComponentLayout);
    this.owner.register('component:sample-component', Component.extend({
      didInsertElement: function() {
        equal(this._renderNode.lastResult.template.meta.moduleName, layoutModuleName);
      }
    }));

    this.render('{{sample-component}}');
  }

  ['@test moduleName is available on _renderNode when no layout is present']() {
    expect(1);

    let templateModuleName = 'my-app-name/templates/application';
    this.registerComponent('sample-component', {
      ComponentClass: Component.extend({
        didInsertElement: function() {
          equal(this._renderNode.lastResult.template.meta.moduleName, templateModuleName);
        }
      })
    });

    this.render(compile('{{#sample-component}}Derp{{/sample-component}}', {
      moduleName: templateModuleName
    }));
  }

  ['@test {{component}} helper works with positional params']() {
    let SampleComponent = Component.extend();
    SampleComponent.reopenClass({
      positionalParams: ['name', 'age']
    });

    this.registerComponent('sample-component', {
      ComponentClass: SampleComponent,
      template: '{{attrs.name}}{{attrs.age}}'
    });

    this.render('{{component "sample-component" myName myAge}}', {
      myName: 'Quint',
      myAge: 4
    });

    equal(this.textValue(), 'Quint4');

    run(() => {
      this.component.set('myName', 'Edward');
      this.component.set('myAge', '5');
    });

    equal(this.textValue(), 'Edward5');
  }

  ['@test yield to inverse']() {
    this.registerComponent('my-if', {
      template: '{{#if predicate}}Yes:{{yield someValue}}{{else}}No:{{yield to="inverse"}}{{/if}}'
    });

    this.render('{{#my-if predicate=activated someValue=42 as |result|}}Hello{{result}}{{else}}Goodbye{{/my-if}}', {
      activated: true
    });

    equal(this.textValue(), 'Yes:Hello42');

    run(() => {
      this.component.set('activated', false);
    });

    equal(this.textValue(), 'No:Goodbye');
  }

  ['@test parameterized hasBlock inverse']() {
    this.registerComponent('check-inverse', {
      template: '{{#if (hasBlock "inverse")}}Yes{{else}}No{{/if}}'
    });

    this.render('{{#check-inverse id="expect-no"}}{{/check-inverse}}  {{#check-inverse id="expect-yes"}}{{else}}{{/check-inverse}}');

    equal(this.textValue('#expect-no'), 'No');
    equal(this.textValue('#expect-yes'), 'Yes');
  }

  ['@test parameterized hasBlock default']() {
    this.registerComponent('check-block', {
      template: '{{#if (hasBlock)}}Yes{{else}}No{{/if}}'
    });

    this.render('{{check-block id="expect-no"}}  {{#check-block id="expect-yes"}}{{/check-block}}');

    equal(this.textValue('#expect-no'), 'No');
    equal(this.textValue('#expect-yes'), 'Yes');
  }

  ['@test non-expression hasBlock ']() {
    this.registerComponent('check-block', {
      template: '{{#if hasBlock}}Yes{{else}}No{{/if}}'
    });

    this.render('{{check-block id="expect-no"}}  {{#check-block id="expect-yes"}}{{/check-block}}');

    equal(this.textValue('#expect-no'), 'No');
    equal(this.textValue('#expect-yes'), 'Yes');
  }

  ['@test parameterized hasBlockParams']() {
    this.registerComponent('check-params', {
      template: '{{#if (hasBlockParams)}}Yes{{else}}No{{/if}}'
    });

    this.render('{{#check-params id="expect-no"}}{{/check-params}}  {{#check-params id="expect-yes" as |foo|}}{{/check-params}}');

    equal(this.textValue('#expect-no'), 'No');
    equal(this.textValue('#expect-yes'), 'Yes');
  }

  ['@test non-expression hasBlockParams']() {
    this.registerComponent('check-params', {
      template: '{{#if hasBlockParams}}Yes{{else}}No{{/if}}'
    });

    this.render('{{#check-params id="expect-no"}}{{/check-params}}  {{#check-params id="expect-yes" as |foo|}}{{/check-params}}');

    equal(this.textValue('#expect-no'), 'No');
    equal(this.textValue('#expect-yes'), 'Yes');
  }

  ['@test components in template of a yielding component should have the proper parentView']() {
    let outer, innerTemplate, innerLayout;

    this.registerComponent('x-outer', {
      ComponentClass: Component.extend({
        init() {
          this._super(...arguments);
          outer = this;
        }
      }),
      template: '{{x-inner-in-layout}}{{yield}}'
    });

    this.registerComponent('x-inner-in-template', {
      ComponentClass: Component.extend({
        init() {
          this._super(...arguments);
          innerTemplate = this;
        }
      })
    });

    this.registerComponent('x-inner-in-layout', {
      ComponentClass: Component.extend({
        init() {
          this._super(...arguments);
          innerLayout = this;
        }
      })
    });

    this.render('{{#x-outer}}{{x-inner-in-template}}{{/x-outer}}');

    equal(innerTemplate.parentView, outer, 'receives the wrapping component as its parentView in template blocks');
    equal(innerLayout.parentView, outer, 'receives the wrapping component as its parentView in layout');
    equal(outer.parentView, this.component, 'x-outer receives the ambient scope as its parentView');
  }

  ['@test newly-added sub-components get correct parentView']() {
    let outer, inner;

    this.registerComponent('x-outer', {
      ComponentClass: Component.extend({
        init() {
          this._super(...arguments);
          outer = this;
        }
      })
    });

    this.registerComponent('x-inner', {
      ComponentClass: Component.extend({
        init() {
          this._super(...arguments);
          inner = this;
        }
      })
    });

    this.render('{{#x-outer}}{{#if view.showInner}}{{x-inner}}{{/if}}{{/x-outer}}', {
      showInner: false
    });

    run(() => { this.component.set('showInner', true); });

    equal(inner.parentView, outer, 'receives the wrapping component as its parentView in template blocks');
    equal(outer.parentView, this.component, 'x-outer receives the ambient scope as its parentView');
  }

  ['@test components should receive the viewRegistry from the parent view']() {
    let outer, innerTemplate, innerLayout;

    let viewRegistry = {};

    this.registerComponent('x-outer', {
      ComponentClass: Component.extend({
        init() {
          this._super(...arguments);
          outer = this;
        }
      }),
      template: '{{x-inner-in-layout}}{{yield}}'
    });

    this.registerComponent('x-inner-in-template', {
      ComponentClass: Component.extend({
        init() {
          this._super(...arguments);
          innerTemplate = this;
        }
      })
    });

    this.registerComponent('x-inner-in-layout', {
      ComponentClass: Component.extend({
        init() {
          this._super(...arguments);
          innerLayout = this;
        }
      })
    });

    this.render('{{#x-outer}}{{x-inner-in-template}}{{/x-outer}}', {
      _viewRegistry: viewRegistry
    });

    equal(innerTemplate._viewRegistry, viewRegistry);
    equal(innerLayout._viewRegistry, viewRegistry);
    equal(outer._viewRegistry, viewRegistry);
  }

  ['@test comopnent should rerender when a property is changed during children\'s rendering']() {
    expectDeprecation(/modified value twice in a single render/);

    let outer, middle;

    this.registerComponent('x-outer', {
      ComponentClass: Component.extend({
        value: 1,
        init() {
          this._super(...arguments);
          outer = this;
        }
      }),
      template: '{{#x-middle}}{{x-inner value=value}}{{/x-middle}}'
    });

    this.registerComponent('x-middle', {
      ComponentClass: Component.extend({
        value: null,
        init() {
          this._super(...arguments);
          middle = this;
        }
      }),
      template: '<div id="middle-value">{{value}}</div>{{yield}}'
    });

    this.registerComponent('x-inner', {
      ComponentClass: Component.extend({
        value: null,
        pushDataUp: Ember.observer('value', function() {
          middle.set('value', this.get('value'));
        })
      }),
      template: '<div id="inner-value">{{value}}</div>'
    });


    this.render('{{x-outer}}');

    equal(this.textValue('#inner-value'), '1', 'initial render of inner');
    equal(this.textValue('#middle-value'), '', 'initial render of middle (observers do not run during init)');

    run(() => outer.set('value', 2));

    equal(this.textValue('#inner-value'), '2', 'second render of inner');
    equal(this.textValue('#middle-value'), '2', 'second render of middle');

    run(() => outer.set('value', 3));

    equal(this.textValue('#inner-value'), '3', 'third render of inner');
    equal(this.textValue('#middle-value'), '3', 'third render of middle');
  }

  ['@test non-block with each rendering child components']() {
    expect(2);

    this.registerComponent('non-block', {
      template: 'In layout. {{#each attrs.items as |item|}}[{{child-non-block item=item}}]{{/each}}'
    });
    this.registerComponent('child-non-block', {
      template: 'Child: {{attrs.item}}.'
    });

    let items = emberA(['Tom', 'Dick', 'Harry']);

    this.render('{{non-block items=view.items}}', {
      items: items
    });

    equal(this.textValue(), 'In layout. [Child: Tom.][Child: Dick.][Child: Harry.]');

    run(() => {
      items.pushObject('James');
    });

    equal(this.textValue(), 'In layout. [Child: Tom.][Child: Dick.][Child: Harry.][Child: James.]');
  }

  ['@test specifying classNames results in correct class'](assert) {
    expect(3);

    let clickyThing;
    this.registerComponent('some-clicky-thing', {
      ComponentClass: Component.extend({
        tagName: 'button',
        classNames: ['foo', 'bar'],
        init() {
          this._super(...arguments);
          clickyThing = this;
        }
      })
    });

    this.render('{{#some-clicky-thing classNames="baz"}}Click Me{{/some-clicky-thing}}');

    let button = this.$('button');
    assert.ok(button.is('.foo.bar.baz.ember-view'), 'the element has the correct classes: ' + button.attr('class'));

    let expectedClassNames = ['ember-view', 'foo', 'bar', 'baz'];
    assert.deepEqual(clickyThing.get('classNames'),  expectedClassNames, 'classNames are properly combined');

    let buttonClassNames = button.attr('class');
    assert.deepEqual(buttonClassNames.split(' '), expectedClassNames, 'all classes are set 1:1 in DOM');
  }

  ['@test specifying custom concatenatedProperties avoids clobbering'](assert) {
    expect(1);

    let clickyThing;
    this.registerComponent('some-clicky-thing', {
      ComponentClass: Component.extend({
        concatenatedProperties: ['blahzz'],
        blahzz: ['blark', 'pory'],
        init() {
          this._super(...arguments);
          clickyThing = this;
        }
      })
    });

    this.render('{{#some-clicky-thing blahzz="baz"}}Click Me{{/some-clicky-thing}}');

    assert.deepEqual(clickyThing.get('blahzz'),  ['blark', 'pory', 'baz'], 'property is properly combined');
  }

});

