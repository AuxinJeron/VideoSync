var bgPort

chrome.runtime.onInstalled.addListener(function() {
    console.log("Loaded extension")
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(sender.tab ? 'from a content script: ' + sender.tab.url : 'from the extension')
    if (request.action == 'updateConnectContent') {
        console.log('update connect content: ' + request.message)
        bgPort.postMessage(request)
    } else if (request.action == 'updateReceiverContent') {
        console.log('update receiver content: ' + request.message)
        bgPort.postMessage(request)
    }
})

chrome.extension.onConnect.addListener(function(port) {
    console.log('Connected ...')
    if (port.name == 'video sync') {
        bgPort = port
    }
})

function offer(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'offer' }, function(response) {
            console.log(response)
        })
    })
}

function answer(message, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'answer', message: message }, function(response) {
            console.log(response)
        })
    })
}

function connect(message, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'connect', message: message }, function(response) {
            console.log(response)
        })
    })
}

function send(message, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'send', message: message }, function(response) {
            console.log(response)
        })
    })
}