let account1 = {
  name: "Pratham",
  pin: 1111,
  movements: [100, -10, 200, 500, -230, 100],
  loan: [200, 500],
  movementsDates: [
    "2021-11-18T21:31:17.178Z",
    "2022-12-23T07:42:02.383Z",
    "2023-01-28T09:15:04.904Z",
    "2023-04-01T10:17:24.185Z",
    "2025-05-08T14:11:59.604Z",
    "2025-07-19T17:01:17.194Z",
  ],
  loanDates: ["2023-01-28T09:15:04.904Z", "2023-04-01T10:17:24.185Z"],
};
let account2 = {
  name: "Aark Bharti",
  pin: 2222,
  movements: [400, -50, 100, 2000, -200, 180],
  loan: [2000, 180],
  movementsDates: [
    "2021-01-01T13:15:33.035Z",
    "2022-11-30T09:48:16.867Z",
    "2022-10-25T06:04:23.907Z",
    "2023-01-25T14:18:46.235Z",
    "2024-02-05T16:33:06.386Z",
    "2025-04-10T14:43:26.374Z",
  ],
  loanDates: ["2023-01-25T14:18:46.235Z", "2025-04-10T14:43:26.374Z"],
};
let account3 = {
  name: "Chirag Virdi",
  pin: 3333,
  movements: [450, -10, 890, -500, 10, 190],
  loan: [190],
  movementsDates: [
    "2020-11-18T21:31:17.178Z",
    "2021-12-23T07:42:02.383Z",
    "2022-01-28T09:15:04.904Z",
    "2022-04-01T10:17:24.185Z",
    "2024-05-08T14:11:59.604Z",
    "2025-02-26T17:01:17.194Z",
  ],
  loanDates: ["2025-02-26T17:01:17.194Z"],
};
let ctx;
let accounts = [account1, account2, account3];

const createUserName = function () {
  accounts.forEach((acc) => {
    acc.userName = acc.name
      .toLowerCase()
      .split(" ")
      .map((word) => word[0])
      .join("");
  });
};
createUserName();

if (localStorage.getItem("acc")) {
  accounts = JSON.parse(localStorage.getItem("acc"));
}

const localSave = function () {
  localStorage.setItem("acc", JSON.stringify(accounts));
};

let loginBtn = document.querySelector(".login-btn");
let loginPage = document.querySelector(".login-page");
let navLinks = document.querySelector(".nav-links");
let homePage = document.querySelector(".home-page");
let name = document.querySelector(".wlc-name");
let worng = document.querySelectorAll(".worng");
let loginInp = document.querySelectorAll(".login-page--input");
let balance = document.querySelector(".Balance");

let currAcc;

loginBtn.addEventListener("click", (e) => {
  e.preventDefault();
  let userName = document.querySelector("#userN");
  let password = document.querySelector("#pin");
  currAcc = accounts.find(
    (acc) => acc.userName == userName.value.toLowerCase()
  );
  if (userName.value && currAcc && password.value == currAcc.pin) {
    loginPage.classList.add("hidden");
    navLinks.classList.remove("hidden");
    homePage.classList.remove("hidden");
    name.textContent = currAcc.name;
    updateUi(currAcc);
    updateRecentTrans(currAcc);
    updateChart(currAcc);
    userName.value = "";
    password.value = "";
  } else {
    worng.forEach((w) => {
      w.textContent = "Wrong Credentials";
    });
  }
});

loginInp.forEach((inp) => {
  inp.addEventListener("click", () => {
    worng.forEach((w) => {
      w.textContent = "";
    });
  });
});

let totalBalance = document.querySelector(".tatal-bal");
let In = document.querySelector(".in");
let Out = document.querySelector(".out");
const updateUi = function (currAcc) {
  let totalBal = currAcc.movements.reduce((cur, acc) => cur + acc, 0);
  currAcc.totalBalance = totalBal;
  let incalc = currAcc.movements
    .filter((mov) => mov > 0)
    .reduce((cur, acc) => cur + acc, 0);
  let outCalc = currAcc.movements
    .filter((mov) => mov < 0)
    .reduce((cur, acc) => cur + acc, 0);
  totalBalance.textContent = `$${totalBal}`;
  In.textContent = `$${incalc}`;
  Out.textContent = `$${Math.abs(outCalc)}`;
};
let chart;
const updateChart = function (currAcc) {
  ctx = document.querySelector("#myChart");
  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["IN", "out"],
      datasets: [
        {
          data: [
            currAcc.movements
              .filter((mov) => mov > 0)
              .reduce((acc, cur) => acc + cur, 0),
            Math.abs(
              currAcc.movements
                .filter((mov) => mov < 0)
                .reduce((acc, cur) => acc + cur, 0)
            ),
          ],
          borderWidth: 1,
        },
      ],
    },
  });
};

