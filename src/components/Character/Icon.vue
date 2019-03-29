<template lang="html">
	<v-layout py-5 justify-center>
		<div>
			<avataaar avatar-style="Transparent" class="icon" ref="icon"
			:class="{
				toggling: speaking,
				mute: user.mute
				}"
				:accessoriesType="user.accessory"
				:clotheType="user.cloth"
				:eyebrowType="user.eyebrow"
				:eyeType="user.eye"
				:facialHairColor="user.face_hair_color"
				:facialHairType="user.face_hair_type"
				:hairColor="user.hair_color"
				:mouthType="user.mouth"
				:skinColor="user.skin"
				:topType="user.top"
				>
			</avataaar>

			<div class="user-name mt-2">{{ user.name ? user.name : (user.is_me ? 'あなた' : '匿名ユーザー') }}</div>
		</div>
	</v-layout>
</template>

<script>
import { mapState } from 'vuex'
import { TimelineMax, Sine } from 'gsap'
import Avataaar from 'vue-avataaar'

export default {
	components: {
		Avataaar
	},

	props: [
		'user',
		'speaking',
	],
}
</script>

<style lang="css">
.icon {
	cursor: pointer;
}
.icon.toggling {
	animation: Toggle .8s;
	animation-iteration-count: infinite;
}
.icon.mute {
	opacity: 0.5;
}
@keyframes Toggle {
	0% {
		transform: scale(1);
	}
	20% {
		transform: scale(1.02);
	}
	40% {
		transform: scale(0.95);
	}
	60% {
		transform: scale(1.05);
	}
	80% {
		transform: scale(0.9);
	}
	100% {
		transform: scale(1);
	}
}
.user-name {
	font-size: 14px;
	letter-spacing: 0.22px;
	text-align: center;
}
</style>
