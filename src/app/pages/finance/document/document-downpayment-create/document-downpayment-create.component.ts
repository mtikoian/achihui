import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, forkJoin } from 'rxjs';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';

import { financeDocTypeAdvancePayment, financeDocTypeAdvanceReceived, UIMode, UIAccountForSelection,
  IAccountCategoryFilter, UIOrderForSelection, Currency, ControlCenter, TranType, Order, ModelUtility,
  ConsoleLogTypeEnum, BuildupAccountForSelection, Account, BuildupOrderForSelection, costObjectValidator,
  Document, DocumentItem, financeTranTypeAdvancePaymentOut, financeTranTypeAdvanceReceiveIn,
  AccountExtraAdvancePayment, DocumentVerifyContext, DocumentType,
} from '../../../../model';
import { FinanceOdataService, UIStatusService, HomeDefOdataService } from '../../../../services';

@Component({
  selector: 'hih-fin-document-downpayment-create',
  templateUrl: './document-downpayment-create.component.html',
  styleUrls: ['./document-downpayment-create.component.less'],
})
export class DocumentDownpaymentCreateComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  // tslint:disable-next-line:variable-name
  private _isADP: boolean;

  public curMode: UIMode = UIMode.Create;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  public curTitle: string;
  public arCurrencies: Currency[] = [];
  public arTranType: TranType[] = [];
  public arControlCenters: ControlCenter[] = [];
  public arAccounts: Account[] = [];
  public arOrders: Order[] = [];
  public arDocTypes: DocumentType[] = [];
  public curDocType: number = financeDocTypeAdvancePayment;
  public baseCurrency: string;
  // Step: Header
  public headerFormGroup: FormGroup;
  // Step: Account Extra Info
  public accountExtraInfoFormGroup: FormGroup;
  // Step: Confirm
  public confirmInfo: any = {};
  public isDocPosting = false;
  // Step: Result
  public docCreateSucceed = false;

  get tranAmount(): number {
    return this.headerFormGroup && this.headerFormGroup.get('amountControl') && this.headerFormGroup.get('amountControl').value;
  }
  get tranType(): TranType {
    return this.headerFormGroup && this.headerFormGroup.get('tranTypeControl') && this.headerFormGroup.get('tranTypeControl').value;
  }
  get nextEnabled(): boolean {
    let isEnabled = false;
    switch (this.current) {
      case 0: {
        isEnabled = this.headerFormGroup.valid;
        break;
      }
      case 1: {
        isEnabled = this.accountExtraInfoFormGroup.valid;
        break;
      }
      case 2: {
        isEnabled = true; // Review
        break;
      }

      default: {
        break;
      }
    }
    return isEnabled;
  }

  current = 0;

  pre(): void {
    this.current -= 1;
    this.changeContent();
  }

  next(): void {
    this.current += 1;
    this.changeContent();
  }

  constructor(
    private odataService: FinanceOdataService,
    private _activateRoute: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private homeService: HomeDefOdataService,
    private _router: Router) {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering DocumentDownpaymentCreateComponent constructor`,
        ConsoleLogTypeEnum.debug);
      this.headerFormGroup = new FormGroup({
        headerControl: new FormControl('', Validators.required),
        accountControl: new FormControl('', Validators.required),
        tranTypeControl: new FormControl('', Validators.required),
        amountControl: new FormControl('', Validators.required),
        ccControl: new FormControl(''),
        orderControl: new FormControl(''),
      }, [costObjectValidator]);
      this.accountExtraInfoFormGroup = new FormGroup({
        infoControl: new FormControl()
      });
    }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    forkJoin([
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllDocTypes(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
      this.odataService.fetchAllCurrencies(),
    ])
    .pipe(takeUntil(this._destroyed$))
      .subscribe((rst: any) => {
        ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering DocumentDownpaymentCreateComponent, forkJoin`, ConsoleLogTypeEnum.debug);

        // Accounts
        this.arAccounts = rst[3];
        this.arUIAccount = BuildupAccountForSelection(this.arAccounts, rst[0]);
        this.uiAccountStatusFilter = undefined;
        this.uiAccountCtgyFilter = undefined;
        // Orders
        this.arOrders = rst[5];
        this.arUIOrder = BuildupOrderForSelection(this.arOrders, true);
        this.uiOrderFilter = undefined;
        // Currencies
        this.arCurrencies = rst[6];
        // Tran. type
        this.arTranType = rst[2];
        // Control Centers
        this.arControlCenters = rst[4];
        // Document type
        this.arDocTypes = rst[1];
        // Base currency
        this.baseCurrency = this.homeService.ChosedHome.BaseCurrency;

        this._activateRoute.url.subscribe((x: any) => {
          if (x instanceof Array && x.length > 0) {
            if (x[0].path === 'createadp' || x[0].path === 'createadr') {
              if (x[0].path === 'createadp') {
                this._isADP = true;
              } else {
                this._isADP = false;
              }
              this._updateCurrentTitle();
              this.uiAccountStatusFilter = 'Normal';
              this.uiAccountCtgyFilter = {
                skipADP: true,
                skipLoan: true,
                skipAsset: true,
              };
              this.uiOrderFilter = true;

              this._cdr.detectChanges();
            }
          }
        });
      }, (error: any) => {
        ModelUtility.writeConsoleLog('AC_HIH_UI [Error]: Entering Entering DocumentADPCreateComponent ngOnInit forkJoin, failed',
          ConsoleLogTypeEnum.error);
        // TBD.
      });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  changeContent(): void {
    switch (this.current) {
      case 0: {
        break;
      }
      case 1: {
        // Show the dp docs
        break;
      }
      case 2: {
        // Review
        this._updateConfirmInfo();
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
    // Save current document
    const docObj: Document = this._geneateDocument();
    const accountExtra: AccountExtraAdvancePayment = this.accountExtraInfoFormGroup.get('infoControl').value;
    // accountExtra.dpTmpDocs = this.accountExtraInfoFormGroup.

    // Check!
    if (!docObj.onVerify({
      ControlCenters: this.arControlCenters,
      Orders: this.arOrders,
      Accounts: this.arAccounts,
      DocumentTypes: this.arDocTypes,
      TransactionTypes: this.arTranType,
      Currencies: this.arCurrencies,
      BaseCurrency: this.homeService.ChosedHome.BaseCurrency,
    } as DocumentVerifyContext)) {
      // Show a dialog for error details
      // TBD.
      // popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error), undefined, docObj.VerifiedMsgs);

      return;
    }

    this.odataService.createADPDocument(docObj, accountExtra, this._isADP).subscribe((x: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering DocumentADPCreateComponent, onSubmit, createADPDocument`,
        ConsoleLogTypeEnum.debug);

      this.docCreateSucceed = true;
      // TBD.
    }, (error: any) => {
      // Show error message
      this.docCreateSucceed = false;
    });
  }

  private _updateCurrentTitle(): void {
    if (this._isADP) {
      this.curTitle = 'Sys.DocTy.AdvancedPayment';
      this.curDocType = financeDocTypeAdvancePayment;
    } else {
      this.curTitle = 'Sys.DocTy.AdvancedRecv';
      this.curDocType = financeDocTypeAdvanceReceived;
    }
  }
  private _geneateDocument(): Document {
    const doc: Document = this.headerFormGroup.get('headerControl').value;
    doc.HID = this.homeService.ChosedHome.ID;
    doc.DocType = this.curDocType;

    const fitem: DocumentItem = new DocumentItem();
    fitem.ItemId = 1;
    fitem.AccountId = this.headerFormGroup.get('accountControl').value;
    fitem.ControlCenterId = this.headerFormGroup.get('ccControl').value;
    fitem.OrderId = this.headerFormGroup.get('orderControl').value;
    if (this._isADP) {
      fitem.TranType = financeTranTypeAdvancePaymentOut;
    } else {
      fitem.TranType = financeTranTypeAdvanceReceiveIn;
    }
    fitem.TranAmount = this.headerFormGroup.get('amountControl').value;
    fitem.Desp = doc.Desp;
    doc.Items = [fitem];

    return doc;
  }
  private _updateConfirmInfo(): void {
    const doc: Document = this.headerFormGroup.get('headerControl').value;
    this.confirmInfo.tranDateString = doc.TranDateFormatString;
    this.confirmInfo.tranDesp = doc.Desp;
    this.confirmInfo.tranAmount = this.headerFormGroup.get('amountControl').value;
    this.confirmInfo.tranCurrency = doc.TranCurr;
    if (this._isADP) {
      this.confirmInfo.tranType = financeTranTypeAdvancePaymentOut;
    } else {
      this.confirmInfo.tranType = financeTranTypeAdvanceReceiveIn;
    }
  }
}
