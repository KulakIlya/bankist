// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2,
  pin: 1111,

  movementsDates: [
    '2022-12-18T21:31:17.178Z',
    '2022-12-23T07:42:02.383Z',
    '2023-01-28T09:15:04.904Z',
    '2023-04-01T10:17:24.185Z',
    '2023-05-20T14:11:59.604Z',
    '2023-05-23T17:01:17.194Z',
    '2023-05-24T23:36:17.929Z',
    '2023-05-25T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2022-12-18T21:31:17.178Z',
    '2022-12-23T07:42:02.383Z',
    '2023-01-28T09:15:04.904Z',
    '2023-04-01T10:17:24.185Z',
    '2023-05-20T14:11:59.604Z',
    '2023-05-23T17:01:17.194Z',
    '2023-05-24T23:36:17.929Z',
    '2023-05-25T10:51:36.790Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

accounts.forEach((account) => {
  const normalizedName = account.owner.toLowerCase().split(' ');
  account.username = `${normalizedName[0][0]}${normalizedName[1][0]}`;
});

const labelRefs = {
  labelWelcome: document.querySelector('.welcome'),
  labelDate: document.querySelector('.date'),
  labelBalance: document.querySelector('.balance__value'),

  labelTimer: document.querySelector('.timer'),
};

const containerRefs = {
  containerApp: document.querySelector('.app'),
  containerMovements: document.querySelector('.movements'),
  containerBalance: document.querySelector('.balance'),
  containerSummary: document.querySelector('.summary'),
};

const btnRefs = {
  btnLogin: document.querySelector('.login__btn'),
  btnTransfer: document.querySelector('.form__btn--transfer'),
  btnLoan: document.querySelector('.form__btn--loan'),
  btnClose: document.querySelector('.form__btn--close'),
  btnSort: document.querySelector('.btn--sort'),
};

const inputRefs = {
  inputLoginUsername: document.querySelector('.login__input--user'),
  inputLoginPin: document.querySelector('.login__input--pin'),
  inputTransferTo: document.querySelector('.form__input--to'),
  inputTransferAmount: document.querySelector('.form__input--amount'),
  inputLoanAmount: document.querySelector('.form__input--loan-amount'),
  inputCloseUsername: document.querySelector('.form__input--user'),
  inputClosePin: document.querySelector('.form__input--pin'),
};

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

let dateNow = new Date();
let day;
let month;
let year;
let hour;
let minutes;

let currentUser;
let isSorted = false;
const { btnLogin, btnTransfer, btnLoan, btnClose, btnSort } = btnRefs;

btnLogin.addEventListener('click', onLogin);
btnTransfer.addEventListener('click', makeTransfer);
btnLoan.addEventListener('click', createLoan);
btnClose.addEventListener('click', closeAccount);
btnSort.addEventListener('click', (e) => {
  e.preventDefault();
  onSort(currentUser);
});

// Functions

function onLogin(e) {
  e.preventDefault();
  const { inputLoginUsername, inputLoginPin } = inputRefs;
  const { containerApp } = containerRefs;

  currentUser = accounts.find(
    ({ username }) => username === inputLoginUsername.value
  );

  if (currentUser?.pin === Number(inputLoginPin.value)) {
    containerApp.style.opacity = 1;

    updateAccount();
  }
}

function createBalance({ movements }) {
  const balance = movements.reduce((acc, item) => acc + item);

  const { labelBalance, labelDate } = labelRefs;

  labelBalance.innerHTML = balance + '€';

  labelDate.innerHTML = `${new Intl.DateTimeFormat(currentUser.locale).format(
    dateNow
  )}`;
}

function createMovements(movements, movementsDates) {
  const { containerMovements } = containerRefs;
  const movementsDatesCopy = [...movementsDates];
  movementsDatesCopy.reverse();

  const calcDaysDiff = (date1, date2) =>
    Math.abs(date2 - date1) / (24 * 60 * 60 * 1000);

  containerMovements.innerHTML = [...movements]
    .reverse()
    .map((amount, index) => {
      const indexReversed = movements.length - index;
      const type = amount > 0 ? 'deposit' : 'withdrawal';

      const date = new Date(movementsDatesCopy[index]);
      const localDate = new Intl.DateTimeFormat(currentUser.locale).format(
        date
      );

      let diff;

      if (Math.trunc(calcDaysDiff(date, dateNow)) > 7) diff = `${localDate}`;
      else if (
        Math.trunc(calcDaysDiff(date, dateNow)) > 1 &&
        Math.trunc(calcDaysDiff(date, dateNow)) < 7
      )
        diff = `${Math.trunc(calcDaysDiff(date, dateNow))} days ago`;
      else if (Math.trunc(calcDaysDiff(date, dateNow)) === 1)
        diff = 'yesterday';
      else diff = 'today';

      return `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${indexReversed} ${type}</div>
          <div class="movements__date">${diff}</div>
          <div class="movements__value">${amount.toFixed(2)}€</div>
        </div>`;
    });
}

function createSummary({ movements, interestRate }) {
  const { containerSummary } = containerRefs;

  const labelSumIn = document.querySelector('.summary__value--in');
  const labelSumOut = document.querySelector('.summary__value--out');
  const labelSumInterest = document.querySelector('.summary__value--interest');

  const valueIn = movements.reduce(
    (acc, amount) => (amount > 0 ? acc + amount : acc),
    0
  );

  const valueOut = Math.abs(
    movements.reduce((acc, amount) => (amount < 0 ? acc + amount : acc), 0)
  );

  const interest = movements
    .map((deposit) => (deposit * interestRate) / 100)
    .filter((item) => item >= 1)
    .reduce((acc, item) => acc + item, 0);
  if (
    !containerSummary.innerHTML.includes(`<p class="summary__label">In</p>`)
  ) {
    containerSummary.insertAdjacentHTML(
      'afterbegin',
      `<p class="summary__label">In</p>
        <p class="summary__value summary__value--in">${valueIn}€</p>
        <p class="summary__label">Out</p>
        <p class="summary__value summary__value--out">${valueOut}€</p>
        <p class="summary__label">Interest</p>
        <p class="summary__value summary__value--interest">${interest}€</p>
        `
    );
  } else {
    labelSumIn.innerHTML = valueIn + '€';
    labelSumOut.innerHTML = valueOut + '€';
    labelSumInterest.innerHTML = interest + '€';
  }
}

function makeTransfer(e) {
  e.preventDefault();

  const { inputTransferTo, inputTransferAmount } = inputRefs;
  const { movements, movementsDates } = currentUser ?? [];

  const balance = movements.reduce((acc, item) => acc + item);
  const transferTo = accounts.find(
    ({ username }) => username === inputTransferTo.value
  );
  if (
    Number(inputTransferAmount.value) > 0 &&
    transferTo &&
    balance >= Number(inputTransferAmount.value) &&
    transferTo != currentUser
  ) {
    movements.push(-Number(inputTransferAmount.value));
    movementsDates.push(dateNow.toISOString());
    transferTo.movements.push(Number(inputTransferAmount.value));
    transferTo.movementsDates.push(dateNow.toISOString());
    updateAccount();
  } else if (balance <= Number(inputTransferAmount.value))
    alert("You don't have enough money");
  else if (Number(inputTransferAmount.value) < 0)
    alert('Only positive numbers');
  else if (transferTo === currentUser)
    alert('You cannot transfer money to yourself');
  else alert('User does not exist');
}

function updateAccount() {
  inputRefs.inputLoginUsername.value = null;
  inputRefs.inputLoginPin.value = null;
  inputRefs.inputTransferTo.value = null;
  inputRefs.inputTransferAmount.value = null;
  inputRefs.inputLoanAmount.value = null;
  inputRefs.inputCloseUsername.value = null;
  inputRefs.inputClosePin.value = null;

  const { labelWelcome } = labelRefs;

  const { owner } = currentUser;

  labelWelcome.innerHTML = `Welcome, ${owner.split(' ')[0]}`;

  createBalance(currentUser);
  createMovements(currentUser.movements, currentUser.movementsDates);
  createSummary(currentUser);
}

function createLoan(e) {
  e.preventDefault();
  const { inputLoanAmount } = inputRefs;
  const { movements, movementsDates } = currentUser;
  const deposits = movements.filter((item) => item > 0);

  if (
    inputLoanAmount.value > 0 &&
    deposits.some((deposit) => deposit > Number(inputLoanAmount.value) * 0.1)
  ) {
    movements.push(Math.floor(Number(inputLoanAmount.value)));
    movementsDates.push(dateNow.toISOString());

    createBalance(currentUser);
    updateAccount();
  } else if (Number(inputLoanAmount.value) < 0)
    alert('Write a positive number');
}

function closeAccount(e) {
  e.preventDefault();
  const { inputCloseUsername } = inputRefs;
  const { inputClosePin } = inputRefs;
  const { labelWelcome } = labelRefs;

  if (
    inputCloseUsername.value === currentUser.username &&
    Number(inputClosePin.value) === currentUser.pin
  ) {
    const userToDelete = accounts.findIndex(
      (account) => account.username === currentUser.username
    );
    accounts.splice(userToDelete, 1);
    containerRefs.containerApp.style.opacity = 0;
    labelWelcome.innerHTML = 'Log in to get started';
  } else if (inputCloseUsername.value !== currentUser.username)
    alert('You can delete only your account');
}

function onSort({ movements, movementsDates }) {
  const movementsCopy = [...movements];
  const movementsDatesCopy = [...movementsDates];
  if (!isSorted) {
    movementsCopy.sort((item, nextItem) => item - nextItem);
    movementsDatesCopy.sort((item, nextItem) => item - nextItem);
    createMovements(movementsCopy, movementsDatesCopy);
  } else createMovements(movements, movementsDates);

  isSorted = !isSorted;
}
