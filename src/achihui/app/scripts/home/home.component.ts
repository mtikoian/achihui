import { Component, OnInit, OnDestroy }        from '@angular/core';
import { DebugLogging } from '../app.setting';

@Component({
    selector: 'hih-app-home',
    template: `<div class="container"><router-outlet></router-outlet></div>`
})

export class HomeComponent implements OnInit, OnDestroy {
    constructor() {
        if (DebugLogging) {
            console.log("Entering constructor of HomeComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of HomeComponent");
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of HomeComponent");
        }
    }
}
