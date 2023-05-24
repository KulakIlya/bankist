const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2,
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

(() => {
  accounts.forEach((account) => {
    const { owner } = account;
    const normalizedName = owner.toLowerCase().split(' ');
    account.username = normalizedName
      .map((item) => {
        return item[0];
      })
      .join('');
  });
})();

const labelRefs = {
  labelWelcome: document.querySelector('.welcome'),
  labelDate: document.querySelector('.date'),
  labelBalance: document.querySelector('.balance__value'),
  labelSumIn: document.querySelector('.summary__value--in'),
  labelSumOut: document.querySelector('.summary__value--out'),
  labelSumInterest: document.querySelector('.summary__value--interest'),
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

  const { labelBalance } = labelRefs;

  labelBalance.innerHTML = balance + '€';
}

function createMovements(movements) {
  const { containerMovements } = containerRefs;

  containerMovements.innerHTML = [...movements]
    .reverse()
    .map((amount, index) => {
      const indexReversed = movements.length - index;
      const type = amount > 0 ? 'deposit' : 'withdrawal';
      return `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${indexReversed} ${type}</div>
          <div class="movements__date">3 days ago</div>
          <div class="movements__value">${amount}€</div>
        </div>`;
    });
}

function createSummary({ movements, interestRate }) {
  const { containerSummary } = containerRefs;

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
  }
}

function makeTransfer(e) {
  e.preventDefault();

  const { inputTransferTo, inputTransferAmount } = inputRefs;
  const { movements } = currentUser;

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
    transferTo.movements.push(Number(inputTransferAmount.value));
    updateAccount();
  } else if (balance <= Number(inputTransferAmount.value))
    alert("You don't have enough money");
  else if (Number(inputTransferAmount.value) < 0)
    alert('Only positive numbers');
  else if (inputTransferAmount.value > 0)
    alert('You cannot transfer money to yourself');
}

function updateAccount() {
  inputRefs.inputLoginUsername.value = null;
  inputRefs.inputLoginPin.value = null;
  inputRefs.inputTransferTo.value = null;
  inputRefs.inputTransferAmount.value = null;
  inputRefs.inputLoanAmount.value = null;
  inputRefs.inputCloseUsername.value = null;
  inputRefs.inputClosePin.value = null;

  createBalance(currentUser);
  createMovements(currentUser.movements);
  createSummary(currentUser);
}

function createLoan(e) {
  e.preventDefault();
  const { inputLoanAmount } = inputRefs;
  const { movements } = currentUser;
  const deposits = movements.filter((item) => item > 0);

  if (
    inputLoanAmount.value > 0 &&
    deposits.some((deposit) => deposit > Number(inputLoanAmount.value) * 0.1)
  ) {
    movements.push(Number(inputLoanAmount.value));
    createBalance(currentUser);
  } else if (Number(inputLoanAmount.value) < 0)
    alert('Write a positive number');
}

function closeAccount(e) {
  e.preventDefault();
  const { inputCloseUsername } = inputRefs;
  const { inputClosePin } = inputRefs;

  if (
    inputCloseUsername.value === currentUser.username &&
    Number(inputClosePin.value) === currentUser.pin
  ) {
    const userToDelete = accounts.findIndex(
      (account) => account.username === currentUser.username
    );
    accounts.splice(userToDelete, 1);
    containerRefs.containerApp.style.opacity = 0;
  }
}

function onSort({ movements }) {
  const movementsCopy = [...movements];
  if (!isSorted) {
    movementsCopy.sort((item, nextItem) => item - nextItem);
    createMovements(movementsCopy);
  } else createMovements(movements);

  isSorted = !isSorted;
}
