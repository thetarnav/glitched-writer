const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const flipP = p => (p >= 0 ? Math.abs(p - 1) : Math.abs(p) - 1)

const flipVal = (val, min, max) =>
	Math.abs(val * (Math.sign(val) || 1) - max) + min

const pToVal = (p, zero, hundred) => p * (hundred - zero) + zero

function valToP(value, min, max) {
	if (min > max) {
		;[min, max] = [max, min]
		value = flipVal(value, min, max)
	}
	return (value - min) / (max - min)
}

function valToPwMid(value, min, max, turn = pToVal(0.5, min, max)) {
	if (min > max) {
		;[min, max] = [max, min]
		turn = flipVal(turn, min, max)
		value = flipVal(value, min, max)
	}
	return value < turn
		? (value - turn) / (turn - min)
		: (value - turn) / (max - turn)
}

const random = (min, max, mathFunc = null) => {
	const w = Math.random() * (max - min) + min
	return mathFunc == null ? w : Math[mathFunc](w)
}

const stringWithoutRepeat = string =>
	[...new Set([...string])].reduce((set, l) => set + l)

const setCssProperties = (el, ...pairs) =>
	pairs.forEach(pair => el.style.setProperty(pair[0], pair[1]))

const stayInLoop = (value, min, max) => {
	while (value < min || value > max) {
		value =
			value < min
				? max - Math.abs(min - value) + 1
				: min + Math.abs(max - value) - 1
	}
	return value
}

const wait = time => new Promise(resolve => setTimeout(resolve, time))

const promiseWhile = (data, conditionFunc, actionPromise) => {
	const whilst = d =>
		conditionFunc(d) ? actionPromise(d).then(whilst) : Promise.resolve(d)
	return whilst(data)
}

const getWindowSize = () => {
	const { body, documentElement } = document
	return {
		height: window.innerHeight,
		width: window.innerWidth,
		fullHeight: Math.max(
			body.scrollHeight,
			body.offsetHeight,
			documentElement.clientHeight,
			documentElement.scrollHeight,
			documentElement.offsetHeight,
		),
	}
}

const getUrlValues = () => {
	// returns dictionary with key & value pars from URL
	const urlString = location.search.substring(1),
		dict = {}
	if (urlString === '') return

	urlString.split('&').forEach(exp => {
		if (exp.search(/=/) === -1) {
			// if in URL there was no key value par but only one value:
			dict[exp] = null
		} else {
			const pair = exp.split('=')
			dict[pair[0]] = decodeURIComponent(pair[1])
		}
	})

	return dict
}

const getUrlValue = key => {
	// returns true / false if key is present or its value if present
	const url = location.search.substring(1)
	if (url === '') return false

	if (url.search(/=/) === -1 && url === key) return true

	let val
	url.split('&').forEach(exp => {
		const pair = exp.split('=')
		if (pair[0] === key) val = pair[1]
	})

	return decodeURIComponent(val)
}

function setUrlVar(key = null, value = null, dictionary = null) {
	const dict = dictionary || getUrlValues() || {},
		string = '?'

	if (key !== null) dict[key] = value

	for (let k in dict)
		string +=
			dict[k] !== null
				? k + '=' + encodeURIComponent(dict[k]) + '&'
				: k + '&'

	history.replaceState(null, null, location.pathname + string.slice(0, -1))
}

function delUrlVal(key) {
	const dict = getUrlValues() || {}

	for (let k in dict) {
		if (k == key) delete dict[key]
	}

	setUrlVar(null, null, dict)
}

const URL = {
	set: setUrlVar,
	get: getUrlValue,
	getDict: getUrlValues,
	del: delUrlVal,
}

function addMultiEventListener(el, s, fn) {
	s.split(' ').forEach(e => el.addEventListener(e, fn, false))
}
// Usage:
// addMultiEventListener(window, 'resize scroll', () => { code... });

/*!
 * Serialize all form d into a query string
 * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {Node}   form The form to serialize
 * @return {String}      The serialized form d
 */
var serialize = function(form) {
	// Setup our serialized d
	var serialized = []

	// Loop through each field in the form
	for (var i = 0; i < form.elements.length; i++) {
		var field = form.elements[i]

		// Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
		if (
			!field.name ||
			field.disabled ||
			field.type === 'file' ||
			field.type === 'reset' ||
			field.type === 'submit' ||
			field.type === 'button'
		)
			continue

		// If a multi-select, get all selections
		if (field.type === 'select-multiple') {
			for (var n = 0; n < field.options.length; n++) {
				if (!field.options[n].selected) continue
				serialized.push(
					encodeURIComponent(field.name) +
						'=' +
						encodeURIComponent(field.options[n].value),
				)
			}
		} else if (
			(field.type !== 'checkbox' && field.type !== 'radio') ||
			field.checked
		) {
			// Convert field d to a query string
			serialized.push(
				encodeURIComponent(field.name) +
					'=' +
					encodeURIComponent(field.value),
			)
		}
	}

	return serialized.join('&')
}

module.exports = {
	clamp,
	flipP,
	valToP,
	valToPwMid,
	pToVal,
	random,
	stringWithoutRepeat,
	setCssProperties,
	wait,
	promiseWhile,
	getWindowSize,
	stayInLoop,
	URL,
	addMultiEventListener,
}
