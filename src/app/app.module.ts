import { ApplicationRef, NgModule, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule, Title } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { HttpModule, Http } from '@angular/http';
import { UIDependModule } from './uidepend.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { AuthService, AuthGuardService, UserDetailService, 
  FinCurrencyService, HomeChoseGuardService, FinanceStorageService, LearnStorageService,
  HomeDefDetailService, CanDeactivateGuardService } from './services';
import { AppRoutes } from './app.routes';
import { PageInitialComponent } from './page-initial';
import { PageHomeListComponent } from './page-home-list';
import { PageHomeDetailComponent } from './page-home-detail';
import { LearnObjectCategoryComponent } from './learn-object-category';
import { LearnObjectComponent } from './learn-object';
import { LearnHistoryComponent } from './learn-history';
import { FinanceAccountCategoryComponent } from './finance-account-category';
import { FinanceDocumentTypeComponent } from './finance-document-type';
import { FinanceTranTypeComponent } from './finance-tran-type';
import { FinanceAccountComponent } from './finance-account';
import { FinanceCurrencyComponent } from './finance-currency';
import { FinanceControlCenterComponent } from './finance-control-center';
import { FinanceOrderComponent } from './finance-order';
import { FinanceDocumentComponent } from './finance-document';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/locales/', '.json');
}

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    RouterModule.forRoot(AppRoutes),
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    HttpModule,
    UIDependModule,
  ],
  declarations: [
    AppComponent,
    PageInitialComponent,
    PageHomeListComponent,
    PageHomeDetailComponent,
    FinanceAccountCategoryComponent,
    FinanceDocumentTypeComponent,
    FinanceTranTypeComponent,
    FinanceAccountComponent,
    FinanceCurrencyComponent,
    LearnObjectCategoryComponent,
    LearnObjectComponent,
    LearnHistoryComponent,
    FinanceControlCenterComponent,
    FinanceOrderComponent,
    FinanceDocumentComponent,
  ],
  providers: [
    AuthService, 
    AuthGuardService,
    FinCurrencyService,
    UserDetailService,
    HomeChoseGuardService,
    HomeDefDetailService,
    CanDeactivateGuardService,
    FinanceStorageService,
    LearnStorageService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
