import React from 'react'
import styles from "@/styles/Login.module.css";
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react'

const Login = () => {
    const [phone_number, setphone_number] = useState('')
    const [password, setPassword] = useState('')
    const [invalidLogin, setInvalidLogin] = useState(false)
    const [showpassword, setShowpassword] = useState('password')

    const handleChange = (e) => {
        if (e.target.name == 'phone_number') {
            setphone_number(e.target.value)
        }
        else if (e.target.name == 'password') {
            setPassword(e.target.value)
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        const data = { phone_number, password }
        let res = await fetch('https://manual.shyamplay.in/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        let response = await res.json()

        if (response.error == "User not found or invalid credentials") {
            setInvalidLogin(true)
        }
        else if (response.role == "user") {
            localStorage.setItem('email', response.email);
            localStorage.setItem('accessToken', response.access_token);
            localStorage.setItem('username', response.username);
            localStorage.setItem('userId', response.id);  
            location.href = "/"
        }
    }

    return (
        <>
            <section className={styles.main_box}>
                <div className={styles.wrapper}>
                    <form method='POST' onSubmit={handleSubmit} className={styles.login_form}>
                        <Image width={200} height={200} src="/images/logo.png" alt="" className={styles.logo_img} />
                        <div className={styles.input_field}>
                            <input type="text" name='phone_number' value={phone_number} onChange={handleChange} required />
                            <label>Enter Your Phone No.</label>
                        </div>
                        <div className={styles.input_field}>
                            <input type={showpassword} name='password' value={password} onChange={handleChange} required />
                            <label>Enter Your Password</label>
                            {showpassword == 'password' && <i class="fa-solid fa-eye" onClick={showPassword}></i>}
                            {showpassword == 'text' && <i class="fa-solid fa-eye-slash" onClick={showPassword}></i>}
                        </div>
                        {invalidLogin && <p className={styles.redText}>Invalid Credentials, Try Again</p>}
                        <button type="submit" className={styles.submit_btn}>Log In</button>
                        <div className={styles.forget}>
                            <Link href="/forgot-password">Forgot password?</Link>
                        </div>
                        <div className={styles.register}>
                            <p>{`Don't have an account?`} <Link href="/register">Register</Link></p>
                        </div>
                    </form>
                </div>
            </section>
        </>
    )
}

export default Login