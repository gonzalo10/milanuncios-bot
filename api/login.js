const fetch = require('node-fetch')

const respondAPIQuery = (res, data, status = 200) => {
	const hasError = data.error
	if (hasError) {
		res.statusCode = data.error.code
		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify(data.error))
		return
	}
	if (data && !hasError) {
		res.statusCode = status
		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify(data))
		return
	}
	res.statusCode = 500
	res.setHeader('Content-Type', 'application/json')
	res.end()
	return
}

const customHeaders = {
	accept: 'application/json, text/plain, */*',
	'accept-language': 'en-US,en;q=0.9',
	'content-type': 'application/json;charset=UTF-8',
	'sec-fetch-dest': 'empty',
	'sec-fetch-mode': 'cors',
	'sec-fetch-site': 'same-origin'
}

const customReferrer = {
	referrer: 'https://www.milanuncios.com/mis-anuncios/',
	referrerPolicy: 'no-referrer-when-downgrade'
}

const methodAndCors = {
	method: 'POST',
	mode: 'cors'
}

async function getCookie(response, apiToken) {
	const cookie = await fetch(
		'https://www.milanuncios.com/api/v3/oauth2/authorize',
		{
			headers: {
				...customHeaders,
				cookie: parseCookies(response)
			},
			...customReferrer,
			...methodAndCors,
			body: '{"apiToken":"' + apiToken + '"}'
		}
	)
	const myCookie = await cookie.json()
	return myCookie
}

async function getAllOrders(apiToken) {
	const orders = await fetch(
		'https://www.milanuncios.com/api/v2/misanuncios/misanuncios.php',
		{
			headers: {
				accept: 'application/json, text/plain, */*',
				'content-type': 'application/x-www-form-urlencoded',
				mav: '2'
			},
			...customReferrer,
			...methodAndCors,
			body: 'p=1&r=30&token=' + apiToken
		}
	)
	const myOrders = await orders.json()
	return myOrders
}

const login = async (req, res) => {
	const { user, password } = req.body
	console.log(user, password)
	try {
		const response = await fetch('https://www.milanuncios.com/api/v3/logins', {
			headers: customHeaders,
			...customReferrer,
			...methodAndCors,
			body: `{"identifier":"${user}","password":"${password}","rememberMe":"true"}`
		})
		console.log(response.status)
		const myJson = await response.json()
		console.log(myJson)
		const apiToken = myJson.session.apiToken
		respondAPIQuery(res, apiToken)
	} catch (err) {
		console.log(err)
	}
}

async function getMyOrders(req, res) {
	const apiToken = req.body.token
	const myOrders = await getAllOrders(apiToken)
	const anuncios = myOrders.data ? myOrders.data.anuncios : []
	respondAPIQuery(res, anuncios)
}

async function renewArticles(req, res) {
	const apiToken = req.body.token
	const isRenew = await renewOrder(apiToken)
	console.log(isRenew.status)
	respondAPIQuery(res, isRenew)
}

function renewOrder(apiToken, orderId) {
	return fetch(`https://www.milanuncios.com/api/v4/ads/${orderId}/renew`, {
		headers: {
			...customHeaders,
			token: apiToken
		},
		...customReferrer,
		...methodAndCors,
		body: '{"tokenRenew":""}'
	})
}

function parseCookies(response) {
	const raw = response.headers.raw()['set-cookie']
	return raw
		.map((entry) => {
			const parts = entry.split(';')
			const cookiePart = parts[0]
			return cookiePart
		})
		.join(';')
}

module.exports = (req, res) => {
	const { type } = req.body
	switch (type) {
		case 'login':
			login(req, res)
			break
		case 'orders':
			getMyOrders(req, res)
			break
		case 'renew':
			renewArticles(req, res)
			break
		default:
			break
	}
}
