import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { UserCircle, Home, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom'

const Nav = () => {
	const { logout } = useAuth();
	const handleLogout = () => {
		logout();
	};

	return (
    	<nav className="top-0 left-0 right-0 bg-black/10 shadow-sm border-b z-50 h-1/7 w-full">
    	  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    	    <div className="flex justify-center h-16 items-center">
    	      <div className="flex items-center space-x-8">
			  <Link to="/" className="flex items-center">
  				<Home className="h-6 w-6 text-blue-600" />
					<span className="ml-2 text-xl font-bold text-white-900">Matchy matchy</span>
			  </Link>
			  <div className="flex space-x-6">
			    <Link to="/" className="px-3 py-2 text-white-600 hover:text-gray-900">
			      Accueil
			    </Link>
			    <Link to="/about-us" className="px-3 py-2 text-white-600 hover:text-gray-900">
			      About us
			    </Link>
			  </div>
				<div className="flex items-center space-x-4">
  					<Link to="/settings">
  					  <Button variant="ghost" size="icon">
  					    <Settings className="h-5 w-5" />
  					  </Button>
  					</Link>
  					<Link to="/profil">
  					  <Button variant="ghost" size="icon">
  					    <UserCircle className="h-5 w-5" />
  					  </Button>
  					</Link>
  					<Link to="/">
					  <Button variant="ghost" size="icon" onClick={handleLogout}>
        				<LogOut className="h-5 w-5" />
      				  </Button>
  					</Link>
				</div>
			  </div>
			</div>
		  </div>
		</nav>
	);
};

export default Nav;