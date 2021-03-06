import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Observable, forkJoin, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, } from '@angular/forms';
import * as moment from 'moment';

import { Document, DocumentItem, UIMode, getUIModeString, Account, financeAccountCategoryAsset,
  UICommonLabelEnum, BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection,
  IAccountCategoryFilterEx, momentDateFormat, DocumentItemWithBalance,
  InfoMessage, MessageType, financeDocTypeAssetValChg, financeTranTypeAssetValueIncrease,
  financeTranTypeAssetValueDecrease, FinanceAssetValChgDocumentAPI,
  HomeMember, ControlCenter, TranType, Order, DocumentType, Currency, costObjectValidator, ModelUtility,
  ConsoleLogTypeEnum,
  DocumentItemView,
} from '../../../../model';
import { HomeDefOdataService, FinanceOdataService, UIStatusService } from '../../../../services';

// Assistant class
class DocItemWithBlance {
  docId: number;
  tranDate: string;
  desp: string;
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
  selector: 'hih-document-asset-value-change-create',
  templateUrl: './document-asset-value-change-create.component.html',
  styleUrls: ['./document-asset-value-change-create.component.less'],
})
export class DocumentAssetValueChangeCreateComponent implements OnInit, OnDestroy {
  // tslint:disable:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  public detailObject: FinanceAssetValChgDocumentAPI;
  public baseCurrency: string;

  // Step: Generic info
  public firstFormGroup: FormGroup;
  public curDocType: number = financeDocTypeAssetValChg;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilterEx: IAccountCategoryFilterEx | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  public uiRevAccountCtgyFilterEx: IAccountCategoryFilterEx | undefined;
  tranAmount: number;
  // Step: Confirm
  public confirmInfo: any = {};
  public existingDocItems: DocItemWithBlance[] = [];
  public isDocPosting = false;
  // Step: Result
  public docCreateSucceed = false;
  currentStep = 0;

  // Variables
  arMembersInChosedHome: HomeMember[];
  arControlCenters: ControlCenter[];
  arOrders: Order[];
  arTranTypes: TranType[];
  arAccounts: Account[];
  arDocTypes: DocumentType[];
  arCurrencies: Currency[];
  curMode: UIMode = UIMode.Create;

  get NewEstimatedAmount(): number {
    const amtctrl: any = this.firstFormGroup.get('amountControl');
    if (amtctrl) {
      return amtctrl.value;
    }
  }

