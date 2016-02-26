// import SharedBench from './shared-bench';
import Component from 'ember-views/components/component';
import { servers } from '../../utils/get-data';
import computed from 'ember-metal/computed';
import Benchmark from '../../utils/benchmarks';

export default Benchmark.create('@ember-glimmer initial render', {
  setup() {
    const ServerUptime = Component.extend({
      tagName: 'server-uptime',

      upDays: computed('attrs.days', function() {
        return this.attrs.days.reduce((upDays, day) => {
          return upDays += (day.up ? 1 : 0);
        }, 0);
      }),

      streak: computed('attrs.days', function() {
        let [max] = this.attrs.days.reduce(([max, streak], day) => {
          if (day.up && streak + 1 > max) {
            return [streak + 1, streak + 1];
          } else if (day.up) {
            return [max, streak + 1];
          } else {
            return [max, 0];
          }
        }, [0, 0]);

        return max;
      })
    });

    const DayUptime = Component.extend({
      tagName: 'uptime-day',
      color: computed('attrs.day.up', function() {
        return this.attrs.day.up ? '#8cc665' : '#ccc';
      }),

      memo: computed('attrs.day.up', function() {
        return this.attrs.day.up ? 'Servers operational!' : 'Red alert!';
      })
    });

    this.registerComponent('server-uptime', { ComponentClass: ServerUptime, template: `
      <h1>{{@name}}</h1>
      <h2>{{upDays}} Days Up</h2>
      <h2>Biggest Streak: {{streak}}</h2>
      <div class="days">
        {{#each @days key="number" as |day|}}
          {{uptime-day day=day}}
        {{/each}}
      </div>`
    });

    this.registerComponent('uptime-day', { ComponentClass: DayUptime, template: `
      {{#if item.hidden}}
        {{feed-hidden-update item=item}}
      {{/if}}

      {{#if attrs.isDetailView}}
        <section>
          {{}}
        </section>
      {{/if}}
    `});

    this.registerComponent('feed-list', { ComponentClass: FeedList, template: `
      {{#each this.attrs.updates as |page|}}
        {{#each page as |item|}}
          {{feed-generic-update model=item}}
        {{/each}}
      {{/each}}
    `})

    this.registerTopLevelTemplate(`
      {{feed-list updates=updates}}
    `);
  },

  start() {
    let start = this.perf.now();
    this.render({ servers: servers() });
    let end = this.perf.now() - start;
    console.log(end);
  }
});