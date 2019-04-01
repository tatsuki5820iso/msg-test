export default {
	add_user (state, { user, socketId }) {
		user.is_me = false
		user.socketId = socketId
		state.users.push(user)
	}
}
