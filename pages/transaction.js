import React, { useEffect, useState } from 'react';
import styles from "@/styles/Transaction.module.css";
import Image from 'next/image';
import Link from 'next/link';

const Transaction = () => {
    const [sidebar, setSidebar] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState(null);
    const [transactionType, setTransactionType] = useState('all');

    const toggleSidebar = () => {
        setSidebar(!sidebar);
    };

    const handleLogout = () => {
        localStorage.clear();
        location.href = "/";
    };

    useEffect(() => {
        const fetchTransactionHistory = async () => {
            const types = transactionType === 'all' ? ['credit', 'deposit', 'withdraw', 'password_change'] : [transactionType];
            const allTransactions = [];
            const errorMessages = [];

            // Helper function to fetch data for each type
            const fetchData = async (type) => {
                try {
                    const response = await fetch(`https://manual.shyamplay.in/transaction/history?type=${type}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Error fetching ${type} data: ${response.status}`);
                    }

                    const data = await response.json();

                    // Handle case when the response contains a message indicating no records
                    if (data.message) {
                        errorMessages.push(`No ${type} records found`);
                    } else {
                        allTransactions.push(...data);
                    }
                } catch (error) {
                    errorMessages.push(`Failed to fetch ${type} data: ${error.message}`);
                }
            };

            // Execute all fetch operations concurrently
            await Promise.all(types.map(type => fetchData(type)));

            // Set transactions and handle errors
            if (allTransactions.length === 0 && errorMessages.length > 0) {
                setError(errorMessages.join(' | '));
            } else {
                setError(null);
                // Sort transactions by created_at date
                allTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setTransactions(allTransactions);
            }
        };

        fetchTransactionHistory();
    }, [transactionType]);

    const getStatusClassName = (status) => {
        switch (status) {
            case 'approved':
                return styles.approved_btn;
            case 'rejected':
                return styles.rejected_btn;
            default:
                return styles.pending_btn;
        }
    };

    const handleTransactionTypeChange = (e) => {
        setTransactionType(e.target.value);
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

                <div className={styles.all_new_id_big_box}>
                    <div className={styles.top_filterBox}>
                        <h3>Transactions</h3>
                        <select value={transactionType} onChange={handleTransactionTypeChange} className={styles.filter}>
                            <option value="all">All</option>
                            <option value="credit">Site ID</option>
                            <option value="deposit">Deposit</option>
                            <option value="withdraw">Withdraw</option>
                            <option value="password_change">Password Change</option>
                        </select>
                    </div>

                    {error ? (
                        <div className={styles.whiteText}>No Record Found !</div>
                    ) : (
                        transactions.length === 0 ? (
                            <div className={styles.whiteText}>No Transaction History Found !</div>
                        ) : (
                            <div className={styles.all_new_id_box}>
                                {transactions.map((transaction) => (
                                    <div className={styles.new_id_box} key={transaction.credit_id || transaction.transaction_id || transaction.request_id}>
                                        <div className={styles.id_inner_box_1}>
                                            {transaction.credit_name && <p><strong>UserName:</strong> {transaction.credit_name}</p>}
                                            <p><strong>Company Name:</strong> {transaction.company_name}</p>
                                            <p><strong>Website Link:</strong> <Link href={`https://${transaction.website_link}`}>{transaction.website_link}</Link></p>
                                            {transaction.amount && <p><strong>Amount:</strong> {transaction.amount}</p>}
                                            {transaction.transaction_type && <p><strong>Transaction Type:</strong> {transaction.transaction_type}</p>}
                                            {transaction.created_at && <p><strong>Created At:</strong> {transaction.created_at}</p>}
                                            {transaction.description && <p><strong>Description:</strong> {transaction.description}</p>}
                                        </div>
                                        <div className={styles.id_inner_box_2}>
                                            <button className={`${getStatusClassName(transaction.status)}`}>{transaction.status}</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </section>
        </>
    );
};

export default Transaction;
