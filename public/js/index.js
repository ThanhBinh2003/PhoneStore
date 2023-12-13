console.log("Hello from PhoneStore")
// upload image
const firebaseConfig = {
    apiKey: "AIzaSyBeoisetFX0ErLdpHElPnOUQWt5Pw4JqOk",
    authDomain: "phone-c4bc5.firebaseapp.com",
    projectId: "phone-c4bc5",
    storageBucket: "phone-c4bc5.appspot.com",
    messagingSenderId: "721291558303",
    appId: "1:721291558303:web:bcffa59a6060fd564f11aa",
}
firebase.initializeApp(firebaseConfig);
const uploadImage = async (file) => {
    const ref = firebase.storage().ref();
    const name = +new Date() + "-" + file.name;
    const metadata = {
        contentType: file.type
    };

    try {
        const snapshot = await ref.child('avatar').child(name).put(file, metadata);
        const url = await snapshot.ref.getDownloadURL();
        return url;
    } catch (error) {
        console.error(error);
        throw error;
    }
}