import Component from 'ember-views/components/component';
import { servers } from '../../utils/get-data';
import computed from 'ember-metal/computed';

export default {
  setup() {
    const ServerUptime = Component.extend({
      tagName: 'server-uptime',

      upDays: computed('attrs.days', function() {
        return this.attrs.days.value.reduce((upDays, day) => {
          return upDays += (day.up ? 1 : 0);
        }, 0);
      }),

      streak: computed('attrs.days', function() {
        let [max] = this.attrs.days.value.reduce(([max, streak], day) => {
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
      color: computed('attrs.day.value.up', function() {
        return this.attrs.day.value.up ? '#8cc665' : '#ccc';
      }),

      memo: computed('attrs.day.value.up', function() {
        return this.attrs.day.value.up ? 'Servers operational!' : 'Red alert!';
      })
    });

    this.registerComponent('server-uptime', { ComponentClass: ServerUptime, template: `
      <h1>{{attrs.name}}</h1>
      <h2>{{upDays}} Days Up</h2>
      <h2>Biggest Streak: {{streak}}</h2>
      <div class="days">
        {{#each attrs.days key="number" as |day|}}
          {{uptime-day day=day}}
        {{/each}}
      </div>`
    });

    this.registerComponent('uptime-day', { ComponentClass: DayUptime, template: `
      <span class="uptime-day-status" style="background-color: {{color}}" />
      <span class="hover">{{attrs.day.number}}: {{memo}}</span>
    `});

    this.registerTopLevelTemplate(`
      {{#each servers as |server|}}
        {{server-uptime name=server.name days=server.days}}
      {{/each}}
    `);
  },

  start() {
    this.perf.mark('Render start');
    this.render({ servers: servers() });
    this.perf.mark('Render done');
  }
};