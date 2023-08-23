# Seek

I highly recommend viewing the project details here: https://devpost.com/software/seek-ju5cw8   
Note: The below installation instructions likely will not work as we do not have the necessary resources to keep the servers up at the moment.

An APK for this app is available, but if there are issues or you wish to run the app on iOS, follow the instructions below. Keep in mind the version below will not have location features, but will still have the ability to recieve notifications.

#### [Link to APK](https://expo.dev/accounts/teamseek/projects/Seek/builds/be549367-7ecf-43b1-aa60-be54feea450e)

When installing the APK, you may get a warning about the app being from an unknown source. This is because we are not a verified developer on the Google Play Store. You can safely ignore this warning and install the app.

Make sure to accept all permissions, including always allowing location access.

For the purposes of your demonstration, we were not sure if you all were in person for the purposes of judging and could accurately test our application since it is reliant on geolocation data. Therefore, we have currently disabled uploading geolocation to the backend so that you can test the interaction flow, as we have manually inputted the locations for two accounts so that you can test with those accounts (as in, they are automatically close enough for the interaction to run). We have a video of geolocation working in realtime in the devpost, please look at that video for the purpose of that feature.

To see this feature, in a sense, please look at the locationTracking function and the TaskManager in App.js - that is the code we use for location tracking. We apologize for the inconvenience, we just were not sure if you all were in person or not so did this to be safe.

## Requirements

### Computer

- NodeJS (preferably LTS)
- npm (latest)
- VSCode or preferred IDE/Editor

### Phone

- Expo Go from App Store/Play Store
- An internet connection on the same network as your computer

### Instructions

1. Clone this repository
2. Run `npm install` in the terminal
3. Run `npx expo start` in the terminal
4. Open the Expo Go app on your phone and scan the QR code that pops up.
5. Accept all permissions, including always allowing location access.
6. Use the accounts below to log in and test the app with posts made already, or create your own account. Creating your own account just means using your own personal number, that way we create a new user rather than logging you into an existing one.
7. In order to run an interaction, have two phones on test accounts 1 and 2, and then run runInt.js (`node runInt.js`) in the backend folder. In the final production of the app, all of this is done automatically, but we simply could not host the server to do that over the last few days due to costs associated with Lambda. Refresh both apps and an interaction should show.

Feel free to upload your own profile pictures or run your own quests!

#### Test Accounts

##### Make sure to enter the name and number exactly as shown below

- Name: `Test1` Number: `1234567890`
- Name: `Test2` Number: `0987654321`
- Name: `Test3` Number: `1111111111`
- Name: `Test4` Number: `2222222222`
- Name: `Test5` Number: `3333333333`

Verification Code for all accounts for testing is `11111`. We have text messages working, but we could not afford to pay for the API to send test messages to numbers tha are not verified already since we are utilizing the trial version. See the devpost for images of this working.

#### Current Known Bugs

- Notifications for Quests is inconsistent on the APK build, but always works in Expo Go
- Small UI bugs cross-platform and screen sizes on some screens
- App restart is required when a Quest is activated
- Network lag can cause delayed database updates, in some cases might require restart.
- The suggested page is inconsistent in showing contacts.
- The app may crash when the "I found x!" button is pressed, simply open the app again and it should work.
- Geolocation does not work accurately on iOS, but should work on Android for the most part
