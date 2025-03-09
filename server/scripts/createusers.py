import requests
import random
import time
import json
from datetime import datetime
from geoloc import get_city_coordinates

def random_picture(sex):
    """
    Generate a random picture for the user
    """
    sex = "women" if sex == "female" else "men" 
    return f"https://randomuser.me/api/portraits/{sex}/{random.randint(0, 99)}.jpg"

def mock_users(num_users=10):
    """
    Generate mock users using the RandomUser API
    """
    users = []
    try:
        # Request multiple users at once from the RandomUser API
        response = requests.get(f'https://randomuser.me/api/?nat=fr&results={num_users}')
        print(response)
        if response.status_code == 200:
            api_users = response.json()['results']
            
            for api_user in api_users:
                # Format DOB as YYYY-MM-DD
                dob_date = datetime.strptime(api_user['dob']['date'], '%Y-%m-%dT%H:%M:%S.%fZ')
                formatted_dob = dob_date.strftime('%Y-%m-%d')
                try:
                    location = get_city_coordinates(api_user['location']['city'], api_user['location']['country'])
                except:
                    print(f"Error fetching coordinates for {api_user['location']['city']}, {api_user['location']['country']}")
                # Create user object with data from the API
                user = {
                    'firstname': api_user['name']['first'],
                    'lastname': api_user['name']['last'],
                    'username': api_user['login']['username'],
                    'email': api_user['email'],
                    'password': api_user['login']['password'],
                    'birthdate': formatted_dob,
                    # Store additional data for profile creation later
                    'gender': api_user['gender'],
                    'location': {
                        'latitude': location[0] or 14.5995,
                        'longitude': location[1] or 120.9842,
                        # 'longitude': location[1],
                        # 'latitude': float(api_user['location']['coordinates']['latitude']),
                        # 'longitude': float(api_user['location']['coordinates']['longitude']),
                        'country': api_user['location']['country'],
                        'city': api_user['location']['city']
                    },
                    'picture': api_user['picture']['large'],
                    'pictures': [random_picture(api_user['gender']) for _ in range(4)]
                }
                users.append(user)
                # print city country and latitude and longitude
                print(f"City: {user['location']['city']}, Country: {user['location']['country']}, Latitude: {user['location']['latitude']}, Longitude: {user['location']['longitude']}")
                print(f"VILLE ET CODEPOSTAL: {user['location']['city']}, CP: {api_user['location']['postcode']}")
        else:
            print(f"Error fetching from RandomUser API: {response.status_code}")
            # Fallback to generate basic mock users
            return _generate_fallback_users(num_users)
    except Exception as e:
        print(f"Exception when fetching from RandomUser API: {str(e)}")
        # Fallback to generate basic mock users
        return _generate_fallback_users(num_users)
    
    return users

def _generate_fallback_users(num_users):
    """Fallback method to generate users if API fails"""
    users = []
    for i in range(num_users):
        users.append({
            'firstname': f'User{i}',
            'lastname': f'Lastname{i}',
            'username': f'username{i}',
            'email': f'user{i}@gmail.com',
            'password': f'password{i}',
            'birthdate': '2000-01-01',
            'gender': random.choice(['male', 'female', 'other']),
            'location': {
                'latitude': random.uniform(-90, 90),
                'longitude': random.uniform(-180, 180),
                'country': 'United States',
                'city': random.choice(['New York', 'San Francisco', 'Chicago', 'Miami', 'Seattle'])
            },
        })
    return users

def signup_users(users):
    """Register users with the application"""
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
    """Sign in users and store their tokens"""
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
    """Create profiles for each user using their data"""
    for user in users:
        if 'token' not in user:
            print(f"Skipping profile update for {user['username']} - no token")
            continue
            
        # Create profile data using information from RandomUser API
        interests = ['coding', 'hiking', 'movies', 'music', 'reading', 'travel', 'photography', 
                    'cooking', 'sports', 'gaming', 'art', 'fashion', 'technology']
        
        profile = {
            'gender': user.get('gender', random.choice(["male", "female", "other"])),
            'sexualPreferences': random.sample(['men', 'women', 'other'], random.randint(1, 3)), 
            'biography': f"Hi, I'm {user.get('firstname')} from {user.get('location', {}).get('city', 'somewhere beautiful')}. I enjoy exploring new places and meeting interesting people.",
            'interests': random.sample(interests, random.randint(2, 5)),
            'authorizeLocation': 'true',
            'location': user.get('location', {
                'latitude': 14.5995,
                'longitude': 120.9842,
                'country': 'United States',
                'city': 'New York'
            }),
            'pictures': user.get('pictures', ["https://res.cloudinary.com/dch3nkbyj/image/upload/v1741483066/qxffjosexo4ratee4toq.jpg"]),
            'profilePicture': user.get('picture', "https://res.cloudinary.com/dch3nkbyj/image/upload/v1741483066/qxffjosexo4ratee4toq.jpg")
        }
        
        try:
            # Create form data with all the profile info
            form_data = {}
            
            # Add basic text fields
            form_data['gender'] = profile['gender']
            form_data['biography'] = profile['biography']
            form_data['authorizeLocation'] = profile['authorizeLocation']
            
            # Location needs to be passed as JSON
            form_data['location'] = json.dumps(profile['location'])
            
            # Pictures need to be passed as JSON
            form_data['pictures'] = json.dumps(profile['pictures'])
            form_data['profilePicture'] = profile['profilePicture']
            
            # Handle arrays in form data
            for pref in profile['sexualPreferences']:
                form_data.setdefault('sexualPreferences[]', []).append(pref)
                
            for interest in profile['interests']:
                form_data.setdefault('interests[]', []).append(interest)
            
            # Make the request
            res = requests.put(
                'http://localhost:3000/users/profile', 
                headers={'Authorization': 'Bearer ' + user['token']},
                data=form_data
            )
            
            print(f"Profile update for {user['username']}: Status {res.status_code}")
            if res.status_code >= 400:
                print(f"Profile update response: {res.text[:100]}...")
            else:
                print(f"Profile successfully updated for {user['username']}")
        except Exception as e:
            print(f"Error updating profile for {user['username']}: {str(e)}")

def mock_data():
    """Legacy function, kept for compatibility"""
    pass

def main():
    # Generate users with RandomUser API
    users = mock_users(10)
    # Register them with the application
    signup_users(users)
    # Sign them in to get tokens
    signin_users(users)
    # Create profiles for each user
    load_user_profiles(users)
 
if __name__ == '__main__':
    main()