import { UICommonLabelEnum, QuestionBankTypeEnum, TagTypeEnum, OverviewScopeEnum, RepeatFrequencyEnum } from './common';
import { AccountStatusEnum, RepaymentMethodEnum } from './financemodel';
import { EnPOSEnum } from './learnmodel';
import { ReactiveFormsModule } from '@angular/forms';

/**
 * UI Status
 */
export enum UIStatusEnum {
  NotLogin = 0,
  LoggedinNoHomeChosen = 1,
  LoggedinAndHomeChosen = 2,
}

/**
 * Navigation item
 */
export interface appNavItems {
  name: string;
  route: string;
}

/**
 * App languages
 */
export interface appLanguage {
  displayas: string;
  value: string;
}

// For credits part
export class CreditsComponent {
  Name: string;
  Version: string;
  Homepage: string;
  GithubRepo: string;
}

// For UI controls
export class UIRadioButton {
  public id: string;
  public name: string;
  public value: any;
  public label: string;
  public checked: boolean;
  public disabled: boolean;
  public arialabel: string;
}

export class UIRadioButtonGroup {
  public selected: UIRadioButton;
  public value: any;
  public disabled: boolean;
}

export class UIRouteLink {
  public title: string;
  public route: string;
  public icon: string;
}

/**
 * Name value pair
 */
export class UINameValuePair<T> {
  name: string;
  value: T;
}

/**
 * UI Display string Enum
 */
export type UIDisplayStringEnum = UICommonLabelEnum | QuestionBankTypeEnum | TagTypeEnum | OverviewScopeEnum | AccountStatusEnum
  | RepaymentMethodEnum | EnPOSEnum | RepeatFrequencyEnum;

/**
 * UI Display string
 */
export class UIDisplayString {
  public value: UIDisplayStringEnum;
  public i18nterm: string;
  public displaystring: string;
}

/**
 * Utility class for UI display string
 */
export class UIDisplayStringUtil {
  public static getUICommonLabelStrings(): Array<UIDisplayString> {
    let arrst: Array<UIDisplayString> = new Array<UIDisplayString>();

    for (let se in UICommonLabelEnum) {
      if (Number.isNaN(+se)) {
      } else {
        arrst.push({
          value: +se,
          i18nterm: UIDisplayStringUtil.getUICommonLabelDisplayString(+se),
          displaystring: ''
        });
      }
    }

    return arrst;
  }

  public static getQuestionBankTypeStrings(): Array<UIDisplayString> {
    let arrst: Array<UIDisplayString> = new Array<UIDisplayString>();

    for (let se in QuestionBankTypeEnum) {
      if (Number.isNaN(+se)) {
      } else {
        arrst.push({
          value: +se,
          i18nterm: UIDisplayStringUtil.getQuestionBankTypeDisplayString(+se),
          displaystring: ''
        });
      }
    }

    return arrst;
  }

  public static getTagTypeStrings(): Array<UIDisplayString> {
    let arrst: Array<UIDisplayString> = new Array<UIDisplayString>();

    for (let se in TagTypeEnum) {
      if (Number.isNaN(+se)) {
      } else {
        arrst.push({
          value: +se,
          i18nterm: UIDisplayStringUtil.getTagTypeDisplayString(+se),
          displaystring: ''
        });
      }
    }

    return arrst;
  }

  public static getOverviewScopeStrings(): Array<UIDisplayString> {
    let arrst: Array<UIDisplayString> = new Array<UIDisplayString>();

    for (let se in OverviewScopeEnum) {
      if (Number.isNaN(+se)) {
      } else {
        arrst.push({
          value: +se,
          i18nterm: UIDisplayStringUtil.getOverviewScopeDisplayString(+se),
          displaystring: ''
        });
      }
    }

    return arrst;
  }

  public static getAccountStatusStrings(): Array<UIDisplayString> {
    let arrst: Array<UIDisplayString> = new Array<UIDisplayString>();

    for (let se in AccountStatusEnum) {
      if (Number.isNaN(+se)) {
      } else {
        arrst.push({
          value: +se,
          i18nterm: UIDisplayStringUtil.getAccountStatusDisplayString(+se),
          displaystring: ''
        });
      }
    }

    return arrst;
  }

  public static getRepaymentMethodStrings(): Array<UIDisplayString> {
    let arrst: Array<UIDisplayString> = new Array<UIDisplayString>();

    for (let se in RepaymentMethodEnum) {
      if (Number.isNaN(+se)) {
      } else {
        arrst.push({
          value: +se,
          i18nterm: UIDisplayStringUtil.getRepaymentMethodDisplayString(+se),
          displaystring: ''
        });
      }
    }

    return arrst;
  }

  public static getEnPOSStrings(): Array<UIDisplayString> {
    let arrst: Array<UIDisplayString> = new Array<UIDisplayString>();
    
    for (let pe in EnPOSEnum) {
      // if (Number.isNaN(+pe)) {
      // } else {
        arrst.push({
          value: +pe,
          i18nterm: UIDisplayStringUtil.getEnPOSDisplayString(<EnPOSEnum>pe),
          displaystring: ''
        });
      // }
    }

    return arrst;
  }

  public static getRepeatFrequencyDisplayStrings(): Array<UIDisplayString> {
    let arrst: Array<UIDisplayString> = new Array<UIDisplayString>();
    
    for (let rfe in RepeatFrequencyEnum) {
      if (Number.isNaN(+rfe)) {
      } else {
        arrst.push({
          value: +rfe,
          i18nterm: UIDisplayStringUtil.getRepeatFrequencyDisplayString(<RepeatFrequencyEnum>+rfe),
          displaystring: ''
        });
      }
    }

    return arrst;
  }
  
