/* eslint-disable no-unused-vars */
export function random(min: number, max: number): number
export function random(range: [number, number], max?: undefined): number
export function random(first: [number, number] | number, max?: number): number {
	let from: number, to: number
	if (typeof first === 'object') [from, to] = first
	else [from, to] = [first, max || first]

	return Math.random() * (to - from) + from
}

export function randomChild<T>(array: Array<T>): T
export function randomChild(array: string): string
export function randomChild(array: any): any {
	return array[Math.floor(random(0, array.length))]
}

export function filterDuplicates(iterable: string): string
export function filterDuplicates<T>(iterable: Array<T>): Array<T>
export function filterDuplicates(iterable: any): any {
	const isString = typeof iterable === 'string',
		result: any[] = []
	new Set(iterable).forEach(x => result.push(x))
	return isString ? result.join('') : result
}

export function parseCharset(input: string | string[] | Set<string>): string {
	let result: string
	// Charset is a string
	if (typeof input === 'string') result = input
	// Charset is an array
	else if ((input as string[]).length) result = (input as string[]).join('')
	// Charset is a Set
	else result = Array.from(input as Set<string>).join('')

	return result
}
