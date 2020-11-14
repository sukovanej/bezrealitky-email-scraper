const email = require("./src/email");
const facebook = require("./src/facebook");

const {
  EMAIL_USER,
  EMAIL_PASSWORD,
  FB_EMAIL,
  FB_PASSWORD,
  THREAD_ID,
} = process.env;

imap = email.createImap(EMAIL_USER, EMAIL_PASSWORD);
const callback = (urls) => {
  let message = "Novy baraky, kundy!\n\n";

  for (url of urls) {
    message = message.concat(` - ${url}\n`);
  }

  facebook.sendMessage(FB_EMAIL, FB_PASSWORD, THREAD_ID, message);
};
email.getNewUrls(imap, callback);
