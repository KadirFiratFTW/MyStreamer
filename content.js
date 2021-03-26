
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.command === 'notify') {
        Notify(request.streamer);
    }
    sendResponse({ result: "success" });
});

function Notify(Streamer) {
    console.log(Streamer);
    const Template = `<div data-deleteTime='` + (Date.now() + 5000) + `' class='notify-my-streamer'><img style="margin-right:20px;" src="` + Streamer.logo + `" width="48"> ` + Streamer.name + ` şimdi yayında!</div>`
    const AddedElement = document.querySelector(".notify-list-streamer").insertAdjacentHTML("beforeend", Template);
}

window.onload = function () {
    var css = '.notify-my-streamer { background: #191919; color: white; font-weight: bold; display: flex; justify-content: center; align-items: center; padding: 10px; margin: 15px; border-radius: 10px; box-shadow: 0 0 3px #19191919; width: 93%; border: 1px solid #292929;} .notify-list-streamer { display: flex; justify-content: flex-end; width: 350px; height: fit-content; position: fixed; right: 0; top: 0; z-index: 12412412412412; align-items: center; flex-wrap: wrap; flex-direction: column; }',
        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');

    head.appendChild(style);
    style.type = 'text/css';
    if (style.styleSheet) {
        // This is required for IE8 and below.
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    const NList = document.createElement("div");
    NList.className = "notify-list-streamer";
    document.body.appendChild(NList);
}

setInterval(function () {

    const FindRemovables = document.querySelectorAll(".notify-my-streamer");
    if (!FindRemovables.length) return;

    FindRemovables.forEach(E => {
        if (E.dataset.deletetime < Date.now()) {
            E.remove();
        }
    });

}, 1000)
