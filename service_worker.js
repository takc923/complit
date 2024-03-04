var winHistory = [-1, -1];

chrome.windows.onFocusChanged.addListener(newWinId => {
    if (newWinId == chrome.windows.WINDOW_ID_NONE) return;

    winHistory.shift();
    winHistory.push(newWinId);
});

chrome.windows.onRemoved.addListener(removedWinId => {
    winHistory = winHistory.map(id => id == removedWinId ? -1 : id);
});

chrome.action.onClicked.addListener(tab => {
    chrome.tabs.query({highlighted: true, currentWindow: true}, tabs => {
        tabs.length == 1 ? combine() : split(tabs);
    });
});

function combine() {
    if (winHistory.some(id => id == -1)) return;
    chrome.windows.get(winHistory[0], {populate: true}, lastWin => {
        var tabIds = lastWin.tabs.map(tab => tab.id);
        chrome.tabs.move(tabIds, {windowId: winHistory[1], index: -1});
    });
}

function split(tabs){
    var tabIds = tabs.map(tab => tab.id);
    var firstTabId = tabIds.shift();
    chrome.windows.create({tabId: firstTabId}, win => {
        chrome.tabs.move(tabIds, {windowId: win.id, index: -1});
    });
}
