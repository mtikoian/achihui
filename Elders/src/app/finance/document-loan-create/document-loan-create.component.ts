import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatSnackBar, MatTableDataSource, MatHorizontalStepper } from '@angular/material';
import { Observable, forkJoin, merge, ReplaySubject, Subscription } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import { LogLevel, Account, Document, DocumentItem, Currency, financeDocTypeBorrowFrom,
  ControlCenter, Order, TranType, financeDocTypeLendTo, UIMode,
  BuildupAccountForSelection, UIAccountForSelection, BuildupOrderForSelection, UIOrderForSelection, UICommonLabelEnum,
  FinanceLoanCalAPIInput, DocumentType, IAccountCategoryFilter, AccountExtraLoan,
  momentDateFormat, financeTranTypeLendTo, financeTranTypeBorrowFrom, costObjectValidator,
} from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService, AuthService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent, popupDialog, } from '../../message-dialog';

@Component({
  selector: 'hih-document-loan-create',
  templateUrl: './document-loan-create.component.html',
  styleUrls: ['./document-loan-create.component.scss'],
})
export class DocumentLoanCreateComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  public loanType: number;

  public documentTitle: string;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  public arUIOrder: UIOrderForSelection[] = [];
  public uiOrderFilter: boolean | undefined;
  // Variables
  arControlCenters: ControlCenter[];
  arOrders: Order[];
  arTranTypes: TranType[];
  arAccounts: Account[];
  arDocTypes: DocumentType[];
  arCurrencies: Currency[];
  curMode: UIMode = UIMode.Create;

  // Stepper
  @ViewChild(MatHorizontalStepper, {static: true}) _stepper: MatHorizontalStepper;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  // Step: Extra Info
  public extraFormGroup: FormGroup;
  // Step: Confirm
  public confirmInfo: any = {};

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _uiStatusService: UIStatusService,
    private _activateRoute: ActivatedRoute,
    private _authService: AuthService,
    private _cdr: ChangeDetectorRef,
    private _homedefService: HomeDefDetailService,
    private _storageService: FinanceStorageService,
    private _currService: FinCurrencyService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent constructor...');
    }
    this.loanType = financeDocTypeBorrowFrom;
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
    this.firstFormGroup = new FormGroup({
      headerControl: new FormControl('', Validators.required),
      amountControl: new FormControl('', Validators.required),
      accountControl: new FormControl('', Validators.required),
      ccControl: new FormControl(''),
      orderControl: new FormControl(''),
    }, [costObjectValidator]);
    this.extraFormGroup = new FormGroup({
      loanAccountControl: new FormControl('', Validators.required),
    });

    forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllDocTypes(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._currService.fetchAllCurrencies(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((rst: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent ngOnInit for activateRoute URL: ${rst.length}`);
      }

      this.arDocTypes = rst[1];
      this.arTranTypes = rst[2];
      this.arAccounts = rst[3];
      this.arControlCenters = rst[4];
      this.arOrders = rst[5];
      this.arCurrencies = rst[6];

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this.arAccounts, rst[0]);
      this.uiAccountStatusFilter = undefined;
      this.uiAccountCtgyFilter = undefined;
      // Orders
      this.arUIOrder = BuildupOrderForSelection(this.arOrders, true);
      this.uiOrderFilter = undefined;

      this._activateRoute.url.subscribe((x: any) => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'createbrwfrm') {
            this.loanType = financeDocTypeBorrowFrom;
          } else if (x[0].path === 'createlendto') {
            this.loanType = financeDocTypeLendTo;
          }

          if (this.loanType === financeDocTypeBorrowFrom) {
            this.documentTitle = 'Sys.DocTy.BorrowFrom';
          } else if (this.loanType === financeDocTypeLendTo) {
            this.documentTitle = 'Sys.DocTy.LendTo';
          }
        }

        this._cdr.detectChanges();
      });
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering DocumentLoanCreateComponent ngOnInit, failed in forkJoin : ${error}`);
      }
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        undefined, error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent ngOnDestroy...');
    }
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onReset(): void {
    if (this._stepper) {
      this._stepper.reset();
    }
    this.firstFormGroup.reset();
    this.extraFormGroup.reset();
    // Confirm
    this.confirmInfo = {};
  }

  onSubmit(): void {
    // Do the real submit
    let docObj: Document = this._generateDocument();

    // Check!
    if (!docObj.onVerify({
      ControlCenters: this.arControlCenters,
      Orders: this.arOrders,
      Accounts: this.arAccounts,
      DocumentTypes: this.arDocTypes,
      TransactionTypes: this.arTranTypes,
      Currencies: this.arCurrencies,
      BaseCurrency: this._homedefService.ChosedHome.BaseCurrency,
    })) {
      // Show a dialog for error details
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        undefined, docObj.VerifiedMsgs);

      return;
    }

    let acntobj: Account = new Account();
    acntobj.HID = this._homedefService.ChosedHome.ID;
    acntobj.CategoryId = this.loanType;
    acntobj.Name = docObj.Desp;
    acntobj.Comment = docObj.Desp;
    acntobj.OwnerId = this._authService.authSubject.getValue().getUserId();
    acntobj.ExtraInfo = this.extraFormGroup.get('loanAccountControl').value as AccountExtraLoan;

    this._storageService.createLoanDocument(docObj, acntobj).subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent, onSubmit, createLoanDocument`);
      }

      // Navigate back to list view
      // Show the snackbar
      let recreate: boolean = false;
      let snackbarRef: any = this._snackbar.open(this._uiStatusService.getUILabel(UICommonLabelEnum.DocumentPosted),
        this._uiStatusService.getUILabel(UICommonLabelEnum.CreateAnotherOne), {
          duration: 2000,
        });

      snackbarRef.onAction().subscribe(() => {
        recreate = true;
        this.onReset();
      });

      snackbarRef.afterDismissed().subscribe(() => {
        if (!recreate) {
          this._router.navigate(['/finance/document/display/' + x.Id.toString()]);
        }
      });
    }, (error: any) => {
      // Show error message
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    });
  }

  public onStepSelectionChange(event: StepperSelectionEvent): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug(`AC_HIH_UI [Debug]: Entering DocumentLoanCreateComponent onStepSelectionChange with index = ${event.selectedIndex}`);
    }

    if (event.selectedIndex === 1) {
      // Update the confirm info.
      let doc: Document = this.firstFormGroup.get('headerControl').value;
      this.confirmInfo.tranDateString = doc.TranDateFormatString;
      this.confirmInfo.tranDesp = doc.Desp;
      this.confirmInfo.tranCurrency = doc.TranCurr;
      this.confirmInfo.tranAmount = this.firstFormGroup.get('amountControl').value;
      this.confirmInfo.controlCenterID = this.firstFormGroup.get('ccControl').value;
      this.confirmInfo.orderID = this.firstFormGroup.get('orderControl').value;
    }
  }

  private _generateDocument(): Document {
    let doc: Document = this.firstFormGroup.get('headerControl').value;
    doc.HID = this._homedefService.ChosedHome.ID;
    doc.DocType = this.loanType;

    let fitem: DocumentItem = new DocumentItem();
    fitem.ItemId = 1;
    fitem.AccountId = this.firstFormGroup.get('accountControl').value;
    fitem.ControlCenterId = this.firstFormGroup.get('ccControl').value;
    fitem.OrderId = this.firstFormGroup.get('orderControl').value;
    if (this.loanType === financeDocTypeLendTo) {
      fitem.TranType = financeTranTypeLendTo;
    } else {
      fitem.TranType = financeTranTypeBorrowFrom;
    }
    fitem.TranAmount = this.firstFormGroup.get('amountControl').value;
    fitem.Desp = doc.Desp;
    doc.Items.push(fitem);

    return doc;
  }
}
