﻿import { DebugLogging } from '../app.setting';
import * as hih from './common';

export class EventItem extends hih.BaseModel {
    public Id: number;
    public Name: string;
    public StartTimepoint: Date;
    public EndTimepoint: Date;
    public Content: string;
    public IsPublic: boolean;
    public Owner: string;
    public RefID: number;
    public Tags: string;

    constructor() {
        super();

        if (DebugLogging) {
            console.log("Entering constructor of EventItem");
        }

        this.StartTimepoint = new Date();
        this.EndTimepoint = new Date();
    }

    public onInit() {
        super.onInit();
        if (DebugLogging) {
            console.log("Entering onInit of EventItem");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of EventItem");
        }
        if (!super.onVerify())
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of EventItem");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (DebugLogging) {
            console.log("Entering onSetData of EventItem");
        }

        super.onSetData(data);

        if (data && data.id) {
            this.Id = +data.id;
        }
        if (data && data.name) {
            this.Name = data.name;
        }
        if (data && data.startTimePoint) {
            this.StartTimepoint = new Date(data.startTimePoint);
        }
        if (data && data.endTimePoint) {
            this.EndTimepoint = new Date(data.endTimePoint);
        }
        if (data && data.content) {
            this.Content = data.content;
        }
        if (data && data.isPublic) {
            this.IsPublic = data.isPublic;
        }
        if (data && data.owner) {
            this.Owner = data.owner;
        }
        if (data && data.refId) {
            this.RefID = data.refId;
        }
        if (data && data.tags) {
            this.Tags = data.tags;
        }
    }
}

export class EventRecurItem extends hih.BaseModel {

}
