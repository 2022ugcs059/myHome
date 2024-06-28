import React from 'react';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase.js';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

export default function OAuth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleGoogleClick = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const auth = getAuth(app);

            const result = await signInWithPopup(auth, provider);

            // Example of fetching additional user data from your API
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: result.user.displayName,
                    email: result.user.email,
                    photo: result.user.photoURL
                }),
            });
        
            const data = await res.json();
            dispatch(signInSuccess(data));
            navigate('/');
        } catch (error) {
            console.log('Error signing in with Google:', error);
        }
    }

    return (
        <button onClick={handleGoogleClick} type='button' className='bg-amber-400 hover:opacity-85 text-white rounded-xl p-3 w-full uppercase'>
            Continue with Google
        </button>
    );
}
