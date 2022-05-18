[![Demo Deployment](https://github.com/rzymek/firebase-auth-claims-admin/actions/workflows/node.js.yml/badge.svg)](https://github.com/rzymek/firebase-auth-claims-admin/actions/workflows/node.js.yml)

# Deployment

One line deployment. There's no need to copy over any configs or project keys. Jutro run:

    firebase deploy --project your-firebase-project-id

You need to have [firebase-tools](https://www.npmjs.com/package/firebase-tools) installed (`npm i -g firebase-tools`) and be logged in (`firebase login`). 
The project uses [Cloud Functions for Firebase](https://firebase.google.com/docs/functions), so your project (*your-firabase-project-id*) needs to be on the Blaze (pay-as-you-go). I'll be given a link to upgrade from `firebase deploy` if needed. 

Remember to setup your desired Sign-in methods (Email, Google, Facebook, etc) in [Firebase Console](https://console.firebase.google.com/u/2/). 
The project will detect enabled methods and will show correspoing buttons on the login page.

# Demo

Login using  
email `admin@rzymek.github.io` and  
password `demo admin` at  
https://auth-claims-admin-demo.web.app
