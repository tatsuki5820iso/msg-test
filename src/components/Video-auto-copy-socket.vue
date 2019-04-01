<template>
	<div>
		<div class="text-center">
			<!-- <video ref="video" autoplay class="test-video" playsinline></video> -->
		</div>

		<v-layout justify-center wrap pb-5>
			<div class="mx-2 wrapper-card">
				<audio-test :stream="localStream" :user="me" v-if="localStream"></audio-test>
			</div>
			<div class="mx-2 wrapper-card" v-for="stream_arr in streams">
				<audio-test :stream="stream_arr.stream" :user="users.filter(function(ele) { return ele.socketId == stream_arr.socketId })[0]"
				v-if="stream_arr.stream && users.filter(function(ele) { return ele.socketId == stream_arr.socketId })[0]"></audio-test>
			</div>
		</v-layout>

	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import AudioTest from './Audio/Test'

export default {
	components: {
		AudioTest
	},

	props: [
		'connectGroup'
	],

	data () {
		return {
			localStream: null,
			peerConnections: [],
			negotiationneededCounter: 0,
			textForSend: '',
			textToReceiveSdp: '',
			ws: null,
			streams: [],
			socketUserId: null,
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
		},

	},

	mounted () {
		alert('hoge')

		let vm = this

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

		this.sockets.subscribe('open', (data) => {
			vm.socketUserId = data.userId
			vm.$socket.emit('message', { type: 'allCall', params: { fromUserId: vm.socketUserId } })
		});
		this.sockets.subscribe('message', (data) => {
			alert(data.type)

			switch (data.type) {
				case 'allCall': {
					vm.$socket.emit('message', { type: 'callAnswer', params: { sendTo: data.params.fromUserId, fromUserId: this.socketUserId, user: vm.me } })
					break;
				}
				case 'callAnswer': {
					let fromUserId = data.params.fromUserId
					if(!vm.getConnection(fromUserId)) {
						let peerConnection = vm.prepareNewConnection(true, fromUserId)
						vm.setConnection(peerConnection, fromUserId)
					}
					break;
				}
				case 'offer': {
					this.setOffer(data.params.sdp, data.params.fromUserId)
					break;
				}
				case 'answer': {
					this.setAnswer(data.params.sdp, data.params.fromUserId)
					break;
				}
				case 'candidate': {
					const candidate = new RTCIceCandidate(data.params.ice);
					this.addIceCandidate(candidate, data.params.fromUserId);
					break;
				}
				case 'user': {
					this.set_user(data.params.user, data.params.fromUserId)
					break;
				}
				case 'close': {
					console.log('close')
					this.hangUp();
					break;
				}
				case 'socketFailed': {
					console.error('room capacity overwhelmed!')
					break;
				}
				default: {
					console.error('Invalid Message')
					break;
				}
			}
		});

		navigator.mediaDevices.getUserMedia({
			audio: true
		})
		.then(stream => {
			this.localStream = stream

			this.$socket.emit('open', {
				option: { connectionGroup: this.connectionGroup }
			})
		})
		.catch(error => {
			alert('接続できませんでした')
			console.error('getUserMedia() error ->', error)
			return;
		})
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

		playVideo (stream, toUserId) {
			if(this.streams.findIndex(function(ele) {
				return ele.socketId == toUserId
			}) === -1) {
				this.streams.push({
					socketId: toUserId,
					stream: stream
				})
			}
		},

		prepareNewConnection (isOffer, toUserId) {
			let vm = this
			const pc_config = {"iceServers":[ {"urls":"stun:stun.webrtc.ecl.ntt.com:3478"} ]};
			const peer = new RTCPeerConnection(pc_config);

			// リモートのMediaStreamTrackを受信した時
			peer.ontrack = evt => {
				this.playVideo(evt.streams[0], toUserId);
				this.send_user(toUserId)
			};

			// ICE Candidateを収集したときのイベント
			peer.onicecandidate = evt => {
				if (evt.candidate) {
					this.sendIceCandidate(evt.candidate, toUserId);
				} else {
					console.log('empty ice event');
				}
			};

			// Offer側でネゴシエーションが必要になったときの処理
			peer.onnegotiationneeded = async () => {
				try {
					if(isOffer) {
						if(vm.negotiationneededCounter === 0) {
							peer.createOffer().then(offer => {
								peer.setLocalDescription(offer)
								.then(() => {
									vm.sendSdp(peer.localDescription, toUserId);
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
					case 'closed': {
						break;
					}
					case 'failed': {
						if (vm.getConnection(toUserId)) {
							vm.hangUp(toUserId);
						}
						break;
					}
					case 'disconnected': {
						vm.hangUp(toUserId)
						break;
					}
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

		getConnection(fromUserId) {
			return this.peerConnections[fromUserId]
		},

		setConnection(peerConnection, fromUserId) {
			if(!this.peerConnections[fromUserId]) {
				this.peerConnections[fromUserId] = peerConnection
			}
		},

		dismissConnection(fromUserId) {
			if(this.peerConnections[fromUserId]) {
				this.peerConnections.splice(fromUserId, 1)
			}
		},

		sendSdp(sessionDescription, toUserId) {
			this.$socket.emit('message', { type: sessionDescription.type, params: { sdp: sessionDescription, fromUserId: this.socketUserId, sendto: toUserId } });
		},

		makeAnswer(toUserId) {
			let peerConnection = this.getConnection(toUserId)
			if (! peerConnection) {
				console.error('peerConnection NOT exist!');
				return;
			}
			try{
				peerConnection.createAnswer()
				.then(answer => {
					peerConnection.setLocalDescription(answer)
					.then(() => {
						this.sendSdp(peerConnection.localDescription, toUserId);
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

		setOffer(sessionDescription, fromUserId) {
			let peerConnection = this.getConnection(fromUserId)
			if (peerConnection) {
				console.error('peerConnection alreay exist!');
			} else {
				peerConnection = this.prepareNewConnection(false, fromUserId)
				this.setConnection(peerConnection, fromUserId)
			}

			try {
				peerConnection.setRemoteDescription(sessionDescription);
				this.makeAnswer(fromUserId);
			} catch(err){
				console.error('setRemoteDescription(offer) ERROR: ', err);
			}
		},

		setAnswer(sessionDescription, fromUserId) {
			let peerConnection = this.getConnection(fromUserId)
			if (!peerConnection) {
				console.error('peerConnection NOT exist!');
				return;
			}
			try {
				peerConnection.setRemoteDescription(sessionDescription);
			} catch(err) {
				console.error('setRemoteDescription(answer) ERROR: ', err);
			}
		},

		hangUp (toUserId) {
			let peerConnection = this.getConnection(toUserId)
			if (peerConnection) {
				if(peerConnection.iceConnectionState !== 'closed'){
					peerConnection.close();
					this.dismissConnection(toUserId)
					this.$socket.emit('message', { type: 'close', params: { fromUserId: this.socketUserId, sendto: toUserId }})
					this.cleanupAudioElement(toUserId);
					return;
				}
			}
			console.log('peerConnection is closed.');
		},

		cleanupAudioElement (toUserId) {
			// let element = this.$refs.video
			// element.pause();
			// element.srcObject = null;
		},

		addIceCandidate(candidate, fromUserId) {
			let peerConnection = this.getConnection(fromUserId)
			if (peerConnection) {
				peerConnection.addIceCandidate(candidate);
			}
			else {
				console.error('PeerConnection not exist!');
				return;
			}
		},

		sendIceCandidate(candidate, toUserId) {
			this.$socket.emit('message', { type: 'candidate', params: { ice: candidate, sendto: toUserId, fromUserId: this.socketUserId } })
		},

		mute_me () {
			this.localStream.getAudioTracks()[0].enabled = !this.me_mute;
		},

		send_user (toUserId) {
			this.$socket.emit('message', {
				type: 'user',
				params: {
					user: this.me,
					fromUserId: this.socketUserId,
					sendto: toUserId,
				}
			})
		},

		set_user (user, fromUserId) {
			this.add_user({
				user: user,
				socketId: fromUserId
			})
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
