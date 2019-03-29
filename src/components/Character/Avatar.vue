<template lang="html">
	<div class="">
		<v-layout justify-center pt-5>
			<v-text-field v-model="name" label="名前を入力してください" class="name-area"></v-text-field>
		</v-layout>

		<v-layout justify-center>
			<avataaar avatar-style="Transparent"
			:accessoriesType="accessoriesType"
			:clotheType="clotheType"
			:eyebrowType="eyebrowType"
			:eyeType="eyeType"
			:facialHairColor="facialHairColor"
			:facialHairType="facialHairType"
			:hairColor="hairColor"
			:mouthType="mouthType"
			:skinColor="skinColor"
			:topType="topType"
			></avataaar>
		</v-layout>

		<div class="">
			<v-layout wrap px-5>
				<v-flex xs4>
					<v-select :items="accessoriesTypeOptions" v-model="accessoriesType" label="アクセサリー"></v-select>
				</v-flex>
				<v-flex xs4>
					<v-select :items="clotheTypeOptions" v-model="clotheType" label="服"></v-select>
				</v-flex>
				<v-flex xs4>
					<v-select :items="eyebrowTypeOptions" v-model="eyebrowType" label="眉"></v-select>
				</v-flex>
				<v-flex xs4>
					<v-select :items="eyeTypeOptions" v-model="eyeType" label="目"></v-select>
				</v-flex>
				<v-flex xs4>
					<v-select :items="facialHairTypeOptions" v-model="facialHairType" label="ひげ"></v-select>
				</v-flex>
				<v-flex xs4>
					<v-select :items="facialHairColorOptions" v-model="facialHairColor" label="ひげの色" v-if="facialHairType !== 'blank'"></v-select>
				</v-flex>
				<v-flex xs4>
					<v-select :items="mouthTypeOptions" v-model="mouthType" label="口元"></v-select>
				</v-flex>
				<v-flex xs4>
					<v-select :items="skinColorOptions" v-model="skinColor" label="肌色"></v-select>
				</v-flex>
				<v-flex xs4>
					<v-select :items="topTypeOptions" v-model="topType" label="頭"></v-select>
				</v-flex>
				<v-flex xs4>
					<v-select :items="hairColorOptions" v-model="hairColor" label="髪色" v-if="topTypeOptions !== 'NoHair'"></v-select>
				</v-flex>
			</v-layout>

			<v-layout justify-center>
				<v-btn color="#ffb948" round @click="finish()">完了</v-btn>
			</v-layout>
		</div>
	</div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import Avataaar from 'vue-avataaar'

