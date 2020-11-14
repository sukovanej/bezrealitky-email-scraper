const login = require("facebook-chat-api");

function sendMessage(email, password, threadId, message) {
  login({ email: email, password: password }, (err, api) => {
    if (err) return console.error(err);
    api.sendMessage(message, threadId);
  });
}

module.exports = {
  sendMessage,
};
