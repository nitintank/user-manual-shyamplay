import React, { useEffect, useState } from 'react';
import styles from "@/styles/MyList.module.css";
import Link from 'next/link';
import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyList = () => {
    const [depositPopup, setDepositPopup] = useState(false);
    const [withdrawPopup, setWithdrawPopup] = useState(false);
    const [sidebar, setSidebar] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState('');

    const [accountDetails, setAccountDetails] = useState([]);
    const [mycreateId, setMycreateId] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [bankDetails, setBankDetails] = useState(null);
    const [upiQRCode, setUpiQRCode] = useState(null);
    const [responseMessage, setResponseMessage] = useState(null);
    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [upiID, setUpiID] = useState('');
    const [paymentScreenshot, setPaymentScreenshot] = useState(null);
    const [qrcodeimage, setQrcodeImage] = useState('');
    const [upiRefNumber, setUpiRefNumber] = useState('');
    const [selectedUpiId, setSelectedUpiId] = useState('');
    const [adminUpiId, setAdminUpiId] = useState('');
    const [adminBankId, setAdminBankId] = useState('');
    const [selectedBank, setSelectedBank] = useState(null);
    const [WithdrawDetails, setWithdrawDetails] = useState(null)

    const toggleDepositPopup = (id) => {
        setSelectedId(id);
        setWithdrawPopup(false);
        setDepositPopup(!depositPopup);
    };

    const toggleWithdrawPopup = async (id) => {
        setSelectedId(id);
        setDepositPopup(false);
        setWithdrawPopup(!withdrawPopup);

        if (!withdrawPopup) {
            const userId = localStorage.getItem('userId');
            try {
                const response = await fetch(`https://manual.shyamplay.in/user/get-bank-upi-details`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();
                console.log('API Response:', data); // Log the response to inspect it

                // Set accountDetails with the extracted array
                if (data && Array.isArray(data.bank_upi_details)) {
                    setAccountDetails(data.bank_upi_details);
                } else {
                    console.error('Unexpected data format:', data);
                }

            } catch (error) {
                setResponseMessage(error.message);
                // toast.error(`Error: ${error.message}`);
            }
        }
    };

    const toggleSidebar = () => {
        setSidebar(!sidebar);
    };


    //   const handleAmountChange = (e) => setAmount(e.target.value);
    //   const handlePaymentMethodChange = (method) => setPaymentMethod(method);
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
                setBankDetails(data.bank_details);
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
                setUpiQRCode(data.upi_details);
            } catch (error) {
                setResponseMessage(error.message);
            }
        }
    };

    const handleAmountChange = (e) => {
        setAmount(e.target.value);
    };

    const handleDepositSubmit = async () => {
        const formData = new FormData();
        formData.append('payment_method', paymentMethod);
        formData.append('amount', amount);
        formData.append('upi_ref_number', upiRefNumber);
        formData.append('admin_bank_id', adminBankId);
        formData.append('admin_upi_id', adminUpiId);

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
            toast.success('Deposit Request Submited Successfully!');
            setDepositPopup(false);
        } catch (error) {
            setResponseMessage(error.message);
            toast.error(`Error: ${error.message}`);
        }
    };

    const handleWithdrawSubmit = async () => {
        const userId = localStorage.getItem('userId');
        const formData = new FormData();
        formData.append('payment_method', paymentMethod);
        formData.append('amount', amount);
        if (paymentMethod === 'upi') {
            formData.append('upi_id', upiID);
            formData.append('qr_code_image', qrcodeimage);
        } else if (paymentMethod === 'bank') {
            formData.append('account_name', accountName);
            formData.append('account_number', accountNumber);
            formData.append('ifsc_code', ifscCode);
        }

        const formData2 = new FormData();
        formData2.append('payment_method', paymentMethod);
        formData2.append('upi_id', upiID);
        formData2.append('qr_code_image', qrcodeimage);
        formData2.append('account_name', accountName);
        formData2.append('account_number', accountNumber);
        formData2.append('ifsc_code', ifscCode);

        try {
            // const response = await fetch(`https://manual.shyamplay.in/user/${selectedId}/withdraw`, {
            //     method: 'POST',
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            //     },
            //     body: formData,
            // });
            const [response, response2] = await Promise.all([
                fetch(`https://manual.shyamplay.in/user/${selectedId}/withdraw`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                    body: formData,
                }),
                fetch(`https://manual.shyamplay.in/user/save-bank-upi-details`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                    body: formData2,
                })
            ]);

            const data = await response.json();
            const data2 = await response2.json();
            console.log(data2)
            if (!response.ok) {
                const errorText = await response.text(); // Read the response body as text
                throw new Error(`Error: ${response.status} - ${errorText}`);
            }

            setResponseMessage(data.message);
            toast.success('Withdraw Request Submited Successfully!');
            setWithdrawPopup(false);
        } catch (error) {
            setResponseMessage(error.message);
            toast.error(`Error: ${error.message}`);
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
            toast.success('Password Update Request Submited');
        } catch (error) {
            setResponseMessage(error.message);
            toast.error(`Error: ${error.message}`);
        }
    };

    const handleUpiChange = (e) => {
        const selectedUpi = e.target.value;
        setSelectedUpiId(selectedUpi);
        const upiDetail = upiQRCode.find(upi => upi.upi_id === selectedUpi);
        if (upiDetail) {
            setAdminUpiId(upiDetail.id);
        }
    };

    const handleBankChange = (e) => {
        const selectedBankName = e.target.value;
        const bankDetail = bankDetails.find(bank => bank.bank_name === selectedBankName);
        if (bankDetail) {
            setSelectedBank(bankDetail);
            setAdminBankId(bankDetail.id);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied To Clipboard Successfully!');
    };
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <>
            <ToastContainer />
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
                    <input id="all" name="state-d" type="radio" defaultChecked />
                    <label htmlFor="all">My List</label>
                    <Link href="/">
                        <input id="approved" name="state-d" type="radio" />
                        <label htmlFor="approved" className={styles.wid_100}>Create ID</label>
                    </Link>
                </div>

                <div className={styles.id_created_big_box}>
                    {mycreateId.map(id => (
                        <div className={styles.id_created_box} key={id.credit_id}>
                            <div className={styles.id_created_upper_box}>
                                <p>{id.website_link} Id</p>
                                {/* <i className="fa-solid fa-ellipsis-vertical"></i> */}
                            </div>
                            <div className={styles.id_created_lower_box}>
                                <Image width={200} height={200} src={`https://manual.shyamplay.in/${id.logo}`} alt={`Image of ${id.logo}`} />
                                <div className={styles.id_content_box}>
                                    <Link href={`https://${id.website_link}`} target='_blank'>{id.website_link} <i className="fa-solid fa-arrow-up-right-from-square"></i></Link>
                                    {/* <p>Username: {id.name} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${id.name}`)}></i></p>
                                    <p>Password: {id.password} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${id.password}`)}></i></p> */}
                                    <p>
                                        Username: {id.username}
                                        <i className="fa-solid fa-copy" onClick={() => handleCopy(id.username)}></i>
                                    </p>
                                    <p>
                                        Password: {id.password}
                                        <i className="fa-solid fa-copy" onClick={() => handleCopy(id.password)}></i>
                                    </p>
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

                {depositPopup && <div className={styles.main_popup_box}>
                    <div className={styles.pop_up_box_section} id="deposit-popup">
                        <i className={`fa-regular fa-circle-xmark ${styles.popup_cross}`} onClick={toggleDepositPopup}></i>
                        <h3>Deposit Amount</h3>
                        <div className={styles.pop_up_box_form_1}>
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
                                <div className={styles.zradio_inputs}>
                                    {upiQRCode.map((upi, index) => (
                                        <label key={upi.id}>
                                            <input className={styles.zradio_input} type="radio" name="paymentDetail" value={upi.upi_id} onChange={handleUpiChange} />
                                            <span className={styles.zradio_tile}>
                                                <span className={styles.zradio_icon}>
                                                    <Image width={200} height={200} src="/images/upi.png" alt="UPI QR Code" />
                                                </span>
                                                <span className={styles.zradio_label}>UPI {index + 1}</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {selectedUpiId && (
                                    <>
                                        <Image width={200} height={200} src={`https://manual.shyamplay.in/${upiQRCode.find(upi => upi.upi_id === selectedUpiId).qr_code}`} alt="UPI QR Code" className={styles.qr_code_img} />
                                        <p className={styles.upi_para}>UPI Id = {selectedUpiId} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${selectedUpiId}`)}></i></p>
                                    </>
                                )}
                                <input type="text" placeholder="Enter UTR ID" id="upiRefNumber" value={upiRefNumber} onChange={(e) => setUpiRefNumber(e.target.value)} required />
                                <label htmlFor="">Payment Screenshot</label>
                                <input id="paymentScreenshot" type="file" onChange={(e) => setPaymentScreenshot(e.target.files[0])} />
                            </div>
                            )}
                            {paymentMethod === 'bank' && bankDetails && (
                                <div className={styles.bank_detail_box}>
                                    <div className={styles.zradio_inputs}>
                                        {bankDetails.map((bank, index) => (
                                            <label kkey={bank.id}>
                                                <input className={styles.zradio_input} type="radio" name="paymentDetail" value={bank.bank_name} onChange={handleBankChange} />
                                                <span className={styles.zradio_tile}>
                                                    <span className={styles.zradio_icon}>
                                                        <Image width={200} height={200} src="/images/bank.jpeg" alt="UPI QR Code" />
                                                    </span>
                                                    <span className={styles.zradio_label}>UPI {index + 1}</span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {selectedBank && (
                                        <>
                                            <p>Bank Name: {selectedBank.bank_name} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${selectedBank.bank_name}`)}></i></p>
                                            <p>Account Number: {selectedBank.bank_account_number} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${selectedBank.bank_account_number}`)}></i></p>
                                            <p>IFSC Code: {selectedBank.ifsc_code} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${selectedBank.ifsc_code}`)}></i></p>
                                            <p>Account Name: {selectedBank.account_name} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${selectedBank.account_name}`)}></i></p>
                                        </>
                                    )}
                                    <input type="text" placeholder="Enter Transaction ID" id="upiRefNumber" value={upiRefNumber}
                                        onChange={(e) => setUpiRefNumber(e.target.value)} required />
                                    <label htmlFor="">Payment Screenshot</label>
                                    <input id="paymentScreenshot" type="file" onChange={(e) => setPaymentScreenshot(e.target.files[0])} />
                                </div>
                            )}
                            <button type="submit" className={styles.create_id_btn} onClick={handleDepositSubmit}><i className="fa-solid fa-circle-check"></i> Deposit Now</button>
                        </div>
                    </div>
                </div>}

                {withdrawPopup && (
                    <div className={styles.main_popup_box}>
                        <div className={styles.pop_up_box_section} id="withdraw-popup">
                            <i className={`fa-regular fa-circle-xmark ${styles.popup_cross}`} onClick={toggleWithdrawPopup}></i>
                            <h3>Withdraw Amount</h3>
                            <div className={styles.pop_up_box_form_1}>
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

                                {Array.isArray(accountDetails) && accountDetails.length > 0 ? (
                                    <table className={styles.customers}>
                                        <thead>
                                            <tr>
                                                <th>Select</th>
                                                <th>UPI ID / Account No.</th>
                                                <th>Account Name</th>
                                                <th>IFSC Code</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {accountDetails.map((account, index) => (
                                                account.account_name && (
                                                    <tr key={index}>
                                                        <td>
                                                            <input
                                                                type="radio"
                                                                name="pay"
                                                                value={account.account_name}
                                                                checked={selectedAccount === account.account_name}
                                                                onChange={() => {
                                                                    setSelectedAccount(account.account_name);
                                                                    setAccountName(account.account_name);
                                                                    setAccountNumber(account.account_number);
                                                                    setIfscCode(account.ifsc);
                                                                }}
                                                            />
                                                        </td>
                                                        <td>{account.account_number}</td>
                                                        <td>{account.account_name}</td>
                                                        <td>{account.ifsc}</td>
                                                    </tr>
                                                )
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    ""
                                )}

                                {paymentMethod === 'upi' && (
                                    <div className={styles.upi_detail_box}>
                                        <input id="upiID" type="text" placeholder="Enter UPI ID" value={upiID} onChange={(e) => setUpiID(e.target.value)} required />
                                        <input id="qrcodeimage" type="text" placeholder="Enter UPI Name" value={qrcodeimage} onChange={(e) => setQrcodeImage(e.target.value)} required />
                                    </div>
                                )}

                                {paymentMethod === 'bank' && (
                                    <div className={styles.bank_detail_box}>
                                        <input type="text" id="accountName" placeholder="Enter Account Name" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
                                        <input type="text" id="accountNumber" placeholder="Enter Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                                        <input type="text" id="ifscCode" placeholder="Enter IFSC Code" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} />
                                    </div>
                                )}

                                <button type="submit" className={styles.create_id_btn} onClick={handleWithdrawSubmit}><i className="fa-solid fa-circle-check"></i> Withdraw Now</button>
                            </div>
                        </div>
                    </div>
                )}

            </section>
        </>
    )
}

export default MyList