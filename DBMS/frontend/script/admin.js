document.addEventListener("DOMContentLoaded", () => {
    fetchUsers();
  
    document.getElementById("logoutBtn").addEventListener("click", () => {
      window.location.href = "/logout";
    });
  });
  
  async function fetchUsers() {
    try {
      const response = await fetch("/api/admin/users");
      const users = await response.json();
      const tableBody = document.querySelector("#usersTable tbody");
      tableBody.innerHTML = "";
      users.forEach(user => {
        const row = `
          <tr>
            <td>${user.user_id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
          </tr>
        `;
        tableBody.innerHTML += row;
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }
  