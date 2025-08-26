import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getDatabase } from "firebase-admin/database"
import { ServiceAccount } from "firebase-admin"
import serviceAccount from "@/lib/serviceAccountKey.json"

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
    databaseURL: "https://uniroute-36e10-default-rtdb.europe-west1.firebasedatabase.app/" // <-- Must match your Firebase project
  });
}

export const db = getDatabase()