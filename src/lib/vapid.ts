import webpush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BNr7SwQnF_mBUzqjM1WWPfw88d9vi1Pp3b-EVdKpLfr25e6ZH6fU4NPHBEelcTVa24pCpH4a3JykM58w3EVW5vI";
const privateKey = process.env.VAPID_PRIVATE_KEY || "w-CsCUt9g5W59TvXyEMEVUi7CvUZIEs2Cu1jkQe8PoQ";
const subject = process.env.VAPID_SUBJECT || "mailto:admin@abcdeduhub.com";

webpush.setVapidDetails(subject, publicKey, privateKey);

export { webpush, publicKey };
