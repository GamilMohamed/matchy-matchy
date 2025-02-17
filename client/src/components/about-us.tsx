import Footer from './Footer';
import Nav from './Nav';

function About() {
	return (
		<div className="flex flex-col items-center justify-between w-screen h-screen">
			<Nav />
			<a href="https://github.com/mvachera" target="_blank">mvachera</a>
			<Footer />
		</div>
	)
}

export default About