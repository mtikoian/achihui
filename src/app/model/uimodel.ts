import { environment } from '../../environments/environment';
import * as hih from './common';
import * as HIHFinance from './financemodel';
import * as moment from 'moment';

/**
 * Transfer document in UI part
 */
export class UIFinTransferDocument {
  private _desp: string;
  private _tranAmount: number;
  private _tranCurr: string;
  private _exgRate: number;
  private _exgRatePlan: boolean;

  public TranDate: moment.Moment;
  get TranAmount(): number {
    return this._tranAmount;
  }
  set TranAmount(amt: number) {
    this._tranAmount = amt;
  }
  get Desp(): string {
    return this._desp;
  }
  set Desp(dsp: string) {
    this._desp = dsp;
  }
  get TranCurr(): string {
    return this._tranCurr;
  }
  set TranCurr(tcur: string) {
    this._tranCurr = tcur;
  }
  get ExgRate(): number {
    return this._exgRate;
  }
  set ExgRate(er: number) {
    this._exgRate = er;
  }
  get ExgRate_Plan(): boolean {
    return this._exgRatePlan;
  }
  set ExgRate_Plan(ep: boolean) {
    this._exgRatePlan = ep;
  }

  public SourceAccountId: number;
  public TargetAccountId: number;
  public SourceControlCenterId: number;
  public TargetControlCenterId: number;
  public SourceOrderId: number;
  public TargetOrderId: number;

  constructor() {
    this.TranDate = moment();
  }

  public generateDocument(): HIHFinance.Document {
    let doc: HIHFinance.Document = new HIHFinance.Document();
    doc.DocType = hih.financeDocTypeTransfer;
    doc.TranDate = this.TranDate.clone();
    doc.Desp = this.Desp;
    doc.TranCurr = this.TranCurr;
    if (this.ExgRate) {
      doc.ExgRate = this.ExgRate;
    }
    if (this.ExgRate_Plan) {
      doc.ExgRate_Plan = this.ExgRate_Plan;
    }

    let docitem: HIHFinance.DocumentItem = new HIHFinance.DocumentItem();
    docitem.ItemId = 1;
    docitem.AccountId = this.SourceAccountId;
    docitem.ControlCenterId = this.SourceControlCenterId;
    docitem.OrderId = this.SourceOrderId;
    docitem.TranType = hih.financeTranTypeTransferOut;
    docitem.TranAmount = this.TranAmount;
    docitem.Desp = this.Desp;
    doc.Items.push(docitem);

    docitem = new HIHFinance.DocumentItem();
    docitem.ItemId = 2;
    docitem.AccountId = this.TargetAccountId;
    docitem.TranType = hih.financeTranTypeTransferIn;
    docitem.ControlCenterId = this.TargetControlCenterId;
    docitem.OrderId = this.TargetOrderId;
    docitem.TranAmount = this.TranAmount;
    docitem.Desp = this.Desp;
    doc.Items.push(docitem);

    return doc;
  }

  public parseDocument(doc: HIHFinance.Document): void {
    this.TranDate = doc.TranDate;
    this.TranCurr = doc.TranCurr;
    this.Desp = doc.Desp;
    if (doc.ExgRate) {
      this.ExgRate = doc.ExgRate;
    }
    if (doc.ExgRate_Plan) {
      this.ExgRate_Plan = doc.ExgRate_Plan;
    }

    for (let di of doc.Items) {
      if (di.TranType === hih.financeTranTypeTransferOut) {
        this.SourceAccountId = di.AccountId;
        this.SourceControlCenterId = di.ControlCenterId;
        this.SourceOrderId = di.OrderId;
        this.TranAmount = di.TranAmount;
      } else if (di.TranType === hih.financeTranTypeTransferIn) {
        this.TargetAccountId = di.AccountId;
        this.TargetControlCenterId = di.ControlCenterId;
        this.TargetOrderId = di.OrderId;
      }
    }
  }
}

