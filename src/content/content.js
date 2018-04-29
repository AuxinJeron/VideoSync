var peer

function updateConnectContent(message) {
    chrome.runtime.sendMessage({ action: 'updateConnectContent', message: message },
        function(response) {})
}

function updateReceiverContent(message) {
	chrome.runtime.sendMessage({action: 'updateReceiverContent', message: message}, 
		function(response) {})
} 

function registerPeerListener(peer) {
    peer.on('error', function(err) {
        console.log('error', err)
    })

    peer.on('signal', function(data) {
        console.log('signal', JSON.stringify(data))
        updateConnectContent(JSON.stringify(data))
    })

    peer.on('connect', function() {
        console.log('connect')
    })

    peer.on('data', function(data) {
        console.log('data: ' + data + ' with type: ' + typeof(data))
        updateReceiverContent(data.toString())
    })
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(sender.tab ? 'from a content script: ' + sender.tab.url : 'from the extension')
    console.log('request action: ' + request.action)
    if (request.action == 'offer') {
        console.log('create offer')
        peer = new SimplePeer({ initiator: true, trickle: false })
        registerPeerListener(peer)
    } else if (request.action == 'answer' || request.action == 'connect') {
        console.log('create signal: ' + request.message)
        peer.signal(JSON.parse(request.message))
    } else if (request.action == 'send') {
        console.log('send message: ' + request.message)
        peer.send(request.message)
    } else {
        console.log('not action: ' + request.action)
    }

    return true
})

window.onload = function() {
    console.log("content page loaded ...")
    peer = new SimplePeer({ initiator: false, trickle: false })
    registerPeerListener(peer)
}