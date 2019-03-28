import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store/index'
import './registerServiceWorker'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'


Vue.use(Vuetify)

Vue.config.productionTip = false



new Vue({
	el: '#app',
	router,
	store,
	render: h => h(App)
}).$mount('#app')
