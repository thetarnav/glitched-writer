import { RangeOrNumber } from './types'

/* eslint-disable no-unused-vars */
export function random(
	min: number,
	max: number,
	math?: 'floor' | 'round' | 'ceil',
): number {
	const result = Math.random() * (max - min) + min
	if (math) {
		// eslint-disable-next-line default-case
		switch (math) {
			case 'floor':
				return Math.floor(result)
			case 'round':
				return Math.round(result)
			case 'ceil':
				return Math.ceil(result)
		}
	}
	return result
}

export const clamp = (min: number, value: number, max: number) =>
	Math.min(Math.max(value, min), max)

export const deleteRandom = (array: any[]): boolean =>
	array.splice(random(0, array.length, 'floor'), 1).length > 0

export function getRandom<T>(iterable: Array<T>): T
export function getRandom(iterable: string): string
export function getRandom(iterable: any[] | string): any {
	return iterable[random(0, iterable.length, 'floor')]
}

export function filterDuplicates(iterable: string): string
export function filterDuplicates<T>(iterable: Array<T>): Array<T>
export function filterDuplicates(iterable: any[] | string): any {
	const isString = typeof iterable === 'string',
		result: any[] = []
	new Set(iterable).forEach(x => result.push(x))
	return isString ? result.join('') : result
}

export function parseCharset(
	input?: string | string[] | Set<string>,
): string | undefined {
	if (input === undefined) return undefined
	let result: string
	// Charset is a string
	if (typeof input === 'string') result = input
	// Charset is an array
	else if ((input as string[]).length) result = (input as string[]).join('')
	// Charset is a Set
	else result = Array.from(input as Set<string>).join('')

	return result
}

export const wait = (time: number): Promise<number> =>
	new Promise(resolve => setTimeout(() => resolve(time), time))

export function promiseWhile(
	conditionFunc: () => boolean,
	actionPromise: () => Promise<any>,
) {
	const whilst = (): Promise<void> =>
		conditionFunc() ? actionPromise().then(whilst) : Promise.resolve()
	return whilst()
}

export const arrayOfTheSame = <T>(value: T, length: number): Array<T> =>
	new Array(length).fill(value)

export const isInRange = (min: number, value: number, max: number): boolean =>
	value >= min && value < max

export const animateWithClass = (
	element: HTMLElement | Element,
	className: string,
): void => {
	element.classList.remove(className)
	// eslint-disable-next-line no-void
	void (element as HTMLElement).offsetWidth
	element.classList.add(className)
}

export function getRandomFromRange(
	range: RangeOrNumber,
	round: boolean = true,
): number {
	return typeof range === 'number'
		? range
		: random(...range, round ? 'round' : undefined)
}

export const coinFlip = (p: number = 0.5): boolean => Math.random() < p

export type LetterItem = {
	value: string
	type?: 'tag' | 'html_entity' | 'whitespace'
}

export const letterToLetterItem = (string: string): LetterItem => ({
	value: string,
})

export const stringToLetterItems = (string: string | string[]): LetterItem[] =>
	[...string].map(letterToLetterItem)

export const isSpecialChar = (l: string): boolean =>
	['\t', '\n', '\r', '\f', '\v', '', ' '].includes(l)

const findHTMLPattern =
	'(&#?[0-9a-zA-Z]{2,6};)|(<style.+?>.+?</style>|<script.+?>.+?</script>|<(?:!|/?[a-zA-Z]+).*?/?>)'

export function htmlToArray(string: string): LetterItem[] {
	const reg = new RegExp(findHTMLPattern, 'g'),
		resultArray: LetterItem[] = []

	let find: RegExpExecArray | null,
		lastIndex = 0

	// eslint-disable-next-line no-cond-assign
	while ((find = reg.exec(string))) {
		const from = find.index,
			to = reg.lastIndex,
			stringBefore = string.slice(lastIndex, from)

		lastIndex = to

		stringBefore && resultArray.push(...stringToLetterItems(stringBefore))

		const result: LetterItem = {
			value: find[0],
			type: find[1] !== undefined ? 'html_entity' : 'tag',
		}

		resultArray.push(result)
	}
	string.length > lastIndex &&
		resultArray.push(...stringToLetterItems(string.slice(lastIndex)))

	// return resultArray.map(l =>
	// 	l.type
	// 		? l
	// 		: {
	// 				value: l.value,
	// 				type: isSpecialChar(l.value) ? 'whitespace' : undefined,
	// 		  },
	// )
	return resultArray
}

export function filterHtml(string: string): string {
	const reg = new RegExp(findHTMLPattern, 'g')

	return string.replace(reg, '')
}

export function trim(str: string, l: string): string {
	if (!l || l.length > 1 || !str) return str
	if (l === ' ') return str.trim()

	const reg = new RegExp(`${l}+`, 'g')

	let find: RegExpExecArray | null,
		result = str

	// eslint-disable-next-line no-cond-assign
	while ((find = reg.exec(str))) {
		const from = find.index,
			to = reg.lastIndex,
			length = to - from

		if (from === 0) result = result.substring(to)
		else if (to === str.length)
			result = result.substring(result.length - length)
	}

	return result
}
