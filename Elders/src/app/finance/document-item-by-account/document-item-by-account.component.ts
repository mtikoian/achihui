import { Component, ViewChild, OnInit, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatPaginator, MatSnackBar, MatTableDataSource } from '@angular/material';
import { Observable, forkJoin, merge, of as observableOf, BehaviorSubject, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { LogLevel, Account, DocumentItemWithBalance, OverviewScopeEnum, getOverviewScopeRange,
  TranType, UICommonLabelEnum, } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent, popupDialog, } from '../../message-dialog';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'hih-fin-docitem-by-acnt',
  templateUrl: './document-item-by-account.component.html',
  styleUrls: ['./document-item-by-account.component.scss'],
})
export class DocumentItemByAccountComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  private _seledAccount: number;
  private _seledScope: OverviewScopeEnum;

  displayedColumns: string[] = ['DocID', 'TranDate', 'TranType', 'TranAmount', 'Desp', 'Balance'];
  arTranTypes: TranType[] = [];
  dataSource: MatTableDataSource<DocumentItemWithBalance> = new MatTableDataSource<DocumentItemWithBalance>();
  isLoadingResults: boolean;
  resultsLength: number;
  public subjAccountID: BehaviorSubject<number> = new BehaviorSubject<number>(undefined);
  public subjScope: BehaviorSubject<OverviewScopeEnum> = new BehaviorSubject<OverviewScopeEnum>(undefined);

  @Input()
  get selectedScope(): OverviewScopeEnum {
    return this._seledScope;
  }
  set selectedScope(scpe: OverviewScopeEnum) {
    if (scpe !== this._seledScope && scpe) {
      this._seledScope = scpe;
      this.subjScope.next(this._seledScope);
    }
  }

  @Input()
  set selectedAccount(selacnt: number) {
    if (selacnt !== this._seledAccount && selacnt) {
      this._seledAccount = selacnt;

      this.subjAccountID.next(this._seledAccount);
    }
  }
  get selectedAccount(): number { return this._seledAccount; }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private _storageService: FinanceStorageService,
    private _uiStatusService: UIStatusService,
    private _dialog: MatDialog,
    ) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentItemByAccountComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentItemByAccountComponent ngOnInit...');
    }
    this._destroyed$ = new ReplaySubject(1);

    this._storageService.fetchAllTranTypes().pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      this.arTranTypes = x;
    }, (error: any) => {
      // Show a dialog for error details
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    });
  }

  /**
   * Set the paginator after the view init since this component will
   * be able to query its view for the initialized paginator.
   */
  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentItemByAccountComponent ngAfterViewInit...');
    }

    // this.dataSource.paginator = this.paginator;
    this.subjAccountID.pipe(takeUntil(this._destroyed$)).subscribe(() => this.paginator.pageIndex = 0);

    merge(this.subjAccountID, this.subjScope, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          if (this.subjAccountID.value === undefined) {
            return observableOf([]);
          }

          this.isLoadingResults = true;
          let { BeginDate: bgn,  EndDate: end }  = getOverviewScopeRange(this._seledScope);

          return this._storageService.getDocumentItemByAccount(this.subjAccountID.value, this.paginator.pageSize,
            this.paginator.pageIndex * this.paginator.pageSize, bgn, end);
        }),
        map((data: any) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.resultsLength = data.totalCount;
          return data.contentList;
        }),
        catchError((error: any) => {
          // Show a dialog for error details
          popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
            error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
          this.isLoadingResults = false;
          this.resultsLength = 0;
          return observableOf([]);
        }),
    ).subscribe((data: any) => this.dataSource.data = data);
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentItemByAccountComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
