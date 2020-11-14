const Imap = require("imap");
const simpleParser = require("mailparser").simpleParser;
const cheerio = require("cheerio");
const process = require("process");

function createImap(email, password) {
  return new Imap({
    user: email,
    password: password,
    host: "imap.seznam.cz",
    port: 993,
    tls: true,
  });
}

function parseEmailContentGetUrl(html) {
  const selector =
    "table > tbody > tr > td > table > tbody > tr > td > div > table > tbody > tr > td > a";
  const $ = cheerio.load(html);
  const nodes = $(selector);
  if (!nodes) return false;

  for (const node of Object.values(nodes)) {
    if (node.attribs.href.includes("utm_campaign=hlidaci_pes")) {
      return node.attribs.href;
    }
  }
}

function getNewUrls(imap, callback) {
  function openInbox(cb) {
    imap.openBox("newsletters", false, cb);
  }

  let urls = [];

  imap.once("ready", function () {
    openInbox(function (err, box) {
      if (err) throw err;

      const searchFilters = ["UNSEEN", ["SINCE", "November 1, 2020"]];

      imap.search(searchFilters, function (err, results) {
        try {
          const f = imap.fetch(results, {
            bodies: [""],
            markSeen: true,
          });
        } catch (err) {
          console.warn(err.message);
          imap.end();
          process.exit(1);
        }

        imap.setFlags(results, ["\\Seen"], function (err) {
          if (!err) {
            console.log("marked as read");
          } else {
            console.log(JSON.stringify(err, null, 2));
          }
        });

        f.on("message", function (msg, seqno) {
          msg.on("body", function (stream, info) {
            simpleParser(stream, (err, mail) => {
              if (mail.subject == "Upozornění na nové nemovitosti") {
                const url = parseEmailContentGetUrl(mail.html);
                urls.push(url);
                console.log(`Nova nabidka: ${url}`);
              }
            });
          });
        });

        f.once("error", function (err) {
          console.log("Fetch error: " + err);
        });

        f.once("end", function () {
          imap.end();
        });
      });
    });
  });

  imap.once("error", function (err) {
    console.log(err);
  });

  imap.once("close", function () {
    console.log("Connection ended");
    callback(urls);
  });

  imap.connect();
}

module.exports = {
  createImap,
  getNewUrls,
};
