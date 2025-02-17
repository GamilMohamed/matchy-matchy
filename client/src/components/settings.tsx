import Footer from './Footer';
import Nav from './Nav';
import ContactForms from './ParamsForms';

function Settings() {

	return (
		<div className="flex flex-col items-center justify-between w-screen h-screen">
			<Nav />
			<ContactForms />
			<Footer />
		</div>
	)
}

export default Settings