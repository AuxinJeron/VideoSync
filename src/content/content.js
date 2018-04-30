function AJVideo(video) {
	this.currentSrc = video.currentSrc
	this.currentTime = video.currentTime
	this.paused = video.paused
}

var peer
var readyConnect = false
var syncedVideo

function updateConnectContent(message) {
    chrome.runtime.sendMessage({ action: 'updateConnectContent', message: message },
        function(response) {})
}

function updateReceiverContent(message) {
	chrome.runtime.sendMessage({action: 'updateReceiverContent', message: message}, 
		function(response) {})
} 

// update video state for current page based on remote video
function updateVideoPlayState(remoteVideo) {
	syncedVideo = remoteVideo
	video = player.getElementsByClassName("youku-film-player")[0].getElementsByTagName("video")[0]
	// TODO: check the video src, currentSrc is not reliable
	if (remoteVideo.paused == true && video.paused == false) {
		video.pause()
	} else if (remoteVideo.paused == false && video.paused == true) {
		video.play()
	}
	video.currentTime = remoteVideo.currentTime
}

// sync video state of current page to remote page 
function syncVideoPlayState(video) {
	console.log('syncVideoPlayback: ' + video)
	syncedVideo = new AJVideo(video)
	peer.send(JSON.stringify(
		{action: 'syncVideoPlayback', video: syncedVideo}))
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
       	updateConnectContent('conncted')
    })

    peer.on('data', function(data) {
        console.log('data: ' + data + ' with type: ' + typeof(data))
        jsonData = JSON.parse(data)
        if (jsonData.action == 'syncVideoPlayback') {
        	console.log('remote video: ' + jsonData.video)
        	updateVideoPlayState(jsonData.video)
        } else if (jsonData.action == 'sendMessage') {
        	updateReceiverContent(jsonData.message)
        }
    })
}

function registerVideoListener(video) {
	console.log("Register video event listener")
	video.addEventListener('pause', function() {
		console.log('video paused')
		syncedVideo = new AJVideo(video)
		syncVideoPlayState(video)
	}, true)

	video.addEventListener('play', function() {
		console.log('video played')
		syncedVideo = new AJVideo(video)
		syncVideoPlayState(video)
	}, true)

	video.addEventListener('timeupdate', function() {
		console.log('time update')
		if (syncedVideo.paused == true) {
			video.pause()
		}
		if (Math.abs(syncedVideo.currentTime - video.currentTime) > 1000) {
			syncedVideo = new AJVideo(video)
			syncVideoPlayState(video)
		}
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
        console.log('send message: ' + JSON.stringify({action: "sendMessage", message: request.message}))
        peer.send(JSON.stringify({action: "sendMessage", message: request.message}))
    } else if (request.action == 'isReady') {
    	sendResponse(readyConnect)
    } else {
        console.log('not action: ' + request.action)
    }

    return true
})

window.onload = function() {
    console.log("content page loaded ...")
    peer = new SimplePeer({ initiator: false, trickle: false })
    registerPeerListener(peer)
    video = player.getElementsByClassName("youku-film-player")[0].getElementsByTagName("video")[0]
    registerVideoListener(video)
    syncedVideo = new AJVideo(video)
    readyConnect = true
}