import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { UIAccountCtgyFilterExPipe, UIAccountStatusFilterPipe } from './pipes';

@NgModule({
  declarations: [
    UIAccountCtgyFilterExPipe,
    UIAccountStatusFilterPipe,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzBreadCrumbModule,
    NzPageHeaderModule,
    NzTableModule,
    NzDividerModule,
    NzStatisticModule,
    NzGridModule,
    NzCardModule,
    NzSpinModule,
    NzInputNumberModule,
    NzCalendarModule,
    NzTreeModule,
    NzSpinModule,
    NzCheckboxModule,
    NzTagModule,
    NzDescriptionsModule,
    NzTabsModule,
    NzButtonModule,
    NzDatePickerModule,
    NzSelectModule,
    NzDropDownModule,
    NzStepsModule,
    NzInputModule,
    NzAlertModule,
    NzResultModule,
    NzFormModule,
    NzLayoutModule,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    NzBreadCrumbModule,
    NzPageHeaderModule,
    NzTableModule,
    NzDividerModule,
    NzStatisticModule,
    NzGridModule,
    NzCardModule,
    NzSpinModule,
    NzInputNumberModule,
    NzCalendarModule,
    NzTreeModule,
    NzSpinModule,
    NzCheckboxModule,
    NzTagModule,
    NzDescriptionsModule,
    NzTabsModule,
    NzButtonModule,
    NzDatePickerModule,
    NzSelectModule,
    NzDropDownModule,
    NzStepsModule,
    NzInputModule,
    NzAlertModule,
    NzResultModule,
    NzFormModule,
    NzLayoutModule,

    UIAccountCtgyFilterExPipe,
    UIAccountStatusFilterPipe,
  ]
})
export class FinanceUIModule { }
