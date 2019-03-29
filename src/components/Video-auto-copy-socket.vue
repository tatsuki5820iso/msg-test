<template>
	<div>
		<div class="text-center">
			<video ref="video" autoplay class="test-video" playsinline></video>
		</div>

		<v-layout justify-center wrap pb-5>
			<div class="mx-2 wrapper-card">
				<audio-test :stream="localStream" :user="me" v-if="localStream"></audio-test>
			</div>
			<div class="wrapper-card" v-if="streams.length" v-for="stream in streams">
				<audio-test :stream="stream" :user="users[0]" v-if="localStream && users.length"></audio-test>
			</div>
		</v-layout>

		<v-layout space-between>
			<v-btn color="#ffb948" outline @click="connect()">Connect</v-btn>
			<v-btn color="#ffb948" outline @click="onSdpText()">Receive</v-btn>
		</v-layout>

		<div class="px-5">
			<div class="create-break mb-5" v-html="textForSend"></div>

			<v-textarea label="textToReceiveSdp" outline v-model="textToReceiveSdp"></v-textarea>
		</div>

	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import AudioTest from './Audio/Test'

export default {
	components: {
		AudioTest
	},

	data () {
		return {
			localStream: null,
			peerConnection: null,
			negotiationneededCounter: 0,
			textForSend: '',
			textToReceiveSdp: '',
			ws: null,
			streams: []
		}
	},

	computed: {
		...mapState([
			'me'
		]),

		...mapState('chat/', [
			'users'
		]),

		me_mute () {
			return this.me.mute
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

		const wsUrl = 'ws://localhost:3001/';
		this.ws = new WebSocket(wsUrl);
		this.ws.onopen = (evt) => {
			console.log('ws open()');
		};
		this.ws.onerror = (err) => {
			console.error('ws onerror() ERR:', err);
		};
		this.ws.onmessage = (evt) => {
			const message = JSON.parse(evt.data);
			switch(message.type){
				case 'offer': {
					this.textToReceiveSdp = message.sdp;
					this.setOffer(message);
					break;
				}
				case 'answer': {
					this.textToReceiveSdp = message.sdp;
					this.setAnswer(message);
					break;
				}
				case 'candidate': {
					const candidate = new RTCIceCandidate(message.ice);
					this.addIceCandidate(candidate);
					break;
				}
				case 'close': {
					this.hangUp();
					break;
				}
				case 'user': {
					this.set_user(message.user)
					break;
				}
				default: {
					console.log("Invalid message");
					break;
				}
			}
		};
	},

	watch: {
		me_mute () {
			this.mute_me()
		}
	},

	methods: {
		...mapActions('chat/', [
			'add_user'
		]),

		playVideo (stream) {
			if(this.streams.findIndex(function(ele) {
				return ele == stream
			}) === -1) {
				this.streams.push(stream)
			}
			this.$refs.video.srcObject = stream
		},

		prepareNewConnection (isOffer) {
			let vm = this
			const pc_config = {"iceServers":[ {"urls":"stun:stun.webrtc.ecl.ntt.com:3478"} ]};
			const peer = new RTCPeerConnection(pc_config);

			// リモートのMediaStreamTrackを受信した時
			peer.ontrack = evt => {
				console.log(evt)
				this.playVideo(evt.streams[0]);
				this.send_user()
			};

			// ICE Candidateを収集したときのイベント
			peer.onicecandidate = evt => {
				if (evt.candidate) {
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
								peer.setLocalDescription(offer)
								.then(() => {
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
				this.localStream.getTracks().forEach(track => peer.addTrack(track, this.localStream));
			} else {
				console.warn('no local stream, but continue.');
			}

			return peer;
		},

		sendSdp(sessionDescription) {
			const message = JSON.stringify(sessionDescription);
			this.ws.send(message);
		},

		connect() {
			if (! this.peerConnection) {
				this.peerConnection = this.prepareNewConnection(true);
			}
			else {
				console.warn('peer already exist.');
			}
		},

		makeAnswer() {
			if (! this.peerConnection) {
				console.error('peerConnection NOT exist!');
				return;
			}
			try{
				this.peerConnection.createAnswer()
				.then(answer => {
					this.peerConnection.setLocalDescription(answer)
					.then(() => {
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
					const answer = new RTCSessionDescription({
						type : 'answer',
						sdp : this.textToReceiveSdp,
					});
					this.setAnswer(answer);
				} else {
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

			try {
				this.peerConnection.setRemoteDescription(sessionDescription);
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
			const message = JSON.stringify({ type: 'candidate', ice: candidate });
			this.ws.send(message);
		},

		mute_me () {
			this.localStream.getAudioTracks()[0].enabled = !this.me_mute;
		},

		send_user () {
			let message = JSON.stringify({ type: 'user', user: this.me });
			this.ws.send(message)
		},

		set_user (user) {
			this.add_user(user)
			.then(() => {
				console.log(this.$store.state.chat.users)
			})
		},
	}
}
</script>

<style scoped>
.text-center {
	text-align: center;
}
video.test-video {
	width: 300px;
	height: 100px;
}
.create-break {
	white-space: pre;
}
.wrapper-card {
	border-radius: 3px;
	box-shadow: 0 0 4px 0 rgba(10, 18, 39, 0.12);
	background-color: #fff;
	overflow: hidden;
	cursor: pointer;
}
@media(max-width: 980px) {
	video.test-video {
		width:180px;
		height: 70px;
	}
}
</style>
