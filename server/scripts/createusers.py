import requests
import random
import time
import json

def mock_users():
    users = []
    for i in range(10):
        users.append({
            'firstname': 'User' + str(i),
            'lastname': 'Lastname' + str(i),
            'username': 'username' + str(i),
            'email': 'user' + str(i) + '@gmail.com',
            'password': 'password' + str(i),
            'birthdate': '2000-01-01',
        })
    return users

def signup_users(users):
    for user in users:
        try:
            res = requests.post('http://localhost:3000/auth/signup', json=user)
            print(f"Signup status for {user['username']}: {res.status_code}")
            if res.status_code >= 400:
                print(f"Signup response: {res.text[:100]}...")
        except Exception as e:
            print(f"Error signing up {user['username']}: {str(e)}")
    
    # Small delay to allow server to process registrations
    time.sleep(1)

def signin_users(users):
    for user in users:
        try:
            credentials = {'email': user['email'], 'password': user['password']}
            res = requests.post('http://localhost:3000/auth/signin', json=credentials)
            
            if res.status_code == 200:
                response_data = res.json()
                if 'token' in response_data:
                    user['token'] = response_data['token']
                    print(f"Successfully signed in: {user['username']}")
                else:
                    print(f"No token in response for {user['username']}")
                    print(f"Response: {response_data}")
            else:
                print(f"Failed to sign in {user['username']}: Status {res.status_code}")
                print(f"Response: {res.text[:100]}...")
        except Exception as e:
            print(f"Error signing in {user['username']}: {str(e)}")

def load_user_profiles(users):
    for i, user in enumerate(users):
        if 'token' not in user:
            print(f"Skipping profile update for {user['username']} - no token")
            continue
            
        # Create mock profile data matching the expected structure
        profile = {
            'gender': random.choice(["male", "female", "other"]),
            'sexualPreferences': random.choice(["men", "women", "both"]),
            'biography': f'This is the biography for user {i}',
            'interests': ['coding', 'hiking', 'movies', 'travel'][:random.randint(1, 4)],
            'authorizeLocation': 'true',
            'location': {
                'latitude': 14.5995,
                'longitude': 120.9842,
                'country': 'United States',
                'city': random.choice(['New York', 'San Francisco', 'Chicago', 'Miami', 'Seattle'])
            },
            'pictures': []  # Empty array for existing pictures
        }
        
        try:
            # For profile picture, we'll use a multipart/form-data request
            # For demo purposes, we're just showing the structure
            # In a real scenario, you'd need actual image files
            
            # Create form data with all the profile info
            # Create form data with all the profile info
            form_data = {}
            
            # Add basic text fields
            form_data['gender'] = profile['gender']
            form_data['sexualPreferences'] = profile['sexualPreferences']
            form_data['biography'] = profile['biography']
            form_data['authorizeLocation'] = profile['authorizeLocation']
            
            # Location needs to be passed as JSON
            form_data['location'] = json.dumps(profile['location'])
            
            # Pictures need to be passed as JSON
            form_data['pictures'] = json.dumps([])
            
            # Interests need special handling for arrays in form data
            # In requests, for arrays we need to use the same key multiple times
            for interest in profile['interests']:
                form_data['interests[]'] = interest
            
            # In a real scenario, you would add actual files like this:
            files = {
                'profilePicture': ('profile.jpg', open('profile.jpg', 'rb'), 'image/jpeg'),
                'pictures[]': ('pic1.jpg', open('pic1.jpg', 'rb'), 'image/jpeg')
            }
            
            # Simulate without actual files for demo
            print(f"Would send the following data for {user['username']}:")
            print(json.dumps(form_data, indent=2))
            
            # Comment out the actual request since we don't have real files
            res = requests.put(
                'http://localhost:3000/users/profile', 
                headers={'Authorization': 'Bearer ' + user['token']},
                data=form_data,
                files=files
            )
            
            # Instead, let's make a simplified request without the files
            # res = requests.put(
            #     'http://localhost:3000/users/profile', 
            #     headers={'Authorization': 'Bearer ' + user['token']},
            #     data=form_data
            # )
            
            print(f"Profile update for {user['username']}: Status {res.status_code}")
            if res.status_code >= 400:
                print(f"Profile update response: {res.text[:100]}...")
            else:
                print(f"Profile successfully updated for {user['username']}")
        except Exception as e:
            print(f"Error updating profile for {user['username']}: {str(e)}")

def main():
    users = mock_users()
    signup_users(users)
    signin_users(users)
    load_user_profiles(users)
 
if __name__ == '__main__':
    main()