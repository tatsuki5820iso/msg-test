<template>
	<v-app>
		<v-content style="margin-bottom: 100px;">
			<div v-if="bottomNav == 'character'">
				<bitmoji></bitmoji>
				<avatar @finish="bottomNav = 'video'"></avatar>
			</div>
			<div v-else-if="bottomNav == 'video'">
				<top-video :connectGroup="1"/>
			</div>
			<v-layout justify-center style="height: 100vh;" v-else>
				{{ bottomNav }}
			</v-layout>
		</v-content>


		<v-bottom-nav :active.sync="bottomNav" :value="true" fixed color="#fff">
			<v-btn color="#ffb948" flat value="character">
				<span>Character</span>
				<v-icon>history</v-icon>
			</v-btn>

			<v-btn color="#ffb948" flat value="video">
				<span>Video</span>
				<v-icon>ondemand_video</v-icon>
			</v-btn>

			<v-btn color="#ffb948" flat value="nearby">
				<span>Nearby</span>
				<v-icon>place</v-icon>
			</v-btn>
		</v-bottom-nav>
	</v-app>
</template>

<script>
import TopVideo from './components/Video-auto-copy-socket'
import Character from './components/Character/Heart'
import Avatar from './components/Character/Avatar'
import Bitmoji from './components/Character/Bitmoji'

export default {
	components: {
		TopVideo,
		Character,
		Avatar,
		Bitmoji,
	},

	data () {
		return {
			bottomNav: 'character'
		}
	}
}
</script>
