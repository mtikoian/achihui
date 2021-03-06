import { Component, ViewChild, OnInit, AfterViewInit, Input, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatPaginator, MatSnackBar, MatTableDataSource } from '@angular/material';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, LearnCategory, LearnObject, } from '../../model';
import { HomeDefDetailService, LearnStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'hih-learn-object-by-category',
  templateUrl: './object-by-category.component.html',
  styleUrls: ['./object-by-category.component.scss'],
})
export class ObjectByCategoryComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  private _seledCategory: number;

  displayedColumns: string[] = ['id', 'category', 'name', 'comment'];
  dataSource: any = new MatTableDataSource<LearnObject>();

  @Input()
  set selectedCategory(selctgy: number) {
    if (selctgy !== this._seledCategory && selctgy) {
      this._seledCategory = selctgy;

      this.dataSource.data = [];

      this._storageService.fetchAllObjects(this._seledCategory)
        .pipe(takeUntil(this._destroyed$))
        .subscribe((x: any) => {
          if (x instanceof Array && x.length > 0) {
            let arobjs: any[] = [];
            for (let di of x) {
              arobjs.push(di);
            }

            this.dataSource.data = arobjs;
          }
        });
    }
  }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(public _storageService: LearnStorageService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ObjectByCategoryComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ObjectByCategoryComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
  }

  /**
   * Set the paginator after the view init since this component will
   * be able to query its view for the initialized paginator.
   */
  ngAfterViewInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ObjectByCategoryComponent ngAfterViewInit...');
    }
    this.dataSource.paginator = this.paginator;
  }
  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering ObjectByCategoryComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
