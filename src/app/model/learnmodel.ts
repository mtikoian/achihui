import { environment } from '../../environments/environment';
import * as hih from './common';

/**
 * ENPOS: English Part of Speech
 */
export class ENPOS extends hih.BaseModel {
    public PosAbb: string;
    public PosName: string;
    public LangId: number;
    public PosNativeName: string;
    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of ENPOS");
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of ENPOS");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of ENPOS");
        }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of ENPOS");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of ENPOS");
        }

        super.onSetData(data);
    }
}

/**
 * ENWordExplain: English Word's Explain
 */
export class ENWordExplain extends hih.BaseModel {
    public ExplainId: number;
    public PosAbb: string;
    public LangId: number;
    public ExplainString: string;
    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of KnowledgeType");
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of KnowledgeType");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of KnowledgeType");
        }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of KnowledgeType");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }
}

/**
 * ENWord: English Word
 */
export class EnWord extends hih.BaseModel {
    public WordId: number;
    public WordString: string;
    public Tags: string[];
    public Explains: ENWordExplain[];
    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of KnowledgeType");
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of KnowledgeType");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of KnowledgeType");
        }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of KnowledgeType");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of Finance.Setting");
        }

        super.onSetData(data);
    }
}

/**
 * ENSentenceExplain: English Sentence's Explain
 */
export class EnSentenceExplain extends hih.BaseModel {
    public ExplainId: number;
    public LangId: number;
    public ExplainString: string;
    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of KnowledgeType");
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of KnowledgeType");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of KnowledgeType");
        }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of KnowledgeType");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }
}

/**
 * EnSentence: English Sentence
 */
export class EnSentence extends hih.BaseModel {
    public SentenceId: number;
    public SentenceString: string;
    public Tags: string[];
    public Explains: ENWordExplain[];

    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of KnowledgeType");
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of KnowledgeType");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of KnowledgeType");
        }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of KnowledgeType");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of Finance.Setting");
        }

        super.onSetData(data);
    }
}

/**
 * LearnCategory: Learn category, same as knowledge type
 */
export class LearnCategory extends hih.BaseModel {
    public Id: number;
    public ParentId: number;
    public Name: string;
    public Comment: string;
    public SysFlag: boolean;

    // Runtime information
    public ParentIdForJsTree: number;
    public ParentObject: any;
    public FullDisplayText: string;

    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of LearnCategory");
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of LearnCategory");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of LearnCategory");
        }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of LearnCategory");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of Finance.Setting");
        }

        super.onSetData(data);

        if (data && data.id) {
            this.Id = +data.id;
        }
        if (data && data.parID) {
            this.ParentId = +data.parID;
        } else {
            this.ParentId = null;
        }
        if (data && data.name) {
            this.Name = data.name;
        }
        if (data && data.comment) {
            this.Comment = data.comment;
        }
        if (data && data.sysFlag) {
            this.SysFlag = data.sysFlag;
        } else {
            this.SysFlag = false;
        }
    }
}

/**
 * LearnObject: Learn object, same as Knowledge
 */
export class LearnObject extends hih.BaseModel {
    public Id: number;
    public CategoryId: number;
    public Name: string;
    public Content: string;

    // Display name, not necessary for saving
    public CategoryName: string;

    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of LearnObject");
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of LearnObject");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of LearnObject");
        }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of LearnObject");
        }

        let rstObj = super.writeJSONObject();
        rstObj.Id = this.Id;
        rstObj.CategoryId = this.CategoryId;
        rstObj.Name = this.Name;
        rstObj.Content = this.Content;
        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of LearnObject");
        }

        super.onSetData(data);

        if (data && data.id) {
            this.Id = data.id;
        }
        if (data && data.category) {
            this.CategoryId = data.category;
        }
        if (data && data.name) {
            this.Name = data.name;
        }
        if (data && data.content) {
            this.Content = data.content;
        }
    }
}

/**
 * LearnHistory: History of the learn object and the user
 */
export class LearnHistory extends hih.BaseModel {
    public UserId: string;
    public ObjectId: number;
    public LearnDate: Date;
    public Comment: string;

    // Additional info, not need for saving
    public UserDisplayAs: string;
    public ObjectName: string;

    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of LearnHistory");
        }

        this.LearnDate = new Date();
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of LearnHistory");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of LearnHistory");
        }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of LearnHistory");
        }

        let rstObj = super.writeJSONObject();
        rstObj.UserId = this.UserId;
        rstObj.ObjectId = this.ObjectId;
        rstObj.LearnDate = this.LearnDate;
        rstObj.Comment = this.Comment;
        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of Finance.Setting");
        }

        super.onSetData(data);

        this.UserId = data.userID;
        this.ObjectId = data.objectID;
        this.LearnDate = data.learnDate;
        this.Comment = data.comment;

        this.UserDisplayAs = data.userDisplayAs;
        this.ObjectName = data.objectName;
    }
}

/**
 * LearnAward: Learn award for the user
 */
export class LearnAward extends hih.BaseModel {
    constructor() {
        super();
        if (environment.DebugLogging) {
            console.log("Entering constructor of LearnAward");
        }
    }

    public onInit() {
        super.onInit();
        if (environment.DebugLogging) {
            console.log("Entering onInit of LearnAward");
        }
    }

    public onVerify(context: any): boolean {
        if (environment.DebugLogging) {
            console.log("Entering onVerify of LearnAward");
        }
        if (!super.onVerify(context))
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (environment.DebugLogging) {
            console.log("Entering writeJSONObject of LearnAward");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of Finance.Setting");
        }

        super.onSetData(data);
    }
}