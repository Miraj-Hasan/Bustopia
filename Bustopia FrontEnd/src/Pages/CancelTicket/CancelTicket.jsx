import React, { useEffect, useState, useContext } from 'react';
import { getUserTickets, cancelTicket } from '../../Api/ApiCalls';
import { UserContext } from '../../Context/UserContext';
import { Navbar } from '../../Components/Navbar/Navbar';
import { toast } from 'react-toastify';

function isCancellable(ticketDate) {
  const now = new Date();
  const ticketDateObj = new Date(ticketDate);
  ticketDateObj.setHours(23, 59, 59, 999);
  const diffMs = ticketDateObj - now;
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours >= 24;
}

export default function CancelTicket() {
  const { user } = useContext(UserContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await getUserTickets(user.id);
        setTickets(response.data);
      } catch (err) {
        toast.error('Failed to fetch tickets.');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [user]);

  if (loading) return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <div style={{ width: "250px", backgroundColor: "#f8f9fa" }}>
        <Navbar />
      </div>
      {/* Main Content */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center" style={{ background: "#f4f6fb" }}>
        <div className="container my-5">
          <h2 className="text-center mb-2 fst-italic">Manage Your Booked Tickets</h2>
          <p className="text-center text-secondary mb-5" style={{fontSize: '1.05rem'}}>
            <i className="bi bi-info-circle-fill me-2" style={{color: '#007bff'}}></i>
            Tickets can only be cancelled at least <b>24 hours before</b> the journey date.
          </p>
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <div
              className="spinner-border text-primary mb-3"
              style={{ width: '3rem', height: '3rem', borderWidth: '0.5em' }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="text-secondary fs-5">Please wait while your tickets are fetched...</div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleCancel = async (ticketId) => {
    try {
      const res = await cancelTicket(ticketId);
      if (res.status === 200) {
        toast.success('Ticket cancelled successfully!');
        setTickets((prev) => prev.filter((t) => t.ticketId !== ticketId));
      } else {
        toast.error('Failed to cancel ticket.');
      }
    } catch (err) {
      toast.error('Failed to cancel ticket.');
    }
  };

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <div style={{ width: "250px", backgroundColor: "#f8f9fa" }}>
        <Navbar />
      </div>
      {/* Main Content */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center" style={{ background: "#f4f6fb" }}>
        <div className="container my-5">
          <h2 className="text-center mb-2 fst-italic">Manage Your Booked Tickets</h2>
          <p className="text-center text-secondary mb-5" style={{fontSize: '1.05rem'}}>
            <i className="bi bi-info-circle-fill me-2" style={{color: '#007bff'}}></i>
            Tickets can only be cancelled at least <b>24 hours before</b> the journey date.
          </p>
          {tickets.length === 0 ? (
            <p className="text-center">No tickets found.</p>
          ) : (
            <div className="table-responsive d-flex justify-content-center">
              <table
                className="table table-hover table-bordered rounded shadow-lg"
                style={{
                  minWidth: 600,
                  background: '#e9ecef',
                  boxShadow: '0 6px 24px 0 rgba(31,38,135,0.18), 0 1.5px 6px 0 rgba(31,38,135,0.10), 0 0 0 2px #b0b8c1',
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                }}
              >
                <thead className="table-secondary">
                  <tr>
                    <th className="text-center align-middle">Ticket ID</th>
                    <th className="text-center align-middle">Source</th>
                    <th className="text-center align-middle">Destination</th>
                    <th className="text-center align-middle">Date</th>
                    <th className="text-center align-middle">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.ticketId}>
                      <td className="align-middle text-center">{ticket.ticketId}</td>
                      <td className="align-middle text-center">{ticket.source}</td>
                      <td className="align-middle text-center">{ticket.destination}</td>
                      <td className="align-middle text-center">{ticket.date}</td>
                      <td className="align-middle text-center">
                        {isCancellable(ticket.date) ? (
                          <button
                            className="btn btn-danger btn-sm fw-bold shadow-sm px-3 py-2"
                            style={{ background: 'linear-gradient(90deg, #ff416c, #ff4b2b)', border: 'none' }}
                            onClick={() => handleCancel(ticket.ticketId)}
                          >
                            Cancel Now
                          </button>
                        ) : (
                          <span className="text-muted fst-italic">Not cancellable</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 