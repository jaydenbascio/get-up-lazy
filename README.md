# Get Up Lazy

An Android alarm clock that gets you out of bed. When the alarm goes off, you are forced to solve mental math problems, and complete a list of activities you decide. All the while, the application is tracking how long it takes you to finish your morning routine, allowing you to see your progress over a period of time.

## Your New Morning Routine

1. **The alarm rings**: You wake up to a custom sound configured per alarm
2. **You wake up**: You press "Next" to silence the alarm.
3. **Factor quadratics**: With mental math, you find the zeros of several quadratics before a timer runs out
4. **Scan QR codes** (optional): You navigate around your house, completing activities in order, each marked with a QR code (e.g. wash face, get green tea, etc..)
5. **Congratulations!**: You get a confetti page and your metrics are stored to the **Graphs** tab for you to view in the future

Run out of time or answer wrong, and the alarm starts ringing again until you get it right. Be quick, or else you'll wake your neighbors!

## Built with

React Native and Expo, TypeScript, React Native Paper, React Navigation, and SQLite
(`expo-sqlite`). Alarms use `react-native-notify-kit` for exact-time notifications, `expo-audio`
for sound and `expo-camera` for scanning.
