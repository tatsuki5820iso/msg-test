export default {
	set_avatar (state, avatar) {
		state.me.name = avatar.name
		state.me.accessory = avatar.accessory
		state.me.cloth = avatar.cloth
		state.me.eyebrow = avatar.eyebrow
		state.me.eye = avatar.eye
		state.me.face_hair_type = avatar.face_hair_type
		state.me.face_hair_color = avatar.face_hair_color
		state.me.hair_color = avatar.hair_color
		state.me.mouth = avatar.mouth
		state.me.skin = avatar.skin
		state.me.top = avatar.top
	},

	set_mute (state) {
		state.me.mute = true
	},

	dismiss_mute (state) {
		state.me.mute = false
	}
}
