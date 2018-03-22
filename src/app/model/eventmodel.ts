import { environment } from '../../environments/environment';
import * as hih from './common';
import * as moment from 'moment';

export class FinanceEvent {
  private _tranDate: moment.Moment;
  public ADPDocId: number;
  public Desp: string;

  get TranDate(): moment.Moment {
    return this._tranDate;
  }
  set TranDate(td: moment.Moment) {
    this._tranDate = td;
  }
}

/**
 * General event
 */
export class GeneralEvent extends hih.BaseModel {
  private _id: number;
  private _hid: number;
  private _assignee: string;
  private _name: string;
  private _content: string;
  private _startTime: moment.Moment;
  private _endTime: moment.Moment;
  private _completeTime: moment.Moment;
  private _ispublic: boolean;
  private _refRecurID: number;

  get ID(): number {
    return this._id;
  }
  set ID(id: number) {
    this._id = id;
  }
  get HID(): number {
    return this._hid;
  }
  set HID(hid: number) {
    this._hid = hid;
  }
  get Assignee(): string {
    return this._assignee;
  }
  set Assignee(asgnee: string) {
    this._assignee = asgnee;
  }
  get Name(): string {
    return this._name;
  }
  set Name(name: string) {
    this._name = name;
  }
  get Content(): string {
    return this._content;
  }
  set Content(content: string) {
    this._content = content;
  }
  get StartTime(): moment.Moment {
    return this._startTime;
  }
  set StartTime(st: moment.Moment) {
    this._startTime = st;
  }
  get StartTimeFormatString(): string {
    if (this._startTime) {
      return this._startTime.format(hih.MomentDateFormat);
    }

    return '';
  }
  get EndTime(): moment.Moment {
    return this._endTime;
  }
  set EndTime(et: moment.Moment) {
    this._endTime = et;
  }
  get EndTimeFormatString(): string {
    if (this._endTime) {
      return this._endTime.format(hih.MomentDateFormat);
    }

    return '';
  }
  get CompleteTime(): moment.Moment {
    return this._completeTime;
  }
  set CompleteTime(ct: moment.Moment) {
    this._completeTime = ct;
  }
  get CompleteTimeFormatString(): string {
    if (this._completeTime) {
      return this._completeTime.format(hih.MomentDateFormat);
    }

    return '';
  }
  get IsComplete(): boolean {
    return !this._completeTime;
  }
  get IsPublic(): boolean {
    return this._ispublic;
  }
  set IsPublic(ip: boolean) {
    this._ispublic = ip;
  }
  get RefRecurID(): number {
    return this._refRecurID;
  }
  set RefRecurID(rid: number) {
    this._refRecurID = rid;
  }

  constructor() {
    super();

    this.StartTime = moment();
    this._endTime = undefined;
    this._completeTime = undefined;
    this._ispublic = false;
  }

  onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.id) {
      this._id = +data.id;
    }
    if (data && data.hid) {
      this._hid = +data.hid;
    }
    if (data && data.name) {
      this._name = data.name;
    }
    if (data && data.assignee) {
      this._assignee = data.assignee;
    }
    if (data && data.content) {
      this._content = data.content;
    }
    if (data && data.startTimePoint) {
      this._startTime = moment(data.startTimePoint, hih.MomentDateFormat);
    }
    if (data && data.endTimePoint) {
      this._endTime = moment(data.endTimePoint, hih.MomentDateFormat);
    }
    if (data && data.completeTimePoint) {
      this._completeTime = moment(data.completeTimePoint, hih.MomentDateFormat);
    }
    if (data && data.isPublic) {
      this._ispublic = data.isPublic;
    }
    if (data && data.refRecurrID) {
      this._refRecurID = data.refRecurrID;
    }
  }

  writeJSONObject(): any {
    let robj: any = super.writeJSONObject();
    robj.id = this._id;
    robj.hid = this._hid;
    robj.name = this._name;
    if (this._assignee) {
      robj.assignee = this._assignee;
    }
    robj.content = this._content;
    robj.startTimePoint = this.StartTimeFormatString;
    if (this._endTime) {
      robj.endTimePoint = this.EndTimeFormatString;
    }
    if (this._completeTime) {
      robj.completeTimePoint = this.CompleteTimeFormatString;
    }
    robj.isPublic = this._ispublic;
    if (this._refRecurID) {
      robj.refRecurrID = this._refRecurID;
    }
    return robj;
  }
}