let trasList = document.querySelector(".transactions");
const updateRecentTrans = function (currAcc) {
  trasList.innerHTML = "";
  currAcc.movements.forEach((movs, idx) => {
    let html = `            <li>
                <div class="sign ${movs > 0 ? "depo" : "withr"}">${
      movs > 0 ? "+" : "-"
    }</div>
                <div class="desc">
                  <div class="amt ${movs > 0 ? "depo" : "withr"}">$${Math.abs(
      movs
    )}</div>
                  <div class="date">${updateDate(
                    currAcc.movementsDates[idx]
                  )}</div>
                </div>
              </li>`;

    trasList.insertAdjacentHTML("afterbegin", html);
  });
};

let transferBtn = document.querySelector(".transfer-btn");
let lessBal = document.querySelector(".less-bal");
let selfTrans = document.querySelector(".self-trans");
let WrongTransPin = document.querySelector(".trans-worng-pin");

let intervalWait;
let timerinterval;
let count = 60;

transferBtn.addEventListener("click", () => {
  let username = document.querySelector(".transfer-user").value;
  let amt = document.querySelector(".transfer-amt").value;
  let pin = document.querySelector(".transfer-pin").value;
  let remark = document.querySelector(".transfer-remark").value;
  let recAcc = accounts.find((acc) => acc.userName == username);
  let cancelSec = document.querySelector(".cancel-sec");
  if (
    recAcc &&
    recAcc != currAcc &&
    pin == currAcc.pin &&
    amt <= currAcc.totalBalance &&
    amt > 0
  ) {
    alert(`$${amt} is debited from you account in 60 sec`);
    cancelSec.classList.remove("hidden");
    intervalWait = setTimeout(() => {
      currAcc.movements.push(Number(-amt));
      recAcc.movements.push(Number(amt));
      let date = new Date().toISOString();
      currAcc.movementsDates.push(date);
      recAcc.movementsDates.push(date);
      updateUi(currAcc);
      balance.textContent = `$${currAcc.totalBalance}`;
      cancelSec.classList.add("hidden");
      homenavfn();
      localSave();
    }, 60000);
    document.querySelector(".transfer-user").value = "";
    document.querySelector(".transfer-amt").value = "";
    document.querySelector(".transfer-pin").value = "";
    document.querySelector(".transfer-remark").value = "";
    setTimeout(() => {
      cancelSec.classList.add("hidden");
    }, 60000);

    let cancelList = document.querySelector(".sec ul");
    cancelList.innerHTML = "";

    let d = new Date();

    let el = document.createElement("li");
    let html = `
                <div>
                  <p>${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}</p>
                </div>
                <p><span class="timer">60</span> Seconds to cancel</p>
                <div>
                  <button class="cancel-btn btn">Cancel Payment</button>
                  <p class="amt">$${amt}</p>
                </div>`;
    el.innerHTML = html;

    cancelList.appendChild(el);
    cancelfn(intervalWait);
    setTimeout(cancelfn2, 60000);

    count = count - 1;

    timerinterval = setInterval(() => {
      let timer = document.querySelector(".timer");
      timer.textContent = count;
      count = count - 1;
    }, 1000);

    // setTimeout(homenavfn, 5010);
  }
  if (username == currAcc.userName) {
    selfTrans.textContent = "Self trasfer not possible";
  }
  if (amt > currAcc.totalBalance) {
    lessBal.textContent = "Insufficient Balance";
  }
  if (pin != currAcc.pin && pin) {
    WrongTransPin.textContent = "Incorrect PIN";
  }
});

let transferInp = document.querySelectorAll(".transfer-page input");

transferInp.forEach((inp) => {
  inp.addEventListener("click", () => {
    lessBal.textContent = "";
    selfTrans.textContent = "";
    WrongTransPin.textContent = "";
  });
});

let homeNav = document.querySelector(".home-nav");
let transferNav = document.querySelector(".transfer-nav");
let transferPage = document.querySelector(".transfer-page");

