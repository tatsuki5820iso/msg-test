import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store/index'
import './registerServiceWorker'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import VueSocketIO from 'vue-socket.io'
import VueEasel from 'vue-easeljs'

Vue.use(Vuetify)

// Vue.use(new VueSocketIO({
// 	debug: true,
// 	connection: 'https://5cee3878.ngrok.io',
// }))

Vue.use(VueEasel)

Vue.config.productionTip = false

new Vue({
	sockets: {
		connect () {
			console.log('connected')
		},
	},
	el: '#app',
	router,
	store,
	render: h => h(App)
}).$mount('#app')
