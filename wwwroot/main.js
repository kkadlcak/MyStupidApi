let SaleIt = `api/SaleItem`
let logedUser;
let activetab;


function switchTab(newTab) {
    console.log(newTab);
    tabcontent = document.getElementsByClassName("tabs");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    let tab = document.getElementById(newTab);
    tab.style.display = "block";
    activetab = newTab;
}

function SwitchSign(to) {
    document.getElementById("loginMenu").style.display = "none";
    document.getElementById("singupMenu").style.display = "none";
    document.getElementById(to).style.display = "block";
}

async function UserItems() {
    document.getElementById("Users").innerHTML = "";
    for (let it in logedUser.saleItems) {
        let tt = logedUser.saleItems[it];
        let dir = document.getElementById("Users");
        dir.appendChild(makedata(tt));
    }
    switchTab("Users");
}

function makedata(tt) {
    let data = document.querySelector("#saleTemp").content.children[0].cloneNode(true);
    data.querySelector('#NameId').innerHTML += tt.name;
    data.querySelector('#sale').innerHTML += tt.salePercentage + "%";
    data.querySelector('#itStarts').innerHTML += new Date(tt.saleDateStart).toUTCString();
    data.querySelector('#itEnds').innerHTML += new Date(tt.saleDateEnd).toUTCString();
    data.querySelector('#cat').innerHTML += tt.category;
    data.children[1].querySelector('#Idd').setAttribute("onclick", "AddItemToUser(" + tt.id + ")");
    data.children[1].querySelector('#DDi').setAttribute("onclick", "removeItem(" + tt.id + ")");
    if (new Date(tt.saleDateEnd) < Date.now()) {
        data.classList.add("ended");
    }
    return data;
}

function refresh() {
    UserItems()
    switchTab(activetab);
}

async function removeItem(idd) {
    await fetch("api/User/RemoveItem/" + logedUser.id + ":" + idd, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => console.log(response));
    logedUser = await GetUserByName(logedUser.name);
    refresh()
}

async function tryData() {
    let item = await GetItems();
    for (let cat in document.getElementsByClassName("tabs")) {
        cat.innerHTML = "";
    }
    for (let it in item) {
        let tt = item[it];
        let dir = document.getElementById(item[it].category);
        if (dir == undefined) {
            dir = document.getElementById("other");
        }
        dir.appendChild(makedata(tt));
    }
}

async function GetItems() {
    let x = await (await fetch(SaleIt)).text();
    let log = JSON.parse(x);
    console.log(log);
    return log;
}

async function GetItemById() {
    let idIn = document.getElementById("GetSaleById");
    let id = parseInt(idIn.value);
    idIn.value = "";
    let log;
    let x = await fetch(SaleIt + "/GetById/" + id, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).catch().then((response) => response.json()).then((data) => log = { data });
    let data = document.getElementById("data");
    data.innerHTML = "";
    for (let dd in log) {
        data.innerHTML += "<li>" + SaleToString(log[dd]) + "</li>";
    }
}

async function AddItem() {
    let strt = document.getElementById("SaleS").value;
    let end = document.getElementById("SaleE").value;
    console.log(strt, end);
    let item = {
        SaleDateStart: new Date(strt),
        SaleDateEnd: new Date(end),
        Name: document.getElementById("name").value,
        SalePercentage: parseInt(document.getElementById("sale").value),
        Category: document.getElementById("Category").value,
    }
    console.log(item);

    await fetch(SaleIt + "/AddItem", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    }).then(res => console.log(res));
}

async function AddUser() {
    let item = {
        name: document.getElementById("UserName").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    }
    await fetch("api/User/AddUser", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    }).then(res => console.log(res));
}

async function GetUserByName(name) {
    let log;
    await fetch("api/User/GetByName/" + name, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(res => res.json()).then(bb => log = bb);
    return log;
}

async function AddItemToUser(idd) {
    console.log(logedUser.id, idd);
    await fetch("api/User/AddItemToUser/" + logedUser.id + ":" + idd, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => console.log(response));
    logedUser = await GetUserByName(logedUser.name);
    refresh();
}

async function Login(name, pass) {
    let us = await GetUserByName(name);
    if (us == undefined || us.password != pass) {
        console.log("err")
    }
    else {
        logedUser = us;
        login();
    }

}

$(function () {
    $(".dropdown-menu > li  a").click(function () {
        console.log("clicked");
        return false;
    });
});

async function SignUp(name, email, pass, adminPass, passValid) {
    if (pass == passValid) {
        let item = {
            name: name,
            email: email,
            password: pass
        }
        await fetch("api/User/AddUser/" + adminPass, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        }).then(res => console.log(res));
    }
    document.getElementById("logdrop").classList.remove("show");
    logedUser = await GetUserByName(name);
}

function logoff() {
    switchTab("home");
    logedUser = undefined;
    login();
}

function login() {
    if (logedUser == undefined) {
        document.getElementById("Account").style.display = "none";
        document.getElementById("login").style.display = "block";
    }
    else {
        document.getElementById("Account").style.display = "block";
        document.getElementById("login").style.display = "none";
    }
}