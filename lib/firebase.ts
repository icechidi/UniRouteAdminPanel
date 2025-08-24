import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getDatabase } from "firebase-admin/database"
//import serviceAccount from "./serviceAccountKey.json"

const serviceAccount = require("./serviceAccountKey.json") // Download from Firebase Console

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://uniroute-36e10.firebaseio.com"
  })
}

export const db = getDatabase()