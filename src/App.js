import { useCallback, useEffect, useState } from 'react'
import './App.css'
import Loader from './loader'

const apiCall = async (path, body) => {
	try {
		const response = await fetch(path, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				...body
			})
		})
		const JsonResponse = await response.json()
		return await JsonResponse
	} catch (err) {
		console.error(err)
	}
}

const LoginForm = ({ setToken }) => {
	const [user, setUser] = useState('')
	const [password, setPassword] = useState('')
	const handleUserChange = (e) => {
		setUser(e.target.value)
	}
	const handlePasswordChange = (e) => {
		setPassword(e.target.value)
	}
	const handleSubmit = async (e) => {
		e.preventDefault()
		const token = await apiCall('/api/login', { type: 'login', user, password })
		setToken(token)
	}

	return (
		<div className={'login_wrapper'}>
			<h3 className={'login_title'}>Inicia sesion en milanuncios</h3>
			<form onSubmit={handleSubmit}>
				<div className={'login_input_wrapper'}>
					<label className={'login_input_label'}>Email</label>
					<input
						className={'login_input'}
						value={user}
						onChange={handleUserChange}
						placeholder={'Usuario de Milanuncios'}
						autoComplete={'username'}
					/>
				</div>
				<div>
					<label className={'login_input_label'}>Contraseña</label>
					<input
						className={'login_input'}
						value={password}
						onChange={handlePasswordChange}
						placeholder={'Contraseña de Milanuncios'}
						autoComplete='current-password'
						type='password'
					/>
				</div>
				<button className={'button login_button'}>
					Conectar con milanuncios
				</button>
			</form>
		</div>
	)
}

const productStatus = (productInfo) => {
	if (+productInfo?.status === 422) return 'renovacion no disponible'
	if (+productInfo?.status === 200) return 'Renovado con exito'
	return ''
}

const MyOrders = ({ orders, productsAdsStatus }) => {
	if (!orders) return <div>Cargando Anuncios</div>
	return (
		<div className={'get_orders_wrapper'}>
			{orders && (
				<>
					<span className={'get_orders_title'}>Mis anuncios</span>
					<div className={'Products_wrapper'}>
						{orders.map((order, index) => (
							<div className={'Product_wrapper'}>
								<img src={order?.fotos_thumb?.[0]} alt={order.titulo} />
								<span className={'article_title'}>{order.titulo}</span>
								<span className={'article_title'}>
									{productStatus(productsAdsStatus[index])}
								</span>
							</div>
						))}
					</div>
				</>
			)}
		</div>
	)
}

const RenewButton = ({ handleClick, renewStatus }) => {
	return (
		<button onClick={handleClick} className={'button Renew_button'}>
			{renewStatus.isLoading ? (
				<>
					<span>Renovando anuncios</span>
					<Loader />
				</>
			) : (
				'Renovar todos mis anuncios'
			)}
		</button>
	)
}

const renewProduct = (token, adId) => {
	return apiCall('/api/login', {
		type: 'renew',
		token: token,
		adId
	})
}

const bulkRenew = async (token, productsAds) => {
	const promises = productsAds.map((ad) => renewProduct(token, ad.idanuncio))
	const response = await Promise.all(promises)
	return response
}

const getApiStatus = (status) => {
	let isLoading = false
	let isSuccess = false
	let hasError = false
	if (status === 'loading') isLoading = true
	if (status === 'error') hasError = true
	if (status === 'success') isSuccess = true
	return { isLoading, isSuccess, hasError }
}

function App() {
	const [token, setToken] = useState(null)
	const [productsAds, setProductsAds] = useState([])
	const [productsAdsStatus, setProductsAdsStatus] = useState([])
	const [renewStatus, setRenewStatus] = useState([])

	const getProductsAds = useCallback(async () => {
		const productsAdsRaw = await apiCall('/api/login', {
			type: 'orders',
			token: token
		})
		setProductsAds(productsAdsRaw)
	}, [token])

	useEffect(() => {
		token && getProductsAds()
	}, [token, getProductsAds])

	const renewAllProducts = async () => {
		setRenewStatus('loading')
		try {
			const producStatus = await bulkRenew(token, productsAds)
			setProductsAdsStatus(producStatus)
			setRenewStatus('success')
		} catch (err) {
			setRenewStatus('error')
		}
	}

	return (
		<>
			{!token ? (
				<LoginForm setToken={setToken} />
			) : (
				<>
					<MyOrders
						orders={productsAds}
						productsAdsStatus={productsAdsStatus}
					/>
					<div className={'Renew_button_wrapper'}>
						<RenewButton
							handleClick={renewAllProducts}
							renewStatus={getApiStatus(renewStatus)}
						/>
					</div>
				</>
			)}
		</>
	)
}

export default App