/**
 * Recur event
 */
export class RecurEvent extends hih.BaseModel {
  private _id: number;
  private _hid: number;
  private _assignee: string;
  private _name: string;
  private _content: string;
  private _startTime: moment.Moment;
  private _endTime: moment.Moment;
  private _ispublic: boolean;

  public RepeatType: hih.RepeatFrequencyEnum;
  get ID(): number {
    return this._id;
  }
  set ID(id: number) {
    this._id = id;
  }
  get HID(): number {
    return this._hid;
  }
  set HID(hid: number) {
    this._hid = hid;
  }
  get Assignee(): string {
    return this._assignee;
  }
  set Assignee(asgnee: string) {
    this._assignee = asgnee;
  }
  get Name(): string {
    return this._name;
  }
  set Name(name: string) {
    this._name = name;
  }
  get Content(): string {
    return this._content;
  }
  set Content(content: string) {
    this._content = content;
  }
  get StartTime(): moment.Moment {
    return this._startTime;
  }
  set StartTime(st: moment.Moment) {
    this._startTime = st;
  }
  get StartTimeFormatString(): string {
    if (this._startTime) {
      return this._startTime.format(hih.MomentDateFormat);
    }

    return '';
  }
  get EndTime(): moment.Moment {
    return this._endTime;
  }
  set EndTime(et: moment.Moment) {
    this._endTime = et;
  }
  get EndTimeFormatString(): string {
    if (this._endTime) {
      return this._endTime.format(hih.MomentDateFormat);
    }

    return '';
  }
  get IsPublic(): boolean {
    return this._ispublic;
  }
  set IsPublic(ip: boolean) {
    this._ispublic = ip;
  }

  constructor() {
    super();

    this.StartTime = moment();
    this._endTime = undefined;
    this._ispublic = false;
  }

  onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.id) {
      this._id = +data.id;
    }
    if (data && data.hid) {
      this._hid = +data.hid;
    }
    if (data && data.name) {
      this._name = data.name;
    }
    if (data && data.assignee) {
      this._assignee = data.assignee;
    }
    if (data && data.content) {
      this._content = data.content;
    }
    if (data && data.startTimePoint) {
      this._startTime = moment(data.startTimePoint, hih.MomentDateFormat);
    }
    if (data && data.endTimePoint) {
      this._endTime = moment(data.endTimePoint, hih.MomentDateFormat);
    }
    if (data && data.isPublic) {
      this._ispublic = data.isPublic;
    }
    if (data && data.rptType) {
      this.RepeatType = data.rptType;
    } else {
      this.RepeatType = hih.RepeatFrequencyEnum.Month;
    }
  }

  writeJSONObject(): any {
    let robj: any = super.writeJSONObject();
    robj.id = this._id;
    robj.hid = this._hid;
    robj.name = this._name;
    if (this._assignee) {
      robj.assignee = this._assignee;
    }
    robj.content = this._content;
    robj.startTimePoint = this.StartTimeFormatString;
    if (this._endTime) {
      robj.endTimePoint = this.EndTimeFormatString;
    }
    robj.isPublic = this._ispublic;
    robj.rptType = this.RepeatType;
    return robj;
  }
}

/**
 * Habit event
 */
export class EventHabit extends hih.BaseModel {
  private _id: number;
  private _hid: number;
  private _name: string;
  private _startDate: moment.Moment;
  private _endDate: moment.Moment;
  public repeatType: hih.RepeatFrequencyEnum;
  public content: string;
  public count: number;
  public isPublic: boolean;
  public assignee: string;
  public details: EventHabitDetail[] = [];

