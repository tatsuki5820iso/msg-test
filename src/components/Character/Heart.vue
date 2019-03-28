<template lang="html">
	<v-layout justify-center>
		<div class="wrapper" @mousemove="coordinates" ref="wrapper">
			<img src="/img/heart.svg" class="heart-icon" ref="heart"
			:class="{
				isFliped: flip
			}"
			:style="{
				transform:`translate3d(${x}px, ${y}px, 0)`,
				}" />
		</div>
	</v-layout>
</template>

<script>
// import 'svg-sprite-loader'
import { TimelineMax, Sine } from 'gsap'

export default {
	data () {
		return {
			x: 0,
			y: 0,
			flip: false,
			start: null,
		}
	},

	methods: {
		allTl () {
			let tl = new TimelineMax()

			tl.add('start')
			tl.to(
				this.$refs.heart,
				2,
				{
					x: 220,
					rotation: 150,
					transformOrigin: '50% 50%',
					ease: Sine.easeIn,
				},
				'start'
			)

			return tl
		},

		coordinates (e) {
			let box = this.$refs.wrapper.getBoundingClientRect()

			let progress = (e.clientX - box.left) / box.width

			if(!this.start) {
				this.start = this.allTl()
			}

			this.start.progress(progress).pause();
		}
	}
}
</script>

<style lang="css" scoped>
.wrapper {
	height: 300px;
	width: 300px;
	background-color: #00c300;
	position: relative;
}
.heart-icon {
	height: 80px;
	width: 80px;
	position: absolute;
}
.isFlipped {
	transform: scaleX(-1);
	transform-origin: 50% 50%;
}
</style>
