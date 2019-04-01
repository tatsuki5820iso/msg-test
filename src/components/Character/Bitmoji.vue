<template lang="html">
	<div class="">
		<easel-canvas width="100" height="80">
			<easel-sprite-sheet
			:images="['/img/heart.svg']"
			:frames="{width:20,height:50}"
			:animations="{
				stand: 7,
				walk: [6, 7],
				walkAndStand: [6, 7, 'stand'],
				confusion: {
					frames: [5, 1, 0, 2],
					},
					}"
					:framerate="4"
					>
					<easel-sprite
					:x="52"
					:y="58"
					animation="walk"
					:align="['center','bottom']"
					>
				</easel-sprite>
				>
			</easel-sprite-sheet>
		</easel-canvas>
	</div>
</template>

<script>
export default {

}
</script>

<style lang="css" scoped>
</style>
