import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { AccountRoutingModule } from './account-routing.module';
import { AccountComponent } from './account.component';
import { AccountListComponent } from './account-list';
import { AccountDetailComponent } from './account-detail';
import { AccountHierarchyComponent } from './account-hierarchy';

@NgModule({
  declarations: [
    AccountComponent,
    AccountListComponent,
    AccountHierarchyComponent,
    AccountDetailComponent,
  ],
  imports: [
    CommonModule,
    NzBreadCrumbModule,
    NzPageHeaderModule,
    NzTableModule,
    NzDividerModule,
    NzTreeModule,
    NzSpinModule,
    NzTagModule,
    NzDescriptionsModule,
    NzTabsModule,
    AccountRoutingModule,
  ]
})
export class AccountModule { }
