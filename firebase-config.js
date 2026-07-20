<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCJZGMo_t1Z7hhVfsOvxEKddK9bcQ3K5ZQ",
    authDomain: "teacherjournal-260a2.firebaseapp.com",
    databaseURL: "https://teacherjournal-260a2-default-rtdb.firebaseio.com",
    projectId: "teacherjournal-260a2",
    storageBucket: "teacherjournal-260a2.firebasestorage.app",
    messagingSenderId: "331768882798",
    appId: "1:331768882798:web:d3cede81bd6ab82194e87f",
    measurementId: "G-FNSP1JBC3B"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
