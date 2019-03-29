<template>
	<div>
		<video ref="video" autoplay class="test-video" playsinline></video>

		<v-layout space-between>
			<v-btn color="#ffb948" outline @click="connect()">Connect</v-btn>
			<v-btn color="#ffb948" outline @click="onSdpText()">Receive</v-btn>
			<!-- <v-btn color="#ffb948" outline @click="">Connect</v-btn> -->
		</v-layout>

		<div class="px-5">
			<div class="create-break mb-5" v-html="textForSend"></div>

			<v-textarea label="textToReceiveSdp" outline v-model="textToReceiveSdp"></v-textarea>
		</div>

	</div>
</template>

<script>
export default {
	data () {
		return {
			localStream: null,
			peerConnection: null,
			negotiationneededCounter: 0,
			textForSend: '',
			textToReceiveSdp: '',
			ws: null,
		}
	},

	mounted () {
		if(!navigator.mediaDevices) {
			navigator.mediaDevices = {}
			navigator.mediaDevices.getUserMedia = function(constraints) {
				var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

				if (!getUserMedia) {
					return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
				}

				return new Promise(function(resolve, reject) {
					getUserMedia.call(navigator, constraints, resolve, reject);
				});
			}
		}

		navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true
		})
		.then(stream => {
			// this.playVideo(stream)
			this.localStream = stream
		})
		.catch(error => {
			alert('接続できませんでした')
			console.error('getUserMedia() error ->', error)
			return;
		})

		// const wsUrl = 'ws://localhost:3001/';
		const wsUrl = 'wss://floating-ocean-47278.herokuapp.com/';
		this.ws = new WebSocket(wsUrl);
		this.ws.onopen = (evt) => {
			console.log('ws open()');
		};
		this.ws.onerror = (err) => {
			console.error('ws onerror() ERR:', err);
		};
		this.ws.onmessage = (evt) => {
			console.log('ws onmessage() data:', evt.data);
			const message = JSON.parse(evt.data);
			switch(message.type){
				case 'offer': {
					console.log('Received offer ...');
					this.textToReceiveSdp = message.sdp;
					this.setOffer(message);
					break;
				}
				case 'answer': {
					console.log('Received answer ...');
					this.textToReceiveSdp = message.sdp;
					this.setAnswer(message);
					break;
				}
				case 'candidate': {
					console.log('Received ICE candidate ...');
					const candidate = new RTCIceCandidate(message.ice);
					console.log(candidate);
					this.addIceCandidate(candidate);
					break;
				}
				case 'close':
					console.log('peer is closed ...');
					this.hangUp();
					break;
				default: {
					console.log("Invalid message");
					break;
				}
			}
		};
	},

	methods: {
		playVideo (stream) {
			this.$refs.video.srcObject = stream
		},

		prepareNewConnection (isOffer) {
			let vm = this
			const pc_config = {"iceServers":[ {"urls":"stun:stun.webrtc.ecl.ntt.com:3478"} ]};
			const peer = new RTCPeerConnection(pc_config);

			// リモートのMediaStreamTrackを受信した時
			peer.ontrack = evt => {
				console.log('-- peer.ontrack()');
				this.playVideo(evt.streams[0]);
			};

			// ICE Candidateを収集したときのイベント
			peer.onicecandidate = evt => {
				if (evt.candidate) {
					console.log(evt.candidate);
					this.sendIceCandidate(evt.candidate);
				} else {
					console.log('empty ice event');
				}
			};

			// Offer側でネゴシエーションが必要になったときの処理
			peer.onnegotiationneeded = async () => {
				try {
					if(isOffer){
						if(vm.negotiationneededCounter === 0){
							peer.createOffer().then(offer => {
								console.log('createOffer() succsess in promise');
								peer.setLocalDescription(offer)
								.then(() => {
									console.log('setLocalDescription() succsess in promise');
									vm.sendSdp(peer.localDescription);
								});
								vm.negotiationneededCounter++;
							});
						}
					}
				} catch(err){
					console.error('setLocalDescription(offer) ERROR: ', err);
				}
			}

			// ICEのステータスが変更になったときの処理
			peer.oniceconnectionstatechange = function() {
				console.log('ICE connection Status has changed to ' + peer.iceConnectionState);
				switch (peer.iceConnectionState) {
					case 'closed':
						break;
					case 'failed':
						if (this.peerConnection) {
							hangUp();
						}
						break;
					case 'disconnected':
						break;
				}
			};

			// ローカルのMediaStreamを利用できるようにする
			if (this.localStream) {
				console.log('Adding local stream...');
				this.localStream.getTracks().forEach(track => peer.addTrack(track, this.localStream));
			} else {
				console.warn('no local stream, but continue.');
			}

			return peer;
		},

		sendSdp(sessionDescription) {
			console.log('---sending sdp ---');
			if(sessionDescription) {
				this.textForSend = sessionDescription.sdp
			}

			const message = JSON.stringify(sessionDescription);
			console.log('sending SDP=' + message);
			this.ws.send(message);
		},

		connect() {
			if (! this.peerConnection) {
				console.log('make Offer');
				this.peerConnection = this.prepareNewConnection(true);
			}
			else {
				console.warn('peer already exist.');
			}
		},

		makeAnswer() {
			console.log('sending Answer. Creating remote session description...' );
			if (! this.peerConnection) {
				console.error('peerConnection NOT exist!');
				return;
			}
			try{
				this.peerConnection.createAnswer()
				.then(answer => {
					console.log('createAnswer() succsess in promise');
					this.peerConnection.setLocalDescription(answer)
					.then(() => {
						console.log('setLocalDescription() succsess in promise');
						this.sendSdp(this.peerConnection.localDescription);
					})
				})
			} catch(err){
				console.error(err);
			}
		},

		onSdpText() {
			if(this.textToReceiveSdp) {
				if (this.peerConnection) {
					console.log('Received answer text...');
					const answer = new RTCSessionDescription({
						type : 'answer',
						sdp : this.textToReceiveSdp,
					});
					this.setAnswer(answer);
				} else {
					console.log('Received offer text...');
					const offer = new RTCSessionDescription({
						type : 'offer',
						sdp : this.textToReceiveSdp,
					});
					this.setOffer(offer);
				}
				this.textToReceiveSdp = ''
			}
		},

		setOffer(sessionDescription) {
			if (this.peerConnection) {
				console.error('peerConnection alreay exist!');
			}
			this.peerConnection = this.prepareNewConnection(false);
			try{
				this.peerConnection.setRemoteDescription(sessionDescription);
				console.log('setRemoteDescription(answer) succsess in promise');
				this.makeAnswer();
			} catch(err){
				console.error('setRemoteDescription(offer) ERROR: ', err);
			}
		},

		setAnswer(sessionDescription) {
			if (! this.peerConnection) {
				console.error('peerConnection NOT exist!');
				return;
			}
			try{
				this.peerConnection.setRemoteDescription(sessionDescription);
				console.log('setRemoteDescription(answer) succsess in promise');
			} catch(err){
				console.error('setRemoteDescription(answer) ERROR: ', err);
			}
		},

		hangUp (){
			if (this.peerConnection) {
				if(this.peerConnection.iceConnectionState !== 'closed'){
					this.peerConnection.close();
					this.peerConnection = null;
					this.negotiationneededCounter = 0;


					const message = JSON.stringify({ type: 'close' });
					console.log('sending close message');
					this.ws.send(message);
					this.cleanupVideoElement();
					this.textForSend = '';
					return;
				}
			}
			console.log('peerConnection is closed.');
		},

		cleanupVideoElement () {
			let element = this.$refs.video
			element.pause();
			element.srcObject = null;
		},

		addIceCandidate(candidate) {
			if (this.peerConnection) {
				this.peerConnection.addIceCandidate(candidate);
			}
			else {
				console.error('PeerConnection not exist!');
				return;
			}
		},

		sendIceCandidate(candidate) {
			console.log('---sending ICE candidate ---');
			const message = JSON.stringify({ type: 'candidate', ice: candidate });
			console.log('sending candidate=' + message);
			this.ws.send(message);
		}
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
video.test-video {
	width: 100%;
}
.create-break {
	white-space: pre;
}
</style>
