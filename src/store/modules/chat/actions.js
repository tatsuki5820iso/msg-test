export default {
	set_mute ({ commit }, user_id ) {
		return new Promise((resolve, reject) => {
			if(user_id) {

			} else {
				commit('set_mute', null, { root: true })
			}
			resolve()
		})
	},

	dismiss_mute ({ commit }, user_id) {
		return new Promise((resolve, reject) => {
			if(user_id) {

			} else {
				commit('dismiss_mute', null, { root: true })
			}
			resolve()
		})
	},

	add_user ({ state, commit }, user) {
		return new Promise((resolve, reject) => {
			let index = state.users.findIndex(function(ele) {
				return ele.name == user.name
			})
			if(index === -1) {
				commit('add_user', user)
			}
			resolve()
		})
	}
}
