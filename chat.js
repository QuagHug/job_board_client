const APP_URI = "https://job-board-hung-luu.herokuapp.com";

const socket = io("https://job-board-hung-luu.herokuapp.com/socket.io/socket.io.js", {
    transports: ['websocket']
});

const message_input = document.getElementById("message-input");
const send_button = document.getElementById("send-button");
const recruiter_msg_container = document.getElementById("recruiter-msg-container");
const recruiter_display_msg = document.getElementById("recruiter-display-msg");
const candidate_msg_container = document.getElementById("candidate-msg-container");
const candidate_display_msg = document.getElementById("recruiter-display-msg");
const chat_container = document.getElementById("chat-container");
const chat_display = document.getElementById("chat-display");

function displayCandidateMessage(message) {
    const msg_container = document.createElement("div");
    msg_container.setAttribute("class", "candidate-msg-container");

    const display_msg = document.createElement("div");
    display_msg.setAttribute("class", "candidate-display-msg");
    display_msg.innerHTML = message;
    
    msg_container.appendChild(display_msg);
    chat_container.appendChild(msg_container);
}

function displayRecruiterMessage(message) {
    const msg_container = document.createElement("div");
    msg_container.setAttribute("class", "recruiter-msg-container");

    const chat_ava = document.createElement("div");
    chat_ava.setAttribute("src", "img/chat-avatar.png");
    chat_ava.setAttribute("width", "40px");
    chat_ava.setAttribute("height", "40px");
    chat_ava.setAttribute("class", "chat-ava");

    const display_msg = document.createElement("div");
    display_msg.setAttribute("class", "recruiter-display-msg");
    display_msg.innerHTML = message;
    
    msg_container.appendChild(chat_ava);
    msg_container.appendChild(display_msg);
    chat_container.appendChild(msg_container);
}

socket.emit("send-message-candidate", "hello");

async function getMessageForCandidate() {
    const response = await fetch(APP_URI + "/chat/message?" + new URLSearchParams({ recruiterId: sessionStorage.getItem("currentJobRecruiterId"), candidateId: sessionStorage.getItem("userId") }));
    const chatResult = await response.json();
    chatResult.data.forEach(chat => {
        if(sessionStorage.getItem("currentJobRecruiterId") == chat.attributes.from_id) {
            return displayRecruiterMessage(chat.attributes.message);
        }
        displayCandidateMessage(chat.attributes.message);
    })
}

if(sessionStorage.getItem("jwt") && sessionStorage.getItem("userType") == "candidate") {
    getMessageForCandidate();
    send_button.addEventListener("click", event => {
        const message = message_input.value;
        displayCandidateMessage(message);
        socket.emit("send-message-candidate", message, sessionStorage.getItem("currentJobRecruiterId")+sessionStorage.getItem("userId"));
    }) 
    socket.emit("join-room-candidate", sessionStorage.getItem("currentJobRecruiterId"), sessionStorage.getItem("userId"));
    socket.on("receive-message", displayRecruiterMessage);
} 

function getChatForRecruiter() {
    fetch(APP_URI + "/chat/recruiter-chat?" + new URLSearchParams({ _id: sessionStorage.getItem("userId") }))
    .then(async res => {
        const result = await res.json();
        const user_container = document.createElement("div");
        result.data.forEach(user => {
            user_container.setAttribute("id", "chat-container")
            const user_card = document.createElement("div");
            user_card.setAttribute("userId", user.attributes._id);
            user_card.setAttribute("class", "chat-container")
            user_card.innerHTML = user.attributes.firstName + ' ' + user.attributes.firstName;
            user_container.appendChild(user_card);
            user_card.addEventListener("click", async event => {
                chat_display.innerHTML = "";
                const response = await fetch(APP_URI + "/chat/message" + new URLSearchParams({ recruiterId: sessionStorage.getItem("userId"), candidateId: user.attributes._id }));
                const chatResult = await response.json();
                chatResult.data.forEach(chat => {
                    if(sessionStorage.getItem("userId") == chat.attributes.from_id) {
                        return displayRecruiterMessage(chat.attributes.message);
                    }
                    displayCandidateMessage(chat.attributes.message);
                })
                socket.emit("join-room-recruiter", sessionStorage.getItem("userId"), user.attributes._id);
                socket.on("receive-message", displayCandidateMessage);
            })            
        })
    })
}

if(sessionStorage.jwt && sessionStorage.userType == "recruiter") getChatForRecruiter();