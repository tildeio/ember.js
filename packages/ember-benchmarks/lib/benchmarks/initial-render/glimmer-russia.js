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

    // Begin Russian Doll Effect
    const FooBar = Component.extend();
    const BizzBar = Component.extend();
    const BamBam = Component.extend();
    const RamRod = Component.extend();
    const FizzBar = Component.extend();

    this.registerComponent('foo-bar', { ComponentClass: FooBar, template: `
      {{bizz-bar day=@day}}
    `});

    this.registerComponent('bizz-bar', { ComponentClass: BizzBar, template: `
      {{bam-bam day=@day}}
    `});

    this.registerComponent('bam-bam', { ComponentClass: BamBam, template: `
      {{ram-rod day=@day}}
    `});

    this.registerComponent('ram-rod', { ComponentClass: RamRod, template: `
      {{fizz-bar day=@day}}
    `});

    this.registerComponent('fizz-bar', { ComponentClass: FizzBar, template: `
      {{uptime-day day=@day}}
    `});

    this.registerComponent('server-uptime', { ComponentClass: ServerUptime, template: `
      <h1>{{@name}}</h1>
      <h2>{{upDays}} Days Up</h2>
      <h2>Biggest Streak: {{streak}}</h2>
      <div class="days">
        {{#each @days key="number" as |day|}}
          {{foo-bar day=day}}
        {{/each}}
      </div>`
    });

    this.registerComponent('uptime-day', { ComponentClass: DayUptime, template: `
      <span class="uptime-day-status" style="background-color: {{color}}" />
      <span class="hover">{{@day.number}}: {{memo}}</span>
    `});

    this.registerTopLevelTemplate(`
      {{#each servers as |server|}}
        {{server-uptime name=server.name days=server.days}}
      {{/each}}
    `);
  },

  start() {
    let start = this.perf.now();
    this.render({ servers: servers() });
    let end = this.perf.now() - start;
    console.log(end);
  }
});