/**
 * Advance payment: UI part
 */
export class UIFinAdvPayDocument {
  private _desp: string;
  private _tranAmount: number;
  private _tranCurr: string;
  public TranDate: moment.Moment;
  get TranAmount(): number {
    return this._tranAmount;
  }
  set TranAmount(amt: number) {
    this._tranAmount = amt;
  }
  get Desp(): string {
    return this._desp;
  }
  set Desp(dsp: string) {
    this._desp = dsp;
  }
  get TranCurr(): string {
    return this._tranCurr;
  }
  set TranCurr(tcur: string) {
    this._tranCurr = tcur;
  }

  public SourceTranType: number;
  public SourceAccountId: number;
  public SourceControlCenterId: number;
  public SourceOrderId: number;

  public AdvPayAccount: HIHFinance.AccountExtraAdvancePayment;

  constructor() {
    this.AdvPayAccount = new HIHFinance.AccountExtraAdvancePayment();
    this.TranDate = moment();
  }
  public generateDocument(isADP?: boolean): HIHFinance.Document {
    let doc: HIHFinance.Document = new HIHFinance.Document();
    if (isADP) {
      doc.DocType = hih.financeDocTypeAdvancePayment;
    } else {
      doc.DocType = hih.financeDocTypeAdvanceReceived;
    }
    doc.Desp = this.Desp;
    doc.TranCurr = this.TranCurr;
    doc.TranDate = this.TranDate.clone();

    let fitem: HIHFinance.DocumentItem = new HIHFinance.DocumentItem();
    fitem.ItemId = 1;
    fitem.AccountId = this.SourceAccountId;
    fitem.ControlCenterId = this.SourceControlCenterId;
    fitem.OrderId = this.SourceOrderId;
    if (isADP) {
      fitem.TranType = hih.financeTranTypeOpeningAsset;
    } else {
      fitem.TranType = hih.financeTranTypeOpeningLiability;
    }
    fitem.TranType = this.SourceTranType;
    fitem.TranAmount = this.TranAmount;
    fitem.Desp = this.Desp;
    doc.Items.push(fitem);

    return doc;
  }

  public parseDocument(doc: HIHFinance.Document | any): void {
    if (doc instanceof HIHFinance.Document) {
      this.TranDate = doc.TranDate.clone();
      this.TranCurr = doc.TranCurr;
      this.Desp = doc.Desp;

      if (doc.Items.length < 0) {
        throw Error('Failed to parse document');
      }

      let idx: number = doc.Items.findIndex((item: HIHFinance.DocumentItem) => {
        return item.TranType !== hih.financeTranTypeOpeningAsset
          && item.TranType !== hih.financeTranTypeOpeningLiability;
      });
      if (idx === -1) {
        throw Error('Failed to parse document');
      }
      let fitem: HIHFinance.DocumentItem = doc.Items[idx];
      this.SourceAccountId = fitem.AccountId;
      this.SourceControlCenterId = fitem.ControlCenterId;
      this.SourceOrderId = fitem.OrderId;
      this.TranAmount = fitem.TranAmount;
      this.SourceTranType = fitem.TranType;
    } else {
      let docobj: HIHFinance.Document = new HIHFinance.Document();
      docobj.onSetData(doc);
      let acntobj: HIHFinance.Account = new HIHFinance.Account();
      acntobj.onSetData(doc.accountVM);

      this.TranDate = docobj.TranDate.clone();
      this.TranCurr = docobj.TranCurr;
      this.Desp = docobj.Desp;

      if (docobj.Items.length < 0) {
        throw Error('Failed to parse document');
      }
      let idx: number = docobj.Items.findIndex((item: HIHFinance.DocumentItem) => {
        return item.TranType !== hih.financeTranTypeOpeningAsset
          && item.TranType !== hih.financeTranTypeOpeningLiability;
      });
      if (idx === -1) {
        throw Error('Failed to parse document');
      }
      let fitem: any = docobj.Items[idx];
      this.SourceAccountId = +fitem.AccountId;
      this.SourceControlCenterId = +fitem.ControlCenterId;
      this.SourceOrderId = +fitem.OrderId;
      this.SourceTranType = +fitem.TranType;
      this.TranAmount = +fitem.TranAmount;

      this.AdvPayAccount.onSetData(doc.accountVM.extraInfo_ADP);
    }
  }
}

