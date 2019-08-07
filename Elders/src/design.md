# Overview

HIH consists of three major building blocks:
* Identity Server
* API (Web API)
* UI app (Typescript app)

## Common

There are several common parts which need be documented.

### UI part
#### Themes
To compile the scss file to CSS files:
using commands:
- node-sass --output-style compressed src\assets\custom-themes\deeppurple-amber.scss > src\assets\css\deeppurple-amber.css
- node-sass --output-style compressed src\assets\custom-themes\indigo-pink.scss > src\assets\css\indigo-pink.css
- node-sass --output-style compressed src\assets\custom-themes\pink-bluegrey.scss > src\assets\css\pink-bluegrey.css
- node-sass --output-style compressed src\assets\custom-themes\purple-green.scss > src\assets\css\purple-green.css

### Base Model

There is a base class BaseModel which defined the following methods
* onSetData: parse the data fetched from API and translate into attributes for UI;
* writeJSONString: construct the string which can be sent to API, it depends on writeJSONObject;
* writeJSONObject: also prepared for sending data to API;
* onVerify: verify the data;

### Key of Learning History
The learning history has a combined key:
* User
* Learn Object
* Learn Date

To make it survive in Web API part, there should be a combined key used for communication between UI and API:

For UI layer (Typescript codes):

```typescript
public generateKey() : string {
  return this.UserId + "_" + this.ObjectId.toString() + "_" + hih.Utility.Date2String(this.LearnDate); 
}
```

For API layer (C# codes):

```csharp
public string generateKey() 
{
  return this.UserID +"_" + this.ObjectID.ToString() + "_" + String.Format("0:yyyy-MM-dd", this.LearnDate);
}
```

### Finance Document
There are several important parts in Finance Document part.

#### Base currency
The base currency now stored in Home definition profile. 
It shall keep unchange after the home defintion was created.

#### Foreign currency support
There are several scenarios with Foreign currency are supported:
* Exchange rate in HIH stands for the number of the base currency which 100 foreign currency can exchange for. For instance, if set base currency as CNY, and 1 EUR = 5 CNY, you need input 500.00 as exchange rate during the posting.
* Post a normal document with foreign currency but WITHOUT exchange rate known is allowed. A typical example is, do shopping via Creditcard. In this case, provide an estimated exchange rate and mark 'ProposedExchangeRate';
* Post the currency exchange document, in this case, the exchange rate must be inputted, and 'ProposedExchangeRate' cannot be set. It was designed to map the scenario when you pay the creditcard with foreign currency exist. The system will detect the previous documents with exactly same currency which marked 'ProposedExchangeRate', and you can make a decision whether to reset the 'ProposedExchangeRate' flag.
* Transfer document with foreign currency can also mark 'ProposedExchangeRate' if the exact rate is unknown.

#### Advanced payment support
Advanced payment shall be splitted into pieces to make the expense more reality.
* When posting an advanced payment document, an account will be created automatically with Category 'Advanced payment'; 
* Via the repeat frequency setting, the template documents will be created;
* Once the template documents got posted, the field 'REFDOCID' got updated with real document ID;
* The unposted template documents will appear in the 'Todo' page of Finance;

#### Loan support
There are two kinds of Loan document:
1. Borrow from
2. Lend to

All loan documents involves the interest calculation.
* Post a loan document will create an account with category Loan automatically.
* Just like advanced payment, repayment method need be maintained, the template documents will be created automatically;

For borrow from transaction:
1. First of all, create a borrow from document with: Document type (Borrow From, 9) whch contains two items: 
    a. First document line posted to the New created BorrowFromAccount, tran. type 82 (opening liability));
    b. Second document line posted to the account which receiving the amount, tran. type 80 (borrow from);
2. In addition, there are several template documents will be created with the relevant.
3. A repay document will be post periodly or manually;
    a. The new posted document with doc type - repayment.
    b. It contains several line items: the original amount (repayment in 87 to the borrow from account, repayment out 86 to the account which paid the amount), the interest amount;

For lend to transaction:
1. First of all, create a lend to document with: Document type (Borrow To, 10) whch contains two items: 
    a. First document line posted to the New created LendToAccount, tran. type 1 (opening asset));
    b. Second document line posted to the account which paid the amount, tran. type 81 (lent to);
2. In addition, there are several template documents will be created with the relevant.
3. A repay document will be post periodly or manually;
    a. The new posted document with doc type - repayment.
    b. It contains several line items: the original amount (repayment out 86 to the lend to account, repayment out 87 to the account which received the amount), the interest amount;

#### Post new document

##### Normal document
To create normal document:
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- For tran. type, can only use the non-system tran. type;
- When using non-base currency, exchange rate is a must;
- Cannot use 0 as amount in line item;

##### Transfer document
To create transfer document:
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- For tran. type, can only use the two system tran. types: transfer out and transfer in;
- When using non-base currency, need input the exchange rate;
- Cannot use 0 as the amount in line item;
- Ensure the total transaction amount (with tran. currency) is zero.

