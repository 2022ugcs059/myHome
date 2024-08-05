import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { deleteUserFailure, deleteUserStart, deleteUserSuccess, signOutUserStart, updateUserStart, updateUserSuccess, updatedUserFailure } from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import {Link} from 'react-router-dom'

export default function Profile() {
  const { currentUser, loading, error } = useSelector(state => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const dispatch = useDispatch();
  const [showListingError, setShowListingError] = useState(false);
  const [userListings, setUserListings] = useState([]);

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };
  const handleChange = (e) => {
    setFormData({...formData,[e.target.id]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`https://myhome-yjwx.onrender.com/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if(data.success === false){
        dispatch(updatedUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updatedUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`https://myhome-yjwx.onrender.com/api/user/delete/${currentUser._id}`,{
        method: 'DELETE',
      });
      const data = await res.json();
      if(data.success === false){
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('https://myhome-yjwx.onrender.com/api/auth/signout');
      const data = await res.json();
      if(data.success === false){
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data.message));
    } catch (error) {
      dispatch(deleteUserFailure(data.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingError(false);
      const res = await fetch(`https://myhome-yjwx.onrender.com/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false){
        setShowListingError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingError(true);
    }
  }

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`https://myhome-yjwx.onrender.com/api/listing/delete/${listingId}`,
        { method : 'DELETE' }
      );

      const data = res.json();
      if(data.success === false){
        console.log(data.message);
        return;
      }
      setUserListings((prev) => prev.filter((listing) => listing._id != listingId));

    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className='mx-auto p-3 max-w-lg'>
      <h1 className='text-3xl font-semibold text-center my-7'> Profile </h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          alt='profile'
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
        />
        <p className='text-sm self-center'>
          {fileUploadError ? (
            <span className='text-red-700'>
              Error Image upload (image must be less than 2 mb)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className='text-green-700'>Image successfully uploaded!</span>
          ) : (
            ''
          )}
        </p>
        <input onChange={handleChange} defaultValue={currentUser.username} type='text' placeholder='username' className='border p-3 rounded-xl' id='username' />
        <input onChange={handleChange} defaultValue={currentUser.email} type='email' placeholder='email' className='border p-3 rounded-xl' id='email' />
        <input type='password' placeholder='password' className='border p-3 rounded-xl' id='password' />
        <button disabled={loading} className='rounded-xl bg-slate-700 text-white p-3 uppercase hover:opacity-95 disabled:opacity-80'>
          {loading? 'Loading...' : 'Update'}
        </button>
        <Link className='bg-green-600 text-white p-3 rounded-xl uppercase text-center hover:opacity-95' to='/create-listing'>Create Listing</Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span onClick={handleDeleteUser} className='text-red-600 cursor-pointer'>Delete account</span>
        <span onClick={handleSignOut} className='text-red-600 cursor-pointer'>Sign Out</span>
      </div>
      <p className='text-red-600 mt-5'>{error? error :''}</p>
      <p className='text-green-600 mt-5'>{updateSuccess? 'User is updated successfully!' : ''}</p>
      <button onClick={handleShowListings} className='text-green-600 w-full'>Show Listings</button>
      <p className='text-red-600 mt-5'> {showListingError ? 'Error Showing Listings' : ''} </p>
      {userListings &&
        userListings.length > 0 &&
        <div className="flex flex-col gap-4">
          <h1 className='text-center mt-7 text-2xl font-semibold'>Your Listings</h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className='border rounded-lg p-3 flex justify-between items-center gap-4'
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt='listing cover'
                  className='h-16 w-16 object-contain'
                />
              </Link>
              <Link
                className='text-slate-700 font-semibold  hover:underline truncate flex-1'
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>

              <div className='flex flex-col item-center'>
                <button onClick={() => handleListingDelete(listing._id)} className='text-red-600 uppercase'>Delete</button>
                <Link to={`/update-listing/${listing._id}`}>
                <button className='text-green-600 uppercase'>Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
}
