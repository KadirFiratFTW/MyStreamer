chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.set({ alerts: true, streamers: [] }, function () {

  });
});

chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {

  chrome.declarativeContent.onPageChanged.addRules([{
    conditions: [new chrome.declarativeContent.PageStateMatcher()
    ],
    actions: [new chrome.declarativeContent.ShowPageAction()]
  }]);


});


var rxGoogleSearch = /^https?:\/\/(www\.)?google\.(com|\w\w(\.\w\w)?)\/.*?[?#&]q=/;
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (rxGoogleSearch.test(changeInfo.url)) {
    chrome.tabs.sendMessage(tabId, 'url-update');
  }
})

async function postData(url = '', type, pass = "") {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
  xhr.setRequestHeader('Client-ID', 'atk7r2fb2gu39oak3myi7ydih6oooh');
  xhr.onreadystatechange = function () { ResponseHandler(this, type, pass) }
  xhr.send();
}

function ResponseHandler(resp, type, pass) {
  if (!type) {
    if (resp.readyState !== 4) return;
    if (resp.status !== 200) return; // or whatever error handling you want
    const ParseText = JSON.parse(resp.responseText);

    UpdateStreamer(ParseText.users[0].name, ParseText.users[0].logo, "logo");


    postData('https://api.twitch.tv/kraken/streams/' + ParseText.users[0]._id, 1, ParseText.users[0].name)

  } else {

    if (resp.readyState !== 4) return;
    if (resp.status !== 200) return; // or whatever error handling you want
    const ParseText = JSON.parse(resp.responseText);
    if (ParseText.stream) {
      UpdateStreamer(pass, true, "status", true);
      return;
    }
    UpdateStreamer(pass, false, "status");
  }
}
postData('https://api.twitch.tv/kraken/users?login=benkf', 0)

setInterval(function () {
  console.log("Check streamers...");
  chrome.storage.local.get('streamers', function (data) {

    data.streamers.forEach(S => {
      postData('https://api.twitch.tv/kraken/users?login=' + S.name, 0)
    })
  });

}, 1000);

function UpdateStreamer(name, status, change, triggered = false) {
  chrome.storage.local.get('streamers', function (data) {
    let Streamers = [...data.streamers];
    let Str = Streamers.find(S => S.name == name);
    if (!Str) { return; }
    if (Str.status && !Str.notified && triggered) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs.length) return;

        chrome.tabs.sendMessage(tabs[0].id, { command: "notify", streamer: Str }, function (response) {
          if (window.chrome.runtime.lastError) return;
          Str.notified = true;
          chrome.storage.local.set({ 'streamers': Streamers }, function () {
          });
        });
      });
    }
    if (Str[change] == status) { return; }
    Str[change] = status;
    Str.notified = false;

    chrome.storage.local.set({ 'streamers': Streamers }, function () {
    });
  });
}