/**
 * Currency exchange document in UI part
 */
export class UIFinCurrencyExchangeDocument {
  private _desp: string;
  public TranDate: moment.Moment;
  get Desp(): string {
    return this._desp;
  }
  set Desp(dsp: string) {
    this._desp = dsp;
  }

  public SourceTranCurr: string;
  public TargetTranCurr: string;
  public SourceExchangeRate: number;
  public TargetExchangeRate: number;
  // For exchange document, the exchange rate must know!
  // public SourceExchangeRatePlan: boolean;
  // public TargetExchangeRatePlan: boolean;
  public SourceTranAmount: number;
  public TargetTranAmount: number;
  public SourceAccountId: number;
  public TargetAccountId: number;
  public SourceControlCenterId: number;
  public TargetControlCenterId: number;
  public SourceOrderId: number;
  public TargetOrderId: number;

  public prvdocs: HIHFinance.DocumentWithPlanExgRate[] = [];

  constructor() {
    this.TranDate = moment();
  }

  public generateDocument(): HIHFinance.Document {
    let doc: HIHFinance.Document = new HIHFinance.Document();
    doc.DocType = hih.financeDocTypeCurrencyExchange;
    doc.Desp = this.Desp;
    doc.TranCurr = this.SourceTranCurr;
    doc.TranCurr2 = this.TargetTranCurr;
    doc.ExgRate = this.SourceExchangeRate;
    doc.ExgRate2 = this.TargetExchangeRate;

    let docitem: HIHFinance.DocumentItem = new HIHFinance.DocumentItem();
    docitem.ItemId = 1;
    docitem.AccountId = this.SourceAccountId;
    docitem.ControlCenterId = this.SourceControlCenterId;
    docitem.OrderId = this.SourceOrderId;
    docitem.TranType = hih.financeTranTypeTransferOut;
    docitem.TranAmount = this.SourceTranAmount;
    docitem.Desp = this.Desp;
    doc.Items.push(docitem);

    docitem = new HIHFinance.DocumentItem();
    docitem.ItemId = 2;
    docitem.AccountId = this.TargetAccountId;
    docitem.TranType = hih.financeTranTypeTransferIn;
    docitem.ControlCenterId = this.TargetControlCenterId;
    docitem.OrderId = this.TargetOrderId;
    docitem.TranAmount = this.TargetTranAmount;
    docitem.UseCurr2 = true;
    docitem.Desp = this.Desp;
    doc.Items.push(docitem);

    return doc;
  }

  public parseDocument(doc: HIHFinance.Document): void {
    this.TranDate = doc.TranDate;
    this.Desp = doc.Desp;

    for (let di of doc.Items) {
      if (di.TranType === hih.financeTranTypeTransferOut) {
        this.SourceAccountId = di.AccountId;
        this.SourceControlCenterId = di.ControlCenterId;
        this.SourceOrderId = di.OrderId;
        this.SourceTranAmount = di.TranAmount;
        this.SourceTranCurr = doc.TranCurr;
        this.SourceExchangeRate = doc.ExgRate;
      } else if (di.TranType === hih.financeTranTypeTransferIn) {
        this.TargetAccountId = di.AccountId;
        this.TargetControlCenterId = di.ControlCenterId;
        this.TargetOrderId = di.OrderId;
        this.TargetTranAmount = di.TranAmount;
        this.TargetTranCurr = doc.TranCurr2;
        this.TargetExchangeRate = doc.ExgRate2;
      }
    }
  }
}

