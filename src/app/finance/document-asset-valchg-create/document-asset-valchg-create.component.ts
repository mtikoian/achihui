import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatSnackBar, MatTableDataSource, MatPaginator, MatVerticalStepper } from '@angular/material';
import { Observable, forkJoin, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString, Account, financeAccountCategoryAsset,
  UICommonLabelEnum,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  IAccountCategoryFilterEx, momentDateFormat, DocumentItemWithBalance,
  InfoMessage, MessageType, financeDocTypeAssetValChg, financeTranTypeAssetValueIncrease,
  financeTranTypeAssetValueDecrease, FinanceAssetValChgDocumentAPI,
  HomeMember, ControlCenter, TranType, Order, DocumentType, Currency,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import * as moment from 'moment';

// Assistant class
class DocItemWithBlance {
  docId: number;
  tranDate: string;
  tranAmount: number;
  balance: number;
  newBalance: number;

  fromData(val: DocumentItemWithBalance): void {
    this.docId = val.DocId;
    this.tranDate = val.TranDateFormatString;
    this.tranAmount = val.TranAmount_LC;
    this.balance = val.Balance;
    this.newBalance = val.Balance;
  }
}

@Component({
  selector: 'hih-document-asset-valchg-create',
  templateUrl: './document-asset-valchg-create.component.html',
  styleUrls: ['./document-asset-valchg-create.component.scss'],
})
export class DocumentAssetValChgCreateComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  public detailObject: FinanceAssetValChgDocumentAPI;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilterEx: IAccountCategoryFilterEx | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Step: Extra info
  public uiRevAccountCtgyFilterEx: IAccountCategoryFilterEx | undefined;
  dataSource: MatTableDataSource<DocItemWithBlance> = new MatTableDataSource<DocItemWithBlance>();
  displayedColumns: string[] = ['DocId', 'TranDate', 'Amount', 'Balance', 'NewBalance'];
  tranAmount: number;
  @ViewChild(MatVerticalStepper) _stepper: MatVerticalStepper;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  // Variables
  arMembersInChosedHome: HomeMember[];
  arControlCenters: ControlCenter[];
  arOrders: Order[];
  arTranTypes: TranType[];
  arAccounts: Account[];
  arDocTypes: DocumentType[];
  arCurrencies: Currency[];

  get TransactionAmount(): number {
    return this.tranAmount;
  }
  get TranCurrency(): string {
    let currctrl: any = this.firstFormGroup.get('currControl');
    if (currctrl) {
      return currctrl.value;
    }
  }
  get isForeignCurrency(): boolean {
    if (this.TranCurrency && this.TranCurrency !== this._homeService.ChosedHome.BaseCurrency) {
      return true;
    }

    return false;
  }
  get TargetAssetAccountID(): number {
    let acccontrol: any = this.firstFormGroup.get('accountControl');
    if (acccontrol) {
      return acccontrol.value;
    }
  }
  get NewEstimatedAmount(): number {
    let amtctrl: any = this.firstFormGroup.get('amountControl');
    if (amtctrl) {
      return amtctrl.value;
    }
  }
  get TransactionDate(): string {
    let datctrl: any = this.firstFormGroup.get('dateControl');
    if (datctrl && datctrl.value && datctrl.value.format) {
      return datctrl.value.format(momentDateFormat);
    }

    return '';
  }
  get firstStepCompleted(): boolean {
    if (this.firstFormGroup && this.firstFormGroup.valid) {
      // Ensure the amount
      let amt: any = this.firstFormGroup.get('amountControl').value;
      if (amt === undefined || Number.isNaN(amt) || amt <= 0) {
        return false;
      }

      // Ensure the exchange rate
      if (this.isForeignCurrency) {
        if (!this.firstFormGroup.get('exgControl').value) {
          return false;
        }
      }

      if (this.firstFormGroup.get('ccControl').value) {
        if (this.firstFormGroup.get('orderControl').value) {
          return false;
        } else {
          return true;
        }
      } else {
        if (this.firstFormGroup.get('orderControl').value) {
          return true;
        } else {
          return false;
        }
      }
    }
    return false;
  }

  constructor(public _storageService: FinanceStorageService,
    private _uiStatusService: UIStatusService,
    private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _homeService: HomeDefDetailService,
    private _currService: FinCurrencyService,
    private _router: Router,
    private _formBuilder: FormBuilder) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering DocumentAssetValChgCreateComponent constructor`);
    }

    this.arMembersInChosedHome = this._homeService.ChosedHome.Members.slice();
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering DocumentAssetValChgCreateComponent ngOnInit`);
    }

    this._destroyed$ = new ReplaySubject(1);

    this.firstFormGroup = this._formBuilder.group({
      accountControl: ['', Validators.required],
      dateControl: [{value: moment(), disabled: false}, Validators.required],
      amountControl: [0, Validators.required],
      currControl: ['', Validators.required],
      exgControl: [''],
      exgpControl: [''],
      despControl: ['', Validators.required],
      ccControl: [''],
      orderControl: [''],
    });

    forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllAssetCategories(),
      this._storageService.fetchAllDocTypes(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._currService.fetchAllCurrencies(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((rst: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering DocumentAssetValChgCreateComponent ngOnInit, forkJoin, result length: ${rst.length}`);
      }

      this.arDocTypes = rst[2];
      this.arTranTypes = rst[3];
      this.arAccounts = rst[4];
      this.arControlCenters = rst[5];
      this.arOrders = rst[6];
      this.arCurrencies = rst[7];

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this.arAccounts, rst[0]);
      this.uiAccountStatusFilter = undefined;
      this.uiAccountCtgyFilterEx = {
        includedCategories: [financeAccountCategoryAsset],
        excludedCategories: [],
      };
      this.uiRevAccountCtgyFilterEx = {
        includedCategories: [],
        excludedCategories: [financeAccountCategoryAsset],
      };
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this.arOrders, true);
      this.uiOrderFilter = undefined;

      // Currency
      this.firstFormGroup.get('currControl').setValue(this._homeService.ChosedHome.BaseCurrency);
    }, (error: any) => {
      this._snackbar.open(error.toString(), undefined, {
        duration: 2000,
      });
    });
  }

  ngOnDestroy(): void {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();  
    }
  }

  onSubmit(): void {
    // Generate the doc, and verify it
    let docobj: Document = this._generateDoc();
    if (!docobj.onVerify({
      ControlCenters: this.arControlCenters,
      Orders: this.arOrders,
      Accounts: this.arAccounts,
      DocumentTypes: this.arDocTypes,
      TransactionTypes: this.arTranTypes,
      Currencies: this.arCurrencies,
      BaseCurrency: this._homeService.ChosedHome.BaseCurrency,
    })) {
      // Show a dialog for error details
      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        ContentTable: docobj.VerifiedMsgs,
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });

      return;
    }

    // Do the real submit.
    this.detailObject = new FinanceAssetValChgDocumentAPI();
    this.detailObject.HID = this._homeService.ChosedHome.ID;
    this.detailObject.tranDate = docobj.TranDate.format(momentDateFormat);
    this.detailObject.tranCurr = this.TranCurrency;
    this.detailObject.desp = docobj.Desp;
    this.detailObject.assetAccountID = this.TargetAssetAccountID;
    this.detailObject.controlCenterID = this.firstFormGroup.get('ccControl').value;
    this.detailObject.orderID = this.firstFormGroup.get('orderControl').value;
    docobj.Items.forEach((val: DocumentItem) => {
      this.detailObject.items.push(val.writeJSONObject());
    });

    this._storageService.createAssetValChgDocument(this.detailObject).subscribe((nid: number) => {
      // New doc created with ID returned
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering OnSubmit in DocumentAssetValChgCreateComponent for createAssetValChgDocument, new doc ID: ${nid}`);
      }

      // Show success
      this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
        undefined, {
          duration: 2000,
        }).afterDismissed().subscribe(() => {
          this._router.navigate(['/finance/document/display/' + nid.toString()]);
        });
    }, (err: string) => {
      // Handle the error
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Failed in onSubmit in DocumentAssetValChgCreateComponent for createAssetValChgDocument, result: ${err}`);
      }

      let msg: InfoMessage = new InfoMessage();
      msg.MsgTime = moment();
      msg.MsgType = MessageType.Error;
      msg.MsgTitle = 'Common.Error';
      msg.MsgContent = err;
      const dlginfo: MessageDialogInfo = {
        Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        ContentTable: [msg],
        Button: MessageDialogButtonEnum.onlyok,
      };

      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo,
      });

      return;
    }, () => {
      // DO nothing
    });
  }

  public onStepSelectionChange(event: StepperSelectionEvent): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log(`AC_HIH_UI [Debug]: Entering onStepSelectionChange in DocumentAssetValChgCreateComponent`);
    }

    const curidx: number = event.selectedIndex;
    if (curidx === 1) {
      // Fetch the existing items
      this._storageService.getDocumentItemByAccount(this.TargetAssetAccountID).subscribe((x: any) => {
        // Get the output
        let items: any[] = [];
        if (x.contentList && x.contentList instanceof Array && x.contentList.length > 0) {
          for (let di of x.contentList) {
            let docitem: DocumentItemWithBalance = new DocumentItemWithBalance();
            docitem.onSetData(di);

            let di2: DocItemWithBlance = new DocItemWithBlance();
            di2.fromData(docitem);
            items.push(di2);
          }
        }

        let fakebalance: DocItemWithBlance = new DocItemWithBlance();
        // fakebalance.docId = 0;
        fakebalance.tranDate = this.TransactionDate;
        fakebalance.tranAmount = 0;
        fakebalance.balance = 0;
        fakebalance.newBalance = this.NewEstimatedAmount;
        items.push(fakebalance);

        // Sorting
        items = items.sort((a: any, b: any) => {
          return a.tranDate.localeCompare(b.tranDate);
        });

        let curbal: number = 0;
        for (let idx: number = 0; idx < items.length; idx++) {
          curbal += items[idx].tranAmount;
          if (items[idx].docId) {
            items[idx].newBalance = curbal;
          } else {
            items[idx].tranAmount = items[idx].newBalance - curbal;
            this.tranAmount = items[idx].tranAmount;
          }
        }

        this.dataSource = new MatTableDataSource(items);
        this.dataSource.paginator = this.paginator;
      });
    }
  }

  public onReset(): void {
    if (this._stepper) {
      this._stepper.reset();
    }
  }

  private _generateDoc(): Document {
    let ndoc: Document = new Document();
    ndoc.DocType = financeDocTypeAssetValChg;
    ndoc.HID = this._homeService.ChosedHome.ID;
    ndoc.TranDate = this.firstFormGroup.get('dateControl').value;
    ndoc.TranCurr = this._homeService.ChosedHome.BaseCurrency;
    ndoc.Desp = this.firstFormGroup.get('despControl').value;
    // Add items
    let ndocitem: DocumentItem = new DocumentItem();
    ndocitem.ItemId = 1;
    ndocitem.AccountId = this.TargetAssetAccountID;
    ndocitem.ControlCenterId = this.firstFormGroup.get('ccControl').value;
    ndocitem.OrderId = this.firstFormGroup.get('orderControl').value;
    ndocitem.Desp = ndoc.Desp;
    if (this.TransactionAmount > 0) {
      ndocitem.TranAmount = this.TransactionAmount;
      ndocitem.TranType = financeTranTypeAssetValueIncrease;
    } else {
      ndocitem.TranAmount = Math.abs(this.TransactionAmount);
      ndocitem.TranType = financeTranTypeAssetValueDecrease;
    }
    ndoc.Items.push(ndocitem);

    return ndoc;
  }
}
