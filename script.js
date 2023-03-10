const APP_URI = "https://job-board-hung-luu.herokuapp.com";
const MAIN_PAGE_URI = "https://job-board-hung-luu-client.herokuapp.com"
const form = document.getElementById("search-input");
const search_board = document.getElementById("search-result");
const search_button = document.getElementById("search-button");
const nav_bar = document.getElementById("nav-bar");
const nav_bar_list = document.getElementById("nav-bar-list");

const email_form = document.getElementById("email-input");
const password_form = document.getElementById("password-input");
const login_button = document.getElementById("login-button");
const error_card = document.getElementById("error-card");
const login_text = document.getElementById("login-text");
const register_text = document.getElementById("register-text");
const login_intput_card = document.getElementById("login-input-card");
const register_intput_card = document.getElementById("register-input-card");

const register_email_form = document.getElementById("register-email-input");
const register_password_form = document.getElementById("register-password-input");
const register_confirm_password_form = document.getElementById("register-confirm-password-input");
const register_first_name_form = document.getElementById("register-first-name-input");
const register_last_name_form = document.getElementById("register-last-name-input");
const register_button = document.getElementById("register-button");
const register_error_card = document.getElementById("register-error-card");
const user_type = document.getElementById("user-type");

const main_login_button = document.getElementById("main_login_button");
const menu_icon = document.getElementById("menu-icon");

function getJobs(uri, keyWord) {
    console.log("here");
    fetch(uri+`/jobs/search?title=${keyWord}`)
    .then(response => response.json())
    .then(result => {
        result.data.forEach(async job => {
            console.log(job.attributes.title);
            const company = (await (await fetch(uri+`/companies/`+job.attributes.companyId)).json()).data.attributes;

            const job_card = document.createElement("div");
            job_card.setAttribute("class", "job-card");
            job_card.setAttribute("job_id", job.attributes.recruiterId);

            const job_image = document.createElement("img");
            job_image.setAttribute("class", "company-logo");
            
            const info_card = document.createElement("div");
            info_card.setAttribute("class", "info-card");

            const job_info1 = document.createElement("div");
            job_info1.setAttribute("class", "job-info");
            job_info1.innerHTML = `Company name: ${company.name}`

            const job_info2 = document.createElement("div");
            job_info2.setAttribute("class", "job-info");
            job_info2.innerHTML = `Title: ${job.attributes.title}`

            const job_info3 = document.createElement("div");
            job_info3.setAttribute("class", "job-info");
            job_info3.innerHTML = `Level: ${job.attributes.level}`

            const apply_button = document.createElement("button");
            apply_button.setAttribute("class", "apply-button");
            apply_button.innerHTML = "Apply/Connect now";
            
            job_image.src = company.logoUrl;
            job_card.appendChild(job_image);
            job_card.appendChild(info_card);
            info_card.appendChild(job_info1);
            info_card.appendChild(job_info2);
            info_card.appendChild(job_info3);
            info_card.appendChild(apply_button);
            search_board.appendChild(job_card);

            apply_button.addEventListener("click", event => {
                sessionStorage.setItem("currentJobRecruiterId", job.attributes.recruiterId);
                window.location.replace(MAIN_PAGE_URI+"/chat.html");
            })
        })
    })
}

function makeSignIn(uri, email, password) {
    fetch(uri + "/verification/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },  
        credentials: "include",
        body: JSON.stringify({ email, password })
    })
    .then(async res => {
        const result = await res.json();
        if(res.status != 200) {
            const errorText = document.createElement("div");
            errorText.innerHTML = result.detail;
            error_card.innerHTML = "";
            errorText.setAttribute("class", "error-text");
            return error_card.appendChild(errorText);
        } 
        // const expireDate = new Date((new Date()).getTime() + result.authentication.expire).toISOString();
        // document.cookie = `jwt=${result.authentication.jwt}; expire=${expireDate}; path=/`;
        sessionStorage.setItem("jwt", result.authentication.jwt);
        sessionStorage.setItem("userType", result.data.attributes.userType);
        sessionStorage.setItem("userId", result.data.attributes._id);
        window.location.replace(MAIN_PAGE_URI);
    })
    
} 

