import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, merge, of, Subscription } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LogLevel, AssetCategory } from '../../model';
import { FinanceStorageService } from '../../services';
import { fadeAnimation } from '../../utility';

/**
 * Data source of Asset category
 */
export class AssetCategoryDataSource extends DataSource<any> {
  constructor(private _storageService: FinanceStorageService,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<AssetCategory[]> {
    const displayDataChanges: any[] = [
      this._storageService.listAssetCategoryChange,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._storageService.AssetCategories.slice();

      // Grab the page's slice of data.
      const startIndex: number = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    }));
  }

  disconnect(): void {
    // Empty
  }
}

@Component({
  selector: 'hih-finance-asset-category-list',
  templateUrl: './asset-category-list.component.html',
  styleUrls: ['./asset-category-list.component.scss'],
  animations: [fadeAnimation],
})
export class AssetCategoryListComponent implements OnInit, OnDestroy {
  private _readStub: Subscription;
  displayedColumns: string[] = ['id', 'name', 'desp'];
  dataSource: AssetCategoryDataSource | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  isLoadingResults: boolean;

  constructor(public _storageService: FinanceStorageService,
    private _router: Router) {
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    this.isLoadingResults = true;
    this.dataSource = new AssetCategoryDataSource(this._storageService, this.paginator);

    this._readStub = this._storageService.fetchAllAssetCategories().subscribe((x: any) => {
      // Just ensure the REQUEST has been sent
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
  }

  ngOnDestroy(): void {
    if (this._readStub) {
      this._readStub.unsubscribe();
    }
  }
}
