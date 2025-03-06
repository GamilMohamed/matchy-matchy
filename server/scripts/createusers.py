import requests
import random
import time

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
            
        profile = {
            'gender': random.choice(["male", "female"]),
            'sexualPreferences': random.choice(["male", "female", "both"]),
            'biography': 'Biography ' + str(i),
            'interests': ['interest1', 'interest2'],
            'profilePicture': 'profilePicture' + str(i),
        }
        
        try:
            res = requests.put(
                'http://localhost:3000/users/profile', 
                headers={'Authorization': 'Bearer ' + user['token']},
                json=profile  # Changed from 'body' to 'json'
            )
            
            print(f"Profile update for {user['username']}: Status {res.status_code}")
            if res.status_code >= 400:
                print(f"Profile update response: {res.text[:100]}...")
        except Exception as e:
            print(f"Error updating profile for {user['username']}: {str(e)}")

def main():
    users = mock_users()
    signup_users(users)
    signin_users(users)
    load_user_profiles(users)
 
if __name__ == '__main__':
    main()