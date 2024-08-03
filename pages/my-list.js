import React, { useEffect, useState } from 'react';
import styles from "@/styles/MyList.module.css";
import Link from 'next/link';
import Image from 'next/image';

const MyList = () => {
    const [depositPopup, setDepositPopup] = useState(false);
    const [withdrawPopup, setWithdrawPopup] = useState(false);
    const [sidebar, setSidebar] = useState(false);
    const [mycreateId, setMycreateId] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showWithdrawModal, setWithdrawModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [bankDetails, setBankDetails] = useState(null);
    const [upiQRCode, setUpiQRCode] = useState(null);
    const [responseMessage, setResponseMessage] = useState(null);
    const [upiRefNumber, setUpiRefNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [upiID, setUpiID] = useState('');
    const [paymentScreenshot, setPaymentScreenshot] = useState(null);
    const [qrcodeimage, setQrcodeImage] = useState(null);

    const toggleDepositPopup = (id) => {
        setSelectedId(id);
        setWithdrawPopup(false);
        setDepositPopup(!depositPopup);
    };
    const toggleWithdrawPopup = (id) => {
        setSelectedId(id);
        setDepositPopup(false);
        setWithdrawPopup(!withdrawPopup);
    };
    const toggleSidebar = () => {
        setSidebar(!sidebar);
    };

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await fetch('https://manual.shyamplay.in/user/credit', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();
                setMycreateId(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
        handlePaymentMethodChange('upi');

        // Check local storage if user is logged in
        const loggedInStatus = localStorage.getItem('accessToken');
        if (loggedInStatus == null) {
            location.href = "/login"
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear()
        location.href = "/"
    };

    const handlePaymentMethodChange = async (method) => {
        setPaymentMethod(method);
        if (method === 'bank') {
            try {
                const response = await fetch(`https://manual.shyamplay.in/admin-bank-details`, {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();
                setBankDetails(data.bank_details[0]);
            } catch (error) {
                setResponseMessage(error.message);
            }
        } else if (method === 'upi') {
            try {
                const response = await fetch('https://manual.shyamplay.in/admin-upi-details', {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();
                setUpiQRCode(data.upi_details[0]);
            } catch (error) {
                setResponseMessage(error.message);
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setAmount('');
        setPaymentMethod('bank');
        setBankDetails(null);
        setUpiQRCode(null);
        setResponseMessage(null);
        setUpiRefNumber('');
        setPaymentScreenshot(null);
    };

    const handleWithdrawOpenModal = (id) => {
        setSelectedId(id);
        setWithdrawModal(true);
    };

    const handleWithdrawCloseModal = () => {
        setWithdrawModal(false);
        setAmount('');
        setPaymentMethod('bank');
        setBankDetails(null);
        setUpiQRCode(null);
        setResponseMessage(null);
    };

    const handleAmountChange = (e) => {
        setAmount(e.target.value);
    };

    const handleDepositSubmit = async () => {
        const formData = new FormData();
        formData.append('payment_method', paymentMethod);
        formData.append('amount', amount);
        formData.append('upi_ref_number', upiRefNumber);
        if (paymentScreenshot) {
            formData.append('payment_screenshort', paymentScreenshot);
        }
        if (paymentMethod === 'upi') {
            formData.append('upi_id', upiRefNumber);
        }

        try {
            const response = await fetch(`https://manual.shyamplay.in/user/${selectedId}/deposit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'An error occurred while processing the request.');
            }

            setResponseMessage(data.message);
            handleCloseModal();
        } catch (error) {
            setResponseMessage(error.message);
        }
    };

    const handleWithdrawSubmit = async () => {
        const formData = new FormData();
        formData.append('payment_method', paymentMethod);
        formData.append('amount', amount);
        if (paymentMethod === 'upi') {
            formData.append('upi_id', upiID);
            if (qrcodeimage) {
                formData.append('qr_code_image', qrcodeimage);
            }
        } else if (paymentMethod === 'bank') {
            formData.append('account_name', accountName);
            formData.append('account_number', accountNumber);
            formData.append('ifsc_code', ifscCode);
        }

        try {
            const response = await fetch(`https://manual.shyamplay.in/user/${selectedId}/withdraw`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'An error occurred while processing the request.');
            }

            setResponseMessage(data.message);
            handleWithdrawCloseModal();
        } catch (error) {
            setResponseMessage(error.message);
        }
    };

    const handlePasswordUpdateRequest = async (id) => {
        try {
            const response = await fetch(`https://manual.shyamplay.in/user/credit/${id}/request_password_update`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'An error occurred while processing the request.');
            }
            setResponseMessage(data.message);
        } catch (error) {
            setResponseMessage(error.message);
        }
    };

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
                    <Link href="/"><Image width={200} height={200} src="/images/logo.png" alt="" /></Link>
                </nav>

                <div className={`${styles.switch_toggle} ${styles.switch_3} ${styles.switch_candy}`}>
                    <input id="all" name="state-d" type="radio" checked />
                    <label for="all">My List</label>
                    <Link href="/">
                        <input id="approved" name="state-d" type="radio" />
                        <label for="approved" className={styles.wid_100}>Create ID</label>
                    </Link>
                </div>

                <div className={styles.id_created_big_box}>
                    {responseMessage && <p className={styles.responseMessage}><i className={`fa-regular fa-circle-xmark`} onClick={() => setResponseMessage('')}></i> {responseMessage}</p>}
                    {mycreateId.map(id => (
                        <div className={styles.id_created_box} key={id.credit_id}>
                            <div className={styles.id_created_upper_box}>
                                <p>{id.website_link} Id</p>
                                {/* <i className="fa-solid fa-ellipsis-vertical"></i> */}
                            </div>
                            <div className={styles.id_created_lower_box}>
                                <Image width={200} height={200} src={`https://manual.shyamplay.in/${id.logo}`} alt={`Image of ${id.logo}`} />
                                <div className={styles.id_content_box}>
                                    <Link href={`https://${id.website_link}`}>{id.website_link} <i className="fa-solid fa-arrow-up-right-from-square"></i></Link>
                                    <p>Username: {id.name} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${id.name}`)}></i></p>
                                    <p>Password: {id.password} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${id.password}`)}></i></p>
                                    <div className={styles.id_btn_box}>
                                        <button className={styles.id_btn_1} onClick={() => toggleDepositPopup(id.credit_id)}>Deposit</button>
                                        <button className={styles.id_btn_2} onClick={() => toggleWithdrawPopup(id.credit_id)}>Withdraw</button>
                                        <button className={styles.id_btn_3} onClick={() => handlePasswordUpdateRequest(id.credit_id)}>Change Password</button>
                                    </div>
                                </div>
                                <div className={styles.option_menu_box} id="myDIV">
                                    <p onClick={toggleDepositPopup}>Deposit</p>
                                    <hr />
                                    <p onClick={toggleWithdrawPopup}>Withdraw</p>
                                    <hr />
                                    <p>Change Password</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {depositPopup && <div className={styles.pop_up_box_section} id="deposit-popup">
                    <i className={`fa-regular fa-circle-xmark ${styles.popup_cross}`} onClick={toggleDepositPopup}></i>
                    <h3>Deposit Amount</h3>
                    {/* <div className={styles.pop_up_site_box}>
                        <Image width={200} height={200} src="/images/host-perfy-box.png" alt="" />
                        <h4>HostPerfy</h4>
                        <p>www.hostperfy.com</p>
                    </div> */}
                    <form className={styles.pop_up_box_form_1}>
                        <input type="text" placeholder="Enter Amount" value={amount} onChange={handleAmountChange} />
                        <div className={styles.radio_input}>
                            <label>
                                <input name="paymentMethod" value="upi" onChange={() => handlePaymentMethodChange('upi')} type="radio" defaultChecked={paymentMethod === 'upi'} />
                                <span>UPI</span>
                            </label>
                            <label>
                                <input name="paymentMethod" value="bank" onChange={() => handlePaymentMethodChange('bank')} type="radio" />
                                <span>Bank</span>
                            </label>
                            <span className={styles.selection}></span>
                        </div>
                        {paymentMethod === 'upi' && upiQRCode && (<div className={styles.upi_detail_box}>
                            <Image width={200} height={200} src={`https://manual.shyamplay.in/${upiQRCode.qr_code}`} alt="UPI QR Code" className={styles.qr_code_img} />
                            <p className={styles.upi_para}>UPI ID: {upiQRCode.upi_id} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${upiQRCode.upi_id}`)}></i></p>
                            <input type="text" placeholder="Enter UTR ID" id="upiRefNumber" value={upiRefNumber} onChange={(e) => setUpiRefNumber(e.target.value)} required />
                            <label for="">Payment Screenshot</label>
                            <input id="paymentScreenshot" type="file" onChange={(e) => setPaymentScreenshot(e.target.files[0])} />
                        </div>
                        )}
                        {paymentMethod === 'bank' && bankDetails && (
                            <div className={styles.bank_detail_box}>
                                <p>Bank Name: {bankDetails.bank_name} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${bankDetails.bank_name}`)}></i></p>
                                <p>Account Number: {bankDetails.bank_account_number} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${bankDetails.bank_account_number}`)}></i></p>
                                <p>IFSC Code: {bankDetails.ifsc_code} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${bankDetails.ifsc_code}`)}></i></p>
                                <p>Account Name: {bankDetails.account_name} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${bankDetails.account_name}`)}></i></p>
                                <input type="text" placeholder="Enter Transaction ID" id="upiRefNumber" value={upiRefNumber}
                                    onChange={(e) => setUpiRefNumber(e.target.value)} required />
                                <label for="">Payment Screenshot</label>
                                <input id="paymentScreenshot" type="file" onChange={(e) => setPaymentScreenshot(e.target.files[0])} />
                            </div>
                        )}
                        <button type="submit" className={styles.create_id_btn} onClick={handleDepositSubmit}><i className="fa-solid fa-circle-check"></i> Deposit Now</button>
                        {responseMessage && <p>{responseMessage}</p>}
                    </form>
                </div>}

                {withdrawPopup && <div className={styles.pop_up_box_section} id="withdraw-popup">
                    <i className={`fa-regular fa-circle-xmark ${styles.popup_cross}`} onClick={toggleWithdrawPopup}></i>
                    <h3>Withdraw Amount</h3>
                    {/* <div className={styles.pop_up_site_box}>
                        <Image width={200} height={200} src="/images/host-perfy-box.png" alt="" />
                        <h4>HostPerfy</h4>
                        <p>www.hostperfy.com</p>
                    </div> */}
                    <form className={styles.pop_up_box_form_1}>
                        <input type="text" placeholder="Enter Amount" value={amount} onChange={handleAmountChange} />
                        <div className={styles.radio_input}>
                            <label>
                                <input name="paymentMethod" value="upi" onChange={() => handlePaymentMethodChange('upi')} type="radio" defaultChecked={paymentMethod === 'upi'} />
                                <span>UPI</span>
                            </label>
                            <label>
                                <input name="paymentMethod" value="bank" onChange={() => handlePaymentMethodChange('bank')} type="radio" />
                                <span>Bank</span>
                            </label>
                            <span className={styles.selection}></span>
                        </div>
                        {paymentMethod === 'upi' && (
                            <div className={styles.upi_detail_box}>
                                <input id="upiID" type="text" placeholder="Enter UPI ID" value={upiID} onChange={(e) => setUpiID(e.target.value)} required />
                                <label for="">QR Code</label>
                                <input id="qrcodeimage" type="file" onChange={(e) => setQrcodeImage(e.target.files[0])} />
                            </div>
                        )}
                        {paymentMethod === 'bank' && (
                            <div className={styles.bank_detail_box}>
                                <input type="text" id="accountName" placeholder="Enter Account Name" value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)} required />
                                <input type="text" id="accountNumber" placeholder="Enter Account Number" value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)} required />
                                <input type="text" id="ifscCode" placeholder="Enter IFSC Code" value={ifscCode}
                                    onChange={(e) => setIfscCode(e.target.value)} required />
                            </div>
                        )}
                        <button type="submit" className={styles.create_id_btn} onClick={handleWithdrawSubmit}><i className="fa-solid fa-circle-check"></i> Withdraw Now</button>
                        {responseMessage && <p className={styles.responseMessage}>{responseMessage}</p>}
                    </form>
                </div>}
            </section>
        </>
    )
}

export default MyList