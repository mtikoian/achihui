﻿import { Routes, RouterModule }         from '@angular/router';
import { FinanceComponent }             from './finance.component';
import { FinanceSettingComponent }      from './finance.setting.component';
import { FinanceCurrencyComponent }     from './finance.currency.component';
import { FinanceDocTypeComponent }      from './finance.doctype.component';
import { FinanceAccountCategoryComponent } from './finance.acntctgy.component';
import { FinanceTranTypeListComponent } from './finance.trantype.list.component';
import { FinanceTranTypeDetailComponent } from './finance.trantype.detail.component';

export const financeRoutes: Routes = [
    {
        path: 'finance',
        component: FinanceComponent,
        children: [
            {
                path: 'setting',
                component: FinanceSettingComponent
            },
            {
                path: 'currency',
                component: FinanceCurrencyComponent
            },
            {
                path: 'doctype',
                component: FinanceDocTypeComponent
            },
            {
                path: 'accountctgy',
                component: FinanceAccountCategoryComponent
            },
            {
                path: 'trantypelist',
                component: FinanceTranTypeListComponent
            },
            {
                path: 'trantype/:id',
                component: FinanceTranTypeDetailComponent
            },
            //{
            //    path: 'detail/:id',
            //    component: AlbumDetailComponent,
            //    //canDeactivate: [CanDeactivateGuard],
            //    //resolve: {
            //    //    album: AlbumDetailResolve
            //    //}
            //},
            //{
            //    path: 'orgphoto/:id',
            //    component: AlbumOrgPhotoComponent,
            //},
            //{
            //    path: '',
            //    component: AlbumListComponent
            //},
        ]
    }
];

export const financeProviders = [
    //AuthGuard,
    //AuthService
];

export const financeRouting = RouterModule.forChild(financeRoutes);
