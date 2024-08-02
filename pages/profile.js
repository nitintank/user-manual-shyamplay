import React, { useEffect, useState } from 'react';
import styles from "@/styles/Profile.module.css";
import Image from 'next/image';
import Link from 'next/link';

const Profile = () => {
  const [sidebar, setSidebar] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [successMessage2, setSuccessMessage2] = useState('');

  const toggleSidebar = () => {
    setSidebar(!sidebar);
  };

  const handleLogout = () => {
    localStorage.clear()
    location.href = "/"
};

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('https://manual.shyamplay.in/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setProfile(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);


  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch('https://manual.shyamplay.in/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }
      const profileData = await response.json();
      setUsername(profileData.username);
      setEmail(profileData.email);
      setPhoneNumber(profileData.phone_number);
    } catch (error) {
      console.error('Error fetching profile data:', error.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('https://manual.shyamplay.in/edit-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          username,
          email,
          phone_number
        })
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      const responseData = await response.json();
      console.log('Profile updated successfully:', responseData);
      setSuccessMessage2(responseData.message);
      // Optionally, show success message or redirect to another page
    } catch (error) {
      console.error('Error updating profile:', error.message);
      // Handle error as needed (show error message to user, retry logic, etc.)
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password must match');
      return;
    }

    try {
      const response = await fetch('https://manual.shyamplay.in/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to change password');
      } else {
        setSuccessMessage(data.message);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setError('Failed to change password');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <section className={styles.main_box}>
        {sidebar && <div className={styles.sidebar}>
          <Link href="/profile" className={styles.profile_box}>
            <p><i className="fa-solid fa-circle-user"></i> Mobile No.</p>
            <p>Profile</p>
          </Link>
          <div className={styles.apps_big_box}>
            <Link href="/transaction" className={styles.apps_box}>
              <i className="fa-solid fa-money-bill-wave"></i>
              <p>A/C Statement</p>
            </Link>
          </div>
          <button className={styles.log_out_btn} onClick={handleLogout}><i className="fa-solid fa-arrow-right-from-bracket"></i> Log Out</button>
          <i className={`fa-regular fa-circle-xmark ${styles.sidebar_cross_btn}`} onClick={toggleSidebar}></i>
        </div>}

        <nav className={styles.navbar}>
          <i className="fa-solid fa-bars" onClick={toggleSidebar}></i>
          <Image width={200} height={200} src="/images/logo.png" alt="" />
        </nav>

        <div className={styles.all_new_id_big_box}>
          <div className={styles.top_filterBox}>
            <h3>Profile</h3>
          </div>
          <div className={styles.all_new_id_box}>
            <div className={styles.new_id_box}>
              <form onSubmit={handleSubmit} className={styles.form_box}>
                <label htmlFor="">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                <label htmlFor="">Email ID</label>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
                <label htmlFor="">Phone No. (Cannot Be Changed)</label>
                <input type="text" value={phone_number} onChange={(e) => setPhoneNumber(e.target.value)} readOnly/>
                <input type="submit" value="Submit" />
              </form>
            </div>
              {successMessage2 && <p className={styles.success}>{successMessage2}</p>}
          </div>
        </div>

        <div className={styles.all_new_id_big_box}>
          <div className={styles.top_filterBox}>
            <h3>Change Password</h3>
          </div>
          <div className={styles.all_new_id_box}>
            <div className={styles.new_id_box}>
              <form onSubmit={handleChangePasswordSubmit} className={styles.form_box}>
                <label htmlFor="">Old Password</label>
                <input type="text" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter Old Password" />
                <label htmlFor="">New Password</label>
                <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter New Password" />
                <label htmlFor="">Confirm Password</label>
                <input type="text" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Enter Confirm Password"/>
                <input type="submit" value="Submit" />
              </form>
            </div>
          {error && <p className={styles.error}>{error}</p>}
          {successMessage && <p className={styles.success}>{successMessage}</p>}
          </div>
        </div>

      </section>
    </>
  )
}

export default Profile