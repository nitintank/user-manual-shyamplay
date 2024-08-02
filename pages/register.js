import React from 'react'
import { useState } from 'react'
import styles from "@/styles/Register.module.css";
import Image from 'next/image';
import Link from 'next/link';

const Register = () => {
    const [username, setUserName] = useState('')
    const [phone_number, setPhoneNumber] = useState('')
    const [otp, setOTP] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const role = 'user'
    const [invalidOTP, setInvalidOTP] = useState(false)
    const [otpSent, setotpSent] = useState(false)
    const [userexist, setUserexist] = useState(false)
    const [showpassword, setShowpassword] = useState('password')

    const handleChange = (e) => {
        if (e.target.name == 'username') {
            setUserName(e.target.value)
        }
        else if (e.target.name == 'phone_number') {
            setPhoneNumber(e.target.value)
        }
        else if (e.target.name == 'otp') {
            setOTP(e.target.value)
        }
        else if (e.target.name == 'email') {
            setEmail(e.target.value)
        }
        else if (e.target.name == 'password') {
            setPassword(e.target.value)
        }
    }

    const sendOTP = async (e) => {
        if (phone_number.length == 13) {
            e.preventDefault()
            const data = { phone_number }
            let res = await fetch('https://manual.shyamplay.in/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            let response = await res.json()

            if (response.message == "OTP sent to your phone number") {
                setotpSent(true)
            }
            else if (response.error == "User with this phone number already exists") {
                setUserexist(true)
            }
        }
        else {
            alert("Error Occured, Try Again!!")
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const data = { phone_number, otp, email, username, password, role }
        let res = await fetch('https://manual.shyamplay.in/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        let response = await res.json()

        if (response.error == "Invalid OTP") {
            setInvalidOTP(true)
            setotpSent(false)
        }
        else if (response.message == "User registered and OTP verified successfully") {
            location.href = "/user-panel/dashboard"
        }
    }

    const showPassword = () => {
        if (showpassword == 'password') {
            setShowpassword('text')
        }
        else {
            setShowpassword('password')
        }
    }

    return (
        <>
            <section className={styles.main_box}>
                <div className={styles.wrapper}>
                    <form method='POST' onSubmit={handleSubmit} className={styles.login_form}>
                        <Image width={200} height={200} src="/images/logo.png" alt="" className={styles.logo_img} />
                        <div className={styles.input_field}>
                            <input type="text" name='username' value={username} onChange={handleChange} required />
                            <label>Enter Name</label>
                        </div>
                        <div className={styles.input_field}>
                            <input type="text" name='phone_number' value={phone_number} onChange={handleChange} required />
                            <label>Enter Phone No.</label>
                            <button className={styles.sent_otp_btn} onClick={sendOTP}>Send OTP <i className="fa-solid fa-circle-arrow-right"></i></button>
                        </div>
                        {otpSent && <p className={styles.greenText}>OTP Sent To Your Number</p>}
                        {userexist && <p className={styles.redText}>User Already Exists, Try To Login</p>}
                        <div className={styles.input_field}>
                            <input type="text" name='otp' value={otp} onChange={handleChange} required />
                            <label>Enter OTP</label>
                        </div>
                        {invalidOTP && <p className={styles.redText}>OTP Is Invalid</p>}
                        <div className={styles.input_field}>
                            <input type="text" name='email' value={email} onChange={handleChange} required />
                            <label>Enter Email</label>
                        </div>
                        <div className={styles.input_field}>
                            <input type={showpassword} name='password' value={password} onChange={handleChange} required />
                            <label>Enter Password</label>
                            {showpassword == 'password' && <i class={`fa-solid fa-eye ${styles.ipassword}`} onClick={showPassword}></i>}
                            {showpassword == 'text' && <i class={`fa-solid fa-eye-slash ${styles.ipassword}`} onClick={showPassword}></i>}
                        </div>
                        <button type="submit" className={styles.submit_btn}>Create Account</button>

                        <div className={styles.register}>
                            <p>Already have an account? <Link href="/login">Login</Link></p>
                        </div>
                    </form>
                </div>
            </section>
        </>
    )
}

export default Register