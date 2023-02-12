const socket = io("https://job-board-hung-luu.herokuapp.com/api/users", {
    transports: ['websocket']
});

const message_input = document.getElementById("message-input");
const send_button = document.getElementById("send-button");
const recruiter_msg_container = document.getElementById("recruiter-msg-container");
const recruiter_display_msg = document.getElementById("recruiter-display-msg");
const candidate_msg_container = document.getElementById("candidate-msg-container");
const candidate_display_msg = document.getElementById("recruiter-display-msg");
const chat_container = document.getElementById("chat-container");

function displayCandidateMessage(message) {
    const msg_container = document.createElement("div");
    msg_container.setAttribute("class", "candidate-msg-container");

    const display_msg = document.createElement("div");
    display_msg.setAttribute("class", "candidate-display-msg");
    display_msg.innerHTML = message;
    
    msg_container.appendChild(display_msg);
    chat_container.appendChild(msg_container);
}

socket.emit("send-message-candidate", "hello");

if(!sessionStorage.jwt && sessionStorage.userType == "candidate") {
    socket.emit("join-room", sessionStorage.getItem("currentJobRecruiterId"), sessionStorage.getItem("userId"));
    send_button.addEventListener("click", event => {
        const message = message_input.value;
        displayCandidateMessage(message);
        socket.emit("send-message", message, sessionStorage.getItem("currentJobRecruiterId")+sessionStorage.getItem("userId"));
    })
} 

