import { Component, OnInit, OnDestroy } from '@angular/core';
import { DebugLogging } from '../app.setting';

@Component({
    selector: 'hih-app-home-default',
    templateUrl: 'app/views/home/home.html'
})

export class HomeDefaultComponent implements OnInit, OnDestroy {
    constructor() {
        if (DebugLogging) {
            console.log("Entering constructor of HomeDefaultComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of HomeDefaultComponent");
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of HomeDefaultComponent");
        }
    }
}
