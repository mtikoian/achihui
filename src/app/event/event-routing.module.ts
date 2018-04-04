import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventComponent } from './event.component';
import { CategoryComponent } from './category';
import { CategoryListComponent } from './category-list';
import { EventListComponent } from './event-list';
import { EventDetailComponent } from './event-detail';
import { GeneralEventComponent } from './general-event';
import { RecurrEventComponent } from './recurr-event';
import { RecurrEventListComponent } from './recurr-event-list';
import { RecurrEventDetailComponent } from './recurr-event-detail';
import { HabitListComponent } from './habit-list';
import { HabitDetailComponent } from './habit-detail';
import { HabitComponent } from './habit';

const routes: Routes = [
  {
    path: '',
    component: EventComponent,
    children: [
      {
        path: 'general',
        component: GeneralEventComponent,
        children: [
          {
            path: '',
            component: EventListComponent,
          },
          {
            path: 'create',
            component: EventDetailComponent,
          },
          {
            path: 'display/:id',
            component: EventDetailComponent,
          },
          {
            path: 'edit/:id',
            component: EventDetailComponent,
          },
        ],
      },
      {
        path: 'category',
        component: CategoryComponent,
        children: [
          {
            path: '',
            component: CategoryListComponent,
          },
        ],
      },
      {
        path: 'habit',
        component: HabitComponent,
        children: [
          {
            path: '',
            component: HabitListComponent,
          },
          {
            path: 'create',
            component: HabitDetailComponent,
          },
          {
            path: 'display/:id',
            component: HabitDetailComponent,
          },
          {
            path: 'edit/:id',
            component: HabitDetailComponent,
          },
        ],
      },
      {
        path: 'recur',
        component: RecurrEventComponent,
        children: [
          {
            path: '',
            component: RecurrEventListComponent,
          },
          {
            path: 'create',
            component: RecurrEventDetailComponent,
          },
          {
            path: 'display/:id',
            component: RecurrEventDetailComponent,
          },
          {
            path: 'edit/:id',
            component: RecurrEventDetailComponent,
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventRoutingModule { }