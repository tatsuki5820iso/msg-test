<template lang="html">
	<div>
		<icon ref="me_icon" :user="me"></icon>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import Icon from './Character/Icon'

export default {
	components: {
		Icon
	},

	computed: {
		...mapState([
			'me'
		])
	}
}
</script>

<style lang="css" scoped>
.card-wrapper {
	background-color: #fff;
	box-shadow: 0 0 4px 0 rgba(10, 18, 39, 0.12);
	border-radius: 3px;
	overflow: hidden;
}
</style>