const homenavfn = function () {
  // e.preventDefault();
  transferPage.classList.add("hidden");
  homePage.classList.remove("hidden");
  loanPage.classList.add("hidden");
  chart.destroy();
  updateUi(currAcc);
  updateRecentTrans(currAcc);
  updateChart(currAcc);
};

homeNav.addEventListener("click", (e) => {
  e.preventDefault();
  transferPage.classList.add("hidden");
  homePage.classList.remove("hidden");
  loanPage.classList.add("hidden");
  chart.destroy();
  updateUi(currAcc);
  updateRecentTrans(currAcc);
  updateChart(currAcc);
});

transferNav.addEventListener("click", (e) => {
  e.preventDefault();
  homePage.classList.add("hidden");
  loanPage.classList.add("hidden");
  transferPage.classList.remove("hidden");
  balance.textContent = `$${currAcc.totalBalance}`;
});

let logoutNav = document.querySelector(".logout-nav");
logoutNav.addEventListener("click", (e) => {
  e.preventDefault();
  homePage.classList.add("hidden");
  transferPage.classList.add("hidden");
  loginPage.classList.remove("hidden");
  loanPage.classList.add("hidden");
  navLinks.classList.add("hidden");
  chart.destroy();
});

let reqLaonBtn = document.querySelector(".req-loan--btn");

reqLaonBtn.addEventListener("click", () => {
  let amt = document.querySelector(".loan-amt");
  if (amt.value > 0) {
    currAcc.movements.push(Number(amt.value));
    currAcc.loan.push(Number(amt.value));
    let date = new Date().toISOString();
    currAcc.movementsDates.push(date);
    currAcc.loanDates.push(date);
    updateRecentLoans(currAcc);
    updateRecentTrans(currAcc);
    alert(`$${amt.value} is credited from you account`);
    amt.value = "";
    repayLoan(currAcc);
    updateUi(currAcc);
    localSave();
  }
});

let loanList = document.querySelector(".loan-list");
const updateRecentLoans = function (currAcc) {
  loanList.innerHTML = "";
  currAcc.loan.forEach((loan, idx) => {
    let html = `<li>
                <div class="info">
                  <p>${updateDate(currAcc.loanDates[idx])}</p>
                  <p>From AN Bank</p>
                </div>
                <div>
                  <button class="repay-loan btn">Repay Now</button>
                  <p class="amt">$${loan}</p>
                </div>
              </li>`;

    loanList.insertAdjacentHTML("afterbegin", html);
  });
};

let loanNav = document.querySelector(".loan-nav");
let loanPage = document.querySelector(".loan-page");

loanNav.addEventListener("click", (e) => {
  e.preventDefault();
  homePage.classList.add("hidden");
  transferPage.classList.add("hidden");
  loanPage.classList.remove("hidden");
  updateRecentLoans(currAcc);
  updateUi(currAcc);
  updateRecentTrans(currAcc);
  repayLoan(currAcc);
});

const repayLoan = function (currAcc) {
  let repayBtn = document.querySelectorAll(".repay-loan");
  repayBtn.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      let accIdx = currAcc.loan.length - 1 - idx;
      if (currAcc.loan[accIdx] <= currAcc.totalBalance) {
        currAcc.movements.push(Number(-currAcc.loan[accIdx]));
        let date = new Date().toISOString();
        currAcc.movementsDates.push(date);
        currAcc.loanDates.splice(accIdx, 1);
        currAcc.loan.splice(accIdx, 1);
        updateRecentLoans(currAcc);
        repayLoan(currAcc);
        updateUi(currAcc);
        localSave();
      } else {
        alert("Insufficient Balance");
      }
    });
  });
};

const updateDate = function (str = undefined) {
  let d = new Date(str);
  let date = d.getDate();
  let month = d.getMonth();
  let year = d.getFullYear();
  let finalDate = `${date}/${month + 1}/${year}`;

  return finalDate;
};

const cancelfn = function (interval) {
  // clearInterval(interval);
  let cancelBtn = document.querySelectorAll(".cancel-btn");
  cancelBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      clearTimeout(interval);
      let bt = btn.parentElement.parentElement;
      bt.remove();
      clearInterval(timerinterval);
      count = 60;
    });
  });
};

const cancelfn2 = function () {
  let cancelBtn = document.querySelectorAll(".cancel-btn");
  cancelBtn.forEach((btn) => {
    let bt = btn.parentElement.parentElement;
    bt.remove();
    cancelSec.classList.add("hidden");
  });
  clearInterval(timerinterval);
  count = 60;
};

