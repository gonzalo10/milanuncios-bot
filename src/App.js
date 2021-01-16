import { useState } from 'react'
import './App.css'

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
		console.log('handleSubmit', token)
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
					/>
				</div>
				<div>
					<label className={'login_input_label'}>Contraseña</label>
					<input
						className={'login_input'}
						value={password}
						onChange={handlePasswordChange}
						placeholder={'Contraseña de Milanuncios'}
					/>
				</div>
				<button className={'login_button'}>Conectar con milanuncios</button>
			</form>
		</div>
	)
}

const MyOrders = ({ getOrders, orders }) => {
	return (
		<div>
			<div className={'get_orders_wrapper'}>
				<button onClick={getOrders} className={'basic_button'}>
					Cargar mis anuncios
				</button>
			</div>
			{orders && (
				<>
					<span className={'get_orders_title'}>Mis anuncios</span>
					<div className={'Products_wrapper'}>
						{orders.map((order) => (
							<div className={'Product_wrapper'}>
								<span>{order.titulo}</span>
								<img src={order.fotos_thumb[0]} alt={order.titulo} />
							</div>
						))}
					</div>
				</>
			)}
		</div>
	)
}

const RenewButton = ({ handleClick }) => {
	return (
		<button onClick={handleClick} className={'Renew_button'}>
			Renover todos mis anuncios
		</button>
	)
}

function App() {
	const [token, setToken] = useState(null)
	const [orders, setOrders] = useState([])

	const getOrders = async () => {
		const orders = await apiCall('/api/login', { type: 'orders', token: token })
		setOrders(orders)
	}

	const renewProducts = async () => {
		const hasBeenSuccesfull = await apiCall('/api/login', {
			type: 'renew',
			token: token
		})
		console.log({ hasBeenSuccesfull })
	}

	return (
		<>
			{!token ? (
				<LoginForm setToken={setToken} />
			) : (
				<>
					<MyOrders getOrders={getOrders} orders={orders} />
					<div className={'Renew_button_wrapper'}>
						<RenewButton handleClick={renewProducts} />
					</div>
				</>
			)}
		</>
	)
}

export default App
