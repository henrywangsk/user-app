import React, {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import {useDropzone} from 'react-dropzone';
import './App.css';

const userServiceRootURI = process.env.REACT_APP_USER_SERVICE_ROOT_URI;

const UserProfiles = () => {
  const [userProfiles, setUserProfiles] = useState([]);
  const fetchUserProfiles = () => {
    axios.get(`${userServiceRootURI}/profiles`)
      .then(res => {
        console.log(res);
        setUserProfiles(res.data);
      })
      .catch(e => console.log(e));
  }

  useEffect(() => {
    fetchUserProfiles();
  }, []);

  return userProfiles.map(userProfile => <UserProfile key={userProfile.id} {...userProfile}/>);
}

function UserProfile({ id, name, imageLink}) {
  const [profileImageLink, setProfileImageLink] = useState([imageLink]);

  return (
    <div className="profile">
      { id && <img className='profile-img' src={`${userServiceRootURI}/profiles/${id}/image/${profileImageLink}`} alt={id}/> }
      <h3>{name}</h3>
      <p>{id}</p>
      <Dropzone userId={id} onProfieImageUpdated={setProfileImageLink} />
    </div>
  );
}

function Dropzone({ userId, onProfieImageUpdated }) {
  const maxSize = 1024 * 1024; // 1M
  const [dropError, setDropError] = useState([]);

  const onDropAccepted = useCallback(acceptedFiles => {
    setDropError(null);

    console.log('accepted files: ', acceptedFiles);

    const imageFile = acceptedFiles[0];
    console.log(imageFile);

    const formData = new FormData();
    formData.append("file", imageFile);

    axios.post(
      `${userServiceRootURI}/profiles/${userId}/image/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    ).then(res => {
      console.log(res.data);
      console.log('file uploaded successfully.');
      onProfieImageUpdated(res.data);
    }).catch(err => {
      console.log(err);
    })
  }, [userId, onProfieImageUpdated]);

  const onDropRejected = useCallback(rejections => {
    console.log('rejected files: ', rejections);
    const { code, message } = rejections[0]?.errors[0];
    setDropError('file-too-large' === code ? 'The image file is too large (maximum size 10MB).' : message);
  }, []);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDropAccepted,
    onDropRejected,
    accept: 'image/*',
    multiple: false,
    maxSize
  });

  return (
    <div {...getRootProps()} className="drop-zone">
      <input {...getInputProps()} />
      <p className="drop-error">{dropError}</p>
      {
        isDragActive ?
          <p>Drop the image here ...</p> :
          <p>Drag 'n' drop profile image here, or click to select one</p>
      }
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <h1>User List</h1>
      <UserProfiles />
    </div>
  );
}

export default App;
