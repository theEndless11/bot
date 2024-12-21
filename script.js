// Initialize variables
let username = prompt("Enter your username:");
let ably = new Ably.Realtime('knH84g.xyERFQ:_YgFb-hkCXQNM2gCyRhIt2Q0NWuKd2JmfNhLZILR7DE');
let channel = ably.channels.get('chat-room');

// Arrays to store users and messages
let users = [];
let messages = [];

// DOM Elements
let messageInput = document.getElementById('message-input');
let sendButton = document.getElementById('send-button');
let chatMessages = document.getElementById('chat-messages');
let userList = document.getElementById('user-list');
let userStatus = document.getElementById('user-status');
let userSelect = document.getElementById('user-select');

// Send message to channel
function sendMessage() {
    let message = messageInput.value.trim();
    if (message !== "") {
        channel.publish('message', { user: username, text: message, time: new Date().toLocaleTimeString() });
        messageInput.value = '';
    }
}

// Handle new messages
channel.subscribe('message', (msg) => {
    let msgElement = document.createElement('div');
    msgElement.innerHTML = `<strong>${msg.data.user}</strong> [${msg.data.time}]: ${msg.data.text}`;
    chatMessages.appendChild(msgElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
});

// Handle user joining and leaving
channel.subscribe('user-action', (msg) => {
    if (msg.data.action === 'join') {
        users.push(msg.data.username);
    } else if (msg.data.action === 'leave') {
        users = users.filter(user => user !== msg.data.username);
    }
    updateUserList();
    updateUserStatus(msg.data.action, msg.data.username);
});

// Update the list of available users
function updateUserList() {
    userList.innerHTML = '';
    users.forEach(user => {
        let userItem = document.createElement('li');
        userItem.textContent = user;
        userList.appendChild(userItem);
    });
}

// Update the user status when someone joins or leaves
function updateUserStatus(action, username) {
    if (action === 'join') {
        userStatus.textContent = `${username} has joined the chat.`;
    } else if (action === 'leave') {
        userStatus.textContent = `${username} has left the chat.`;
    }
}

// Handle private message
userSelect.addEventListener('change', () => {
    let selectedUser = userSelect.value;
    if (selectedUser) {
        channel.publish('private-message', { to: selectedUser, from: username, text: 'Private message initiated' });
    }
});

// Initialize the user and notify others of joining
function initializeUser() {
    channel.publish('user-action', { action: 'join', username: username });
    users.push(username);
    updateUserList();
}

// Listen for when a user joins or leaves the chat
initializeUser();

// Add event listener to send button
sendButton.addEventListener('click', sendMessage);

// Add event listener for enter key to send message
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
