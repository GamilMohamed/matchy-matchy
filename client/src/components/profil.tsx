import { useState } from 'react';
import Nav from './Nav';
import { X } from 'lucide-react';
import Footer from './Footer';

interface ProfileData {
  gender: string;
  sexualPreferences: string;
  biography: string;
  interests: string[];
  pictures: File[];
  profilePicture: File | null;
}

function Profile() {
  const [profileData, setProfileData] = useState<ProfileData>({
    gender: '',
    sexualPreferences: '',
    biography: '',
    interests: [],
    pictures: [],
    profilePicture: null,
  });

  const [newTag, setNewTag] = useState('');

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim() !== '') {
      e.preventDefault();
      if (!newTag.startsWith('#')) {
        setProfileData({
          ...profileData,
          interests: [...profileData.interests, `#${newTag.trim()}`],
        });
      } else {
        setProfileData({
          ...profileData,
          interests: [...profileData.interests, newTag.trim()],
        });
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setProfileData({
      ...profileData,
      interests: profileData.interests.filter(tag => tag !== tagToRemove),
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isProfilePic: boolean) => {
    const files = e.target.files;
    if (!files) return;

    if (isProfilePic) {
      setProfileData({
        ...profileData,
        profilePicture: files[0],
      });
    } else {
      if (profileData.pictures.length + files.length <= 4) {
        setProfileData({
          ...profileData,
          pictures: [...profileData.pictures, ...Array.from(files)],
        });
      } else {
        alert('Maximum 4 additional pictures allowed');
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setProfileData({
      ...profileData,
      pictures: profileData.pictures.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-1 pt-20 pb-52">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">Edit Profile</h2>
            
            {/* Gender Selection */}
            <div className="mb-8">
              <label className="block mb-3 text-lg font-semibold text-gray-800">Gender</label>
              <div className="flex gap-6">
                {['male', 'female', 'other'].map((option) => (
                  <label key={option} className="flex items-center gap-2 bg-white border-2 border-gray-300 px-4 py-2 rounded-lg hover:border-blue-500 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value={option}
                      checked={profileData.gender === option}
                      onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="text-gray-800 text-lg">{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sexual Preferences */}
            <div className="mb-8">
              <label className="block mb-3 text-lg font-semibold text-gray-800">Sexual Preferences</label>
              <div className="flex gap-6">
                {['men', 'women', 'both'].map((option) => (
                  <label key={option} className="flex items-center gap-2 bg-white border-2 border-gray-300 px-4 py-2 rounded-lg hover:border-blue-500 cursor-pointer">
                    <input
                      type="radio"
                      name="sexualPreferences"
                      value={option}
                      checked={profileData.sexualPreferences === option}
                      onChange={(e) => setProfileData({ ...profileData, sexualPreferences: e.target.value })}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="text-gray-800 text-lg">{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Biography */}
            <div className="mb-8">
              <label htmlFor="bio" className="block mb-3 text-lg font-semibold text-gray-800">Biography</label>
              <textarea
                id="bio"
                value={profileData.biography}
                onChange={(e) => setProfileData({ ...profileData, biography: e.target.value })}
                className="w-full h-32 px-4 py-3 text-gray-800 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Interests/Tags */}
            <div className="mb-8">
              <label htmlFor="interests" className="block mb-3 text-lg font-semibold text-gray-800">
                Interests (Press Enter to add)
              </label>
              <input
                id="interests"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full px-4 py-3 text-gray-800 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                placeholder="Add interests (e.g. vegan, geek, piercing)"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {profileData.interests.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-blue-100 text-gray-800 px-4 py-2 rounded-lg border-2 border-blue-300 text-lg"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Picture */}
            <div className="mb-8">
              <label htmlFor="profilePic" className="block mb-3 text-lg font-semibold text-gray-800">Profile Picture</label>
              <input
                id="profilePic"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, true)}
                className="w-full px-4 py-3 text-gray-800 text-lg border-2 border-gray-300 rounded-lg bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-lg file:bg-blue-500 file:text-white hover:file:bg-blue-600"
              />
              {profileData.profilePicture && (
                <div className="mt-3 text-lg text-gray-800 bg-white border-2 border-gray-300 rounded-lg p-3">
                  <p>Selected profile picture: {profileData.profilePicture.name}</p>
                </div>
              )}
            </div>

            {/* Additional Pictures */}
            <div className="mb-8">
              <label htmlFor="additionalPics" className="block mb-3 text-lg font-semibold text-gray-800">
                Additional Pictures (Max 4)
              </label>
              <input
                id="additionalPics"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e, false)}
                disabled={profileData.pictures.length >= 4}
                className="w-full px-4 py-3 text-gray-800 text-lg border-2 border-gray-300 rounded-lg bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-lg file:bg-blue-500 file:text-white hover:file:bg-blue-600"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {profileData.pictures.map((pic, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white border-2 border-gray-300 px-4 py-2 rounded-lg text-lg">
                    <p className="text-gray-800">{pic.name}</p>
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold">
              Save Profile
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Profile;