function makeRegister(uri, email, firstName, lastName, password, confirm_password, userType) {
    if(password != confirm_password) {
        const errorText = document.createElement("div");
        errorText.innerHTML = "Password different from password confirm";
        register_error_card.innerHTML = "";
        errorText.setAttribute("class", "error-text");
        return register_error_card.appendChild(errorText);
    }
    fetch(uri + "/api/users/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, emailConfirmed: false, firstName, lastName, password, userType })
    })
    .then(async res => {
        const result = await res.json();
        console.log(result);
        if(res.status != 200) {
            const errors = [result.detail.firstName, result.detail.lastName, result.detail.email]
            const errorText = document.createElement("div");
            errors.forEach(error => {
                if(error) errorText.innerHTML += error + "<br>";
            })
            register_error_card.innerHTML = "";
            errorText.setAttribute("class", "error-text");
            return register_error_card.appendChild(errorText);
        } 
        const errorText = document.createElement("div");
        errorText.innerHTML = "Confirmation code was sent, please check you email!";
        register_error_card.innerHTML = "";
        errorText.setAttribute("class", "success-text");
        return register_error_card.appendChild(errorText);
    })
}

function checkLogin(jwt, uri) {
    fetch(uri + "/authenticate", {
        headers: {
            "jwt": jwt
        }
    })
    .then(async res => {
        const result = await res.json();
        if(res.status != 200) return;
        main_login_button.remove();
        const login_user = document.createElement("a");
        login_user.innerHTML = result.data.attributes.firstName + ' ' + result.data.attributes.lastName;
        login_user.setAttribute("class", "login");
        return nav_bar.appendChild(login_user);
    })
}

window.addEventListener("load", event => {
    console.log("loaded");
    if(sessionStorage.getItem("jwt") && (window.location.href == MAIN_PAGE_URI + "/index.html" || window.location.href == MAIN_PAGE_URI + '/')) {
        checkLogin(sessionStorage.jwt, APP_URI);
        search_button.dispatchEvent(new Event("click"))
    }
    if(sessionStorage.getItem("userType") == "recruiter") {
        console.log("success");
        const dashboard = document.createElement("a");
        dashboard.innerHTML = "Dashboard";
        dashboard.setAttribute("href", "./chat.html");
        nav_bar_list.appendChild(dashboard)
    }
})

if(menu_icon) menu_icon.addEventListener("click", event => {
    nav_bar_list.classList.toggle("active");
})

if(search_button) search_button.addEventListener("click", event => { 
    const searchItem = form.value;
    console.log(searchItem);
    search_board.innerHTML = "";
    getJobs(APP_URI, searchItem);
})

if(login_button) login_button.addEventListener("click", event => { 
    console.log("here");
    const email = email_form.value;
    const password = password_form.value;
    makeSignIn(APP_URI, email, password);
})

if(register_button) register_button.addEventListener("click", event => { 
    console.log("here");
    const email = register_email_form.value;
    const password = register_password_form.value;
    const confirm_password = register_confirm_password_form.value;
    const firstName = register_first_name_form.value;
    const lastName = register_last_name_form.value;
    const userType = user_type.value;
    makeRegister(APP_URI, email, firstName, lastName, password, confirm_password, userType);
})

if(login_text) login_text.addEventListener("click", event => { 
    login_text.style.color = "black";
    register_text.style.color = "grey";
    login_intput_card.style.display = "block"
    register_intput_card.style.display = "none"
})

if(register_text) register_text.addEventListener("click", event => { 
    login_text.style.color = "grey";
    register_text.style.color = "black";
    login_intput_card.style.display = "none"
    register_intput_card.style.display = "block"
})