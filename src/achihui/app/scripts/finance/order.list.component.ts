﻿import {
    Component, OnInit, OnDestroy, NgZone
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import '../rxjs-operators';
import { DebugLogging }         from '../app.setting';
import * as HIHFinance          from '../model/finance';
import { FinanceService }       from '../services/finance.service';
import { DialogService }        from '../services/dialog.service';
import { AuthService }          from '../services/auth.service';

@Component({
    selector: 'hih-fin-order-list',
    templateUrl: 'app/views/finance/order.list.html'
})
export class OrderListComponent implements OnInit, OnDestroy {
    public finOrder: Array<HIHFinance.Order>;
    private subOrder: Subscription;

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        public dialogService: DialogService,
        private financeService: FinanceService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of OrderListComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of OrderListComponent");
        }

        if (!this.subOrder) {
            this.subOrder = this.financeService.order$.subscribe(data => this.getOrderList(data),
                error => this.handleError(error));

            this.financeService.loadOrders();
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of OrderListComponent");
        }

        if (this.subOrder) {
            this.subOrder.unsubscribe();
            this.subOrder = null;
        }
    }

    getOrderList(data: Array<HIHFinance.Order>) {
        if (DebugLogging) {
            console.log("Entering getOrderList of OrderListComponent");
        }

        this.zone.run(() => {
            this.finOrder = data;
        });
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of OrderListComponent");
        }
        console.log(error);

        if (error.status === 401) {
            this.dialogService.confirm("Unauthorized! It most likely you input an WRONG access code!");
        }
    }
}