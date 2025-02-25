import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
// import Cookies from 'js-cookie';
import { useAuth } from '@/context/auth-context';

const LoginForm = () => {
  const { login, signup } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    firstname: '',
    lastname: '',
    password: '',
    birthdate: '',
  });
  const [birthdateError, setBirthdateError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Vérifier l'âge lorsque la date de naissance change
    if (e.target.name === 'birthdate') {
      validateAge(e.target.value);
    }
  };

  const validateAge = (birthdate: string) => {
    if (!birthdate) {
      setBirthdateError('La date de naissance est requise');
      return false;
    }

    const today = new Date();
    const birthdateDate = new Date(birthdate);
    const age = today.getFullYear() - birthdateDate.getFullYear();
    const monthDiff = today.getMonth() - birthdateDate.getMonth();
    
    // Si le mois actuel est avant le mois de naissance ou si c'est le même mois mais que le jour actuel est avant le jour de naissance
    const isBeforeBirthday = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdateDate.getDate());
    
    const actualAge = isBeforeBirthday ? age - 1 : age;
    
    if (actualAge < 18) {
      setBirthdateError('Vous devez avoir au moins 18 ans pour vous inscrire');
      return false;
    } else {
      setBirthdateError('');
      return true;
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(formData.email, formData.password);
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Valider l'âge avant de soumettre
    if (!validateAge(formData.birthdate)) {
      toast({
        title: "Erreur",
        description: "Vous devez avoir au moins 18 ans pour vous inscrire.",
        variant: "destructive",
      });
      return;
    }
    
    await signup(
      formData.email, 
      formData.password, 
      formData.firstname, 
      formData.lastname, 
      formData.username,
      formData.birthdate // Ajouter la date de naissance
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="bg-white p-8 rounded-lg shadow-lg space-y-4">
          <h1 className="text-2xl font-bold text-center text-gray-900">Bienvenue</h1>

          <div className="flex flex-col sm:flex-row gap-4">
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1">Se connecter</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Connexion</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Se connecter
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">S'inscrire</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Inscription</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstname">Prénom</Label>
                    <Input
                      id="firstname"
                      name="firstname"
                      type="text"
                      required
                      value={formData.firstname}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastname">Nom</Label>
                    <Input
                      id="lastname"
                      name="lastname"
                      type="text"
                      required
                      value={formData.lastname}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthdate">Date de naissance</Label>
                    <Input
                      id="birthdate"
                      name="birthdate"
                      type="date"
                      required
                      value={formData.birthdate}
                      onChange={handleInputChange}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    />
                    {birthdateError && (
                      <p className="text-sm text-red-500">{birthdateError}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={!!birthdateError}>
                    S'inscrire
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export { LoginForm };