  get ID(): number {
    return this._id;
  }
  set ID(id: number) {
    this._id = id;
  }
  get HID(): number {
    return this._hid;
  }
  set HID(hid: number) {
    this._hid = hid;
  }
  get Name(): string {
    return this._name;
  }
  set Name(name: string) {
    this._name = name;
  }
  get StartDate(): moment.Moment {
    return this._startDate;
  }
  get StartDateDisplayString(): string {
    return this._startDate.format(hih.MomentDateFormat);
  }
  set StartDate(sd: moment.Moment) {
    this._startDate = sd;
  }
  get EndDate(): moment.Moment {
    return this._endDate;
  }
  get EndDateDisplayString(): string {
    return this._endDate.format(hih.MomentDateFormat);
  }
  set EndDate(ed: moment.Moment) {
    this._endDate = ed;
  }

  onSetData(data: any): void {
    super.onSetData(data);

    if (data && data.id) {
      this._id = +data.id;
    }
    if (data && data.hid) {
      this._hid = +data.hid;
    }
    if (data && data.name) {
      this._name = data.name;
    }
    if (data && data.assignee) {
      this.assignee = data.assignee;
    }
    if (data && data.content) {
      this.content = data.content;
    }
    if (data && data.count) {
      this.count = data.count;
    }
    if (data && data.startDate) {
      this._startDate = moment(data.startDate, hih.MomentDateFormat);
    }
    if (data && data.endDate) {
      this._endDate = moment(data.endDate, hih.MomentDateFormat);
    }
    if (data && data.isPublic) {
      this.isPublic = data.isPublic;
    }
    if (data && data.rptType) {
      this.repeatType = data.rptType;
    } else {
      this.repeatType = hih.RepeatFrequencyEnum.Month;
    }

    if (data && data.details) {
      this.details = [];
      for (let dtl of data.details) {
        let detail: EventHabitDetail = new EventHabitDetail();
        detail.onSetData(dtl);
        this.details.push(detail);
      }
    }
  }

  writeJSONObject(): any {
    let robj: any = super.writeJSONObject();
    robj.id = this._id;
    robj.hid = this._hid;
    robj.name = this._name;
    if (this.assignee) {
      robj.assignee = this.assignee;
    }
    robj.content = this.content;
    robj.startDate = this.StartDateDisplayString;
    robj.endDate = this.EndDateDisplayString;
    robj.isPublic = this.isPublic;
    robj.rptType = this.repeatType;
    robj.count = this.count;

    return robj;
  }
}

export class EventHabitDetail {
  private _id: number;
  private _habitID: number;
  private _startDate: moment.Moment;
  private _endDate: moment.Moment;

  get ID(): number {
    return this._id;
  }
  set ID(id: number) {
    this._id = id;
  }
  get HabitID(): number {
    return this._habitID;
  }
  set HID(hid: number) {
    this._habitID = hid;
  }
  get StartDate(): moment.Moment {
    return this._startDate;
  }
  get StartDateDisplayString(): string {
    return this._startDate.format(hih.MomentDateFormat);
  }
  set StartDate(sd: moment.Moment) {
    this._startDate = sd;
  }
  get EndDate(): moment.Moment {
    return this._endDate;
  }
  get EndDateDisplayString(): string {
    return this._endDate.format(hih.MomentDateFormat);
  }
  set EndDate(ed: moment.Moment) {
    this._endDate = ed;
  }

  onSetData(data: any): void {
    if (data && data.id) {
      this._id = +data.id;
    }
    if (data && data.habitID) {
      this._habitID = +data.habitID;
    }
    if (data && data.startDate) {
      this._startDate = moment(data.startDate, hih.MomentDateFormat);
    }
    if (data && data.endDate) {
      this._endDate = moment(data.endDate, hih.MomentDateFormat);
    }
  }
}

export class EventHabitCheckin {

}