/**
 * Asset Operation document in UI part
 */
export class UIFinAssetOperationDocument {
  private _items: HIHFinance.DocumentItem[];
  private _desp: string;
  private _tranCurr: string;
  private _exgRate: number;
  private _exgRatePlan: boolean;
  private _accountAsset: HIHFinance.AccountExtraAsset;
  public isBuyin: boolean;
  public TranDate: moment.Moment;
  get Desp(): string {
    return this._desp;
  }
  set Desp(dsp: string) {
    this._desp = dsp;
  }

  get TranCurr(): string {
    return this._tranCurr;
  }
  set TranCurr(tcurr: string) {
    this._tranCurr = tcurr;
  }
  get ExgRate(): number {
    return this._exgRate;
  }
  set ExgRate(er: number) {
    this._exgRate = er;
  }
  get ExgRate_Plan(): boolean {
    return this._exgRatePlan;
  }
  set ExgRate_Plan(ep: boolean) {
    this._exgRatePlan = ep;
  }

  get AssetAccount(): HIHFinance.AccountExtraAsset {
    return this._accountAsset;
  }
  get Items(): HIHFinance.DocumentItem[] {
    return this._items;
  }

  constructor() {
    this.TranDate = moment();
    this._accountAsset = new HIHFinance.AccountExtraAsset();
    this._items = [];
  }

  public generateDocument(): HIHFinance.Document {
    let doc: HIHFinance.Document = new HIHFinance.Document();
    if (this.isBuyin) {
      doc.DocType = hih.financeDocTypeAssetBuyIn;
    } else {
      doc.DocType = hih.financeDocTypeAssetSoldOut;
    }

    doc.Desp = this.Desp;
    doc.TranCurr = this.TranCurr;
    doc.ExgRate = this.ExgRate;
    doc.ExgRate_Plan = this.ExgRate_Plan;

    this._items.forEach((val: HIHFinance.DocumentItem) => {
      doc.Items.push(val);

    });

    return doc;
  }

  public parseDocument(doc: HIHFinance.Document | any): void {
    if (doc instanceof HIHFinance.Document) {
      this.TranDate = doc.TranDate.clone();
      this.Desp = doc.Desp;
      this.ExgRate = doc.ExgRate;
      this.ExgRate_Plan = doc.ExgRate_Plan;
      this.TranCurr = doc.TranCurr;

      this._items = [];
      doc.Items.forEach((val: HIHFinance.DocumentItem) => {
        this._items.push(val);
      });
    } else {
      let docobj: HIHFinance.Document = new HIHFinance.Document();
      docobj.onSetData(doc);
      let acntobj: HIHFinance.Account = new HIHFinance.Account();
      acntobj.onSetData(doc.accountVM);

      this.TranDate = docobj.TranDate.clone();
      this.Desp = docobj.Desp;
      this.ExgRate = docobj.ExgRate;
      this.ExgRate_Plan = docobj.ExgRate_Plan;
      this.TranCurr = docobj.TranCurr;
      this._items = [];
      docobj.Items.forEach((val: HIHFinance.DocumentItem) => {
        this._items.push(val);
      });

      this.AssetAccount.onSetData(doc.accountVM.extraInfo_AS);
    }
  }
}

/**
 * UI Loan document
 */
export class UIFinLoanDocument {
  private _tranAmount: number;
  private _desp: string;
  private _tranCurr: string;
  private _isLendTo: boolean;

  get TranAmount(): number {
    return this._tranAmount;
  }
  set TranAmount(tamt: number) {
    this._tranAmount = tamt;
  }
  get Desp(): string {
    return this._desp;
  }
  set Desp(dsp: string) {
    this._desp = dsp;
  }
  get TranCurr(): string {
    return this._tranCurr;
  }
  set TranCurr(tcur: string) {
    this._tranCurr = tcur;
  }
  get isLendTo(): boolean {
    return this._isLendTo;
  }
  set isLendTo(ilt: boolean) {
    this._isLendTo = ilt;
  }
  public TranDate: moment.Moment;

