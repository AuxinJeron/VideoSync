function registerListener() {
    console.log('Register listener ...')
    var bgPage = chrome.extension.getBackgroundPage();
    document.querySelector('#offer_btn').addEventListener('click', function(event) {
        event.preventDefault()
        console.log('offer_btn clicked')
        bgPage.offer(updateConnectContent)
    })

    document.querySelector('#answer_btn').addEventListener('click', function(event) {
        event.preventDefault()
        console.log('answer_btn clicked')
        message = document.querySelector('#connect_content').value
        bgPage.answer(message, null)
    })

    document.querySelector('#connect_btn').addEventListener('click', function(event) {
        event.preventDefault()
        console.log('connect_btn clicked')
        message = document.querySelector('#connect_content').value
        bgPage.connect(message, null)
    })

    document.querySelector('#send_btn').addEventListener('click', function(event) {
        event.preventDefault()
        console.log('send_btn clicked')
        message = document.querySelector('#sender_content').value
        bgPage.send(message, null)
    })

    bgPage.isReady(refreshReady)
}

function refreshReady(isReady) {
    if (isReady) {
    	updateConnectContent('ready')
    } else {
    	updateConnectContent('pending')
    }
}

function updateConnectContent(message) {
	console.log('update connect content: ' + message)
    document.querySelector('#connect_content').value = message
}

function updateReceiverContent(message) {
    document.querySelector('#receiver_content').value = message
}

var port = chrome.extension.connect({ name: 'video sync' })
port.onMessage.addListener(function(msg) {
    console.log('message received: ' + msg.action)
    if (msg.action == 'updateConnectContent') {
        updateConnectContent(msg.message)
    } else if (msg.action == 'updateReceiverContent') {
    	updateReceiverContent(msg.message)
    }
})

window.onload = function() {
    registerListener()
}