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

	add_user ({ state, commit }, { user, socketId }) {
		return new Promise((resolve, reject) => {
			if(!state.users[socketId]) {
				commit('add_user', { user, socketId })
			}
			resolve()
		})
	}
}
