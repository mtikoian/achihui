import { Routes }                   from '@angular/router';
import { HomeComponent }            from './home.component';
import { LanguageComponent }        from './language.component';
import { HomeDefaultComponent }     from './home.default.component';
import { ModuleComponent }          from './module.component';
import { UserDetailComponent }      from './user.detail.component';
import { UserHistoryComponent }     from './user.history.component';

export const homeRoutes: Routes = [
    {
        path: 'home',
        component: HomeComponent,
        children: [
            { path: '', redirectTo: 'default', pathMatch: 'full' },
            {
                path: 'default',
                component: HomeDefaultComponent,
            },
            {
                path: 'language',
                component: LanguageComponent
            },
            {
                path: 'module',
                component: ModuleComponent
            },
            {
                path: 'userdetail',
                component: UserDetailComponent 
            },
            { path: 'userhist', component: UserHistoryComponent },
            //{
            //    path: 'contact',
            //    component: 
            //}
        ]
    },
    //{ path: 'language', component: LanguageComponent },
    //{ path: 'module', component: ModuleComponent },
    //{ path: 'userdetail', component: UserDetailComponent },
    //{ path: 'userhist', component: UserHistoryComponent },
];

