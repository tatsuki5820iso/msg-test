export default {
	add_user (state, { user, socketId }) {
		user.is_me = false
		state.users[socketId] = user
	}
}
