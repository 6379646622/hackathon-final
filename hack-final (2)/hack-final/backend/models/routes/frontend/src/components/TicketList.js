import { useEffect, useState } from "react";
import api from "../api";

export default function TicketList({ refresh }) {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    api.get("/tickets").then((res) => setTickets(res.data));
  }, [refresh]);

  const updateStatus = async (id, status) => {
    await api.put(`/tickets/${id}`, { status });
    setTickets(tickets.map(t => t._id === id ? { ...t, status } : t));
  };

  return (
    <div>
      <h3>All Tickets</h3>
      {tickets.map((t) => (
        <div key={t._id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          <h4>{t.title}</h4>
          <p>{t.description}</p>
          <p>Status: <b>{t.status}</b></p>
          <button onClick={() => updateStatus(t._id, "In Progress")}>In Progress</button>
          <button onClick={() => updateStatus(t._id, "Closed")}>Close</button>
        </div>
      ))}
    </div>
  );
}
