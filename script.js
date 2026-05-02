const API = "http://localhost:5000";

function openWebsite() {
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("signupPage").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  showPage("sales");
}

function openLogin() {
  document.getElementById("app").classList.add("hidden");
  document.getElementById("signupPage").classList.add("hidden");
  document.getElementById("loginPage").classList.remove("hidden");
}

function showSignup() {
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("signupPage").classList.remove("hidden");
}

function showLogin() {
  document.getElementById("signupPage").classList.add("hidden");
  document.getElementById("loginPage").classList.remove("hidden");
}
// LOGIN
async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  let res = await fetch("http://localhost:5000/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  });

  let data = await res.json();

  console.log("LOGIN RESPONSE:", data); // 👈 IMPORTANT

  if (data.token) {
  localStorage.setItem("token", data.token);
  openWebsite();
  showPage("home"); // 🔥 ensures dashboard loads
} else {
  alert(data.message || "Login Failed");
}
}

// SIGNUP
async function signup() {
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  try {
    let res = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ firstName, lastName, email, password })
    });

    let data = await res.json();
    console.log("SIGNUP RESPONSE:", data);

    alert(data.message || "Signup done");

  } catch (err) {
    alert("Signup error (backend not running)");
    console.log(err);
  }
}

//LOG OUT
function logout() {
  localStorage.removeItem("token");
  location.reload();
}

function showPage(p) {
  document.querySelectorAll(".page").forEach(x => x.classList.add("hidden"));
  document.getElementById(p).classList.remove("hidden");

  if (p === "home") {
    loadHome();
    loadCalendar();
  }
}

let sales = [];
let purchases = [];
let expenses = [];

// SALES
function addSale() {
  let item = document.getElementById("saleItem").value;
  let qty = Number(document.getElementById("saleQty").value);
  let price = Number(document.getElementById("saleAmount").value);

  let total = qty * price;

  let today = new Date().toISOString().split("T")[0]; // 🔥 ADD THIS

  sales.push({ item, qty, price, total, date: today }); // 🔥 FIXED

  let grandTotal = 0;

  document.getElementById("salesTable").innerHTML =
    sales.map(s => {
      grandTotal += s.total;
      return `
        <tr>
          <td>${s.item}</td>
          <td>${s.qty}</td>
          <td>₹${s.price}</td>
          <td>₹${s.total}</td>
        </tr>
      `;
    }).join("");

  document.getElementById("salesTotal").innerText = grandTotal;

  loadHome();      // 🔥 update dashboard
  loadCalendar();  // 🔥 update calendar
}

// PURCHASE
function addPurchase() {
  let item = purchaseItem.value;
  let qty = Number(purchaseQty.value);
  let price = Number(purchaseAmount.value);

  let total = qty * price;

  let today = new Date().toISOString().split("T")[0];

  purchases.push({ item, qty, price, total, date: today });

  let grandTotal = 0;

  purchaseTable.innerHTML = purchases.map(p => {
    grandTotal += p.total;
    return `<tr>
      <td>${p.item}</td>
      <td>${p.qty}</td>
      <td>₹${p.price}</td>
      <td>₹${p.total}</td>
    </tr>`;
  }).join("");

  purchaseTotal.innerText = grandTotal;
}

// EXPENSE
function addExpense() {
  let type = document.getElementById("expenseType").value;
  let qty = Number(document.getElementById("expenseQty").value);
  let price = Number(document.getElementById("expenseAmount").value);

  let total = qty * price; // 🔥 main logic

  let today = new Date().toISOString().split("T")[0];

  expenses.push({ type, qty, price, total, date: today });

  let grandTotal = 0;

  document.getElementById("expenseTable").innerHTML =
    expenses.map(e => {
      grandTotal += e.total;
      return `
        <tr>
          <td>${e.type}</td>
          <td>${e.qty}</td>
          <td>₹${e.price}</td>
          <td>₹${e.total}</td>
        </tr>
      `;
    }).join("");

  document.getElementById("expenseTotal").innerText = grandTotal;
}

// HOME
let chart;

function loadHome() {

  const picker = document.getElementById("monthPicker");

  let month = picker
    ? picker.value
    : new Date().toISOString().slice(0, 7);

  let totalSales = 0;
  let totalPurchase = 0;
  let totalExpense = 0;

  sales.forEach(s => {
    if (s.date && s.date.startsWith(month)) totalSales += s.total;
  });

  purchases.forEach(p => {
    if (p.date && p.date.startsWith(month)) totalPurchase += p.total;
  });

  expenses.forEach(e => {
    if (e.date && e.date.startsWith(month)) totalExpense += e.total;
  });

  let profit = totalSales - totalPurchase - totalExpense;

  // 🔥 SAFE UPDATE
  if (document.getElementById("totalSales")) {
    document.getElementById("totalSales").innerText = totalSales;
    document.getElementById("totalPurchase").innerText = totalPurchase;
    document.getElementById("totalExpense").innerText = totalExpense;
    document.getElementById("totalProfit").innerText = profit;
  }
}

//CALENDAR
let calendar;

function loadCalendar() {
  console.log("Loading calendar...");

  let calendarEl = document.getElementById("calendar");

  if (!calendarEl) {
    console.log("Calendar div NOT found ❌");
    return;
  }

  let events = [];

  sales.forEach(s => {
    if (s.date) {
      events.push({
        title: `Sale ₹${s.total}`,
        date: s.date,
        color: "#FFD700"
      });
    }
  });

  purchases.forEach(p => {
    if (p.date) {
      events.push({
        title: `Purchase ₹${p.total}`,
        date: p.date,
        color: "orange"
      });
    }
  });

  expenses.forEach(e => {
    if (e.date) {
      events.push({
        title: `Expense ₹${e.total}`,
        date: e.date,
        color: "red"
      });
    }
  });

  if (calendar) calendar.destroy();

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: 500,
    events: events
  });

  calendar.render();
}
window.onload = function () {
  console.log("Page loaded");

  // 🔥 DO NOT CALL loadHome HERE
  // Only call when home page is opened

  if (localStorage.getItem("token")) {
    openWebsite();
  } else {
    openLogin();
  }
};





//PROFILE
// TOGGLE MENU
function toggleProfile() {
  const menu = document.getElementById("profileMenu");

  if (!menu) {
    console.log("Menu not found ❌");
    return;
  }

  menu.classList.toggle("hidden");
}
function toggleProfile() {
  document.getElementById("profileMenu").classList.toggle("hidden");
}

// CLOSE ON OUTSIDE CLICK
window.addEventListener("click", function (e) {
  let menu = document.getElementById("profileMenu");
  let icon = document.querySelector(".profile-icon");

  if (!menu.contains(e.target) && !icon.contains(e.target)) {
    menu.classList.add("hidden");
  }
});

// PLACEHOLDER FUNCTIONS
function openProfile() {
  alert("Profile page coming soon");
}

function openSettings() {
  alert("Settings coming soon");
}