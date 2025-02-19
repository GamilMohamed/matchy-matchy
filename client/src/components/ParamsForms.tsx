import { useState } from 'react';

function ContactForms() {
	const [formData, setFormData] = useState({
		firstname: '',
		lastname: '',
		email: '',
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		/*
    	JSON {
			email: formData.email
    		firstname: formData.firstname,
    		lastname: formData.lastname,
    	}
    	const json = JSON.stringify(newFilters);
    	*/
		e.preventDefault();
		console.log('Updated user info:', formData);
		// Ici, tu peux ajouter une requête API pour mettre à jour les informations utilisateur
	};

	return (
		<div className="bottom-0 left-0 right-0 text-gray-300 z-50 w-full">
			<div className="container mx-auto w-96">
				<form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-lg">
					<div className="mb-4">
						<label className="block mb-3 text-lg font-semibold text-gray-800">Email</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							className="w-full px-4 py-3 text-gray-800 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
						/>
					</div>
					<div className="mb-4">
						<label className="block mb-3 text-lg font-semibold text-gray-800">Prénom</label>
						<input
							type="text"
							name="firstname"
							value={formData.firstname}
							onChange={handleChange}
							className="w-full px-4 py-3 text-gray-800 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
						/>
					</div>
					<div className="mb-4">
						<label className="block mb-3 text-lg font-semibold text-gray-800">Nom</label>
						<input
							type="text"
							name="lastname"
							value={formData.lastname}
							onChange={handleChange}
							className="w-full px-4 py-3 text-gray-800 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
						/>
					</div>
					<button
						type="submit"
						className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
					>
						Sauvegarder
					</button>
				</form>
			</div>
		</div>
	)
}

export default ContactForms