export default {
	components: {
		Avataaar
	},

	data () {
		return {
			name: '匿名',
			accessoriesType: 'Blank',
			accessoriesTypeOptions: [ 'Blank', 'Kurt', 'Prescription01', 'Prescription02', 'Round', 'Sunglasses', 'Wayfarers' ],
			clotheType: 'BlazerShirt',
			clotheTypeOptions: [ 'BlazerShirt', 'BlazerSweater', 'BlazerShirt', 'BlazerSweater', 'CollarSweater', 'GraphicShirt', 'Hoodie', 'Overall', 'ShirtCrewNeck', 'ShirtScoopNeck', 'ShirtVNeck' ],
			eyebrowType: 'Angry',
			eyebrowTypeOptions: [ 'Angry', 'AngryNatural', 'Default', 'DefaultNatural', 'FlatNatural', 'RaisedExcited', 'RaisedExcitedNatural', 'SadConcerned', 'SadConcernedNatural', 'UnibrowNatural', 'UpDown', 'UpDownNatural' ],
			eyeType: 'Close',
			eyeTypeOptions: [ 'Close', 'Cry', 'Default', 'Dizzy', 'EyeRoll', 'Happy', 'Hearts', 'Side', 'Squint', 'Surprised', 'Wink', 'WinkWacky' ],
			facialHairColor: 'Auburn',
			facialHairColorOptions: [ 'Auburn', 'Black', 'Blonde', 'BlondeGolden', 'Brown', 'BrownDark', 'PastelPink', 'Platinum', 'Red', 'SilverGray' ],
			facialHairType: 'Blank',
			facialHairTypeOptions: [ 'Blank', 'BeardMedium', 'Blank', 'BeardMedium', 'BeardLight', 'BeardMagestic', 'MoustacheFancy', 'MoustacheMagnum' ],
			hairColor: 'Auburn',
			hairColorOptions: [ 'Auburn', 'Black', 'Blonde', 'BlondeGolden', 'Brown', 'BrownDark', 'PastelPink', 'Platinum', 'Red', 'SilverGray' ],
			mouthType: 'Concerned',
			mouthTypeOptions: [ 'Concerned', 'Default', 'Disbelief', 'Eating', 'Grimace', 'Sad', 'ScreamOpen', 'Serious', 'Smile', 'Tongue', 'Twinkle', 'Vomit' ],
			skinColor: 'Tanned',
			skinColorOptions: [ 'Tanned', 'Yellow', 'Pale', 'Light', 'Brown', 'DarkBrown', 'Black' ],
			topType: 'NoHair',
			topTypeOptions: [
				'NoHair', 'Eyepatch', 'Hat', 'Hijab', 'Turban', 'WinterHat1', 'WinterHat2', 'WinterHat3', 'WinterHat4', 'LongHairBigHair', 'LongHairBob', 'LongHairBun', 'LongHairCurly', 'LongHairCurvy', 'LongHairDreads',
				'LongHairFrida', 'LongHairFro', 'LongHairFroBand', 'LongHairNotTooLong', 'LongHairShavedSides', 'LongHairMiaWallace', 'LongHairStraight', 'LongHairStraight2', 'LongHairStraightStrand', 'ShortHairDreads01', 'ShortHairDreads02',
				'ShortHairFrizzle', 'ShortHairShaggyMullet', 'ShortHairShortCurly', 'ShortHairShortFlat', 'ShortHairShortRound', 'ShortHairShortWaved', 'ShortHairSides', 'ShortHairTheCaesar', 'ShortHairTheCaesarSidePart',
			]
		}
	},

	computed: {
		...mapState([
			'me'
		])
	},

	mounted () {
		this.name = this.me.name ? this.me.name : this.name
		this.accessoriesType = this.me.accessory ? this.me.accessory : this.accessoriesType
		this.clotheType = this.me.cloth ? this.me.cloth : this.clotheType
		this.eyebrowType = this.me.eyebrow ? this.me.eyebrow : this.eyebrowType
		this.eyeType = this.me.eye ? this.me.eye : this.eyeType
		this.faceHairType = this.me.face_hair_type ? this.me.face_hair_type : this.faceHairType
		this.faceHairColor = this.me.face_hair_color ? this.me.face_hair_color : this.faceHairColor
		this.hairColor = this.me.hair_color ? this.me.hair_color : this.hairColor
		this.mouthType = this.me.mouth ? this.me.mouth : this.mouthType
		this.skinColor = this.me.skin ? this.me.skin : this.skinColor
		this.topType = this.me.top ? this.me.top : this.topType
	},

	methods: {
		...mapMutations([
			'set_avatar'
		]),

		finish () {
			this.set_avatar({
				name: this.name,
				accessory: this.accessoriesType,
				cloth: this.clotheType,
				eyebrow: this.eyebrowType,
				eye: this.eyeType,
				face_hair_type: this.facialHairType,
				face_hair_color: this.facialHairColor,
				hair_color: this.hairColor,
				mouth: this.mouthType,
				skin: this.skinColor,
				top: this.topType
			})
			this.$emit('finish')
		}
	}
}
</script>

<style lang="css" scoped>
.name-area {
	max-width: 300px;
}
</style>
