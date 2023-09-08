//SDK
// import firebase from "firebase/app";
import { useCollectionData } from "react-firebase-hooks/firestore";

import {
  getFirestore,
  collection,
  query,
  orderBy,
  DocumentData,
  limit,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { useRef, useState } from "react";

// HOOKs
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

import { initializeApp } from "firebase/app";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
  apiKey: "AIzaSyDCyjuDlYkhpY2-z9AdEkcmrgrQW3g88Bo",
  authDomain: "firechat-d0f9d.firebaseapp.com",
  projectId: "firechat-d0f9d",
  storageBucket: "firechat-d0f9d.appspot.com",
  messagingSenderId: "1086021064150",
  appId: "1:1086021064150:web:6fc05b3d26096a89550077",
  measurementId: "G-WFQFW3C6TX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service

const auth = getAuth();

const App = () => {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>FireChat</h1>
        {user && <SignOut />}
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
};

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };
  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p>
        Do not violate the community guidelines or you will be banned for life!
      </p>
    </>
  );
}
function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

const firestore = getFirestore(app);

// const messagesRef = await getDocs(
//   query(collection(firestore, "messages"), orderBy("createdAt"))
// );
// // get realtime updates from our database
// const [messages] = useCollectionData(messagesRef);

const ChatRoom = () => {
  const dummy = useRef<HTMLSpanElement>(null);
  const messagesQuery = query(
    collection(firestore, "messages"),
    orderBy("createdAt"),
    limit(25)
  );
  const [messagesSnapshot] = useCollectionData(messagesQuery);
  const messages = messagesSnapshot?.map((doc) => {
    return { id: doc.id, ...doc };
  });
  // send message
  const [formValue, setFormValue] = useState("");
  const sendMessage = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const photoUrl = auth.currentUser?.photoURL;
    const uid = auth.currentUser?.uid;
    const id = Date.now();
    const createdAt = serverTimestamp();
    const text = formValue;
    setFormValue("");
    await addDoc(collection(firestore, "messages"), {
      text,
      photoUrl,
      uid,
      createdAt,
      id,
    });
  };

  return (
    <>
      <div className="ChatRoom">
        <div>
          {messages &&
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
          <span ref={dummy}></span>
        </div>
        <form onSubmit={sendMessage}>
          <input
            className="input"
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder="say something nice"
          />
          <button type="submit" disabled={!formValue}>
            Send
          </button>
        </form>
      </div>
    </>
  );
};

function ChatMessage(props: { message: DocumentData }) {
  const { text, uid, photoUrl } = props.message;
  const messageClass = uid === auth.currentUser?.uid ? "sent" : "received";
  return (
    <>
      <div className={`message ${messageClass}`}>
        <p>{text}</p>
        <img src={photoUrl} alt="" />
      </div>
    </>
  );
}

export default App;
