const NotifiesSetter = document.querySelector(".notifies");
const AddNewStreamer = document.querySelector(".new-streamer");
const StreamerName = document.querySelector(".streamer-name");

chrome.storage.local.get('streamers', function (data) {
  data.streamers.forEach(S => {
    const Template = `<div id="streamer" class="streamer" data-streamer="` + S.name + `">
      <img
        src="`+ S.logo + `" width="48" data-streamer="` + S.name + `">
      <div class="streamer-status" data-streamer="` + S.name + `">
        <b data-streamer="` + S.name + `">`+ S.name + `</b>
        <b class="streamer-live" data-streamer="` + S.name + `">`+ (S.status ? 'LIVE' : 'OFFLINE') + `</b>
      </div>
      <div id="close" class="close" data-name="`+ S.name + `">X</div>
    </div>`

    document.querySelector(".streamer-list").insertAdjacentHTML("beforeend", Template);
  });
});

AddNewStreamer.addEventListener("click", addStreamer)

chrome.storage.local.get('alerts', function (data) {
  NotifiesSetter.checked = data.alerts;
});

document.addEventListener('click', function (e) {
  if (e.target && e.target.dataset.streamer) {
    window.open("https://twitch.tv/" + e.target.dataset.streamer);
    return;
  }
  if (e.target && e.target.id == 'close') {
    removeStreamer(e.target.dataset.name);
    return;
  }
});

function removeStreamer(s) {
  chrome.storage.local.get('streamers', function (data) {
    let Streamers = [...data.streamers.filter(S => S.name !== s)];
    document.querySelector(".streamer[data-streamer='" + s + "']").remove();
    chrome.storage.local.set({ 'streamers': Streamers }, function () {
    });
  });
}

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
      if (Streamers.find(S => S.name == StreamerName.value.toLowerCase())) return;
      Streamers.push({ name: StreamerName.value.toLowerCase(), status: false, logo: ParseText.users[0].logo });
      const Template = `<div id="streamer" class="streamer" data-streamer="` + StreamerName.value.toLowerCase() + `">
      <img
        src="`+ ParseText.users[0].logo + `" width="48" data-streamer="` + StreamerName.value.toLowerCase() + `">
      <div data-streamer="` + StreamerName.value.toLowerCase() + `" class="streamer-status">
        <b data-streamer="` + StreamerName.value.toLowerCase() + `">`+ StreamerName.value.toLowerCase() + `</b>
        <b data-streamer="` + StreamerName.value.toLowerCase() + `" class="streamer-live">Kontrol ediliyor..</b>
      </div>
      <div class="close" id="close" data-name="`+ StreamerName.value.toLowerCase() + `">X</div>
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
