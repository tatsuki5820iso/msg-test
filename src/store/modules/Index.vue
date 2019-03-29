<template lang="html">
	<div>
		<div v-for="action in actions" class="action-box">
			{{action.created_at}} | {{action.user_id}} | {{action.user ? action.user.name : '誰か'}} | <strong>{{action_type[action.action_type]}}</strong> {{action.detail}}
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { ActionType } from '../../../data/admin'

export default {
	data () {
		return {
			action_type: ActionType
		}
	},

	computed: {
		...mapState('admin/', [
			'user_actions'
		]),

		actions () {
			return this.user_actions.filter(function(ele) {
				return [10, 30, 50, 60].includes(ele.action_type)
			})
		}
	}
}
</script>

<style media="screen" scoped>
.action-box {
	border-bottom: solid 1px;
	padding: 4px 0;
}
</style>
