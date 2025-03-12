import Nav from './Nav';
import Footer from './Footer';
import PreferencesForms from './ProfileForm/ProfileForm';

function Profile() {

  return (
    <div className="flex flex-col justify-between w-screen h-screen h-full">
      <Nav />
      <PreferencesForms />
      <Footer />
    </div>
  );
}

export default Profile;