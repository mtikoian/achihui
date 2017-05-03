import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@angular/material';
import { CovalentCoreModule } from '@covalent/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { UIRefModule } from '../uiref.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';

import { FinanceComponent } from './finance.component';
import { SettingComponent } from './setting/setting.component';
import { CurrencyComponent } from './currency/currency.component';
import { ListComponent as CurrencyListComponent } from './currency/list/list.component';
import { DetailComponent as CurrencyDetailComponent } from './currency/detail/detail.component';
import { ControlCenterComponent } from './controlcenter/controlcenter.component';
import { ListComponent as ControlCenterListComponent } from './controlcenter/list/list.component';
import { DetailComponent as ControlCenterDetailComponent } from './controlcenter/detail/detail.component';
import { OrderComponent } from './order/order.component';
import { ListComponent as OrderListComponent } from './order/list/list.component';
import { DetailComponent as OrderDetailComponent } from './order/detail/detail.component';
import { AccountCategoryComponent } from './accountcategory/accountcategory.component';
import { ListComponent as AccountCategoryListComponent } from './accountcategory/list/list.component';
import { DetailComponent as AccountCategoryDetailComponent } from './accountcategory/detail/detail.component';
import { AccountComponent } from './account/account.component';
import { ListComponent as AccountListComponent } from './account/list/list.component';
import { DetailComponent as AccountDetailComponent } from './account/detail/detail.component';
import { DocumentComponent } from './document/document.component';
import { ListComponent as DocumentListComponent } from './document/list/list.component';
import { DetailComponent as DocumentDetailComponent } from './document/detail/detail.component';
import { TransferdocComponent as DocumentTransferDetailComponent } from './document/transferdoc/transferdoc.component';
import { AdvpaydocComponent as DocumentAdvpaydocDetailComponent } from './document/advpaydoc/advpaydoc.component';
import { DocumentTypeComponent } from './documenttype/documenttype.component';
import { ListComponent as DocumentTypeListComponent } from './documenttype/list/list.component';
import { DetailComponent as DocumentTypeDetailComponent } from './documenttype/detail/detail.component';
import { FinanceRoutingModule } from './finance-routing.module';
import { TransactionTypeComponent } from './transactiontype/transactiontype.component';
import { ListComponent as TransactionTypeListComponent } from './transactiontype/list/list.component';
import { DetailComponent as TransactionTypeDetailComponent } from './transactiontype/detail/detail.component';
import { ReportComponent } from './report/report.component';
import { BalanceSheetComponent as ReportBalanceSheetComponent } from './report/balancesheet/balancesheet.component';
import { ControlCenterComponent as ReportControlCenterComponent } from './report/controlcenter/controlcenter.component';
import { OrderComponent as ReportOrderComponent } from './report/order/order.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { AccountlistComponent as TransactionsAccountlistComponent } from './transactions/accountlist/accountlist.component';
import { AccounthierarchyComponent as TransactionsAccounthierarchyComponent } from './transactions/accounthierarchy/accounthierarchy.component';
import { ControlcenterlistComponent as TransactionsControlcenterlistComponent } from './transactions/controlcenterlist/controlcenterlist.component';
import { ControlcenterhierarchyComponent as TransactionsControlcenterhierarchyComponent } from './transactions/controlcenterhierarchy/controlcenterhierarchy.component';
import { OrderlistComponent as TransactionsOrderlistComponent } from './transactions/orderlist/orderlist.component';
import { OverviewComponent } from './overview/overview.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    CovalentCoreModule.forRoot(),
    NgxChartsModule,
    UIRefModule,
    TranslateModule,
    FinanceRoutingModule
  ],
  declarations: [
    FinanceComponent,
    OverviewComponent, 
    SettingComponent,

    CurrencyComponent,
    CurrencyListComponent,
    CurrencyDetailComponent,

    AccountCategoryComponent,
    AccountCategoryListComponent,
    AccountCategoryDetailComponent,

    AccountComponent, 
    AccountListComponent, 
    AccountDetailComponent, 

    DocumentTypeComponent, 
    DocumentTypeListComponent, 
    DocumentTypeDetailComponent, 

    DocumentComponent,
    DocumentListComponent, 
    DocumentDetailComponent, 
    DocumentTransferDetailComponent,
    DocumentAdvpaydocDetailComponent,
    
    ControlCenterComponent,     
    ControlCenterListComponent, 
    ControlCenterDetailComponent, 
    
    OrderComponent,
    OrderListComponent, 
    OrderDetailComponent, 
    
    TransactionTypeComponent, 
    TransactionTypeListComponent, 
    TransactionTypeDetailComponent, 
    
    ReportComponent, 
    ReportBalanceSheetComponent, 
    ReportControlCenterComponent, 
    ReportOrderComponent, 
    
    TransactionsComponent, 
    TransactionsAccountlistComponent, 
    TransactionsAccounthierarchyComponent, 
    TransactionsControlcenterlistComponent, 
    TransactionsControlcenterhierarchyComponent, 
    TransactionsOrderlistComponent 
  ]
})
export class FinanceModule { }
