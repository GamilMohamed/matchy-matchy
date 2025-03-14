import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
import { Bubble, Button, Card, Popup } from "pixel-retroui";
// import { Input } from "@/components/ui/input";
import { Input } from "pixel-retroui";

import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
// import Cookies from 'js-cookie';
import { useAuth } from "@/context/auth-context";
import { RegisterData } from "@/types/auth";
// import { Mail } from "lucide-react";
import {Mail} from "../assets/mail.svg"

const LoginForm = () => {
  const { login, register } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "mohazerr@outlook.fr",
    username: "mohazerr",
    firstname: "moh",
    lastname: "gam",
    password: "123",
    birth_date: new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0],
  });
  const [birthdateError, setBirthdateError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [usernameImage, setUsernameImage] = useState("");
  const [usernameDesign, setUsernameDesign] = useState<number>(0);

  const handleUsernameDesignChange = () => {
    setUsernameDesign((prev) => {
      if (prev === 2) return 0;
      return prev + 1;
    });
  };

  useEffect(() => {
    checkUsernameAvailability(formData.username);
  }, [usernameDesign]);

  const checkUsernameAvailability = async (username: string) => {
    if (!username) return;
    setUsernameImage(`https://robohash.org/${username}.png?set=${["set1", "set2", "set4"][usernameDesign]}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "username") {
      checkUsernameAvailability(e.target.value);
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === "birth_date") {
      validateAge(e.target.value);
    }
  };

  const validateAge = (birth_date: string) => {
    if (!birth_date) {
      setBirthdateError("La date de naissance est requise");
      return false;
    }

    const today = new Date();
    const birthdateDate = new Date(birth_date);
    const age = today.getFullYear() - birthdateDate.getFullYear();
    const monthDiff = today.getMonth() - birthdateDate.getMonth();

    // Si le mois actuel est avant le mois de naissance ou si c'est le même mois mais que le jour actuel est avant le jour de naissance
    const isBeforeBirthday = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdateDate.getDate());

    const actualAge = isBeforeBirthday ? age - 1 : age;

    if (actualAge < 18) {
      setBirthdateError("Vous devez avoir au moins 18 ans pour vous inscrire");
      return false;
    } else {
      setBirthdateError("");
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
    if (!validateAge(formData.birth_date)) {
      toast({
        title: "Erreur",
        description: "Vous devez avoir au moins 18 ans pour vous inscrire.",
        variant: "destructive",
      });
      return;
    }

    try {
      const a = await register({
        email: formData.email,
        password: formData.password,
        firstname: formData.firstname,
        lastname: formData.lastname,
        username: formData.username,
        birth_date: formData.birth_date,
      } as RegisterData);
      console.log("a", a);
      if (a) {
        setIsSignupOpen(false);
        setIsLoginOpen(true);
      }
      // alert("putain pk ca passe");
      // setIsSignupOpen(false);
      // setIsLoginOpen(true);
      // await login(formData.email, formData.password);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleUsernameChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    checkUsernameAvailability(formData.username);
  };
  // const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   alert("handleUsernameChange" + e.target.value);
  //   setFormData({
  //     ...formData,
  //     username: e.target.value,
  //   });
  // };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 w-full">
      <Card bg="#fefcd0" textColor="black" borderColor="black" shadowColor="#c381b5" className="p-4 text-center">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">Bienvenue</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => setIsLoginOpen(true)} className="flex-1 w-64 h-12" bg="orange">
            Se connecter
          </Button>
          <Popup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} className="w-screen">
            <form onSubmit={handleLogin} className="space-y-4 w-[500px] p-4">
              <div className="flex justify-between items-center">
                <p className="text-xl">Email</p>
                <Input 
                icon="/assets/mail.svg"
                id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} />
              </div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" name="password" type="password" required value={formData.password} onChange={handleInputChange} />
              </div>
              <Button type="submit" className="w-full">
                Se connecter
              </Button>
            </form>
          </Popup>
          <Button onClick={() => setIsSignupOpen(true)} className="flex-1 w-64 h-12" bg="lightgrey">
            S'inscrire
          </Button>
          <Popup isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)}>
            <form onSubmit={handleSignup} className="space-y-4 w-[500px] p-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" name="email" type="email" required value={formData.email} onChange={handleInputChange} />
              </div>
              <div className="flex justify-between items-center">
                <Label htmlFor="username">Username</Label>
                <div className="flex items-center gap-2">
                  <Input id="username" name="username" type="text" required value={formData.username} onChange={handleInputChange} />
                  {/* {usernameImage && <img onClick={handleUsernameDesignChange} src={usernameImage} alt="Username" className="w-14 h-14" />} */}
                </div>
                {/* <p className="text-xs text-gray-500">Cliquez sur l'icône pour changer de design</p> */}
              </div>
              <div className="flex justify-between items-center">
                <Label htmlFor="firstname">Prénom</Label>
                <Input id="firstname" name="firstname" type="text" required value={formData.firstname} onChange={handleInputChange} />
              </div>
              <div className="flex justify-between items-center">
                <Label htmlFor="lastname">Nom</Label>
                <Input id="lastname" name="lastname" type="text" required value={formData.lastname} onChange={handleInputChange} />
              </div>
              <div className="flex justify-between items-center">
                <Label htmlFor="birth_date">Date de naissance</Label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  required
                  value={formData.birth_date}
                  onChange={handleInputChange}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                  className="[&::-webkit-calendar-picker-indicator]:bg-white [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:rounded"
                />
                {birthdateError && <p className="text-sm text-red-500">{birthdateError}</p>}
              </div>
              <div className="flex justify-between items-center">
                <Label htmlFor="signup-password">Mot de passe</Label>
                <Input id="signup-password" name="password" type="password" required value={formData.password} onChange={handleInputChange} />
              </div>
              <Button type="submit" className="w-full" disabled={!!birthdateError} bg="orange">
                S'inscrire
              </Button>
            </form>
          </Popup>

          {/* <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
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
                    <Input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input id="password" name="password" type="password" required value={formData.password} onChange={handleInputChange} />
                  </div>
                  <Button type="submit" className="w-full">
                    Se connecter
                  </Button>
                </form>
              </DialogContent>
            </Dialog> */}

          {/* <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                S'inscrire
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Inscription</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" name="email" type="email" required value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="flex items-center gap-2">
                    <Input id="username" name="username" type="text" required value={formData.username} onChange={handleInputChange} />
                    {usernameImage && <img onClick={handleUsernameDesignChange} src={usernameImage} alt="Username" className="w-14 h-14" />}
                  </div>
                  <p className="text-xs text-gray-500">Cliquez sur l'icône pour changer de design</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstname">Prénom</Label>
                  <Input id="firstname" name="firstname" type="text" required value={formData.firstname} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastname">Nom</Label>
                  <Input id="lastname" name="lastname" type="text" required value={formData.lastname} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Date de naissance</Label>
                  <Input
                    id="birth_date"
                    name="birth_date"
                    type="date"
                    required
                    value={formData.birth_date}
                    onChange={handleInputChange}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                    className="[&::-webkit-calendar-picker-indicator]:bg-white [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:rounded"
                  />
                  {birthdateError && <p className="text-sm text-red-500">{birthdateError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Mot de passe</Label>
                  <Input id="signup-password" name="password" type="password" required value={formData.password} onChange={handleInputChange} />
                </div>
                <Button type="submit" className="w-full" disabled={!!birthdateError}>
                  S'inscrire
                </Button>
              </form>
            </DialogContent>
          </Dialog> */}
        </div>
      </Card>
    </div>
  );
};

export { LoginForm };
