import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, TranType, TranTypeLevelEnum, UIDisplayStringUtil } from '../../model';
import { FinanceStorageService, UIStatusService } from '../../services';

// !!! Second option !!!
// /**
//  * Data access object for Tran. Type List
//  */
// export class TranTypeListDao {
//   constructor(private _storageService: FinanceStorageService) {
//   }

//   getTranTypeList(): Observable<TranType[]> {
//     // const href = 'https://api.github.com/search/issues';
//     // const requestUrl =
//     //     `${href}?q=repo:angular/material2&sort=${sort}&order=${order}&page=${page + 1}`;

//     // return this.http.get<GithubApi>(requestUrl);
//     return this._storageService.fetchAllTranTypes();
//   }
// }
// !!! Second option !!!

// !!! First option !!!
// /**
//  * Data source of Tran. type
//  */
// export class TranTypeDataSource extends DataSource<any> {
//   constructor(private _storageService: FinanceStorageService,
//     private _paginator: MatPaginator) {
//     super();
//   }

//   /** Connect function called by the table to retrieve one stream containing the data to render. */
//   connect(): Observable<TranType[]> {
//     const displayDataChanges = [
//       this._storageService.listTranTypeChange,
//       this._paginator.page,
//     ];

//     return Observable.merge(...displayDataChanges).map(() => {
//       const data = this._storageService.TranTypes.slice();

//       // Grab the page's slice of data.
//       const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
//       return data.splice(startIndex, this._paginator.pageSize);
//     });
//   }

//   disconnect() { }
// }
// !!! First option !!!

@Component({
  selector: 'hih-finance-tran-type-list',
  templateUrl: './tran-type-list.component.html',
  styleUrls: ['./tran-type-list.component.scss'],
})
export class TranTypeListComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  displayedColumns: string[] = ['id', 'name', 'expflag', 'fulldisplay', 'hierlvl', 'parent', 'comment'];
  // !!! Second option !!!
  // ttDatabase: TranTypeListDao | undefined;
  // dataSource = new MatTableDataSource();
  // resultsLength = 0;
  // isLoadingResults = false;
  // !!! Second option !!!

  // !!! First option !!!
  // dataSource = new TranTypeDataSource();
  // !!! First option !!!

  dataSource: MatTableDataSource<TranType> = new MatTableDataSource<TranType>();

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  isLoadingResults: boolean;

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,
    private _snackBar: MatSnackBar,
    ) {

    this.isLoadingResults = false;
    this.dataSource.sortingDataAccessor = (data: TranType, property: string) => {
      switch (property) {
        case 'id': return +data.Id;
        case 'name': return data.Name;
        case 'expflag': return +data.Expense;
        case 'fulldisplay': return data.FullDisplayText;
        case 'hierlvl': return data.HierLevel;
        case 'parent': return data.ParId;
        case 'comment': return data.Comment;
        default: return '';
      }
    };
    this.dataSource.filterPredicate =
      (data: TranType, filter: string) =>
      (data.Name.indexOf(filter) !== -1 ) || (data.Comment && data.Comment.indexOf(filter) !== -1);
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering TranTypeListComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
    // !!! First option !!!
    // this.dataSource = new TranTypeDataSource(this._storageService, this.paginator);

    // this._storageService.fetchAllTranTypes().subscribe((x) => {
    //   // Just ensure the REQUEST has been sent
    // });
    // !!! First option !!!

    this.isLoadingResults = true;
    this._storageService.fetchAllTranTypes().pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug('AC_HIH_UI [Debug]: Entering TranTypeListComponent ngOnInit, fetchAllTranTypes...');
      }

      if (x) {
        this.dataSource = new MatTableDataSource(x);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering TranTypeListComponent ngOnInit, fetchAllTranTypes, failed with ${error}`);
      }
      this._snackBar.open(error.toString(), undefined, {
        duration: 2000,
      });
    }, () => {
      this.isLoadingResults = false;
    });
  }

  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering TranTypeListComponent ngAfterViewInit...');
    }
    // !!! Second option !!!
    // this.ttDatabase = new TranTypeListDao(this._storageService);
    // // If the user changes the sort order, reset back to the first page.
    // this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    // merge(this.sort.sortChange, this.paginator.page)
    //   .pipe(
    //     startWith({}),
    //     switchMap(() => {
    //       this.isLoadingResults = true;
    //       return this.ttDatabase!.getTranTypeList();
    //     }),
    //     map(data => {
    //       // Flip flag to show that loading has finished.
    //       this.isLoadingResults = false;
    //       this.resultsLength = data.length;

    //       return data;
    //     }),
    //     catchError(() => {
    //       this.isLoadingResults = false;
    //       return observableOf([]);
    //     })
    //   ).subscribe(data => this.dataSource.data = data);
    // !!! Second option !!!
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering TranTypeListComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  getTranTypeLevelString(trantype: TranTypeLevelEnum): string {
    return UIDisplayStringUtil.getTranTypeLevelDisplayString(trantype);
  }

  applyFilter(filterValue: string): void {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
}
