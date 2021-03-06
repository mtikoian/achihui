import { OnInit, AfterViewInit, Component, Directive, ViewChild, Input, OnDestroy, } from '@angular/core';
import { Router } from '@angular/router';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MatSnackBar, MatDialog } from '@angular/material';
import { BehaviorSubject, Observable, forkJoin, of as observableOf, ReplaySubject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, Account, AccountStatusEnum, AccountCategory, UIDisplayString, UIDisplayStringUtil, OverviewScopeEnum,
  getOverviewScopeRange, UICommonLabelEnum, } from '../../model';
import { FinanceStorageService, UIStatusService } from '../../services';
import { popupDialog, popupConfirmDialog, } from '../../message-dialog';

/**
 * Node type for Account tree
 */
enum AccountTreeNodeTypeEnum {
  category = 1,
  account = 2,
}

/**
 * Account data with nested structure.
 * Each node has a display name anda list of children.
 */
class AccountTreeNode {
  children: AccountTreeNode[];
  displayname: string;
  id: number;
  nodetype: AccountTreeNodeTypeEnum;
}

/** Flat node with expandable and level information */
class AccountTreeFlatNode {
  displayname: string;
  id: number;
  nodetype: AccountTreeNodeTypeEnum;
  childamount: number;

  level: number;
  expandable: boolean;
}

