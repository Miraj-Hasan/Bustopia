import React, { useEffect, useState, useContext } from 'react';
import { getUserTickets } from '../../Api/ApiCalls';
import { UserContext } from '../../Context/UserContext';

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
    <div>
      <h2>Your Tickets</h2>
      {tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <ul>
          {tickets.map((ticket) => (
            <li key={ticket.ticketId}>
              Ticket #{ticket.ticketId} - {ticket.source} to {ticket.destination} on {ticket.date}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 