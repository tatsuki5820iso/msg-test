import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store/index'
import './registerServiceWorker'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import VueSocketIO from 'vue-socket.io'

Vue.use(Vuetify)

Vue.use(new VueSocketIO({
	debug: true,
	connection: 'https://0aaec50f.ngrok.io',
}))

Vue.config.productionTip = false

new Vue({
	el: '#app',
	router,
	store,
	render: h => h(App)
}).$mount('#app')
