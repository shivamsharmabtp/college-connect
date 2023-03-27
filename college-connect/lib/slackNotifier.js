const rp = require("request-promise");

var slackChannels = {
  "course-alerts": {
    webhook:
      "https://hooks.slack.com/services/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",
  },
  "university-alerts": {
    webhook:
      "https://hooks.slack.com/services/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",
  },
};

function notifySlack(text, channel) {
  var options = {
    method: "POST",
    uri: slackChannels[channel].webhook,
    json: true,
    body: {
      text: text,
    },
  };
  console.log(text);
  return rp(options);
}

module.exports = notifySlack;
