import { Button } from "@/components/ui/button";
import { UserCircle, Home, Settings, LogOut } from 'lucide-react';

const Nav = () => {
	const handleLogout = () => {
	  window.location.href = '/login';
	};

	// const handleHome = () => {
	// 	window.location.href = '/';
	//   };

	return (
    	<nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
    	  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    	    <div className="flex justify-center h-16 items-center">
    	      <div className="flex items-center space-x-8">
    	        <a href="/" className="flex items-center">
					{/* <Button variant="ghost" onClick={handleHome}> */}
						<Home className="h-6 w-6 text-blue-600" />
					{/* </Button> */}
					<span className="ml-2 text-xl font-bold text-gray-900">Matchy matchy</span>
				</a>
    	        <div className="flex space-x-6">
    	          <a href="/" className="px-3 py-2 text-gray-600 hover:text-gray-900">
				  	Accueil
    	          </a>
    	          <a href="/about-us" className="px-3 py-2 text-gray-600 hover:text-gray-900">
    	            About us
    	          </a>
    	        </div>

    	        <div className="flex items-center space-x-4">
    	          <Button variant="ghost" size="icon">
    	            <Settings className="h-5 w-5" />
    	          </Button>
    	          <Button variant="ghost" size="icon">
    	            <UserCircle className="h-5 w-5" />
    	          </Button>
    	          <Button variant="ghost" size="icon" onClick={handleLogout}>
    	            <LogOut className="h-5 w-5" />
    	          </Button>
    	        </div>
    	      </div>
    	    </div>
    	  </div>
    	</nav>
  );
};

export default Nav;