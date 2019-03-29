export default {
	add_user (state, user) {
		user.id = state.users.length + 1
		user.is_me = false
		state.users.push(user)
	}
}
