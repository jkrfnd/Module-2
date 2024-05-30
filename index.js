import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setEthWallet(window.ethereum);
    } catch (error) {
      console.error(error);
      alert('MetaMask wallet is required to connect');
    }
  };

  const login = () => {
    if (username === 'admin' && password === 'admin') {
      setIsLoggedIn(true);
    } else {
      setLoginError('Invalid username or password. Please try again.');
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  const depositOrWithdraw = async (action) => {
    try {
      const tx = await atm[action](action === 'deposit' ? depositAmount : withdrawAmount);
      await tx.wait();
      getBalance();
      setTransactions([...transactions, {
        type: action === 'deposit' ? 'Deposit' : 'Withdraw',
        amount: action === 'deposit' ? depositAmount : withdrawAmount,
        timestamp: new Date().toLocaleString()
      }]);
      autoLogout();
    } catch (error) {
      console.error(`Error ${action}ing:`, error);
    }
  };

  const autoLogout = () => {
    setTimeout(logout, 5000); // Auto-logout after 5 seconds
  };

  const initUser = () => {
    if (!ethWallet) return <button onClick={connectWallet}>Connect Metamask</button>;
    if (!isLoggedIn) return (
      <div>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button onClick={login}>Login</button>
        {loginError && <p>{loginError}</p>}
      </div>
    );
    if (balance === undefined) getBalance();
    return (
      <div>
        <p>Welcome, {username}!</p>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Deposit Amount" />
        <button onClick={() => depositOrWithdraw('deposit')}>Deposit</button>
        <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Withdraw Amount" />
        <button onClick={() => depositOrWithdraw('withdraw')}>Withdraw</button>
        <button onClick={logout}>Logout</button>
        <div className="transaction-table">
          <h2>Transaction History</h2>
          <table>
            <thead>
              <tr><th colSpan="3">Type</th><th>Amount</th><th>Timestamp</th></tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={i}><td colSpan="3">{tx.type}</td><td>{tx.amount}</td><td>{tx.timestamp}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const getATMContract = () => {
    if (ethWallet) {
      const provider = new ethers.providers.Web3Provider(ethWallet);
      const signer = provider.getSigner();
      setATM(new ethers.Contract(contractAddress, atmABI, signer));
    }
  };

  const getBalance = async () => {
    if (atm) setBalance((await atm.getBalance()).toNumber());
  };

  useEffect(() => {
    getATMContract();
  }, [ethWallet]);

  return (
    <main className="container">
      <header><h1>Welcome to Brand X bank</h1></header>
      {initUser()}
      <style jsx>{`
        .container { text-align: center; }
        .transaction-table { margin-top: 20px; }
        table { border-collapse: collapse; width: 100%; margin: 0 auto; max-width: 600px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        th { background-color: #f2f2f2; }
      `}</style>
    </main>
  );
}
