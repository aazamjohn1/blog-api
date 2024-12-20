export interface IAxGameInterface {
	userId: String
	userName: String
	gamesPlayed: number
	totalScore: number
	lastGameDate: Date
}

export interface IBook {
	_id: string
	title: string
	author: string
	highlight: boolean
	year: number
	status: string
	content: string
}