  // Get display string for each enum  
  public static getUICommonLabelDisplayString(le: UICommonLabelEnum): string {
    switch (le) {
      case UICommonLabelEnum.DocumentPosted:
        return 'Finance.DocumentPosted';

      case UICommonLabelEnum.CreateAnotherOne:
        return 'Common.CreateAnotherOne';

      case UICommonLabelEnum.CreatedSuccess:
        return 'Common.CreatedSuccessfully';

      case UICommonLabelEnum.Category:
        return 'Common.Category';

      case UICommonLabelEnum.User:
        return 'Login.User';

      case UICommonLabelEnum.Count:
        return 'Common.Count';

      case UICommonLabelEnum.Total:
        return 'Common.Total';

      case UICommonLabelEnum.DeleteConfirmTitle:
        return 'Common.DeleteConfirmation';

      case UICommonLabelEnum.DeleteConfrimContent:
        return 'Common.ConfirmToDeleteSelectedItem';

      case UICommonLabelEnum.Error:
        return 'Common.Error';
        
      case UICommonLabelEnum.ChartLegend:
        return 'Common.ChartLegend';
        
      default:
        return '';
    }
  }

  public static getQuestionBankTypeDisplayString(se: QuestionBankTypeEnum): string {
    switch (se) {
      case QuestionBankTypeEnum.EssayQuestion:
        return 'Learning.EssayQuestion';

      case QuestionBankTypeEnum.MultipleChoice:
        return 'Learning.MultipleChoice';

      default:
        return '';
    }
  }

  public static getTagTypeDisplayString(se: TagTypeEnum): string {
    switch (se) {
      case TagTypeEnum.FinanceDocumentItem:
        return 'Finance.Document';

      case TagTypeEnum.LearnQuestionBank:
        return 'Learning.QuestionBank';

      default:
        return '';
    }
  }

  public static getOverviewScopeDisplayString(se: OverviewScopeEnum): string {
    switch (se) {
      case OverviewScopeEnum.CurrentMonth:
        return 'Common.CurrentMonth';

      case OverviewScopeEnum.CurrentYear:
        return 'Common.CurrentYear';

      case OverviewScopeEnum.PreviousMonth:
        return 'Common.PreviousMonth';

      case OverviewScopeEnum.PreviousYear:
        return 'Common.PreviousYear';

      case OverviewScopeEnum.CurrentQuarter:
        return 'Common.CurrentQuarter';
      
      case OverviewScopeEnum.PreviousQuarter:
        return 'Common.PreviousQuarter';

      case OverviewScopeEnum.CurrentWeek:
        return 'Common.CurrentWeek';
      
      case OverviewScopeEnum.PreviousWeek:
        return 'Common.PreviousWeek';

      case OverviewScopeEnum.All:
        return 'Common.All';

      default:
        return '';
    }
  }

  public static getAccountStatusDisplayString(stat: AccountStatusEnum): string {
    switch (stat) {
      case AccountStatusEnum.Normal: return 'Finance.AccountStatusNormal';
      case AccountStatusEnum.Closed: return 'Finance.AccountStatusClosed';
      case AccountStatusEnum.Frozen: return 'Finance.AccountStatusFrozen';
      default: return '';
    }
  }

  public static getRepaymentMethodDisplayString(pm: RepaymentMethodEnum): string {
    switch (pm) {
      case RepaymentMethodEnum.EqualPrincipal: return 'Finance.EqualPrincipal';
      case RepaymentMethodEnum.EqualPrincipalAndInterset: return 'Finance.EqualPrincipalAndInterest';
      case RepaymentMethodEnum.DueRepayment: return 'Finance.DueRepayment';
      default: return '';
    }
  }

  public static getEnPOSDisplayString(ep: EnPOSEnum): string {
    switch(ep) {
      case EnPOSEnum.n: return 'Sys.EnPOS.n';
      case EnPOSEnum.pron: return 'Sys.EnPOS.pron';
      case EnPOSEnum.adj: return 'Sys.EnPOS.adj';
      case EnPOSEnum.adv: return 'Sys.EnPOS.adv';
      case EnPOSEnum.v: return 'Sys.EnPOS.v';
      case EnPOSEnum.num: return 'Sys.EnPOS.num';
      case EnPOSEnum.art: return 'Sys.EnPOS.art';
      case EnPOSEnum.prep: return 'Sys.EnPOS.prep';
      case EnPOSEnum.conj: return 'Sys.EnPOS.conj';
      case EnPOSEnum.interj: return 'Sys.EnPOS.interj';
      case EnPOSEnum.vt: return 'Sys.EnPOS.vt';
      case EnPOSEnum.vi: return 'Sys.EnPOS.vi';
      default: return '';
    }
  }

  public static getRepeatFrequencyDisplayString(frq: RepeatFrequencyEnum): string {
    switch (frq) {
      case RepeatFrequencyEnum.Day: return 'RepeatFrequency.Day';
      case RepeatFrequencyEnum.Month: return 'RepeatFrequency.Month';
      case RepeatFrequencyEnum.Fortnight: return 'RepeatFrequency.Fortnight';
      case RepeatFrequencyEnum.Manual:  return 'RepeatFrequency.Manual';
      case RepeatFrequencyEnum.HalfYear: return 'RepeatFrequency.HalfYear';
      case RepeatFrequencyEnum.Year: return 'RepeatFrequency.Year';
      case RepeatFrequencyEnum.Quarter: return 'RepeatFrequency.Quarter';
      case RepeatFrequencyEnum.Week: return 'RepeatFrequency.Week';
      default: return '';
    }
  }
}