  constructor(
    private _storageService: FinanceOdataService,
    private _homeService: HomeDefOdataService,
    private _router: Router) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetValueChangeCreateComponent constructor',
      ConsoleLogTypeEnum.debug);

    this.arMembersInChosedHome = this._homeService.ChosedHome.Members.slice();
    this.baseCurrency = this._homeService.ChosedHome.BaseCurrency;
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetValueChangeCreateComponent ngOnInit',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.firstFormGroup = new FormGroup({
      accountControl: new FormControl('', Validators.required),
      headerControl: new FormControl('', Validators.required),
      amountControl: new FormControl(0, Validators.required),
      ccControl: new FormControl(''),
      orderControl: new FormControl(''),
    }, [costObjectValidator, this._amountValidator]);

    forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllAssetCategories(),
      this._storageService.fetchAllDocTypes(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._storageService.fetchAllCurrencies(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((rst: any) => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetValueChangeCreateComponent ngOnInit forkJoin',
        ConsoleLogTypeEnum.debug);

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
    }, (error: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentAssetValueChangeCreateComponent ngOnInit forkJoin, failed ${error}`,
        ConsoleLogTypeEnum.error);
      // this._snackbar.open(error.toString(), undefined, {
      //   duration: 2000,
      // });
    });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetValChgCreateComponent ngOnDestroy',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  get nextButtonEnabled(): boolean {
    let isEnabled = false;
    switch (this.currentStep) {
      case 0: {
        isEnabled = this.firstFormGroup.valid;
        break;
      }
      case 1: { // Review
        isEnabled = true; // Review
        break;
      }
      default: {
        break;
      }
    }
    return isEnabled;
  }

  pre(): void {
    this.currentStep -= 1;
    this.changeContent();
  }

  next(): void {
    this.currentStep += 1;
    this.changeContent();
  }

  changeContent(): void {
    switch (this.currentStep) {
      case 0: {
        break;
      }
      case 1: {
        this._updateConfirmInfo();
        break;
      }
      case 2: {
        // Review
        break;
      }
      case 3: {
        this.isDocPosting = true;
        this.onSubmit();
        break;
      }
      default: {
      }
    }
  }

  onSubmit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetValChgCreateComponent onSubmit',
      ConsoleLogTypeEnum.debug);

    // Generate the doc, and verify it
    const docobj: Document = this._generateDoc();
    if (!docobj.onVerify({
      ControlCenters: this.arControlCenters,
      Orders: this.arOrders,
      Accounts: this.arAccounts,
      DocumentTypes: this.arDocTypes,
      TransactionTypes: this.arTranTypes,
      Currencies: this.arCurrencies,
      BaseCurrency: this._homeService.ChosedHome.BaseCurrency,
    })) {
      return;
    }

    // Do the real submit.
    this.detailObject = new FinanceAssetValChgDocumentAPI();
    this.detailObject.HID = this._homeService.ChosedHome.ID;
    this.detailObject.tranDate = docobj.TranDateFormatString;
    this.detailObject.tranCurr = docobj.TranCurr;
    this.detailObject.desp = docobj.Desp;
    this.detailObject.assetAccountID = this.firstFormGroup.get('accountControl').value;
    this.detailObject.controlCenterID = this.firstFormGroup.get('ccControl').value;
    this.detailObject.orderID = this.firstFormGroup.get('orderControl').value;
    docobj.Items.forEach((val: DocumentItem) => {
      this.detailObject.items.push(val);
    });

    this._storageService.createAssetValChgDocument(this.detailObject).subscribe((nid: number) => {
      // New doc created with ID returned
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetValChgCreateComponent onSubmit',
        ConsoleLogTypeEnum.debug);
    }, (err: string) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering DocumentAssetValChgCreateComponent onSubmit: ${err}`,
        ConsoleLogTypeEnum.error);

      return;
    });
  }

  private _updateConfirmInfo(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetValChgCreateComponent _updateConfirmInfo',
      ConsoleLogTypeEnum.debug);

    this.confirmInfo.targetAssetAccountID = this.firstFormGroup.get('accountControl').value;
    this.confirmInfo.targetAssetAccountName = this.arAccounts.find((val: Account) => {
      return val.Id === this.confirmInfo.targetAssetAccountID;
    })!.Name;
    this.confirmInfo.tranDateString = this.firstFormGroup.get('headerControl').value.TranDateFormatString;

    // Fetch the existing items
    this._storageService.getDocumentItemByAccount(this.confirmInfo.targetAssetAccountID).subscribe((x: any) => {
      // Get the output
      this.existingDocItems = [];
      if (x.contentList && x.contentList instanceof Array && x.contentList.length > 0) {
        let docitems: DocumentItemView[] = x.contentList as DocumentItemView[];
        docitems = docitems.sort((a, b) => {
          if (a.TransactionDate.isBefore(b.TransactionDate)) {
            return -1;
          }
          if (a.TransactionDate.isAfter(b.TransactionDate)) {
            return 1;
          }
          return 0;
        });
        let curbal2 = 0;
        for (const ditem of docitems) {
          let dbal: DocItemWithBlance = new DocItemWithBlance();
          dbal.docId = ditem.DocumentID;
          dbal.tranDate = ditem.TransactionDate.format(momentDateFormat);
          dbal.tranAmount = ditem.Amount;
          dbal.balance = curbal2;
          dbal.newBalance = dbal.balance + ditem.Amount;
          dbal.desp = ditem.ItemDesp;
          curbal2 = dbal.newBalance;
          this.existingDocItems.push(dbal);
        }
      }

      let fakebalance: DocItemWithBlance = new DocItemWithBlance();
      // fakebalance.docId = 0;
      fakebalance.tranDate = this.confirmInfo.tranDateString;
      fakebalance.tranAmount = 0;
      fakebalance.balance = 0;
      fakebalance.newBalance = this.NewEstimatedAmount;
      this.existingDocItems.push(fakebalance);

      // Sorting
      this.existingDocItems = this.existingDocItems.sort((a: any, b: any) => {
        return a.tranDate.localeCompare(b.tranDate);
      });

      let curbal = 0;
      for (let idx: number = 0; idx < this.existingDocItems.length; idx++) {
        curbal += this.existingDocItems[idx].tranAmount;
        if (this.existingDocItems[idx].docId) {
          this.existingDocItems[idx].newBalance = curbal;
        } else {
          this.existingDocItems[idx].tranAmount = this.existingDocItems[idx].newBalance - curbal;
          this.tranAmount = this.existingDocItems[idx].tranAmount;
        }
      }
    });
  }

  private _generateDoc(): Document {
    let ndoc: Document = this.firstFormGroup.get('headerControl').value;
    ndoc.HID = this._homeService.ChosedHome.ID;
    ndoc.DocType = this.curDocType;

    // Add items
    let ndocitem: DocumentItem = new DocumentItem();
    ndocitem.ItemId = 1;
    ndocitem.AccountId = this.firstFormGroup.get('accountControl').value;
    ndocitem.ControlCenterId = this.firstFormGroup.get('ccControl').value;
    ndocitem.OrderId = this.firstFormGroup.get('orderControl').value;
    ndocitem.Desp = ndoc.Desp;
    // if (ndoc.TranAmount > 0) {
    //   ndocitem.TranAmount = ndoc.TranAmount;
    //   ndocitem.TranType = financeTranTypeAssetValueIncrease;
    // } else {
    //   ndocitem.TranAmount = Math.abs(ndoc.TranAmount);
    //   ndocitem.TranType = financeTranTypeAssetValueDecrease;
    // }
    ndoc.Items = [ndocitem];

    return ndoc;
  }
  private _amountValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentAssetValChgCreateComponent constructor',
      ConsoleLogTypeEnum.debug);

    let amt: any = group.get('amountControl').value;
    if (amt === undefined || Number.isNaN(amt) || amt <= 0) {
      return { amountisinvalid: true };
    }

    return null;
  }
}
