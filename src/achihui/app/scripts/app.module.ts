﻿import { NgModule }                 from '@angular/core';
import { BrowserModule }            from '@angular/platform-browser';
import { FormsModule }              from '@angular/forms';
import { HttpModule, Http }         from '@angular/http';
import { AppComponent }             from './app.component';
import { routing, appRoutingProviders
} from './app.routing';
import { MegaMenuModule }           from 'primeng/primeng';
import { LearnModule }              from './learn/learn.module';
import { EventModule }              from './event/event.module';
import { FinanceModule }            from './finance/finance.module';

import { CreditsComponent }         from './about/credits.component';
import { AboutComponent }           from './about/about.component';
import { ForbiddenComponent }       from './forbidden/forbidden.component';
import { UnauthorizedComponent }    from './unauthorized/unauthorized.component';

import { DialogService }            from './services/dialog.service';
import { BufferService }            from './services/buffer.service';
import { AuthService }              from './services/auth.service';
import { UtilService }              from './services/util.service';
import { UserService }              from './services/user.service';
import { HomeComponent }            from './home/home.component';
import { LanguageComponent }        from './home/language.component';
import { ModuleComponent }          from './home/module.component';
import { UserDetailComponent }      from './home/user.detail.component';
import { UserHistoryComponent }     from './home/user.history.component';
import { UIRefModule }              from './uiref.module';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        routing,
        UIRefModule,
        MegaMenuModule,

        EventModule,
        LearnModule,
        FinanceModule
    ],
    declarations: [

        AppComponent,
        CreditsComponent,
        AboutComponent,
        HomeComponent,
        LanguageComponent,
        ModuleComponent,
        UserDetailComponent,
        UserHistoryComponent,
        ForbiddenComponent,
        UnauthorizedComponent
    ],
    providers: [
        appRoutingProviders,
        DialogService,
        AuthService,
        BufferService,
        UtilService,
        UserService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
