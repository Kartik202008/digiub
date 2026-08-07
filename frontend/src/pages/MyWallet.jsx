import { useEffect, useState } from 'react';

function MyWallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id || user?.id;

  const fetchWallet = async () => {
    const res = await fetch(
      `https://digihub-backend-o00g.onrender.com/api/wallet/${userId}`
    );
    const data = await res.json();
    setBalance(data.balance);
    setTransactions(data.transactions);
  };

  useEffect(() => {
    if (userId) fetchWallet();
  }, [userId]);

  const addMoney = async () => {
    if (!amount || Number(amount) <= 0) return;

    await fetch(
      'https://digihub-backend-o00g.onrender.com/api/wallet/add-money',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount: Number(amount),
        }),
      }
    );

    setAmount('');
    fetchWallet();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Wallet</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <p className="text-gray-600">Available Balance</p>
        <h2 className="text-4xl font-bold text-green-600 mt-2">
          ₹{balance}
        </h2>

        <div className="mt-6 flex gap-3">
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border rounded px-4 py-2 flex-1"
          />
          <button
            onClick={addMoney}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Add Money
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>

        {transactions.length === 0 ? (
          <p className="text-gray-600">No transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, index) => (
              <div
                key={index}
                className="flex justify-between border-b pb-2"
              >
                <div>
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(tx.date).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`font-bold ${
                    tx.type === 'credit'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyWallet;