import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import Cookies from 'js-cookie'
import modules from './modules/index'
import state from './state'
import mutations from './mutations'

Vue.use(Vuex)

export default new Vuex.Store({
	state: state,
  	mutations: mutations,
  	actions: {},
  	modules: modules,
  	strict: process.env.MIX_VUE_APP_ENV !== 'production',
  	plugins: [
  		createPersistedState({
  			key: 'msg-test' + process.env.NODE_ENV,
  			storage: {
  				getItem: key => Cookies.get(key),
  				setItem: (key, value) => Cookies.set(key, value, { expires: 365 }),
  				removeItem: key => Cookies.remove(key)
  			},
  			reducer: state => ({
				me: {
					name: state.me.name,
					accessory: state.me.accessory,
					cloth: state.me.cloth,
					eyebrow: state.me.eyebrow,
					eye: state.me.eye,
					face_hair_type: state.me.face_hair_type,
					face_hair_color: state.me.face_hair_color,
					hair_color: state.me.hair_color,
					mouth: state.me.mouth,
					skin: state.me.skin,
					top: state.me.top,
				}
  			})
  		}),
  	]
})
