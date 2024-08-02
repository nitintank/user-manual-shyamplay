import React from 'react'
import { useState } from 'react'
import styles from "@/styles/ForgotPassword.module.css";
import Image from 'next/image';
import Link from 'next/link';

const ForgotPassword = () => {
    const [phone_number, setPhoneNumber] = useState('')
    const [otp, setOtp] = useState('')
    const [new_password, setNewPassword] = useState('')
    const [confirm_password, setConfirmPassword] = useState('')
    const [showpassword, setShowpassword] = useState('password')
    const [showpassword2, setShowpassword2] = useState('password')
    const [otpSent, setotpSent] = useState(false)
    const [invalidOTP, setInvalidOTP] = useState(false)
    const [changeComplete, setChangeComplete] = useState(false)
    const [notMatch, setNotMatch] = useState(false)

    const handleChange = (e) => {
        if (e.target.name == 'phone_number') {
            setPhoneNumber(e.target.value)
        }
        else if (e.target.name == 'otp') {
            setOtp(e.target.value)
        }
        else if (e.target.name == 'new_password') {
            setNewPassword(e.target.value)
        }
        else if (e.target.name == 'confirm_password') {
            setConfirmPassword(e.target.value)
        }
    }

    const sendOTP = async (e) => {
        if (phone_number.length == 13) {
            e.preventDefault()
            const data = { phone_number }
            let res = await fetch('https://manual.shyamplay.in/forgot-password', {
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
        }
        else {
            alert("Error Occured, Try Again!!")
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const data = { phone_number, otp, new_password, confirm_password }
        let res = await fetch('https://manual.shyamplay.in/reset-password', {
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
        else if (response.message == "Password reset successfully") {
            setChangeComplete(true)
        }
        else if (response.message == "Password and confirm password do not match") {
            setNotMatch(true)
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

    const showPassword2 = () => {
        if (showpassword2 == 'password') {
            setShowpassword2('text')
        }
        else {
            setShowpassword2('password')
        }
    }
    return (
        <>
            <section className={styles.main_box}>
                <div className={styles.wrapper}>
                    <form method='POST' onSubmit={handleSubmit} className={styles.login_form}>
                        <Image width={200} height={200} src="/images/logo.png" alt="" className={styles.logoImg} />
                        <div className={styles.input_field}>
                            <input type="text" name='phone_number' value={phone_number} onChange={handleChange} required />
                            <label>Enter Phone No.</label>
                            <button className={styles.sent_otp_btn} onClick={sendOTP}>Send OTP <i className="fa-solid fa-circle-arrow-right"></i></button>
                        </div>
                        {otpSent && <p className={styles.greenText}>OTP Sent To Your Number</p>}
                        <div className={styles.input_field}>
                            <input type="text" name='otp' value={otp} onChange={handleChange} required />
                            <label>Enter OTP</label>
                        </div>
                        {invalidOTP && <p className={styles.redText}>OTP Is Invalid</p>}
                        <div className={styles.input_field}>
                            <input type={showpassword} name='new_password' value={new_password} onChange={handleChange} required />
                            <label>Enter Password</label>
                            {showpassword == 'password' && <i class={`fa-solid fa-eye ${styles.ipassword}`} onClick={showPassword}></i>}
                            {showpassword == 'text' && <i class={`fa-solid fa-eye-slash ${styles.ipassword}`} onClick={showPassword}></i>}
                        </div>
                        <div className={styles.input_field}>
                            <input type={showpassword2} name='confirm_password' value={confirm_password} onChange={handleChange} required />
                            <label>Confirm Password</label>
                            {showpassword2 == 'password' && <i class={`fa-solid fa-eye ${styles.ipassword}`} onClick={showPassword2}></i>}
                            {showpassword2 == 'text' && <i class={`fa-solid fa-eye-slash ${styles.ipassword}`} onClick={showPassword2}></i>}
                        </div>
                        {notMatch && <p className={styles.redText}>Password & Confirm Password Is Not Same, Try Again</p>}
                        <button type="submit" className={styles.submit_btn}>Submit</button>
                        {changeComplete && <p className={styles.redText}>Done, Password Changed Successfully</p>}
                        <div className={styles.register}>
                            <p>Already have an account? <Link href="/login">Login</Link></p>
                        </div>
                    </form>
                </div>
            </section>
        </>
    )
}

export default ForgotPassword