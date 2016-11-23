import {
    Component, OnInit, OnDestroy, NgZone
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import '../rxjs-operators';
import { DebugLogging }     from '../app.setting';
import * as HIHEvent        from '../model/event';
import * as HIHUtil         from '../model/util';
import { EventService }     from '../services/event.service';
import { DialogService }    from '../services/dialog.service';
import { AuthService }      from '../services/auth.service';

@Component({
    selector: 'hih-event-item-list',
    templateUrl: 'app/views/event/event.list.html'
})
export class EventListComponent implements OnInit, OnDestroy {
    public evtItems: Array<HIHEvent.EventItem> = [];
    private objUtil: HIHUtil.UIPagination = null;

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        private dialogService: DialogService,
        private eventService: EventService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of Event.EventListComponent");
        }

        this.objUtil = new HIHUtil.UIPagination(3, 5);
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of Event.EventListComponent");
        }

        this.onPageClick(1);
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of Event.EventListComponent");
        }
    }

    onPagePreviousClick() {
        if (DebugLogging) {
            console.log("Entering onPagePreviousClick of Event.EventListComponent");
        }

        if (this.objUtil.currentPage > 1) {
            this.onPageClick(this.objUtil.currentPage - 1);
        }
    }

    onPageNextClick() {
        if (DebugLogging) {
            console.log("Entering onPageNextClick of Event.EventListComponent");
        }

        this.onPageClick(this.objUtil.currentPage + 1);
    }

    onPageClick(pageIdx: number) {
        if (DebugLogging) {
            console.log("Entering onPageClick of Event.EventListComponent");
        }

        if (this.objUtil.currentPage != pageIdx) {
            this.objUtil.currentPage = pageIdx;

            let paraString = this.objUtil.nextAPIString;
            this.eventService.loadEvents(paraString).subscribe(data => {
                if (DebugLogging) {
                    console.log("Event loaded successfully of Event.EventListComponent");
                }

                this.objUtil.totalCount = data.totalCount;
                this.zone.run(() => {

                    this.evtItems = [];
                    if (data && data.contentList && data.contentList instanceof Array) {
                        for (let cl of data.contentList) {
                            let ei = new HIHEvent.EventItem();
                            ei.onSetData(cl);
                            this.evtItems.push(ei);
                        }
                    }
                });
            }, error => {
                if (DebugLogging) {
                    console.log("Error occurred during event loading of Event.EventListComponent");
                    console.log(error);
                }
            }, () => {
                if (DebugLogging) {
                    console.log("Events loaded completed of Event.EventListComponent");
                }
            });
        }
    }

    newItem() {
        // Navigate to the create page
        this.router.navigate(['/event/create']);
    }

    editItem(row) {
        this.router.navigate(['/event/change', +row.Id]);
    }

    displayItem(row) {
        this.router.navigate(['/event/display', +row.Id]);
    }
}
