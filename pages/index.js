import styles from "@/styles/Home.module.css";
import React, { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [sidebar, setSidebar] = useState(false);
  const [createIdPopup, setCreateIdPopup] = useState(false);
  const [demoLoginPopup, setDemoLoginPopup] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [demoCompany, setDemoCompany] = useState(null);
  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [bankDetails, setBankDetails] = useState(null);
  const [upiQRCode, setUpiQRCode] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [upiRefNumber, setUpiRefNumber] = useState('');

  const toggleSidebar = () => {
    setSidebar(!sidebar);
  };
  const toggleCreateIdPopup = (company) => {
    setSelectedCompany(company);
    setDemoLoginPopup(false);
    setCreateIdPopup(!createIdPopup);
  };

  const toggleDemoLoginPopup = (company) => {
    setDemoCompany(company);
    setCreateIdPopup(false);
    setDemoLoginPopup(!demoLoginPopup);
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('https://manual.shyamplay.in/companies', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setCompanies(data);
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');

    if (!userId || !selectedCompany) {
      setResponseMessage('User ID or Company ID is missing.');
      return;
    }

    const formData = new FormData();
    formData.append('name', username);
    formData.append('amount', amount);
    formData.append('payment_method', paymentMethod.toUpperCase());
    formData.append('upi_ref_number', upiRefNumber);

    if (paymentScreenshot) {
      formData.append('payment_screenshot', paymentScreenshot); // Corrected the field name
    }

    try {
      const response = await fetch(`https://manual.shyamplay.in/user/${userId}/${selectedCompany.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResponseMessage(data.message);
    } catch (error) {
      setResponseMessage(error.message);
    }
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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
          <Link href="/my-list">
            <input id="all" name="state-d" type="radio" />
            <label htmlFor="all" className={styles.wid_100}>My List</label>
          </Link>
          <input id="approved" name="state-d" type="radio" defaultChecked={true} />
          <label htmlFor="approved">Create ID</label>
        </div>

        {companies.length === 0 ? (
          <div>No companies found.</div>
        ) : (
          <div className={styles.all_new_id_big_box}>
            {companies.map((company) => (
              <div className={styles.all_new_id_box} key={company.id}>
                <Image width={200} height={200} src={`https://manual.shyamplay.in/${company.logo}`} alt={company.name} />
                <div className={styles.new_id_box}>
                  <div className={styles.id_inner_box_1}>
                    <p>{company.company_name}</p>
                    <Link href={company.website_link} className={styles.site_name}>{company.website_link}</Link>
                  </div>
                  <div className={styles.id_inner_box_2}>
                    <button className={styles.id_box_btn_1} onClick={() => toggleDemoLoginPopup(company)}>Demo</button>
                    <button className={styles.id_box_btn_2} onClick={() => toggleCreateIdPopup(company)}>Create</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {createIdPopup && <div className={styles.pop_up_box_section}>
          <i className={`fa-regular fa-circle-xmark ${styles.popup_cross}`} onClick={toggleCreateIdPopup}></i>
          <h3>Create ID</h3>
          <div className={styles.pop_up_site_box}>
            <Image width={200} height={200} src={`https://manual.shyamplay.in/${selectedCompany.logo}`} alt={selectedCompany.name} />
            <h4>{selectedCompany.company_name}</h4>
            <p>{selectedCompany.website_link}</p>
          </div>
          <form onSubmit={handleFormSubmit} className={styles.pop_up_box_form_1}>
            <input type="text" id="username" placeholder="Enter Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <input type="text" id="amount" placeholder="Enter Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
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
              <p className={styles.upi_para}>UPI Id = {upiQRCode.upi_id} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${upiQRCode.upi_id}`)}></i></p>
              <input type="text" placeholder="Enter UTR ID" id="upiRefNumber" value={upiRefNumber} onChange={(e) => setUpiRefNumber(e.target.value)} required />
              <label htmlFor="">Payment Screenshot</label>
              <input id="paymentScreenshot" type="file" onChange={(e) => setPaymentScreenshot(e.target.files[0])} />
            </div>
            )}
            {paymentMethod === 'bank' && bankDetails && (
              <div className={styles.bank_detail_box}>
                <p>Bank Name: {bankDetails.bank_name} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${bankDetails.bank_name}`)}></i></p>
                <p>Account Number: {bankDetails.bank_account_number} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${bankDetails.bank_account_number}`)}></i></p>
                <p>IFSC Code: {bankDetails.ifsc_code} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${bankDetails.ifsc_code}`)}></i></p>
                <p>Account Name: {bankDetails.account_name} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${bankDetails.account_name}`)}></i></p>
                <input type="text" placeholder="Enter Transaction ID" id="upiRefNumber" value={upiRefNumber} onChange={(e) => setUpiRefNumber(e.target.value)} required />
                <label htmlFor="">Payment Screenshot</label>
                <input id="paymentScreenshot" type="file" onChange={(e) => setPaymentScreenshot(e.target.files[0])} />
              </div>
            )}
            <button type="submit" className={styles.create_id_btn}><i className="fa-solid fa-circle-check"></i> Create Instant ID</button>
          </form>
          {responseMessage && <div>{responseMessage}</div>}
        </div>}

        {demoLoginPopup && <div className={styles.pop_up_box_section} id="demo-login-popup">
          <i className={`fa-regular fa-circle-xmark ${styles.popup_cross}`} onClick={toggleDemoLoginPopup}></i>
          <h3>Demo Login</h3>
          <div className={styles.pop_up_site_box}>
            <Image width={200} height={200} src={`https://manual.shyamplay.in/${demoCompany.logo}`} alt={demoCompany.name} />
            <h4>{demoCompany.company_name}</h4>
            <p>{demoCompany.website_link}</p>
            <p className={styles.demo_detail}>Username - {demoCompany.name} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${demoCompany.name}`)}></i></p>
            <p className={styles.demo_detail}>Password - {demoCompany.password} <i className="fa-solid fa-copy" onClick={() => navigator.clipboard.writeText(`${demoCompany.password}`)}></i></p>
          </div>
        </div>}
      </section>
    </>
  );
}
