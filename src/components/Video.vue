<template lang="html">
	<div class="px-5">
		<div id="videos">
			<div id="subscriber"></div>
			<div id="publisher"></div>
		</div>
	</div>
</template>

<script>
export default {
	data () {
		return {
			openTokApiKey: '46295862',
			openTokSecret: 'e7a983a3aaa92d5896c825b0b2e264c7b3909011',
			openTokSessionId: '1_MX40NjI5NTg2Mn5-MTU1Mzc0MjA1OTE4OX52SmxKYVJiM1NBeXlNMzM0TFRjblE5WWJ-fg',
			openTokToken: 'T1==cGFydG5lcl9pZD00NjI5NTg2MiZzaWc9NzlkYThhZjFkODYwMWZlZmJhYjJjODQyMWFiNzU4Yzc4NDAwNTJjNzpzZXNzaW9uX2lkPTFfTVg0ME5qSTVOVGcyTW41LU1UVTFNemMwTWpBMU9URTRPWDUyU214S1lWSmlNMU5CZVhsTk16TTBURlJqYmxFNVdXSi1mZyZjcmVhdGVfdGltZT0xNTUzNzQyMDY5Jm5vbmNlPTAuMDgxOTY4OTk0MzkzNDI4OTcmcm9sZT1wdWJsaXNoZXImZXhwaXJlX3RpbWU9MTU1Mzc0NTY2OCZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ==',
		}
	},

	mounted () {
		this.initializeSession();
	},

	methods: {
		handleError (error) {
			if (error) {
				console.log(error.message);
			}
		},

		initializeSession () {
			var session = OT.initSession(this.openTokApiKey, this.openTokSessionId);

			let vm = this
			// Subscribe to a newly created stream
			session.on('streamCreated', function(event) {
				session.subscribe(event.stream, 'subscriber', {
					insertMode: 'append',
					width: '100%',
					height: '100%'
				}, vm.handleError);
			});

			// Create a publisher
			var publisher = OT.initPublisher('publisher', {
				insertMode: 'append',
				width: '100%',
				height: '100%'
			}, this.handleError);

			// Connect to the session
			session.connect(this.openTokToken, function(error) {
				// If the connection is successful, publish to the session
				if (error) {
					vm.handleError(error);
				} else {
					session.publish(publisher, vm.handleError);
				}
			});
		}
	}
}
</script>

<style lang="css" scoped>
#publisher {
	height: 500px;
}
</style>
<style media="screen">
.OT_subscriber {
	width: 33vw !important;
	height: 200px !important;
	display: inline-block;
}
</style>
