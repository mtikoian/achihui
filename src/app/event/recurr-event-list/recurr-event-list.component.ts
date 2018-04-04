import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LogLevel, GeneralEvent, RecurEvent } from '../../model';
import { EventStorageService, AuthService, HomeDefDetailService } from '../../services';
import { Observable } from 'rxjs/Observable';
import { merge } from 'rxjs/observable/merge';
import { of as observableOf } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators/catchError';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import { switchMap } from 'rxjs/operators/switchMap';

@Component({
  selector: 'hih-event-recurrevent-list',
  templateUrl: './recurr-event-list.component.html',
  styleUrls: ['./recurr-event-list.component.scss'],
})
export class RecurrEventListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'name', 'start', 'end', 'assignee'];
  dataSource: MatTableDataSource<RecurEvent>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults: boolean;

  constructor(public _homeDefService: HomeDefDetailService,
    private _authService: AuthService,
    private _storageService: EventStorageService,
    private _router: Router) {
    this.isLoadingResults = true;

    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter constructor of RecurrEventListComponent`);
    }

    this.dataSource = new MatTableDataSource([]);
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter ngOnInit of RecurrEventListComponent`);
    }
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Enter ngAfterViewInit of RecurrEventListComponent`);
    }

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this._homeDefService.curHomeMembers.subscribe((x) => {
      this.fetchRecurEvents();
    });
  }

  public onCreateRecurEvent(): void {
    this._router.navigate(['/event/recur/create']);
  }

  public onRefresh(): void {
    // Refresh the whole list
    this.fetchRecurEvents();
  }

  public onRecurEventRowSelect(row: GeneralEvent): void {
    this._router.navigate(['/event/recur/display/' + row.ID.toString()]);
  }

  public fetchRecurEvents(): void {
    this.paginator.page
      .pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this._storageService!.fetchAllRecurEvents(this.paginator.pageSize, this.paginator.pageIndex * this.paginator.pageSize );
      }),
      map((data: any) => {
        // Flip flag to show that loading has finished.
        this.isLoadingResults = false;

        let rslts: RecurEvent[] = [];
        if (data && data.contentList && data.contentList instanceof Array) {
          for (let ci of data.contentList) {
            let rst: RecurEvent = new RecurEvent();
            rst.onSetData(ci);

            rslts.push(rst);
          }
        }

        return rslts;
      }),
      catchError(() => {
        this.isLoadingResults = false;

        return observableOf([]);
      }),
      ).subscribe((data: any) => this.dataSource.data = data);
  }

  public onMarkAsDone(row: GeneralEvent): void {
    this._storageService.completeGeneralEvent(row).subscribe((x) => {
      // Jump to display mode
      this._router.navigate(['/event/recur/display/' + row.ID.toString()]);
    }, (error: any) => {
      // Show dialog?
    });
  }
}