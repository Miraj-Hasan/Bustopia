import React, { useEffect, useState, useContext } from 'react';
import { getUserTickets } from '../../Api/ApiCalls';
import { UserContext } from '../../Context/UserContext';

function isCancellable(ticketDate) {
  // ticketDate is expected in YYYY-MM-DD format
  const now = new Date();
  const ticketDateObj = new Date(ticketDate);
  // Set ticketDateObj to end of the day for more user-friendly cancellation
  ticketDateObj.setHours(23, 59, 59, 999);
  const diffMs = ticketDateObj - now;
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours >= 24;
}

export default function CancelTicket() {
  const { user } = useContext(UserContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) {
        setError('Please log in to view your tickets.');
        setLoading(false);
        return;
      }
      try {
        const response = await getUserTickets(user.id);
        setTickets(response.data);
      } catch (err) {
        setError('Failed to fetch tickets.');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Your Tickets</h2>
      {tickets.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No tickets found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <thead style={{ background: '#007bff', color: '#fff' }}>
              <tr>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Ticket ID</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Source</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Destination</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.ticketId} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>{ticket.ticketId}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>{ticket.source}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>{ticket.destination}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>{ticket.date}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                    {isCancellable(ticket.date) ? (
                      <button
                        style={{
                          background: 'linear-gradient(90deg, #ff416c, #ff4b2b)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '8px 18px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(255,65,108,0.12)',
                          transition: 'background 0.2s',
                        }}
                        onClick={() => alert('Cancel logic coming soon!')}
                      >
                        Cancel Now
                      </button>
                    ) : (
                      <span style={{ color: '#aaa', fontStyle: 'italic' }}>Not cancellable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 