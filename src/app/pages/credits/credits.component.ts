import { Component } from '@angular/core';

@Component({
  selector: 'hih-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.less']
})
export class CreditsComponent {

  creditApp: any[] = [
    {
      name: 'Angular 8+',
      url: 'https://angular.io',
      desp: 'One framework. Mobile & desktop. Angular is a development platform for building mobile and desktop web applications using TypeScript/JavaScript and other languages.'
    }, {
      name: 'TypeScript 3+',
      url: 'http://www.typescriptlang.org/',
      desp: 'JavaScript that scales. TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. Any browser. Any host. Any OS. Open source.',
    }, {
      name: 'Ant Design',
      url: 'https://ng.ant.design',
      desp: 'Ant Design, a design language for background applications, is refined by Ant UED Team',
    }, {
      name: 'ECharts',
      url: 'http://echarts.baidu.com/',
      desp: 'A powerful, interactive charting and visualization library for browser.'
    }, {
      name: 'fullcalendar',
      url: 'https://fullcalendar.io/',
      desp: 'the most popular full-sized JavaScript Calendar',
    }, {
      name: 'Moment.js',
      url: 'https://momentjs.com/',
      desp: 'Parse, validate, manipulate, and display dates and times in JavaScript',
    }, {
      name: '.NET Core 3.1+',
      url: 'https://dot.net',
      desp: 'Free. Cross-platform. Open source. A developer platform for building all your apps.',
    },
  ];

  constructor() { }
}
