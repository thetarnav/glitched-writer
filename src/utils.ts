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

export function randomChild<T>(array: Array<T>): T
export function randomChild(array: string): string
export function randomChild(array: any[] | string): any {
	return array[random(0, array.length, 'floor')]
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

export function deleteRandom(array: any[]): void {
	const { length } = array
	array.splice(random(0, length, 'floor'), 1)
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

export const reverseString = (str: string): string =>
	str.split('').reverse().join('')

export function getRandomFromRange(
	range: RangeOrNumber,
	round: boolean = true,
): number {
	return typeof range === 'number'
		? range
		: random(...range, round ? 'round' : undefined)
}

export const coinFlip = (p: number = 0.5): boolean => Math.random() < p

export type TagOrString = { tag: string } | string

const findTagPattern =
	'(?:<style.+?>.+?</style>|<script.+?>.+?</script>|<(?:!|/?[a-zA-Z]+).*?/?>)'

export function htmlToArray(string: string): TagOrString[] {
	const reg = new RegExp(findTagPattern, 'g'),
		result: TagOrString[] = []

	let find: RegExpExecArray | null,
		lastIndex = 0

	// eslint-disable-next-line no-cond-assign
	while ((find = reg.exec(string))) {
		const from = find.index,
			to = reg.lastIndex,
			stringBefore = string.slice(lastIndex, from)

		lastIndex = to

		stringBefore && result.push(...stringBefore)
		result.push({ tag: find[0] })
	}
	string.length > lastIndex && result.push(...string.slice(lastIndex))

	return result
}

export function filterHtml(string: string): string {
	const reg = new RegExp(findTagPattern, 'g')

	return string.replace(reg, '')
}

export const isSpecialChar = (l: string): boolean =>
	['\t', '\n', '\r', '\f', '\v'].includes(l)
