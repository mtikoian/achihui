import { Component, OnInit, ViewContainerRef, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers, Response, RequestOptions, URLSearchParams }
  from '@angular/http';
import * as HIHCommon from '../../../model/common';
import * as HIHFinance from '../../../model/financemodel';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent,
  ITdDataTableColumn, ITdDataTableSelectEvent
} from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { UIStatusService } from '../../../services/uistatus.service';
import { TdDialogService } from '@covalent/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'finance-account-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  private _apiUrl: string;
  public listData: Array<HIHFinance.Account> = [];

  clnhdrstring: string[] = ["Common.ID", "Common.Category", "Common.Category", "Common.Name", "Common.Comment"];
  columns: ITdDataTableColumn[] = [];
  filteredData: any[];
  filteredTotal: number;
  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSize: number = 10;
  sortBy: string = 'Name';
  selectable: boolean = true;
  selectedRows: any[] = [];
  searchBox = {
    searchVisible: false
  };
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;

  constructor(private _http: Http,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _zone: NgZone,
    private _uistatus: UIStatusService,
    private _dialogService: TdDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _dataTableService: TdDataTableService,
    private _tranService: TranslateService) {
    if (environment.DebugLogging) {
      console.log("Entering constructor of FinanceAccountList");
    }

    this._apiUrl = environment.ApiUrl + "api/financeaccount";
    this.columns = [
      { name: 'Id', label: '#', tooltip: 'ID' },
      { name: 'CategoryId', label: 'Category', tooltip: 'Category ID' },
      { name: 'CategoryName', label: 'Category Name', tooltip: 'Category' },
      { name: 'Name', label: 'Name', tooltip: 'Name' },
      { name: 'Comment', label: 'Comment', tooltip: 'Comment' }
    ];
    this.loadHeaderString();
  }

  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of FinanceAccountList");
    }

    this.loadAccountList();
  }

  loadAccountList(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadAccountList of FinanceAccountList");
    }

    var headers = new Headers();
    this._http.get(this._apiUrl, { headers: headers })
      .map(this.extractData)
      .catch(this.handleError)
      .subscribe(data => {
        if (data instanceof Array) {
          this.listData = data;
          this.filter();
        }
      },
      error => {
        // It should be handled already
      },
      () => {
        // Finished
      });
  }

  private extractData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractData of FinanceAccountList");
    }

    let body = res.json();
    if (body && body.contentList && body.contentList instanceof Array) {
      let sets = new Array<HIHFinance.Account>();
      for (let alm of body.contentList) {
        let alm2 = new HIHFinance.Account();
        alm2.onSetData(alm);
        sets.push(alm2);
      }
      return sets;
    }

    return body || {};
  }

  private handleError(error: any) {
    if (environment.DebugLogging) {
      console.log("Entering handleError of FinanceAccountList");
    }

    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }

  sort(sortEvent: ITdDataTableSortChangeEvent): void {
    this.sortBy = sortEvent.name;
    this.sortOrder = sortEvent.order;
    this.filter();
  }

  search(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filter();
  }

  page(pagingEvent: IPageChangeEvent): void {
    this.fromRow = pagingEvent.fromRow;
    this.currentPage = pagingEvent.page;
    this.pageSize = pagingEvent.pageSize;
    this.filter();
  }

  filter(): void {
    if (this.listData) {
      let newData: any[] = this.listData;
      newData = this._dataTableService.filterData(newData, this.searchTerm, true);
      this.filteredTotal = newData.length;
      newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
      newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
      this.filteredData = newData;
    }
  }

  public onCreateAccount() {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Entering onCreateAccount of FinanceAccountList");
    }
    this._router.navigate(['/finance/account/create']);
  }

  public onEditAccount() {
    if (this.selectedRows.length != 1) {
      this._dialogService.openAlert({
        message: "Select one and only one row to continue!",
        disableClose: false, // defaults to false
        viewContainerRef: this._viewContainerRef, //OPTIONAL
        title: "Selection error", //OPTIONAL, hides if not provided
        closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
      });
      return;
    }

    this._router.navigate(['/finance/account/edit/' + this.selectedRows[0].Id.toString()]);
  }

  public onDeleteAccount() : void {
    if (this.selectedRows.length <= 0) {
      this._dialogService.openAlert({
        message: "Select one and only one row to continue!",
        disableClose: false, // defaults to false
        viewContainerRef: this._viewContainerRef, //OPTIONAL
        title: "Selection error", //OPTIONAL, hides if not provided
        closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
      });
      return;
    }    
  }

  private loadHeaderString(): void {
    this._tranService.get(this.clnhdrstring).subscribe(x => {
      for(let i = 0; i < this.columns.length; i ++) {
        this.columns[i].label = x[this.clnhdrstring[i]];
      }
    }, error => {
    }, () => {
    });    
  }
}