  public SourceAccountId: number;
  public SourceControlCenterId: number;
  public SourceOrderId: number;
  public LoanAccount: HIHFinance.AccountExtraLoan;

  constructor() {
    this.LoanAccount = new HIHFinance.AccountExtraLoan();
    this.TranDate = moment();
    this.isLendTo = false;
  }
  public generateDocument(isLendTo?: boolean): HIHFinance.Document {
    let doc: HIHFinance.Document = new HIHFinance.Document();
    if (this.isLendTo) {
      doc.DocType = hih.financeDocTypeLendTo;
    } else {
      doc.DocType = hih.financeDocTypeBorrowFrom;
    }
    doc.Desp = this.Desp;
    doc.TranCurr = this.TranCurr;
    doc.TranDate = this.TranDate.clone();

    let fitem: HIHFinance.DocumentItem = new HIHFinance.DocumentItem();
    fitem.ItemId = 1;
    fitem.AccountId = this.SourceAccountId;
    fitem.ControlCenterId = this.SourceControlCenterId;
    fitem.OrderId = this.SourceOrderId;
    if (isLendTo) {
      fitem.TranType = hih.financeTranTypeLendTo;
    } else {
      fitem.TranType = hih.financeTranTypeBorrowFrom;
    }
    fitem.TranAmount = this.TranAmount;
    fitem.Desp = this.Desp;
    doc.Items.push(fitem);

    return doc;
  }

  public parseDocument(doc: HIHFinance.Document | any, isLendTo?: boolean): void {
    if (doc instanceof HIHFinance.Document) {
      this.TranDate = doc.TranDate.clone();
      this.TranCurr = doc.TranCurr;
      this.Desp = doc.Desp;

      if (doc.Items.length < 0) {
        throw Error('Failed to parse document');
      }

      let fitem: HIHFinance.DocumentItem = doc.Items[0];
      this.SourceAccountId = fitem.AccountId;
      this.SourceControlCenterId = fitem.ControlCenterId;
      this.SourceOrderId = fitem.OrderId;
      this.TranAmount = fitem.TranAmount;
    } else {
      let docobj: HIHFinance.Document = new HIHFinance.Document();
      docobj.onSetData(doc);
      let acntobj: HIHFinance.Account = new HIHFinance.Account();
      acntobj.onSetData(doc.accountVM);

      this.TranDate = docobj.TranDate.clone();
      this.TranCurr = docobj.TranCurr;
      this.Desp = docobj.Desp;

      if (docobj.Items.length < 1) {
        throw new Error('Failed to parse document');
      }

      let itemidx: number = -1;
      if (isLendTo) {
        itemidx = docobj.Items.findIndex((val: HIHFinance.DocumentItem) => {
          return val.TranType === hih.financeTranTypeLendTo;
        });
      } else {
        itemidx = docobj.Items.findIndex((val: HIHFinance.DocumentItem) => {
          return val.TranType === hih.financeTranTypeBorrowFrom;
        });
      }
      if (itemidx === -1) {
        throw new Error('No suitable document');
      }
      let fitem: any = docobj.Items[itemidx];
      this.SourceAccountId = +fitem.AccountId;
      this.SourceControlCenterId = +fitem.ControlCenterId;
      this.SourceOrderId = +fitem.OrderId;
      this.TranAmount = +fitem.TranAmount;

      this.LoanAccount.onSetData(doc.accountVM.extraInfo_Loan);
    }
  }
}

// Nav Item
export class SidenavItem {
  name: string;
  icon: string;
  color: string;
  route: any;
  parent: SidenavItem;
  subItems: SidenavItem[];
  position: number;
  badge: string;
  badgeColor: string;
  customClass: string;

