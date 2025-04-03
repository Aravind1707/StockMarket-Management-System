document.addEventListener("DOMContentLoaded", () => {
    // Fetch and display stock data and news
    fetchStockData();
    fetchStockNews();

    // Fetch and display user's holdings and transaction history
    fetchHoldings();
    fetchTransactions();

    // Logout functionality
    document.getElementById("logoutBtn").addEventListener("click", () => {
        window.location.href = "/logout";
    });

    // Trade form submission
    document.getElementById("tradeForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const symbol = document.getElementById("symbol").value.toUpperCase();
        const action = document.getElementById("action").value;
        const quantity = parseInt(document.getElementById("quantity").value);

        // Retrieve the user_id (ensure it's stored after login)
        const user_id = sessionStorage.getItem("user_id");
        if (!user_id) {
            alert("User not logged in!");
            return;
        }

        const response = await fetch("/api/trade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id, stock_symbol: symbol, quantity, transaction_type: action })
        });

        const data = await response.json();
        document.getElementById("tradeMessage").innerText = data.message;
        
        // Refresh holdings and transactions after a trade
        fetchHoldings();
        fetchTransactions();
        // Optionally refresh stock data if needed
        fetchStockData();
    });
});

// Function to fetch live stock data
async function fetchStockData() {
    try {
        const response = await fetch("/api/stocks");
        const stocks = await response.json();
        const stockTableBody = document.getElementById("stockData");
        stockTableBody.innerHTML = "";
        stocks.forEach(stock => {
            stockTableBody.innerHTML += `
                <tr>
                    <td>${stock.symbol}</td>
                    <td>${stock.market_price}</td>
                    <td>${stock.change || "-"}</td>
                    <td>${stock.percent_change || "-"}%</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error fetching stock data:", error);
    }
}

// Function to fetch stock market news
async function fetchStockNews() {
    try {
        const response = await fetch("/api/news");
        const news = await response.json();
        document.getElementById("stockNews").innerText = news.join(" | ");
    } catch (error) {
        console.error("Error fetching news:", error);
        document.getElementById("stockNews").innerText = "Failed to load news.";
    }
}

// Function to fetch user's current holdings
async function fetchHoldings() {
    try {
        const user_id = sessionStorage.getItem("user_id");
        if (!user_id) return;
        const response = await fetch(`/api/holdings/${user_id}`);
        const holdings = await response.json();
        const holdingsTableBody = document.querySelector("#holdingsTable tbody");
        holdingsTableBody.innerHTML = "";
        holdings.forEach(holding => {
            holdingsTableBody.innerHTML += `
                <tr>
                    <td>${holding.stock_symbol}</td>
                    <td>${holding.quantity}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error fetching holdings:", error);
    }
}

// Function to fetch user's transaction history
async function fetchTransactions() {
    try {
        const user_id = sessionStorage.getItem("user_id");
        if (!user_id) return;
        const response = await fetch(`/api/transactions/${user_id}`);
        const transactions = await response.json();
        const transactionsTableBody = document.querySelector("#transactionsTable tbody");
        transactionsTableBody.innerHTML = "";
        transactions.forEach(tx => {
            transactionsTableBody.innerHTML += `
                <tr>
                    <td>${new Date(tx.timestamp).toLocaleString()}</td>
                    <td>${tx.stock_symbol}</td>
                    <td>${tx.transaction_type}</td>
                    <td>${tx.quantity}</td>
                    <td>${tx.price}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
    }
}
