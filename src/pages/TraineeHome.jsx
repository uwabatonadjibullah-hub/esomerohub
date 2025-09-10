import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import HomeLayout from '../components/HomeLayout';
import ProfileModal from '../components/ProfileModal';
import TBG1 from '../assets/TBG1.jpg';
import TBG2 from '../assets/TBG2.jpeg';
import TBG3 from '../assets/TBG3.jpg';

const backgrounds = [TBG1, TBG2, TBG3];
const quotes = [
  "Every module is a milestone.",
  "Quizzes sharpen your brilliance.",
  "Learning today, leading tomorrow."
];

const TraineeHome = () => {
  const [bgIndex, setBgIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [userInfo, setUserInfo] = useState({});
  const [average, setAverage] = useState(0);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const bgTimer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 6000);

    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 7000);

    return () => {
      clearInterval(bgTimer);
      clearInterval(quoteTimer);
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setFirstName(data.firstName || '');
          setUserInfo({ ...data, email: user.email });

          const quizSnap = await getDocs(collection(db, 'quizzes'));
          const allQuizzes = quizSnap.docs.map(doc => doc.data());

          let total = 0;
          let count = 0;

          allQuizzes.forEach(q => {
            q.scores?.forEach(s => {
              if (s.studentId === user.uid) {
                total += s.score;
                count += 1;
              }
            });
          });

          setAverage(count ? Math.round(total / count) : 0);
        }
      }
    };

    fetchUser();
  }, []);

  const buttons = [
    'Dashboard',
    'Modules',
    'Upcoming Quizzes',
    'Announcements'
  ];

  return (
    <div>
      <HomeLayout
        title={`Welcome ${firstName}, This is Esomero Hub`}
        buttons={buttons}
        background={backgrounds[bgIndex]}
        quote={quotes[quoteIndex]}
        onProfileClick={() => setShowProfile(true)} // ✅ Added
      />

      {showProfile && (
        <ProfileModal
          user={userInfo}
          average={average}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
};

export default TraineeHome;