  constructor(model?: any) {
    if (model) {
      this.name = model.name;
      this.icon = model.icon;
      this.color = model.color;
      this.route = model.route;
      this.parent = model.parent;
      this.subItems = this.mapSubItems(model.subItems);
      this.position = model.position;
      this.badge = model.badge;
      this.badgeColor = model.badgeColor;
      this.customClass = model.customClass;
    }
  }

  hasSubItems(): boolean {
    if (this.subItems) {
      return this.subItems.length > 0;
    }

    return false;
  }

  hasParent(): boolean {
    return !!this.parent;
  }

  mapSubItems(list: SidenavItem[]): SidenavItem[] {
    if (list) {
      list.forEach((item: any, index: number) => {
        list[index] = new SidenavItem(item);
      });

      return list;
    }
  }

  isRouteString(): boolean {
    return this.route instanceof String || typeof this.route === 'string';
  }
}

/**
 * Account for selection
 */
export class UIAccountForSelection {
  public Id: number;
  public CategoryId: number;
  public Name: string;
  public CategoryName: string;
  public AssetFlag: boolean;
  public Status: HIHFinance.AccountStatusEnum;
}

/**
 * Buildup accounts for select
 * @param acnts Accounts
 * @param acntctg Account categories
 * @param skipadp Skip ADP accounts
 * @param skiploan Skip Loan accounts
 * @param skipasset Skip Asset accounts
 */
export function BuildupAccountForSelection(acnts: HIHFinance.Account[], acntctg: HIHFinance.AccountCategory[],
  ctgyFilter?: HIHFinance.IAccountCategoryFilter): UIAccountForSelection[] {
  let arrst: UIAccountForSelection[] = [];

  for (let acnt of acnts) {
    let rst: UIAccountForSelection = new UIAccountForSelection();
    rst.CategoryId = acnt.CategoryId;
    rst.Id = acnt.Id;
    rst.Name = acnt.Name;
    rst.Status = acnt.Status;

    // Skip some categories
    if (ctgyFilter !== undefined
      && ctgyFilter.skipADP === true
      && acnt.CategoryId === hih.financeAccountCategoryAdvancePayment) {
      continue;
    }
    if (ctgyFilter !== undefined
      && ctgyFilter.skipLoan === true
      && (acnt.CategoryId === hih.financeAccountCategoryBorrowFrom
      || acnt.CategoryId === hih.financeAccountCategoryLendTo)) {
      continue;
    }
    if (ctgyFilter !== undefined
      && ctgyFilter.skipAsset === true
      && acnt.CategoryId === hih.financeAccountCategoryAsset) {
      continue;
    }

    for (let ctgy of acntctg) {
      if (ctgy.ID === rst.CategoryId) {
        rst.CategoryName = ctgy.Name;
        rst.AssetFlag = ctgy.AssetFlag;
      }
    }

    arrst.push(rst);
  }

  return arrst;
}

/**
 * Order for selection
 */
export class UIOrderForSelection {
  public Id: number;
  public Name: string;
  public _validFrom: moment.Moment;
  public _validTo: moment.Moment;
}

/**
 * Buildup accounts for select
 * @param orders Orders
 * @param skipinv Skip invalid orders
 */
export function BuildupOrderForSelection(orders: HIHFinance.Order[], skipinv?: boolean): UIOrderForSelection[] {
  let arrst: UIOrderForSelection[] = [];

  for (let ord of orders) {
    let rst: UIOrderForSelection = new UIOrderForSelection();
    rst.Id = ord.Id;
    rst.Name = ord.Name;
    rst._validFrom = ord._validFrom.clone();
    rst._validTo = ord._validTo.clone();

    // Skip some categories
    if (skipinv) {
      if (rst._validFrom > moment() || rst._validTo < moment()) {
        continue;
      }
    }

    arrst.push(rst);
  }

  return arrst;
}
