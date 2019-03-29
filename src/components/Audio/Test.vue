<template lang="html">
	<div class="top-wrapper px-4 pt-4">
		<div class="volume">{{volume}}</div>

		<icon :speaking="volume > 5" :user="user"></icon>

		<div class="conf-wrapper" v-if="user.is_me">
			<v-layout fill-height column space-between>
				<v-spacer></v-spacer>
				<v-layout justify-center>
					<v-btn color="primary" @click="user.mute ? dismiss_mute() : set_mute()">{{user.mute ? 'Unmute' : 'Mute'}}</v-btn>
				</v-layout>
			</v-layout>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex'
import Icon from '../Character/Icon'

export default {
	components: {
		Icon
	},

	props: [
		'stream',
		'user'
	],

	data () {
		return {
			volume: 0,
			gainNode: null,
		}
	},

	mounted () {
		this.init ()
	},

	watch: {
		stream () {
			this.init()
		}
	},

	methods: {
		...mapActions('chat/', [
			'set_mute',
			'dismiss_mute',
		]),

		init () {
			let ctx, analyser, frequencies, getByteFrequencyDataAverage, volume, draw;
			let vm = this

			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			ctx = new AudioContext();

			analyser = ctx.createAnalyser();
			frequencies = new Uint8Array(analyser.frequencyBinCount);

			getByteFrequencyDataAverage = function() {
				analyser.getByteFrequencyData(frequencies);
				return frequencies.reduce(function(previous, current) {
					return previous + current;
				}) / analyser.frequencyBinCount;
			};


			ctx.createMediaStreamSource(this.stream)
			.connect(analyser);

			// 可能な限り高いフレームレートで音量を取得し、表示を更新する
			(draw = function() {
				vm.volume = Math.floor(getByteFrequencyDataAverage());
				requestAnimationFrame(draw);
			})();
		},
	}
}
</script>

<style lang="css" scoped>
.volume {
	text-align: center;
	font-size: 14px;
	letter-spacing: 0.22px;
	font-weight: bold;
}
.top-wrapper {
	position: relative;
}
.conf-wrapper {
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	background-color: rgba(10, 18, 39, 0.2);
	opacity: 0;
	transition: opacity .2s;
}
.conf-wrapper:hover {
	opacity: 1;
}
</style>
