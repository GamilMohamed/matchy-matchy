# Security
The subject insisted on that point: the website must be secured.
Check at least the following points:
- Password are encripted in the database.
- Forms and uploads have correct validations.
- SQL injection isn't possible.

If at least one fails, the defense stops.
- [ ] Yes
- [ ] No

# Installation and seeding
Re-do the whole installation of every package with the evaluee.
You must also fill the database with the script he wrote.
Make sure that the database at least contains 500 different profiles.

If any of these crash, mark the project as crashed and finish the evaluation.
- [ ] Yes
- [ ] No

# Features
During the defense, keep the web console open at all times. If at least one error, notice, or warning appears, select "Crash" at the very bottom of the checklist. An error code from 500 to 599 returned by the server is also considered to be a Crash.

## Simple start
Launch the webserver containing the website.
No errors must be visible.
If this is not the case, the question is false and the evaluation stops.
The application must run as is when you start the webserver.
- [ ] Yes
- [ ] No

## User account management
The app must allow a user to register asking at least an
email address, a username, a last name, a first name and
a password that is somehow protected. (An english common
word shouldn't be accepted for example.)

A connected user must be able to fill an extended profile,
and must be able to update his information as well as the
one given during registration, at any time.

When you subscribe, you are emailed a clickable link.
If you haven't clicked the link, the account must not be usable.
- [ ] Yes
- [ ] No

## User connexion
The user must then be able to connect with his username
and password. He must be able to receive an email
allowing him to re-initialize his password should
the first one be forgotten.

To disconnect must be possible from any page on the site
with one click.
- [ ] Yes
- [ ] No

## Extended profile
The user must be able to fill in the following:
- His sex 
- His sexual orientation
- Short bio
- Interests list (with hashtags \#bio, \#NoMakeup...)
- Images, up to 5, including a profile picture

If the seed is correctly implemented,
you can make tag propositions in any form you want
(autocomplete, top-trending)

Once his profile is complete, he can access the website.
These informations can be changed at any time, once connected.

If one of the points fails, this question is false
- [ ] Yes
- [ ] No

## Consultations
The user must be able to check out the people that looked at his
profile (there mush be an history of visits) as well as the people
that "liked" him.
- [ ] Yes
- [ ] No

## Fame rating
Each user must have a public fame rating. Ask the student to explain
his stategy regarding the computing of that score, it must be consistent
and a minimum relevant.
- [ ] Yes
- [ ] No

## Geolocalisation
The user must be located using GPS positionning, up to his
neighborhood. If the user does not want to be positionned,
a way must found to locate him even without his knowledge.

The user must be able to modify his GPS position in his
profile.
- [ ] Yes
- [ ] No

## Profile suggestion
The user must be able to easily get a list of suggestions when
connecting that match his profile.

Suggested profiles must be consistant with sexuality. If the
sexual orientation isn't specified, the user will be considered
bi-sexual.

Check with the student that profile suggestions are weighted on
three criterias:
- Same geographic area as the user.
- With a maximum of common tags.
- With a maximum fame rating.

Ask the student to explain his strategy to display a list of
relevant suggestions.
- [ ] Yes
- [ ] No

## Research
The user must be able to run an advanced research selecting
one or a few criterias such as:
- A age gap.
- A fame rating gap.
- A location.
- One or multiple interests tags.
- [ ] Yes
- [ ] No

## Sort and filters
The suggestion list as well as the resulting list of a search must be
sortable and filterable by:
- Age.
- Location.
- Fame rating.
- Tags.
- [ ] Yes
- [ ] No

## Profile of other users
A user must be able to consult the profile of other users,
that must contain all the information available about them,
except for the email address and the password.

The profile must show the fame rating and if the user is
connected and if not see the last connection date and time.
- [ ] Yes
- [ ] No

## Connexion between users
A user can like or unlike the profile of another user. When two people
like each other, we will say that they are connected and can be able to
chat.

A user that doesn't have a profile picture can't like another user.

The profile of other users must clearly display if they're connected
with the current user or if they like the current user.
- [ ] Yes
- [ ] No

## Report et bloking
It's possible to report a profile as "fake account" and block a specific
user. A blocked user won't appear anymore in the research results (or in
suggestions) and won't generate additional notifications.
- [ ] Yes
- [ ] No

## Chat
When two users are connected, they must be able to chat in real time.
(We'll tolerate a 10 secondes delay).

The user must be able to see from any page if a new message is received.
- [ ] Yes
- [ ] No

## Notifications
A user must be notified in real time (We'll also tolerate a
10 secondes delay) of the following events:
- The user received a "like".
- The user received a visit.
- The user received a message.
- A "liked" user "liked" back.
- A connected user "unliked" the current user.

A user must be able to see, from any page that a notification
hasn't been read.
- [ ] Yes
- [ ] No

# Best practices

## Compatibility
Is the website compatible with Firefox (>= 41) and Chrome (>= 46)?
Features described above work correctly with no warnings, errors, or weird logs?
- [ ] Yes
- [ ] No

## Mobile
Is the website usable on a mobile and on very small resolution?
Is the site layout correctly displayed?
- [ ] Yes
- [ ] No

## Security
XSS / CSRF / TGIF / WYSIWYG / TMTC / TMNT...
The subject insisted on that point: the website must be secured.
Check at least the following points:
- Passwords are encrypted in the database.
- Forms and uploads have correct validations. Scripts can not be injected.
- SQL injection isn't possible. (try to login with`blabla' OR 1='1` as a password)

If at least one fails, the defense stops.
