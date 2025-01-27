import React, { useEffect, useState } from "react";
import "../App.css";

const EmailDataPage = () => {
  const [user, setUser] = useState(null);
  const [emails, setEmails] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState("");
  const baseUrl = "http://localhost:3000";
  const pageSize = 10;

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      try {
        const response = await fetch(`${baseUrl}/api/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("accessToken");
          setError("Session expired. Please log in again.");
        } else if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          throw new Error("Failed to fetch user details.");
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUser();
  }, [baseUrl]);

  const fetchEmails = async (pageNumber) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      const response = await fetch(
        `${baseUrl}/api/search/emails?page=${pageNumber}&limit=${pageSize}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEmails(data.data);
        const totalEmails = data.total.value;
        setTotalPages(Math.ceil(totalEmails / pageSize));
      } else {
        throw new Error("Failed to fetch emails.");
      }
    } catch (err) {
      alert("Error fetching emails. Please try again.");
    }
  };

  useEffect(() => {
    fetchEmails(page);
  }, [page]);

  const linkOutlook = () => {
    if (user) {
      const redirectUrl = `${baseUrl}/api/ms-auth/login?userId=${user.id}`;
      window.location.href = redirectUrl;
    } else {
      alert("User information is missing. Please try again.");
    }
  };

  const syncEmails = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("Session expired. Please log in again.");
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/ms-auth/sync-emails`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 201) {
        alert(
          "Emails are syncing in the background. Real-time updates are now enabled!"
        );
      } else {
        throw new Error("Failed to sync emails. Please try again.");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const logout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      const response = await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem("accessToken");
        window.location.href = "/";
      } else {
        throw new Error("Failed to log out.");
      }
    } catch (err) {
      alert("Error logging out. Please try again.");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status === "linked") {
      alert("Outlook account linked successfully!");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (error) {
    return (
      <div className="error-page">
        <h2>{error}</h2>
        <button onClick={() => (window.location.href = "/")}>
          Log In Again
        </button>
      </div>
    );
  }

  return (
    <div className="email-data-page">
      {user && (
        <div className="user-info">
          <p>Logged in as: {user.username}</p>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      )}

      <div className="actions">
        <button onClick={linkOutlook}>Link Outlook</button>
        <button onClick={syncEmails}>Sync Emails</button>
      </div>

      <table className="email-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>From</th>
            <th>To</th>
            <th>Date</th>
            <th>Read</th>
            <th>Flagged</th>
          </tr>
        </thead>
        <tbody>
          {emails.map((email) => (
            <tr key={email.messageId}>
              <td>{email.subject}</td>
              <td>{email.from}</td>
              <td>{email.to}</td>
              <td>{new Date(email.date).toLocaleString()}</td>
              <td>{email.read ? "Yes" : "No"}</td>
              <td>{email.flagged ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() =>
            setPage((prev) => (prev < totalPages ? prev + 1 : prev))
          }
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EmailDataPage;