@Component({
  selector: 'hih-finance-account-tree',
  templateUrl: './account-tree.component.html',
  styleUrls: ['./account-tree.component.scss'],
})
export class AccountTreeComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  treeControl: FlatTreeControl<AccountTreeFlatNode>;
  treeFlattener: MatTreeFlattener<AccountTreeNode, AccountTreeFlatNode>;
  dataSource: MatTreeFlatDataSource<AccountTreeNode, AccountTreeFlatNode>;
  curNode: AccountTreeFlatNode;
  arrayStatus: UIDisplayString[];
  selectedStatus: AccountStatusEnum;
  selectedAccounts: number[];
  availableCategories: AccountCategory[];
  availableAccounts: Account[];
  selectedAccountCtgyScope: OverviewScopeEnum;
  selectedAccountScope: OverviewScopeEnum;

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService,
    private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router) {
    this.isLoadingResults = false;

    this.arrayStatus = UIDisplayStringUtil.getAccountStatusStrings();
    this.selectedStatus = AccountStatusEnum.Normal;
    this.selectedAccounts = [];
    this.availableCategories = [];
    this.availableAccounts = [];
    this.selectedAccountScope = OverviewScopeEnum.CurrentMonth;
    this.selectedAccountCtgyScope = OverviewScopeEnum.CurrentMonth;

    this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel,
      this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<AccountTreeFlatNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  ngOnInit(): void {
    this._destroyed$ = new ReplaySubject(1);

    this._refreshTree(false);
  }

  ngOnDestroy(): void {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onTreeNodeClicked(node: AccountTreeFlatNode): void {
    this.curNode = node;

    switch (node.nodetype) {
      case AccountTreeNodeTypeEnum.account:
      break;

      case AccountTreeNodeTypeEnum.category: {
        this.selectedAccounts = [];

        if (node.childamount > 0) {
          // Do something
          this.availableAccounts.forEach((value: Account) => {
            if (+value.CategoryId === +node.id) {
              this.selectedAccounts.push(+value.Id);
            }
          });
        }
        break;
      }

      default:
      break;
    }
  }

  public onAccountStatusChange(): void {
    this.isLoadingResults = true;
    this.dataSource.data = [];

    this._storageService.fetchAllAccounts()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug('AC_HIH_UI [Debug]: Entering AccountTreeComponent onAccountStatusChange, fetchAllAccounts...');
      }

      this.availableCategories = this._storageService.AccountCategories;
      this.availableAccounts = this._filterAccountsByStatus(<Account[]>x);

      let nodes: AccountTreeNode[] = this._buildAccountTree(this.availableCategories, this.availableAccounts, 1);
      this.dataSource.data = nodes;
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering AccountTreeComponent onAccountStatusChange, fetchAllAccounts failed: ${error.toString()}`);
      }
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), error.toString(), undefined);
    }, () => {
      this.isLoadingResults = false;
    });
  }

  public onRefresh(): void {
    this._refreshTree(true);
  }

  public onCreateAccount(): void {
    this._router.navigate(['/finance/account/create']);
  }

  public onDisplayAccount(acntid: number): void {
    this._router.navigate(['/finance/account/display', acntid]);
  }

  public onChangeAccount(acntid: number): void {
    this._router.navigate(['/finance/account/edit', acntid]);
  }

  public onCloseAccount(acntid: number): void {
    // Check the account can be closed
    let curacnt: Account = this.availableAccounts.find((acnt: Account) => {
      return acnt.Id === acntid;
    });
    if (!curacnt || curacnt.Status !== AccountStatusEnum.Normal) {
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), 'Finance.CloseAccountIsNotAllowed');
      return;
    }

    // Show a confirm dialog
    popupConfirmDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.OperConfirmTitle),
      this._uiStatusService.getUILabel(UICommonLabelEnum.OperConfirmContent))
      .afterClosed().subscribe((x2: any) => {
      if (x2) {
        this._storageService.updateAccountStatus(acntid, AccountStatusEnum.Closed).subscribe((x3: any) => {
          this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.OperationCompleted), undefined, {
            duration: 2000,
          }).afterDismissed().subscribe(() => {
            this._refreshTree(true);
          });
        }, (error: any) => {
          popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), error.toString());
        });
      }
    });
  }
  public onFreezeAccount(acntid: number): void {
    // Check the account can be frozen
    let curacnt: Account = this.availableAccounts.find((acnt: Account) => {
      return acnt.Id === acntid;
    });
    if (!curacnt || curacnt.Status !== AccountStatusEnum.Normal) {
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), 'Finance.CloseAccountIsNotAllowed');
      return;
    }
    // Show a confirm dialog
    popupConfirmDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.OperConfirmTitle),
      this._uiStatusService.getUILabel(UICommonLabelEnum.OperConfirmContent))
      .afterClosed().subscribe((x2: any) => {
      if (x2) {
        this._storageService.updateAccountStatus(acntid, AccountStatusEnum.Frozen).subscribe((x3: any) => {
          this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.OperationCompleted), undefined, {
            duration: 2000,
          }).afterDismissed().subscribe(() => {
            this._refreshTree(true);
          });
        }, (error: any) => {
          popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), error.toString());
        });
      }
    });
  }

  transformer = (node: AccountTreeNode, level: number) => {
    let flatNode: AccountTreeFlatNode = new AccountTreeFlatNode();
    flatNode.displayname = node.displayname;
    flatNode.id = node.id;
    flatNode.nodetype = node.nodetype;
    flatNode.childamount = node.children ? node.children.length : 0;

    flatNode.level = level;
    flatNode.expandable = !!node.children;

    return flatNode;
  }

  hasChild = (_: number, _nodeData: AccountTreeFlatNode) => { return _nodeData.expandable; };

  private _getLevel = (node: AccountTreeFlatNode) => { return node.level; };

  private _isExpandable = (node: AccountTreeFlatNode) => { return node.expandable; };

  private _getChildren = (node: AccountTreeNode): Observable<AccountTreeNode[]> => {
    return observableOf(node.children);
  }
  private _refreshTree(isReload?: boolean): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering AccountTreeComponent _refreshTree...');
    }
    this.isLoadingResults = true;

    forkJoin(this._storageService.fetchAllAccountCategories(), this._storageService.fetchAllAccounts(isReload))
      .pipe(takeUntil(this._destroyed$))
      .subscribe((data: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering AccountTreeComponent _refreshTree, forkJoin...');
        }

        if (data instanceof Array && data.length > 0) {
          // Parse the data
          this.availableCategories = data[0];
          this.availableAccounts = this._filterAccountsByStatus(<Account[]>data[1]);

          let nodes: AccountTreeNode[] = this._buildAccountTree(this.availableCategories, this.availableAccounts, 1);
          this.dataSource.data = nodes;
        }
      }, (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error('AC_HIH_UI [Error]: Entering AccountTreeComponent _refreshTree, forkJoin, failed...');
        }

        popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), error.toString(), undefined);
      }, () => {
        this.isLoadingResults = false;
      });
  }

  private _buildAccountTree(arctgy: AccountCategory[], aracnt: Account[], level: number, ctgyid?: number): AccountTreeNode[] {
    let data: AccountTreeNode[] = [];

    if (ctgyid === undefined || Number.isNaN(ctgyid)) {
      arctgy.forEach((val: AccountCategory) => {
        // Root nodes!
        let node: AccountTreeNode = new AccountTreeNode();
        node.displayname = val.Name;
        node.id = val.ID;
        node.nodetype = AccountTreeNodeTypeEnum.category;
        node.children = this._buildAccountTree(arctgy, aracnt, level + 1, node.id);
        data.push(node);
      });
    } else {
      aracnt.forEach((val: Account) => {
        if (val.CategoryId === ctgyid) {
          // Child nodes!
          let node: AccountTreeNode = new AccountTreeNode();
          node.displayname = val.Name;
          node.id = val.Id;
          node.nodetype = AccountTreeNodeTypeEnum.account;

          data.push(node);
        }
      });
    }

    return data;
  }
  private _filterAccountsByStatus(allAccounts: Account[]): Account[] {
    return allAccounts.filter((value: Account) => {
      if (this.selectedStatus !== undefined && value.Status !== this.selectedStatus) {
        return false;
      }

      return true;
    });
  }
}
