import React, { useEffect, useState, useCallback } from "react";
import "../App.css";
import { io } from "socket.io-client";

const EmailDataPage = () => {
  const [user, setUser] = useState(null);
  const [emails, setEmails] = useState([]);
  const [linkedEmails, setLinkedEmails] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState("");
  const [socket, setSocket] = useState(null);

  const baseUrl = "http://localhost:3000";
  const pageSize = 10;
  const accessToken = localStorage.getItem("accessToken");

  const fetchData = useCallback(async (url, setData) => {
    if (!accessToken) return;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setData(data);
      } else {
        throw new Error("Failed to fetch data.");
      }
    } catch (err) {
      setError(err.message);
    }
  }, [accessToken]);

  const fetchUser = useCallback(() => {
    fetchData(`${baseUrl}/api/users/me`, (data) => {
      setUser(data);
      setLinkedEmails(data.emails);
    });
  }, [fetchData, baseUrl]);

  const fetchEmails = useCallback((pageNumber) => {
    fetchData(`${baseUrl}/api/search/emails?page=${pageNumber}&limit=${pageSize}`, (data) => {
      setEmails(data.data);
      setTotalPages(Math.ceil(data.total.value / pageSize));
    });
  }, [fetchData, baseUrl]);

  const syncEmails = useCallback(async () => {
    if (!accessToken) return alert("Session expired. Please log in again.");

    try {
      const response = await fetch(`${baseUrl}/api/ms-auth/sync-emails`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.status === 201) {
        alert("Emails are syncing in the background. Real-time updates are now enabled!");
      } else {
        throw new Error("Failed to sync emails. Please try again.");
      }
    } catch (err) {
      alert(err.message);
    }
  }, [accessToken, baseUrl]);

  const logout = useCallback(async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
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
  }, [accessToken, baseUrl]);

  const linkOutlook = () => {
    if (user) {
      const redirectUrl = `${baseUrl}/api/ms-auth/login?userId=${user.id}`;
      window.location.href = redirectUrl;
    } else {
      alert("User information is missing. Please try again.");
    }
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (accessToken) {
      fetchEmails(page);
    }
  }, [page, accessToken, fetchEmails]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "linked") {
      alert("Outlook account linked successfully!");
      fetchUser();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      const socketInstance = io(baseUrl);

      socketInstance.on("connect", () => {
        socketInstance.emit("authenticate", { userId: user.id });
      });

      socketInstance.on("user-event", async (payload) => {
        if (payload.type === "MAILBOX_UPDATE") {
          fetchUser();
        }

        if (payload.type === "MAIL_UPDATE") {
          fetchEmails(1);
        }
      });

      socketInstance.on("disconnect", () => {
        console.log("WebSocket disconnected");
      });

      setSocket(socketInstance);

      return () => socketInstance.disconnect();
    }
  }, [user, baseUrl, fetchUser, fetchEmails]);

  if (error) {
    return (
      <div className="error-page">
        <h2>{error}</h2>
        <button onClick={() => (window.location.href = "/")}>Log In Again</button>
      </div>
    );
  }

  return (
    <div className="email-data-page">
      {user && (
        <div className="user-info">
          <p>Logged in as: {user.username}</p>
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      )}

      <div className="actions-container">
        <div className="actions">
          <button onClick={linkOutlook}>Link Outlook</button>
          <button onClick={syncEmails}>Sync Emails</button>
        </div>
        {linkedEmails.length > 0 && (
          <div className="linked-emails">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Connection</th>
                  <th>Synced</th>
                </tr>
              </thead>
              <tbody>
                {linkedEmails.map((email) => (
                  <tr key={email.id}>
                    <td>{email.email}</td>
                    <td style={{ color: email.realtimeSyncStatus === "ACTIVE" ? "green" : "red" }}>
                      {email.realtimeSyncStatus}
                    </td>
                    <td style={{ color: email.initialSyncStatus === "COMPLETED" ? "green" : email.initialSyncStatus === "PENDING" ? "blue" : email.initialSyncStatus === "INITIATED" ? "yellow" : "red" }}>
                      {email.initialSyncStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
        <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))} disabled={page === totalPages}>Next</button>
      </div>
    </div>
  );
};

export default EmailDataPage;
