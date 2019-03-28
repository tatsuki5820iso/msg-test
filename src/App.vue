<template>
	<v-app>
		<v-content style="margin-bottom: 60px;">
			<top-video />

			<div v-if="bottomNav == 'character'">
				<character></character>
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

			<v-btn color="#ffb948" flat value="favorites">
				<span>Favorites</span>
				<v-icon>favorite</v-icon>
			</v-btn>

			<v-btn color="#ffb948" flat value="nearby">
				<span>Nearby</span>
				<v-icon>place</v-icon>
			</v-btn>
		</v-bottom-nav>
	</v-app>
</template>

<script>
import TopVideo from './components/Video'
import Character from './components/Character/Heart'

export default {
	components: {
		TopVideo,
		Character,
	},

	data () {
		return {
			bottomNav: 'character'
		}
	}
}
</script>