##### Currency exchange document
To create currency exchange document:
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- For tran. type, can only use the two system tran. types: transfer out and transfer in;
- Two currencies are required, and at least one of them is non-base currency. For currency which is non-base currency, the exchange rate is a must;
- Cannot use 0 as the amount in line item;
- Ensure the total transaction amount (with base currency) is zero.

##### Advance payment document
To create advance payment document
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- Cannot use 0 as the amount in line item;

##### Advance received document
To create advance received document
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- Cannot use 0 as the amount in line item;

##### Borrow from document
To create borrow from document
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- Cannot use 0 as the amount in line item;

##### Lent to document
To create lend to document
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- Cannot use 0 as the amount in line item;

##### Asset buy in document
To create asset buy in document
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- Cannot use 0 as the amount in line item;

##### Asset value change document
To create value change document
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- Cannot use 0 as the amount in line item;

##### Asset sold out document
To create asset sold out document
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- Cannot use 0 as the amount in line item;

##### Repayment document
To create repayment document
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- Cannot use 0 as the amount in line item;

#### Change existing document

##### Normal document
To change normal document:
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- For tran. type, can only use the non-system tran. type;
- Cannot use 0 as amount in line item;
- When using non-base currency, need input the exchange rate;

##### Transfer document
To change transfer document:
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- It's not allowed to change tran. type;
- When using non-base currency, need input the exchange rate;

##### Currency exchange document
To change currency exchange document:
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- It's not allowed to change tran. type;
- When using non-base currency, need input the exchange rate;

##### Advance payment document
To change advance payment document:
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- It's not allowed to change tran. type;
- When using non-base currency, need input the exchange rate;

##### Advance received document
To change advance received document:
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- It's not allowed to change tran. type;
- When using non-base currency, need input the exchange rate;

##### Borrow from document
To change borrow from document:
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- It's not allowed to change tran. type;
- When using non-base currency, need input the exchange rate;

##### Lend to document
To change lend to document:
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- It's not allowed to change tran. type;
- When using non-base currency, need input the exchange rate;

##### Asset buy in document
To change asset buy in document:
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- It's not allowed to change tran. type;
- When using non-base currency, need input the exchange rate;

##### Asset value change document
To change asset value change document:
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- It's not allowed to change tran. type;
- When using non-base currency, need input the exchange rate;

##### Asset sold out document
To change asset sold out document:
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- It's not allowed to change tran. type;
- When using non-base currency, need input the exchange rate;

##### Repayment document
To change repayment document:
- For account, can only use the account with activated status;
- For order, can only use the orders which is validated at the transaction date;
- It's not allowed to change tran. type;
- When using non-base currency, need input the exchange rate;

#### Others
Others

### Event: Recur 
The recur event will generate events according to the repeat type.
* When creating a recur event, the simulator will give a list of the events will be created based on the repeat type;
* The recur event won't be impacted on the generated events;

### Event: Habit
The habit event is an event which without speicifed date but a range of date.
For instance, a habit can be set: take 5 exerices per week. So a hahbit can be set as a range (a week) with the repeat times.

### Library Document
#### Book Category
Humor & Entertainment
Medical Books
Parenting & Relationships
Politics & Social Sciences
Religion & Spirituality
Science & Math
Self-Help
Teen & Young Adult
Test Preparation

## UI part

The TypeScript UI app consists lots of the interfaces.

### Detail page

See wiki page for UI Development: [Wiki page](https://github.com/alvachien/achihui/wiki/UI-development)


### List page

See wiki page for UI Development: [Wiki page](https://github.com/alvachien/achihui/wiki/UI-development)


## Buffer service

To save the working load the API, also increase the performance of the app from the UI layer, the following part are bufferred automatically:
* User
* Currency
* Document Type
* Account Category
* Transaction
* Learn Category
* Finance Account
* Learn Object (TBD.)
* Learn History (TBD.)
* Control Center
* Order

The buffer can be bypassed if you refresh the list manually via the 'refresh' button.

## Use webpack instead of ng
The following commands shall be used directly:
   - "npm run build" to build.
   - "npm test" to run unit tests.
   - "npm start" to serve the app using webpack-dev-server.
   - "npm run e2e" to run protractor.

## Authority control

Authority control applys to all objects.

* Finance Account (Claim: FinanceAccountScope); 
    - OnlyOwnerAndDisplay: Only access the account which Owner is current user, it can only display it;
    - OnlyOwnerFullControl: Only access the account which Owner is current user, but with full control;
    - All: Can access all accounts.
* Finance Document;
    - Display;
    - All
* Finance Balance Sheet Report
    - Display;
* Learn Object;
    - Display: Can display the learn object;
    - All: Can access all objects;
* Learn History (Claim: LearnHistoryScope);
    - OnlyOwnerAndDisplay: Only access the history which belongs to current user, it can only display it;
    - OnlyOwnerFullControl: Only access the history which belongs to current user, but with full control;
    - All: can access all histories;
* Others;

## Copy TinyMCE library
Powershell:

xcopy /I /E node_modules\tinymce\skins src\assets\tinymceskins

## Others