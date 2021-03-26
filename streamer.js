const NotifiesSetter = document.querySelector(".notifies");
const AddNewStreamer = document.querySelector(".new-streamer");
const StreamerName = document.querySelector(".streamer-name");

chrome.storage.local.get('streamers', function (data) {
  data.streamers.forEach(S => {
    const Template = `<div class="streamer" data-streamer="` + S.name + `" data-href="https://twitch.tv/` + S.name + `">
      <img
        src="`+ S.logo + `" width="48">
      <div class="streamer-status">
        <b>`+ S.name + `</b>
        <b class="streamer-live">`+ (S.status ? 'LIVE' : 'OFFLINE') + `</b>
      </div>
    </div>`

    document.querySelector(".streamer-list").insertAdjacentHTML("beforeend", Template);
  });
});

AddNewStreamer.addEventListener("click", addStreamer)

chrome.storage.local.get('alerts', function (data) {
  NotifiesSetter.checked = data.alerts;
});


async function addStreamer() {

  const xhr = new XMLHttpRequest();
  xhr.open('GET', "https://api.twitch.tv/kraken/users?login=" + StreamerName.value.toLowerCase(), true);
  xhr.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
  xhr.setRequestHeader('Client-ID', 'atk7r2fb2gu39oak3myi7ydih6oooh');
  xhr.onreadystatechange = function () {
    if (this.readyState !== 4) return;
    if (this.status !== 200) return;
    const ParseText = JSON.parse(this.responseText);

    chrome.storage.local.get('streamers', function (data) {
      let Streamers = [...data.streamers];
      Streamers.push({ name: StreamerName.value.toLowerCase(), status: false, logo: ParseText.users[0].logo });
      const Template = `<div class="streamer" data-streamer="` + StreamerName.value.toLowerCase() + `" data-href="https://twitch.tv/` + StreamerName.value.toLowerCase() + `">
      <img
        src="`+ ParseText.users[0].logo + `" width="48">
      <div class="streamer-status">
        <b>`+ StreamerName.value.toLowerCase() + `</b>
        <b class="streamer-live">CHECKING</b>
      </div>
    </div>`

      document.querySelector(".streamer-list").insertAdjacentHTML("beforeend", Template);


      chrome.storage.local.set({ 'streamers': Streamers }, function () {
        StreamerName.value = "";
      });
    });

  }
  xhr.send();
}

setInterval(function () {
  chrome.storage.local.get('streamers', function (data) {
    data.streamers.forEach(S => {
      document.querySelector("[data-streamer='" + S.name + "'] img").src = S.logo;
      document.querySelector("[data-streamer='" + S.name + "'] .streamer-live").innerHTML = S.status ? "LIVE" : "OFFLINE";

    })
  });
}, 5000);
